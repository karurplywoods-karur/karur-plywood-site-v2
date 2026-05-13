# 🪵 Karur Plywood & Company — Website (Supabase + Vercel)

Complete Next.js 14 website with Supabase database, WhatsApp integration, Admin Dashboard, and local SEO.

---

## ✅ Tech Stack

| Layer | Technology | Cost |
|---|---|---|
| Frontend | Next.js 14 + TypeScript | Free |
| Database | Supabase (PostgreSQL) | Free (500MB) |
| Hosting | Vercel | Free |
| Domain | GoDaddy | ~₹800/year |

---

## 🚀 COMPLETE SETUP GUIDE

### STEP 1 — Set Up Supabase (5 minutes)

1. Go to https://supabase.com → Sign up free
2. Click "New Project"
   - Name: karur-plywood
   - Region: Southeast Asia (Singapore) — closest to India
3. Wait ~2 minutes for project to be created
4. Go to SQL Editor (left sidebar) → New Query
5. Open supabase-setup.sql from this project → Copy all → Paste → Run
6. You should see: "Success. No rows returned"

Get your API keys:
- Supabase → Settings (gear icon) → API
- Copy: Project URL, anon public key, service_role key

---

### STEP 2 — Configure .env.local

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

NEXT_PUBLIC_WA_NUMBER=91XXXXXXXXXX
NEXT_PUBLIC_PHONE=+91 XXXXX XXXXX
NEXT_PUBLIC_EMAIL=info@karurplywood.com
NEXT_PUBLIC_ADDRESS=Your Shop Address, Karur, Tamil Nadu

NEXT_PUBLIC_GMAPS_EMBED_URL=

ADMIN_PASSWORD=choose-a-strong-password
JWT_SECRET=any-random-string-minimum-32-characters
```

How to get Google Maps Embed URL:
1. maps.google.com → search your shop
2. Share → Embed a map → copy the src="..." URL only

---

### STEP 3 — Run Locally

```bash
npm install
npm run dev
```

Open http://localhost:3000
Admin: http://localhost:3000/admin

---

### STEP 4 — Deploy to Vercel

1. Push code to GitHub: git add . && git commit -m "Supabase setup" && git push
2. In Vercel dashboard → Settings → Environment Variables
3. Add ALL variables from .env.local
4. Redeploy → site is live

---

### STEP 5 — Connect GoDaddy Domain

1. Vercel → Project Settings → Domains → Add Domain → karurplywood.com
2. Vercel shows DNS records (A record + CNAME)
3. GoDaddy → My Domains → DNS → Add those records
4. Wait 10-30 minutes → done

GoDaddy DNS values from Vercel are usually:
  A record:    @ → 76.76.21.21
  CNAME:       www → cname.vercel-dns.com

---

## 📁 Key Files

- supabase-setup.sql   → Run in Supabase SQL editor to create tables
- .env.local           → All your config (never commit to GitHub)
- src/lib/db.ts        → Supabase client
- src/app/admin/       → Admin login + dashboard

---

## 🌐 URLs

/ → Home
/products → Products + Gallery
/about → About
/blog → Blog
/location → Location + Map
/contact → Contact
/admin → Admin Login
/admin/dashboard → Admin Dashboard

---

## ❓ Troubleshooting

Build fails on Vercel?
→ Check all env variables are added in Vercel dashboard

Forms not working?
→ Check Supabase URL and keys are correct
→ Re-run supabase-setup.sql in Supabase SQL editor

Admin login not working?
→ Check ADMIN_PASSWORD and JWT_SECRET are set in Vercel

Google Maps not showing?
→ Make sure NEXT_PUBLIC_GMAPS_EMBED_URL is filled in
