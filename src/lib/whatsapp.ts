// src/lib/whatsapp.ts — WhatsApp notification to store owner
const WA = process.env.NEXT_PUBLIC_WA_NUMBER || '919159666538';

export function buildOwnerOrderMessage(data: {
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  items: { product_name: string; quantity: number; line_total: number; variant_label?: string }[];
  total: number;
  paymentMethod: string;
  deliveryCity: string;
  deliveryPincode: string;
}) {
  const lines = data.items
    .map(i => {
      const v = i.variant_label ? ` (${i.variant_label})` : '';
      return `  - ${i.product_name}${v} x${i.quantity} = Rs.${i.line_total.toLocaleString('en-IN')}`;
    })
    .join('\n');

  const payment = data.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online (Razorpay)';

  return (
    `NEW ORDER: ${data.orderNumber}\n\n` +
    `Customer: ${data.customerName}\n` +
    `Phone: ${data.customerPhone}\n` +
    `Location: ${data.deliveryCity} - ${data.deliveryPincode}\n` +
    `Payment: ${payment}\n\n` +
    `Items:\n${lines}\n\n` +
    `Total: Rs.${data.total.toLocaleString('en-IN')}\n\n` +
    `Open admin to manage: https://karurplywood.co.in/admin/orders`
  );
}

export function getOwnerWhatsAppURL(message: string) {
  return `https://wa.me/${WA}?text=${encodeURIComponent(message)}`;
}
