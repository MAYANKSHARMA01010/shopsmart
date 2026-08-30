"use client";

import { useState } from "react";
import { useWishlistStore } from "../store/wishlistStore";
import { OptimizedImage } from "@/components/ui/OptimizedImage";
import { useClickOutside } from "@/hooks/useClickOutside";
import { formatPrice, type Product } from "../../products/types/productSchema";
import toast from "react-hot-toast";


interface WishlistFolderModalProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
}

function IconFolder() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
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

function IconPlus() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

function IconCheck() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function IconBookmark() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
    </svg>
  );
}

export function WishlistFolderModal({ product, isOpen, onClose }: WishlistFolderModalProps) {
  const {
    items,
    collections,
    createCollection,
    toggleItem,
    moveToCollection,
    removeItem,
  } = useWishlistStore();

  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const modalRef = useClickOutside<HTMLDivElement>(onClose, isOpen);

  if (!isOpen) return null;

  // Find if this product is in wishlist and in which folder
  const currentWishlistItem = (items || []).find((i) => i?.productId === product.id);
  const currentFolderId = currentWishlistItem?.collectionId || null;

  const handleSelectFolder = async (folderId: string) => {
    setIsSaving(true);
    try {
      if (currentFolderId === folderId) {
        // Toggle off / remove
        await removeItem(product.id);
        toast.success(`Removed from "${collections.find((c) => c.id === folderId)?.name || 'Wishlist'}"`);
      } else if (currentWishlistItem) {
        // Move to this folder
        moveToCollection(product.id, folderId);
        toast.success(`Moved to "${collections.find((c) => c.id === folderId)?.name}"`);
      } else {
        // Add to this folder
        await toggleItem(product, folderId);
        toast.success(`Saved to "${collections.find((c) => c.id === folderId)?.name}"`);
      }
      onClose();
    } catch (err) {
      console.error(err);
      toast.error("Failed to update wishlist folder");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreateAndSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;

    setIsSaving(true);
    try {
      const newCol = createCollection(newFolderName.trim());
      await toggleItem(product, newCol.id);
      toast.success(`Created "${newCol.name}" and saved item`);
      setNewFolderName("");
      setIsCreatingNew(false);
      onClose();
    } catch (err) {
      console.error(err);
      toast.error("Failed to create folder");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.55)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
        padding: "var(--space-4)",
      }}
    >
      <div
        ref={modalRef}
        style={{
          background: "var(--color-surface)",
          borderRadius: "var(--radius-xl)",
          padding: "var(--space-6)",
          maxWidth: "440px",
          width: "100%",
          boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
          border: "1px solid var(--color-border)",
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--space-4)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <IconBookmark />
            <h2 style={{ fontSize: "1.15rem", fontWeight: 700, margin: 0, color: "var(--color-text-primary)" }}>
              Save to Wishlist Folder
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{ background: "transparent", border: "none", cursor: "pointer", color: "var(--color-text-muted)" }}
          >
            <IconClose />
          </button>
        </div>

        {/* Product mini preview */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            padding: "10px",
            background: "var(--color-surface-sunken)",
            borderRadius: "var(--radius-md)",
            marginBottom: "var(--space-4)",
          }}
        >
          <div style={{ position: "relative", width: "48px", height: "48px", borderRadius: "var(--radius-sm)", overflow: "hidden", flexShrink: 0 }}>
            <OptimizedImage src={product.images?.[0]} alt={product.name} fill sizes="48px" />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--color-text-primary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {product.name}
            </div>
            <div style={{ fontSize: "0.8rem", color: "var(--color-primary)", fontWeight: 700, fontFamily: "var(--font-mono)" }}>
              ₹{formatPrice(product.basePrice)}
            </div>
          </div>
        </div>


        {/* Folder List */}
        <div style={{ marginBottom: "var(--space-4)" }}>
          <div style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--color-text-secondary)", marginBottom: "var(--space-2)" }}>
            Select a folder:
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "8px", maxHeight: "220px", overflowY: "auto" }}>
            {collections.map((col) => {
              const isSelected = currentFolderId === col.id;
              const count = (items || []).filter((i) => (i.collectionId || "default") === col.id).length;

              return (
                <button
                  key={col.id}
                  type="button"
                  onClick={() => handleSelectFolder(col.id)}
                  disabled={isSaving}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "10px 14px",
                    borderRadius: "var(--radius-md)",
                    border: isSelected ? "2px solid var(--color-primary)" : "1px solid var(--color-border)",
                    background: isSelected ? "var(--color-primary-surface)" : "var(--color-surface)",
                    cursor: "pointer",
                    textAlign: "left",
                    transition: "all 0.15s ease",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <div style={{ color: isSelected ? "var(--color-primary)" : "var(--color-text-muted)", display: "flex", alignItems: "center" }}>
                      <IconFolder />
                    </div>
                    <div>
                      <div style={{ fontSize: "0.9rem", fontWeight: 600, color: isSelected ? "var(--color-primary)" : "var(--color-text-primary)" }}>
                        {col.name}
                      </div>
                      <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>
                        {count} {count === 1 ? "item" : "items"}
                      </div>
                    </div>
                  </div>

                  {isSelected && (
                    <div
                      style={{
                        width: "24px",
                        height: "24px",
                        borderRadius: "50%",
                        background: "var(--color-primary)",
                        color: "#fff",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <IconCheck />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Create New Folder Inline */}
        {isCreatingNew ? (
          <form onSubmit={handleCreateAndSave} style={{ borderTop: "1px solid var(--color-border)", paddingTop: "var(--space-3)" }}>
            <div style={{ fontSize: "0.85rem", fontWeight: 600, marginBottom: "var(--space-2)" }}>
              New Folder Name:
            </div>
            <div style={{ display: "flex", gap: "8px", marginBottom: "var(--space-2)" }}>
              <input
                type="text"
                placeholder="e.g. Living Room, Gift Ideas"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                autoFocus
                required
                style={{
                  flex: 1,
                  padding: "8px 12px",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid var(--color-border)",
                  fontSize: "0.875rem",
                }}
              />
              <button type="submit" className="btn btn-primary btn-sm" disabled={isSaving}>
                Save
              </button>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => setIsCreatingNew(false)}
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <button
            type="button"
            onClick={() => setIsCreatingNew(true)}
            style={{
              width: "100%",
              padding: "10px",
              borderRadius: "var(--radius-md)",
              border: "1px dashed var(--color-primary)",
              background: "var(--color-primary-surface)",
              color: "var(--color-primary)",
              fontWeight: 600,
              fontSize: "0.875rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px",
              cursor: "pointer",
            }}
          >
            <IconPlus /> Create New Folder
          </button>
        )}
      </div>
    </div>
  );
}
