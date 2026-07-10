// src/app/manifest.ts — Web App Manifest for browser install prompt
import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Karur Plywood & Company',
    short_name: 'KP Store',
    description: 'Buy premium plywood, laminates, doors & hardware online. Order on WhatsApp.',
    start_url: '/',
    display: 'standalone',
    background_color: '#070F1F',
    theme_color: '#0B2447',
    icons: [
      {
        src: '/icon-64.png',
        sizes: '64x64',
        type: 'image/png',
      },
      {
        src: '/icon-128.png',
        sizes: '128x128',
        type: 'image/png',
      },
      {
        src: '/icon-256.png',
        sizes: '256x256',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  };
}
