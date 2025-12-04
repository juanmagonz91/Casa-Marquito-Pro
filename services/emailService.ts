import { CartItem, Product } from '../types';

interface OrderDetails {
  orderId: string;
  customerName: string;
  email: string;
  total: number;
  items: CartItem[];
  shippingCost: number;
}

export const emailService = {
  /**
   * Generates the HTML content for the order confirmation email
   * and simulates sending it by logging to console.
   */
  sendOrderConfirmation: async (order: OrderDetails, recommendations: Product[]) => {
    const htmlContent = generateEmailHTML(order, recommendations);
    
    // In a real app, this would be: await api.post('/send-email', { html: htmlContent, to: order.email });
    console.group('%c 📧 SIMULACIÓN DE ENVÍO DE CORREO', 'color: #13ecb6; font-size: 14px; font-weight: bold;');
    console.log(`Para: ${order.customerName} <${order.email}>`);
    console.log('Asunto: Confirmación de tu Pedido #' + order.orderId);
    console.log('Contenido (HTML generado):');
    console.log(htmlContent);
    console.groupEnd();

    return true;
  }
};

const generateEmailHTML = (order: OrderDetails, recommendations: Product[]) => {
  const date = new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });
  
  const itemsHtml = order.items.map(item => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #eee;">
        <img src="${item.imageUrl}" alt="${item.name}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 4px;">
      </td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; font-family: sans-serif;">
        <div style="font-weight: bold; color: #333;">${item.name}</div>
        <div style="font-size: 12px; color: #888;">Cant: ${item.quantity}</div>
      </td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right; font-family: sans-serif;">
        $${(item.price * item.quantity).toFixed(2)}
      </td>
    </tr>
  `).join('');

  const recommendationsHtml = recommendations.map(prod => `
    <div style="display: inline-block; width: 30%; min-width: 140px; margin: 1%; vertical-align: top; text-align: center;">
      <img src="${prod.imageUrl}" alt="${prod.name}" style="width: 100%; height: 120px; object-fit: cover; border-radius: 8px;">
      <p style="margin: 8px 0 4px; font-size: 14px; font-weight: bold; color: #333; height: 36px; overflow: hidden;">${prod.name}</p>
      <p style="margin: 0; color: #13ecb6; font-weight: bold;">$${prod.price.toFixed(2)}</p>
      <a href="https://tutienda.com/producto/${prod.id}" style="display: block; margin-top: 8px; text-decoration: none; font-size: 12px; color: #666; border: 1px solid #ddd; padding: 4px; border-radius: 4px;">Ver Producto</a>
    </div>
  `).join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f6f8f8; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 20px auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
        .header { background: #10221d; padding: 30px 20px; text-align: center; }
        .header h1 { color: #13ecb6; margin: 0; font-size: 24px; }
        .content { padding: 30px 20px; }
        .order-info { background: #f9fafb; padding: 15px; border-radius: 8px; margin-bottom: 20px; font-size: 14px; }
        .bank-info { background: #eefffa; border: 1px dashed #13ecb6; padding: 15px; border-radius: 8px; margin: 20px 0; }
        .total-section { text-align: right; margin-top: 20px; padding-top: 10px; border-top: 2px solid #eee; }
        .footer { background: #f6f8f8; padding: 20px; text-align: center; font-size: 12px; color: #888; }
        .recommendations { margin-top: 30px; padding-top: 20px; border-top: 2px dashed #eee; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Catálogo Estilo</h1>
          <p style="color: #ccc; margin: 5px 0 0;">Confirmación de Pedido</p>
        </div>
        
        <div class="content">
          <h2>¡Hola ${order.customerName}!</h2>
          <p>Gracias por tu compra. Hemos recibido tu pedido y estamos esperando tu comprobante de pago.</p>
          
          <div class="order-info">
            <strong>Pedido:</strong> #${order.orderId}<br>
            <strong>Fecha:</strong> ${date}<br>
            <strong>Dirección de Envío:</strong> ${order.email}
          </div>

          <table width="100%" cellspacing="0" cellpadding="0">
            ${itemsHtml}
          </table>

          <div class="total-section">
            <p style="margin: 5px 0;">Subtotal: $${(order.total - order.shippingCost).toFixed(2)}</p>
            <p style="margin: 5px 0;">Envío: $${order.shippingCost.toFixed(2)}</p>
            <h3 style="margin: 10px 0 0; color: #10221d;">Total: $${order.total.toFixed(2)}</h3>
          </div>

          <div class="bank-info">
            <h4 style="margin-top: 0; color: #10221d;">Instrucciones de Pago</h4>
            <p style="margin: 5px 0; font-size: 13px;">Banco: <strong>BBVA Bancomer</strong></p>
            <p style="margin: 5px 0; font-size: 13px;">CLABE: <strong>012 345 67890123456 7</strong></p>
            <p style="margin: 5px 0; font-size: 13px;">Referencia: <strong>${order.orderId}</strong></p>
            <p style="margin-top: 10px; font-size: 12px; color: #666;">Por favor envía tu comprobante a pagos@catalogoestilo.com</p>
          </div>

          <div class="recommendations">
            <h3 style="text-align: center; color: #555;">También te podría interesar</h3>
            <div style="text-align: center;">
              ${recommendationsHtml}
            </div>
          </div>
        </div>

        <div class="footer">
          <p>© 2023 Catálogo Estilo. Todos los derechos reservados.</p>
          <p>Av. Reforma 123, Ciudad de México</p>
        </div>
      </div>
    </body>
    </html>
  `;
};