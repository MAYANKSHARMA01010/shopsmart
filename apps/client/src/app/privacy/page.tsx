import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy | ShopSmart",
  description: "ShopSmart Privacy Policy regarding data protection and security.",
};

export default function PrivacyPage() {
  return (
    <div className="container" style={{ paddingTop: "var(--space-8)", paddingBottom: "var(--space-16)", maxWidth: "860px" }}>
      <article className="profile-section-card" style={{ padding: "var(--space-8)" }}>
        {/* Header */}
        <div style={{ marginBottom: "var(--space-6)", paddingBottom: "var(--space-4)", borderBottom: "1px solid var(--color-border)" }}>
          <span style={{ fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.08em", color: "var(--color-primary)", textTransform: "uppercase" }}>
            DATA PROTECTION
          </span>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1.75rem, 3.5vw, 2.5rem)", fontWeight: 700, margin: "var(--space-2) 0 var(--space-1)", color: "var(--color-text-primary)" }}>
            Privacy Policy
          </h1>
          <p style={{ color: "var(--color-text-muted)", fontSize: "0.875rem", margin: 0 }}>
            Last updated: August 2026 • Compliant with DPDP Act & Global Privacy Standards.
          </p>
        </div>

        {/* Content sections */}
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)", lineHeight: 1.8, color: "var(--color-text-secondary)", fontSize: "0.95rem" }}>
          <section>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.25rem", color: "var(--color-primary)", margin: "0 0 var(--space-2)" }}>
              1. Information We Collect
            </h2>
            <p style={{ margin: 0 }}>
              We collect information you provide directly when creating an account, browsing our curated catalog, or placing an order. This includes your full name, email address, phone number, and delivery addresses.
            </p>
          </section>

          <div style={{ height: "1px", background: "var(--color-border)" }} />

          <section>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.25rem", color: "var(--color-primary)", margin: "0 0 var(--space-2)" }}>
              2. How We Use Your Information
            </h2>
            <p style={{ margin: 0 }}>
              Your information is utilized solely to process transactions, deliver physical orders, communicate order updates, prevent fraudulent transactions, and enhance your shopping experience. We never sell your personal data to third parties.
            </p>
          </section>

          <div style={{ height: "1px", background: "var(--color-border)" }} />

          <section>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.25rem", color: "var(--color-primary)", margin: "0 0 var(--space-2)" }}>
              3. Payment Security & Encryption
            </h2>
            <p style={{ margin: 0 }}>
              All financial payments are securely handled by Razorpay with end-to-end 256-bit encryption. ShopSmart never stores raw credit/debit card numbers or CVVs on our application databases.
            </p>
          </section>

          <div style={{ height: "1px", background: "var(--color-border)" }} />

          <section>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.25rem", color: "var(--color-primary)", margin: "0 0 var(--space-2)" }}>
              4. Cookies & Tracking
            </h2>
            <p style={{ margin: 0 }}>
              We use strictly necessary session cookies and token-based authentication (JWT) to maintain your login session and cart items across page refreshes.
            </p>
          </section>

          <div style={{ height: "1px", background: "var(--color-border)" }} />

          <section>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.25rem", color: "var(--color-primary)", margin: "0 0 var(--space-2)" }}>
              5. Your Rights & Contact
            </h2>
            <p style={{ margin: 0 }}>
              You have the right to review, update, or request the deletion of your personal data at any time via your{" "}
              <Link href="/profile" style={{ color: "var(--color-primary)", fontWeight: 600 }}>
                Account Settings
              </Link>{" "}
              or by reaching our support team at{" "}
              <Link href="/contact" style={{ color: "var(--color-primary)", fontWeight: 600 }}>
                support@shopsmart.in
              </Link>.
            </p>
          </section>
        </div>
      </article>
    </div>
  );
}
