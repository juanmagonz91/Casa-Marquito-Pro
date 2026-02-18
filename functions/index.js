
import { onDocumentCreated, onDocumentUpdated } from "firebase-functions/v2/firestore";
import { setGlobalOptions } from "firebase-functions/v2";
import admin from "firebase-admin";
import nodemailer from "nodemailer";
import PDFDocument from "pdfkit";
import ExcelJS from "exceljs";

admin.initializeApp();
setGlobalOptions({ region: "us-central1" });

const db = admin.firestore();

// ── SMTP CONFIG ──────────────────────────────────────────────────────────
// IMPORTANTE: Definir estas variables en Firebase con:
// firebase functions:secrets:set SMTP_USER
// firebase functions:secrets:set SMTP_PASS
const SMTP_USER = process.env.SMTP_USER || "";
const SMTP_PASS = process.env.SMTP_PASS || "";

// ── GENERADORES DE ARCHIVOS ───────────────────────────────────────────────

async function generateOrderPDF(order) {
    return new Promise((resolve, reject) => {
        try {
            const doc = new PDFDocument({ margin: 50, size: 'A4' });
            const buffers = [];
            doc.on('data', buffers.push.bind(buffers));
            doc.on('end', () => resolve(Buffer.concat(buffers)));
            doc.on('error', reject);

            doc.fillColor('#1e293b').fontSize(20).font('Helvetica-Bold').text('CASA MARQUITO', { align: 'center' });
            doc.fontSize(10).font('Helvetica').text('Tienda Online · Artículos para el Hogar', { align: 'center' });
            doc.moveDown();
            doc.strokeColor('#e2e8f0').lineWidth(1).moveTo(50, doc.y).lineTo(550, doc.y).stroke();
            doc.moveDown();

            doc.fillColor('#475569').fontSize(14).font('Helvetica-Bold').text(`Resumen de Pedido #${order.id || 'S/N'}`, { underline: true });
            doc.moveDown(0.5);

            doc.fontSize(10).font('Helvetica').fillColor('#1e293b');
            const leftCol = 50;
            const rightCol = 320;
            let currentY = doc.y;

            const orderDate = order.date ? new Date(order.date) : new Date();
            doc.text(`Fecha: ${orderDate.toLocaleString('es-PY')}`, leftCol, currentY);
            doc.text(`Estado: ${(order.status || 'Pendiente').toUpperCase()}`, rightCol, currentY);
            doc.moveDown(0.5);

            currentY = doc.y;
            doc.text(`Cliente: ${order.customerName || 'N/A'}`, leftCol, currentY);
            doc.text(`Email: ${order.customerEmail || 'N/A'}`, rightCol, currentY);
            doc.moveDown(0.5);

            doc.text(`Teléfono: ${order.customerPhone || 'N/A'}`, leftCol, doc.y);
            doc.text(`Documento: ${order.documentNumber || 'N/A'}`, rightCol, doc.y);
            doc.moveDown();

            // Tabla
            const tableTop = doc.y;
            doc.fillColor('#1e293b').rect(50, tableTop, 500, 20).fill();
            doc.fillColor('#ffffff').fontSize(10).font('Helvetica-Bold');
            doc.text('Producto', 60, tableTop + 5);
            doc.text('Subtotal', 450, tableTop + 5, { width: 90, align: 'right' });

            doc.fillColor('#1e293b').font('Helvetica');
            let itemY = tableTop + 25;
            order.items?.forEach((item, index) => {
                if (index % 2 === 0) {
                    doc.fillColor('#f8fafc').rect(50, itemY - 2, 500, 16).fill();
                    doc.fillColor('#1e293b');
                }
                doc.text(item.name || 'Producto', 60, itemY, { width: 230 });
                doc.text(`$${(item.price * item.quantity).toFixed(2)}`, 450, itemY, { width: 90, align: 'right' });
                itemY += 18;
            });

            doc.moveDown();
            doc.text(`TOTAL: $${parseFloat(order.total).toFixed(2)}`, 450, itemY + 10, { width: 90, align: 'right' });
            doc.end();
        } catch (err) { reject(err); }
    });
}

// ── TRIGGERS DE FIRESTORE ──────────────────────────────────────────────────

export const onOrderCreated = onDocumentCreated("orders/{orderId}", async (event) => {
    const order = event.data.data();
    const orderId = event.params.orderId;
    console.log(`🆕 Nuevo pedido detectado: ${orderId}`);

    if (!SMTP_USER || !SMTP_PASS) {
        console.warn('⚠️ SMTP no configurado. No se enviará email.');
        return;
    }

    try {
        const pdfBuffer = await generateOrderPDF(order);
        const transporter = nodemailer.createTransport({
            service: 'gmail', auth: { user: SMTP_USER, pass: SMTP_PASS }
        });

        const mailOptions = {
            from: `"Casa Marquito" <${SMTP_USER}>`,
            to: order.customerEmail,
            subject: `✅ Confirmación de Pedido #${order.id} - Casa Marquito`,
            html: `<h1>¡Gracias por tu compra, ${order.customerName}!</h1><p>Adjunto encontrarás tu pedido #${order.id}.</p>`,
            attachments: [{ filename: `Pedido_${order.id}.pdf`, content: pdfBuffer }]
        };

        await transporter.sendMail(mailOptions);
        console.log(`✅ Email enviado a ${order.customerEmail}`);
    } catch (error) {
        console.error(`❌ Error en onOrderCreated para ${orderId}:`, error);
    }
});

export const onOrderStatusChanged = onDocumentUpdated("orders/{orderId}", async (event) => {
    const before = event.data.before.data();
    const after = event.data.after.data();
    const orderId = event.params.orderId;

    if (before.status !== after.status && SMTP_USER && SMTP_PASS) {
        console.log(`🔔 Cambio de estado para pedido ${orderId}: ${before.status} -> ${after.status}`);
        try {
            const transporter = nodemailer.createTransport({
                service: 'gmail', auth: { user: SMTP_USER, pass: SMTP_PASS }
            });
            await transporter.sendMail({
                from: `"Casa Marquito" <${SMTP_USER}>`,
                to: after.customerEmail,
                subject: `🔔 Actualización de Pedido #${after.id}`,
                html: `<p>Tu pedido #${after.id} ha cambiado de estado a: <strong>${after.status}</strong></p>`
            });
            console.log(`✅ Notificación enviada.`);
        } catch (error) {
            console.error(`❌ Error enviando notificación:`, error);
        }
    }
});

// Versi�n final Multi-Cloud
