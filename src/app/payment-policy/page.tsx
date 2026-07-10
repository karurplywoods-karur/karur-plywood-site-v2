import { Metadata } from 'next';
import LegalPageLayout from '@/components/LegalPageLayout';
import { CONTACT } from '@/lib/contact';

export const metadata: Metadata = {
  title: 'Payment Policy',
  description: 'Accepted payment methods, GST invoicing, advance payment for custom orders, and payment verification at Karur Plywood & Company.',
  alternates: { canonical: `${CONTACT.siteUrl}/payment-policy` },
};

export default function PaymentPolicyPage() {
  return (
    <LegalPageLayout title="Payment Policy" updated="July 1, 2026">
      <p>
        This Payment Policy explains how payments work at {CONTACT.businessName} — accepted methods, GST invoicing, advance requirements for custom orders, and what to do if a payment issue arises.
      </p>

      <h2>1. Accepted Payment Methods</h2>
      <ul>
        <li>
          <strong>Cash on Delivery (COD)</strong> — Pay the delivery person at the time of delivery. Available for standard orders up to ₹25,000. For higher-value COD orders, contact us to arrange in advance.
        </li>
        <li>
          <strong>UPI</strong> — Pay instantly via Google Pay, PhonePe, Paytm, BHIM, or any UPI app. Scan the QR code or use our UPI ID provided at checkout.
        </li>
        <li>
          <strong>Debit / Credit Card</strong> — All major Visa, Mastercard, and RuPay cards accepted through our secure payment gateway (Razorpay).
        </li>
        <li>
          <strong>Net Banking</strong> — All major Indian banks supported through Razorpay.
        </li>
        <li>
          <strong>EMI</strong> — EMI options available on select credit cards for orders above ₹5,000, subject to card issuer eligibility.
        </li>
        <li>
          <strong>Bank Transfer (NEFT / RTGS / IMPS)</strong> — For large or bulk orders (above ₹50,000), bank transfer is available. Account details are shared on your proforma invoice.
        </li>
      </ul>

      <h2>2. Payment Gateway — Razorpay</h2>
      <p>
        Online payments are processed through <strong>Razorpay</strong>, a PCI DSS-compliant payment gateway. We do not store your card number, CVV, or net banking credentials — all payment data is handled entirely by Razorpay&apos;s secure servers.
      </p>
      <ul>
        <li>All transactions are encrypted using TLS (HTTPS)</li>
        <li>2-factor authentication (OTP) is required for most card and net banking transactions</li>
        <li>Razorpay is regulated and licensed under the Reserve Bank of India (RBI) as a Payment Aggregator</li>
      </ul>

      <h2>3. GST Invoice</h2>
      <p>
        A GST-compliant tax invoice is generated for every order. Your invoice will include:
      </p>
      <ul>
        <li>Our GSTIN: <strong>{CONTACT.gst}</strong></li>
        <li>Your GSTIN (if provided at checkout — mandatory for B2B / ITC claims)</li>
        <li>HSN codes for all products supplied</li>
        <li>Applicable GST rate and amount (CGST + SGST for Tamil Nadu customers; IGST for inter-state)</li>
        <li>Full product description, quantity, rate, and total</li>
      </ul>
      <p>
        To ensure your invoice carries your company&apos;s GSTIN, provide it during checkout or contact us before your order is confirmed. We cannot issue a revised GST invoice after 30 days of the invoice date.
      </p>

      <h2>4. Advance Payment for Custom Orders</h2>
      <ul>
        <li><strong>Custom-cut plywood:</strong> 100% payment required before cutting begins</li>
        <li><strong>Made-to-order products</strong> (special-size doors, custom laminates, sourced-to-spec items): 50% advance at order confirmation; balance before or at delivery</li>
        <li><strong>Large project orders</strong> (above ₹1,00,000): Terms mutually agreed upon at quotation stage — typically 40% advance, 60% before delivery</li>
      </ul>
      <p>Advance payments are non-refundable if the order is cancelled after production or procurement has commenced. See our <a href="/cancellation-policy">Cancellation Policy</a> for details.</p>

      <h2>5. Payment Verification</h2>
      <p>
        For online payments, your order is confirmed automatically once payment is verified by Razorpay — you will receive a confirmation via WhatsApp and email. In rare cases of payment gateway delay:
      </p>
      <ul>
        <li>If your account was debited but you did not receive an order confirmation within 30 minutes, contact us with your payment reference / UTR number</li>
        <li>We will verify and confirm or initiate a refund within 1 business day</li>
        <li>Do not make a second payment before hearing from us — duplicate payments will be refunded in full</li>
      </ul>

      <h2>6. Fraud Prevention</h2>
      <ul>
        <li>We will <strong>never</strong> ask you to share your OTP, CVV, PIN, or full card number over phone, WhatsApp, or email</li>
        <li>Do not share payment screenshots with anyone claiming to be from our team on unofficial channels</li>
        <li>All payment links sent by us will point to <code>karurplywood.co.in</code> or <code>rzp.io</code> (Razorpay) — verify the URL before entering payment details</li>
        <li>If you suspect fraud, contact your bank immediately and call us on <a href={`tel:${CONTACT.phoneRaw}`}>{CONTACT.phone}</a></li>
      </ul>

      <h2>7. Failed Transactions</h2>
      <p>
        If a payment fails but your bank account is debited, the amount is typically auto-reversed by your bank within 5–7 business days. If the reversal does not happen, contact us with your bank statement and transaction reference — we will coordinate with Razorpay for resolution.
      </p>

      <h2>8. Contact for Payment Issues</h2>
      <p>
        <strong>{CONTACT.businessName}</strong><br />
        GST No: {CONTACT.gst}<br />
        📍 {CONTACT.address}<br />
        📞 <a href={`tel:${CONTACT.phoneRaw}`}>{CONTACT.phone}</a><br />
        ✉️ <a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a><br />
        ⏰ {CONTACT.hours}
      </p>
      <p>Related: <a href="/refund-policy">Refund Policy</a> · <a href="/cancellation-policy">Cancellation Policy</a> · <a href="/terms-and-conditions">Terms &amp; Conditions</a></p>
    </LegalPageLayout>
  );
}