"use client";

import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "../AuthContext";
import Link from "next/link";
import toast from "react-hot-toast";

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

function PasswordRequirement({ met, label }: { met: boolean; label: string }) {
  return (
    <span className={`pw-req${met ? " met" : ""}`}>
      <IconCheck /> {label}
    </span>
  );
}

export function RegisterForm() {
  const { register } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect") || "/products";
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [phone, setPhone] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const pwChecks = {
    length:    password.length >= 8,
    number:    /\d/.test(password),
    uppercase: /[A-Z]/.test(password),
    special:   /[^A-Za-z0-9]/.test(password),
  };

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
      router.push(redirectUrl);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Registration failed. Try again.";
      setError(msg);
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-card auth-card-wide">
      {/* Brand mark */}
      <div className="auth-brand-mark" aria-hidden="true">S</div>

      <h1 className="auth-title">Create Your Account</h1>
      <p className="auth-subtitle">
        Join ShopSmart for curated artisanal finds, fast checkout, and order tracking.
      </p>

      {error && (
        <div className="form-error-banner" role="alert">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="auth-form" noValidate>
        {/* Name + Username row */}
        <div className="form-grid">
          <div className="form-field">
            <label className="form-label" htmlFor="reg-name">
              FULL NAME <span className="form-required">*</span>
            </label>
            <input
              id="reg-name"
              type="text"
              className="form-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Mayank Sharma"
              required
              autoComplete="name"
              autoFocus
            />
          </div>

          <div className="form-field">
            <label className="form-label" htmlFor="reg-username">
              USERNAME
            </label>
            <input
              id="reg-username"
              type="text"
              className="form-input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="mayank_s"
              autoComplete="username"
            />
          </div>
        </div>

        {/* Email */}
        <div className="form-field">
          <label className="form-label" htmlFor="reg-email">
            EMAIL ADDRESS <span className="form-required">*</span>
          </label>
          <input
            id="reg-email"
            type="email"
            className="form-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="user@domain.com"
            required
            autoComplete="email"
          />
        </div>

        {/* Password */}
        <div className="form-field">
          <label className="form-label" htmlFor="reg-password">
            PASSWORD <span className="form-required">*</span>
          </label>
          <div className="form-input-wrapper">
            <input
              id="reg-password"
              type={showPassword ? "text" : "password"}
              className="form-input form-input-with-icon"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              autoComplete="new-password"
            />
            <button
              type="button"
              className="form-input-icon-btn"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <IconEyeOff /> : <IconEye />}
            </button>
          </div>

          {/* Password strength indicators */}
          {password.length > 0 && (
            <div className="pw-requirements">
              <PasswordRequirement met={pwChecks.length}    label="8+ chars" />
              <PasswordRequirement met={pwChecks.uppercase} label="1 uppercase" />
              <PasswordRequirement met={pwChecks.number}    label="1 number" />
              <PasswordRequirement met={pwChecks.special}   label="1 special" />
            </div>
          )}
        </div>

        {/* Phone */}
        <div className="form-field">
          <label className="form-label" htmlFor="reg-phone">
            PHONE NUMBER <span className="form-label-opt">(Optional)</span>
          </label>
          <div className="form-phone-row">
            <div className="form-phone-code">+91</div>
            <input
              id="reg-phone"
              type="tel"
              className="form-input form-input-phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="98765 43210"
              autoComplete="tel"
            />
          </div>
        </div>

        <button
          id="register-submit"
          type="submit"
          className={`btn btn-primary auth-submit-btn${isSubmitting ? " btn-loading" : ""}`}
          disabled={isSubmitting}
        >
          {isSubmitting ? "" : "Create Account"}
        </button>
      </form>

      <p className="auth-legal-text">
        By signing up, you agree to ShopSmart&apos;s{" "}
        <Link href="/terms" className="auth-footer-link">Terms of Service</Link>{" "}
        and{" "}
        <Link href="/privacy" className="auth-footer-link">Privacy Policy</Link>.
      </p>

      <p className="auth-footer-text">
        Already have an account?{" "}
        <Link href="/login" className="auth-footer-link">
          Sign in here
        </Link>
      </p>
    </div>
  );
}
