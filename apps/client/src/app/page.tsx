"use client";

import { useEffect, useState, useRef, useMemo, useCallback } from "react";
import Link from "next/link";
import { productService } from "@/features/products/services/productService";
import { categoryService } from "@/features/categories/services/categoryService";
import type { CategoryNode } from "@/features/categories/types/categorySchema";
import { ProductImage } from "@/features/products/components/ProductImage";
import { formatPrice, type Product } from "@/features/products/types/productSchema";
import { useCart } from "@/features/cart";
import { useAuth } from "@/features/auth";
import { useUI } from "@/context/UIContext";
import { WishlistButton } from "@/features/wishlist/components/WishlistButton";
import { HomeHeroSkeleton, HomeQuadSkeleton, HomeRailSkeleton } from "@/components/ui/Skeleton";
import toast from "react-hot-toast";




// Vector SVG Icons
function IconStar() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="#F59E0B" stroke="#F59E0B" strokeWidth="1" aria-hidden="true">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

function IconCart() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="9" cy="21" r="1" />
      <circle cx="20" cy="21" r="1" />
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
    </svg>
  );
}

function IconChevronLeft() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  );
}

function IconChevronRight() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}

function IconFire() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="#EF4444" stroke="#EF4444" strokeWidth="1" aria-hidden="true">
      <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
    </svg>
  );
}

function IconClock() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

// Category Quick Bubbles (Flipkart top rail)
const CATEGORY_BUBBLES = [
  { name: "Audio & Gadgets", href: "/products?category=electronics", icon: "🎧", bg: "rgba(16, 185, 129, 0.12)" },
  { name: "Fashion & Sarees", href: "/products?category=clothing", icon: "👗", bg: "rgba(139, 92, 246, 0.12)" },
  { name: "Keyboards & Gear", href: "/products?category=electronics", icon: "⌨️", bg: "rgba(14, 165, 233, 0.12)" },
  { name: "Home & Kitchen", href: "/products?category=home-garden", icon: "🏺", bg: "rgba(245, 158, 11, 0.12)" },
  { name: "Books & Mindset", href: "/products?category=books", icon: "📖", bg: "rgba(239, 68, 68, 0.12)" },
  { name: "Sports & Fitness", href: "/products?category=sports", icon: "🏃", bg: "rgba(16, 185, 129, 0.12)" },
  { name: "Today's Deals", href: "/products?sort=popular", icon: "⚡", bg: "rgba(249, 115, 22, 0.12)" },
  { name: "Best Sellers", href: "/products?sort=best-selling", icon: "⭐", bg: "rgba(234, 179, 8, 0.12)" },
];

// Hero Sliding Promo Banners
const HERO_SLIDES = [
  {
    tag: "GREAT INDIAN TECH SALE",
    title: "Up to 50% Off Top Electronics",
    desc: "Industry-leading Sony noise-cancelling headphones, Keychron mechanical gear & high-fidelity sound.",
    cta: "Shop Electronics",
    link: "/products?category=electronics",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1200&auto=format&fit=crop&q=80",
    bgGradient: "linear-gradient(90deg, #0B1120 0%, rgba(11, 17, 32, 0.88) 55%, transparent 100%)",
  },
  {
    tag: "HANDCRAFTED HERITAGE FESTIVAL",
    title: "Pure Silk Sarees & French Linen",
    desc: "Authentic Chanderi silk, Bagru indigo block prints, and breathable tailored linen for effortless elegance.",
    cta: "Explore Fashion",
    link: "/products?category=clothing",
    image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=1200&auto=format&fit=crop&q=80",
    bgGradient: "linear-gradient(90deg, #2E1065 0%, rgba(46, 16, 101, 0.88) 55%, transparent 100%)",
  },
  {
    tag: "HOME & KITCHEN ESSENTIALS",
    title: "Artisanal Living Under ₹999",
    desc: "Handcrafted copper carafes, teakwood cutting boards, ceramic mugs, and ultrasonic aroma diffusers.",
    cta: "Discover Home Decor",
    link: "/products?category=home-garden",
    image: "https://images.unsplash.com/photo-1517256064527-09c73fc73e38?w=1200&auto=format&fit=crop&q=80",
    bgGradient: "linear-gradient(90deg, #064E3B 0%, rgba(6, 78, 59, 0.88) 55%, transparent 100%)",
  },
];

// Amazon & Flipkart Product Card
function AmazonProductCard({ product }: { product: Product }) {
  const { addItem, updateQuantity, removeItem, getItemQuantity, isInCart, isLoading } = useCart();
  const { openQuickView } = useUI();
  const inCart = isInCart(product.id);
  const cartQuantity = getItemQuantity(product.id);
  const [adding, setAdding] = useState(false);

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setAdding(true);
    try {
      const cartProduct = {
        ...product,
        basePrice: String(product.basePrice),
        comparePrice: product.comparePrice != null ? String(product.comparePrice) : null,
      };
      await addItem(cartProduct as unknown as Parameters<typeof addItem>[0], 1);
      toast.success(`Added "${product.name}" to cart`);
    } catch {
      toast.error("Failed to add to cart");
    } finally {
      setAdding(false);
    }
  };

  const handleIncrement = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await updateQuantity(product.id, cartQuantity + 1);
    } catch {
      toast.error("Failed to update cart");
    }
  };

  const handleDecrement = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      if (cartQuantity <= 1) {
        await removeItem(product.id);
        toast.success(`Removed "${product.name}" to cart`);
      } else {
        await updateQuantity(product.id, cartQuantity - 1);
      }
    } catch {
      toast.error("Failed to update cart");
    }
  };

  const hasDiscount = product.comparePrice && Number(product.comparePrice) > Number(product.basePrice);
  const discountPercent = hasDiscount
    ? Math.round(((Number(product.comparePrice) - Number(product.basePrice)) / Number(product.comparePrice)) * 100)
    : 0;

  return (
    <div
      style={{
        background: "var(--color-surface)",
        border: "1px solid var(--color-border)",
        borderRadius: "var(--radius-lg)",
        padding: "var(--space-3)",
        display: "flex",
        flexDirection: "column",
        minWidth: "210px",
        maxWidth: "220px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
        position: "relative",
        transition: "transform 0.15s ease, box-shadow 0.15s ease",
        flexShrink: 0,
      }}
      className="amazon-card"
    >
      {/* Wishlist Button & Quick View */}
      <div style={{ position: "absolute", top: "8px", right: "8px", zIndex: 5, display: "flex", gap: "4px" }}>
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            openQuickView(product);
          }}
          aria-label={`Quick view ${product.name}`}
          style={{
            background: "rgba(255, 255, 255, 0.9)",
            border: "1px solid var(--color-border)",
            borderRadius: "50%",
            width: "28px",
            height: "28px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            color: "var(--color-text-primary)",
            boxShadow: "0 2px 6px rgba(0,0,0,0.06)",
          }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
        </button>
        <WishlistButton product={product} />
      </div>

      {/* Product Image */}
      <Link href={`/products/${product.id}`} style={{ display: "block", height: "160px", position: "relative", background: "var(--color-surface-sunken)", borderRadius: "var(--radius-md)", overflow: "hidden", marginBottom: "8px" }}>
        <ProductImage src={product.images?.[0]} alt={product.name} fill sizes="210px" />
      </Link>

      {/* Deal Badge */}
      {hasDiscount && (
        <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
          <span style={{ background: "#DC2626", color: "#FFFFFF", fontSize: "0.68rem", fontWeight: 700, padding: "2px 6px", borderRadius: "3px" }}>
            {discountPercent}% off
          </span>
          <span style={{ color: "#DC2626", fontSize: "0.68rem", fontWeight: 700 }}>Deal</span>
        </div>
      )}

      {/* Product Title */}
      <Link href={`/products/${product.id}`} style={{ textDecoration: "none", color: "var(--color-text-primary)", marginBottom: "4px" }}>
        <h3 style={{ fontSize: "0.85rem", fontWeight: 600, margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {product.name}
        </h3>
      </Link>

      {/* Star Rating */}
      <div style={{ display: "flex", alignItems: "center", gap: "4px", marginBottom: "6px" }}>
        <div style={{ display: "flex", gap: "1px" }}>
          {[...Array(5)].map((_, i) => (
            <IconStar key={i} />
          ))}
        </div>
        <span style={{ fontSize: "0.72rem", color: "var(--color-text-muted)", fontWeight: 600 }}>
          {product.stock > 10 ? "4.8" : "4.5"}
        </span>
      </div>

      {/* Pricing */}
      <div style={{ marginTop: "auto", display: "flex", alignItems: "baseline", gap: "6px", marginBottom: "8px" }}>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: "1.05rem", fontWeight: 800, color: "var(--color-text-primary)" }}>
          ₹{formatPrice(product.basePrice)}
        </span>
        {product.comparePrice && (
          <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem", color: "var(--color-text-muted)", textDecoration: "line-through" }}>
            ₹{formatPrice(product.comparePrice)}
          </span>
        )}
      </div>

      {/* Quantity / Add Button */}
      {inCart ? (
        <div style={{ display: "flex", alignItems: "center", border: "1px solid var(--color-primary)", borderRadius: "var(--radius-full)", overflow: "hidden", height: "30px", background: "var(--color-surface)" }}>
          <button
            type="button"
            onClick={handleDecrement}
            disabled={isLoading}
            style={{ width: "28px", height: "100%", background: "transparent", border: "none", color: "var(--color-primary)", fontSize: "1rem", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
            aria-label="Decrease quantity"
          >
            -
          </button>
          <span style={{ flex: 1, textAlign: "center", fontSize: "0.78rem", fontWeight: 700, fontFamily: "var(--font-mono)" }}>
            {cartQuantity}
          </span>
          <button
            type="button"
            onClick={handleIncrement}
            disabled={isLoading || cartQuantity >= product.stock}
            style={{ width: "28px", height: "100%", background: "transparent", border: "none", color: "var(--color-primary)", fontSize: "1rem", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
            aria-label="Increase quantity"
          >
            +
          </button>
        </div>
      ) : (
        <button
          type="button"
          className="btn btn-primary btn-sm"
          onClick={handleAddToCart}
          disabled={adding || product.stock === 0}
          style={{
            width: "100%",
            padding: "6px 10px",
            borderRadius: "var(--radius-full)",
            fontSize: "0.78rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "5px",
          }}
        >
          <IconCart />
          <span>{adding ? "..." : product.stock === 0 ? "Out of Stock" : "Add to Cart"}</span>
        </button>
      )}
    </div>
  );
}

export default function HomePage() {
  const { user } = useAuth();
  const [, setCategories] = useState<CategoryNode[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [currentHeroSlide, setCurrentHeroSlide] = useState(0);
  const [timeLeft, setTimeLeft] = useState({ hours: 5, minutes: 42, seconds: 8 });

  const dealsScrollRef = useRef<HTMLDivElement>(null);
  const techScrollRef = useRef<HTMLDivElement>(null);
  const fashionScrollRef = useRef<HTMLDivElement>(null);
  const booksScrollRef = useRef<HTMLDivElement>(null);

  // Load categories & products
  useEffect(() => {
    categoryService
      .getTree()
      .then((res: { data?: CategoryNode[] } | CategoryNode[]) => {
        const data = Array.isArray(res) ? res : res.data ?? [];
        setCategories(data);
      })
      .catch(() => setCategories([]));

    productService
      .getAll({ limit: "40", sort: "newest" })
      .then((res: { data?: Product[] } | Product[]) => {
        const list = Array.isArray(res) ? res : res.data ?? [];
        setProducts(list);
      })
      .catch(() => setProducts([]))
      .finally(() => setIsLoading(false));
  }, []);


  // Auto-slide hero
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentHeroSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  // Flash Sale Countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 5, minutes: 59, seconds: 59 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const scrollRail = useCallback((ref: React.RefObject<HTMLDivElement | null>, direction: "left" | "right") => {
    if (!ref.current) return;
    const scrollAmount = 480;
    ref.current.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  }, []);

  // Curated groups for Amazon 4-Quad Cards (Memoized to prevent filtering on every 1-second timer tick)
  const electronicsQuad = useMemo(() => products.filter((p) => p.category?.slug?.includes("elect")).slice(0, 4), [products]);
  const fashionQuad = useMemo(() => products.filter((p) => p.category?.slug?.includes("cloth")).slice(0, 4), [products]);
  const homeQuad = useMemo(() => products.filter((p) => p.category?.slug?.includes("home")).slice(0, 4), [products]);
  const booksQuad = useMemo(() => products.filter((p) => p.category?.slug?.includes("book") || p.category?.name?.toLowerCase().includes("book")).slice(0, 4), [products]);
  const safeBooksQuad = useMemo(() => (booksQuad.length === 4 ? booksQuad : products.slice(0, 4)), [booksQuad, products]);

  // Dedicated rails (Memoized)
  const dealRail = useMemo(() => products.slice(0, 10), [products]);
  const techRail = useMemo(() => products.filter((p) => p.category?.slug?.includes("elect")), [products]);
  const fashionRail = useMemo(() => products.filter((p) => p.category?.slug?.includes("cloth")), [products]);
  const booksRail = useMemo(() => products.filter((p) => p.category?.slug?.includes("book") || p.category?.name?.toLowerCase().includes("book")), [products]);

  const slide = HERO_SLIDES[currentHeroSlide];


  return (
    <div style={{ background: "var(--color-bg)", minHeight: "100vh", paddingBottom: "var(--space-16)", overflowX: "hidden", width: "100%" }}>
      
      {/* 1. Flipkart-Style Top Category Quick Rail */}
      <div style={{ background: "var(--color-surface)", borderBottom: "1px solid var(--color-border)", padding: "10px 0" }}>
        <div className="container">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px", overflowX: "auto", paddingBottom: "2px" }}>
            {CATEGORY_BUBBLES.map((bubble, i) => (
              <Link
                key={i}
                href={bubble.href}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  textDecoration: "none",
                  gap: "6px",
                  padding: "4px 8px",
                  borderRadius: "var(--radius-md)",
                  flexShrink: 0,
                }}
                className="category-bubble-item"
              >
                <div
                  style={{
                    width: "44px",
                    height: "44px",
                    borderRadius: "50%",
                    background: bubble.bg,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "1.25rem",
                    boxShadow: "0 2px 6px rgba(0,0,0,0.04)",
                  }}
                >
                  {bubble.icon}
                </div>
                <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--color-text-primary)", whiteSpace: "nowrap" }}>
                  {bubble.name}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* 2. Razorpay & Express Delivery Banner Strip */}
      <div style={{ background: "linear-gradient(90deg, #0F766E 0%, #115E59 100%)", color: "#FFFFFF", padding: "6px 0", fontSize: "0.825rem", textAlign: "center", fontWeight: 600 }}>
        <span>💳 Instant 10% Off with Razorpay UPI & Cards &nbsp;|&nbsp; 🚚 FREE Express Delivery on Orders over ₹500</span>
      </div>

      {isLoading && products.length === 0 ? (
        <>
          <HomeHeroSkeleton />
          <HomeQuadSkeleton />
          <HomeRailSkeleton />
        </>
      ) : (
        <>
          {/* 3. Amazon-Style Sliding Hero Banner (Optimized with priority loading for LCP) */}
          <div style={{ position: "relative", height: "360px", overflow: "hidden", background: "#0B1120" }}>

        {/* Background image & gradient */}
        <div style={{ position: "absolute", inset: 0 }}>
          <ProductImage src={slide.image} alt={slide.title} fill priority sizes="100vw" />
          <div style={{ position: "absolute", inset: 0, background: slide.bgGradient }} />
        </div>

        {/* Hero Content */}
        <div className="container" style={{ position: "relative", height: "100%", display: "flex", alignItems: "center", zIndex: 5 }}>
          <div style={{ maxWidth: "520px", color: "#FFFFFF" }}>
            <span style={{ display: "inline-block", background: "rgba(255, 255, 255, 0.2)", backdropFilter: "blur(6px)", padding: "3px 10px", borderRadius: "999px", fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.08em", marginBottom: "10px" }}>
              {slide.tag}
            </span>
            <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1.75rem, 3.5vw, 2.75rem)", fontWeight: 700, margin: "0 0 8px 0", lineHeight: 1.15 }}>
              {slide.title}
            </h1>
            <p style={{ fontSize: "0.925rem", color: "rgba(255, 255, 255, 0.85)", margin: "0 0 16px 0", lineHeight: 1.45 }}>
              {slide.desc}
            </p>
            <Link href={slide.link} className="btn btn-primary" style={{ padding: "8px 22px", fontSize: "0.9rem", borderRadius: "var(--radius-full)" }}>
              {slide.cta} →
            </Link>
          </div>
        </div>

        {/* Slider Controls */}
        <button
          type="button"
          onClick={() => setCurrentHeroSlide((prev) => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length)}
          style={{ position: "absolute", top: "50%", transform: "translateY(-50%)", left: "16px", background: "rgba(0,0,0,0.5)", color: "#FFFFFF", border: "none", width: "36px", height: "36px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", zIndex: 10 }}
          aria-label="Previous slide"
        >
          <IconChevronLeft />
        </button>
        <button
          type="button"
          onClick={() => setCurrentHeroSlide((prev) => (prev + 1) % HERO_SLIDES.length)}
          style={{ position: "absolute", top: "50%", transform: "translateY(-50%)", right: "16px", background: "rgba(0,0,0,0.5)", color: "#FFFFFF", border: "none", width: "36px", height: "36px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", zIndex: 10 }}
          aria-label="Next slide"
        >
          <IconChevronRight />
        </button>

        {/* Slide Dots */}
        <div style={{ position: "absolute", bottom: "14px", left: "50%", transform: "translateX(-50%)", display: "flex", gap: "6px", zIndex: 10 }}>
          {HERO_SLIDES.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setCurrentHeroSlide(idx)}
              style={{
                width: currentHeroSlide === idx ? "20px" : "6px",
                height: "6px",
                borderRadius: "3px",
                background: currentHeroSlide === idx ? "var(--color-primary)" : "rgba(255,255,255,0.5)",
                border: "none",
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      </div>

      {/* 4. Amazon 4-Quad Cards Grid (Contained with clean spacing) */}
      <div className="container" style={{ marginTop: "var(--space-6)", position: "relative", zIndex: 15 }}>
        <div className="amazon-quads-grid" style={{ marginBottom: "var(--space-8)" }}>
          {/* Quad 1: Electronics */}
          <div className="amazon-quad-card">
            <h3 style={{ fontSize: "1.05rem", fontWeight: 700, margin: "0 0 12px 0", color: "var(--color-text-primary)" }}>
              Deals on Top Electronics
            </h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", flex: 1, minWidth: 0 }}>
              {electronicsQuad.map((item) => (
                <Link key={item.id} href={`/products/${item.id}`} className="amazon-quad-item">
                  <div style={{ aspectRatio: "1/1", width: "100%", position: "relative", background: "var(--color-surface-sunken)", borderRadius: "var(--radius-md)", overflow: "hidden", marginBottom: "4px" }}>
                    <ProductImage src={item.images?.[0]} alt={item.name} fill sizes="110px" />
                  </div>
                  <h5 style={{ fontSize: "0.725rem", fontWeight: 600, margin: "0 0 2px 0", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", color: "var(--color-text-primary)" }}>
                    {item.name}
                  </h5>
                  <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--color-primary)" }}>₹{formatPrice(item.basePrice)}</div>
                </Link>
              ))}
            </div>
            <Link href="/products?category=electronics" style={{ color: "var(--color-primary)", fontSize: "0.825rem", fontWeight: 600, textDecoration: "none", marginTop: "12px", display: "inline-block" }}>
              See all electronics →
            </Link>
          </div>

          {/* Quad 2: Fashion */}
          <div className="amazon-quad-card">
            <h3 style={{ fontSize: "1.05rem", fontWeight: 700, margin: "0 0 12px 0", color: "var(--color-text-primary)" }}>
              Handcrafted Silk & Fashion
            </h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", flex: 1, minWidth: 0 }}>
              {fashionQuad.map((item) => (
                <Link key={item.id} href={`/products/${item.id}`} className="amazon-quad-item">
                  <div style={{ aspectRatio: "1/1", width: "100%", position: "relative", background: "var(--color-surface-sunken)", borderRadius: "var(--radius-md)", overflow: "hidden", marginBottom: "4px" }}>
                    <ProductImage src={item.images?.[0]} alt={item.name} fill sizes="110px" />
                  </div>
                  <h5 style={{ fontSize: "0.725rem", fontWeight: 600, margin: "0 0 2px 0", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", color: "var(--color-text-primary)" }}>
                    {item.name}
                  </h5>
                  <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--color-primary)" }}>₹{formatPrice(item.basePrice)}</div>
                </Link>
              ))}
            </div>
            <Link href="/products?category=clothing" style={{ color: "var(--color-primary)", fontSize: "0.825rem", fontWeight: 600, textDecoration: "none", marginTop: "12px", display: "inline-block" }}>
              Explore fashion deals →
            </Link>
          </div>

          {/* Quad 3: Home & Living */}
          <div className="amazon-quad-card">
            <h3 style={{ fontSize: "1.05rem", fontWeight: 700, margin: "0 0 12px 0", color: "var(--color-text-primary)" }}>
              Home & Living Essentials
            </h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", flex: 1, minWidth: 0 }}>
              {homeQuad.map((item) => (
                <Link key={item.id} href={`/products/${item.id}`} className="amazon-quad-item">
                  <div style={{ aspectRatio: "1/1", width: "100%", position: "relative", background: "var(--color-surface-sunken)", borderRadius: "var(--radius-md)", overflow: "hidden", marginBottom: "4px" }}>
                    <ProductImage src={item.images?.[0]} alt={item.name} fill sizes="110px" />
                  </div>
                  <h5 style={{ fontSize: "0.725rem", fontWeight: 600, margin: "0 0 2px 0", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", color: "var(--color-text-primary)" }}>
                    {item.name}
                  </h5>
                  <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--color-primary)" }}>₹{formatPrice(item.basePrice)}</div>
                </Link>
              ))}
            </div>
            <Link href="/products?category=home-garden" style={{ color: "var(--color-primary)", fontSize: "0.825rem", fontWeight: 600, textDecoration: "none", marginTop: "12px", display: "inline-block" }}>
              Shop home collection →
            </Link>
          </div>

          {/* Quad 4: Books & Mindset */}
          <div className="amazon-quad-card">
            <h3 style={{ fontSize: "1.05rem", fontWeight: 700, margin: "0 0 12px 0", color: "var(--color-text-primary)" }}>
              Best-Selling Books & Reads
            </h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", flex: 1, minWidth: 0 }}>
              {safeBooksQuad.map((item) => (
                <Link key={item.id} href={`/products/${item.id}`} className="amazon-quad-item">
                  <div style={{ aspectRatio: "1/1", width: "100%", position: "relative", background: "var(--color-surface-sunken)", borderRadius: "var(--radius-md)", overflow: "hidden", marginBottom: "4px" }}>
                    <ProductImage src={item.images?.[0]} alt={item.name} fill sizes="110px" />
                  </div>
                  <h5 style={{ fontSize: "0.725rem", fontWeight: 600, margin: "0 0 2px 0", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", color: "var(--color-text-primary)" }}>
                    {item.name}
                  </h5>
                  <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--color-primary)" }}>₹{formatPrice(item.basePrice)}</div>
                </Link>
              ))}
            </div>
            <Link href="/products?category=books" style={{ color: "var(--color-primary)", fontSize: "0.825rem", fontWeight: 600, textDecoration: "none", marginTop: "12px", display: "inline-block" }}>
              Explore literature →
            </Link>
          </div>
        </div>

        {/* 5. Flipkart-Style "Deals of the Day" Flash Rail */}
        <section style={{ background: "var(--color-surface)", borderRadius: "var(--radius-xl)", padding: "var(--space-5)", border: "1px solid var(--color-border)", boxShadow: "0 2px 10px rgba(0,0,0,0.04)", marginBottom: "var(--space-8)" }}>
          {/* Rail Header with Countdown */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px", paddingBottom: "12px", borderBottom: "1px solid var(--color-border)", marginBottom: "16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#DC2626" }}>
                <IconFire />
                <h2 style={{ fontSize: "1.25rem", fontWeight: 700, margin: 0, color: "var(--color-text-primary)" }}>
                  Deals of the Day
                </h2>
              </div>

              {/* Countdown Clock */}
              <div style={{ display: "inline-flex", alignItems: "center", gap: "5px", background: "rgba(220, 38, 38, 0.1)", color: "#DC2626", padding: "3px 10px", borderRadius: "999px", fontSize: "0.78rem", fontWeight: 700 }}>
                <IconClock />
                <span>
                  Ends in {String(timeLeft.hours).padStart(2, "0")}:{String(timeLeft.minutes).padStart(2, "0")}:{String(timeLeft.seconds).padStart(2, "0")}
                </span>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Link href="/products?sort=popular" style={{ color: "var(--color-primary)", fontSize: "0.85rem", fontWeight: 600, textDecoration: "none" }}>
                View All Deals →
              </Link>
              <button
                type="button"
                onClick={() => scrollRail(dealsScrollRef, "left")}
                style={{ background: "var(--color-surface-sunken)", border: "1px solid var(--color-border)", borderRadius: "50%", width: "32px", height: "32px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
                aria-label="Scroll left"
              >
                <IconChevronLeft />
              </button>
              <button
                type="button"
                onClick={() => scrollRail(dealsScrollRef, "right")}
                style={{ background: "var(--color-surface-sunken)", border: "1px solid var(--color-border)", borderRadius: "50%", width: "32px", height: "32px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
                aria-label="Scroll right"
              >
                <IconChevronRight />
              </button>
            </div>
          </div>

          {/* Deals Rail */}
          <div
            ref={dealsScrollRef}
            style={{
              display: "flex",
              gap: "14px",
              overflowX: "auto",
              paddingBottom: "8px",
              scrollSnapType: "x mandatory",
            }}
          >
            {dealRail.map((product) => (
              <div key={product.id} style={{ scrollSnapAlign: "start" }}>
                <AmazonProductCard product={product} />
              </div>
            ))}
          </div>
        </section>

        {/* 6. Best Sellers in Electronics & Audio Rail */}
        {techRail.length > 0 && (
          <section style={{ background: "var(--color-surface)", borderRadius: "var(--radius-xl)", padding: "var(--space-5)", border: "1px solid var(--color-border)", boxShadow: "0 2px 10px rgba(0,0,0,0.04)", marginBottom: "var(--space-8)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingBottom: "12px", borderBottom: "1px solid var(--color-border)", marginBottom: "16px" }}>
              <div>
                <h2 style={{ fontSize: "1.25rem", fontWeight: 700, margin: 0, color: "var(--color-text-primary)" }}>
                  Best Sellers in Electronics & Audio
                </h2>
                <p style={{ margin: "2px 0 0 0", color: "var(--color-text-muted)", fontSize: "0.825rem" }}>
                  Top-rated wireless headphones, keyboards & gadgets
                </p>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Link href="/products?category=electronics" style={{ color: "var(--color-primary)", fontSize: "0.85rem", fontWeight: 600, textDecoration: "none" }}>
                  See more →
                </Link>
                <button
                  type="button"
                  onClick={() => scrollRail(techScrollRef, "left")}
                  style={{ background: "var(--color-surface-sunken)", border: "1px solid var(--color-border)", borderRadius: "50%", width: "32px", height: "32px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
                  aria-label="Scroll tech left"
                >
                  <IconChevronLeft />
                </button>
                <button
                  type="button"
                  onClick={() => scrollRail(techScrollRef, "right")}
                  style={{ background: "var(--color-surface-sunken)", border: "1px solid var(--color-border)", borderRadius: "50%", width: "32px", height: "32px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
                  aria-label="Scroll tech right"
                >
                  <IconChevronRight />
                </button>
              </div>
            </div>

            <div
              ref={techScrollRef}
              style={{
                display: "flex",
                gap: "14px",
                overflowX: "auto",
                paddingBottom: "8px",
                scrollSnapType: "x mandatory",
              }}
            >
              {techRail.map((product) => (
                <div key={product.id} style={{ scrollSnapAlign: "start" }}>
                  <AmazonProductCard product={product} />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 7. Best Sellers in Fashion & Handlooms Rail */}
        {fashionRail.length > 0 && (
          <section style={{ background: "var(--color-surface)", borderRadius: "var(--radius-xl)", padding: "var(--space-5)", border: "1px solid var(--color-border)", boxShadow: "0 2px 10px rgba(0,0,0,0.04)", marginBottom: "var(--space-8)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingBottom: "12px", borderBottom: "1px solid var(--color-border)", marginBottom: "16px" }}>
              <div>
                <h2 style={{ fontSize: "1.25rem", fontWeight: 700, margin: 0, color: "var(--color-text-primary)" }}>
                  Handcrafted Silk & Contemporary Fashion
                </h2>
                <p style={{ margin: "2px 0 0 0", color: "var(--color-text-muted)", fontSize: "0.825rem" }}>
                  Chanderi sarees, pure French linen & block print kurtas
                </p>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Link href="/products?category=clothing" style={{ color: "var(--color-primary)", fontSize: "0.85rem", fontWeight: 600, textDecoration: "none" }}>
                  See more →
                </Link>
                <button
                  type="button"
                  onClick={() => scrollRail(fashionScrollRef, "left")}
                  style={{ background: "var(--color-surface-sunken)", border: "1px solid var(--color-border)", borderRadius: "50%", width: "32px", height: "32px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
                  aria-label="Scroll fashion left"
                >
                  <IconChevronLeft />
                </button>
                <button
                  type="button"
                  onClick={() => scrollRail(fashionScrollRef, "right")}
                  style={{ background: "var(--color-surface-sunken)", border: "1px solid var(--color-border)", borderRadius: "50%", width: "32px", height: "32px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
                  aria-label="Scroll fashion right"
                >
                  <IconChevronRight />
                </button>
              </div>
            </div>

            <div
              ref={fashionScrollRef}
              style={{
                display: "flex",
                gap: "14px",
                overflowX: "auto",
                paddingBottom: "8px",
                scrollSnapType: "x mandatory",
              }}
            >
              {fashionRail.map((product) => (
                <div key={product.id} style={{ scrollSnapAlign: "start" }}>
                  <AmazonProductCard product={product} />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 8. Best Selling Books & Literature Rail */}
        {booksRail.length > 0 && (
          <section style={{ background: "var(--color-surface)", borderRadius: "var(--radius-xl)", padding: "var(--space-5)", border: "1px solid var(--color-border)", boxShadow: "0 2px 10px rgba(0,0,0,0.04)", marginBottom: "var(--space-8)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingBottom: "12px", borderBottom: "1px solid var(--color-border)", marginBottom: "16px" }}>
              <div>
                <h2 style={{ fontSize: "1.25rem", fontWeight: 700, margin: 0, color: "var(--color-text-primary)" }}>
                  Must-Read Books & Hardcover Bestsellers
                </h2>
                <p style={{ margin: "2px 0 0 0", color: "var(--color-text-muted)", fontSize: "0.825rem" }}>
                  Personal growth, philosophy, and award-winning fiction
                </p>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Link href="/products?category=books" style={{ color: "var(--color-primary)", fontSize: "0.85rem", fontWeight: 600, textDecoration: "none" }}>
                  See more →
                </Link>
                <button
                  type="button"
                  onClick={() => scrollRail(booksScrollRef, "left")}
                  style={{ background: "var(--color-surface-sunken)", border: "1px solid var(--color-border)", borderRadius: "50%", width: "32px", height: "32px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
                  aria-label="Scroll books left"
                >
                  <IconChevronLeft />
                </button>
                <button
                  type="button"
                  onClick={() => scrollRail(booksScrollRef, "right")}
                  style={{ background: "var(--color-surface-sunken)", border: "1px solid var(--color-border)", borderRadius: "50%", width: "32px", height: "32px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
                  aria-label="Scroll books right"
                >
                  <IconChevronRight />
                </button>
              </div>
            </div>

            <div
              ref={booksScrollRef}
              style={{
                display: "flex",
                gap: "14px",
                overflowX: "auto",
                paddingBottom: "8px",
                scrollSnapType: "x mandatory",
              }}
            >
              {booksRail.map((product) => (
                <div key={product.id} style={{ scrollSnapAlign: "start" }}>
                  <AmazonProductCard product={product} />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 9. Dynamic Auth / Orders Banner */}
        <section
          style={{
            background: "linear-gradient(135deg, var(--color-primary-surface) 0%, var(--color-surface) 100%)",
            border: "1px solid var(--color-primary-border)",
            borderRadius: "var(--radius-xl)",
            padding: "var(--space-8)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "16px",
            boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
          }}
        >
          {user ? (
            <>
              <div>
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    background: "var(--color-primary)",
                    color: "#FFFFFF",
                    padding: "3px 12px",
                    borderRadius: "999px",
                    fontSize: "0.72rem",
                    fontWeight: 700,
                    letterSpacing: "0.06em",
                    marginBottom: "8px",
                    textTransform: "uppercase",
                  }}
                >
                  <span>✓</span> Logged In
                </div>
                <h3 style={{ fontSize: "1.35rem", fontWeight: 700, margin: "0 0 4px 0", color: "var(--color-text-primary)" }}>
                  Welcome back, {user.name || user.email.split("@")[0]}!
                </h3>
                <p style={{ margin: 0, color: "var(--color-text-secondary)", fontSize: "0.925rem" }}>
                  Track your active shipments, manage saved addresses, or explore recommendations tailored for you.
                </p>
              </div>

              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                <Link
                  href="/profile/orders"
                  className="btn btn-primary"
                  style={{ padding: "9px 22px", borderRadius: "var(--radius-full)" }}
                >
                  My Orders →
                </Link>
                <Link
                  href="/profile"
                  className="btn btn-secondary"
                  style={{ padding: "9px 18px", borderRadius: "var(--radius-full)" }}
                >
                  Account Overview
                </Link>
                {(user.role === "ADMIN" || user.role === "SUPER_ADMIN") && (
                  <Link
                    href="/dashboard"
                    className="btn btn-secondary"
                    style={{ padding: "9px 18px", borderRadius: "var(--radius-full)" }}
                  >
                    Admin Dashboard
                  </Link>
                )}
              </div>
            </>
          ) : (
            <>
              <div>
                <h3 style={{ fontSize: "1.35rem", fontWeight: 700, margin: "0 0 4px 0", color: "var(--color-text-primary)" }}>
                  Sign in for your best experience
                </h3>
                <p style={{ margin: 0, color: "var(--color-text-secondary)", fontSize: "0.925rem" }}>
                  Track orders in real time, organize wishlist folders, and enjoy fast Razorpay checkout.
                </p>
              </div>

              <div style={{ display: "flex", gap: "10px" }}>
                <Link
                  href="/login"
                  className="btn btn-primary"
                  style={{ padding: "9px 22px", borderRadius: "var(--radius-full)" }}
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="btn btn-secondary"
                  style={{ padding: "9px 18px", borderRadius: "var(--radius-full)" }}
                >
                  Create Account
                </Link>
              </div>
            </>
          )}
        </section>
      </div>
        </>
      )}
    </div>
  );
}


