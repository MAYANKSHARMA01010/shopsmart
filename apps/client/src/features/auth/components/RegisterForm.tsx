"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../AuthContext";
import Link from "next/link";

import toast from "react-hot-toast";

export function RegisterForm() {
  const { register } = useAuth();
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [phone, setPhone] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      const msg = "Please fill in all required fields";
      setError(msg);
      toast.error(msg);
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      await register({
        name,
        email,
        username: username || undefined,
        password,
        phone: phone || undefined,
      });
      toast.success("Account created successfully!");
      router.push("/products");
    } catch (err: any) {
      const msg = err.message || "Registration failed. Try again.";
      setError(msg);
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="card" style={{ maxWidth: "460px", margin: "40px auto", width: "100%", padding: "32px" }}>
      <h2 style={{ fontFamily: "var(--font-display)", fontSize: "28px", marginBottom: "8px", textAlign: "center", color: "var(--color-text-primary)" }}>
        Create Account
      </h2>
      <p style={{ color: "var(--color-text-secondary)", textAlign: "center", marginBottom: "24px", fontSize: "14px" }}>
        Sign up to start listing and purchasing products
      </p>

      {error && (
        <div
          style={{
            background: "var(--color-error-surface)",
            border: "1px solid var(--color-error-border)",
            color: "var(--color-error)",
            padding: "12px",
            borderRadius: "var(--radius)",
            fontSize: "13px",
            marginBottom: "16px",
          }}
        >
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <label style={{ fontSize: "13px", fontWeight: 600, color: "var(--color-text-secondary)" }}>
            Full Name <span style={{ color: "var(--color-error)" }}>*</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="John Doe"
            required
            style={{
              padding: "10px 12px",
              borderRadius: "var(--radius)",
              border: "1px solid var(--color-border)",
              background: "var(--color-surface)",
              color: "var(--color-text-primary)",
              fontSize: "14px",
              outline: "none",
            }}
          />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <label style={{ fontSize: "13px", fontWeight: 600, color: "var(--color-text-secondary)" }}>
            Email Address <span style={{ color: "var(--color-error)" }}>*</span>
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="john@example.com"
            required
            style={{
              padding: "10px 12px",
              borderRadius: "var(--radius)",
              border: "1px solid var(--color-border)",
              background: "var(--color-surface)",
              color: "var(--color-text-primary)",
              fontSize: "14px",
              outline: "none",
            }}
          />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <label style={{ fontSize: "13px", fontWeight: 600, color: "var(--color-text-secondary)" }}>
            Username <span style={{ color: "var(--color-text-muted)", fontWeight: "normal" }}>(Optional)</span>
          </label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="johndoe"
            style={{
              padding: "10px 12px",
              borderRadius: "var(--radius)",
              border: "1px solid var(--color-border)",
              background: "var(--color-surface)",
              color: "var(--color-text-primary)",
              fontSize: "14px",
              outline: "none",
            }}
          />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <label style={{ fontSize: "13px", fontWeight: 600, color: "var(--color-text-secondary)" }}>
            Phone Number <span style={{ color: "var(--color-text-muted)", fontWeight: "normal" }}>(Optional)</span>
          </label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+919876543210"
            style={{
              padding: "10px 12px",
              borderRadius: "var(--radius)",
              border: "1px solid var(--color-border)",
              background: "var(--color-surface)",
              color: "var(--color-text-primary)",
              fontSize: "14px",
              outline: "none",
            }}
          />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <label style={{ fontSize: "13px", fontWeight: 600, color: "var(--color-text-secondary)" }}>
            Password <span style={{ color: "var(--color-error)" }}>*</span>
          </label>
          <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Min 8 chars, uppercase, number, special char"
              required
              style={{
                padding: "10px 12px",
                paddingRight: "50px",
                borderRadius: "var(--radius)",
                border: "1px solid var(--color-border)",
                background: "var(--color-surface)",
                color: "var(--color-text-primary)",
                fontSize: "14px",
                outline: "none",
                width: "100%",
                boxSizing: "border-box",
              }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: "absolute",
                right: "12px",
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: 0,
                color: "var(--color-text-secondary)",
                fontSize: "12px",
                fontWeight: 600,
              }}
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
        </div>

        <button
          type="submit"
          className={`btn btn-primary ${isSubmitting ? "btn-loading" : ""}`}
          disabled={isSubmitting}
          style={{ marginTop: "8px", height: "42px" }}
        >
          {isSubmitting ? "" : "Create Account"}
        </button>
      </form>

      <p style={{ marginTop: "24px", textAlign: "center", fontSize: "13px", color: "var(--color-text-secondary)" }}>
        Already have an account?{" "}
        <Link href="/login" style={{ color: "var(--color-primary)", fontWeight: 600, textDecoration: "none" }}>
          Sign In
        </Link>
      </p>
    </div>
  );
}
