"use client";

import React, { useState } from "react";
import { authService } from "@/features/auth/services/authService";
import { Shield, Key } from "lucide-react";

export default function SecurityPage() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (newPassword !== confirmPassword) {
      setError("New passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      await authService.changePassword({ currentPassword, newPassword });
      setSuccess(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || "Failed to change password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "1.5rem" }}>
        <Shield size={24} color="var(--color-primary)" />
        <h2 style={{ margin: 0 }}>Security Settings</h2>
      </div>

      <div style={{ background: "var(--color-surface)", padding: "2rem", borderRadius: "var(--radius-lg)", border: "1px solid var(--color-border)", maxWidth: "600px" }}>
        <h3 style={{ margin: "0 0 1.5rem 0", display: "flex", alignItems: "center", gap: "8px" }}>
          <Key size={18} /> Change Password
        </h3>

        {error && <div className="alert alert-error" style={{ marginBottom: "1.5rem" }}>{error}</div>}
        {success && <div className="alert alert-success" style={{ marginBottom: "1.5rem", background: "rgba(16, 185, 129, 0.1)", color: "var(--color-success)", border: "1px solid var(--color-success)", padding: "1rem", borderRadius: "var(--radius-md)" }}>Password changed successfully!</div>}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          <div className="form-group">
            <label className="form-label">Current Password</label>
            <input 
              type="password" 
              required 
              className="form-input" 
              value={currentPassword} 
              onChange={e => setCurrentPassword(e.target.value)} 
            />
          </div>

          <div className="form-group">
            <label className="form-label">New Password</label>
            <input 
              type="password" 
              required 
              className="form-input" 
              value={newPassword} 
              onChange={e => setNewPassword(e.target.value)} 
              minLength={8}
            />
            <p style={{ fontSize: "12px", color: "var(--color-text-muted)", marginTop: "4px", marginBottom: 0 }}>
              Must be at least 8 characters long, contain an uppercase letter, a number, and a special character.
            </p>
          </div>

          <div className="form-group">
            <label className="form-label">Confirm New Password</label>
            <input 
              type="password" 
              required 
              className="form-input" 
              value={confirmPassword} 
              onChange={e => setConfirmPassword(e.target.value)} 
            />
          </div>

          <button 
            type="submit" 
            className="btn btn-primary" 
            disabled={loading}
            style={{ marginTop: "1rem", alignSelf: "flex-start" }}
          >
            {loading ? "Updating..." : "Update Password"}
          </button>
        </form>
      </div>
    </div>
  );
}
