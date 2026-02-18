
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { initDb, query, getClient, isFallback, fallbackStore } from './db.js';
import { seedDatabase, PRODUCTS } from './seed.js';
import { generateOrderExcel } from './excelGenerator.js';
import { generateOrderPDF } from './pdfGenerator.js';
import { sendOrderEmail, sendStatusUpdateEmail } from './emailService.js';
import fs from 'fs';
import path from 'path';

// Asegurar carpeta de exportación
const EXPORTS_DIR = path.join(process.cwd(), 'exports');
if (!fs.existsSync(EXPORTS_DIR)) fs.mkdirSync(EXPORTS_DIR);

const app = express();
const PORT = 3001;

// ── Middleware ───────────────────────────────────────────────────────────────
app.use(cors());
app.use(bodyParser.json());

// ── Inicialización ───────────────────────────────────────────────────────────
await initDb();
await seedDatabase();

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Convierte una fila de BD al formato que espera el frontend */
function rowToProduct(row) {
  return {
    id: row.id,
    name: row.name,
    price: parseFloat(row.price),
    category: row.category,
    imageUrl: row.image_url,
    description: row.description,
    stock: parseInt(row.stock ?? 10),
  };
}

// ── Cupones disponibles ───────────────────────────────────────────────────────
const COUPONS = {
  'MARQUITO10': { type: 'percent', value: 10, description: '10% de descuento' },
  'BIENVENIDO15': { type: 'percent', value: 15, description: '15% de descuento de bienvenida' },
  'ENVIOGRATIS': { type: 'shipping', value: 0, description: 'Envío gratuito' },
  'MARQUITO20': { type: 'percent', value: 20, description: '20% de descuento especial' },
};

// ── Rutas de la API ──────────────────────────────────────────────────────────

// 1. GET /api/products — Obtener todos los productos
app.get('/api/products', async (req, res) => {
  if (isFallback()) {
    console.log('GET /api/products [fallback]');
    return res.json(PRODUCTS.map(p => ({ ...p, imageUrl: p.image_url })));
  }

  try {
    const result = await query('SELECT * FROM products ORDER BY id');
    console.log('GET /api/products [PostgreSQL]');
    res.json(result.rows.map(rowToProduct));
  } catch (err) {
    console.error('Error al obtener productos:', err.message);
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
});

// 2. GET /api/products/:id — Obtener un producto específico
app.get('/api/products/:id', async (req, res) => {
  if (isFallback()) {
    const product = PRODUCTS.find(p => p.id === req.params.id);
    if (!product) return res.status(404).json({ message: 'Producto no encontrado' });
    return res.json({ ...product, imageUrl: product.image_url });
  }

  try {
    const result = await query('SELECT * FROM products WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ message: 'Producto no encontrado' });
    res.json(rowToProduct(result.rows[0]));
  } catch (err) {
    console.error('Error al obtener producto:', err.message);
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
});

// 3. POST /api/coupons/validate — Validar un cupón
app.post('/api/coupons/validate', (req, res) => {
  const { code, subtotal } = req.body;
  const coupon = COUPONS[code?.toUpperCase()];

  if (!coupon) {
    return res.status(404).json({ valid: false, message: 'Cupón no válido o expirado.' });
  }

  let discountAmount = 0;
  let shippingFree = false;

  if (coupon.type === 'percent') {
    discountAmount = parseFloat(((subtotal || 0) * coupon.value / 100).toFixed(2));
  } else if (coupon.type === 'shipping') {
    shippingFree = true;
  }

  console.log(`✅ Cupón aplicado: ${code.toUpperCase()} — ${coupon.description}`);
  res.json({
    valid: true,
    code: code.toUpperCase(),
    type: coupon.type,
    value: coupon.value,
    discountAmount,
    shippingFree,
    description: coupon.description,
    message: `¡Cupón aplicado! ${coupon.description}`,
  });
});

// 4. POST /api/orders — Crear un nuevo pedido
app.post('/api/orders', async (req, res) => {
  const order = req.body;

  // Validación básica
  if (!order.items || order.items.length === 0) {
    return res.status(400).json({ message: 'El pedido no tiene artículos.' });
  }

  // ── Modo fallback (sin PostgreSQL) ──────────────────────────────────────
  if (isFallback()) {
    // Decrementar stock en fallback
    for (const item of order.items) {
      const product = PRODUCTS.find(p => p.id === item.id);
      if (product) {
        product.stock = Math.max(0, (product.stock || 0) - item.quantity);
      }
    }

    fallbackStore.orders.push(order);
    console.log(`POST /api/orders [fallback] — Pedido ${order.id} de ${order.customerName}`);

    (async () => {
      try {
        const excelBuffer = await generateOrderExcel(order);
        const pdfBuffer = await generateOrderPDF(order);
        fs.writeFileSync(path.join(EXPORTS_DIR, `Pedido_${order.id}.xlsx`), excelBuffer);
        await sendOrderEmail(order, pdfBuffer);
      } catch (err) {
        console.error(`⚠️ Falló el envío de email/excel (fallback) para pedido ${order.id}:`, err.message);
      }
    })();

    return res.status(201).json({
      message: 'Pedido recibido correctamente (modo fallback)',
      orderId: order.id,
      mode: 'fallback',
    });
  }

  // ── Modo PostgreSQL ─────────────────────────────────────────────────────
  const client = await getClient();
  try {
    await client.query('BEGIN');

    // Verificar stock disponible
    for (const item of order.items) {
      const stockResult = await client.query('SELECT stock FROM products WHERE id = $1', [item.id]);
      if (stockResult.rows.length > 0) {
        const available = parseInt(stockResult.rows[0].stock);
        if (available < item.quantity) {
          await client.query('ROLLBACK');
          return res.status(409).json({
            message: `Stock insuficiente para "${item.name}". Disponible: ${available}.`,
          });
        }
      }
    }

    // Insertar pedido principal
    await client.query(
      `INSERT INTO orders (
        id, date, subtotal, discount, shipping_cost, total,
        status, payment_method, customer_name, customer_email,
        customer_phone, document_number, shipping_address
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)`,
      [
        order.id,
        order.date || new Date().toISOString(),
        order.subtotal ?? order.total,
        order.discount ?? 0,
        order.shippingCost ?? 0,
        order.total,
        order.status || 'pending',
        order.paymentMethod || 'Transferencia Bancaria',
        order.customerName,
        order.customerEmail,
        order.customerPhone || null,
        order.documentNumber || null,
        JSON.stringify(order.shippingAddress || {}),
      ]
    );

    // Insertar ítems y decrementar stock
    for (const item of order.items) {
      await client.query(
        `INSERT INTO order_items (order_id, product_id, product_name, price, quantity)
         VALUES ($1, $2, $3, $4, $5)`,
        [order.id, item.id, item.name, item.price, item.quantity]
      );
      await client.query(
        `UPDATE products SET stock = GREATEST(0, stock - $1) WHERE id = $2`,
        [item.quantity, item.id]
      );
    }

    await client.query('COMMIT');

    console.log(`POST /api/orders [PostgreSQL] — Pedido ${order.id} de ${order.customerName} | Total: $${order.total}`);

    (async () => {
      try {
        const excelBuffer = await generateOrderExcel(order);
        const pdfBuffer = await generateOrderPDF(order);
        fs.writeFileSync(path.join(EXPORTS_DIR, `Pedido_${order.id}.xlsx`), excelBuffer);
        await sendOrderEmail(order, pdfBuffer);
      } catch (err) {
        console.error(`⚠️ Falló el envío de email/pdf para pedido ${order.id}:`, err.message);
      }
    })();

    res.status(201).json({
      message: 'Pedido recibido correctamente',
      orderId: order.id,
      mode: 'postgresql',
    });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error al guardar pedido:', err.message);
    res.status(500).json({ message: 'Error al procesar el pedido.' });
  } finally {
    client.release();
  }
});

// 5. GET /api/orders — Listar todos los pedidos (con sus ítems)
app.get('/api/orders', async (req, res) => {
  if (isFallback()) {
    return res.json(fallbackStore.orders);
  }

  try {
    const ordersResult = await query(`
      SELECT
        o.*,
        json_agg(json_build_object(
          'id',           oi.id,
          'product_id',   oi.product_id,
          'product_name', oi.product_name,
          'price',        oi.price,
          'quantity',     oi.quantity
        )) AS items
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      GROUP BY o.id
      ORDER BY o.date DESC
    `);
    res.json(ordersResult.rows);
  } catch (err) {
    console.error('Error al obtener pedidos:', err.message);
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
});

// 6. PATCH /api/orders/:id/status — Actualizar estado y enviar notificación
app.patch('/api/orders/:id/status', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const validStatuses = ['pending', 'paid', 'shipped', 'delivered'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ message: `Estado inválido. Valores permitidos: ${validStatuses.join(', ')}` });
  }

  if (isFallback()) {
    const order = fallbackStore.orders.find(o => o.id === id);
    if (!order) return res.status(404).json({ message: 'Pedido no encontrado.' });
    order.status = status;

    // Enviar email de notificación
    (async () => {
      try { await sendStatusUpdateEmail(order, status); } catch (e) { console.error(e.message); }
    })();

    return res.json({ message: `Estado actualizado a "${status}"`, orderId: id });
  }

  try {
    const result = await query(
      `UPDATE orders SET status = $1 WHERE id = $2 RETURNING *`,
      [status, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ message: 'Pedido no encontrado.' });

    const order = result.rows[0];
    console.log(`PATCH /api/orders/${id}/status → ${status}`);

    // Enviar email de notificación al cliente
    (async () => {
      try {
        await sendStatusUpdateEmail({
          id: order.id,
          customerName: order.customer_name,
          customerEmail: order.customer_email,
          total: order.total,
          paymentMethod: order.payment_method,
        }, status);
      } catch (e) {
        console.error(`⚠️ Error enviando notificación de estado: ${e.message}`);
      }
    })();

    res.json({ message: `Estado actualizado a "${status}"`, orderId: id, status });
  } catch (err) {
    console.error('Error al actualizar estado:', err.message);
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
});

// 7. GET /api/status — Estado del servidor y modo de BD
app.get('/api/status', (req, res) => {
  res.json({
    status: 'ok',
    database: isFallback() ? 'fallback (memoria)' : 'postgresql',
    timestamp: new Date().toISOString(),
  });
});

// ── Iniciar servidor ─────────────────────────────────────────────────────────
app.listen(PORT, () => {
  const dbMode = isFallback() ? '⚠️  FALLBACK (memoria)' : '✅ PostgreSQL';
  console.log(`\n🚀 Servidor Backend corriendo en http://localhost:${PORT}`);
  console.log(`   - Modo BD:        ${dbMode}`);
  console.log(`   - API Productos:  http://localhost:${PORT}/api/products`);
  console.log(`   - API Pedidos:    http://localhost:${PORT}/api/orders`);
  console.log(`   - API Cupones:    http://localhost:${PORT}/api/coupons/validate`);
  console.log(`   - API Status:     http://localhost:${PORT}/api/status\n`);
});

// Versi�n final Multi-Cloud
