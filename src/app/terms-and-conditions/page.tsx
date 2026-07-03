import { Metadata } from 'next';
import LegalPageLayout from '@/components/LegalPageLayout';
import { CONTACT } from '@/lib/contact';

export const metadata: Metadata = {
  title: 'Terms & Conditions',
  description: 'Terms and conditions for using the Karur Plywood & Company website and placing orders for plywood, laminates, doors, and hardware.',
  alternates: { canonical: `${CONTACT.siteUrl}/terms-and-conditions` },
};

export default function TermsPage() {
  return (
    <LegalPageLayout title="Terms &amp; Conditions" updated="July 1, 2026">
      <p>
        These Terms &amp; Conditions govern your use of {CONTACT.siteUrl} and any purchase made from {CONTACT.businessName}. By using the site or placing an order, you agree to be bound by these Terms.
      </p>

      <h2>1. About Us</h2>
      <p>
        {CONTACT.businessName} is a wholesale and retail supplier of plywood, laminates, doors, and hardware.<br />
        📍 {CONTACT.address}<br />
        GST No: {CONTACT.gst}
      </p>

      <h2>2. Products &amp; Pricing</h2>
      <ul>
        <li>Product images are for reference; actual colour, grain, and finish may vary due to natural material variation and screen differences — see our <a href="/disclaimer">Disclaimer</a></li>
        <li>Prices are subject to change without prior notice due to raw material costs, manufacturer pricing, or GST revisions</li>
        <li>Stock availability is updated regularly but is not guaranteed at the time of order — we will notify you promptly if an item becomes unavailable</li>
        <li>For bulk or project orders, request a formal quotation for binding price validity</li>
      </ul>

      <h2>3. Orders &amp; Order Confirmation</h2>
      <ul>
        <li>Placing an order constitutes an offer to purchase; we reserve the right to accept or decline any order at our discretion</li>
        <li>Order confirmation is sent via email and/or WhatsApp once the order is received and reviewed by our team</li>
        <li>For COD orders, payment is collected at the time of delivery. For online payments, amounts are charged securely via Razorpay at checkout</li>
        <li>In the event of a pricing error on the website, we reserve the right to cancel the affected order and will notify you with a corrected quote or full refund</li>
      </ul>

      <h2>4. Delivery</h2>
      <ul>
        <li>Delivery timelines are estimates and may vary due to order size, location, vehicle availability, and material stock</li>
        <li>It is the customer&apos;s responsibility to ensure someone is available to receive the delivery at the address provided</li>
        <li>Delivery charges, if any, are confirmed before the order is finalised</li>
      </ul>
      <p>See our <a href="/shipping-returns">Shipping &amp; Returns Policy</a> for full delivery details including areas served and timelines.</p>

      <h2>5. Cancellations, Returns &amp; Refunds</h2>
      <p>
        See our dedicated policies: <a href="/cancellation-policy">Cancellation Policy</a>, <a href="/shipping-returns">Shipping &amp; Returns Policy</a>, and <a href="/refund-policy">Refund Policy</a>.
      </p>

      <h2>6. Payments</h2>
      <p>
        Online payments are processed via Razorpay, a PCI DSS-compliant payment gateway. We do not store your card credentials. See our <a href="/payment-policy">Payment Policy</a> for accepted methods, advance payment requirements for custom orders, and fraud prevention guidance.
      </p>

      <h2>7. Warranty</h2>
      <p>All manufacturer warranties are as per the respective brand&apos;s terms. See our <a href="/warranty-policy">Warranty Policy</a> for brand-specific coverage and claim procedures.</p>

      <h2>8. User Conduct</h2>
      <p>You agree not to misuse the site, including attempting unauthorised access to our systems, submitting false information, or using the site for any unlawful purpose.</p>

      <h2>9. Intellectual Property</h2>
      <p>All content on this site — including text, images, logos, and design — is the property of {CONTACT.businessName} unless otherwise stated, and may not be reproduced without written permission.</p>

      <h2>10. Limitation of Liability</h2>
      <p>
        {CONTACT.businessName} shall not be liable for indirect, incidental, or consequential damages arising from use of our products or this site, to the maximum extent permitted by applicable Indian law.
      </p>

      <h2>11. Governing Law &amp; Jurisdiction</h2>
      <p>
        These Terms are governed by the laws of India. Any disputes arising from these Terms or your use of the site shall be subject to the exclusive jurisdiction of the courts in Karur, Tamil Nadu.
      </p>

      <h2>12. Changes to These Terms</h2>
      <p>We may revise these Terms from time to time. Continued use of the site after changes are posted constitutes acceptance of the updated Terms.</p>

      <h2>13. Contact Us</h2>
      <p>
        <strong>{CONTACT.businessName}</strong><br />
        📍 {CONTACT.address}<br />
        📞 <a href={`tel:${CONTACT.phoneRaw}`}>{CONTACT.phone}</a><br />
        ✉️ <a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a><br />
        ⏰ {CONTACT.hours}
      </p>
    </LegalPageLayout>
  );
}
