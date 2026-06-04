"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { productService } from "../services/productService";

type HealthData = {
  status: string;
  message: string;
  timestamp: string;
  database?: string;
};

export default function HomePage() {
  const [health, setHealth] = useState<HealthData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    productService
      .checkHealth()
      .then(setHealth)
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const features = [
    {
      icon: "⚡",
      title: "Next.js App Router",
      desc: "TypeScript, server & client components, and optimized rendering out of the box.",
    },
    {
      icon: "🚀",
      title: "Express Backend",
      desc: "REST API with Zod validation and centralized error handling.",
    },
    {
      icon: "🐘",
      title: "PostgreSQL",
      desc: "Production-grade relational database with Prisma ORM and full type safety.",
    },
    {
      icon: "🔒",
      title: "Type-Safe",
      desc: "Shared Zod schemas enforce validation between frontend and backend simultaneously.",
    },
  ];

  return (
    <>
      {/* Hero */}
      <section className="hero">
        <div className="container">

          <h1 className="hero-title">
            ShopSmart
            <span className="hero-title-accent">Product Manager</span>
          </h1>

          <p className="hero-subtitle">
            A modern full-stack product management system built with Next.js,
            Express, Prisma, and PostgreSQL.
          </p>

          <div className="hero-actions">
            <Link href="/products" className="btn btn-primary">
              Browse Products
            </Link>
            <Link href="/products#add" className="btn btn-secondary">
              Add Product
            </Link>
          </div>
        </div>
      </section>

      {/* Content */}
      <div className="container">
        {/* Backend Health */}
        <div className="health-card" role="status" aria-live="polite">
          <div
            className={`health-indicator ${
              loading ? "loading" : error ? "error" : "ok"
            }`}
            aria-hidden="true"
          >
            {loading ? "⋯" : error ? "✕" : "✓"}
          </div>
          <div className="health-info">
            <p className="health-label">Backend Status</p>
            {loading && <p className="health-meta">Pinging Express server…</p>}
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
                  {health.database || "Connected"} &nbsp;|&nbsp;{" "}
                  {new Date(health.timestamp).toLocaleTimeString()}
                </p>
              </>
            )}
          </div>
        </div>

        {/* Features */}
        <div className="feature-grid">
          {features.map((f) => (
            <div className="feature-card" key={f.title}>
              <div className="feature-icon" aria-hidden="true">
                {f.icon}
              </div>
              <div className="feature-title">{f.title}</div>
              <div className="feature-desc">{f.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
