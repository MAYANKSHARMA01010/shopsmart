"use client";

import { useEffect, useState } from "react";
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

export default function ProfilePage() {
  const { user, updateProfile } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

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

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" });

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
                <label className="form-label" htmlFor="prof-name">Full Name</label>
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
                <label className="form-label" htmlFor="prof-username">Username</label>
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
                <label className="form-label" htmlFor="prof-email">Email Address</label>
                <div style={{ display: "flex", gap: "var(--space-2)", alignItems: "center" }}>
                  <input
                    id="prof-email"
                    type="email"
                    className="form-input"
                    value={user.email}
                    readOnly
                    disabled
                    style={{ opacity: 0.8, flex: 1 }}
                  />
                  {!user.isEmailVerified && (
                    <span style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--color-warning)", background: "var(--color-warning-surface)", border: "1px solid var(--color-warning-border)", padding: "2px 8px", borderRadius: "var(--radius-full)", whiteSpace: "nowrap" }}>
                      Not Verified
                    </span>
                  )}
                </div>
              </div>

              {/* Phone */}
              <div className="form-group">
                <label className="form-label" htmlFor="prof-phone">Phone Number</label>
                <input
                  id="prof-phone"
                  type="text"
                  className={`form-input${errors.phone ? " input-error" : ""}`}
                  {...register("phone")}
                  readOnly={!isEditing}
                  disabled={!isEditing}
                  style={!isEditing ? { opacity: 0.8 } : {}}
                  placeholder={!isEditing && !user.phone ? "Not set" : ""}
                />
                {errors.phone && <span className="error-message">{errors.phone.message}</span>}
              </div>

              {/* Gender */}
              <div className="form-group">
                <label className="form-label" htmlFor="prof-gender">Gender</label>
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
                <label className="form-label" htmlFor="prof-joined">Member Since</label>
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
    </>
  );
}
