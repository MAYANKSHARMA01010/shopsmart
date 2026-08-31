"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ThemeToggle } from "./ThemeToggle";
import { Logo } from "@/components/common/Logo";
import { useAuth } from "@/features/auth";
import { useWishlistStore } from "@/features/wishlist";
import { useFavoritesStore } from "@/features/favorites";
import { useCart } from "@/features/cart";
import { useEffect, useRef, useState, useTransition, useSyncExternalStore } from "react";




// ─── Icons ────────────────────────────────────────────────────────────────────

function IconLocation() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

function IconSearch() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

function IconHeart() {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}

function IconBookmark() {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
    </svg>
  );
}

function IconCart() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="9" cy="21" r="1" />
      <circle cx="20" cy="21" r="1" />
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
    </svg>
  );
}

function IconMenu() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  );
}

function IconClose() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function IconChevronRight() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}

function IconUser() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function IconPackage() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M16.5 9.4l-9-5.19M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
      <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
      <line x1="12" y1="22.08" x2="12" y2="12"/>
    </svg>
  );
}

function IconLogout() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  );
}

function IconDashboard() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
      <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
    </svg>
  );
}

function IconHeadset() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 18v-6a9 9 0 0 1 18 0v6"/>
      <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/>
    </svg>
  );
}

function NavBadge({ count }: { count: number }) {
  if (count <= 0) return null;
  return (
    <span
      style={{
        position: "absolute",
        top: "-4px",
        right: "-6px",
        background: "var(--color-accent)",
        color: "#FFFFFF",
        fontSize: "0.7rem",
        fontWeight: 700,
        height: "18px",
        minWidth: "18px",
        borderRadius: "999px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "0 4px",
        lineHeight: 1,
      }}
      aria-hidden="true"
    >
      {count > 99 ? "99+" : count}
    </span>
  );
}

// ─── Departments config ────────────────────────────────────────────────────────

const DEPARTMENTS = [
  {
    label: "Electronics",
    href: "/products?category=electronics",
    sub: [
      { label: "Headphones & Audio", href: "/products?category=electronics&search=headphones" },
      { label: "Laptops & Computers", href: "/products?category=electronics&search=laptop" },
      { label: "Cameras & Photography", href: "/products?category=electronics&search=camera" },
      { label: "Keyboards & Accessories", href: "/products?category=electronics&search=keyboard" },
      { label: "Smartwatches", href: "/products?category=electronics&search=watch" },
    ],
  },
  {
    label: "Fashion & Apparel",
    href: "/products?category=clothing",
    sub: [
      { label: "Men's Clothing", href: "/products?category=clothing&search=men" },
      { label: "Women's Clothing", href: "/products?category=clothing&search=women" },
      { label: "Silk & Handlooms", href: "/products?category=clothing&search=silk" },
      { label: "Bags & Accessories", href: "/products?category=clothing&search=bags" },
    ],
  },
  {
    label: "Home & Kitchen",
    href: "/products?category=home-garden",
    sub: [
      { label: "Furniture", href: "/products?category=home-garden&search=furniture" },
      { label: "Decor & Lighting", href: "/products?category=home-garden&search=decor" },
      { label: "Kitchen Essentials", href: "/products?category=home-garden&search=kitchen" },
      { label: "Garden & Outdoor", href: "/products?category=home-garden&search=garden" },
    ],
  },
  {
    label: "Books & Literature",
    href: "/products?category=books",
    sub: [
      { label: "Bestsellers", href: "/products?category=books&sort=best-selling" },
      { label: "Self-Improvement", href: "/products?category=books&search=self" },
      { label: "Fiction & Novels", href: "/products?category=books&search=fiction" },
      { label: "Business & Finance", href: "/products?category=books&search=business" },
    ],
  },
  {
    label: "Sports & Fitness",
    href: "/products?category=sports",
    sub: [
      { label: "Gym Equipment", href: "/products?category=sports&search=gym" },
      { label: "Outdoor Sports", href: "/products?category=sports&search=outdoor" },
      { label: "Activewear", href: "/products?category=sports&search=activewear" },
    ],
  },
  {
    label: "Toys & Games",
    href: "/products?category=toys",
    sub: [
      { label: "Board Games", href: "/products?category=toys&search=board" },
      { label: "Educational Toys", href: "/products?category=toys&search=educational" },
    ],
  },
];

// ─── Hamburger / Mega Menu Drawer ─────────────────────────────────────────────

function HamburgerMenu({
  open,
  onClose,
  user,
  logout,
  mounted,
  favoritesCount,
  wishlistCount,
  cartCount,
  isDashboardUser,
}: {
  open: boolean;
  onClose: () => void;
  user: { name?: string; role?: string } | null;
  logout: () => void;
  mounted: boolean;
  favoritesCount: number;
  wishlistCount: number;
  cartCount: number;
  isDashboardUser: boolean;
}) {
  const [activeIdx, setActiveIdx] = useState<number | null>(null);
  const drawerRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (drawerRef.current && !drawerRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open, onClose]);

  // Lock body scroll when open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        aria-hidden="true"
        style={{
          position: "fixed", inset: 0, zIndex: 200,
          background: "rgba(0,0,0,0.55)",
          backdropFilter: "blur(2px)",
          WebkitBackdropFilter: "blur(2px)",
          animation: "fadeIn 0.18s ease",
        }}
        onClick={onClose}
      />

      {/* Drawer Panel */}
      <div
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-label="Site Navigation Menu"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          bottom: 0,
          width: "360px",
          maxWidth: "92vw",
          zIndex: 201,
          background: "var(--color-surface)",
          boxShadow: "4px 0 32px rgba(0,0,0,0.18)",
          display: "flex",
          flexDirection: "column",
          animation: "slideInLeft 0.22s cubic-bezier(0.22,1,0.36,1)",
          overflowY: "auto",
        }}
      >
        {/* Drawer Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "16px 20px",
            background: "var(--color-primary)",
            color: "#fff",
            flexShrink: 0,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <IconUser />
            <span style={{ fontWeight: 700, fontSize: "1rem" }}>
              {user ? `Hello, ${user.name?.split(" ")[0] || "User"}` : "Hello, Sign In"}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: "transparent",
              border: "none",
              color: "#fff",
              cursor: "pointer",
              padding: "4px",
              display: "flex",
              alignItems: "center",
            }}
            aria-label="Close menu"
          >
            <IconClose />
          </button>
        </div>

        {/* Quick Links Row */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            borderBottom: "1px solid var(--color-border)",
          }}
        >
          {[
            { href: "/cart", icon: <IconCart />, label: "Cart", badge: mounted ? cartCount : 0 },
            { href: "/favorites", icon: <IconHeart />, label: "Wishlist", badge: mounted ? favoritesCount : 0 },
            { href: "/wishlist", icon: <IconBookmark />, label: "Saved", badge: mounted ? wishlistCount : 0 },
            { href: "/profile/orders", icon: <IconPackage />, label: "Orders", badge: 0 },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: "4px",
                padding: "14px 8px",
                textDecoration: "none",
                color: "var(--color-text-primary)",
                fontSize: "0.7rem",
                fontWeight: 600,
                borderRight: "1px solid var(--color-border)",
                position: "relative",
                transition: "background 0.12s",
              }}
            >
              <div style={{ position: "relative", color: "var(--color-primary)" }}>
                {item.icon}
                <NavBadge count={item.badge} />
              </div>
              <span>{item.label}</span>
            </Link>
          ))}
        </div>

        {/* Departments Accordion */}
        <div style={{ flexShrink: 0 }}>
          <div style={{ padding: "10px 20px 4px", fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--color-text-muted)" }}>
            Shop by Department
          </div>
          {DEPARTMENTS.map((dept, idx) => (
            <div key={dept.href}>
              <button
                type="button"
                onClick={() => setActiveIdx(activeIdx === idx ? null : idx)}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "12px 20px",
                  background: activeIdx === idx ? "var(--color-primary-surface)" : "transparent",
                  border: "none",
                  borderBottom: "1px solid var(--color-border-subtle)",
                  cursor: "pointer",
                  color: activeIdx === idx ? "var(--color-primary)" : "var(--color-text-primary)",
                  fontSize: "0.9rem",
                  fontWeight: 600,
                  textAlign: "left",
                  transition: "background 0.12s, color 0.12s",
                }}
              >
                <span>{dept.label}</span>
                <span style={{ transition: "transform 0.2s", transform: activeIdx === idx ? "rotate(90deg)" : "rotate(0deg)", color: "var(--color-text-muted)" }}>
                  <IconChevronRight />
                </span>
              </button>

              {activeIdx === idx && (
                <div style={{ background: "var(--color-surface-sunken)", borderBottom: "1px solid var(--color-border)" }}>
                  <Link
                    href={dept.href}
                    onClick={onClose}
                    style={{
                      display: "block",
                      padding: "10px 32px",
                      fontSize: "0.8rem",
                      fontWeight: 700,
                      color: "var(--color-primary)",
                      textDecoration: "none",
                    }}
                  >
                    All {dept.label}
                  </Link>
                  {dept.sub.map((sub) => (
                    <Link
                      key={sub.href}
                      href={sub.href}
                      onClick={onClose}
                      style={{
                        display: "block",
                        padding: "9px 32px",
                        fontSize: "0.83rem",
                        color: "var(--color-text-secondary)",
                        textDecoration: "none",
                        borderTop: "1px solid var(--color-border-subtle)",
                        transition: "color 0.12s, padding-left 0.12s",
                      }}
                    >
                      {sub.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Special Links */}
        <div style={{ borderTop: "1px solid var(--color-border)", flexShrink: 0 }}>
          <div style={{ padding: "10px 20px 4px", fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--color-text-muted)" }}>
            Trending
          </div>
          {[
            { href: "/products?sort=popular", label: "Today's Deals", accent: "var(--color-accent)" },
            { href: "/products?sort=best-selling", label: "Best Sellers", accent: "var(--color-primary)" },
            { href: "/products?sort=new", label: "New Arrivals", accent: "var(--color-text-primary)" },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              style={{
                display: "block",
                padding: "11px 20px",
                fontSize: "0.88rem",
                fontWeight: 700,
                color: item.accent,
                textDecoration: "none",
                borderBottom: "1px solid var(--color-border-subtle)",
              }}
            >
              {item.label}
            </Link>
          ))}
        </div>

        {/* Account Section */}
        <div style={{ borderTop: "1px solid var(--color-border)", flexShrink: 0 }}>
          <div style={{ padding: "10px 20px 4px", fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--color-text-muted)" }}>
            Account
          </div>
          {user ? (
            <>
              <Link href="/profile" onClick={onClose} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "11px 20px", fontSize: "0.88rem", color: "var(--color-text-primary)", textDecoration: "none", borderBottom: "1px solid var(--color-border-subtle)" }}>
                <span style={{ color: "var(--color-primary)" }}><IconUser /></span> My Profile
              </Link>
              <Link href="/profile/orders" onClick={onClose} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "11px 20px", fontSize: "0.88rem", color: "var(--color-text-primary)", textDecoration: "none", borderBottom: "1px solid var(--color-border-subtle)" }}>
                <span style={{ color: "var(--color-primary)" }}><IconPackage /></span> My Orders
              </Link>
              {isDashboardUser && (
                <Link href="/dashboard" onClick={onClose} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "11px 20px", fontSize: "0.88rem", color: "var(--color-text-primary)", textDecoration: "none", borderBottom: "1px solid var(--color-border-subtle)" }}>
                  <span style={{ color: "var(--color-primary)" }}><IconDashboard /></span> Dashboard
                </Link>
              )}
              <button
                type="button"
                onClick={() => { logout(); onClose(); }}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "11px 20px",
                  fontSize: "0.88rem",
                  fontWeight: 600,
                  color: "var(--color-error, #e53e3e)",
                  background: "transparent",
                  border: "none",
                  borderBottom: "1px solid var(--color-border-subtle)",
                  cursor: "pointer",
                  textAlign: "left",
                }}
              >
                <IconLogout /> Sign Out
              </button>
            </>
          ) : (
            <>
              <Link href="/login" onClick={onClose} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "11px 20px", fontSize: "0.9rem", fontWeight: 700, color: "var(--color-primary)", textDecoration: "none", borderBottom: "1px solid var(--color-border-subtle)" }}>
                Sign In to Your Account
              </Link>
              <Link href="/register" onClick={onClose} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "11px 20px", fontSize: "0.88rem", color: "var(--color-text-secondary)", textDecoration: "none", borderBottom: "1px solid var(--color-border-subtle)" }}>
                Create a New Account
              </Link>
            </>
          )}
          <Link href="/contact" onClick={onClose} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "11px 20px", fontSize: "0.88rem", color: "var(--color-text-muted)", textDecoration: "none" }}>
            <span style={{ color: "var(--color-primary)" }}><IconHeadset /></span> Customer Service
          </Link>
        </div>

        {/* Appearance Section */}
        <div style={{ borderTop: "1px solid var(--color-border)", padding: "14px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
          <span style={{ fontSize: "0.88rem", fontWeight: 600, color: "var(--color-text-secondary)" }}>Appearance</span>
          <ThemeToggle />
        </div>
      </div>

      <style>{`
        @keyframes slideInLeft {
          from { transform: translateX(-100%); opacity: 0.6; }
          to   { transform: translateX(0);     opacity: 1;   }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
      `}</style>
    </>
  );
}

// ─── Main Navbar ───────────────────────────────────────────────────────────────

export function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [, startTransition] = useTransition();

  const { user, logout } = useAuth();
  const wishlistCount = useWishlistStore((s) => s.items?.length || 0);
  const favoritesCount = useFavoritesStore((s) => s.favorites?.length || 0);
  const { totalItems: cartCount } = useCart();


  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
  const [menuOpen, setMenuOpen] = useState(false);
  const [prevPathname, setPrevPathname] = useState(pathname);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [navSearch, setNavSearch] = useState("");

  if (prevPathname !== pathname) {
    setPrevPathname(pathname);
    setMenuOpen(false);
  }



  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const query = navSearch.trim();
    startTransition(() => {
      if (selectedCategory !== "all" && query) {
        router.push(`/products?category=${selectedCategory}&search=${encodeURIComponent(query)}`);
      } else if (selectedCategory !== "all") {
        router.push(`/products?category=${selectedCategory}`);
      } else if (query) {
        router.push(`/products?search=${encodeURIComponent(query)}`);
      } else {
        router.push("/products");
      }
    });
  };

  const isDashboardUser =
    user?.role === "ADMIN" ||
    user?.role === "SUPER_ADMIN" ||
    user?.role === "VENDOR";

  return (
    <>
      <header style={{ position: "sticky", top: 0, zIndex: 100, background: "var(--color-surface)", boxShadow: "0 2px 10px rgba(0,0,0,0.06)", borderBottom: "1px solid var(--color-border)" }}>
        {/* ── Top Bar ── */}
        <div className="container" style={{ padding: "8px var(--space-4)" }}>
          {/* ── Three-group flex row: Left | Center | Right ── */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "16px" }}>

            {/* LEFT: Logo + Location */}
            <div style={{ display: "flex", alignItems: "center", gap: "16px", flexShrink: 0 }}>
              <Logo size="md" href="/" />

              {/* Location pill — hidden on mobile, shown ≥1024px via CSS */}
              <div
                className="nav-location-pill"
                style={{
                  display: "none",
                  alignItems: "center",
                  gap: "6px",
                  cursor: "pointer",
                  paddingLeft: "12px",
                  borderLeft: "1px solid var(--color-border)",
                  height: "28px",
                }}
              >
                <div style={{ color: "var(--color-primary)", display: "flex", alignItems: "center" }}>
                  <IconLocation />
                </div>
                <div style={{ lineHeight: 1.2 }}>
                  <div style={{ fontSize: "0.68rem", color: "var(--color-text-muted)" }}>Deliver to</div>
                  <div style={{ fontSize: "0.82rem", fontWeight: 700, color: "var(--color-text-primary)" }}>India (400001)</div>
                </div>
              </div>
            </div>


            {/* CENTER: Search Bar — grows to fill space */}
            <form
              onSubmit={handleSearch}
              style={{
                flex: 1,
                maxWidth: "700px",
                display: "flex",
                alignItems: "stretch",
                background: "var(--color-surface)",
                border: "2px solid var(--color-border)",
                borderRadius: "var(--radius-md)",
                overflow: "hidden",
                height: "40px",
                transition: "border-color 0.15s, box-shadow 0.15s",
              }}
              className="nav-search-form"
            >
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                style={{
                  background: "var(--color-surface-sunken)",
                  border: "none",
                  borderRight: "1px solid var(--color-border)",
                  padding: "0 10px",
                  fontSize: "0.8rem",
                  fontWeight: 600,
                  color: "var(--color-text-secondary)",
                  cursor: "pointer",
                  outline: "none",
                  flexShrink: 0,
                }}
                aria-label="Filter by Department"
              >
                <option value="all">All</option>
                <option value="electronics">Electronics</option>
                <option value="clothing">Fashion</option>
                <option value="home-garden">Home</option>
                <option value="books">Books</option>
                <option value="sports">Sports</option>
              </select>

              <input
                type="text"
                placeholder="Search ShopSmart..."
                value={navSearch}
                onChange={(e) => setNavSearch(e.target.value)}
                style={{
                  flex: 1,
                  border: "none",
                  background: "transparent",
                  padding: "0 14px",
                  fontSize: "0.875rem",
                  outline: "none",
                  color: "var(--color-text-primary)",
                  minWidth: 0,
                }}
                aria-label="Search ShopSmart"
              />

              <button
                type="submit"
                style={{
                  background: "var(--color-primary)",
                  color: "var(--color-text-on-primary)",
                  border: "none",
                  padding: "0 20px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  flexShrink: 0,
                  transition: "opacity 0.15s",
                }}
                aria-label="Search"
              >
                <IconSearch />
              </button>
            </form>

            {/* RIGHT: Account + Orders + Cart */}
            <div style={{ display: "flex", alignItems: "center", gap: "20px", flexShrink: 0 }}>

              {/* Account & Lists */}
              <Link
                href={user ? "/profile" : "/login"}
                style={{ textDecoration: "none", lineHeight: 1.25 }}
                className="nav-action-text"
              >
                <div style={{ fontSize: "0.68rem", color: "var(--color-text-muted)" }}>
                  {user ? `Hello, ${user.name?.split(" ")[0] || "User"}` : "Hello, Sign in"}
                </div>
                <div style={{ fontSize: "0.82rem", fontWeight: 700, color: "var(--color-text-primary)", whiteSpace: "nowrap" }}>
                  Account &amp; Lists
                </div>
              </Link>

              {/* Returns & Orders — hidden on mobile, shown ≥1024px via CSS */}
              <Link
                href="/profile/orders"
                className="nav-orders-link"
                style={{ textDecoration: "none", lineHeight: 1.25, display: "none" }}
              >
                <div style={{ fontSize: "0.68rem", color: "var(--color-text-muted)" }}>Returns</div>
                <div style={{ fontSize: "0.82rem", fontWeight: 700, color: "var(--color-text-primary)", whiteSpace: "nowrap" }}>
                  &amp; Orders
                </div>
              </Link>

              {/* Cart */}
              <Link
                href="/cart"
                style={{
                  position: "relative",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "6px 14px",
                  borderRadius: "var(--radius-md)",
                  background: "var(--color-primary-surface)",
                  color: "var(--color-primary)",
                  fontWeight: 700,
                  textDecoration: "none",
                  fontSize: "0.875rem",
                  border: "1.5px solid transparent",
                  transition: "border-color 0.15s",
                  whiteSpace: "nowrap",
                }}
                title="Shopping Cart"
                aria-label={`Cart with ${mounted ? cartCount : 0} items`}
              >
                <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                  <IconCart />
                  {mounted && <NavBadge count={cartCount} />}
                </div>
                <span className="nav-cart-label" style={{ display: "none" }}>Cart</span>
              </Link>
            </div>
          </div>

        </div>

        {/* ── Sub-Navigation Strip ── */}
        <div style={{ background: "var(--color-surface-sunken)", borderTop: "1px solid var(--color-border)", borderBottom: "1px solid var(--color-border-subtle)", overflowX: "auto" }}>
          <div className="container" style={{ padding: "4px var(--space-4)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "18px", whiteSpace: "nowrap", fontSize: "0.825rem", fontWeight: 600 }}>
              <button
                type="button"
                id="hamburger-menu-btn"
                onClick={() => setMenuOpen(true)}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  color: "var(--color-text-primary)",
                  fontWeight: 700,
                  fontSize: "0.825rem",
                  padding: "4px 8px",
                  marginLeft: "-8px",
                  borderRadius: "var(--radius-sm)",
                  transition: "background 0.15s",
                }}
                aria-label="Open all departments menu"
                aria-expanded={menuOpen}
                aria-controls="site-nav-drawer"
              >
                <IconMenu />
                <span>All</span>
              </button>

              {DEPARTMENTS.slice(0, 5).map((dept) => (
                <Link key={dept.href} href={dept.href} style={{ color: "var(--color-text-secondary)", textDecoration: "none" }}>
                  {dept.label}
                </Link>
              ))}
              <Link href="/products?sort=popular" style={{ color: "var(--color-accent)", textDecoration: "none", fontWeight: 700 }}>
                Today&apos;s Deals
              </Link>
              <Link href="/products?sort=best-selling" style={{ color: "var(--color-primary)", textDecoration: "none", fontWeight: 700 }}>
                Best Sellers
              </Link>
              <Link href="/contact" style={{ color: "var(--color-text-muted)", textDecoration: "none", marginLeft: "auto" }}>
                Customer Service
              </Link>
            </div>
          </div>
        </div>

      </header>

      {/* ── Hamburger Drawer (portal-like, outside sticky header) ── */}
      <HamburgerMenu
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        user={user}
        logout={logout}
        mounted={mounted}
        favoritesCount={favoritesCount}
        wishlistCount={wishlistCount}
        cartCount={cartCount}
        isDashboardUser={isDashboardUser}
      />
    </>
  );
}
