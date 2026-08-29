import React from "react";
import Link from "next/link";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
  href?: string;
  className?: string;
}

export function Logo({
  size = "md",
  showText = true,
  href = "/",
  className = "",
}: LogoProps) {
  const iconSizes = {
    sm: { box: 28, text: "1.1rem" },
    md: { box: 36, text: "1.3rem" },
    lg: { box: 48, text: "1.65rem" },
  };

  const currentSize = iconSizes[size];

  const logoMark = (
    <div
      className={`shopsmart-logo-mark ${className}`}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: size === "sm" ? "8px" : size === "lg" ? "14px" : "10px",
        textDecoration: "none",
      }}
    >
      {/* SVG Icon Emblem */}
      <svg
        width={currentSize.box}
        height={currentSize.box}
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ flexShrink: 0 }}
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="logo-bg-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1E3A2F" />
            <stop offset="100%" stopColor="#2D6A4F" />
          </linearGradient>
          <linearGradient id="logo-accent-grad" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#D4884A" />
            <stop offset="100%" stopColor="#FE9659" />
          </linearGradient>
        </defs>

        {/* Squircle Badge Container */}
        <rect width="64" height="64" rx="16" fill="url(#logo-bg-grad)" />
        <rect x="2" y="2" width="60" height="60" rx="14" fill="none" stroke="#2D6A4F" strokeWidth="1.5" strokeOpacity="0.6" />

        {/* Shopping Bag Handle */}
        <path
          d="M25 24V19C25 15.13 28.13 12 32 12C35.87 12 39 15.13 39 19V24"
          fill="none"
          stroke="url(#logo-accent-grad)"
          strokeWidth="3.5"
          strokeLinecap="round"
        />

        {/* Bag Outline */}
        <path
          d="M17 24H47L44.5 48.5C44.2 51.5 41.7 53.8 38.7 53.8H25.3C22.3 53.8 19.8 51.5 19.5 48.5L17 24Z"
          fill="#FDFBFA"
          fillOpacity="0.08"
          stroke="#FDFBFA"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />

        {/* S-Monogram Ribbon */}
        <path
          d="M37 28C34 26 28 26.5 27 31C25.8 36.4 38 34.5 37 41C36.2 46.2 29.5 46.5 26 44"
          fill="none"
          stroke="url(#logo-accent-grad)"
          strokeWidth="3.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Sparkle Star */}
        <path
          d="M43 20L44.2 23.2L47.4 24.4L44.2 25.6L43 28.8L41.8 25.6L38.6 24.4L41.8 23.2Z"
          fill="#FE9659"
        />
      </svg>

      {/* Brand Typography Wordmark */}
      {showText && (
        <span
          style={{
            fontFamily: "var(--font-display)",
            fontSize: currentSize.text,
            fontWeight: 700,
            color: "var(--color-text-primary)",
            letterSpacing: "-0.02em",
            lineHeight: 1,
            display: "inline-flex",
            alignItems: "center",
          }}
        >
          <span>Shop</span>
          <span style={{ color: "var(--color-primary)" }}>Smart</span>
        </span>
      )}
    </div>
  );

  if (href) {
    return (
      <Link href={href} aria-label="ShopSmart Home" style={{ textDecoration: "none" }}>
        {logoMark}
      </Link>
    );
  }

  return logoMark;
}
