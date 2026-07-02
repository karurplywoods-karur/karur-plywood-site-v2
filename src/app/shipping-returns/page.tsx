import { Metadata } from 'next';
import LegalPageLayout from '@/components/LegalPageLayout';
import { CONTACT } from '@/lib/contact';

export const metadata: Metadata = {
  title: 'Shipping & Returns Policy',
  description: 'Delivery timelines, return procedures, and refund process for orders placed with Karur Plywood & Company across Karur, Trichy, Namakkal, Erode, Salem and Dindigul.',
  alternates: { canonical: `${CONTACT.siteUrl}/shipping-returns` },
};

export default function ShippingReturnsPage() {
  return (
    <LegalPageLayout title="Shipping &amp; Returns Policy" updated="July 1, 2026">

      <h2>Delivery Areas</h2>
      <p>
        We deliver across Karur district and surrounding areas including Trichy, Namakkal, Erode, Salem, and Dindigul.
        Delivery availability and timelines for your specific location are shown on each area page.
        For areas not listed, contact us directly — we deliver to many more locations on request.
      </p>

      <h2>Delivery Timelines</h2>
      <ul>
        <li><strong>Karur city &amp; suburbs:</strong> Same day or next day delivery for in-stock items ordered before 2 PM</li>
        <li><strong>Within 30km of Karur:</strong> 1–2 business days</li>
        <li><strong>Trichy, Namakkal, Erode, Salem, Dindigul:</strong> 1–3 business days depending on order size and location</li>
        <li><strong>Bulk orders above 50 sheets:</strong> Timeline confirmed at order stage — typically 2–4 days for scheduling a delivery vehicle</li>
        <li><strong>Made-to-order items:</strong> 5–10 business days — exact timeline confirmed at order placement</li>
      </ul>
      <p>
        Delivery timelines are estimates and may vary due to weather, vehicle availability, or material stock. We will notify you proactively via WhatsApp if there is any delay.
      </p>

      <h2>Delivery Charges</h2>
      <ul>
        <li><strong>Orders above ₹5,000:</strong> Free delivery within Karur city and select nearby areas</li>
        <li><strong>Orders below ₹5,000 or longer distances:</strong> Delivery charge calculated and confirmed before order is finalized</li>
        <li><strong>Bulk / truck loads:</strong> Transport arranged and charged separately based on distance and load</li>
      </ul>

      <h2>Delivery Process</h2>
      <ul>
        <li>Our team will call or WhatsApp you to confirm the delivery date and time before dispatch</li>
        <li>Please ensure someone is available to receive and inspect the material at the delivery address</li>
        <li>Check all items against your order at the time of delivery — report any discrepancy or visible damage before signing the delivery receipt</li>
        <li>For large material (full sheets, doors), ensure clear access to the delivery point</li>
      </ul>

      <h2>Returns</h2>
      <p>We accept returns only in the following circumstances:</p>
      <ul>
        <li>Product delivered is <strong>damaged, defective, or different</strong> from what was ordered</li>
        <li>Wrong item, size, or quantity delivered due to our error</li>
      </ul>
      <p>
        Report any such issue <strong>within 48 hours of delivery</strong> with photos via
        {' '}<a href={`https://wa.me/${CONTACT.wa}`} target="_blank" rel="noopener">WhatsApp</a> or
        call <a href={`tel:${CONTACT.phoneRaw}`}>{CONTACT.phone}</a>. Do not use, cut, or modify the product while the claim is being reviewed.
      </p>

      <h2>Non-Returnable Items</h2>
      <ul>
        <li>Custom-cut plywood or panels (once cutting has begun)</li>
        <li>Made-to-order products matching the specifications you provided</li>
        <li>Products that have been used, installed, or modified after delivery</li>
        <li>Adhesives, sealants, or consumables that have been opened</li>
        <li>Items returned due to change of mind or incorrect measurements provided by the customer</li>
      </ul>
      <p>
        Natural variation in wood grain, veneer pattern, or laminate colour is not considered a defect and is not grounds for return.
        See our <a href="/disclaimer">Disclaimer</a> for more details.
      </p>

      <h2>Refunds</h2>
      <p>
        For approved returns, refunds are processed as follows:
      </p>
      <ul>
        <li><strong>Online payments:</strong> Refunded to the original payment method within 5–7 business days of approval</li>
        <li><strong>Cash on Delivery:</strong> Refunded via bank transfer or UPI within 3–5 business days — share your account details when raising the claim</li>
      </ul>
      <p>
        For full details on refund timelines, partial refunds, and COD refund procedures, see our <a href="/refund-policy">Refund Policy</a>.
        For cancellation rules, see our <a href="/cancellation-policy">Cancellation Policy</a>.
      </p>

      <h2>Contact Us</h2>
      <p>
        <strong>{CONTACT.businessName}</strong><br />
        GST No: {CONTACT.gst}<br />
        📍 {CONTACT.address}<br />
        📞 <a href={`tel:${CONTACT.phoneRaw}`}>{CONTACT.phone}</a><br />
        💬 <a href={`https://wa.me/${CONTACT.wa}`} target="_blank" rel="noopener">WhatsApp Us</a><br />
        ✉️ <a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a><br />
        ⏰ {CONTACT.hours}
      </p>
      <p>Related: <a href="/refund-policy">Refund Policy</a> · <a href="/cancellation-policy">Cancellation Policy</a> · <a href="/payment-policy">Payment Policy</a></p>
    </LegalPageLayout>
  );
}
