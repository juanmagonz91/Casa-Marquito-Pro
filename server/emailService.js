
import nodemailer from 'nodemailer';

/**
 * Envía el resumen del pedido por email con un PDF adjunto.
 */
export async function sendOrderEmail(order, pdfBuffer) {
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;

  if (!smtpUser || !smtpPass) {
    console.warn('⚠️  SMTP_USER / SMTP_PASS no configurados. Saltando envío de email.');
    return null;
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: smtpUser, pass: smtpPass },
  });

  const itemsRows = (order.items || []).map(item => {
    const price = parseFloat(item.price || 0);
    const qty = parseInt(item.quantity || 1);
    const sub = price * qty;
    return `
          <tr>
            <td style="padding:8px 12px; border-bottom:1px solid #f1f5f9;">${item.name || item.product_name}</td>
            <td style="padding:8px 12px; border-bottom:1px solid #f1f5f9; text-align:center;">${qty}</td>
            <td style="padding:8px 12px; border-bottom:1px solid #f1f5f9; text-align:right;">$${price.toFixed(2)}</td>
            <td style="padding:8px 12px; border-bottom:1px solid #f1f5f9; text-align:right;">$${sub.toFixed(2)}</td>
          </tr>`;
  }).join('');

  const mailOptions = {
    from: `"Casa Marquito" <${smtpUser}>`,
    to: order.customerEmail,
    subject: `✅ Confirmación de Pedido #${order.id} - Casa Marquito`,
    html: `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 620px; margin: auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
        <div style="background: linear-gradient(135deg, #1e293b 0%, #334155 100%); padding: 30px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 26px; letter-spacing: 1px;">🏠 CASA MARQUITO</h1>
          <p style="color: #94a3b8; margin: 6px 0 0; font-size: 13px;">Tienda Online · Artículos para el Hogar</p>
        </div>
        <div style="padding: 30px;">
          <h2 style="color: #1e293b; margin-top: 0;">¡Gracias por tu compra, ${order.customerName}! 🎉</h2>
          <p style="color: #475569; line-height: 1.6;">Tu pedido ha sido recibido. Adjunto encontrarás el <strong>resumen detallado en PDF</strong>.</p>
          <div style="background: #f8fafc; border-radius: 8px; padding: 16px; margin: 20px 0; border-left: 4px solid #3b82f6;">
            <p style="margin: 4px 0; color: #475569; font-size: 14px;"><strong>Pedido ID:</strong> #${order.id}</p>
            <p style="margin: 4px 0; color: #475569; font-size: 14px;"><strong>Fecha:</strong> ${new Date(order.date || Date.now()).toLocaleString('es-PY')}</p>
            <p style="margin: 4px 0; color: #475569; font-size: 14px;"><strong>Método de Pago:</strong> ${order.paymentMethod || 'Transferencia Bancaria'}</p>
          </div>
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 14px;">
            <thead>
              <tr style="background: #1e293b; color: #ffffff;">
                <th style="padding: 10px 12px; text-align: left;">Producto</th>
                <th style="padding: 10px 12px; text-align: center;">Cant.</th>
                <th style="padding: 10px 12px; text-align: right;">Precio</th>
                <th style="padding: 10px 12px; text-align: right;">Subtotal</th>
              </tr>
            </thead>
            <tbody style="color: #1e293b;">${itemsRows}</tbody>
          </table>
          <div style="text-align: right; margin-top: 10px; padding-top: 10px; border-top: 2px solid #e2e8f0;">
            ${parseFloat(order.discount) > 0 ? `<p style="margin: 4px 0; color: #10b981; font-size: 14px;">Descuento volumen: -$${parseFloat(order.discount).toFixed(2)}</p>` : ''}
            ${parseFloat(order.couponDiscount) > 0 ? `<p style="margin: 4px 0; color: #10b981; font-size: 14px;">Cupón (${order.couponCode}): -$${parseFloat(order.couponDiscount).toFixed(2)}</p>` : ''}
            ${parseFloat(order.shippingCost) > 0 ? `<p style="margin: 4px 0; color: #475569; font-size: 14px;">Envío: $${parseFloat(order.shippingCost).toFixed(2)}</p>` : '<p style="margin: 4px 0; color: #10b981; font-size: 14px;">Envío: Gratis 🎁</p>'}
            <p style="margin: 8px 0 0; font-size: 20px; font-weight: bold; color: #1e293b;">TOTAL: $${parseFloat(order.total).toFixed(2)}</p>
          </div>
          <div style="margin-top: 24px; padding: 14px; background: #fffbeb; border-radius: 8px; border: 1px solid #fde68a;">
            <p style="margin: 0; color: #92400e; font-size: 13px;">💳 Si realizaste una <strong>transferencia bancaria</strong>, por favor envía el comprobante respondiendo a este correo.</p>
          </div>
        </div>
        <div style="background: #f8fafc; padding: 20px; text-align: center; border-top: 1px solid #e2e8f0;">
          <p style="color: #94a3b8; font-size: 12px; margin: 0;">© 2026 Casa Marquito · Encarnación, Paraguay</p>
        </div>
      </div>`,
    attachments: [{
      filename: `Pedido_CasaMarquito_${order.id}.pdf`,
      content: pdfBuffer,
      contentType: 'application/pdf',
    }],
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Email enviado exitosamente a ${order.customerEmail} (ID: ${info.messageId})`);
    return info;
  } catch (err) {
    console.error(`❌ Error al enviar email: ${err.message}`);
    throw err;
  }
}

/**
 * Envía una notificación de cambio de estado del pedido al cliente.
 */
export async function sendStatusUpdateEmail(order, newStatus) {
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;

  if (!smtpUser || !smtpPass || !order.customerEmail) {
    console.warn('⚠️  SMTP no configurado o email no disponible. Saltando notificación.');
    return null;
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: smtpUser, pass: smtpPass },
  });

  const STATUS_CONFIG = {
    paid: {
      emoji: '✅', title: 'Pago Confirmado',
      subject: `✅ Pago confirmado — Pedido #${order.id}`,
      message: 'Hemos confirmado tu pago. Estamos preparando tu pedido para el envío.',
      badge: '#10b981', badgeText: 'PAGO CONFIRMADO', icon: '💳',
    },
    shipped: {
      emoji: '🚚', title: 'Pedido en Camino',
      subject: `🚚 Tu pedido está en camino — #${order.id}`,
      message: 'Tu pedido ha sido despachado y está en camino a tu dirección.',
      badge: '#3b82f6', badgeText: 'EN CAMINO', icon: '📦',
    },
    delivered: {
      emoji: '📦', title: '¡Pedido Entregado!',
      subject: `📦 ¡Tu pedido fue entregado! — #${order.id}`,
      message: '¡Tu pedido fue entregado exitosamente! Esperamos que disfrutes tus productos.',
      badge: '#8b5cf6', badgeText: 'ENTREGADO', icon: '🎉',
    },
  };

  const config = STATUS_CONFIG[newStatus];
  if (!config) return null;

  const mailOptions = {
    from: `"Casa Marquito" <${smtpUser}>`,
    to: order.customerEmail,
    subject: config.subject,
    html: `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 620px; margin: auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
        <div style="background: linear-gradient(135deg, #1e293b 0%, #334155 100%); padding: 30px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 26px; letter-spacing: 1px;">🏠 CASA MARQUITO</h1>
          <p style="color: #94a3b8; margin: 6px 0 0; font-size: 13px;">Tienda Online · Artículos para el Hogar</p>
        </div>
        <div style="padding: 30px; text-align: center;">
          <div style="font-size: 48px; margin-bottom: 16px;">${config.icon}</div>
          <span style="display: inline-block; background: ${config.badge}; color: white; padding: 6px 16px; border-radius: 20px; font-size: 12px; font-weight: bold; letter-spacing: 1px; margin-bottom: 20px;">${config.badgeText}</span>
          <h2 style="color: #1e293b; margin: 0 0 12px;">${config.emoji} ${config.title}</h2>
          <p style="color: #475569; line-height: 1.6; font-size: 15px;">Hola <strong>${order.customerName || 'Cliente'}</strong>,<br>${config.message}</p>
          <div style="background: #f8fafc; border-radius: 8px; padding: 16px; margin: 24px 0; text-align: left; border: 1px solid #e2e8f0;">
            <p style="margin: 4px 0; color: #475569; font-size: 14px;"><strong>Pedido ID:</strong> #${order.id}</p>
            <p style="margin: 4px 0; color: #475569; font-size: 14px;"><strong>Total:</strong> $${parseFloat(order.total || 0).toFixed(2)}</p>
          </div>
          <p style="color: #94a3b8; font-size: 13px;">¿Tenés alguna consulta? Respondé a este correo y te ayudamos.</p>
        </div>
        <div style="background: #f8fafc; padding: 20px; text-align: center; border-top: 1px solid #e2e8f0;">
          <p style="color: #94a3b8; font-size: 12px; margin: 0;">© 2026 Casa Marquito · Encarnación, Paraguay</p>
        </div>
      </div>`,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Notificación "${newStatus}" enviada a ${order.customerEmail}`);
    return info;
  } catch (err) {
    console.error(`❌ Error al enviar notificación: ${err.message}`);
    throw err;
  }
}
