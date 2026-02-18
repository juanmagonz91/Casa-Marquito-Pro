
// Script de prueba: genera un PDF y lo envía por email
// Uso: node --env-file=.env test-email.js

import { generateOrderPDF } from './server/pdfGenerator.js';
import { sendOrderEmail } from './server/emailService.js';
import fs from 'fs';
import path from 'path';

const mockOrder = {
    id: 'TEST-001',
    customerName: 'Juan González',
    customerEmail: 'juanmagonz91@gmail.com',
    customerPhone: '+595 981 123456',
    documentNumber: '4.567.890',
    date: new Date().toISOString(),
    subtotal: 285000,
    discount: 28500,
    shippingCost: 0,
    total: 256500,
    paymentMethod: 'Transferencia Bancaria',
    status: 'pending',
    shippingAddress: {
        label: 'Casa',
        line1: 'Av. España 1234',
        line2: 'Asunción, Paraguay',
    },
    items: [
        { name: 'Jarrón Cerámico Artesanal', price: 85000, quantity: 1 },
        { name: 'Set de Toallas Premium (x4)', price: 120000, quantity: 1 },
        { name: 'Portavelas Decorativo', price: 40000, quantity: 2 },
    ],
};

console.log('🔧 Iniciando prueba de envío de email con PDF...\n');
console.log(`   Destinatario: ${mockOrder.customerEmail}`);
console.log(`   SMTP User:    ${process.env.SMTP_USER || '(no configurado)'}\n`);

try {
    // 1. Generar PDF
    console.log('📄 Generando PDF del pedido...');
    const pdfBuffer = await generateOrderPDF(mockOrder);

    // Guardar copia local para verificar
    const outputPath = path.join(process.cwd(), 'test_output.pdf');
    fs.writeFileSync(outputPath, pdfBuffer);
    console.log(`   ✅ PDF generado (${pdfBuffer.length} bytes) → ${outputPath}`);

    // 2. Enviar email
    console.log('\n📧 Enviando email...');
    const info = await sendOrderEmail(mockOrder, pdfBuffer);

    if (info) {
        console.log('\n🎉 ¡Prueba completada exitosamente!');
        console.log(`   Email enviado a: ${mockOrder.customerEmail}`);
        console.log(`   Message ID: ${info.messageId}`);
    }
} catch (err) {
    console.error('\n❌ Error en la prueba:', err.message);
    if (err.message.includes('Invalid login') || err.message.includes('Username and Password')) {
        console.error('   → Verificá que el App Password sea correcto y que el email tenga verificación en 2 pasos activa.');
    }
    process.exit(1);
}
