import { Metadata } from 'next';
import LegalPageLayout from '@/components/LegalPageLayout';
import { CONTACT } from '@/lib/contact';

export const metadata: Metadata = {
  title: 'Cancellation Policy',
  description: 'Order cancellation rules for standard, custom-cut, made-to-order, and bulk orders at Karur Plywood & Company.',
  alternates: { canonical: `${CONTACT.siteUrl}/cancellation-policy` },
};

export default function CancellationPolicyPage() {
  return (
    <LegalPageLayout title="Cancellation Policy" updated="July 1, 2026">
      <p>
        This policy covers how and when orders placed with {CONTACT.businessName} can be cancelled. For refund timelines after a cancellation, see our <a href="/refund-policy">Refund Policy</a>.
      </p>

      <h2>1. Cancellation Before Dispatch</h2>
      <p>
        Orders can be cancelled <strong>free of charge</strong> at any time before they are dispatched from our depot. To cancel, contact us as early as possible via phone or WhatsApp with your order number.
      </p>
      <ul>
        <li>If payment was collected online, a full refund will be initiated within 2 business days of cancellation confirmation</li>
        <li>COD orders cancelled before dispatch incur no charge</li>
        <li>You will receive a cancellation confirmation via WhatsApp or email</li>
      </ul>

      <h2>2. Cancellation After Dispatch</h2>
      <p>
        Once an order has been dispatched for delivery, it <strong>cannot be cancelled</strong>. If you no longer want the product, you may refuse delivery at the door â€” the product will be returned to us and we will assess a return/refund per our <a href="/shipping-returns">Shipping &amp; Returns Policy</a>.
      </p>
      <p>Please note that delivery charges, if any, will be deducted from the refund in this case.</p>

      <h2>3. Custom-Cut Plywood</h2>
      <p>
        Custom-cut orders â€” where sheets are cut to specific dimensions as requested â€” <strong>cannot be cancelled once cutting has commenced</strong>. We will always confirm your dimensions with you before beginning work. Once you confirm, the order is binding.
      </p>
      <ul>
        <li>Cancellation requested before cutting begins: fully refunded</li>
        <li>Cancellation requested after cutting begins: not accepted; product will be delivered as ordered</li>
      </ul>

      <h2>4. Made-to-Order Products</h2>
      <p>Made-to-order items include custom-size doors, special-order laminates, and products sourced specifically for your project. These orders:</p>
      <ul>
        <li>Require a <strong>50% advance payment</strong> before production or procurement begins</li>
        <li>Can be cancelled for a <strong>full advance refund</strong> within 24 hours of placing the order, provided production has not begun</li>
        <li>Cannot be cancelled once procurement or production has commenced â€” the advance is forfeited to cover material and sourcing costs</li>
      </ul>

      <h2>5. Bulk Orders</h2>
      <p>Bulk orders (typically above â‚¹50,000 in value) may be subject to specific cancellation terms agreed upon at the time of ordering, which will be stated in your quotation or order confirmation. In general:</p>
      <ul>
        <li>Cancellation more than 48 hours before scheduled delivery: no charge</li>
        <li>Cancellation within 48 hours of scheduled delivery: a restocking charge of up to 10% of the order value may apply</li>
        <li>Cancellation of partially delivered bulk orders: only the undelivered portion is eligible for cancellation</li>
      </ul>

      <h2>6. Cancellation by Us</h2>
      <p>We reserve the right to cancel any order in the following circumstances:</p>
      <ul>
        <li>Product is out of stock or discontinued after order confirmation</li>
        <li>Delivery to the specified location is not feasible</li>
        <li>Payment could not be verified or was declined</li>
        <li>Pricing error on the website</li>
      </ul>
      <p>In all such cases, a full refund will be issued and you will be notified promptly.</p>

      <h2>7. How to Request Cancellation</h2>
      <p>
        Contact us as soon as possible via <a href={`https://wa.me/${CONTACT.wa}`} target="_blank" rel="noopener">WhatsApp</a> or call <a href={`tel:${CONTACT.phoneRaw}`}>{CONTACT.phone}</a> with your order number. Our team is available {CONTACT.hours}.
      </p>
      <p>
        <strong>{CONTACT.businessName}</strong><br />
        ðŸ“ {CONTACT.address}<br />
        âœ‰ï¸ <a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a>
      </p>
      <p>Related: <a href="/refund-policy">Refund Policy</a> Â· <a href="/shipping-returns">Shipping &amp; Returns</a></p>
    </LegalPageLayout>
  );
}
