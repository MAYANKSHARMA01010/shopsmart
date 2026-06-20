"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/features/auth/AuthContext";
import { User, MapPin, Package, Heart, Shield, LogOut } from "lucide-react";

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  const { user, logout, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !isLoading && !isAuthenticated) {
      router.push("/login?redirect=/profile");
    }
  }, [mounted, isLoading, isAuthenticated, router]);

  if (!mounted || isLoading || !user) {
    return (
      <div className="container" style={{ padding: "4rem 0", textAlign: "center" }}>
        <p>Loading Profile...</p>
      </div>
    );
  }

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  const navItems = [
    { label: "Personal Info", href: "/profile", icon: <User size={18} />, exact: true },
    { label: "My Orders", href: "/profile/orders", icon: <Package size={18} /> },
    { label: "My Wishlist", href: "/profile/wishlist", icon: <Heart size={18} /> },
    { label: "Addresses", href: "/profile/addresses", icon: <MapPin size={18} /> },
    { label: "Security", href: "/profile/security", icon: <Shield size={18} /> },
  ];

  return (
    <div className="container" style={{ padding: "3rem 0", maxWidth: "1200px" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginBottom: "2rem" }}>
        <h1 style={{ margin: 0, fontFamily: "var(--font-display)", fontSize: "32px" }}>My Account</h1>
        <p style={{ margin: 0, color: "var(--color-text-muted)" }}>Manage your profile, orders, and settings</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "250px 1fr", gap: "3rem", alignItems: "start" }}>
        {/* Sidebar Navigation */}
        <aside style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          <div style={{ background: "var(--color-surface)", padding: "1.5rem", borderRadius: "var(--radius-lg)", border: "1px solid var(--color-border)", marginBottom: "1rem" }}>
            <div style={{ fontWeight: 600, fontSize: "16px", marginBottom: "4px" }}>{user.name}</div>
            <div style={{ color: "var(--color-text-muted)", fontSize: "13px" }}>{user.email}</div>
          </div>

          <nav style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
            {navItems.map((item) => {
              const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    padding: "12px 16px",
                    borderRadius: "var(--radius-md)",
                    textDecoration: "none",
                    color: isActive ? "var(--color-primary)" : "var(--color-text-primary)",
                    background: isActive ? "var(--color-primary-light)" : "transparent",
                    fontWeight: isActive ? 600 : 500,
                    transition: "all 0.2s ease",
                  }}
                  className={isActive ? "" : "hover-bg-surface"}
                >
                  {item.icon}
                  {item.label}
                </Link>
              );
            })}
            
            <button
              onClick={handleLogout}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                padding: "12px 16px",
                borderRadius: "var(--radius-md)",
                border: "none",
                background: "transparent",
                color: "var(--color-error)",
                fontWeight: 500,
                cursor: "pointer",
                textAlign: "left",
                fontFamily: "inherit",
                fontSize: "inherit",
                transition: "all 0.2s ease",
                marginTop: "1rem",
              }}
              className="hover-bg-error-surface"
            >
              <LogOut size={18} />
              Sign Out
            </button>
          </nav>
        </aside>

        {/* Main Content Area */}
        <main>
          {children}
        </main>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .hover-bg-surface:hover {
          background: var(--color-surface);
        }
        .hover-bg-error-surface:hover {
          background: var(--color-error-surface);
        }
        @media (max-width: 768px) {
          .container > div {
            grid-template-columns: 1fr !important;
          }
        }
      `}} />
    </div>
  );
}
