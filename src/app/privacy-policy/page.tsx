import { Metadata } from 'next';
import LegalPageLayout from '@/components/LegalPageLayout';
import { CONTACT } from '@/lib/contact';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'How Karur Plywood & Company collects, uses, and protects your personal information when you use our website or place an order.',
  alternates: { canonical: `${CONTACT.siteUrl}/privacy-policy` },
};

export default function PrivacyPolicyPage() {
  return (
    <LegalPageLayout title="Privacy Policy" updated="July 1, 2026">
      <p>
        {CONTACT.businessName} (&ldquo;we&rdquo;, &ldquo;us&rdquo;, &ldquo;our&rdquo;) operates {CONTACT.siteUrl}. This Privacy Policy explains what information we collect, how we use it, and your choices. By using the site or placing an order, you agree to these practices.
      </p>

      <h2>1. Information We Collect</h2>
      <ul>
        <li>Name, phone number, and email address when you register, order, or submit an enquiry</li>
        <li>Delivery address and pincode for order fulfilment</li>
        <li>Order details â€” products, quantities, and purchase history</li>
        <li>Messages sent via the contact form, WhatsApp, or quote requests</li>
        <li>Technical data (device type, browser, pages visited, approximate city-level location) collected automatically via cookies and analytics tools</li>
      </ul>

      <h2>2. How We Use Your Information</h2>
      <ul>
        <li>To process and deliver your orders and communicate about order status (call, SMS, WhatsApp, email)</li>
        <li>To respond to enquiries and provide quotes</li>
        <li>To improve our website, product catalog, and service</li>
        <li>To send order confirmations and, where consented, promotional updates</li>
        <li>To comply with legal and tax obligations, including GST invoicing and record-keeping</li>
      </ul>

      <h2>3. Cookies &amp; Analytics</h2>
      <p>
        We use Google Analytics (GA4) to understand how visitors use our site, and Google Ads for advertising measurement. These services set cookies on your device. See our <a href="/cookie-policy">Cookie Policy</a> for full details. You can disable cookies in your browser settings, though some features may not work correctly without them.
      </p>

      <h2>4. Sharing of Information</h2>
      <p>We do not sell your personal information. We may share it with:</p>
      <ul>
        <li>Delivery and logistics partners, solely to fulfil your order</li>
        <li>Payment processors (Razorpay), to process payments securely â€” they never share your data with us beyond transaction confirmation</li>
        <li>Service providers who help us operate the site (hosting, email delivery), bound by confidentiality obligations</li>
        <li>Government or regulatory authorities, where required by law</li>
      </ul>

      <h2>5. Data Security</h2>
      <p>
        We take reasonable technical and organisational measures to protect your personal information against unauthorised access, alteration, or loss. No method of transmission over the internet is completely secure; we cannot guarantee absolute security.
      </p>

      <h2>6. Data Retention</h2>
      <p>
        We retain your information as long as necessary to provide our services, comply with legal obligations (including tax and GST record-keeping requirements under Indian law), resolve disputes, and enforce our agreements.
      </p>

      <h2>7. Your Rights</h2>
      <p>
        You may request access to, correction of, or deletion of your personal information by contacting us using the details below. We will respond within a reasonable timeframe.
      </p>

      <h2>8. Children&apos;s Privacy</h2>
      <p>Our site and services are intended for individuals aged 18 and above. We do not knowingly collect information from children.</p>

      <h2>9. Changes to This Policy</h2>
      <p>We may update this Privacy Policy from time to time. The &ldquo;Last updated&rdquo; date at the top reflects the most recent revision. Continued use of the site after changes are posted constitutes acceptance of the updated policy.</p>

      <h2>10. Contact Us</h2>
      <p>
        For any questions about this Privacy Policy:<br /><br />
        <strong>{CONTACT.businessName}</strong><br />
        GST No: {CONTACT.gst}<br />
        ðŸ“ {CONTACT.address}<br />
        ðŸ“ž <a href={`tel:${CONTACT.phoneRaw}`}>{CONTACT.phone}</a><br />
        âœ‰ï¸ <a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a><br />
        â° {CONTACT.hours}
      </p>
      <p>Related: <a href="/cookie-policy">Cookie Policy</a> Â· <a href="/terms-and-conditions">Terms &amp; Conditions</a> Â· <a href="/disclaimer">Disclaimer</a></p>
    </LegalPageLayout>
  );
}

