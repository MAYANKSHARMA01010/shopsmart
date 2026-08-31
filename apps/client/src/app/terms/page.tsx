import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Service | ShopSmart",
  description: "ShopSmart Terms of Service and customer policies.",
};

export default function TermsPage() {
  return (
    <div className="container" style={{ paddingTop: "var(--space-8)", paddingBottom: "var(--space-16)", maxWidth: "860px" }}>
      <article className="profile-section-card" style={{ padding: "var(--space-8)" }}>
        {/* Header */}
        <div style={{ marginBottom: "var(--space-6)", paddingBottom: "var(--space-4)", borderBottom: "1px solid var(--color-border)" }}>
          <span style={{ fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.08em", color: "var(--color-primary)", textTransform: "uppercase" }}>
            LEGAL & POLICIES
          </span>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1.75rem, 3.5vw, 2.5rem)", fontWeight: 700, margin: "var(--space-2) 0 var(--space-1)", color: "var(--color-text-primary)" }}>
            Terms of Service
          </h1>
          <p style={{ color: "var(--color-text-muted)", fontSize: "0.875rem", margin: 0 }}>
            Last updated: August 2026 • Governed under the Consumer Protection (E-Commerce) Rules, India.
          </p>
        </div>

        {/* Content sections */}
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)", lineHeight: 1.8, color: "var(--color-text-secondary)", fontSize: "0.95rem" }}>
          <section>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.25rem", color: "var(--color-primary)", margin: "0 0 var(--space-2)" }}>
              1. Introduction
            </h2>
            <p style={{ margin: 0 }}>
              Welcome to ShopSmart. By accessing and using our website and services, you agree to comply with Indian e-commerce regulations, Consumer Protection Rules, and the terms set forth in this agreement.
            </p>
          </section>

          <div style={{ height: "1px", background: "var(--color-border)" }} />

          <section>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.25rem", color: "var(--color-primary)", margin: "0 0 var(--space-2)" }}>
              2. User Accounts & Security
            </h2>
            <p style={{ margin: 0 }}>
              Users are responsible for maintaining the confidentiality of their account credentials and password. Each customer is permitted one active personal account. ShopSmart reserves the right to suspend accounts engaged in abusive or fraudulent activities.
            </p>
          </section>

          <div style={{ height: "1px", background: "var(--color-border)" }} />

          <section>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.25rem", color: "var(--color-primary)", margin: "0 0 var(--space-2)" }}>
              3. Payments & Currency
            </h2>
            <p style={{ margin: 0 }}>
              All transactions on ShopSmart are strictly processed in Indian Rupees (₹ INR) exclusively through our authorized payment partner, Razorpay. We do not store sensitive payment card details or CVVs on our servers.
            </p>
          </section>

          <div style={{ height: "1px", background: "var(--color-border)" }} />

          <section>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.25rem", color: "var(--color-primary)", margin: "0 0 var(--space-2)" }}>
              4. Shipping & Delivery
            </h2>
            <p style={{ margin: 0 }}>
              Standard shipping operates across serviceable pin codes in India within 3–5 business days. Free shipping is provided on all orders totaling ₹500 or more.
            </p>
          </section>

          <div style={{ height: "1px", background: "var(--color-border)" }} />

          <section>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.25rem", color: "var(--color-primary)", margin: "0 0 var(--space-2)" }}>
              5. Returns & Cancellations
            </h2>
            <p style={{ margin: 0 }}>
              We offer a hassle-free 7-day return policy on eligible undamaged items. Once inspected, refunds are credited back to the original payment source within 5–7 working days.
            </p>
          </section>

          <div style={{ height: "1px", background: "var(--color-border)" }} />

          <section>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.25rem", color: "var(--color-primary)", margin: "0 0 var(--space-2)" }}>
              6. Data Privacy & DPDP Compliance
            </h2>
            <p style={{ margin: 0 }}>
              We adhere strictly to the Digital Personal Data Protection (DPDP) Act. For details on how we collect and protect your data, please review our{" "}
              <Link href="/privacy" style={{ color: "var(--color-primary)", fontWeight: 600 }}>
                Privacy Policy
              </Link>.
            </p>
          </section>
        </div>
      </article>
    </div>
  );
}
