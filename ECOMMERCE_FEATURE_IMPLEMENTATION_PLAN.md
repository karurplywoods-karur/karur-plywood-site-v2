# Karur Plywood Ecommerce V2 Implementation Plan

This plan upgrades the current Next.js/Supabase site into a variant-aware ecommerce plus lead-generation platform while preserving the existing `/products`, `/products/[id]`, quick-order, checkout, blog, account, and admin flows.

## Current State

- Next.js App Router project with Supabase.
- Products are stored as flat `products` rows.
- Cart is client-side localStorage in `src/lib/CartContext.tsx`.
- Product cards already support add-to-cart, but cart items only store product plus quantity.
- Product detail, listing, quick-order, checkout, blog, admin, and order APIs already exist.
- SEO is mostly static metadata plus JSON-LD helpers.

## Target Architecture

### Database

New migration: `supabase-ecommerce-v2.sql`

Adds:

- `brands`
- `product_variants`
- `wishlist_items`
- `product_reviews`
- `delivery_zones`
- `project_gallery`
- `project_gallery_products`
- `blog_product_mentions`
- `comparison_sets`

Enhances `products` with:

- `brand_id`
- `series`
- `grade`
- `search_keywords`
- `application_tags`
- `comparison_attributes`
- `seo_title`
- `seo_description`

Key rule: keep the existing `products` table as the parent product table. Do not delete current rows until migration is validated.

## Product Variant System

### Data Model

Parent product:

- `CenturyPly Club Prime BWP Plywood`

Variants:

- `6mm`, `9mm`, `12mm`, `16mm`, `19mm`, `25mm`

Variant fields:

- `thickness`
- `size`
- `grade`
- `sku`
- `price`
- `mrp`
- `stock_quantity`
- `stock_status`
- `attributes`
- `seo_title`
- `seo_description`

### API

Add:

- `GET /api/products/[id]/variants`
- `POST /api/products/[id]/variants`
- `PATCH /api/products/[id]/variants/[variantId]`
- `DELETE /api/products/[id]/variants/[variantId]`

Update:

- `GET /api/products`
- `GET /api/products/[id]`

Both should return default variant and variant count.

### Components

Add:

- `src/components/product/VariantSelector.tsx`
- `src/components/product/ProductPrice.tsx`
- `src/components/product/ProductStock.tsx`
- `src/components/product/ProductSchema.tsx`

Update:

- `src/components/ProductCard.tsx`
- `src/components/ProductAddToCart.tsx`
- `src/app/products/[id]/page.tsx`

Selected variant must update:

- page title area
- price/MRP
- stock
- quote/cart item
- WhatsApp text
- structured data

## Quote Cart

Rename conceptually from cart to quote cart, but keep compatibility with existing cart localStorage first.

New cart item shape:

```ts
interface QuoteCartItem {
  product: Product;
  variant?: ProductVariant;
  quantity: number;
}
```

Migration path:

- Read old `karur-plywood-cart`.
- Convert old items to quote items with no variant.
- Save to `karur-plywood-quote-cart-v2`.

Update:

- `src/lib/CartContext.tsx`
- `src/components/CartDrawer.tsx`
- `src/app/checkout/page.tsx`
- `src/app/api/checkout/route.ts`
- `order_items` snapshot fields should include `variant_id`, `sku`, `variant_label`.

## Wishlist

### Storage

Guest:

- localStorage key `karur-plywood-wishlist-v1`

Logged-in:

- Supabase table `wishlist_items`

### API

Add:

- `GET /api/wishlist`
- `POST /api/wishlist`
- `DELETE /api/wishlist`

### Routes and Components

Add:

- `src/app/wishlist/page.tsx`
- `src/components/wishlist/WishlistButton.tsx`
- `src/components/wishlist/WishlistCard.tsx`
- `src/lib/WishlistContext.tsx`

Wishlist cards show:

- image
- product name
- brand
- selected variant
- add to quote

## Recently Viewed Products

Guest-first localStorage:

- key `karur-plywood-recently-viewed-v1`
- last 20 product ids plus selected variant id

Add:

- `src/lib/recentlyViewed.ts`
- `src/components/product/RecentlyViewedProducts.tsx`

Display on:

- homepage
- product page
- category/product listing page

Tracking should happen in a tiny client component on product detail:

- `src/components/product/TrackProductView.tsx`

## Smart Search

### API

Add:

- `GET /api/search?q=19mm%20plywood`

Search sources:

- products
- product variants
- categories
- brands

Ranking:

1. exact product/variant match
2. brand match
3. category match
4. keyword/attribute match

Use Postgres `pg_trgm` and indexed fields:

- `products.name`
- `products.search_keywords`
- `product_variants.thickness`
- `brands.name`
- `categories.name`

### UI

Add:

- `src/components/search/SearchBox.tsx`
- `src/components/search/SearchSuggestions.tsx`
- `src/app/search/page.tsx`

Integrate into:

- `Navbar`
- mobile nav

## Advanced Product Filters

URL format:

- `/products/plywood?brand=centuryply&thickness=19mm`

Implementation:

- Add category slug route: `src/app/products/[category]/page.tsx`
- Keep `/products?category=` working via redirect or backward-compatible parsing.
- Build filters from category-specific config.

Add:

- `src/lib/filterConfig.ts`
- `src/components/filters/ProductFilters.tsx`
- `src/components/filters/MobileFilterDrawer.tsx`

Filter groups:

- plywood: brand, thickness, grade, price, availability
- laminates: brand, finish, color, thickness
- hardware: brand, size, type
- adhesives: brand, type, pack size, water resistance

## Reviews

### API

Add:

- `GET /api/products/[id]/reviews`
- `POST /api/products/[id]/reviews`
- `PATCH /api/admin/reviews/[id]`

### UI

Add:

- `src/components/reviews/ProductReviews.tsx`
- `src/components/reviews/ReviewSummary.tsx`
- `src/components/reviews/ReviewForm.tsx`
- `src/components/reviews/RatingStars.tsx`

Schema:

- Product `aggregateRating`
- Review schema for approved reviews only

## Related Products

Add:

- `src/lib/recommendations.ts`

Rules:

- same category
- same brand
- same grade
- close thickness
- max 8 products

Update:

- product detail related section
- related cards use add-to-quote, wishlist, compare

## Blog to Product Linking

Add:

- `src/components/blog/BlogProductCard.tsx`
- `src/components/blog/ProductsMentioned.tsx`
- `src/lib/blogProductMentions.ts`

Approach:

- Store curated links in `blog_product_mentions`.
- Optional auto-detection script can scan post content and suggest product links, but production rendering should use curated DB rows to avoid wrong links.

Blog page behavior:

- Inline product cards near mentions.
- End section: `Products Mentioned In This Article`.
- CTA: `View Product`, `Get Quote`, `Compare`.

## Delivery Coverage Checker

Add:

- `GET /api/delivery/check?city=karur&pincode=639001`
- `src/components/delivery/DeliveryChecker.tsx`

Display on:

- homepage
- product page
- checkout/quote page

Responses:

- delivery available with estimate
- contact logistics support
- WhatsApp CTA

## Project Gallery

Routes:

- `src/app/projects/page.tsx`
- `src/app/projects/[slug]/page.tsx`

Components:

- `ProjectGalleryGrid`
- `ProjectGalleryCard`
- `BeforeAfterSlider`
- `ProjectProductTags`

Products used should link to product/variant pages and support add-to-quote.

## Product Comparison

### Client State

Add:

- `src/lib/CompareContext.tsx`
- localStorage key `karur-plywood-compare-v1`
- max 4 products

### Routes

Add:

- `/compare`
- `/compare/[slug]`

URL examples:

- `/compare?products=club-prime,green-club-plus,sharon-gold`
- `/compare/century-club-prime-vs-green-club-plus`

### Components

Add:

- `src/components/compare/CompareButton.tsx`
- `src/components/compare/CompareBar.tsx`
- `src/components/compare/CompareTable.tsx`
- `src/components/compare/MobileCompareCarousel.tsx`
- `src/components/compare/RecommendationBadge.tsx`

Dynamic attributes by category:

- plywood: brand, series, thickness, grade, core material, waterproof rating, warranty, size, density, application, price, availability
- laminate: brand, finish, thickness, texture, scratch resistance, heat resistance, application, warranty
- adhesive: brand, type, pack size, water resistance, coverage, drying time, usage

Actions:

- add to quote
- add to wishlist
- view product
- copy link
- print
- export PDF

PDF export can be client-side later. Avoid adding heavy PDF libraries until core comparison works.

## SEO

Centralize domain:

- `src/lib/site.ts`

Add:

```ts
export const SITE_URL = 'https://karurplywood.co.in';
```

Use this for:

- canonical URLs
- OpenGraph `url`
- sitemap
- robots
- JSON-LD

Schema components:

- `ProductSchema`
- `ReviewSchema`
- `AggregateRatingSchema`
- `FAQSchema`
- `BreadcrumbSchema`
- `ComparisonSchema`
- `LocalBusinessSchema`

Product variant SEO:

- Product URL remains stable.
- Variant selection should use query or hash for UX.
- Indexable variant pages can be added later only for high-value variants:
  `/products/centuryply-club-prime/19mm`

## Performance

Rules:

- Server-render product grids.
- Client-render only interactive pieces: wishlist, compare, variant selector, quote cart.
- Lazy-load related/recent/gallery sections.
- Use `next/image`.
- Use compact cards.
- Avoid heavy libraries until needed.
- Virtualize only if product list exceeds 100 visible items.

## Folder Structure

```txt
src/
  app/
    products/
      [category]/page.tsx
      [id]/page.tsx
    wishlist/page.tsx
    compare/page.tsx
    compare/[slug]/page.tsx
    projects/page.tsx
    projects/[slug]/page.tsx
    search/page.tsx
    api/
      search/route.ts
      wishlist/route.ts
      delivery/check/route.ts
      products/[id]/variants/route.ts
      products/[id]/reviews/route.ts
  components/
    product/
    wishlist/
    search/
    filters/
    reviews/
    compare/
    delivery/
    gallery/
    blog/
  lib/
    site.ts
    productTypes.ts
    quoteCart.ts
    recommendations.ts
    filterConfig.ts
    search.ts
    seo.ts
    recentlyViewed.ts
```

## Migration Strategy

### Phase 0: Stabilize Existing Ecommerce

1. Run `supabase_migration_mrp.sql`.
2. Confirm existing product add/edit works.
3. Confirm `/products`, `/products/[id]`, `/quick-order`, `/checkout` still work.

### Phase 1: Schema Foundation

1. Run `supabase-ecommerce-v2.sql`.
2. Add TypeScript types for brands and variants.
3. Add API read support for variants.
4. Do not change UI yet.

### Phase 2: Product Variant Migration

1. Group duplicate thickness products manually by base name.
2. Pick one parent product per product family.
3. Insert thickness rows into `product_variants`.
4. Keep old product rows hidden or mark as migrated only after validation.
5. Add redirects from old product ids if needed.

### Phase 3: Variant UI + Quote Cart

1. Update cart item shape to include variant.
2. Add variant selector to product detail.
3. Add default variant display to product cards.
4. Update checkout/order item snapshot.

### Phase 4: Wishlist + Recently Viewed

1. Add localStorage guest wishlist.
2. Add Supabase sync for logged-in users.
3. Add recently viewed sections.

### Phase 5: Search + Filters

1. Add search API.
2. Add search UI in navbar.
3. Add category filter routes.
4. Keep old `/products?category=` links working.

### Phase 6: Reviews + Recommendations

1. Add reviews API/UI.
2. Add aggregate ratings to product pages.
3. Add recommendation service.

### Phase 7: Blog/Product SEO Integration

1. Add curated blog product mentions.
2. Render inline product cards.
3. Add products mentioned section.

### Phase 8: Delivery + Gallery

1. Add delivery checker to home/product/checkout.
2. Add project gallery routes and admin management.

### Phase 9: Comparison

1. Add compare context and sticky bar.
2. Add `/compare`.
3. Add shareable comparison URLs.
4. Add comparison schema and blog comparison embeds.

## Execution Rule

Do not attempt all UI features in one deployment. Ship each phase behind backward-compatible data access so current product pages and checkout stay usable throughout migration.
