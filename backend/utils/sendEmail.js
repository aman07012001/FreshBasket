const { env } = require('../config');
const { queueEmail } = require('../queue/emailQueue');

async function sendOrderEmail(order, status) {
  if (!order) return;

  if (String(env.EMAIL_ON_ORDER).toLowerCase() !== 'true') {
    return;
  }

  const address = order.deliveryAddress || {};
  const name = address.name || 'Customer';
  const customerEmail = address.email || null;

  const recipients = [];
  if (customerEmail) {
    recipients.push(customerEmail);
  }

  if (env.ADMIN_EMAILS) {
    const adminList = String(env.ADMIN_EMAILS)
      .split(',')
      .map((email) => email.trim())
      .filter(Boolean);
    recipients.push(...adminList);
  }

  if (recipients.length === 0) {
    if (env.SMTP_USER) {
      recipients.push(env.SMTP_USER);
    } else if (env.EMAIL_FROM) {
      recipients.push(env.EMAIL_FROM);
    }
  }

  if (recipients.length === 0) {
    return;
  }

  const subject = `Order Update - ${order.orderId}`;
  const text = `Hello ${name},\n\nYour order ${order.orderId} is now ${status}.\n\nThank you for shopping with us.`;

  try {
    await queueEmail({
      to: recipients.join(','),
      subject,
      text,
      meta: {
        type: 'order-status',
        orderId: order.orderId,
        status,
      },
    });
  } catch (err) {

    console.error('sendOrderEmail error:', err.message || err);
  }
}

module.exports = { sendOrderEmail };
