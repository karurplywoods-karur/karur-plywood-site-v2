// src/app/layout.tsx
import type { Metadata } from 'next';
import '../styles/globals.css';
import Navbar from '@/components/Navbar';
import WhatsAppWidget from '@/components/WhatsAppWidget';
import Footer from '@/components/Footer';
import { LocalBusinessSchema } from '@/components/JsonLd';
import GoogleAnalytics from '@/components/GoogleAnalytics';

const SITE_URL = 'https://karurplywood.com';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Karur Plywood & Company | Best Plywood Dealer in Karur, Tamil Nadu',
    template: '%s | Karur Plywood & Company',
  },
  description: "Karur's most trusted wholesale & retail plywood shop. Premium plywood, doors, laminates & hardware. Get instant WhatsApp quote. 25+ years of trust.",
  keywords: ['plywood shop Karur','best plywood dealer Karur','doors laminates Karur','hardware shop Karur','wholesale plywood Tamil Nadu','plywood price Karur','CenturyPly dealer Karur'],
  authors: [{ name: 'Karur Plywood and Company' }],
  robots: { index: true, follow: true },
  openGraph: {
    title: 'Karur Plywood & Company | Best Plywood Dealer in Karur',
    description: "Karur's most trusted wholesale & retail plywood, doors, laminates & hardware store. 25+ years of trust.",
    type: 'website', locale: 'en_IN', url: SITE_URL,
    siteName: 'Karur Plywood and Company',
  },
  twitter: { card: 'summary_large_image', title: 'Karur Plywood & Company' },
  alternates: { canonical: SITE_URL },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* GA4 is in <head> so it fires on EVERY page including admin */}
        <GoogleAnalytics />
        <LocalBusinessSchema />
      </head>
      <body className="grain">
        <Navbar />
        <main>{children}</main>
        <Footer />
        <WhatsAppWidget />
      </body>
    </html>
  );
}
