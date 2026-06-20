"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "../../features/auth/AuthContext";
import { updateProfileSchema, type UpdateProfileFormValues } from "../../features/auth/types/authSchema";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function ProfilePage() {
  const { user, updateProfile } = useAuth(); // login is essentially setAuth
  const router = useRouter();
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
    defaultValues: {
      name: "",
      username: "",
      phone: "",
      gender: "",
    },
  });

  useEffect(() => {
    // eslint-disable-next-line
    setMounted(true);
  }, []);

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

  if (!mounted || !user) {
    return null; // Layout handles loading state
  }

  const onSubmit = async (data: UpdateProfileFormValues) => {
    setIsSubmitting(true);
    try {
      await updateProfile(data);
      toast.success("Profile updated successfully!");
      setIsEditing(false);
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || "Failed to update profile");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", { year: 'numeric', month: 'long', day: 'numeric' });
  };

  return (
    <>
      <div style={{ background: "var(--color-surface)", padding: "2rem", borderRadius: "var(--radius-lg)", border: "1px solid var(--color-border)" }}>
        <div style={{ display: "flex", gap: "2rem", marginBottom: "2rem", alignItems: "flex-start" }}>
          <div style={{ width: "80px", height: "80px", borderRadius: "50%", background: "var(--color-primary)", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2rem", fontWeight: "bold" }}>
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div style={{ flex: 1 }}>
            <h2 style={{ margin: "0 0 0.5rem 0", display: "flex", alignItems: "center", gap: "1rem" }}>
              {user.name}
            </h2>
          </div>
          {!isEditing && (
            <button onClick={() => setIsEditing(true)} className="btn btn-outline" style={{ alignSelf: "flex-start" }}>
              Edit Profile
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit(onSubmit)} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
            {/* Row 1: Joined & Email */}
            <div className="form-group">
              <label className="form-label" htmlFor="joined">Joined Date</label>
              <input
                id="joined"
                type="text"
                className="form-input"
                value={formatDate(user.createdAt)}
                readOnly
                disabled
                style={{ opacity: 0.7 }}
              />
            </div>
            
            <div className="form-group">
              <label className="form-label" htmlFor="email">Email</label>
              <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                <input
                  id="email"
                  type="email"
                  className="form-input"
                  value={user.email}
                  readOnly
                  disabled
                  style={{ opacity: 0.7, flex: 1 }}
                />
                {!user.isEmailVerified && (
                  <span style={{ fontSize: "0.8rem", color: "var(--color-warning, #f59e0b)", background: "rgba(245, 158, 11, 0.1)", padding: "0.25rem 0.5rem", borderRadius: "4px", whiteSpace: "nowrap" }}>
                    Not Verified
                  </span>
                )}
              </div>
            </div>

            {/* Row 2: Phone & Username */}
            <div className="form-group">
              <label className="form-label" htmlFor="phone">Phone Number</label>
              <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                <input
                  id="phone"
                  type="text"
                  className={`form-input ${errors.phone ? "input-error" : ""}`}
                  {...register("phone")}
                  readOnly={!isEditing}
                  disabled={!isEditing}
                  style={!isEditing ? { opacity: 0.7, flex: 1 } : { flex: 1 }}
                  placeholder={!isEditing ? "Not provided" : ""}
                />
                {(!isEditing && user.phone) || (isEditing && user.phone) ? (
                  <span style={{ fontSize: "0.8rem", color: "var(--color-warning, #f59e0b)", background: "rgba(245, 158, 11, 0.1)", padding: "0.25rem 0.5rem", borderRadius: "4px", whiteSpace: "nowrap" }}>
                    Not Verified
                  </span>
                ) : null}
              </div>
              {errors.phone && <span className="error-message">{errors.phone.message}</span>}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="username">Username</label>
              <input
                id="username"
                type="text"
                className={`form-input ${errors.username ? "input-error" : ""}`}
                {...register("username")}
                readOnly={!isEditing}
                disabled={!isEditing}
                style={!isEditing ? { opacity: 0.7 } : {}}
                placeholder={!isEditing ? "Not provided" : ""}
              />
              {errors.username && <span className="error-message">{errors.username.message}</span>}
            </div>

            {/* Row 3: Name & Gender */}
            <div className="form-group">
              <label className="form-label" htmlFor="name">Full Name</label>
              <input
                id="name"
                type="text"
                className={`form-input ${errors.name ? "input-error" : ""}`}
                {...register("name")}
                readOnly={!isEditing}
                disabled={!isEditing}
                style={!isEditing ? { opacity: 0.7 } : {}}
              />
              {errors.name && <span className="error-message">{errors.name.message}</span>}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="gender">Gender</label>
              <select
                id="gender"
                className={`form-input ${errors.gender ? "input-error" : ""}`}
                {...register("gender")}
                disabled={!isEditing}
                style={!isEditing ? { opacity: 0.7 } : {}}
              >
                <option value="">Prefer not to say</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
              {errors.gender && <span className="error-message">{errors.gender.message}</span>}
            </div>
          </div>

          {isEditing && (
            <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={isSubmitting}
                style={{ minWidth: "150px" }}
              >
                {isSubmitting ? "Saving..." : "Save Changes"}
              </button>
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => {
                  setIsEditing(false);
                  reset({
                    name: user.name,
                    username: user.username || "",
                    phone: user.phone || "",
                    gender: user.gender || "",
                  });
                }}
                disabled={isSubmitting}
              >
                Cancel
              </button>
            </div>
          )}
        </form>
      </div>
    </>
  );
}
