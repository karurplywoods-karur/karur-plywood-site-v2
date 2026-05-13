// src/lib/contact.ts
// ─── REAL BUSINESS DETAILS ────────────────────────────────────────────────────
// All pages read from this one file. Edit here once, reflects everywhere.
export const CONTACT = {
  phone:        process.env.NEXT_PUBLIC_PHONE      || '+91 91596 66538',
  phoneRaw:     process.env.NEXT_PUBLIC_PHONE_RAW  || '919156666538',
  wa:           process.env.NEXT_PUBLIC_WA_NUMBER  || '919159666538',
  email:        process.env.NEXT_PUBLIC_EMAIL      || 'karurplywoods@gmail.com',
  address:      process.env.NEXT_PUBLIC_ADDRESS    || 'Covai Main Road, Reddipalayam, Karur, Tamil Nadu – 639 008',
  addressShort: 'Karur, Tamil Nadu',
  hours:        'Mon – Sat: 9:30 AM – 7:30 PM',
  siteUrl:      'https://karurplywood.co.in',
  googleReviewUrl: 'https://g.page/r/YOUR_GOOGLE_REVIEW_LINK/review',
} as const;
