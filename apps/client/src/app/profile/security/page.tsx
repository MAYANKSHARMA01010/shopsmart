"use client";

import React, { useState } from "react";
import { authService } from "@/features/auth/services/authService";
import toast from "react-hot-toast";

function IconShield() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}

function IconEyeOff() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}

function IconEye() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function IconCheck() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

export default function SecurityPage() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pwChecks = {
    length: newPassword.length >= 8,
    number: /\d/.test(newPassword),
    uppercase: /[A-Z]/.test(newPassword),
    special: /[^A-Za-z0-9]/.test(newPassword),
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (newPassword !== confirmPassword) {
      const msg = "New passwords do not match.";
      setError(msg);
      toast.error(msg);
      return;
    }

    setLoading(true);
    try {
      await authService.changePassword({ currentPassword, newPassword });
      toast.success("Password changed successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: unknown) {
      const msg = err instanceof Error ? (err as { response?: { data?: { message?: string } } }).response?.data?.message ?? err.message : "Failed to change password";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="profile-section-card" style={{ padding: "var(--space-6)" }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "var(--space-3)",
          marginBottom: "var(--space-6)",
          paddingBottom: "var(--space-4)",
          borderBottom: "1px solid var(--color-border)",
        }}
      >
        <div style={{ color: "var(--color-primary)" }}>
          <IconShield />
        </div>
        <div>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: "1.5rem", fontWeight: 700, margin: 0, color: "var(--color-text-primary)" }}>
            Security & Password
          </h1>
          <p style={{ margin: "var(--space-1) 0 0", color: "var(--color-text-muted)", fontSize: "0.875rem" }}>
            Ensure your account is using a long, random password to stay secure.
          </p>
        </div>
      </div>

      {error && (
        <div className="form-error-banner" role="alert" style={{ marginBottom: "var(--space-4)" }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ maxWidth: "520px", display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
        {/* Current Password */}
        <div className="form-group">
          <label className="form-label" htmlFor="cur-password">Current Password</label>
          <div className="form-input-wrapper">
            <input
              id="cur-password"
              type={showCurrent ? "text" : "password"}
              required
              className="form-input form-input-with-icon"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              autoComplete="current-password"
            />
            <button
              type="button"
              className="form-input-icon-btn"
              onClick={() => setShowCurrent((v) => !v)}
              aria-label={showCurrent ? "Hide password" : "Show password"}
            >
              {showCurrent ? <IconEyeOff /> : <IconEye />}
            </button>
          </div>
        </div>

        {/* New Password */}
        <div className="form-group">
          <label className="form-label" htmlFor="new-password">New Password</label>
          <div className="form-input-wrapper">
            <input
              id="new-password"
              type={showNew ? "text" : "password"}
              required
              className="form-input form-input-with-icon"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              minLength={8}
              autoComplete="new-password"
            />
            <button
              type="button"
              className="form-input-icon-btn"
              onClick={() => setShowNew((v) => !v)}
              aria-label={showNew ? "Hide password" : "Show password"}
            >
              {showNew ? <IconEyeOff /> : <IconEye />}
            </button>
          </div>

          {newPassword.length > 0 && (
            <div className="pw-requirements" style={{ marginTop: "var(--space-2)" }}>
              <span className={`pw-req${pwChecks.length ? " met" : ""}`}>
                <IconCheck /> 8+ chars
              </span>
              <span className={`pw-req${pwChecks.uppercase ? " met" : ""}`}>
                <IconCheck /> 1 uppercase
              </span>
              <span className={`pw-req${pwChecks.number ? " met" : ""}`}>
                <IconCheck /> 1 number
              </span>
              <span className={`pw-req${pwChecks.special ? " met" : ""}`}>
                <IconCheck /> 1 special
              </span>
            </div>
          )}
        </div>

        {/* Confirm Password */}
        <div className="form-group">
          <label className="form-label" htmlFor="confirm-password">Confirm New Password</label>
          <input
            id="confirm-password"
            type="password"
            required
            className="form-input"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            autoComplete="new-password"
          />
        </div>

        <button
          type="submit"
          className={`btn btn-primary${loading ? " btn-loading" : ""}`}
          disabled={loading}
          style={{ marginTop: "var(--space-2)", height: "44px", alignSelf: "flex-start", padding: "0 24px" }}
        >
          {loading ? "" : "Update Password"}
        </button>
      </form>
    </div>
  );
}
