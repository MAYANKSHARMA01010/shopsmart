import { useState } from "react";
import { formatPrice } from "../types/productSchema";
import type { Product } from "../types/productSchema";
import { WishlistButton } from "../../wishlist/components/WishlistButton";
import { useCartStore } from "../../cart/store/cartStore";

interface ProductCardProps {
  product: Product;
  onDelete: (id: string) => void;
  deleting: boolean;
  canManage?: boolean;
}

function IconProductPlaceholder() {
  return (
    <svg
      width="36"
      height="36"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ color: "var(--color-text-muted)" }}
      aria-hidden="true"
    >
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
      <line x1="12" y1="22.08" x2="12" y2="12" />
    </svg>
  );
}

function getStockClass(stock: number): string {
  if (stock === 0) return "out-stock";
  if (stock < 5) return "low-stock";
  return "in-stock";
}

function getStockLabel(stock: number, canManage?: boolean): string {
  if (stock === 0) return "Out of stock";
  if (canManage) {
    if (stock < 5) return `Low stock — ${stock} left`;
    return `${stock} in stock`;
  }
  return "In Stock";
}

export function ProductCard({ product, onDelete, deleting, canManage }: ProductCardProps) {
  const addItem = useCartStore((s) => s.addItem);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const isLoading = useCartStore((s) => s.isLoading);
  
  const cartItems = useCartStore((s) => s.cart?.items || []);
  const cartItem = cartItems.find((item) => item?.productId === product.id);
  const inCart = !!cartItem;
  
  const [adding, setAdding] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

  async function handleAddToCart() {
    try {
      setAdding(true);
      await addItem(product as any, 1);
      setJustAdded(true);
      setTimeout(() => setJustAdded(false), 2000);
    } catch (err) {
      console.error(err);
    } finally {
      setAdding(false);
    }
  }

  return (
    <article className="product-card">
      {/* Image / placeholder */}
      <div className="product-image">
        {product.images && product.images.length > 0 ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.images[0]}
            alt={product.name}
            loading="lazy"
            width={280}
            height={160}
            style={{ objectFit: "cover", width: "100%", height: "100%" }}
          />
        ) : (
          <IconProductPlaceholder />
        )}
        <div style={{ position: "absolute", top: "12px", right: "12px", zIndex: 10 }}>
          <WishlistButton product={product} />
        </div>
      </div>

      {/* Body */}
      <div className="product-body">
        {product.category && (
          <span className="product-category">{product.category.name}</span>
        )}
        <h2 className="product-name">{product.name}</h2>
        {product.description && (
          <p className="product-desc">{product.description}</p>
        )}

        {/* Footer: price + stock */}
        <div className="product-footer">
          <span
            className="product-price"
            aria-label={`Price: ₹${formatPrice(product.basePrice)}`}
          >
            ₹{formatPrice(product.basePrice)}
          </span>
          <span
            className={`product-stock ${getStockClass(product.stock)}`}
            aria-label={getStockLabel(product.stock, canManage)}
          >
            {getStockLabel(product.stock, canManage)}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="product-actions" style={{ marginTop: "auto", display: "flex", flexDirection: "column" }}>
        {canManage ? (
          <button
            type="button"
            className="btn btn-danger btn-sm"
            onClick={() => onDelete(product.id)}
            disabled={deleting}
            aria-label={`Delete ${product.name}`}
            style={{ width: "100%" }}
          >
            {deleting ? "Deleting…" : "Delete"}
          </button>
        ) : inCart && cartItem ? (
          <div style={{ display: "flex", gap: "8px", width: "100%" }}>
            <div style={{ display: "flex", alignItems: "center", border: "1px solid var(--color-primary)", borderRadius: "var(--radius-sm)", overflow: "hidden", height: "36px", flex: 1, justifyContent: "space-between" }}>
              <button 
                onClick={() => {
                  if (cartItem.quantity <= 1) {
                    removeItem(product.id);
                  } else {
                    updateQuantity(product.id, cartItem.quantity - 1);
                  }
                }}
                disabled={isLoading}
                style={{ padding: "0 16px", background: "transparent", color: "var(--color-primary)", border: "none", cursor: "pointer", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.2rem", transition: "background 0.2s" }}
                onMouseOver={(e) => e.currentTarget.style.background = "var(--color-surface-hover)"}
                onMouseOut={(e) => e.currentTarget.style.background = "transparent"}
              >
                -
              </button>
              <div style={{ padding: "0 12px", flex: 1, textAlign: "center", fontSize: "0.9rem", fontWeight: 600, color: "var(--color-text)" }}>
                {cartItem.quantity}
              </div>
              <button 
                onClick={() => updateQuantity(product.id, cartItem.quantity + 1)}
                disabled={cartItem.quantity >= product.stock || isLoading}
                style={{ padding: "0 16px", background: "transparent", color: cartItem.quantity >= product.stock ? "var(--color-text-muted)" : "var(--color-primary)", border: "none", cursor: cartItem.quantity >= product.stock ? "not-allowed" : "pointer", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.2rem", transition: "background 0.2s" }}
                onMouseOver={(e) => { if (cartItem.quantity < product.stock) e.currentTarget.style.background = "var(--color-surface-hover)" }}
                onMouseOut={(e) => e.currentTarget.style.background = "transparent"}
              >
                +
              </button>
            </div>
            <button
              onClick={() => removeItem(product.id)}
              disabled={isLoading}
              style={{
                width: "36px",
                height: "36px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "transparent",
                border: "1px solid var(--color-danger)",
                color: "var(--color-danger)",
                borderRadius: "var(--radius-sm)",
                cursor: "pointer",
                transition: "background 0.2s",
                flexShrink: 0
              }}
              aria-label={`Remove ${product.name} from cart`}
              onMouseOver={(e) => e.currentTarget.style.background = "var(--color-danger-light, rgba(239, 68, 68, 0.1))"}
              onMouseOut={(e) => e.currentTarget.style.background = "transparent"}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              </svg>
            </button>
          </div>
        ) : (
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={handleAddToCart}
            disabled={adding || product.stock === 0 || justAdded}
            aria-label={`Add ${product.name} to Cart`}
            style={{ width: "100%", ...(justAdded ? { backgroundColor: '#4caf50', borderColor: '#4caf50', color: 'white' } : {}) }}
          >
            {adding ? "Adding…" : justAdded ? "Added to Cart!" : product.stock === 0 ? "Out of Stock" : "Add to Cart"}
          </button>
        )}
      </div>
    </article>
  );
}
