// src/app/layout.tsx
import type { Metadata } from 'next';
import '../styles/globals.css';
import { CartProvider } from '@/lib/CartContext';
import { WishlistProvider } from '@/lib/WishlistContext';
import Navbar from '@/components/Navbar';
import WhatsAppWidget from '@/components/WhatsAppWidget';
import Footer from '@/components/Footer';
import LocalBusinessSchema from '@/components/LocalBusinessSchema';
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
  // Provide fallback parameters for global pages (Home, About, Cart etc.)
  const defaultArea = {
    name: 'Karur',
    pincode: '639001',
    lat: 10.9601,
    lng: 78.0785,
    slug: 'karur'
  };

  const defaultCategory = {
    display_name: 'Plywood & Hardware',
    slug: 'plywood'
  };

  return (
    <html lang="en">
      <head>
        <GoogleAnalytics />
        <LocalBusinessSchema area={defaultArea} category={defaultCategory} reviews={[]} />
      </head>
      <body className="grain">
        <WishlistProvider>
        <CartProvider>
          <Navbar />
          <main>{children}</main>
          <Footer />
          <WhatsAppWidget />
        </CartProvider>
        </WishlistProvider>
      </body>
    </html>
  );
}