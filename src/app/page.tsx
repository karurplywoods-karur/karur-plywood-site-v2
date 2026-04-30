"use client";

import Link from "next/link";
import Image from "next/image";

const WA = "919159666538"; // replace

export default function HomePage() {
  return (
    <main className="grain">

      {/* ================= HERO ================= */}
      <section style={{ padding: "140px 0 100px" }}>
        <div style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "0 24px",
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 40,
          alignItems: "center"
        }}>

          {/* LEFT */}
          <div>
            <div className="eyebrow">25+ Years Experience</div>

            <h1 className="s-title">
              Premium Plywood & Laminates
              <br />
              <span style={{ color: "var(--orange)" }}>
                Best Prices in Karur
              </span>
            </h1>

            <p className="s-desc">
              Century, Greenply, Kitply & top brands. Trusted by contractors.
            </p>

            <div style={{ display: "flex", gap: 14, marginTop: 26 }}>
              <a href={`https://wa.me/${WA}`} className="btn-p">
                Get Price
              </a>

              <Link href="/products" className="btn-s">
                View Products
              </Link>
            </div>
          </div>

          {/* RIGHT IMAGE */}
          <div style={{ position: "relative", height: 420 }}>
            <Image
              src="/hero-plywood.jpg"
              alt="Plywood Sheets"
              fill
              style={{ objectFit: "cover", borderRadius: 12 }}
            />
          </div>

        </div>
      </section>

      {/* ================= TRUST ================= */}
      <section style={{ padding: "40px 0", borderTop: "1px solid var(--border)" }}>
        <div style={{ maxWidth: 1200, margin: "auto", padding: "0 24px" }}>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px,1fr))",
            gap: 20
          }}>
            {["25+ Years", "Top Brands", "Fast Delivery", "Best Price"].map((t) => (
              <div key={t} style={{
                padding: 14,
                border: "1px solid var(--border)",
                background: "var(--surface)"
              }}>
                {t}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= CATEGORIES (WITH IMAGES) ================= */}
      <section style={{ padding: "100px 0" }}>
        <div style={{ maxWidth: 1200, margin: "auto", padding: "0 24px" }}>

          <div className="eyebrow">Products</div>
          <h2 className="s-title">Explore Categories</h2>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(250px,1fr))",
            gap: 24,
            marginTop: 40
          }}>

            {[
              { name: "Plywood", img: "/cat-plywood.jpg" },
              { name: "Laminates", img: "/cat-laminate.jpg" },
              { name: "Hardware", img: "/cat-hardware.jpg" }
            ].map((item) => (
              <div key={item.name} className="pc-card">

                <div style={{ position: "relative", height: 180 }}>
                  <Image
                    src={item.img}
                    alt={item.name}
                    fill
                    style={{ objectFit: "cover" }}
                  />
                </div>

                <div className="pc-body">
                  <h3 className="pc-name">{item.name}</h3>
                  <p className="pc-desc">Explore range</p>
                </div>

              </div>
            ))}

          </div>
        </div>
      </section>

      {/* ================= PRODUCT GRID ================= */}
      <section style={{ padding: "100px 0", borderTop: "1px solid var(--border)" }}>
        <div style={{ maxWidth: 1200, margin: "auto", padding: "0 24px" }}>

          <div className="eyebrow">Popular Products</div>
          <h2 className="s-title">Best Selling</h2>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(250px,1fr))",
            gap: 24,
            marginTop: 40
          }}>

            {[1,2,3,4].map((i) => (
              <div key={i} className="pc-card">

                <div style={{ position: "relative", height: 180 }}>
                  <Image
                    src="/product.jpg"
                    alt="product"
                    fill
                    style={{ objectFit: "cover" }}
                  />
                </div>

                <div className="pc-body">
                  <h3 className="pc-name">Century Plywood</h3>
                  <p className="pc-desc">710 Grade | Waterproof</p>

                  <div className="pc-price-row">
                    <span className="pc-price">₹95</span>
                    <span className="pc-unit">/sq.ft</span>
                  </div>

                  <a href={`https://wa.me/${WA}`} className="pc-wa-btn">
                    WhatsApp
                  </a>
                </div>

              </div>
            ))}

          </div>
        </div>
      </section>

      {/* ================= TWO MODES ================= */}
      <section style={{ padding: "100px 0" }}>
        <div style={{ maxWidth: 1200, margin: "auto", padding: "0 24px" }}>

          <h2 className="s-title">How can we help?</h2>

          <div style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 24,
            marginTop: 40
          }}>

            <div className="pc-card">
              <div className="pc-body">
                <h3 className="pc-name">House Construction</h3>
                <p className="pc-desc">Full project support</p>
                <a href={`https://wa.me/${WA}`} className="pc-add-btn">
                  Start Project
                </a>
              </div>
            </div>

            <div className="pc-card">
              <div className="pc-body">
                <h3 className="pc-name">Quick Order</h3>
                <p className="pc-desc">Instant pricing</p>
                <a href={`https://wa.me/${WA}`} className="pc-wa-btn">
                  WhatsApp Now
                </a>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ================= REVIEWS ================= */}
      <section style={{ padding: "100px 0" }}>
        <div style={{ maxWidth: 1200, margin: "auto", padding: "0 24px" }}>

          <h2 className="s-title">Customer Reviews</h2>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px,1fr))",
            gap: 24,
            marginTop: 40
          }}>
            {["Best price!", "Fast delivery", "Quality products"].map((t, i) => (
              <div key={i} className="pc-card">
                <div className="pc-body">
                  <p className="pc-desc">“{t}”</p>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ================= FINAL CTA ================= */}
      <section style={{ padding: "120px 0", textAlign: "center" }}>
        <h2 className="s-title">Get Price Instantly</h2>

        <a
          href={`https://wa.me/${WA}`}
          className="btn-p"
          style={{ marginTop: 20 }}
        >
          Chat on WhatsApp
        </a>
      </section>

    </main>
  );
}
