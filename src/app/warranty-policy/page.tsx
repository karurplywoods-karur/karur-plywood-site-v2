import { Metadata } from 'next';
import LegalPageLayout from '@/components/LegalPageLayout';
import { CONTACT } from '@/lib/contact';

export const metadata: Metadata = {
  title: 'Warranty Policy',
  description: 'Manufacturer warranty information for CenturyPly, Greenlam, Hettich, Ebco, Hafele and other brands sold by Karur Plywood & Company.',
  alternates: { canonical: `${CONTACT.siteUrl}/warranty-policy` },
};

const BRANDS = [
  { name: 'CenturyPly', warranty: 'Up to 50 years (product-dependent) on select BWP/BWR plywood; documented on the product panel and warranty card included in packaging.' },
  { name: 'Greenlam Laminates', warranty: '5 years against manufacturing defects under normal use conditions; claim via Greenlam\'s authorized service channel.' },
  { name: 'Hettich', warranty: 'Lifetime warranty on select hinges and drawer systems under normal residential use; subject to Hettich India\'s warranty terms.' },
  { name: 'Ebco', warranty: 'Warranty varies by product category (typically 1â€“3 years); refer to the warranty card supplied with hardware fittings.' },
  { name: 'Hafele', warranty: 'Product-specific warranty (1â€“5 years); refer to the warranty documentation included with your purchase.' },
  { name: 'Asis / Other hardware', warranty: 'Manufacturer warranty as documented on packaging; typically 1 year against manufacturing defects.' },
];

export default function WarrantyPolicyPage() {
  return (
    <LegalPageLayout title="Warranty Policy" updated="July 1, 2026">
      <p>
        {CONTACT.businessName} is an authorized dealer of leading plywood, laminate, and hardware brands. All warranty obligations rest with the respective manufacturers, not with us as the dealer. We facilitate warranty claims on your behalf where possible.
      </p>

      <h2>1. Manufacturer Warranties by Brand</h2>
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 16, fontSize: 14 }}>
        <thead>
          <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
            <th style={{ textAlign: 'left', padding: '8px 12px 8px 0', color: '#0B2447', fontWeight: 700 }}>Brand</th>
            <th style={{ textAlign: 'left', padding: '8px 0', color: '#0B2447', fontWeight: 700 }}>Warranty Coverage</th>
          </tr>
        </thead>
        <tbody>
          {BRANDS.map((b, i) => (
            <tr key={i} style={{ borderBottom: '1px solid #f0f0f0' }}>
              <td style={{ padding: '10px 12px 10px 0', fontWeight: 600, color: '#1a1a1a', verticalAlign: 'top', whiteSpace: 'nowrap' }}>{b.name}</td>
              <td style={{ padding: '10px 0', color: '#444', lineHeight: 1.6 }}>{b.warranty}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p style={{ fontSize: 13, color: '#666' }}>
        Warranty periods and terms are set by the manufacturer and are subject to change. Always check the warranty card included in your product packaging for the exact terms applicable to your purchase.
      </p>

      <h2>2. How to Make a Warranty Claim</h2>
      <ul>
        <li>Retain your <strong>purchase invoice</strong> (GST bill) â€” this is required for all warranty claims</li>
        <li>Retain the <strong>original warranty card</strong> or registration confirmation from the manufacturer if one is provided</li>
        <li>Contact us via <a href={`https://wa.me/${CONTACT.wa}`} target="_blank" rel="noopener">WhatsApp</a> or <a href={`tel:${CONTACT.phoneRaw}`}>{CONTACT.phone}</a> with your invoice number, product details, and a description/photos of the defect</li>
        <li>We will assist in coordinating with the manufacturer's authorized service team in your area</li>
        <li>For certain brands (especially hardware like Hettich, Hafele, Ebco), you may be directed to the manufacturer's service center directly for faster resolution</li>
      </ul>

      <h2>3. What Is Covered</h2>
      <ul>
        <li>Manufacturing defects present at the time of purchase</li>
        <li>Structural failures under normal use conditions as specified by the manufacturer</li>
        <li>Delamination of plywood panels under conditions covered by the product grade (e.g. BWP/Marine grade covers boiling water resistance)</li>
        <li>Hardware mechanism failures (hinges, drawer channels, locks) under normal residential or commercial use</li>
      </ul>

      <h2>4. What Is Not Covered</h2>
      <ul>
        <li>Damage caused by improper installation, cutting, drilling, or handling</li>
        <li>Damage from exposure to conditions beyond the product's rated specification (e.g. using MR-grade plywood in a permanently wet area)</li>
        <li>Normal wear and tear, scratches, dents, or surface staining</li>
        <li>Natural wood characteristics: grain variation, knots, mineral streaks â€” these are not defects</li>
        <li>Color variation in laminates over time due to UV exposure or cleaning chemicals</li>
        <li>Damage caused by pests (termites, borers) after delivery â€” use appropriate treated/protection products</li>
        <li>Products modified or repaired by unauthorized persons</li>
      </ul>

      <h2>5. Our Role as Dealer</h2>
      <p>
        As an authorized dealer, we do not independently offer extended warranties or guarantee manufacturer warranty outcomes. Our role is to facilitate the claim process and support you in getting a resolution from the manufacturer. In cases of clear transit damage or incorrect supply, our <a href="/refund-policy">Refund Policy</a> applies instead.
      </p>

      <h2>6. Contact Us</h2>
      <p>
        <strong>{CONTACT.businessName}</strong><br />
        GST No: {CONTACT.gst}<br />
        ðŸ“ {CONTACT.address}<br />
        ðŸ“ž <a href={`tel:${CONTACT.phoneRaw}`}>{CONTACT.phone}</a><br />
        âœ‰ï¸ <a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a><br />
        â° {CONTACT.hours}
      </p>
    </LegalPageLayout>
  );
}
