// src/lib/contact.ts
// ─── CHANGE YOUR REAL DETAILS HERE ───────────────────
// All pages read from this one file automatically.
export const CONTACT = {
  phone:        process.env.NEXT_PUBLIC_PHONE      || '+91 99999 99999',
  phoneRaw:     process.env.NEXT_PUBLIC_PHONE_RAW  || '919999999999',
  wa:           process.env.NEXT_PUBLIC_WA_NUMBER  || '919999999999',
  email:        process.env.NEXT_PUBLIC_EMAIL      || 'info@karurplywood.com',
  address:      process.env.NEXT_PUBLIC_ADDRESS    || 'Main Road, Karur, Tamil Nadu – 639 001',
  addressShort: 'Karur, Tamil Nadu',
  hours:        'Mon – Sat: 9:00 AM – 7:00 PM',
  siteUrl:      'https://karurplywood.com',
  googleReviewUrl: 'https://g.page/r/YOUR_GOOGLE_REVIEW_LINK/review',
} as const;
