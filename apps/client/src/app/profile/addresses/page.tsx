"use client";

import React, { useEffect, useState } from "react";

import { AddressListSkeleton } from "@/components/ui/Skeleton";
import { addressService, type Address, type AddressFormData } from "@/features/auth/services/addressService";
import toast from "react-hot-toast";


function IconHome() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}

function IconBuilding() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="4" y="2" width="16" height="20" rx="2" ry="2" />
      <line x1="9" y1="6" x2="9.01" y2="6" />
      <line x1="15" y1="6" x2="15.01" y2="6" />
      <line x1="9" y1="10" x2="9.01" y2="10" />
      <line x1="15" y1="10" x2="15.01" y2="10" />
      <line x1="9" y1="14" x2="9.01" y2="14" />
      <line x1="15" y1="14" x2="15.01" y2="14" />
      <line x1="9" y1="18" x2="15" y2="18" />
    </svg>
  );
}

function IconPlus() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

function IconMapPin() {
  return (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ color: "var(--color-text-muted)" }}>
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

function IconPhone() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  );
}

export default function AddressesPage() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState<AddressFormData>({
    name: "",
    email: "",
    phone: "",
    line1: "",
    line2: "",
    city: "",
    state: "",
    country: "IN",
    postalCode: "",
    isDefault: false,
  });

  const fetchAddresses = async () => {
    try {
      const data = await addressService.getUserAddresses();
      setAddresses(data);
    } catch {
      toast.error("Failed to load addresses.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  const handleOpenModal = (address?: Address) => {
    if (address) {
      setEditingId(address.id);
      setFormData({
        name: address.name,
        email: address.email,
        phone: address.phone,
        line1: address.line1,
        line2: address.line2 || "",
        city: address.city,
        state: address.state,
        country: address.country,
        postalCode: address.postalCode,
        isDefault: address.isDefault,
      });
    } else {
      setEditingId(null);
      setFormData({
        name: "",
        email: "",
        phone: "",
        line1: "",
        line2: "",
        city: "",
        state: "",
        country: "IN",
        postalCode: "",
        isDefault: false,
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await addressService.updateAddress(editingId, formData);
        toast.success("Address updated successfully!");
      } else {
        await addressService.createAddress(formData);
        toast.success("Address added successfully!");
      }
      setIsModalOpen(false);
      fetchAddresses();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to save address";
      toast.error(msg);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this address?")) {
      try {
        await addressService.deleteAddress(id);
        toast.success("Address deleted successfully!");
        fetchAddresses();
      } catch {
        toast.error("Failed to delete address");
      }
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      await addressService.updateAddress(id, { isDefault: true });
      toast.success("Default address updated!");
      fetchAddresses();
    } catch {
      toast.error("Failed to update default address");
    }
  };

  if (loading) {
    return (
      <div className="profile-section-card" style={{ padding: "var(--space-6)" }}>
        <AddressListSkeleton count={2} />
      </div>
    );
  }


  return (
    <div className="profile-section-card" style={{ padding: "var(--space-6)" }}>
      {/* Header Section */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          marginBottom: "var(--space-6)",
          paddingBottom: "var(--space-4)",
          borderBottom: "1px solid var(--color-border)",
        }}
      >
        <div>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: "1.5rem", fontWeight: 700, margin: 0, color: "var(--color-text-primary)" }}>
            Delivery Addresses
          </h1>
          <p style={{ margin: "var(--space-1) 0 0", color: "var(--color-text-muted)", fontSize: "0.875rem" }}>
            Manage your saved shipping addresses for fast 1-click checkout.
          </p>
        </div>
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => handleOpenModal()}
          style={{ display: "flex", alignItems: "center", gap: "6px", padding: "8px 16px" }}
        >
          <IconPlus /> Add New Address
        </button>
      </div>

      {addresses.length === 0 ? (
        <div style={{ padding: "3rem 1rem", textAlign: "center", border: "1px dashed var(--color-border)", borderRadius: "var(--radius-lg)" }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: "var(--space-3)" }}>
            <IconMapPin />
          </div>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.25rem", margin: "0 0 var(--space-2)", color: "var(--color-text-primary)" }}>
            No Addresses Found
          </h2>
          <p style={{ color: "var(--color-text-muted)", marginBottom: "var(--space-4)", fontSize: "0.9rem" }}>
            You haven&apos;t saved any delivery addresses yet.
          </p>
          <button type="button" className="btn btn-primary" onClick={() => handleOpenModal()}>
            Add Your First Address
          </button>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "var(--space-4)" }}>
          {addresses.map((address, idx) => (
            <div
              key={address.id}
              style={{
                background: "var(--color-surface)",
                border: address.isDefault ? "2px solid var(--color-primary)" : "1px solid var(--color-border)",
                borderRadius: "var(--radius-lg)",
                padding: "var(--space-5)",
                display: "flex",
                flexDirection: "column",
                position: "relative",
                gap: "var(--space-2)",
              }}
            >
              {/* Card Top */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--color-primary)", fontWeight: 700, fontSize: "0.95rem" }}>
                  {idx % 2 === 0 ? <IconHome /> : <IconBuilding />}
                  <span>{address.line2?.toLowerCase().includes("office") ? "Office" : "Home"}</span>
                </div>
                {address.isDefault && (
                  <span
                    style={{
                      fontSize: "0.65rem",
                      fontWeight: 700,
                      letterSpacing: "0.06em",
                      textTransform: "uppercase",
                      padding: "2px 8px",
                      borderRadius: "var(--radius-full)",
                      background: "var(--color-primary-surface)",
                      color: "var(--color-primary)",
                      border: "1px solid var(--color-primary-border)",
                    }}
                  >
                    Default
                  </span>
                )}
              </div>

              {/* Recipient info */}
              <div style={{ fontWeight: 700, fontSize: "0.95rem", color: "var(--color-text-primary)", marginTop: "2px" }}>
                {address.name}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "0.8rem", color: "var(--color-text-muted)", fontFamily: "var(--font-mono)" }}>
                <IconPhone /> {address.phone}
              </div>
              <div style={{ fontSize: "0.85rem", color: "var(--color-text-secondary)", lineHeight: 1.5, marginTop: "2px" }}>
                {address.line1}{address.line2 ? `, ${address.line2}` : ""}<br />
                {address.city}, {address.state} - {address.postalCode}, {address.country}
              </div>

              {/* Actions row */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginTop: "auto",
                  paddingTop: "var(--space-3)",
                  borderTop: "1px solid var(--color-border)",
                }}
              >
                <div style={{ display: "flex", gap: "var(--space-3)" }}>
                  <button
                    type="button"
                    onClick={() => handleOpenModal(address)}
                    style={{ background: "transparent", border: "none", color: "var(--color-primary)", fontWeight: 700, fontSize: "0.8rem", cursor: "pointer" }}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(address.id)}
                    style={{ background: "transparent", border: "none", color: "var(--color-error)", fontSize: "0.8rem", cursor: "pointer" }}
                  >
                    Delete
                  </button>
                </div>
                {!address.isDefault && (
                  <button
                    type="button"
                    onClick={() => handleSetDefault(address.id)}
                    style={{ background: "transparent", border: "none", color: "var(--color-accent)", fontWeight: 600, fontSize: "0.8rem", cursor: "pointer" }}
                  >
                    Set as Default
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Address Modal */}
      {isModalOpen && (
        <div
          style={{
            position: "fixed",
            top: 0, left: 0, right: 0, bottom: 0,
            background: "rgba(0, 0, 0, 0.5)",
            backdropFilter: "blur(4px)",
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "1rem",
          }}
        >
          <div
            className="profile-section-card"
            style={{
              width: "100%",
              maxWidth: "560px",
              padding: "var(--space-6)",
              maxHeight: "90vh",
              overflowY: "auto",
            }}
          >
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.3rem", marginTop: 0, marginBottom: "var(--space-4)", color: "var(--color-text-primary)" }}>
              {editingId ? "Edit Address" : "Add New Address"}
            </h2>

            <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label" htmlFor="addr-name">Full Name</label>
                  <input
                    id="addr-name"
                    required
                    className="form-input"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="addr-phone">Phone</label>
                  <input
                    id="addr-phone"
                    required
                    className="form-input"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="addr-email">Email</label>
                <input
                  id="addr-email"
                  required
                  type="email"
                  className="form-input"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="addr-line1">Address Line 1</label>
                <input
                  id="addr-line1"
                  required
                  className="form-input"
                  value={formData.line1}
                  onChange={(e) => setFormData({ ...formData, line1: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="addr-line2">Address Line 2 (Optional)</label>
                <input
                  id="addr-line2"
                  className="form-input"
                  value={formData.line2}
                  onChange={(e) => setFormData({ ...formData, line2: e.target.value })}
                />
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label" htmlFor="addr-city">City</label>
                  <input
                    id="addr-city"
                    required
                    className="form-input"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="addr-state">State</label>
                  <input
                    id="addr-state"
                    required
                    className="form-input"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label" htmlFor="addr-pincode">Postal Code</label>
                  <input
                    id="addr-pincode"
                    required
                    className="form-input"
                    value={formData.postalCode}
                    onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="addr-country">Country</label>
                  <input
                    id="addr-country"
                    required
                    className="form-input"
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "var(--space-1)" }}>
                <input
                  type="checkbox"
                  id="isDefault"
                  checked={formData.isDefault}
                  onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                  style={{ accentColor: "var(--color-primary)" }}
                />
                <label htmlFor="isDefault" style={{ fontSize: "0.875rem", cursor: "pointer", color: "var(--color-text-secondary)" }}>
                  Set as default delivery address
                </label>
              </div>

              <div style={{ display: "flex", gap: "var(--space-3)", marginTop: "var(--space-3)", justifyContent: "flex-end" }}>
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Address
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
