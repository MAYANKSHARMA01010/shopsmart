"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Skeleton, ProductGridSkeleton } from "@/components/ui/Skeleton";
import { useWishlistStore } from "@/features/wishlist";
import { useCartStore } from "@/features/cart";
import { ProductImage } from "@/features/products";
import { formatPrice, type Product } from "@/features/products";
import toast from "react-hot-toast";


function IconFolder({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
    </svg>
  );
}

function IconBookmark({ size = 48 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
    </svg>
  );
}

function IconClose() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function IconTrash() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  );
}

function IconPlus() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

function IconCart() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="9" cy="21" r="1" />
      <circle cx="20" cy="21" r="1" />
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
    </svg>
  );
}

function IconArrowLeft() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="19" y1="12" x2="5" y2="12" />
      <polyline points="12 19 5 12 12 5" />
    </svg>
  );
}

export default function WishlistPage() {
  const {
    items: rawItems,
    collections,
    activeCollectionId,
    error,
    fetchWishlist,
    clearWishlist,
    removeItem,
    moveToCollection,
    createCollection,
    deleteCollection,
    setActiveCollection,
  } = useWishlistStore();

  const { addItem: addToCart } = useCartStore();

  const [mounted, setMounted] = useState(false);
  const [isMoving, setIsMoving] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");

  useEffect(() => {
    setMounted(true);
    fetchWishlist();
  }, [fetchWishlist]);

  const items = (rawItems || []).filter((item) => item && item.product);

  const handleMoveToCart = async (product: Product) => {
    setIsMoving(product.id);
    const cartProduct = {
      ...product,
      basePrice: String(product.basePrice),
      comparePrice: product.comparePrice != null ? String(product.comparePrice) : null,
    };
    try {
      await addToCart(cartProduct as unknown as Parameters<typeof addToCart>[0], 1);
      await removeItem(product.id);
      toast.success(`Moved "${product.name}" to cart`);
    } catch (err) {
      console.error("Failed to move item to cart", err);
      toast.error("Failed to move to cart");
    } finally {
      setIsMoving(null);
    }
  };

  const handleCreateFolder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;
    const newCol = createCollection(newFolderName.trim());
    toast.success(`Folder "${newCol.name}" created`);
    setNewFolderName("");
    setShowModal(false);
  };

  const activeFolder = collections.find((c) => c.id === activeCollectionId) || null;

  // Filter items according to active folder
  const displayedItems = items.filter((item) => {
    if (activeCollectionId === "all") return true;
    if (activeCollectionId === "default") {
      return !item.collectionId || item.collectionId === "default";
    }
    return item.collectionId === activeCollectionId;
  });

  const getFolderItemCount = (colId: string) => {
    if (colId === "all") return items.length;
    if (colId === "default") {
      return items.filter((i) => !i.collectionId || i.collectionId === "default").length;
    }
    return items.filter((i) => i.collectionId === colId).length;
  };

  if (!mounted) {
    return (
      <div className="container" style={{ paddingTop: "var(--space-8)", paddingBottom: "var(--space-16)" }} aria-busy="true">
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "var(--space-6)" }}>
          <div>
            <Skeleton width={220} height={32} style={{ marginBottom: "var(--space-2)" }} />
            <Skeleton width={320} height={16} />
          </div>
          <Skeleton width={130} height={38} borderRadius="var(--radius-md)" />
        </div>
        <div style={{ display: "flex", gap: "8px", marginBottom: "var(--space-6)" }}>
          <Skeleton width={90} height={34} borderRadius="var(--radius-full)" />
          <Skeleton width={110} height={34} borderRadius="var(--radius-full)" />
          <Skeleton width={100} height={34} borderRadius="var(--radius-full)" />
        </div>
        <ProductGridSkeleton count={4} />
      </div>
    );
  }


  return (
    <div className="container" style={{ paddingTop: "var(--space-8)", paddingBottom: "var(--space-16)" }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          flexWrap: "wrap",
          gap: "var(--space-4)",
          marginBottom: "var(--space-6)",
          paddingBottom: "var(--space-4)",
          borderBottom: "1px solid var(--color-border)",
        }}
      >
        <div>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1.75rem, 3vw, 2.25rem)", fontWeight: 700, margin: 0, color: "var(--color-text-primary)" }}>
            Wishlist Folders
          </h1>
          <p style={{ margin: "var(--space-1) 0 0", color: "var(--color-text-muted)", fontSize: "0.9rem" }}>
            Organize products into custom folders. Looking for 1-click liked items? Go to{" "}
            <Link href="/favorites" style={{ color: "var(--color-primary)", fontWeight: 600, textDecoration: "underline" }}>
              My Favorites
            </Link>
          </p>
        </div>

        <div style={{ display: "flex", gap: "var(--space-2)", alignItems: "center" }}>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => setShowModal(true)}
            style={{ fontSize: "0.85rem", padding: "8px 16px", display: "flex", alignItems: "center", gap: "6px" }}
          >
            <IconPlus /> New Folder
          </button>
          {items.length > 0 && (
            <button
              type="button"
              className="btn btn-secondary"
              onClick={clearWishlist}
              style={{ fontSize: "0.85rem", padding: "8px 14px" }}
            >
              Clear All
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="form-error-banner" role="alert" style={{ marginBottom: "var(--space-4)" }}>
          {error}
        </div>
      )}

      {/* Folders Explorer / Navigation Strip */}
      <div style={{ marginBottom: "var(--space-8)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "var(--space-3)" }}>
          <span style={{ fontSize: "0.85rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--color-text-muted)" }}>
            Your Folders
          </span>
          {activeCollectionId !== "all" && (
            <button
              type="button"
              onClick={() => setActiveCollection("all")}
              style={{
                background: "transparent",
                border: "none",
                color: "var(--color-primary)",
                fontSize: "0.85rem",
                fontWeight: 600,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "4px",
              }}
            >
              <IconArrowLeft /> View All Folders
            </button>
          )}
        </div>

        {/* Folder Cards Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
            gap: "var(--space-3)",
          }}
        >
          {/* All Folders Card */}
          <div
            onClick={() => setActiveCollection("all")}
            style={{
              padding: "16px",
              borderRadius: "var(--radius-lg)",
              border: activeCollectionId === "all" ? "2px solid var(--color-primary)" : "1px solid var(--color-border)",
              background: activeCollectionId === "all" ? "var(--color-primary-surface)" : "var(--color-surface)",
              cursor: "pointer",
              transition: "all 0.15s ease",
              display: "flex",
              flexDirection: "column",
              gap: "8px",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ color: activeCollectionId === "all" ? "var(--color-primary)" : "var(--color-text-muted)" }}>
                <IconFolder size={22} />
              </div>
              <span style={{ fontSize: "0.75rem", padding: "2px 8px", borderRadius: "10px", background: "var(--color-surface-sunken)", color: "var(--color-text-muted)", fontWeight: 600 }}>
                {items.length}
              </span>
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: "0.95rem", color: activeCollectionId === "all" ? "var(--color-primary)" : "var(--color-text-primary)" }}>
                All Folders
              </div>
              <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>
                Overview of all items
              </div>
            </div>
          </div>

          {/* Individual Folders (including My Wishlist and custom folders) */}
          {collections.map((col) => {
            const isSelected = activeCollectionId === col.id;
            const count = getFolderItemCount(col.id);

            return (
              <div
                key={col.id}
                onClick={() => setActiveCollection(col.id)}
                style={{
                  padding: "16px",
                  borderRadius: "var(--radius-lg)",
                  border: isSelected ? "2px solid var(--color-primary)" : "1px solid var(--color-border)",
                  background: isSelected ? "var(--color-primary-surface)" : "var(--color-surface)",
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                  display: "flex",
                  flexDirection: "column",
                  gap: "8px",
                  position: "relative",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ color: isSelected ? "var(--color-primary)" : "var(--color-text-muted)" }}>
                    <IconFolder size={22} />
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <span style={{ fontSize: "0.75rem", padding: "2px 8px", borderRadius: "10px", background: "var(--color-surface-sunken)", color: "var(--color-text-muted)", fontWeight: 600 }}>
                      {count}
                    </span>
                    {col.id !== "default" && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm(`Delete folder "${col.name}"? Items inside will be moved to My Wishlist.`)) {
                            deleteCollection(col.id);
                            toast.success(`Deleted folder "${col.name}"`);
                          }
                        }}
                        title="Delete folder"
                        style={{
                          background: "transparent",
                          border: "none",
                          padding: "2px",
                          cursor: "pointer",
                          color: "var(--color-text-muted)",
                          display: "flex",
                          alignItems: "center",
                        }}
                      >
                        <IconClose />
                      </button>
                    )}
                  </div>
                </div>

                <div>
                  <div style={{ fontWeight: 700, fontSize: "0.95rem", color: isSelected ? "var(--color-primary)" : "var(--color-text-primary)" }}>
                    {col.name}
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>
                    {count} {count === 1 ? "item" : "items"}
                  </div>
                </div>
              </div>
            );
          })}

          {/* New Folder Card */}
          <div
            onClick={() => setShowModal(true)}
            style={{
              padding: "16px",
              borderRadius: "var(--radius-lg)",
              border: "1px dashed var(--color-border)",
              background: "var(--color-surface)",
              cursor: "pointer",
              transition: "all 0.15s ease",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px",
              color: "var(--color-text-muted)",
              minHeight: "84px",
            }}
          >
            <IconPlus />
            <span style={{ fontSize: "0.85rem", fontWeight: 600 }}>New Folder</span>
          </div>
        </div>
      </div>

      {/* Items Section Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "var(--space-4)" }}>
        <div>
          <h2 style={{ fontSize: "1.2rem", fontWeight: 700, margin: 0, color: "var(--color-text-primary)" }}>
            {activeCollectionId === "all" ? "All Saved Items" : activeFolder?.name || "Folder Items"}
          </h2>
          <span style={{ fontSize: "0.85rem", color: "var(--color-text-muted)" }}>
            {displayedItems.length} {displayedItems.length === 1 ? "item" : "items"}
          </span>
        </div>
      </div>

      {/* Items Grid or Empty State */}
      {displayedItems.length === 0 ? (
        <div
          style={{
            padding: "var(--space-16) var(--space-4)",
            textAlign: "center",
            border: "2px dashed var(--color-border)",
            borderRadius: "var(--radius-lg)",
            background: "var(--color-surface)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "center", marginBottom: "var(--space-3)", color: "var(--color-text-muted)" }}>
            <IconBookmark size={44} />
          </div>
          <h3 style={{ fontFamily: "var(--font-display)", fontSize: "1.25rem", margin: "0 0 var(--space-2)" }}>
            {activeCollectionId === "all" ? "Your Wishlist is Empty" : `"${activeFolder?.name}" is Empty`}
          </h3>
          <p style={{ color: "var(--color-text-secondary)", margin: "0 0 var(--space-6)", maxWidth: "420px", marginLeft: "auto", marginRight: "auto" }}>
            Click the bookmark icon on any product to save items into your folders.
          </p>
          <Link href="/products" className="btn btn-primary">
            Explore Products
          </Link>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
            gap: "var(--space-6)",
          }}
        >
          {displayedItems.map((item) => {
            const product = item.product;

            return (
              <article
                key={item.id}
                className="product-card"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  background: "var(--color-surface)",
                  borderRadius: "var(--radius-lg)",
                  border: "1px solid var(--color-border)",
                  overflow: "hidden",
                  boxShadow: "var(--shadow-card)",
                }}
              >
                {/* Image */}
                <div style={{ position: "relative", height: "220px", background: "var(--color-surface-sunken)" }}>
                  <Link href={`/products/${product.id}`} style={{ display: "block", width: "100%", height: "100%" }}>
                    <ProductImage src={product.images?.[0]} alt={product.name} fill sizes="280px" />
                  </Link>
                  <button
                    type="button"
                    onClick={async () => {
                      await removeItem(product.id);
                      toast.success(`Removed from folder`);
                    }}
                    title="Remove from folder"
                    aria-label="Remove from folder"
                    style={{
                      position: "absolute",
                      top: "10px",
                      right: "10px",
                      background: "rgba(253, 252, 250, 0.9)",
                      backdropFilter: "blur(6px)",
                      border: "1px solid var(--color-border)",
                      borderRadius: "50%",
                      width: "32px",
                      height: "32px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                      color: "var(--color-text-muted)",
                    }}
                  >
                    <IconTrash />
                  </button>
                </div>

                {/* Info */}
                <div style={{ padding: "var(--space-4)", flex: 1, display: "flex", flexDirection: "column" }}>
                  {/* Folder Switcher */}
                  <div style={{ marginBottom: "var(--space-2)", display: "flex", alignItems: "center", gap: "6px" }}>
                    <span style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", fontWeight: 600 }}>Folder:</span>
                    <select
                      value={item.collectionId || "default"}
                      onChange={(e) => {
                        moveToCollection(product.id, e.target.value);
                        const targetName = collections.find((c) => c.id === e.target.value)?.name;
                        toast.success(`Moved to "${targetName}"`);
                      }}
                      style={{
                        padding: "3px 8px",
                        fontSize: "0.75rem",
                        borderRadius: "var(--radius-sm)",
                        border: "1px solid var(--color-border)",
                        background: "var(--color-surface-sunken)",
                        color: "var(--color-text-secondary)",
                        cursor: "pointer",
                        fontWeight: 600,
                      }}
                    >
                      {collections.map((col) => (
                        <option key={col.id} value={col.id}>
                          {col.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <h3 style={{ fontSize: "0.95rem", margin: "0 0 var(--space-2)", lineHeight: 1.4, fontWeight: 600 }}>
                    <Link href={`/products/${product.id}`} style={{ color: "inherit", textDecoration: "none" }}>
                      {product.name}
                    </Link>
                  </h3>

                  <div style={{ marginTop: "auto", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--space-3)" }}>
                    <span style={{ fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: "1.1rem" }}>
                      ₹{formatPrice(product.basePrice)}
                    </span>
                  </div>

                  <button
                    type="button"
                    className="btn btn-primary"
                    disabled={isMoving === product.id || product.stock === 0}
                    onClick={() => handleMoveToCart(product)}
                    style={{ width: "100%", height: "38px", fontSize: "0.875rem", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "6px" }}
                  >
                    <IconCart />
                    <span>{isMoving === product.id ? "Moving…" : product.stock === 0 ? "Out of Stock" : "Move to Cart"}</span>
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* Create Folder Modal */}
      {showModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.5)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 100,
            padding: "var(--space-4)",
          }}
          onClick={() => setShowModal(false)}
        >
          <div
            style={{
              background: "var(--color-surface)",
              borderRadius: "var(--radius-lg)",
              padding: "var(--space-6)",
              maxWidth: "420px",
              width: "100%",
              boxShadow: "var(--shadow-lg)",
              border: "1px solid var(--color-border)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--space-4)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <IconFolder size={20} />
                <h2 style={{ fontSize: "1.15rem", margin: 0, fontWeight: 700 }}>Create Wishlist Folder</h2>
              </div>
              <button type="button" onClick={() => setShowModal(false)} style={{ background: "transparent", border: "none", cursor: "pointer", color: "var(--color-text-muted)" }}>
                <IconClose />
              </button>
            </div>

            <form onSubmit={handleCreateFolder}>
              <div style={{ marginBottom: "var(--space-6)" }}>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "var(--space-1)" }}>
                  Folder Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Living Room, Gift Ideas"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  required
                  autoFocus
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    borderRadius: "var(--radius-md)",
                    border: "1px solid var(--color-border)",
                    background: "var(--color-surface)",
                  }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "var(--space-2)" }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Create Folder
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
