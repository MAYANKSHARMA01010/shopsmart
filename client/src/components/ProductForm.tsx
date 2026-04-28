"use client";

import { useState } from "react";
import { productSchema, type ProductFormValues, type ProductData } from "../schemas/productSchema";
import { z } from "zod";

interface ProductFormProps {
  onSubmit: (data: ProductData) => Promise<any>;
  loading: boolean;
}

const CATEGORIES = [
  "Electronics", "Clothing", "Food", "Books", "Sports", "Toys", "Beauty", "Home", "Tools",
];

const EMPTY: ProductFormValues = {
  name: "",
  description: "",
  price: "",
  stock: "",
  category: "",
  imageUrl: "",
};

export function ProductForm({ onSubmit, loading }: ProductFormProps) {
  const [form, setForm] = useState<ProductFormValues>(EMPTY);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    // Clear error for the field being changed
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});
    setServerError(null);

    try {
      const validatedData = productSchema.parse(form);
      await onSubmit(validatedData);
      setForm(EMPTY);
    } catch (err) {
      if (err instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {};
        err.errors.forEach((e) => {
          if (e.path[0]) {
            fieldErrors[e.path[0].toString()] = e.message;
          }
        });
        setErrors(fieldErrors);
      } else {
        setServerError(err instanceof Error ? err.message : "An unexpected error occurred");
      }
    }
  }

  return (
    <form onSubmit={handleSubmit} id="add" className="form-section">
      <div className="form-section-title">
        <span>✨</span> Add New Product
      </div>

      {serverError && (
        <div className="alert alert-error">⚠️ {serverError}</div>
      )}

      <div className="form-grid">
        <div className="form-field">
          <label htmlFor="name">Name *</label>
          <input
            id="name"
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="e.g. Mechanical Keyboard"
            className={errors.name ? "input-error" : ""}
          />
          {errors.name && <span className="error-text">{errors.name}</span>}
        </div>

        <div className="form-field">
          <label htmlFor="category">Category</label>
          <select id="category" name="category" value={form.category || ""} onChange={handleChange}>
            <option value="">— Select category —</option>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat.toLowerCase()}>
                {cat}
              </option>
            ))}
          </select>
          {errors.category && <span className="error-text">{errors.category}</span>}
        </div>

        <div className="form-field">
          <label htmlFor="price">Price ($) *</label>
          <input
            id="price"
            name="price"
            type="text"
            value={form.price}
            onChange={handleChange}
            placeholder="29.99"
            className={errors.price ? "input-error" : ""}
          />
          {errors.price && <span className="error-text">{errors.price}</span>}
        </div>

        <div className="form-field">
          <label htmlFor="stock">Stock</label>
          <input
            id="stock"
            name="stock"
            type="text"
            value={form.stock}
            onChange={handleChange}
            placeholder="100"
            className={errors.stock ? "input-error" : ""}
          />
          {errors.stock && <span className="error-text">{errors.stock}</span>}
        </div>

        <div className="form-field full-width">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            value={form.description || ""}
            onChange={handleChange}
            placeholder="Briefly describe the product…"
            rows={3}
          />
          {errors.description && <span className="error-text">{errors.description}</span>}
        </div>

        <div className="form-field full-width">
          <label htmlFor="imageUrl">Image URL (optional)</label>
          <input
            id="imageUrl"
            name="imageUrl"
            type="url"
            value={form.imageUrl || ""}
            onChange={handleChange}
            placeholder="https://images.unsplash.com/..."
          />
          {errors.imageUrl && <span className="error-text">{errors.imageUrl}</span>}
        </div>
      </div>

      <div className="form-actions">
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => {
            setForm(EMPTY);
            setErrors({});
            setServerError(null);
          }}
          disabled={loading}
        >
          Reset
        </button>
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? "⏳ Processing..." : "🚀 Add Product"}
        </button>
      </div>
    </form>
  );
}
