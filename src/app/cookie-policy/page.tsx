import { Metadata } from 'next';
import LegalPageLayout from '@/components/LegalPageLayout';
import { CONTACT } from '@/lib/contact';

export const metadata: Metadata = {
  title: 'Cookie Policy',
  description: 'How Karur Plywood & Company uses cookies from Google Analytics, Google Ads, and other services — and how to manage your preferences.',
  alternates: { canonical: `${CONTACT.siteUrl}/cookie-policy` },
};

export default function CookiePolicyPage() {
  return (
    <LegalPageLayout title="Cookie Policy" updated="July 1, 2026">
      <p>
        This Cookie Policy explains what cookies are, which ones {CONTACT.businessName} uses on {CONTACT.siteUrl}, why we use them, and how you can control them. This policy should be read alongside our <a href="/privacy-policy">Privacy Policy</a>.
      </p>

      <h2>1. What Are Cookies?</h2>
      <p>
        Cookies are small text files that a website stores on your device (computer, phone, or tablet) when you visit. They are widely used to make websites work more efficiently, to remember your preferences, and to provide website owners with analytics information about how visitors use their site.
      </p>

      <h2>2. Cookies We Use</h2>

      <h2>2a. Strictly Necessary Cookies</h2>
      <p>These cookies are essential for the website to function and cannot be disabled.</p>
      <ul>
        <li><strong>Session / auth cookies</strong> — Used to keep you logged in to your account during your visit. No personal data is stored beyond what is needed to identify your session securely.</li>
        <li><strong>Cart cookies</strong> — Remember your shopping cart contents as you browse.</li>
      </ul>

      <h2>2b. Analytics Cookies — Google Analytics (GA4)</h2>
      <p>
        We use Google Analytics 4 to understand how visitors interact with our website — which pages are visited most, how long people stay, and how they navigate. This helps us improve content and user experience.
      </p>
      <ul>
        <li><strong>Cookies set:</strong> <code>_ga</code>, <code>_ga_XXXXXXXX</code></li>
        <li><strong>Duration:</strong> Up to 2 years</li>
        <li><strong>Data collected:</strong> Page views, session duration, device type, approximate location (city-level), referring source</li>
        <li><strong>Provider:</strong> Google Ireland Ltd — <a href="https://policies.google.com/privacy" target="_blank" rel="noopener">Google Privacy Policy</a></li>
        <li><strong>IP anonymization:</strong> Enabled; full IP addresses are not stored</li>
      </ul>

      <h2>2c. Advertising Cookies — Google Ads</h2>
      <p>
        We run advertising on Google Search and Display networks. Google Ads sets cookies to measure whether users who clicked our ads went on to complete a purchase (conversion tracking) and to show our ads to people who previously visited our site (remarketing).
      </p>
      <ul>
        <li><strong>Cookies set:</strong> <code>_gcl_au</code>, <code>_gcl_aw</code>, <code>IDE</code>, <code>test_cookie</code></li>
        <li><strong>Duration:</strong> Up to 13 months</li>
        <li><strong>Provider:</strong> Google Ireland Ltd — <a href="https://policies.google.com/technologies/ads" target="_blank" rel="noopener">Google Ads &amp; Privacy</a></li>
        <li>You can opt out of personalized Google advertising at <a href="https://adssettings.google.com" target="_blank" rel="noopener">adssettings.google.com</a></li>
      </ul>

      <h2>2d. Behaviour Analytics — Microsoft Clarity</h2>
      <p>
        We may use Microsoft Clarity to record anonymized session replays and heatmaps to understand how users interact with specific pages. This helps us identify usability issues and improve the website.
      </p>
      <ul>
        <li><strong>Cookies set:</strong> <code>_clck</code>, <code>_clsk</code>, <code>CLID</code></li>
        <li><strong>Duration:</strong> Up to 1 year</li>
        <li><strong>Data collected:</strong> Mouse movements, clicks, scroll behaviour (no passwords or sensitive fields are recorded)</li>
        <li><strong>Provider:</strong> Microsoft Corporation — <a href="https://privacy.microsoft.com/privacystatement" target="_blank" rel="noopener">Microsoft Privacy Statement</a></li>
      </ul>

      <h2>2e. Social Media / Meta Pixel</h2>
      <p>
        If we run advertising on Facebook or Instagram in the future, Meta Pixel may be used to measure ad performance and build audiences. At this time, Meta Pixel is <strong>not active</strong> on this site. This policy will be updated if that changes.
      </p>

      <h2>3. Managing Your Cookie Preferences</h2>
      <p>You have several options for controlling cookies:</p>
      <ul>
        <li><strong>Browser settings:</strong> Most browsers allow you to block or delete cookies. See your browser's help section:
          <ul style={{ marginTop: 6 }}>
            <li><a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener">Google Chrome</a></li>
            <li><a href="https://support.mozilla.org/en-US/kb/enhanced-tracking-protection-firefox-desktop" target="_blank" rel="noopener">Mozilla Firefox</a></li>
            <li><a href="https://support.apple.com/en-in/guide/safari/sfri11471/mac" target="_blank" rel="noopener">Apple Safari</a></li>
          </ul>
        </li>
        <li><strong>Google opt-out:</strong> Install the <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener">Google Analytics Opt-out Browser Add-on</a></li>
        <li><strong>Ad personalization:</strong> Manage at <a href="https://adssettings.google.com" target="_blank" rel="noopener">Google Ad Settings</a> or <a href="https://www.youronlinechoices.com" target="_blank" rel="noopener">Your Online Choices</a></li>
      </ul>
      <p>Please note that disabling certain cookies may affect the functionality of our website — for example, your cart or login session may not be saved correctly.</p>

      <h2>4. Changes to This Policy</h2>
      <p>We may update this Cookie Policy when we add or remove tools. The &ldquo;Last updated&rdquo; date at the top of this page reflects the most recent revision.</p>

      <h2>5. Contact Us</h2>
      <p>
        For questions about our use of cookies, contact us at <a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a>.
      </p>
      <p>Related: <a href="/privacy-policy">Privacy Policy</a> · <a href="/terms-and-conditions">Terms &amp; Conditions</a></p>
    </LegalPageLayout>
  );
}