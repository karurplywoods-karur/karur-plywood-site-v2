// src/app/layout.tsx
import type { Metadata } from 'next';
import '../styles/globals.css';
import { CartProvider } from '@/lib/CartContext';
import Navbar from '@/components/Navbar';
import WhatsAppWidget from '@/components/WhatsAppWidget';
import Footer from '@/components/Footer';
import { LocalBusinessSchema } from '@/components/JsonLd';
import GoogleAnalytics from '@/components/GoogleAnalytics';

const SITE_URL = 'https://karurplywood.co.in';

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
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/favicon.svg', type: 'image/svg+xml' },
    ],
    apple: '/apple-icon.png',
  },
  manifest: '/manifest.webmanifest',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <GoogleAnalytics />
        <LocalBusinessSchema />
      </head>
      <body className="grain">
        <CartProvider>
          <Navbar />
          <main>{children}</main>
          <Footer />
          <WhatsAppWidget />
        </CartProvider>
      </body>
    </html>
  );
}
