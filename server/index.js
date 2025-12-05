
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { products } from './data.js';

const app = express();
const PORT = 3001;

// Middleware
app.use(cors()); // Permite peticiones desde el Frontend (localhost:3000)
app.use(bodyParser.json());

// Base de datos en memoria (Array) para pedidos
// En un futuro, esto se conectaría a MySQL/MongoDB
let orders = [];

// --- Rutas de la API ---

// 1. GET /api/products - Obtener todos los productos
app.get('/api/products', (req, res) => {
  console.log('GET /api/products - Enviando lista de productos');
  res.json(products);
});

// 2. GET /api/products/:id - Obtener un producto específico
app.get('/api/products/:id', (req, res) => {
  const product = products.find(p => p.id === req.params.id);
  if (product) {
    res.json(product);
  } else {
    res.status(404).json({ message: 'Producto no encontrado' });
  }
});

// 3. POST /api/orders - Crear un nuevo pedido
app.post('/api/orders', (req, res) => {
  const newOrder = req.body;

  // Validación básica
  if (!newOrder.items || newOrder.items.length === 0) {
    return res.status(400).json({ message: 'El pedido no tiene artículos.' });
  }

  // Guardar en "Base de Datos"
  orders.push(newOrder);

  console.log(`POST /api/orders - Nuevo pedido recibido: ${newOrder.id} de ${newOrder.name} (Doc: ${newOrder.documentNumber})`);

  // Responder con éxito
  res.status(201).json({
    message: 'Pedido recibido correctamente',
    orderId: newOrder.id
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`✅ Servidor Backend corriendo en http://localhost:${PORT}`);
  console.log(`   - API Productos: http://localhost:${PORT}/api/products`);
  console.log(`   - API Pedidos:   http://localhost:${PORT}/api/orders`);
});
