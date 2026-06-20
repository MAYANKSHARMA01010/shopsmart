"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "./ThemeToggle";
import { useAuth } from "@/features/auth/AuthContext";
import { useWishlistStore } from "@/features/wishlist/store/wishlistStore";
import { useCartStore } from "@/features/cart/store/cartStore";
import { LogOut } from "lucide-react";
import { useEffect, useState } from "react";

const links = [
  { href: "/", label: "Home" },
  { href: "/products", label: "Products" },
];

export function Navbar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const wishlistItemsCount = useWishlistStore(
    (state) => state.items?.length || 0,
  );
  const cartItemsCount = useCartStore(
    (state) => state.cart?.items?.length || 0,
  );
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  return (
    <nav className="navbar" role="navigation" aria-label="Main navigation">
      <div className="container">
        <div className="navbar-inner">
          {/* Brand */}
          <Link href="/" className="navbar-brand" aria-label="ShopSmart home">
            <div className="navbar-logo" aria-hidden="true">
              S
            </div>
            <span className="navbar-title">ShopSmart</span>
          </Link>

          {/* Right side: nav + toggle */}
          <div className="navbar-right">
            <ul className="navbar-nav" role="list">
              {links.map((link) => {
                const isActive =
                  link.href === "/"
                    ? pathname === "/"
                    : pathname?.startsWith(link.href) ?? false;
                return (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className={`nav-link${isActive ? " active" : ""}`}
                      aria-current={isActive ? "page" : undefined}
                    >
                      {link.label}
                    </Link>
                  </li>
                );
              })}

              {user ? (
                  <li>
                    <Link
                      href="/profile"
                      className={`nav-link${pathname?.startsWith("/profile") ? " active" : ""
                        }`}
                      style={{ fontWeight: 600 }}
                    >
                      Hi, {user.name.split(" ")[0]}
                    </Link>
                  </li>
              ) : (
                <>
                  <li>
                    <Link
                      href="/login"
                      className={`nav-link${pathname === "/login" ? " active" : ""
                        }`}
                    >
                      Login
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/register"
                      className={`nav-link${pathname === "/register" ? " active" : ""
                        }`}
                    >
                      Register
                    </Link>
                  </li>
                </>
              )}
              {/* Wishlist Link */}
              <li>
                <Link
                  href="/profile/wishlist"
                  className={`nav-link${pathname === "/profile/wishlist" ? " active" : ""
                    }`}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.25rem",
                  }}
                  aria-label={`Wishlist (${mounted ? wishlistItemsCount : 0
                    } items)`}
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                  </svg>
                  {mounted && wishlistItemsCount > 0 && (
                    <span
                      style={{
                        background: "#e63946",
                        color: "white",
                        fontSize: "0.7rem",
                        padding: "2px 6px",
                        borderRadius: "10px",
                        fontWeight: "bold",
                        marginLeft: "2px",
                      }}
                    >
                      {wishlistItemsCount}
                    </span>
                  )}
                </Link>
              </li>

              {/* Cart Link */}
              <li>
                <Link
                  href="/cart"
                  className={`nav-link${pathname === "/cart" ? " active" : ""}`}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.25rem",
                  }}
                  aria-label={`Cart (${mounted ? cartItemsCount : 0} items)`}
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="9" cy="21" r="1" />
                    <circle cx="20" cy="21" r="1" />
                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                  </svg>
                  {mounted && cartItemsCount > 0 && (
                    <span
                      style={{
                        background: "var(--color-primary)",
                        color: "white",
                        fontSize: "0.7rem",
                        padding: "2px 6px",
                        borderRadius: "10px",
                        fontWeight: "bold",
                        marginLeft: "2px",
                      }}
                    >
                      {cartItemsCount}
                    </span>
                  )}
                </Link>
              </li>

              {user && (
                <li>
                  <button
                    onClick={logout}
                    className="nav-link"
                    style={{
                      background: "transparent",
                      border: "none",
                      cursor: "pointer",
                      font: "inherit",
                      width: "100%",
                      textAlign: "left",
                      display: "flex",
                      alignItems: "center",
                      color: "var(--color-danger, #e63946)"
                    }}
                    aria-label="Logout"
                    title="Logout"
                  >
                    <LogOut size={18} />
                  </button>
                </li>
              )}
            </ul>

            <ThemeToggle />
          </div>
        </div>
      </div>
    </nav>
  );
}
