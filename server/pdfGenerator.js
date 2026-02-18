
import PDFDocument from 'pdfkit';

/**
 * Genera un Buffer con el archivo PDF del resumen del pedido.
 * @param {Object} order Datos completos del pedido
 * @returns {Promise<Buffer>}
 */
export async function generateOrderPDF(order) {
    return new Promise((resolve, reject) => {
        try {
            const doc = new PDFDocument({ margin: 50, size: 'A4' });
            const buffers = [];

            doc.on('data', buffers.push.bind(buffers));
            doc.on('end', () => {
                const pdfData = Buffer.concat(buffers);
                resolve(pdfData);
            });
            doc.on('error', (err) => {
                console.error("PDFDoc Error:", err);
                reject(err);
            });

            // ── Encabezado ───────────────────────────────────────────────────────
            doc.fillColor('#1e293b').fontSize(20).font('Helvetica-Bold').text('CASA MARQUITO', { align: 'center' });
            doc.fontSize(10).font('Helvetica').text('Tienda Online · Artículos para el Hogar', { align: 'center' });
            doc.moveDown();
            doc.strokeColor('#e2e8f0').lineWidth(1).moveTo(50, doc.y).lineTo(550, doc.y).stroke();
            doc.moveDown();

            // ── Datos del Pedido ─────────────────────────────────────────────────
            doc.fillColor('#475569').fontSize(14).font('Helvetica-Bold').text(`Resumen de Pedido #${order.id || 'S/N'}`, { underline: true });
            doc.moveDown(0.5);

            doc.fontSize(10).font('Helvetica').fillColor('#1e293b');
            const leftCol = 50;
            const rightCol = 320;
            let currentY = doc.y;

            const orderDate = order.date ? new Date(order.date) : new Date();
            const orderStatus = (order.status || 'Pendiente').toUpperCase();

            doc.text(`Fecha: ${orderDate.toLocaleString('es-PY')}`, leftCol, currentY);
            doc.text(`Estado: ${orderStatus}`, rightCol, currentY);
            doc.moveDown(0.5);

            currentY = doc.y;
            doc.text(`Cliente: ${order.customerName || 'N/A'}`, leftCol, currentY);
            doc.text(`Email: ${order.customerEmail || 'N/A'}`, rightCol, currentY);
            doc.moveDown(0.5);

            currentY = doc.y;
            doc.text(`Teléfono: ${order.customerPhone || 'N/A'}`, leftCol, currentY);
            doc.text(`Documento: ${order.documentNumber || 'N/A'}`, rightCol, currentY);
            doc.moveDown(0.5);

            doc.text(`Método de Pago: ${order.paymentMethod || 'Transferencia'}`, leftCol, doc.y);
            doc.moveDown();

            // ── Tabla de Productos ───────────────────────────────────────────────
            const tableTop = doc.y;
            doc.fillColor('#1e293b').rect(50, tableTop, 500, 20).fill();
            doc.fillColor('#ffffff').fontSize(10).font('Helvetica-Bold');
            doc.text('Producto', 60, tableTop + 5);
            doc.text('Precio Unit.', 300, tableTop + 5, { width: 80, align: 'right' });
            doc.text('Cant.', 390, tableTop + 5, { width: 50, align: 'center' });
            doc.text('Subtotal', 450, tableTop + 5, { width: 90, align: 'right' });

            doc.fillColor('#1e293b').font('Helvetica');
            let itemY = tableTop + 25;

            const items = order.items || [];
            items.forEach((item, index) => {
                const name = item.name || item.product_name || 'Producto';
                const price = parseFloat(item.price || 0);
                const qty = parseInt(item.quantity || 0);
                const sub = price * qty;

                // Zebra striping
                if (index % 2 === 0) {
                    doc.fillColor('#f8fafc').rect(50, itemY - 2, 500, 16).fill();
                    doc.fillColor('#1e293b');
                }

                doc.text(name, 60, itemY, { width: 230 });
                doc.text(`$${price.toFixed(2)}`, 300, itemY, { width: 80, align: 'right' });
                doc.text(qty.toString(), 390, itemY, { width: 50, align: 'center' });
                doc.text(`$${sub.toFixed(2)}`, 450, itemY, { width: 90, align: 'right' });

                itemY += 18;

                if (itemY > 700) {
                    doc.addPage();
                    itemY = 50;
                }
            });

            doc.moveDown();
            doc.strokeColor('#e2e8f0').lineWidth(1).moveTo(350, doc.y).lineTo(550, doc.y).stroke();
            doc.moveDown(0.5);

            // ── Totales ─────────────────────────────────────────────────────────
            const totalsX = 350;
            const valueX = 450;
            const valueWidth = 90;

            doc.font('Helvetica');
            doc.text('Subtotal:', totalsX, doc.y);
            doc.text(`$${parseFloat(order.subtotal || 0).toFixed(2)}`, valueX, doc.y, { width: valueWidth, align: 'right' });
            doc.moveDown(0.3);

            if (parseFloat(order.discount) > 0) {
                doc.fillColor('#10b981').text('Descuento (10%):', totalsX, doc.y);
                doc.text(`-$${parseFloat(order.discount).toFixed(2)}`, valueX, doc.y, { width: valueWidth, align: 'right' });
                doc.fillColor('#1e293b').moveDown(0.3);
            }

            doc.text('Envío:', totalsX, doc.y);
            doc.text(`$${parseFloat(order.shippingCost || 0).toFixed(2)}`, valueX, doc.y, { width: valueWidth, align: 'right' });
            doc.moveDown(0.5);

            doc.fontSize(12).font('Helvetica-Bold').text('TOTAL:', totalsX, doc.y);
            doc.text(`$${parseFloat(order.total || 0).toFixed(2)}`, valueX, doc.y, { width: valueWidth, align: 'right' });

            // ── Pie de Página ────────────────────────────────────────────────────
            doc.fontSize(8).font('Helvetica').fillColor('#94a3b8').text('Gracias por confiar en Casa Marquito. Cualquier consulta contactar a ventas@casamarquito.com.py', 50, 780, { align: 'center' });

            doc.end();
        } catch (err) {
            console.error("PDF Generation Catch:", err);
            reject(err);
        }
    });
}
