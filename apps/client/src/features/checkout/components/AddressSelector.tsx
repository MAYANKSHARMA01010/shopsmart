"use client";

import React, { useEffect, useState, useCallback } from "react";

import { useCheckoutStore } from "../store/checkoutStore";
import { useAuthStore } from "../../auth/store/authStore";
import { addressService, type Address, type AddressFormData } from "../../auth/services/addressService";
import Link from "next/link";
import toast from "react-hot-toast";

function IconPlus() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

function IconMapPin() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ color: "var(--color-primary)" }}>
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

export const AddressSelector: React.FC = () => {
  const { addressId, setAddress } = useCheckoutStore();
  const token = useAuthStore((s) => s.accessToken);
  const user = useAuthStore((s) => s.user);

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState<AddressFormData>({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    line1: "",
    line2: "",
    city: "Bengaluru",
    state: "Karnataka",
    country: "IN",
    postalCode: "560038",
    isDefault: true,
  });


  const loadAddresses = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const data = await addressService.getUserAddresses();
      const list = Array.isArray(data) ? data : [];
      setAddresses(list);
      
      if (list.length > 0) {
        const defaultAddr = list.find((a) => a.isDefault) || list[0];
        if (!addressId || !list.some((a) => a.id === addressId)) {
          setAddress(defaultAddr.id);
        }
      } else {
        setShowAddForm(true);
      }
    } catch {
      toast.error("Failed to load delivery addresses");
    } finally {
      setLoading(false);
    }
  }, [token, addressId, setAddress]);

  useEffect(() => {
    loadAddresses();
  }, [loadAddresses]);


  const handleCreateAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone || !formData.line1 || !formData.city || !formData.state || !formData.postalCode) {
      toast.error("Please fill in all required address fields");
      return;
    }

    setSaving(true);
    try {
      const newAddr = await addressService.createAddress(formData);
      setAddresses((prev) => [...prev, newAddr]);
      setAddress(newAddr.id);
      setShowAddForm(false);
      toast.success("Delivery address saved!");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to save address";
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  if (!token) {
    return (
      <div className="profile-section-card" style={{ padding: "var(--space-6)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "var(--space-3)" }}>
          <IconMapPin />
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.25rem", margin: 0, color: "var(--color-text-primary)" }}>
            1. Delivery Address
          </h2>
        </div>
        <p style={{ color: "var(--color-text-secondary)", fontSize: "0.9rem", margin: "0 0 var(--space-4)" }}>
          Please sign in to select or add your delivery address and complete checkout.
        </p>
        <Link
          href="/login?redirect=/checkout"
          className="btn btn-primary btn-sm"
          style={{ display: "inline-flex", padding: "8px 20px" }}
        >
          Sign In to Select Address
        </Link>
      </div>
    );
  }

  return (
    <div className="profile-section-card" style={{ padding: "var(--space-6)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--space-4)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <IconMapPin />
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.25rem", margin: 0, color: "var(--color-text-primary)" }}>
            1. Select Delivery Address
          </h2>
        </div>

        {!showAddForm && addresses.length > 0 && (
          <button
            type="button"
            onClick={() => setShowAddForm(true)}
            className="btn btn-secondary btn-sm"
            style={{ fontSize: "0.8rem", padding: "4px 10px", display: "flex", alignItems: "center", gap: "4px" }}
          >
            <IconPlus /> Add New Address
          </button>
        )}
      </div>

      {loading ? (
        <div style={{ padding: "var(--space-4) 0", color: "var(--color-text-muted)", fontSize: "0.875rem" }}>
          Loading saved addresses…
        </div>
      ) : addresses.length > 0 && !showAddForm ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
          {addresses.map((addr) => {
            const isSelected = addressId === addr.id;
            return (
              <label
                key={addr.id}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "var(--space-3)",
                  padding: "var(--space-4)",
                  borderRadius: "var(--radius-lg)",
                  border: isSelected ? "2px solid var(--color-primary)" : "1px solid var(--color-border)",
                  background: isSelected ? "var(--color-primary-surface)" : "var(--color-surface)",
                  cursor: "pointer",
                  transition: "border-color 0.15s, background 0.15s",
                }}
              >
                <input
                  type="radio"
                  name="delivery-address"
                  checked={isSelected}
                  onChange={() => setAddress(addr.id)}
                  style={{
                    width: "18px",
                    height: "18px",
                    minWidth: "18px",
                    maxWidth: "18px",
                    minHeight: "18px",
                    maxHeight: "18px",
                    marginTop: "3px",
                    accentColor: "var(--color-primary)",
                    cursor: "pointer",
                    flexShrink: 0,
                  }}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", marginBottom: "4px" }}>
                    <span style={{ fontWeight: 700, fontSize: "0.95rem", color: "var(--color-text-primary)" }}>
                      {addr.name}
                    </span>
                    {addr.isDefault && (
                      <span
                        style={{
                          fontSize: "0.65rem",
                          fontWeight: 700,
                          letterSpacing: "0.06em",
                          textTransform: "uppercase",
                          padding: "2px 8px",
                          borderRadius: "var(--radius-full)",
                          background: "var(--color-primary)",
                          color: "#fff",
                        }}
                      >
                        DEFAULT
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: "0.85rem", color: "var(--color-text-secondary)", lineHeight: 1.5 }}>
                    {addr.line1}{addr.line2 ? `, ${addr.line2}` : ""}, {addr.city}, {addr.state} - {addr.postalCode}
                  </div>
                  <div style={{ fontSize: "0.8rem", color: "var(--color-text-muted)", marginTop: "4px", fontFamily: "var(--font-mono)" }}>
                    Phone: {addr.phone}
                  </div>
                </div>
              </label>
            );
          })}
        </div>
      ) : (
        /* Inline Add Address Form */
        <form onSubmit={handleCreateAddress} style={{ display: "flex", flexDirection: "column", gap: "12px", background: "var(--color-surface-sunken)", padding: "16px", borderRadius: "var(--radius-lg)", border: "1px solid var(--color-border)" }}>
          <div style={{ fontWeight: 700, fontSize: "0.95rem", color: "var(--color-text-primary)", marginBottom: "4px" }}>
            Enter Shipping Address
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
            <div>
              <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 600, color: "var(--color-text-secondary)", marginBottom: "4px" }}>
                Full Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="form-input"
                placeholder="e.g. Mayank Sharma"
                style={{ width: "100%", padding: "8px 12px", fontSize: "0.85rem" }}
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 600, color: "var(--color-text-secondary)", marginBottom: "4px" }}>
                Mobile Number *
              </label>
              <div style={{ display: "flex", width: "100%" }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                    padding: "0 8px",
                    background: "var(--color-surface-elevated, #f3f4f6)",
                    border: "1px solid var(--color-border)",
                    borderRight: "none",
                    borderTopLeftRadius: "var(--radius-md)",
                    borderBottomLeftRadius: "var(--radius-md)",
                    fontSize: "0.8rem",
                    fontWeight: 600,
                    color: "var(--color-text-primary)",
                    userSelect: "none",
                    whiteSpace: "nowrap",
                  }}
                >
                  <span role="img" aria-label="India">🇮🇳</span> +91
                </div>
                <input
                  type="tel"
                  inputMode="numeric"
                  maxLength={10}
                  required
                  value={formData.phone.replace(/\D/g, "").slice(-10)}
                  onChange={(e) => {
                    const digits = e.target.value.replace(/\D/g, "").slice(0, 10);
                    setFormData({ ...formData, phone: digits ? `+91${digits}` : "" });
                  }}
                  className="form-input"
                  placeholder="98765 43210"
                  style={{ borderTopLeftRadius: 0, borderBottomLeftRadius: 0, flex: 1, padding: "8px 12px", fontSize: "0.85rem" }}
                />
              </div>
            </div>

          </div>

          <div>
            <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 600, color: "var(--color-text-secondary)", marginBottom: "4px" }}>
              Flat, House No., Building, Street *
            </label>
            <input
              type="text"
              required
              value={formData.line1}
              onChange={(e) => setFormData({ ...formData, line1: e.target.value })}
              className="form-input"
              placeholder="e.g. Flat 402, Heritage Residency, Indiranagar"
              style={{ width: "100%", padding: "8px 12px", fontSize: "0.85rem" }}
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px" }}>
            <div>
              <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 600, color: "var(--color-text-secondary)", marginBottom: "4px" }}>
                City *
              </label>
              <input
                type="text"
                required
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="form-input"
                placeholder="e.g. Bengaluru"
                style={{ width: "100%", padding: "8px 12px", fontSize: "0.85rem" }}
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 600, color: "var(--color-text-secondary)", marginBottom: "4px" }}>
                State *
              </label>
              <input
                type="text"
                required
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                className="form-input"
                placeholder="e.g. Karnataka"
                style={{ width: "100%", padding: "8px 12px", fontSize: "0.85rem" }}
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 600, color: "var(--color-text-secondary)", marginBottom: "4px" }}>
                PIN Code *
              </label>
              <input
                type="text"
                required
                value={formData.postalCode}
                onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                className="form-input"
                placeholder="e.g. 560038"
                style={{ width: "100%", padding: "8px 12px", fontSize: "0.85rem" }}
              />
            </div>
          </div>

          <div style={{ display: "flex", gap: "10px", marginTop: "4px" }}>
            <button
              type="submit"
              disabled={saving}
              className="btn btn-primary btn-sm"
              style={{ padding: "8px 18px", fontSize: "0.85rem" }}
            >
              {saving ? "Saving…" : "Save & Deliver to this Address"}
            </button>
            {addresses.length > 0 && (
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="btn btn-ghost btn-sm"
                style={{ fontSize: "0.85rem" }}
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      )}
    </div>
  );
};
