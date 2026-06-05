// src/lib/contact.ts
// Central business details. Keep phone, hours, and links in sync from here.
export const CONTACT = {
  phone: process.env.NEXT_PUBLIC_PHONE || '+91 91596 66538',
  phoneRaw: process.env.NEXT_PUBLIC_PHONE_RAW || '919159666538',
  wa: process.env.NEXT_PUBLIC_WA_NUMBER || '919159666538',
  email: process.env.NEXT_PUBLIC_EMAIL || 'karurplywoods@gmail.com',
  address: process.env.NEXT_PUBLIC_ADDRESS || 'Covai Main Road, Reddipalayam, Karur, Tamil Nadu - 639 008',
  addressShort: 'Karur, Tamil Nadu',
  hours: 'Mon - Sat: 9:30 AM - 7:30 PM',
  hoursShort: 'Mon - Sat · 9:30 AM - 7:30 PM',
  sundayHours: 'Sunday: Closed',
  siteUrl: 'https://karurplywood.co.in',
  googleReviewUrl: 'https://g.page/r/YOUR_GOOGLE_REVIEW_LINK/review',
  social: {
    facebook: 'https://www.facebook.com/karurplywood',
    instagram: 'https://www.instagram.com/karurplywood',
    youtube: 'https://www.youtube.com/@karurplywood',
  },
} as const;
