"use client";

import { useState } from "react";
import type { ProductFormData } from "@/types";

interface ProductFormProps {
  onSubmit: (data: ProductFormData) => Promise<void>;
  loading: boolean;
}

const CATEGORIES = [
  "Electronics",
  "Clothing",
  "Food",
  "Books",
  "Sports",
  "Toys",
  "Beauty",
  "Home",
  "Tools",
];

const EMPTY: ProductFormData = {
  name: "",
  description: "",
  price: "",
  stock: "",
  category: "",
  imageUrl: "",
};

export function ProductForm({ onSubmit, loading }: ProductFormProps) {
  const [form, setForm] = useState<ProductFormData>(EMPTY);
  const [error, setError] = useState<string | null>(null);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!form.name.trim()) return setError("Product name is required.");
    const price = parseFloat(form.price);
    if (isNaN(price) || price < 0) return setError("Price must be a valid positive number.");

    try {
      await onSubmit(form);
      setForm(EMPTY);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create product.");
    }
  }

  return (
    <form onSubmit={handleSubmit} id="add" className="form-section">
      <div className="form-section-title">
        <span>➕</span> Add New Product
      </div>

      {error && (
        <div className="alert alert-error">⚠️ {error}</div>
      )}

      <div className="form-grid">
        <div className="form-field">
          <label htmlFor="name">Name *</label>
          <input
            id="name"
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Product name"
            required
          />
        </div>

        <div className="form-field">
          <label htmlFor="category">Category</label>
          <select id="category" name="category" value={form.category} onChange={handleChange}>
            <option value="">— Select category —</option>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat.toLowerCase()}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <div className="form-field">
          <label htmlFor="price">Price ($) *</label>
          <input
            id="price"
            name="price"
            type="number"
            step="0.01"
            min="0"
            value={form.price}
            onChange={handleChange}
            placeholder="29.99"
            required
          />
        </div>

        <div className="form-field">
          <label htmlFor="stock">Stock</label>
          <input
            id="stock"
            name="stock"
            type="number"
            min="0"
            value={form.stock}
            onChange={handleChange}
            placeholder="100"
          />
        </div>

        <div className="form-field full-width">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Describe the product…"
          />
        </div>

        <div className="form-field full-width">
          <label htmlFor="imageUrl">Image URL (optional)</label>
          <input
            id="imageUrl"
            name="imageUrl"
            type="url"
            value={form.imageUrl}
            onChange={handleChange}
            placeholder="https://example.com/image.png"
          />
        </div>
      </div>

      <div className="form-actions">
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => setForm(EMPTY)}
          disabled={loading}
        >
          Clear
        </button>
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? "⏳ Saving…" : "✨ Add Product"}
        </button>
      </div>
    </form>
  );
}
