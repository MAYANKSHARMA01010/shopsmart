import React, { useState } from "react";
import { useCheckoutStore } from "../store/checkoutStore";

export const CouponInput: React.FC = () => {
  const { couponCode, setCoupon } = useCheckoutStore();
  const [inputCode, setInputCode] = useState(couponCode || "");
  const [loading, setLoading] = useState(false);

  const handleApply = () => {
    if (!inputCode.trim()) return;
    setLoading(true);
    setTimeout(() => {
      setCoupon(inputCode.trim().toUpperCase());
      setLoading(false);
    }, 400);
  };

  const handleRemove = () => {
    setCoupon(null);
    setInputCode("");
  };

  return (
    <div className="profile-section-card" style={{ padding: "var(--space-6)" }}>
      <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.125rem", margin: "0 0 var(--space-3)", color: "var(--color-text-primary)" }}>
        Apply Promo Code
      </h2>

      {couponCode ? (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: "var(--color-success-surface)",
            border: "1px solid var(--color-success-border)",
            color: "var(--color-success)",
            padding: "var(--space-3) var(--space-4)",
            borderRadius: "var(--radius-md)",
          }}
        >
          <span style={{ fontWeight: 600, fontSize: "0.9rem", fontFamily: "var(--font-mono)" }}>
            Applied: {couponCode}
          </span>
          <button
            type="button"
            onClick={handleRemove}
            style={{
              background: "transparent",
              border: "none",
              color: "var(--color-error)",
              fontWeight: 600,
              fontSize: "0.8rem",
              cursor: "pointer",
            }}
          >
            Remove
          </button>
        </div>
      ) : (
        <div style={{ display: "flex", gap: "var(--space-2)" }}>
          <input
            type="text"
            placeholder="Enter coupon code"
            value={inputCode}
            onChange={(e) => setInputCode(e.target.value)}
            className="form-input"
            style={{ flex: 1, textTransform: "uppercase" }}
          />
          <button
            type="button"
            onClick={handleApply}
            disabled={loading || !inputCode.trim()}
            className="btn btn-secondary"
            style={{ padding: "0 20px" }}
          >
            {loading ? "Applying..." : "Apply"}
          </button>
        </div>
      )}
    </div>
  );
};
