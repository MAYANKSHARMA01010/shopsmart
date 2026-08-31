"use client";

import { useEffect, useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "../../features/auth/AuthContext";
import { updateProfileSchema, type UpdateProfileFormValues } from "../../features/auth/types/authSchema";
import Link from "next/link";
import toast from "react-hot-toast";

function IconEdit() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  );
}

function IconCheck() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function IconOrder() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
    </svg>
  );
}

function IconAddress() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
    </svg>
  );
}

function IconStar() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

function IconShieldCheck() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <polyline points="9 12 11 14 15 10" />
    </svg>
  );
}

export default function ProfilePage() {
  const { user, updateProfile, sendEmailOtp, verifyEmailOtp, sendPhoneOtp, verifyPhoneOtp } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // OTP Verification Modal State
  const [verifyType, setVerifyType] = useState<"email" | "phone" | null>(null);
  const [otpCode, setOtpCode] = useState("");
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [resendTimer, setResendTimer] = useState(30);
  const [debugOtp, setDebugOtp] = useState<string | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UpdateProfileFormValues>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: { name: "", username: "", phone: "", gender: "" },
  });

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (user) {
      reset({
        name: user.name,
        username: user.username || "",
        phone: user.phone || "",
        gender: user.gender || "",
      });
    }
  }, [user, reset]);

  // Resend countdown timer
  useEffect(() => {
    if (verifyType) {
      setResendTimer(30);
      setOtpCode("");
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        setResendTimer((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [verifyType]);

  if (!mounted || !user) return null;

  const onSubmit = async (data: UpdateProfileFormValues) => {
    setIsSubmitting(true);
    try {
      await updateProfile(data);
      toast.success("Profile updated successfully!");
      setIsEditing(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? (err as { response?: { data?: { message?: string } } }).response?.data?.message ?? err.message : "Failed to update profile";
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenVerifyModal = async (type: "email" | "phone") => {
    if (type === "phone" && (!user.phone || user.phone.trim() === "")) {
      toast.error("Please add and save your phone number first.");
      return;
    }
    setIsSendingOtp(true);
    setDebugOtp(null);
    try {
      if (type === "email") {
        const res = await sendEmailOtp();
        if (res.debugOtp) setDebugOtp(res.debugOtp);
        toast.success("Verification code sent to your email! (Expires in 5 mins)");
      } else {
        const res = await sendPhoneOtp();
        if (res.debugOtp) setDebugOtp(res.debugOtp);
        toast.success("Verification code sent to your phone! (Expires in 5 mins)");
      }
      setVerifyType(type);
    } catch (err: unknown) {
      const msg = err instanceof Error ? (err as { response?: { data?: { message?: string } } }).response?.data?.message ?? err.message : "Failed to send verification code";
      toast.error(msg);
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleResendCode = async () => {
    if (resendTimer > 0 || isSendingOtp || !verifyType) return;
    setIsSendingOtp(true);
    try {
      if (verifyType === "email") {
        const res = await sendEmailOtp();
        if (res.debugOtp) setDebugOtp(res.debugOtp);
        toast.success("New verification code sent to your email!");
      } else {
        const res = await sendPhoneOtp();
        if (res.debugOtp) setDebugOtp(res.debugOtp);
        toast.success("New verification code sent to your phone!");
      }
      setResendTimer(30);
    } catch (err: unknown) {
      const msg = err instanceof Error ? (err as { response?: { data?: { message?: string } } }).response?.data?.message ?? err.message : "Failed to resend code";
      toast.error(msg);
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleConfirmVerification = async () => {
    if (!verifyType) return;
    if (!otpCode || otpCode.trim().length !== 6) {
      toast.error("Please enter the complete 6-digit verification code.");
      return;
    }
    setIsVerifying(true);
    try {
      if (verifyType === "email") {
        await verifyEmailOtp(otpCode.trim());
        toast.success("Email address verified successfully! 🎉");
      } else {
        await verifyPhoneOtp(otpCode.trim());
        toast.success("Phone number verified successfully! 🎉");
      }
      setVerifyType(null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? (err as { response?: { data?: { message?: string } } }).response?.data?.message ?? err.message : "Verification failed";
      toast.error(msg);
    } finally {
      setIsVerifying(false);
    }
  };

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" });

  const hasPhoneSet = Boolean(user.phone && user.phone.trim().length > 0);

  return (
    <>
      {/* Stats row */}
      <div className="profile-stats-row">
        <div className="profile-stat-card">
          <div className="profile-stat-icon"><IconOrder /></div>
          <div>
            <div className="profile-stat-value">—</div>
            <div className="profile-stat-label">Orders placed</div>
          </div>
        </div>
        <div className="profile-stat-card">
          <div className="profile-stat-icon"><IconAddress /></div>
          <div>
            <div className="profile-stat-value">—</div>
            <div className="profile-stat-label">Saved addresses</div>
          </div>
        </div>
        <div className="profile-stat-card">
          <div className="profile-stat-icon"><IconStar /></div>
          <div>
            <div className="profile-stat-value">—</div>
            <div className="profile-stat-label">Reviews written</div>
          </div>
        </div>
      </div>

      {/* Profile info card */}
      <div className="profile-section-card">
        <div className="profile-section-header">
          <h2 className="profile-section-title">Personal Information</h2>
          {!isEditing && (
            <button
              className="btn btn-secondary"
              style={{ gap: "var(--space-2)", display: "flex", alignItems: "center" }}
              onClick={() => setIsEditing(true)}
            >
              <IconEdit /> Edit Profile
            </button>
          )}
        </div>

        <div className="profile-section-body">
          <form onSubmit={handleSubmit(onSubmit)} style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }} noValidate>
            <div className="form-grid">
              {/* Full Name */}
              <div className="form-group">
                <div style={{ display: "flex", alignItems: "center", minHeight: "24px", marginBottom: "var(--space-2)" }}>
                  <label className="form-label" htmlFor="prof-name" style={{ margin: 0 }}>Full Name</label>
                </div>
                <input
                  id="prof-name"
                  type="text"
                  className={`form-input${errors.name ? " input-error" : ""}`}
                  {...register("name")}
                  readOnly={!isEditing}
                  disabled={!isEditing}
                  style={!isEditing ? { opacity: 0.8 } : {}}
                />
                {errors.name && <span className="error-message">{errors.name.message}</span>}
              </div>

              {/* Username */}
              <div className="form-group">
                <div style={{ display: "flex", alignItems: "center", minHeight: "24px", marginBottom: "var(--space-2)" }}>
                  <label className="form-label" htmlFor="prof-username" style={{ margin: 0 }}>Username</label>
                </div>
                <input
                  id="prof-username"
                  type="text"
                  className={`form-input${errors.username ? " input-error" : ""}`}
                  {...register("username")}
                  readOnly={!isEditing}
                  disabled={!isEditing}
                  style={!isEditing ? { opacity: 0.8 } : {}}
                  placeholder={!isEditing && !user.username ? "Not set" : ""}
                />
                {errors.username && <span className="error-message">{errors.username.message}</span>}
              </div>


              {/* Email — always read-only */}
              <div className="form-group">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", minHeight: "24px", marginBottom: "var(--space-2)" }}>
                  <label className="form-label" htmlFor="prof-email" style={{ margin: 0 }}>
                    Email Address
                  </label>
                  {user.isEmailVerified ? (
                    <span
                      id="badge-email-verified"
                      style={{
                        fontSize: "0.72rem",
                        fontWeight: 600,
                        color: "var(--color-success, #059669)",
                        background: "rgba(16, 185, 129, 0.12)",
                        border: "1px solid rgba(16, 185, 129, 0.25)",
                        padding: "2px 8px",
                        borderRadius: "9999px",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "4px",
                        lineHeight: "1.2",
                      }}
                    >
                      <IconCheck /> Verified
                    </span>
                  ) : (
                    <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                      <span
                        id="badge-email-unverified"
                        style={{
                          fontSize: "0.72rem",
                          fontWeight: 600,
                          color: "#d97706",
                          background: "rgba(245, 158, 11, 0.12)",
                          border: "1px solid rgba(245, 158, 11, 0.25)",
                          padding: "2px 8px",
                          borderRadius: "9999px",
                          lineHeight: "1.2",
                        }}
                      >
                        Not Verified
                      </span>
                      <button
                        type="button"
                        id="btn-verify-email"
                        style={{
                          padding: "2px 10px",
                          fontSize: "0.72rem",
                          fontWeight: 600,
                          borderRadius: "9999px",
                          background: "var(--color-primary, #0f766e)",
                          color: "#ffffff",
                          border: "none",
                          cursor: isSendingOtp ? "not-allowed" : "pointer",
                          transition: "all 0.15s ease",
                          lineHeight: "1.4",
                          display: "inline-flex",
                          alignItems: "center",
                        }}
                        onClick={() => handleOpenVerifyModal("email")}
                        disabled={isSendingOtp}
                      >
                        {isSendingOtp && verifyType === "email" ? "Sending…" : "Verify"}
                      </button>
                    </div>
                  )}
                </div>
                <input
                  id="prof-email"
                  type="email"
                  className="form-input"
                  value={user.email}
                  readOnly
                  disabled
                  style={{ opacity: 0.8, width: "100%" }}
                />
              </div>

              {/* Phone */}
              <div className="form-group">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", minHeight: "24px", marginBottom: "var(--space-2)" }}>
                  <label className="form-label" htmlFor="prof-phone" style={{ margin: 0 }}>
                    Phone Number
                  </label>
                  {/* Show verify badge/button ONLY when phone number is set */}
                  {hasPhoneSet && (
                    user.isPhoneVerified ? (
                      <span
                        id="badge-phone-verified"
                        style={{
                          fontSize: "0.72rem",
                          fontWeight: 600,
                          color: "var(--color-success, #059669)",
                          background: "rgba(16, 185, 129, 0.12)",
                          border: "1px solid rgba(16, 185, 129, 0.25)",
                          padding: "2px 8px",
                          borderRadius: "9999px",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "4px",
                          lineHeight: "1.2",
                        }}
                      >
                        <IconCheck /> Verified
                      </span>
                    ) : (
                      <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                        <span
                          id="badge-phone-unverified"
                          style={{
                            fontSize: "0.72rem",
                            fontWeight: 600,
                            color: "#d97706",
                            background: "rgba(245, 158, 11, 0.12)",
                            border: "1px solid rgba(245, 158, 11, 0.25)",
                            padding: "2px 8px",
                            borderRadius: "9999px",
                            lineHeight: "1.2",
                          }}
                        >
                          Not Verified
                        </span>
                        <button
                          type="button"
                          id="btn-verify-phone"
                          style={{
                            padding: "2px 10px",
                            fontSize: "0.72rem",
                            fontWeight: 600,
                            borderRadius: "9999px",
                            background: "var(--color-primary, #0f766e)",
                            color: "#ffffff",
                            border: "none",
                            cursor: isSendingOtp ? "not-allowed" : "pointer",
                            transition: "all 0.15s ease",
                            lineHeight: "1.4",
                            display: "inline-flex",
                            alignItems: "center",
                          }}
                          onClick={() => handleOpenVerifyModal("phone")}
                          disabled={isSendingOtp}
                        >
                          {isSendingOtp && verifyType === "phone" ? "Sending…" : "Verify"}
                        </button>
                      </div>
                    )
                  )}
                </div>
                <input
                  id="prof-phone"
                  type="text"
                  className={`form-input${errors.phone ? " input-error" : ""}`}
                  {...register("phone")}
                  readOnly={!isEditing}
                  disabled={!isEditing}
                  style={{ opacity: !isEditing ? 0.8 : 1, width: "100%" }}
                  placeholder={!isEditing && !user.phone ? "Not set" : "Enter phone number"}
                />
                {errors.phone && <span className="error-message">{errors.phone.message}</span>}
              </div>


              {/* Gender */}
              <div className="form-group">
                <div style={{ display: "flex", alignItems: "center", minHeight: "24px", marginBottom: "var(--space-2)" }}>
                  <label className="form-label" htmlFor="prof-gender" style={{ margin: 0 }}>Gender</label>
                </div>
                <select
                  id="prof-gender"
                  className={`form-input${errors.gender ? " input-error" : ""}`}
                  {...register("gender")}
                  disabled={!isEditing}
                  style={!isEditing ? { opacity: 0.8 } : {}}
                >
                  <option value="">Prefer not to say</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
                {errors.gender && <span className="error-message">{errors.gender.message}</span>}
              </div>

              {/* Member since — read-only */}
              <div className="form-group">
                <div style={{ display: "flex", alignItems: "center", minHeight: "24px", marginBottom: "var(--space-2)" }}>
                  <label className="form-label" htmlFor="prof-joined" style={{ margin: 0 }}>Member Since</label>
                </div>
                <input
                  id="prof-joined"
                  type="text"
                  className="form-input"
                  value={formatDate(user.createdAt)}
                  readOnly
                  disabled
                  style={{ opacity: 0.8 }}
                />
              </div>

            </div>

            {isEditing && (
              <div style={{ display: "flex", gap: "var(--space-3)", marginTop: "var(--space-2)" }}>
                <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                  {isSubmitting ? "Saving…" : "Save Changes"}
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setIsEditing(false);
                    reset({ name: user.name, username: user.username || "", phone: user.phone || "", gender: user.gender || "" });
                  }}
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
              </div>
            )}
          </form>
        </div>
      </div>

      {/* Quick links */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-4)" }}>
        <Link href="/profile/orders" style={{ textDecoration: "none" }}>
          <div className="profile-section-card" style={{ padding: "var(--space-5)", cursor: "pointer", transition: "box-shadow 0.2s" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
              <div className="profile-stat-icon"><IconOrder /></div>
              <div>
                <div style={{ fontWeight: 600, fontSize: "0.9rem", color: "var(--color-text-primary)" }}>My Orders</div>
                <div style={{ fontSize: "0.78rem", color: "var(--color-text-muted)" }}>View order history →</div>
              </div>
            </div>
          </div>
        </Link>
        <Link href="/profile/addresses" style={{ textDecoration: "none" }}>
          <div className="profile-section-card" style={{ padding: "var(--space-5)", cursor: "pointer", transition: "box-shadow 0.2s" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
              <div className="profile-stat-icon"><IconAddress /></div>
              <div>
                <div style={{ fontWeight: 600, fontSize: "0.9rem", color: "var(--color-text-primary)" }}>Saved Addresses</div>
                <div style={{ fontSize: "0.78rem", color: "var(--color-text-muted)" }}>Manage delivery addresses →</div>
              </div>
            </div>
          </div>
        </Link>
      </div>

      {/* Verification Modal */}
      {verifyType && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0, 0, 0, 0.6)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: "var(--space-4)",
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setVerifyType(null);
          }}
        >
          <div
            className="profile-section-card"
            style={{
              width: "100%",
              maxWidth: "440px",
              padding: "var(--space-6)",
              borderRadius: "var(--radius-lg)",
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
              background: "var(--color-surface, #ffffff)",
              border: "1px solid var(--color-border)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)", marginBottom: "var(--space-4)" }}>
              <div style={{ color: "var(--color-primary)", display: "flex" }}>
                <IconShieldCheck />
              </div>
              <h3 style={{ margin: 0, fontSize: "1.2rem", fontWeight: 700, color: "var(--color-text-primary)" }}>
                {verifyType === "email" ? "Verify Email Address" : "Verify Phone Number"}
              </h3>
            </div>

            <p style={{ fontSize: "0.88rem", color: "var(--color-text-muted)", marginBottom: "var(--space-4)", lineHeight: 1.5 }}>
              We sent a 6-digit verification code to{" "}
              <strong style={{ color: "var(--color-text-primary)" }}>
                {verifyType === "email" ? user.email : user.phone}
              </strong>.
              It is valid for <strong>5 minutes</strong>.
            </p>

            <div style={{ marginBottom: "var(--space-5)" }}>
              <label
                htmlFor="verification-otp"
                style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "var(--color-text-muted)", marginBottom: "var(--space-2)" }}
              >
                Verification Code (6 Digits)
              </label>
              <input
                id="verification-otp"
                type="text"
                maxLength={6}
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.replace(/[^0-9]/g, ""))}
                placeholder="••••••"
                autoFocus
                style={{
                  width: "100%",
                  textAlign: "center",
                  fontSize: "1.6rem",
                  letterSpacing: "0.4rem",
                  fontWeight: 700,
                  padding: "var(--space-3)",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid var(--color-border)",
                  background: "var(--color-background)",
                  color: "var(--color-text-primary)",
                  outline: "none",
                }}
              />
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "var(--space-2)", fontSize: "0.78rem" }}>
                {debugOtp ? (
                  <button
                    type="button"
                    onClick={() => setOtpCode(debugOtp)}
                    style={{
                      background: "rgba(59, 130, 246, 0.1)",
                      border: "1px dashed rgba(59, 130, 246, 0.4)",
                      padding: "2px 8px",
                      borderRadius: "var(--radius-sm)",
                      color: "var(--color-primary)",
                      cursor: "pointer",
                      fontSize: "0.72rem",
                      fontWeight: 600,
                    }}
                  >
                    Auto-fill demo code: {debugOtp}
                  </button>
                ) : (
                  <span style={{ color: "#ef4444", fontWeight: 500 }}>Expires in 5 minutes</span>
                )}
                <button
                  type="button"
                  onClick={handleResendCode}
                  disabled={resendTimer > 0 || isSendingOtp}
                  style={{
                    background: "none",
                    border: "none",
                    padding: 0,
                    color: resendTimer > 0 ? "var(--color-text-muted)" : "var(--color-primary)",
                    cursor: resendTimer > 0 ? "default" : "pointer",
                    fontWeight: 600,
                    textDecoration: resendTimer === 0 ? "underline" : "none",
                  }}
                >
                  {resendTimer > 0 ? `Resend in ${resendTimer}s` : "Resend Code"}
                </button>
              </div>
            </div>

            <div style={{ display: "flex", gap: "var(--space-3)" }}>
              <button
                type="button"
                className="btn btn-secondary"
                style={{ flex: 1 }}
                onClick={() => setVerifyType(null)}
                disabled={isVerifying}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-primary"
                style={{ flex: 2 }}
                onClick={handleConfirmVerification}
                disabled={isVerifying || otpCode.length !== 6}
              >
                {isVerifying ? "Verifying…" : "Confirm Verification"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
