
import ExcelJS from 'exceljs';

/**
 * Genera un Buffer con el archivo Excel del resumen del pedido.
 * @param {Object} order Datos completos del pedido
 * @returns {Promise<Buffer>}
 */
export async function generateOrderExcel(order) {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Casa Marquito';
    workbook.lastModifiedBy = 'Casa Marquito';
    workbook.created = new Date();
    workbook.modified = new Date();

    const sheet = workbook.addWorksheet(`Pedido ${order.id}`);

    // ── Estilos ────────────────────────────────────────────────────────────────
    const titleStyle = { font: { bold: true, size: 16, color: { argb: 'FF000000' } } };
    const headerStyle = { font: { bold: true, color: { argb: 'FFFFFFFF' } }, fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E293B' } }, alignment: { horizontal: 'center' } };
    const currencyStyle = { numFmt: '"$"#,##0.00' };

    // ── Título y Datos Generales ───────────────────────────────────────────────
    sheet.mergeCells('A1:E1');
    const titleCell = sheet.getCell('A1');
    titleCell.value = 'RESUMEN DE PEDIDO - CASA MARQUITO';
    titleCell.style = titleStyle;
    titleCell.alignment = { horizontal: 'center' };

    sheet.addRow([]);
    sheet.addRow(['ID Pedido:', order.id]);
    sheet.addRow(['Fecha:', new Date(order.date).toLocaleString('es-PY')]);
    sheet.addRow(['Cliente:', order.customerName]);
    sheet.addRow(['Email:', order.customerEmail]);
    sheet.addRow(['Teléfono:', order.customerPhone || 'N/A']);
    sheet.addRow(['Documento:', order.documentNumber || 'N/A']);
    sheet.addRow(['Estado:', order.status]);
    sheet.addRow(['Método Pago:', order.paymentMethod]);
    sheet.addRow([]);

    // ── Tabla de Productos ─────────────────────────────────────────────────────
    const headerRow = sheet.addRow(['Producto', 'Precio Unit.', 'Cant.', 'Subtotal']);
    headerRow.eachCell(cell => cell.style = headerStyle);

    order.items.forEach(item => {
        const row = sheet.addRow([
            String(item.name || item.product_name),
            parseFloat(item.price),
            parseInt(item.quantity),
            parseFloat(item.price) * parseInt(item.quantity)
        ]);
        row.getCell(2).style = currencyStyle;
        row.getCell(4).style = currencyStyle;
    });

    sheet.addRow([]);

    // ── Totales ───────────────────────────────────────────────────────────────
    const subtotalRow = sheet.addRow(['', '', 'Subtotal:', parseFloat(order.subtotal)]);
    subtotalRow.getCell(4).style = currencyStyle;

    if (order.discount > 0) {
        const discountRow = sheet.addRow(['', '', 'Descuento (10%):', -parseFloat(order.discount)]);
        discountRow.getCell(4).style = { ...currencyStyle, font: { color: { argb: 'FF10B981' }, bold: true } };
    }

    const shippingRow = sheet.addRow(['', '', 'Envío:', parseFloat(order.shippingCost)]);
    shippingRow.getCell(4).style = currencyStyle;

    const totalRow = sheet.addRow(['', '', 'TOTAL:', parseFloat(order.total)]);
    totalRow.getCell(4).style = { ...currencyStyle, font: { bold: true, size: 12 } };

    // Ajustar ancho de columnas
    sheet.getColumn(1).width = 30;
    sheet.getColumn(2).width = 15;
    sheet.getColumn(3).width = 10;
    sheet.getColumn(4).width = 15;

    return await workbook.xlsx.writeBuffer();
}
