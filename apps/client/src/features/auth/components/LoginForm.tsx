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

export function LoginForm() {
  const { login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect") || "/products";
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier || !password) {
      const msg = "Please fill in all fields";
      setError(msg);
      toast.error(msg);
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      await login({ identifier, password });
      toast.success("Welcome back!");
      router.push(redirectUrl);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Invalid credentials";
      setError(msg);
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-card">
      {/* Brand mark */}
      <div className="auth-brand-mark" aria-hidden="true">S</div>

      <h1 className="auth-title">Welcome Back</h1>
      <p className="auth-subtitle">
        Sign in to your ShopSmart account to continue shopping.
      </p>

      {error && (
        <div className="form-error-banner" role="alert">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="auth-form" noValidate>
        <div className="form-field">
          <label className="form-label" htmlFor="login-identifier">
            EMAIL OR USERNAME
          </label>
          <input
            id="login-identifier"
            type="text"
            className="form-input"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            placeholder="user@example.com"
            required
            autoComplete="username"
            autoFocus
          />
        </div>

        <div className="form-field">
          <label className="form-label" htmlFor="login-password">
            PASSWORD
          </label>
          <div className="form-input-wrapper">
            <input
              id="login-password"
              type={showPassword ? "text" : "password"}
              className="form-input form-input-with-icon"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              autoComplete="current-password"
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
        </div>

        <button
          id="login-submit"
          type="submit"
          className={`btn btn-primary auth-submit-btn${isSubmitting ? " btn-loading" : ""}`}
          disabled={isSubmitting}
        >
          {isSubmitting ? "" : "Sign In"}
        </button>
      </form>

      <p className="auth-footer-text">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="auth-footer-link">
          Create one
        </Link>
      </p>
    </div>
  );
}
