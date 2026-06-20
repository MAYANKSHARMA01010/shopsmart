"use client";

import React, { useEffect, useState } from "react";
import { addressService, Address, AddressFormData } from "@/features/auth/services/addressService";
import { Plus, Edit2, Trash2, MapPin, Check } from "lucide-react";
import toast from "react-hot-toast";

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
    isDefault: false
  });

  const fetchAddresses = async () => {
    try {
      const data = await addressService.getUserAddresses();
      setAddresses(data);
    } catch (err: any) {
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
        isDefault: address.isDefault
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
        isDefault: false
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
    } catch (err: any) {
      toast.error("Failed to save address: " + (err.message || "Unknown error"));
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this address?")) {
      try {
        await addressService.deleteAddress(id);
        toast.success("Address deleted successfully!");
        fetchAddresses();
      } catch (err: any) {
        toast.error("Failed to delete address");
      }
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      await addressService.updateAddress(id, { isDefault: true });
      toast.success("Default address updated!");
      fetchAddresses();
    } catch (err: any) {
      toast.error("Failed to update default address");
    }
  };

  if (loading) return <div>Loading addresses...</div>;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <h2 style={{ margin: 0 }}>Saved Addresses</h2>
        <button className="btn btn-primary" onClick={() => handleOpenModal()} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <Plus size={16} /> Add New Address
        </button>
      </div>

      {addresses.length === 0 ? (
        <div style={{ padding: "3rem", textAlign: "center", background: "var(--color-surface)", borderRadius: "var(--radius-lg)", border: "1px dashed var(--color-border)" }}>
          <MapPin size={48} color="var(--color-text-muted)" style={{ marginBottom: "1rem" }} />
          <h3>No Addresses Found</h3>
          <p style={{ color: "var(--color-text-muted)", marginBottom: "1.5rem" }}>You haven&apos;t saved any delivery addresses yet.</p>
          <button className="btn btn-outline" onClick={() => handleOpenModal()}>Add Your First Address</button>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "1.5rem" }}>
          {addresses.map((address) => (
            <div key={address.id} style={{
              background: "var(--color-surface)",
              padding: "1.5rem",
              borderRadius: "var(--radius-lg)",
              border: address.isDefault ? "2px solid var(--color-primary)" : "1px solid var(--color-border)",
              position: "relative"
            }}>
              {address.isDefault && (
                <span style={{ position: "absolute", top: "16px", right: "16px", background: "var(--color-primary-light)", color: "var(--color-primary)", padding: "4px 8px", borderRadius: "var(--radius-sm)", fontSize: "12px", fontWeight: 600 }}>
                  Default
                </span>
              )}
              <h3 style={{ margin: "0 0 0.5rem 0", fontSize: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
                {address.name}
              </h3>
              <p style={{ margin: "0 0 0.25rem 0", fontSize: "14px", color: "var(--color-text-secondary)" }}>{address.phone}</p>
              <p style={{ margin: "0 0 1rem 0", fontSize: "14px", color: "var(--color-text-secondary)", lineHeight: 1.5 }}>
                {address.line1} {address.line2 && `, ${address.line2}`}<br/>
                {address.city}, {address.state} {address.postalCode}<br/>
                {address.country}
              </p>
              
              <div style={{ display: "flex", gap: "8px", borderTop: "1px solid var(--color-border)", paddingTop: "1rem" }}>
                <button 
                  onClick={() => handleOpenModal(address)}
                  style={{ background: "none", border: "none", color: "var(--color-text-secondary)", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px", fontSize: "13px", fontWeight: 500 }}
                >
                  <Edit2 size={14} /> Edit
                </button>
                <button 
                  onClick={() => handleDelete(address.id)}
                  style={{ background: "none", border: "none", color: "var(--color-error)", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px", fontSize: "13px", fontWeight: 500, marginLeft: "auto" }}
                >
                  <Trash2 size={14} /> Delete
                </button>
                {!address.isDefault && (
                  <button 
                    onClick={() => handleSetDefault(address.id)}
                    style={{ background: "none", border: "none", color: "var(--color-primary)", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px", fontSize: "13px", fontWeight: 500 }}
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
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(0,0,0,0.5)", zIndex: 1000,
          display: "flex", alignItems: "center", justifyContent: "center",
          padding: "1rem"
        }}>
          <div style={{
            background: "var(--color-surface)",
            padding: "2rem",
            borderRadius: "var(--radius-lg)",
            width: "100%", maxWidth: "600px",
            maxHeight: "90vh",
            overflowY: "auto"
          }}>
            <h3 style={{ marginTop: 0, marginBottom: "1.5rem" }}>{editingId ? "Edit Address" : "Add New Address"}</h3>
            
            <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input required className="form-input" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone</label>
                  <input required className="form-input" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                </div>
              </div>
              
              <div className="form-group">
                <label className="form-label">Email</label>
                <input required type="email" className="form-input" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
              </div>

              <div className="form-group">
                <label className="form-label">Address Line 1</label>
                <input required className="form-input" value={formData.line1} onChange={e => setFormData({...formData, line1: e.target.value})} />
              </div>

              <div className="form-group">
                <label className="form-label">Address Line 2 (Optional)</label>
                <input className="form-input" value={formData.line2} onChange={e => setFormData({...formData, line2: e.target.value})} />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div className="form-group">
                  <label className="form-label">City</label>
                  <input required className="form-input" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} />
                </div>
                <div className="form-group">
                  <label className="form-label">State</label>
                  <input required className="form-input" value={formData.state} onChange={e => setFormData({...formData, state: e.target.value})} />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div className="form-group">
                  <label className="form-label">Postal Code</label>
                  <input required className="form-input" value={formData.postalCode} onChange={e => setFormData({...formData, postalCode: e.target.value})} />
                </div>
                <div className="form-group">
                  <label className="form-label">Country</label>
                  <input required className="form-input" value={formData.country} onChange={e => setFormData({...formData, country: e.target.value})} />
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "0.5rem" }}>
                <input type="checkbox" id="isDefault" checked={formData.isDefault} onChange={e => setFormData({...formData, isDefault: e.target.checked})} />
                <label htmlFor="isDefault" style={{ fontSize: "14px", cursor: "pointer" }}>Set as default delivery address</label>
              </div>

              <div style={{ display: "flex", gap: "1rem", marginTop: "1rem", justifyContent: "flex-end" }}>
                <button type="button" className="btn btn-outline" onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Address</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
