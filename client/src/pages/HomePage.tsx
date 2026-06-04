"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { productService } from "../services/productService";

export default function HomePage() {
  const [health, setHealth] = useState<{ status: string; message: string; timestamp: string; database?: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    productService
      .checkHealth()
      .then(setHealth)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      {/* Hero */}
      <section className="hero">
        <div className="container">
          <div className="hero-badge">
            <span>●</span> Full-Stack App
          </div>
          <h1 className="hero-title">
            ShopSmart
            <br />
            <span>Product Manager</span>
          </h1>
          <p className="hero-subtitle">
            A modern full-stack product management system built with Next.js,
            Express, Prisma, and PostgreSQL.
          </p>
          <div className="hero-actions">
            <Link href="/products" className="btn btn-primary">
              📦 Browse Products
            </Link>
            <Link href="/products#add" className="btn btn-secondary">
              ✏️ Add Product
            </Link>
          </div>
        </div>
      </section>

      <div className="container">
        {/* Backend health */}
        <div className="health-card">
          {loading ? (
            <div className="health-indicator">⏳</div>
          ) : error ? (
            <div className="health-indicator error">❌</div>
          ) : (
            <div className="health-indicator ok">✅</div>
          )}
          <div className="health-info">
            <h3>Backend Status</h3>
            {loading && (
              <p className="health-meta">Pinging Express server…</p>
            )}
            {error && (
              <>
                <p className="health-status-error">Unreachable</p>
                <p className="health-meta">{error}</p>
              </>
            )}
            {health && (
              <>
                <p className="health-status-ok">
                  {health.status.toUpperCase()} — {health.message}
                </p>
                <p className="health-meta">
                  🗄️ {health.database || "Connected"} &nbsp;|&nbsp; 🕐{" "}
                  {new Date(health.timestamp).toLocaleTimeString()}
                </p>
              </>
            )}
          </div>
        </div>

        {/* Features */}
        <div className="feature-grid">
          {[
            {
              icon: "⚡",
              title: "Next.js 14",
              desc: "App Router, TypeScript, server & client components",
            },
            {
              icon: "🚀",
              title: "Express Backend",
              desc: "REST API with Zod validation & centralized error handling",
            },
            {
              icon: "🐘",
              title: "PostgreSQL",
              desc: "Production-grade relational database via Prisma ORM",
            },
            {
              icon: "🔒",
              title: "Type-Safe",
              desc: "Zod schemas for shared validation between frontend and backend",
            },
          ].map((f) => (
            <div className="feature-card" key={f.title}>
              <div className="feature-icon">{f.icon}</div>
              <div className="feature-title">{f.title}</div>
              <div className="feature-desc">{f.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
