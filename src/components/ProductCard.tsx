"use client";

import Link from "next/link";
import {
  discountPercent,
  formatCategoryLabel,
  formatPaymentInfo,
  productBrand,
  primaryProductActionLabel
} from "@/lib/catalog";
import { formatCurrency } from "@/lib/format";
import type { Product } from "@/types/product";

type Props = {
  compact?: boolean;
  onPrimaryAction: (product: Product) => void;
  product: Product;
  showDescription?: boolean;
  showTags?: boolean;
};

export default function ProductCard({
  compact = false,
  onPrimaryAction,
  product,
  showDescription = false
}: Props) {
  const discount = discountPercent(product);

  return (
    <article className={`product-card ${compact ? "compact" : ""}`}>
      <Link className="product-image" href={`/produto/${product.slug}`}>
        {discount ? <span className="discount-badge">{discount}% OFF</span> : null}
        <img src={product.imageUrl} alt={product.name} loading="lazy" />
      </Link>
      <div className="product-body">
        <div className="product-meta-line">
          <span className="product-category">{formatCategoryLabel(product.category)}</span>
          <span>{productBrand(product)}</span>
        </div>
        <h3>{product.name}</h3>
        {showDescription ? <p>{product.description}</p> : null}
        <div className="price-row">
          <strong>{formatCurrency(product.price)}</strong>
          {product.oldPrice && product.price !== null && product.oldPrice > product.price ? (
            <del>{formatCurrency(product.oldPrice)}</del>
          ) : null}
        </div>
        <span className="installment-note">{formatPaymentInfo(product)}</span>
        <span className="stock">{product.stockStatus}</span>
        <div className="card-actions">
          <Link className="btn btn-secondary" href={`/produto/${product.slug}`}>
            Ver produto
          </Link>
          <button className="btn btn-primary btn-product-cta" type="button" onClick={() => onPrimaryAction(product)}>
            {primaryProductActionLabel(product)}
          </button>
        </div>
      </div>
    </article>
  );
}
