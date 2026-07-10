// src/lib/email.ts â€” Resend email sender
// Install: npm install resend
// Sign up at resend.com, add RESEND_API_KEY to .env

const RESEND_API_KEY = process.env.RESEND_API_KEY!;
const FROM_EMAIL     = process.env.FROM_EMAIL || 'orders@karurplywood.co.in';
const STORE_NAME     = 'Karur Plywood & Company';

interface OrderEmailData {
  customerName: string;
  customerEmail: string;
  orderNumber: string;
  items: { product_name: string; quantity: number; unit_price: number; line_total: number; variant_label?: string }[];
  subtotal: number;
  deliveryCharge: number;
  total: number;
  paymentMethod: string;
  deliveryAddress: string;
  status?: string;
}

function orderConfirmationHTML(data: OrderEmailData): string {
  const itemRows = data.items.map(item => `
    <tr>
      <td style="padding:10px 0;border-bottom:1px solid #f0e8dc;color:#333;font-size:14px">
        ${item.product_name}
        ${item.variant_label ? `<div style="font-size:12px;color:#999;margin-top:2px">${item.variant_label}</div>` : ''}
      </td>
      <td style="padding:10px 0;border-bottom:1px solid #f0e8dc;text-align:center;color:#666;font-size:14px">${item.quantity}</td>
      <td style="padding:10px 0;border-bottom:1px solid #f0e8dc;text-align:right;color:#333;font-size:14px">â‚¹${item.line_total.toLocaleString('en-IN')}</td>
    </tr>
  `).join('');

  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f5f0ea;font-family:'Helvetica Neue',Arial,sans-serif">
  <div style="max-width:600px;margin:0 auto;padding:32px 16px">

    <!-- Header -->
    <div style="background:#0B2447;border-radius:8px 8px 0 0;padding:28px 32px;text-align:center">
      <div style="font-size:28px;font-weight:900;letter-spacing:4px;color:#fff;margin-bottom:4px">KARUR PLYWOOD</div>
      <div style="font-size:11px;letter-spacing:3px;color:#F97316;text-transform:uppercase">&amp; Company Â· Karur, Tamil Nadu</div>
    </div>

    <!-- Body -->
    <div style="background:#fff;padding:32px">
      <div style="font-size:22px;font-weight:700;color:#0B2447;margin-bottom:6px">Order Confirmed! ðŸŽ‰</div>
      <div style="font-size:14px;color:#666;margin-bottom:24px">Hi ${data.customerName}, your order has been placed successfully.</div>

      <div style="background:#f5f0ea;border-radius:6px;padding:14px 18px;margin-bottom:24px;display:flex;justify-content:space-between">
        <div>
          <div style="font-size:11px;color:#999;text-transform:uppercase;letter-spacing:1px">Order Number</div>
          <div style="font-size:18px;font-weight:700;color:#F97316">${data.orderNumber}</div>
        </div>
        <div style="text-align:right">
          <div style="font-size:11px;color:#999;text-transform:uppercase;letter-spacing:1px">Payment</div>
          <div style="font-size:14px;font-weight:600;color:#333">${data.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online Payment'}</div>
        </div>
      </div>

      <!-- Items -->
      <div style="font-size:13px;font-weight:700;color:#0B2447;text-transform:uppercase;letter-spacing:1px;margin-bottom:12px">Order Items</div>
      <table style="width:100%;border-collapse:collapse">
        <thead>
          <tr style="border-bottom:2px solid #f0e8dc">
            <th style="text-align:left;padding-bottom:8px;font-size:11px;color:#999;text-transform:uppercase;letter-spacing:1px">Product</th>
            <th style="text-align:center;padding-bottom:8px;font-size:11px;color:#999;text-transform:uppercase;letter-spacing:1px">Qty</th>
            <th style="text-align:right;padding-bottom:8px;font-size:11px;color:#999;text-transform:uppercase;letter-spacing:1px">Total</th>
          </tr>
        </thead>
        <tbody>${itemRows}</tbody>
      </table>

      <!-- Totals -->
      <div style="margin-top:16px;padding-top:16px;border-top:2px solid #0B2447">
        <div style="display:flex;justify-content:space-between;font-size:13px;color:#666;margin-bottom:6px">
          <span>Subtotal</span><span>â‚¹${data.subtotal.toLocaleString('en-IN')}</span>
        </div>
        <div style="display:flex;justify-content:space-between;font-size:13px;color:#666;margin-bottom:12px">
          <span>Delivery</span><span>${data.deliveryCharge === 0 ? 'To be confirmed' : 'â‚¹' + data.deliveryCharge.toLocaleString('en-IN')}</span>
        </div>
        <div style="display:flex;justify-content:space-between;font-size:18px;font-weight:700;color:#0B2447">
          <span>Total</span><span>â‚¹${data.total.toLocaleString('en-IN')}</span>
        </div>
      </div>

      <!-- Address -->
      <div style="margin-top:24px;background:#f5f0ea;border-radius:6px;padding:14px 18px">
        <div style="font-size:11px;color:#999;text-transform:uppercase;letter-spacing:1px;margin-bottom:8px">Delivery Address</div>
        <div style="font-size:13px;color:#333;line-height:1.8">${data.deliveryAddress}</div>
      </div>

      <!-- What next -->
      <div style="margin-top:24px;padding:16px;background:#fff8f0;border:1px solid #F97316;border-radius:6px">
        <div style="font-size:13px;font-weight:700;color:#F97316;margin-bottom:6px">What happens next?</div>
        <div style="font-size:13px;color:#666;line-height:1.7">
          Our team will confirm your order and contact you on your registered phone number regarding delivery schedule and payment.
        </div>
      </div>
    </div>

    <!-- Footer -->
    <div style="background:#0B2447;border-radius:0 0 8px 8px;padding:20px 32px;text-align:center">
      <div style="font-size:12px;color:#7A8EA8;line-height:1.8">
        Questions? WhatsApp us or call us.<br>
        Karur Plywood &amp; Company Â· Main Road, Karur Â· Tamil Nadu 639001
      </div>
    </div>

  </div>
</body>
</html>`;
}

function statusUpdateHTML(data: { customerName: string; orderNumber: string; status: string; message: string }): string {
  const statusColors: Record<string, string> = {
    confirmed:  '#25D366',
    processing: '#F97316',
    shipped:    '#3B82F6',
    delivered:  '#10B981',
    cancelled:  '#EF4444',
  };
  const color = statusColors[data.status] || '#F97316';

  return `
<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#f5f0ea;font-family:Arial,sans-serif">
  <div style="max-width:600px;margin:0 auto;padding:32px 16px">
    <div style="background:#0B2447;border-radius:8px 8px 0 0;padding:24px 32px;text-align:center">
      <div style="font-size:24px;font-weight:900;letter-spacing:4px;color:#fff">KARUR PLYWOOD</div>
    </div>
    <div style="background:#fff;padding:32px;border-radius:0 0 8px 8px">
      <div style="font-size:20px;font-weight:700;color:#0B2447;margin-bottom:8px">Order Update</div>
      <div style="font-size:14px;color:#666;margin-bottom:24px">Hi ${data.customerName},</div>
      <div style="background:${color}15;border:1px solid ${color};border-radius:6px;padding:16px;text-align:center;margin-bottom:24px">
        <div style="font-size:11px;color:#999;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px">Order ${data.orderNumber}</div>
        <div style="font-size:20px;font-weight:700;color:${color};text-transform:capitalize">${data.status}</div>
      </div>
      <div style="font-size:14px;color:#555;line-height:1.7">${data.message}</div>
    </div>
  </div>
</body>
</html>`;
}

export async function sendOrderConfirmation(data: OrderEmailData) {
  if (!RESEND_API_KEY) {
    console.warn('RESEND_API_KEY not set â€” skipping email');
    return { ok: false };
  }

  const addressLines = [
    data.deliveryAddress
  ].filter(Boolean).join('<br>');

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: `${STORE_NAME} <${FROM_EMAIL}>`,
      to: [data.customerEmail],
      subject: `Order Confirmed â€” ${data.orderNumber} | Karur Plywood`,
      html: orderConfirmationHTML(data),
    }),
  });

  return { ok: res.ok };
}

interface OwnerAlertData {
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  items: { product_name: string; quantity: number; unit_price: number; line_total: number; variant_label?: string }[];
  total: number;
  paymentMethod: string;
  deliveryAddress: string;
}

function ownerAlertHTML(data: OwnerAlertData): string {
  const itemRows = data.items.map(item => `
    <tr>
      <td style="padding:8px 0;border-bottom:1px solid #f0e8dc;color:#333;font-size:14px">
        ${item.product_name}${item.variant_label ? ` <span style="color:#999;font-size:12px">(${item.variant_label})</span>` : ''}
      </td>
      <td style="padding:8px 0;border-bottom:1px solid #f0e8dc;text-align:center;color:#666;font-size:14px">${item.quantity}</td>
      <td style="padding:8px 0;border-bottom:1px solid #f0e8dc;text-align:right;color:#333;font-size:14px">â‚¹${item.line_total.toLocaleString('en-IN')}</td>
    </tr>
  `).join('');

  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f5f0ea;font-family:'Helvetica Neue',Arial,sans-serif">
  <div style="max-width:600px;margin:0 auto;padding:32px 16px">
    <div style="background:#F97316;border-radius:8px 8px 0 0;padding:20px 32px;text-align:center">
      <div style="font-size:20px;font-weight:900;letter-spacing:2px;color:#fff">ðŸ”” NEW ORDER RECEIVED</div>
    </div>
    <div style="background:#fff;padding:32px">
      <div style="background:#f5f0ea;border-radius:6px;padding:14px 18px;margin-bottom:20px;display:flex;justify-content:space-between">
        <div>
          <div style="font-size:11px;color:#999;text-transform:uppercase;letter-spacing:1px">Order Number</div>
          <div style="font-size:18px;font-weight:700;color:#F97316">${data.orderNumber}</div>
        </div>
        <div style="text-align:right">
          <div style="font-size:11px;color:#999;text-transform:uppercase;letter-spacing:1px">Payment</div>
          <div style="font-size:14px;font-weight:600;color:#333">${data.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online Payment'}</div>
        </div>
      </div>

      <div style="margin-bottom:20px">
        <div style="font-size:11px;color:#999;text-transform:uppercase;letter-spacing:1px;margin-bottom:6px">Customer</div>
        <div style="font-size:15px;font-weight:600;color:#0B2447">${data.customerName}</div>
        <div style="font-size:14px;color:#666">${data.customerPhone}</div>
      </div>

      <div style="font-size:13px;font-weight:700;color:#0B2447;text-transform:uppercase;letter-spacing:1px;margin-bottom:10px">Items</div>
      <table style="width:100%;border-collapse:collapse">
        <thead>
          <tr style="border-bottom:2px solid #f0e8dc">
            <th style="text-align:left;padding-bottom:8px;font-size:11px;color:#999;text-transform:uppercase">Product</th>
            <th style="text-align:center;padding-bottom:8px;font-size:11px;color:#999;text-transform:uppercase">Qty</th>
            <th style="text-align:right;padding-bottom:8px;font-size:11px;color:#999;text-transform:uppercase">Total</th>
          </tr>
        </thead>
        <tbody>${itemRows}</tbody>
      </table>

      <div style="margin-top:14px;padding-top:14px;border-top:2px solid #0B2447;display:flex;justify-content:space-between;font-size:18px;font-weight:700;color:#0B2447">
        <span>Total</span><span>â‚¹${data.total.toLocaleString('en-IN')}</span>
      </div>

      <div style="margin-top:20px;background:#f5f0ea;border-radius:6px;padding:14px 18px">
        <div style="font-size:11px;color:#999;text-transform:uppercase;letter-spacing:1px;margin-bottom:8px">Delivery Address</div>
        <div style="font-size:13px;color:#333;line-height:1.8">${data.deliveryAddress}</div>
      </div>

      <div style="margin-top:24px;text-align:center">
        <a href="https://www.karurplywood.co.in/admin/orders" style="display:inline-block;background:#0B2447;color:#fff;padding:12px 28px;border-radius:6px;text-decoration:none;font-weight:700;font-size:14px">View in Admin Panel â†’</a>
      </div>
    </div>
  </div>
</body>
</html>`;
}

/**
 * Notifies the store owner by email the moment a new order is placed.
 * Runs alongside (not instead of) the WhatsApp owner notification, so
 * orders aren't missed if the WhatsApp tab doesn't get opened/seen.
 * Set OWNER_EMAIL in env.
 */
export async function sendOwnerOrderAlert(data: OwnerAlertData) {
  if (!RESEND_API_KEY) {
    console.warn('RESEND_API_KEY not set â€” skipping owner alert email');
    return { ok: false };
  }

  const ownerEmail = process.env.OWNER_EMAIL;
  if (!ownerEmail) {
    console.warn('OWNER_EMAIL not set â€” skipping owner alert email');
    return { ok: false };
  }

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: `${STORE_NAME} <${FROM_EMAIL}>`,
      to: [ownerEmail],
      subject: `ðŸ”” New Order ${data.orderNumber} â€” â‚¹${data.total.toLocaleString('en-IN')}`,
      html: ownerAlertHTML(data),
    }),
  });

  return { ok: res.ok };
}

export async function sendStatusUpdate(data: {
  customerName: string;
  customerEmail: string;
  orderNumber: string;
  status: string;
}) {
  if (!RESEND_API_KEY) return { ok: false };

  const messages: Record<string, string> = {
    confirmed:  'Great news! Your order has been confirmed by our team. We will contact you shortly to arrange delivery.',
    processing: 'Your order is being processed and prepared for dispatch.',
    shipped:    'Your order is on its way! Our team will contact you to arrange delivery at a convenient time.',
    delivered:  'Your order has been delivered. Thank you for shopping with Karur Plywood & Company!',
    cancelled:  'Your order has been cancelled. Please contact us if you have any questions.',
  };

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: `${STORE_NAME} <${FROM_EMAIL}>`,
      to: [data.customerEmail],
      subject: `Order ${data.status.charAt(0).toUpperCase() + data.status.slice(1)} â€” ${data.orderNumber}`,
      html: statusUpdateHTML({
        customerName: data.customerName,
        orderNumber: data.orderNumber,
        status: data.status,
        message: messages[data.status] || 'Your order status has been updated.',
      }),
    }),
  });

  return { ok: res.ok };
}
