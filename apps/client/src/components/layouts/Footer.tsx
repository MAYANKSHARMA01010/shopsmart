"use client";

import Link from "next/link";
import { Logo } from "@/components/common/Logo";

function IconShieldCheck() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <polyline points="9 12 11 14 15 10" />
    </svg>
  );
}

function IconChevronUp() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="18 15 12 9 6 15" />
    </svg>
  );
}

export function Footer() {
  const scrollToTop = () => {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <footer style={{ background: "var(--color-surface-sunken)", borderTop: "1px solid var(--color-border)", marginTop: "auto" }}>
      {/* 1. Amazon-Style "Back to Top" Full-Width Strip */}
      <button
        type="button"
        onClick={scrollToTop}
        style={{
          width: "100%",
          background: "var(--color-surface-elevated)",
          color: "var(--color-text-secondary)",
          border: "none",
          borderBottom: "1px solid var(--color-border)",
          padding: "12px 0",
          fontSize: "0.85rem",
          fontWeight: 600,
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "6px",
          transition: "background 0.15s, color 0.15s",
        }}
        className="footer-back-to-top"
      >
        <IconChevronUp />
        <span>Back to top</span>
      </button>

      {/* 2. Main Multi-Column Links Section (Amazon & Flipkart 4-Column Mega Grid) */}
      <div className="container" style={{ padding: "var(--space-12) var(--space-4) var(--space-8)" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "var(--space-8)",
            paddingBottom: "var(--space-10)",
            borderBottom: "1px solid var(--color-border)",
          }}
          className="footer-mega-grid"
        >
          {/* Col 1: Get to Know Us */}
          <div>
            <h4 style={{ fontSize: "0.825rem", fontWeight: 700, letterSpacing: "0.06em", color: "var(--color-text-primary)", textTransform: "uppercase", marginBottom: "14px" }}>
              Get to Know Us
            </h4>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "9px", fontSize: "0.875rem" }}>
              <li>
                <Link href="/" style={{ color: "var(--color-text-secondary)", textDecoration: "none" }} className="footer-link">
                  About ShopSmart
                </Link>
              </li>
              <li>
                <Link href="/products" style={{ color: "var(--color-text-secondary)", textDecoration: "none" }} className="footer-link">
                  Careers & Culture
                </Link>
              </li>
              <li>
                <Link href="/products" style={{ color: "var(--color-text-secondary)", textDecoration: "none" }} className="footer-link">
                  Press Releases
                </Link>
              </li>
              <li>
                <Link href="/products" style={{ color: "var(--color-text-secondary)", textDecoration: "none" }} className="footer-link">
                  ShopSmart Sustainability
                </Link>
              </li>
              <li>
                <Link href="/contact" style={{ color: "var(--color-text-secondary)", textDecoration: "none" }} className="footer-link">
                  Verified Merchant Program
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 2: Connect with Us */}
          <div>
            <h4 style={{ fontSize: "0.825rem", fontWeight: 700, letterSpacing: "0.06em", color: "var(--color-text-primary)", textTransform: "uppercase", marginBottom: "14px" }}>
              Connect with Us
            </h4>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "9px", fontSize: "0.875rem" }}>
              <li>
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" style={{ color: "var(--color-text-secondary)", textDecoration: "none" }} className="footer-link">
                  Instagram
                </a>
              </li>
              <li>
                <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" style={{ color: "var(--color-text-secondary)", textDecoration: "none" }} className="footer-link">
                  Twitter / X
                </a>
              </li>
              <li>
                <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" style={{ color: "var(--color-text-secondary)", textDecoration: "none" }} className="footer-link">
                  YouTube
                </a>
              </li>
              <li>
                <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" style={{ color: "var(--color-text-secondary)", textDecoration: "none" }} className="footer-link">
                  LinkedIn
                </a>
              </li>
              <li>
                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" style={{ color: "var(--color-text-secondary)", textDecoration: "none" }} className="footer-link">
                  Facebook
                </a>
              </li>
            </ul>
          </div>

          {/* Col 3: Make Money with Us */}
          <div>
            <h4 style={{ fontSize: "0.825rem", fontWeight: 700, letterSpacing: "0.06em", color: "var(--color-text-primary)", textTransform: "uppercase", marginBottom: "14px" }}>
              Make Money with Us
            </h4>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "9px", fontSize: "0.875rem" }}>
              <li>
                <Link href="/dashboard" style={{ color: "var(--color-text-secondary)", textDecoration: "none" }} className="footer-link">
                  Sell on ShopSmart
                </Link>
              </li>
              <li>
                <Link href="/dashboard/products" style={{ color: "var(--color-text-secondary)", textDecoration: "none" }} className="footer-link">
                  Vendor Partner Portal
                </Link>
              </li>
              <li>
                <Link href="/products" style={{ color: "var(--color-text-secondary)", textDecoration: "none" }} className="footer-link">
                  ShopSmart Global Selling
                </Link>
              </li>
              <li>
                <Link href="/register" style={{ color: "var(--color-text-secondary)", textDecoration: "none" }} className="footer-link">
                  Become an Affiliate
                </Link>
              </li>
              <li>
                <Link href="/products" style={{ color: "var(--color-text-secondary)", textDecoration: "none" }} className="footer-link">
                  Fulfillment by ShopSmart
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Let Us Help You */}
          <div>
            <h4 style={{ fontSize: "0.825rem", fontWeight: 700, letterSpacing: "0.06em", color: "var(--color-text-primary)", textTransform: "uppercase", marginBottom: "14px" }}>
              Let Us Help You
            </h4>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "9px", fontSize: "0.875rem" }}>
              <li>
                <Link href="/profile" style={{ color: "var(--color-text-secondary)", textDecoration: "none" }} className="footer-link">
                  Your Account
                </Link>
              </li>
              <li>
                <Link href="/profile/orders" style={{ color: "var(--color-text-secondary)", textDecoration: "none" }} className="footer-link">
                  Returns & Replacements
                </Link>
              </li>
              <li>
                <Link href="/profile/security" style={{ color: "var(--color-text-secondary)", textDecoration: "none" }} className="footer-link">
                  100% Purchase Protection
                </Link>
              </li>
              <li>
                <Link href="/contact" style={{ color: "var(--color-text-secondary)", textDecoration: "none" }} className="footer-link">
                  Razorpay Payment & FAQ
                </Link>
              </li>
              <li>
                <Link href="/contact" style={{ color: "var(--color-text-secondary)", textDecoration: "none" }} className="footer-link">
                  Help & Customer Support
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* 3. Amazon / Flipkart Middle Brand & Region Strip */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "16px", padding: "var(--space-6) 0", borderBottom: "1px solid var(--color-border)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <Logo size="md" href="/" />
            <span style={{ fontSize: "0.825rem", color: "var(--color-text-muted)" }}>
              Premium Indian E-Commerce Engine
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
            {/* Region Pill */}
            <div style={{ display: "flex", alignItems: "center", gap: "6px", padding: "6px 12px", borderRadius: "var(--radius-md)", border: "1px solid var(--color-border)", background: "var(--color-surface)", fontSize: "0.8rem", color: "var(--color-text-primary)", fontWeight: 600 }}>
              <span>🇮🇳</span>
              <span>India · English (INR ₹)</span>
            </div>

            {/* Razorpay Badge */}
            <div style={{ display: "flex", alignItems: "center", gap: "6px", padding: "6px 12px", borderRadius: "var(--radius-md)", border: "1px solid var(--color-primary-border)", background: "var(--color-primary-surface)", fontSize: "0.8rem", color: "var(--color-primary)", fontWeight: 600 }}>
              <IconShieldCheck />
              <span>Razorpay 256-Bit SSL Encrypted</span>
            </div>
          </div>
        </div>

        {/* 4. Bottom Legal & Copyright Bar */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px", paddingTop: "var(--space-6)", fontSize: "0.775rem", color: "var(--color-text-muted)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
            <Link href="/terms" style={{ color: "inherit", textDecoration: "none" }} className="footer-link">
              Conditions of Use & Sale
            </Link>
            <Link href="/privacy" style={{ color: "inherit", textDecoration: "none" }} className="footer-link">
              Privacy Notice
            </Link>
            <Link href="/cookies-policy" style={{ color: "inherit", textDecoration: "none" }} className="footer-link">
              Cookie Policy
            </Link>
            <Link href="/contact" style={{ color: "inherit", textDecoration: "none" }} className="footer-link">
              Interest-Based Ads
            </Link>
          </div>

          <div>
            &copy; {new Date().getFullYear()} ShopSmart India Private Limited. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}
