import { Metadata } from 'next';
import LegalPageLayout from '@/components/LegalPageLayout';
import { CONTACT } from '@/lib/contact';

export const metadata: Metadata = {
  title: 'Disclaimer',
  description: 'Important disclaimers regarding product images, wood grain variation, laminate colours, pricing, stock availability, and product specifications at Karur Plywood & Company.',
  alternates: { canonical: `${CONTACT.siteUrl}/disclaimer` },
};

export default function DisclaimerPage() {
  return (
    <LegalPageLayout title="Disclaimer" updated="July 1, 2026">
      <p>
        Please read this Disclaimer carefully before placing an order or relying on information presented on {CONTACT.siteUrl}. By using this website, you acknowledge and accept the limitations described below.
      </p>

      <h2>1. Product Images</h2>
      <p>
        Product photographs on this website are for <strong>illustrative and reference purposes only</strong>. Actual products may differ from images due to:
      </p>
      <ul>
        <li>Screen calibration differences — colors may appear slightly different on various monitors, phones, and tablets</li>
        <li>Photography lighting and angle variations</li>
        <li>Batch-to-batch variation in manufacturing</li>
        <li>The nature of photographing large sheets in a compressed image format</li>
      </ul>
      <p>We recommend visiting our showroom at {CONTACT.address} to view physical samples before placing large or high-value orders.</p>

      <h2>2. Wood Grain &amp; Natural Variation</h2>
      <p>
        Plywood, veneer-faced panels, and solid wood products are <strong>natural materials</strong>. No two sheets are identical. The following are characteristics of natural and manufactured wood products and are <strong>not considered defects</strong>:
      </p>
      <ul>
        <li>Variation in wood grain pattern, texture, and figure between sheets</li>
        <li>Color tonal differences within the same batch or between batches</li>
        <li>Minor knots, mineral streaks, or pin holes present in the veneer</li>
        <li>Slight variation in thickness tolerance (within manufacturer-specified limits)</li>
      </ul>

      <h2>3. Laminate &amp; Surface Colour Variation</h2>
      <p>
        Laminate and surface finish products (HPL, acrylic, PVC edge banding, etc.) may show:
      </p>
      <ul>
        <li>Color variation between different production batches — if you require color consistency across a project, specify this when ordering and we will supply from the same batch where possible</li>
        <li>Gradual color change over time when exposed to UV light (sunlight) — this is a known characteristic of organic dyes used in laminates, not a manufacturing defect</li>
        <li>Texture feel differences when viewed or touched at different angles (directionality in woodgrain and embossed textures)</li>
      </ul>
      <p>For large projects requiring color-matched quantities, always request a physical sample from us before ordering in bulk.</p>

      <h2>4. Pricing</h2>
      <p>
        All prices displayed on this website are <strong>subject to change without prior notice</strong> due to:
      </p>
      <ul>
        <li>Fluctuations in raw material costs (timber, resin, adhesive, steel)</li>
        <li>Changes in manufacturer pricing or import costs</li>
        <li>GST rate revisions by the Government of India</li>
        <li>Currency fluctuation for imported products</li>
      </ul>
      <p>
        The price applicable to your order is the price confirmed at the time of order confirmation, not the website display price. For bulk or project orders, request a formal quotation for price validity.
      </p>
      <p>
        In the event of a pricing error on the website, we reserve the right to cancel orders placed at the incorrect price and will notify you promptly with a corrected quotation or full refund.
      </p>

      <h2>5. Stock Availability</h2>
      <p>
        Stock levels displayed on the website are updated periodically but may not reflect real-time availability. A product shown as &ldquo;In Stock&rdquo; may become unavailable between the time you view it and the time your order is processed. In such cases, we will contact you to discuss alternatives, an updated delivery timeline, or a refund.
      </p>

      <h2>6. Product Specifications</h2>
      <p>
        Product specifications, grades, dimensions, and features listed on this website are sourced from manufacturer documentation and may change without notice due to:
      </p>
      <ul>
        <li>Manufacturer updates to product formulations or grades</li>
        <li>IS (Indian Standards) revision requiring specification updates</li>
        <li>Discontinuation of specific finishes, sizes, or grades</li>
      </ul>
      <p>We make reasonable efforts to keep product information current but cannot guarantee complete accuracy at all times. For critical specifications (structural, fire-rated, moisture-resistant), always verify with the manufacturer&apos;s current datasheet before use.</p>

      <h2>7. Third-Party Links</h2>
      <p>
        This website may contain links to manufacturer websites and third-party resources. We are not responsible for the content, accuracy, or privacy practices of external websites.
      </p>

      <h2>8. Professional Advice</h2>
      <p>
        Content on this website (blog posts, product descriptions, buying guides) is for general information only and should not be relied upon as a substitute for professional architectural, structural, or interior design advice. Always consult a qualified professional for structural applications.
      </p>

      <h2>9. Contact Us</h2>
      <p>
        If you have questions about a specific product before ordering, we encourage you to contact us directly:<br />
        📞 <a href={`tel:${CONTACT.phoneRaw}`}>{CONTACT.phone}</a>&nbsp;&nbsp;
        💬 <a href={`https://wa.me/${CONTACT.wa}`} target="_blank" rel="noopener">WhatsApp</a>&nbsp;&nbsp;
        ✉️ <a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a>
      </p>
    </LegalPageLayout>
  );
}