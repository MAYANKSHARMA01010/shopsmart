"use client";

import React, { useState } from "react";
import toast from "react-hot-toast";

function IconMapPin() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
    </svg>
  );
}

function IconMail() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <polyline points="22,6 12,13 2,6" />
    </svg>
  );
}

function IconPhone() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  );
}

function IconHelp() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" /><line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    orderId: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      toast.success("Thank you! Your message has been sent.");
      setFormData({ name: "", email: "", subject: "", orderId: "", message: "" });
    }, 600);
  };

  return (
    <div className="container" style={{ paddingTop: "var(--space-8)", paddingBottom: "var(--space-16)" }}>
      {/* Header */}
      <div style={{ maxWidth: "680px", marginBottom: "var(--space-8)" }}>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1.75rem, 3.5vw, 2.5rem)", fontWeight: 700, margin: "0 0 var(--space-2)", color: "var(--color-text-primary)" }}>
          Get in Touch
        </h1>
        <p style={{ color: "var(--color-text-secondary)", fontSize: "1rem", lineHeight: 1.6, margin: 0 }}>
          Have questions about an order, delivery, or our artisan products? We are here to help.
        </p>
      </div>

      {/* 2-Column Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr", gap: "var(--space-8)", alignItems: "start" }}>
        {/* Left Column: Contact info */}
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
          {/* Card */}
          <div className="profile-section-card" style={{ padding: "var(--space-6)" }}>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.25rem", margin: "0 0 var(--space-4)", paddingBottom: "var(--space-3)", borderBottom: "1px solid var(--color-border)", color: "var(--color-text-primary)" }}>
              Contact Information
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-5)" }}>
              <div style={{ display: "flex", gap: "var(--space-3)", alignItems: "flex-start" }}>
                <div style={{ color: "var(--color-primary)", marginTop: "2px" }}><IconMapPin /></div>
                <div>
                  <div style={{ fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.06em", color: "var(--color-text-muted)", textTransform: "uppercase", marginBottom: "2px" }}>
                    OFFICE ADDRESS
                  </div>
                  <div style={{ fontSize: "0.9rem", color: "var(--color-text-primary)", lineHeight: 1.5 }}>
                    ShopSmart HQ, 12th Main Road, Indiranagar, Bengaluru, Karnataka - 560038, India
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", gap: "var(--space-3)", alignItems: "flex-start" }}>
                <div style={{ color: "var(--color-primary)", marginTop: "2px" }}><IconMail /></div>
                <div>
                  <div style={{ fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.06em", color: "var(--color-text-muted)", textTransform: "uppercase", marginBottom: "2px" }}>
                    EMAIL SUPPORT
                  </div>
                  <div style={{ fontSize: "0.9rem", fontWeight: 600, color: "var(--color-text-primary)" }}>
                    support@shopsmart.in
                  </div>
                  <div style={{ fontSize: "0.78rem", color: "var(--color-text-muted)", marginTop: "2px" }}>
                    24-hour response guarantee
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", gap: "var(--space-3)", alignItems: "flex-start" }}>
                <div style={{ color: "var(--color-primary)", marginTop: "2px" }}><IconPhone /></div>
                <div>
                  <div style={{ fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.06em", color: "var(--color-text-muted)", textTransform: "uppercase", marginBottom: "2px" }}>
                    TELEPHONE
                  </div>
                  <div style={{ fontSize: "0.9rem", fontWeight: 600, color: "var(--color-text-primary)", fontFamily: "var(--font-mono)" }}>
                    +91 (80) 4123-4567
                  </div>
                  <div style={{ fontSize: "0.78rem", color: "var(--color-text-muted)", marginTop: "2px" }}>
                    Mon–Sat, 9:00 AM – 6:00 PM IST
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* FAQ Teaser */}
          <div
            style={{
              padding: "var(--space-5)",
              background: "var(--color-primary-surface)",
              border: "1px solid var(--color-primary-border)",
              borderRadius: "var(--radius-lg)",
              display: "flex",
              gap: "var(--space-3)",
              alignItems: "center",
            }}
          >
            <div style={{ color: "var(--color-primary)" }}><IconHelp /></div>
            <div>
              <div style={{ fontWeight: 700, fontSize: "0.9rem", color: "var(--color-primary)", marginBottom: "2px" }}>
                Need immediate answers?
              </div>
              <div style={{ fontSize: "0.8rem", color: "var(--color-text-secondary)" }}>
                Reach out to our customer care on WhatsApp or email for instant return & refund queries.
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Inquiry Form */}
        <div className="profile-section-card" style={{ padding: "var(--space-6)" }}>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.25rem", margin: "0 0 var(--space-4)", color: "var(--color-text-primary)" }}>
            Send Us a Message
          </h2>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label" htmlFor="contact-name">Full Name <span style={{ color: "var(--color-error)" }}>*</span></label>
                <input
                  id="contact-name"
                  type="text"
                  required
                  className="form-input"
                  placeholder="Mayank Sharma"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="contact-email">Email Address <span style={{ color: "var(--color-error)" }}>*</span></label>
                <input
                  id="contact-email"
                  type="email"
                  required
                  className="form-input"
                  placeholder="mayank@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="contact-subject">Subject <span style={{ color: "var(--color-error)" }}>*</span></label>
              <select
                id="contact-subject"
                required
                className="form-input"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              >
                <option value="">Select a topic</option>
                <option value="order">Order & Delivery Inquiry</option>
                <option value="product">Product Question</option>
                <option value="returns">Returns & Refund</option>
                <option value="vendor">Vendor Partnership</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="contact-order-id">Order ID (Optional)</label>
              <input
                id="contact-order-id"
                type="text"
                className="form-input"
                placeholder="e.g. ORD-123456"
                value={formData.orderId}
                onChange={(e) => setFormData({ ...formData, orderId: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="contact-msg">Your Message <span style={{ color: "var(--color-error)" }}>*</span></label>
              <textarea
                id="contact-msg"
                required
                rows={4}
                className="form-input"
                placeholder="How can we help you today?"
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                style={{ resize: "vertical" }}
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className={`btn btn-primary${isSubmitting ? " btn-loading" : ""}`}
              style={{ height: "46px", fontSize: "0.95rem", fontWeight: 600, alignSelf: "flex-start", padding: "0 28px", marginTop: "var(--space-1)" }}
            >
              {isSubmitting ? "" : "Send Message →"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
