"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "./ThemeToggle";

const links = [
  { href: "/",        label: "Home" },
  { href: "/products", label: "Products" },
];

export function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="navbar" role="navigation" aria-label="Main navigation">
      <div className="container">
        <div className="navbar-inner">
          {/* Brand */}
          <Link href="/" className="navbar-brand" aria-label="ShopSmart home">
            <div className="navbar-logo" aria-hidden="true">S</div>
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
            </ul>

            <ThemeToggle />
          </div>
        </div>
      </div>
    </nav>
  );
}
