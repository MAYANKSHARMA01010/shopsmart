"use client";

import { useEffect, useState } from "react";
import { analyticsService, type AnalyticsOverview } from "../../features/analytics/services/analyticsService";
import { formatPrice } from "../../features/products/types/productSchema";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar,
} from "recharts";

function IconRevenue() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  );
}
function IconOrders() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" />
      <path d="M16 10a4 4 0 0 1-8 0" />
    </svg>
  );
}
function IconCalendar() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}
function IconBox() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
    </svg>
  );
}

export default function DashboardPage() {
  const [data, setData] = useState<AnalyticsOverview | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    analyticsService.getOverview()
      .then((res) => setData(res.data))
      .catch((err: Error) => setError(err.message || "Failed to load dashboard data"))
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return (
      <div>
        <div className="dashboard-page-header">
          <h1 className="dashboard-page-title">Dashboard Overview</h1>
          <p className="dashboard-page-subtitle">Loading analytics data…</p>
        </div>
        <div className="dashboard-kpi-grid">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="kpi-card" style={{ height: 100, background: "var(--color-surface-sunken)", animation: "pulse-dot 1.5s ease infinite" }} />
          ))}
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div>
        <div className="dashboard-page-header">
          <h1 className="dashboard-page-title">Dashboard Overview</h1>
        </div>
        <div className="alert alert-error" role="alert">{error || "Failed to load dashboard data"}</div>
      </div>
    );
  }

  return (
    <div>
      <div className="dashboard-page-header">
        <h1 className="dashboard-page-title">Executive Overview</h1>
        <p className="dashboard-page-subtitle">Real-time business metrics and insights</p>
      </div>

      {/* KPI cards */}
      <div className="dashboard-kpi-grid">
        <div className="kpi-card">
          <div>
            <div className="kpi-card-label">Total Revenue</div>
            <div className="kpi-card-value">₹{formatPrice(data.totalRevenue)}</div>
            <div className="kpi-card-change">All time</div>
          </div>
          <div className="kpi-card-icon"><IconRevenue /></div>
        </div>
        <div className="kpi-card">
          <div>
            <div className="kpi-card-label">Total Orders</div>
            <div className="kpi-card-value">{data.totalOrders.toLocaleString()}</div>
            <div className="kpi-card-change">All time</div>
          </div>
          <div className="kpi-card-icon"><IconOrders /></div>
        </div>
        <div className="kpi-card">
          <div>
            <div className="kpi-card-label">Orders Today</div>
            <div className="kpi-card-value">{data.ordersToday}</div>
            <div className="kpi-card-change neutral">Today</div>
          </div>
          <div className="kpi-card-icon"><IconCalendar /></div>
        </div>
        <div className="kpi-card">
          <div>
            <div className="kpi-card-label">Active Products</div>
            <div className="kpi-card-value">{data.activeProducts}</div>
            <div className="kpi-card-change neutral">Live listings</div>
          </div>
          <div className="kpi-card-icon"><IconBox /></div>
        </div>
      </div>

      {/* Charts */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-5)" }}>
        {/* Sales Chart */}
        <div className="profile-section-card">
          <div className="profile-section-header">
            <h2 className="profile-section-title">Sales — Last 7 Days</h2>
          </div>
          <div className="profile-section-body">
            <div style={{ height: 260 }}>
              <ResponsiveContainer>
                <LineChart data={data.salesData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
                  <XAxis
                    dataKey="date"
                    stroke="var(--color-text-muted)"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(val) => new Date(val).toLocaleDateString(undefined, { weekday: "short" })}
                  />
                  <YAxis
                    stroke="var(--color-text-muted)"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(val) => `₹${val}`}
                  />
                  <Tooltip
                    contentStyle={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-md)", fontSize: "0.875rem" }}
                    formatter={(value: unknown) => [`₹${formatPrice(Number(value) || 0)}`, "Sales"]}
                  />
                  <Line type="monotone" dataKey="sales" stroke="var(--color-primary)" strokeWidth={2.5} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Orders Chart */}
        <div className="profile-section-card">
          <div className="profile-section-header">
            <h2 className="profile-section-title">Orders — Last 7 Days</h2>
          </div>
          <div className="profile-section-body">
            <div style={{ height: 260 }}>
              <ResponsiveContainer>
                <BarChart data={data.salesData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
                  <XAxis
                    dataKey="date"
                    stroke="var(--color-text-muted)"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(val) => new Date(val).toLocaleDateString(undefined, { weekday: "short" })}
                  />
                  <YAxis stroke="var(--color-text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-md)", fontSize: "0.875rem" }}
                    cursor={{ fill: "var(--color-surface-sunken)" }}
                  />
                  <Bar dataKey="orders" fill="var(--color-primary)" radius={[4, 4, 0, 0]} opacity={0.75} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
