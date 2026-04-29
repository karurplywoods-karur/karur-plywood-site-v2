# Karur Plywood — Next Features & Website Reach Strategy

## TOP 5 FEATURES TO BUILD NEXT

### 1. Product Price List PDF (High ROI)
A downloadable, auto-generated PDF price list with your logo, current prices and a "Valid for 30 days" disclaimer. Customers share it with family/carpenters. Each download fires a GA4 event.
- Pages: /price-list (download page)
- Tech: react-pdf or puppeteer on Vercel
- Reach impact: HIGH — contractors forward PDFs to clients

### 2. Sitemap.xml + Robots.txt (Free SEO boost)
Auto-generated sitemap covering all pages including /areas/[city], /blog/[slug], /carpenters, /architects/[slug]. Submit to Google Search Console to index all pages faster.
- Tech: next-sitemap package, one config file
- Reach impact: HIGH — indexes your hyper-local pages within days instead of months

### 3. WhatsApp Broadcast Integration
Instead of manually broadcasting, add a simple admin panel feature: compose a message + choose customer segment (Karur customers, Trichy customers, contractors) and send bulk WhatsApp via Interakt or Wati API.
- Tech: Interakt or Wati API (₹2,000-5,000/month)
- Reach impact: VERY HIGH — re-engage past customers automatically

### 4. Stock / Price Update Notifications
Let customers subscribe (name + phone + category) to be notified when new plywood stock arrives or prices change. Send via WhatsApp template message.
- Tech: Supabase subscriptions table + cron job
- Reach impact: HIGH — bring back lost customers on restock

### 5. Google Reviews Auto-Request
After a WhatsApp enquiry is marked "Converted" in admin, automatically send a WhatsApp message 3 days later: "Thank you for your purchase! Can you leave us a Google review?" with your review link.
- Tech: Scheduled Supabase Edge Function
- Reach impact: HIGH — more Google reviews = higher Maps ranking in Karur

---

## WEBSITE REACH IMPROVEMENTS

### Google / SEO
1. Add Google Search Console — verify your domain, submit sitemap, monitor which pages rank
2. Your /areas/trichy etc pages will rank in 4-8 weeks once submitted and indexed
3. Add "Google Rating" schema to homepage — shows star rating in search results
4. Write 2 blog posts per month minimum — target keywords like "best plywood for kitchen Karur", "BWR vs MR plywood Tamil Nadu"

### WhatsApp Marketing (biggest impact for your business)
1. Save every customer number in WhatsApp Business with labels (Karur, Trichy, Contractor, Homeowner)
2. Share /areas/trichy link when messaging Trichy customers — they'll share it with their contacts
3. Share /bom-quote link with every carpenter you know — becomes a tool they use regularly
4. Share /carpenters link with homeowners — they come to your site to find trusted carpenters

### Google Business Profile (free, powerful)
1. Add all 6 cities as Service Areas in your Google Business Profile
2. Post weekly photos of new stock arrivals — Google ranks active profiles higher
3. Add /bom-quote link in your Business Profile website section
4. Respond to every Google review within 24 hours — even one-line replies improve ranking

### Social Media Content (low effort, high reach)
Easy content ideas that take 5 minutes each:
- "New stock arrived" photo with WhatsApp link
- Before/after of a carpenter's project using your materials
- "Did you know?" plywood tips (reuse blog content)
- Price comparison: "BWR vs MR — which saves you money?" (link to blog post)

### Carpenter Directory (you already have this)
- Tell every carpenter who buys from you: "We'll list you on our website for free"
- They'll share their profile link with homeowners → homeowners visit your site
- Homeowners buy materials from you
- This is a free referral loop

### Architect Partnership (you already have this)
- Add "Materials supplied by Karur Plywood" in project descriptions
- When an architect shares their portfolio, your name travels with it
- Add "Get these materials" CTA buttons on every project — links to WhatsApp

---

## QUICK WINS THIS WEEK

| Action | Time | Impact |
|--------|------|--------|
| Add NEXT_PUBLIC_GA_ID to Vercel env | 2 min | Starts tracking all visitors |
| Run supabase-carpenters.sql | 2 min | Enables directory |
| Run supabase-portfolios.sql | 2 min | Enables architect portfolio |
| Submit sitemap to Google Search Console | 10 min | Indexes all pages faster |
| Add 5 carpenter contacts to directory | 30 min | Drives organic traffic |
| Share /areas/trichy on your Trichy customer broadcast | 2 min | Hyper-local reach |
