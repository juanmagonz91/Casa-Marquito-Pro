
import { generateOrderPDF } from './server/pdfGenerator.js';
import fs from 'fs';

const mockOrder = {
    id: "TEST-CRASH",
    customerName: "Ramón Núñez",
    customerEmail: "test@test.com",
    customerPhone: "123456",
    documentNumber: "7890",
    date: new Date().toISOString(),
    subtotal: 100,
    discount: 10,
    shippingCost: 0,
    total: 90,
    paymentMethod: "Test",
    items: [
        { name: "Jarrón Cerámico", price: 25, quantity: 4 }
    ]
};

console.log("Iniciando prueba de PDF...");
try {
    const buffer = await generateOrderPDF(mockOrder);
    fs.writeFileSync('test_output.pdf', buffer);
    console.log("PDF generado con éxito: test_output.pdf");
} catch (err) {
    console.error("Error generado PDF:", err);
}
