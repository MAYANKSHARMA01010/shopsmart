import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "404 - Page Not Found | ShopSmart",
  description: "The page you are looking for does not exist.",
};

export default function NotFound() {
  return (
    <div className="container" style={{ minHeight: "75vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "var(--space-12) var(--space-4)" }}>
      <div
        className="profile-section-card"
        style={{
          maxWidth: "560px",
          width: "100%",
          padding: "var(--space-10) var(--space-8)",
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "var(--space-4)",
        }}
      >
        {/* 404 Big Display */}
        <div
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(5rem, 12vw, 6.5rem)",
            fontWeight: 800,
            lineHeight: 1,
            color: "var(--color-primary)",
            letterSpacing: "-0.03em",
          }}
        >
          404
        </div>

        {/* Title */}
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: "1.5rem", fontWeight: 700, margin: 0, color: "var(--color-text-primary)" }}>
          Page Lost in the Marketplace
        </h1>

        {/* Subtitle */}
        <p style={{ color: "var(--color-text-secondary)", fontSize: "0.95rem", lineHeight: 1.6, margin: 0, maxWidth: "420px" }}>
          The product, collection, or page you were looking for might have been moved, renamed, or is temporarily unavailable.
        </p>

        {/* Action buttons */}
        <div style={{ display: "flex", gap: "var(--space-3)", width: "100%", marginTop: "var(--space-2)" }}>
          <Link href="/" className="btn btn-primary" style={{ flex: 1, padding: "12px", textAlign: "center" }}>
            ← Return to Storefront
          </Link>
          <Link href="/products" className="btn btn-secondary" style={{ flex: 1, padding: "12px", textAlign: "center" }}>
            Browse All Products
          </Link>
        </div>

        {/* Quick Links */}
        <div style={{ marginTop: "var(--space-4)", paddingTop: "var(--space-4)", borderTop: "1px solid var(--color-border)", width: "100%" }}>
          <span style={{ fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--color-text-muted)", display: "block", marginBottom: "var(--space-2)" }}>
            Quick Links
          </span>
          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "var(--space-3)", fontSize: "0.85rem" }}>
            <Link href="/products?category=Electronics" style={{ color: "var(--color-primary)", textDecoration: "none", fontWeight: 500 }}>
              Electronics
            </Link>
            <span style={{ color: "var(--color-border)" }}>•</span>
            <Link href="/products?category=Home" style={{ color: "var(--color-primary)", textDecoration: "none", fontWeight: 500 }}>
              Home & Living
            </Link>
            <span style={{ color: "var(--color-border)" }}>•</span>
            <Link href="/products?category=Fashion" style={{ color: "var(--color-primary)", textDecoration: "none", fontWeight: 500 }}>
              Fashion
            </Link>
            <span style={{ color: "var(--color-border)" }}>•</span>
            <Link href="/contact" style={{ color: "var(--color-primary)", textDecoration: "none", fontWeight: 500 }}>
              Customer Support
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
