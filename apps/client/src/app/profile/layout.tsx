"use client";

import React, { useEffect, useSyncExternalStore } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/features/auth";



function IconUser() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
    </svg>
  );
}
function IconPackage() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <polyline points="3.27 6.96 12 12.01 20.73 6.96" /><line x1="12" y1="22.08" x2="12" y2="12" />
    </svg>
  );
}
function IconMapPin() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
    </svg>
  );
}
function IconShield() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}
function IconLogout() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  );
}

const navItems = [
  { label: "Account Overview", href: "/profile",            icon: <IconUser />,    exact: true,  badge: null },
  { label: "My Orders",        href: "/profile/orders",     icon: <IconPackage />, exact: false, badge: null },
  { label: "Addresses",        href: "/profile/addresses",  icon: <IconMapPin />,  exact: false, badge: null },
  { label: "Security & Password", href: "/profile/security", icon: <IconShield />, exact: false, badge: null },
];

export default function ProfileLayout({ children }: { children: React.ReactNode }) {

  const { user, logout, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );


  useEffect(() => {
    if (mounted && !isLoading && !isAuthenticated) {
      router.push("/login?redirect=/profile");
    }
  }, [mounted, isLoading, isAuthenticated, router]);

  if (!mounted || isLoading || !user) {
    return (
      <div className="container" style={{ padding: "4rem 0", textAlign: "center", color: "var(--color-text-muted)" }}>
        Loading profile…
      </div>
    );
  }

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  const initials = user.name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="container" style={{ paddingTop: "var(--space-8)", paddingBottom: "var(--space-12)" }}>
      {/* Page title */}
      <div style={{ marginBottom: "var(--space-6)" }}>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1.5rem, 3vw, 2rem)", fontWeight: 700, margin: 0, color: "var(--color-text-primary)" }}>
          My Account
        </h1>
        <p style={{ margin: "var(--space-1) 0 0", color: "var(--color-text-muted)", fontSize: "0.9rem" }}>
          Manage your profile, orders, and settings
        </p>
      </div>

      <div className="profile-layout">
        {/* Sidebar */}
        <aside className="profile-sidebar" aria-label="Profile navigation">
          {/* User card */}
          <div className="profile-sidebar-user">
            <div className="profile-avatar" aria-hidden="true">{initials}</div>
            <div className="profile-user-name">{user.name}</div>
            <div className="profile-user-email">{user.email}</div>
            <span className="profile-role-badge">{user.role}</span>
          </div>

          {/* Navigation */}
          <nav className="profile-sidebar-nav">
            {navItems.map((item) => {
              const isActive = item.exact ? pathname === item.href : pathname?.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`profile-nav-link${isActive ? " active" : ""}`}
                  aria-current={isActive ? "page" : undefined}
                >
                  {item.icon}
                  {item.label}
                  {item.badge !== null && (
                    <span className="profile-nav-badge-count">{item.badge}</span>
                  )}
                </Link>
              );
            })}

            <div style={{ height: "1px", background: "var(--color-border)", margin: "var(--space-3) 0" }} />

            <button
              className="profile-nav-link profile-nav-link-danger"
              onClick={handleLogout}
              aria-label="Sign out of your account"
            >
              <IconLogout />
              Sign Out
            </button>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="profile-content">
          {children}
        </main>
      </div>
    </div>
  );
}
