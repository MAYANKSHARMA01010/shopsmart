import type { Product } from "../schemas/productSchema";

interface ProductCardProps {
  product: Product;
  onDelete: (id: number) => void;
  deleting: boolean;
}

function getStockClass(stock: number): string {
  if (stock === 0) return "out-stock";
  if (stock < 5) return "low-stock";
  return "in-stock";
}

function getStockLabel(stock: number): string {
  if (stock === 0) return "Out of stock";
  if (stock < 5) return `Low stock — ${stock} left`;
  return `${stock} in stock`;
}

function getCategoryEmoji(category: string | null | undefined): string {
  const map: Record<string, string> = {
    electronics: "💻",
    clothing:    "👕",
    food:        "🍕",
    books:       "📚",
    sports:      "⚽",
    toys:        "🧸",
    beauty:      "💄",
    home:        "🏠",
    tools:       "🔧",
  };
  return category ? (map[category.toLowerCase()] ?? "📦") : "📦";
}

export function ProductCard({ product, onDelete, deleting }: ProductCardProps) {
  return (
    <article className="product-card">
      {/* Image / placeholder */}
      <div className="product-image" aria-hidden={!product.imageUrl}>
        {product.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.imageUrl}
            alt={product.name}
          />
        ) : (
          <span role="img" aria-label={product.category ?? "product"}>
            {getCategoryEmoji(product.category)}
          </span>
        )}
      </div>

      {/* Body */}
      <div className="product-body">
        {product.category && (
          <span className="product-category">{product.category}</span>
        )}
        <h2 className="product-name">{product.name}</h2>
        {product.description && (
          <p className="product-desc">{product.description}</p>
        )}

        {/* Footer: price + stock */}
        <div className="product-footer">
          <span className="product-price" aria-label={`Price: $${product.price.toFixed(2)}`}>
            ${product.price.toFixed(2)}
          </span>
          <span
            className={`product-stock ${getStockClass(product.stock)}`}
            aria-label={getStockLabel(product.stock)}
          >
            {getStockLabel(product.stock)}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="product-actions">
        <button
          className="btn btn-danger btn-sm"
          onClick={() => onDelete(product.id)}
          disabled={deleting}
          aria-label={`Delete ${product.name}`}
        >
          {deleting ? "Deleting…" : "Delete"}
        </button>
      </div>
    </article>
  );
}
