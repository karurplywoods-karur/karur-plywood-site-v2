export const metadata = {
  title: "Karur Plywood & Company — Launching Soon",
  description:
    "Karur Plywood & Company's new website is launching soon. Check back on 23 August.",
  robots: { index: false, follow: false },
};

export default function ComingSoonPage() {
  const waNumber = process.env.NEXT_PUBLIC_WA_NUMBER || "";
  const phone = process.env.NEXT_PUBLIC_PHONE || "";

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        padding: "24px",
        background:
          "linear-gradient(180deg, #1c1410 0%, #2b1e14 55%, #3a2a1a 100%)",
        color: "#f5ede1",
        fontFamily:
          "'Segoe UI', system-ui, -apple-system, sans-serif",
      }}
    >
      <div
        style={{
          fontSize: "13px",
          letterSpacing: "3px",
          textTransform: "uppercase",
          color: "#d8a45e",
          marginBottom: "18px",
        }}
      >
        Karur Plywood &amp; Company
      </div>

      <h1
        style={{
          fontSize: "clamp(28px, 5vw, 48px)",
          fontWeight: 700,
          margin: "0 0 16px",
          lineHeight: 1.2,
        }}
      >
        Our new website is
        <br />
        launching soon
      </h1>

      <p
        style={{
          fontSize: "17px",
          color: "#d9cdbd",
          maxWidth: "480px",
          margin: "0 0 28px",
          lineHeight: 1.6,
        }}
      >
        We're putting the finishing touches on our new online store for
        plywood, doors, laminates, and building materials. We'll be live on{" "}
        <strong style={{ color: "#f5ede1" }}>23 August</strong>.
      </p>

      {(phone || waNumber) && (
        <div
          style={{
            display: "flex",
            gap: "12px",
            flexWrap: "wrap",
            justifyContent: "center",
          }}
        >
          {phone && (
            <a
              href={`tel:${phone.replace(/\s+/g, "")}`}
              style={{
                padding: "12px 22px",
                borderRadius: "999px",
                border: "1px solid #d8a45e",
                color: "#f5ede1",
                textDecoration: "none",
                fontSize: "14px",
              }}
            >
              Call {phone}
            </a>
          )}
          {waNumber && (
            <a
              href={`https://wa.me/${waNumber}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                padding: "12px 22px",
                borderRadius: "999px",
                background: "#d8a45e",
                color: "#1c1410",
                textDecoration: "none",
                fontSize: "14px",
                fontWeight: 600,
              }}
            >
              WhatsApp Us
            </a>
          )}
        </div>
      )}

      <div
        style={{
          marginTop: "48px",
          fontSize: "12px",
          color: "#9a8b78",
        }}
      >
        Karur, Tamil Nadu
      </div>
    </main>
  );
}
