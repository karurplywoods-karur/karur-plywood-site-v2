import { Metadata } from 'next';
import LegalPageLayout from '@/components/LegalPageLayout';
import { CONTACT } from '@/lib/contact';

export const metadata: Metadata = {
  title: 'Refund Policy',
  description: 'Refund eligibility, timelines, damaged product claims, and bank/UPI refund details for orders placed with Karur Plywood & Company.',
  alternates: { canonical: `${CONTACT.siteUrl}/refund-policy` },
};

export default function RefundPolicyPage() {
  return (
    <LegalPageLayout title="Refund Policy" updated="July 1, 2026">
      <p>
        At {CONTACT.businessName}, we stand behind the quality of every product we supply. This policy explains when and how refunds are issued. For cancellation rules, see our <a href="/cancellation-policy">Cancellation Policy</a>. For delivery and return procedures, see our <a href="/shipping-returns">Shipping &amp; Returns Policy</a>.
      </p>

      <h2>1. Refund Eligibility</h2>
      <p>A refund is issued only in the following circumstances:</p>
      <ul>
        <li>The product delivered is <strong>damaged, defective, or broken</strong> due to transit or manufacturing fault</li>
        <li>The <strong>wrong product, size, or quantity</strong> was delivered as a result of our error</li>
        <li>An order was <strong>cancelled before dispatch</strong> and payment was already collected</li>
        <li>An online payment was charged but the order was <strong>not confirmed</strong> due to a technical failure</li>
      </ul>
      <p>Refunds are <strong>not issued</strong> for:</p>
      <ul>
        <li>Change of mind after the product is dispatched or delivered</li>
        <li>Incorrect measurements, dimensions, or specifications provided by the customer</li>
        <li>Normal natural variation in wood grain, veneer pattern, or color (inherent to all wood-based products)</li>
        <li>Minor color variation in laminates due to screen calibration differences</li>
        <li>Custom-cut or made-to-order products that match the specifications ordered</li>
        <li>Products that have been used, cut, drilled, or modified after delivery</li>
      </ul>

      <h2>2. Inspection Process</h2>
      <p>To initiate a refund claim:</p>
      <ul>
        <li>Report the issue <strong>within 48 hours of delivery</strong> — claims after this window may not be accepted</li>
        <li>Contact us via <a href={`https://wa.me/${CONTACT.wa}`} target="_blank" rel="noopener">WhatsApp</a> or call <a href={`tel:${CONTACT.phoneRaw}`}>{CONTACT.phone}</a></li>
        <li>Share <strong>clear photos or a short video</strong> of the damaged/incorrect product, along with your order number</li>
        <li>Do not use, cut, or modify the product while the claim is under review — doing so will void the claim</li>
        <li>Our team will review your claim within <strong>1–2 business days</strong> and confirm approval or request additional information</li>
        <li>For large or high-value claims, a physical inspection may be arranged</li>
      </ul>

      <h2>3. Damaged Products</h2>
      <p>
        If your order arrives visibly damaged, please <strong>note the damage on the delivery receipt</strong> before signing, then contact us immediately with photos. Do not accept a delivery that is severely damaged — you are within your rights to refuse delivery and have us arrange a replacement.
      </p>

      <h2>4. Non-Returnable / Non-Refundable Items</h2>
      <ul>
        <li>Custom-cut plywood sheets (once cutting begins)</li>
        <li>Made-to-order items such as custom-size doors or special-order laminates</li>
        <li>Products purchased on special sale or liquidation pricing</li>
        <li>Adhesives, sealants, and consumables that have been opened</li>
        <li>Items damaged by the customer after delivery</li>
      </ul>

      <h2>5. Refund Timelines</h2>
      <ul>
        <li><strong>Online payment (Razorpay / UPI / Card / Net Banking):</strong> Refund initiated within 2 business days of approval; credited to the original payment method within 5–7 business days depending on your bank</li>
        <li><strong>Cash on Delivery (COD):</strong> Refund via bank transfer (NEFT/IMPS) within 3–5 business days of approval; you will need to share your bank account details or UPI ID</li>
        <li><strong>Partial refunds</strong> (e.g. one item in a multi-item order): processed in the same timeline as above, for the approved amount only</li>
      </ul>

      <h2>6. Bank / UPI Refund Details</h2>
      <p>For COD refunds, please share the following when you contact us:</p>
      <ul>
        <li>Account holder name</li>
        <li>Bank name, account number, and IFSC code — OR — UPI ID</li>
        <li>Mobile number linked to the account</li>
      </ul>
      <p>We do not collect this information proactively over phone or WhatsApp. Never share your OTP, CVV, or full card number with anyone claiming to be from our team — we will never ask for these.</p>

      <h2>7. GST Invoice &amp; Refund</h2>
      <p>
        For B2B customers with GST invoices, the refund will be accompanied by a credit note as per applicable GST regulations. Please retain your original tax invoice for reference.
      </p>

      <h2>8. Contact for Refund Claims</h2>
      <p>
        <strong>{CONTACT.businessName}</strong><br />
        GST No: {CONTACT.gst}<br />
        📍 {CONTACT.address}<br />
        📞 <a href={`tel:${CONTACT.phoneRaw}`}>{CONTACT.phone}</a><br />
        ✉️ <a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a><br />
        ⏰ {CONTACT.hours}
      </p>
      <p>Related: <a href="/cancellation-policy">Cancellation Policy</a> · <a href="/shipping-returns">Shipping &amp; Returns</a> · <a href="/payment-policy">Payment Policy</a></p>
    </LegalPageLayout>
  );
}