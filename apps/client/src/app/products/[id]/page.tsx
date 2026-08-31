"use client";

import { use, useEffect, useState, useMemo, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { OptimizedImage } from "@/components/ui/OptimizedImage";
import { ProductDetailSkeleton } from "@/components/ui/Skeleton";
import { useProduct, productService, formatPrice, type Product } from "@/features/products";

import { useCart } from "@/features/cart";
import { FavoriteButton } from "@/features/favorites";
import { WishlistButton } from "@/features/wishlist";
import toast from "react-hot-toast";



interface ProductPageProps {
  params: Promise<{ id: string }>;
}

function IconStar() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="#F59E0B" stroke="#F59E0B" strokeWidth="1" aria-hidden="true">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

function IconTruck() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="1" y="3" width="15" height="13" rx="2" />
      <path d="M16 8h4l3 5v3h-7V8z" />
      <circle cx="5.5" cy="18.5" r="2.5" />
      <circle cx="18.5" cy="18.5" r="2.5" />
    </svg>
  );
}

function IconRotate() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="1 4 1 10 7 10" />
      <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
    </svg>
  );
}

function IconShield() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}

function IconCart() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="9" cy="21" r="1" />
      <circle cx="20" cy="21" r="1" />
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
    </svg>
  );
}

function IconBolt() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="none" aria-hidden="true">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  );
}

function IconTag() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
      <line x1="7" y1="7" x2="7.01" y2="7" />
    </svg>
  );
}

export default function ProductDetailsPage({ params }: ProductPageProps) {
  const { id } = use(params);
  const router = useRouter();
  const { product, isLoading, error } = useProduct(id);
  const { addItem } = useCart();

  const [quantity, setQuantity] = useState(1);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [pincode, setPincode] = useState("400001");
  const [pincodeChecked, setPincodeChecked] = useState(false);

  useEffect(() => {
    productService.getAll({ limit: "6" }).then((res: { data?: Product[] } | Product[]) => {
      const list = Array.isArray(res) ? res : res.data ?? [];
      setRelatedProducts(list.filter((p) => p.id !== id).slice(0, 4));
    }).catch(() => {});
  }, [id]);

  const numBase = useMemo(() => (product ? Number(product.basePrice) : 0), [product]);
  const numCompare = useMemo(() => (product?.comparePrice ? Number(product.comparePrice) : 0), [product]);
  const discount = useMemo(() => (numCompare > numBase ? Math.round(((numCompare - numBase) / numCompare) * 100) : 0), [numCompare, numBase]);
  const inStock = useMemo(() => (product ? product.stock > 0 : false), [product]);


  const handleAddToCart = useCallback(async () => {
    if (!product) return;
    setIsAdding(true);
    const cartProduct = {
      ...product,
      basePrice: String(product.basePrice),
      comparePrice: product.comparePrice != null ? String(product.comparePrice) : null,
    };
    try {
      await addItem(cartProduct as unknown as Parameters<typeof addItem>[0], quantity);
      toast.success(`Added ${quantity} item${quantity > 1 ? "s" : ""} to cart!`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to add to cart";
      toast.error(msg);
    } finally {
      setIsAdding(false);
    }
  }, [product, addItem, quantity]);

  const handleBuyNow = useCallback(async () => {
    await handleAddToCart();
    router.push("/checkout");
  }, [handleAddToCart, router]);

  const images = useMemo(() => {
    return product?.images && product.images.length > 0
      ? product.images
      : ["https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80"];
  }, [product?.images]);

  if (isLoading) {
    return <ProductDetailSkeleton />;
  }


  if (error || !product) {
    return (
      <div className="container" style={{ padding: "5rem 0", textAlign: "center" }}>
        <div style={{ maxWidth: "480px", margin: "0 auto", padding: "3rem 2rem", background: "var(--color-surface)", borderRadius: "var(--radius-xl)", border: "1px solid var(--color-border)" }}>
          <h2 style={{ fontFamily: "var(--font-display)", color: "var(--color-error)", marginBottom: "var(--space-2)" }}>Product Not Found</h2>
          <p style={{ color: "var(--color-text-muted)", marginBottom: "var(--space-6)" }}>{error || "We couldn't find the product you're looking for."}</p>
          <Link href="/products" className="btn btn-primary">
            ← Back to Product Catalog
          </Link>
        </div>
      </div>
    );
  }


  return (
    <div style={{ background: "var(--color-bg)", minHeight: "100vh", paddingTop: "var(--space-4)", paddingBottom: "var(--space-16)" }}>
      <div className="container">
        {/* Amazon Breadcrumb */}
        <nav aria-label="Breadcrumb" style={{ marginBottom: "var(--space-4)", fontSize: "0.825rem", color: "var(--color-text-muted)", display: "flex", alignItems: "center", gap: "6px" }}>
          <Link href="/" style={{ color: "inherit", textDecoration: "none" }}>Home</Link>
          <span>›</span>
          <Link href="/products" style={{ color: "inherit", textDecoration: "none" }}>Products</Link>
          <span>›</span>
          <Link href={`/products?category=${product.category?.slug}`} style={{ color: "inherit", textDecoration: "none" }}>
            {product.category?.name || "Catalog"}
          </Link>
          <span>›</span>
          <span style={{ color: "var(--color-text-primary)", fontWeight: 600, maxWidth: "300px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {product.name}
          </span>
        </nav>

        {/* Amazon 3-Column Product Details Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr 0.8fr", gap: "var(--space-6)", alignItems: "start", marginBottom: "var(--space-12)" }} className="amazon-product-grid">
          
          {/* COLUMN 1: Image Gallery & Thumbnails */}
          <div style={{ display: "flex", gap: "12px", position: "sticky", top: "90px" }} className="product-gallery-sticky">
            {/* Vertical Thumbnail Strip */}
            {images.length > 1 && (
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveImageIndex(idx)}
                    style={{
                      width: "56px",
                      height: "56px",
                      position: "relative",
                      borderRadius: "var(--radius-md)",
                      border: activeImageIndex === idx ? "2px solid var(--color-primary)" : "1px solid var(--color-border)",
                      background: "var(--color-surface-sunken)",
                      overflow: "hidden",
                      cursor: "pointer",
                      padding: 0,
                    }}
                  >
                    <OptimizedImage src={img} alt={`Thumbnail ${idx + 1}`} fill sizes="56px" />
                  </button>
                ))}
              </div>
            )}

            {/* Main Image Box */}
            <div
              style={{
                flex: 1,
                aspectRatio: "1/1",
                position: "relative",
                borderRadius: "var(--radius-xl)",
                background: "var(--color-surface)",
                border: "1px solid var(--color-border)",
                boxShadow: "var(--shadow-card)",
                overflow: "hidden",
              }}
            >
              <OptimizedImage
                src={images[activeImageIndex] || images[0]}
                alt={product.name}
                fill
                priority
                sizes="(max-width: 768px) 100vw, 500px"
              />


              {/* Heart Favorite Button (Overlay) */}
              <div style={{ position: "absolute", top: "12px", right: "12px", zIndex: 10 }}>
                <FavoriteButton product={product} />
              </div>

              {/* Discount Tag */}
              {discount > 0 && (
                <span
                  style={{
                    position: "absolute",
                    top: "12px",
                    left: "12px",
                    background: "#DC2626",
                    color: "#FFFFFF",
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    padding: "4px 10px",
                    borderRadius: "var(--radius-full)",
                  }}
                >
                  {discount}% OFF
                </span>
              )}
            </div>
          </div>

          {/* COLUMN 2: Center Details & Offers */}
          <div>
            {/* Brand Store */}
            <div style={{ marginBottom: "4px" }}>
              <Link href={`/products?category=${product.category?.slug}`} style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--color-primary)", textDecoration: "none" }}>
                Visit the {product.category?.name || "Official"} Store
              </Link>
            </div>

            {/* Title */}
            <h1 style={{ fontFamily: "var(--font-display)", fontSize: "1.65rem", fontWeight: 700, margin: "0 0 10px 0", color: "var(--color-text-primary)", lineHeight: 1.3 }}>
              {product.name}
            </h1>

            {/* Rating Stars & Answered Questions */}
            <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap", paddingBottom: "12px", borderBottom: "1px solid var(--color-border)", marginBottom: "14px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "3px" }}>
                <IconStar /><IconStar /><IconStar /><IconStar /><IconStar />
              </div>
              <span style={{ fontWeight: 700, fontSize: "0.9rem", color: "var(--color-text-primary)" }}>4.8 out of 5</span>
              <span style={{ color: "var(--color-text-muted)" }}>•</span>
              <span style={{ fontSize: "0.85rem", color: "var(--color-primary)", fontWeight: 600 }}>1,842 ratings</span>
              <span style={{ color: "var(--color-text-muted)" }}>•</span>
              <span style={{ fontSize: "0.85rem", color: "var(--color-text-secondary)" }}>320+ answered questions</span>
            </div>

            {/* Price Block */}
            <div style={{ marginBottom: "16px" }}>
              {discount > 0 && (
                <span style={{ background: "#DC2626", color: "#FFFFFF", fontSize: "0.75rem", fontWeight: 700, padding: "2px 8px", borderRadius: "4px", display: "inline-block", marginBottom: "6px" }}>
                  Limited time deal
                </span>
              )}
              <div style={{ display: "flex", alignItems: "baseline", gap: "10px" }}>
                <span style={{ fontSize: "1.85rem", fontWeight: 700, fontFamily: "var(--font-mono)", color: "var(--color-text-primary)" }}>
                  ₹{formatPrice(product.basePrice)}
                </span>
                {discount > 0 && (
                  <span style={{ fontSize: "1rem", color: "var(--color-text-muted)", textDecoration: "line-through" }}>
                    M.R.P.: ₹{formatPrice(product.comparePrice)}
                  </span>
                )}
                {discount > 0 && (
                  <span style={{ fontSize: "0.95rem", color: "#DC2626", fontWeight: 700 }}>
                    ({discount}% off)
                  </span>
                )}
              </div>
              <div style={{ fontSize: "0.8rem", color: "var(--color-text-muted)", marginTop: "2px" }}>
                Inclusive of all taxes. Free express shipping on this order.
              </div>
            </div>

            {/* Amazon / Flipkart Offers Carousel Box */}
            <div style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-lg)", padding: "14px", marginBottom: "20px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", fontWeight: 700, fontSize: "0.9rem", color: "var(--color-text-primary)", marginBottom: "10px" }}>
                <IconTag />
                <span>Available Offers</span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <div style={{ padding: "10px", borderRadius: "var(--radius-md)", border: "1px solid var(--color-border)", background: "var(--color-surface-sunken)" }}>
                  <div style={{ fontWeight: 700, fontSize: "0.8rem", color: "var(--color-primary)" }}>Bank Offer</div>
                  <div style={{ fontSize: "0.75rem", color: "var(--color-text-secondary)", marginTop: "2px" }}>
                    Instant 10% discount up to ₹1,500 on Razorpay UPI & Cards.
                  </div>
                </div>
                <div style={{ padding: "10px", borderRadius: "var(--radius-md)", border: "1px solid var(--color-border)", background: "var(--color-surface-sunken)" }}>
                  <div style={{ fontWeight: 700, fontSize: "0.8rem", color: "var(--color-accent)" }}>Partner Offers</div>
                  <div style={{ fontSize: "0.75rem", color: "var(--color-text-secondary)", marginTop: "2px" }}>
                    Get GST invoice and save up to 28% on business purchases.
                  </div>
                </div>
              </div>
            </div>

            {/* Specifications Matrix Table */}
            <div style={{ marginBottom: "20px" }}>
              <h3 style={{ fontSize: "1rem", fontWeight: 700, margin: "0 0 10px 0", color: "var(--color-text-primary)" }}>
                Product Specifications
              </h3>
              <table style={{ width: "100%", fontSize: "0.85rem", borderCollapse: "collapse" }}>
                <tbody>
                  <tr style={{ borderBottom: "1px solid var(--color-border-subtle)" }}>
                    <td style={{ padding: "6px 0", fontWeight: 600, color: "var(--color-text-muted)", width: "35%" }}>Category</td>
                    <td style={{ padding: "6px 0", color: "var(--color-text-primary)", fontWeight: 600 }}>{product.category?.name || "General"}</td>
                  </tr>
                  <tr style={{ borderBottom: "1px solid var(--color-border-subtle)" }}>
                    <td style={{ padding: "6px 0", fontWeight: 600, color: "var(--color-text-muted)" }}>Warranty</td>
                    <td style={{ padding: "6px 0", color: "var(--color-text-primary)" }}>1 Year Comprehensive Brand Warranty</td>
                  </tr>
                  <tr style={{ borderBottom: "1px solid var(--color-border-subtle)" }}>
                    <td style={{ padding: "6px 0", fontWeight: 600, color: "var(--color-text-muted)" }}>Country of Origin</td>
                    <td style={{ padding: "6px 0", color: "var(--color-text-primary)" }}>India</td>
                  </tr>
                  <tr>
                    <td style={{ padding: "6px 0", fontWeight: 600, color: "var(--color-text-muted)" }}>Authenticity</td>
                    <td style={{ padding: "6px 0", color: "var(--color-success)", fontWeight: 600 }}>100% Genuine Verified Product</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Description / About This Item */}
            <div>
              <h3 style={{ fontSize: "1rem", fontWeight: 700, margin: "0 0 10px 0", color: "var(--color-text-primary)" }}>
                About this item
              </h3>
              <p style={{ fontSize: "0.9rem", color: "var(--color-text-secondary)", lineHeight: 1.6, margin: "0 0 10px 0" }}>
                {product.description || "Premium quality craftsmanship designed for longevity and superior performance."}
              </p>
              <ul style={{ paddingLeft: "18px", margin: 0, fontSize: "0.85rem", color: "var(--color-text-secondary)", lineHeight: 1.6 }}>
                <li>Engineered with high-grade components for everyday reliability.</li>
                <li>Rigorous quality testing backed by verified merchant warranty.</li>
                <li>Direct dispatch with tamper-proof packaging and real-time tracking.</li>
              </ul>
            </div>
          </div>

          {/* COLUMN 3: Amazon Buy Box */}
          <div
            style={{
              background: "var(--color-surface)",
              border: "1px solid var(--color-border)",
              borderRadius: "var(--radius-xl)",
              padding: "var(--space-5)",
              boxShadow: "var(--shadow-raised)",
              position: "sticky",
              top: "90px",
            }}
          >
            {/* Price */}
            <div style={{ fontSize: "1.75rem", fontWeight: 700, fontFamily: "var(--font-mono)", color: "var(--color-text-primary)", marginBottom: "4px" }}>
              ₹{formatPrice(product.basePrice)}
            </div>

            {/* Delivery Info */}
            <div style={{ fontSize: "0.85rem", color: "var(--color-text-secondary)", marginBottom: "12px", lineHeight: 1.4 }}>
              <span style={{ color: "var(--color-primary)", fontWeight: 700 }}>FREE delivery</span> by <strong>Tomorrow, 5 PM</strong>.
            </div>

            {/* Pincode checker */}
            <div style={{ marginBottom: "16px", padding: "8px", background: "var(--color-surface-sunken)", borderRadius: "var(--radius-md)" }}>
              <div style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--color-text-muted)", marginBottom: "4px" }}>
                Deliver to:
              </div>
              <div style={{ display: "flex", gap: "6px" }}>
                <input
                  type="text"
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  style={{ flex: 1, padding: "4px 8px", fontSize: "0.8rem", borderRadius: "var(--radius-sm)", border: "1px solid var(--color-border)" }}
                />
                <button
                  type="button"
                  onClick={() => { setPincodeChecked(true); toast.success(`Delivery available to ${pincode}`); }}
                  style={{ background: "transparent", border: "1px solid var(--color-border-strong)", borderRadius: "var(--radius-sm)", fontSize: "0.75rem", fontWeight: 600, cursor: "pointer", padding: "0 8px" }}
                >
                  Check
                </button>
              </div>
              {pincodeChecked && (
                <div style={{ fontSize: "0.725rem", color: "var(--color-success)", fontWeight: 600, marginTop: "4px" }}>
                  ✓ Standard delivery available
                </div>
              )}
            </div>

            {/* In Stock status */}
            <div style={{ marginBottom: "14px" }}>
              {inStock ? (
                <div style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--color-success)" }}>
                  In Stock
                </div>
              ) : (
                <div style={{ fontSize: "1.1rem", fontWeight: 700, color: "#DC2626" }}>
                  Currently Out of Stock
                </div>
              )}
            </div>

            {/* Quantity Selector */}
            {inStock && (
              <div style={{ marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
                <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--color-text-secondary)" }}>
                  Quantity:
                </label>
                <select
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  style={{
                    padding: "6px 12px",
                    borderRadius: "var(--radius-md)",
                    border: "1px solid var(--color-border)",
                    background: "var(--color-surface)",
                    fontSize: "0.875rem",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  {[1, 2, 3, 4, 5].map((num) => (
                    <option key={num} value={num}>
                      {num}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Action Buttons */}
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "16px" }}>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleAddToCart}
                disabled={isAdding || !inStock}
                style={{
                  width: "100%",
                  height: "44px",
                  fontSize: "0.95rem",
                  fontWeight: 700,
                  borderRadius: "var(--radius-full)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                }}
              >
                <IconCart />
                <span>{isAdding ? "Adding to Cart…" : "Add to Cart"}</span>
              </button>

              <button
                type="button"
                onClick={handleBuyNow}
                disabled={isAdding || !inStock}
                style={{
                  width: "100%",
                  height: "44px",
                  background: "#D97706",
                  color: "#FFFFFF",
                  border: "none",
                  fontSize: "0.95rem",
                  fontWeight: 700,
                  borderRadius: "var(--radius-full)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  cursor: isAdding || !inStock ? "not-allowed" : "pointer",
                  transition: "background 0.15s",
                }}
              >
                <IconBolt />
                <span>Buy Now</span>
              </button>
            </div>

            {/* Wishlist Folder Selector Button */}
            <div style={{ marginBottom: "16px" }}>
              <WishlistButton product={product} variant="full" />
            </div>

            {/* Security & Seller Details */}
            <div style={{ fontSize: "0.775rem", color: "var(--color-text-muted)", display: "flex", flexDirection: "column", gap: "6px", paddingTop: "12px", borderTop: "1px solid var(--color-border)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <IconShield />
                <span>100% Razorpay Secure Transaction</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <IconTruck />
                <span>Dispatched from ShopSmart Fulfillment</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <IconRotate />
                <span>7-Day Replacement Policy</span>
              </div>
            </div>
          </div>
        </div>

        {/* Similar / Related Products Rail */}
        {relatedProducts.length > 0 && (
          <section style={{ background: "var(--color-surface)", borderRadius: "var(--radius-xl)", padding: "var(--space-6)", border: "1px solid var(--color-border)", boxShadow: "var(--shadow-card)" }}>
            <h2 style={{ fontSize: "1.25rem", fontWeight: 700, margin: "0 0 16px 0", color: "var(--color-text-primary)" }}>
              Customers who viewed this item also viewed
            </h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "var(--space-4)" }}>
              {relatedProducts.map((rel) => {
                const relDiscount = rel.comparePrice && Number(rel.comparePrice) > Number(rel.basePrice)
                  ? Math.round(((Number(rel.comparePrice) - Number(rel.basePrice)) / Number(rel.comparePrice)) * 100)
                  : 0;

                return (
                  <Link
                    key={rel.id}
                    href={`/products/${rel.id}`}
                    style={{
                      textDecoration: "none",
                      color: "inherit",
                      background: "var(--color-surface-sunken)",
                      padding: "12px",
                      borderRadius: "var(--radius-lg)",
                      border: "1px solid var(--color-border)",
                      display: "flex",
                      flexDirection: "column",
                      transition: "transform 0.15s",
                    }}
                  >
                    <div style={{ height: "160px", position: "relative", borderRadius: "var(--radius-md)", overflow: "hidden", marginBottom: "8px", background: "var(--color-surface)" }}>
                      <OptimizedImage src={rel.images?.[0]} alt={rel.name} fill sizes="220px" />
                    </div>
                    <div style={{ fontSize: "0.85rem", fontWeight: 600, height: "2.6em", overflow: "hidden", textOverflow: "ellipsis", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", marginBottom: "4px" }}>
                      {rel.name}
                    </div>
                    <div style={{ display: "flex", alignItems: "baseline", gap: "6px", marginTop: "auto" }}>
                      <span style={{ fontWeight: 700, fontSize: "1rem", color: "var(--color-text-primary)" }}>
                        ₹{formatPrice(rel.basePrice)}
                      </span>
                      {relDiscount > 0 && (
                        <span style={{ fontSize: "0.75rem", color: "#DC2626", fontWeight: 700 }}>
                          {relDiscount}% off
                        </span>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
