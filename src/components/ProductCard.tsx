"use client";

import Link from "next/link";
import Image from "next/image";
import {
  discountPercent,
  formatCategoryLabel,
  productBrand,
  primaryProductActionLabel
} from "@/lib/catalog";
import { formatCurrency } from "@/lib/format";
import { optimizeSupabaseImageUrl, shouldUseUnoptimizedImage } from "@/lib/image";
import {
  getProductCommercialSummary,
  getProductDisplayName,
  getProductImageAlt,
  getProductPriceOrCondition
} from "@/lib/product-content";
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
  const productName = getProductDisplayName(product);
  const imageUrl = optimizeSupabaseImageUrl(product.imageUrl);
  const unoptimizedImage = shouldUseUnoptimizedImage(imageUrl);
  const cardClassName = [
    "product-card",
    compact ? "compact" : "",
    showDescription ? "has-description" : "no-description"
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <article className={cardClassName}>
      <Link className="product-image" href={`/produto/${product.slug}`}>
        {discount ? <span className="discount-badge">{discount}% OFF</span> : null}
        <Image
          src={imageUrl}
          alt={getProductImageAlt(product)}
          fill
          sizes={compact ? "(max-width: 768px) 70vw, 220px" : "(max-width: 768px) 90vw, 280px"}
          style={{ objectFit: "contain" }}
          unoptimized={unoptimizedImage}
        />
      </Link>
      <div className="product-body">
        <div className="product-meta-line">
          <span className="product-category">{formatCategoryLabel(product.category)}</span>
          <span className="product-brand-badge">{productBrand(product)}</span>
        </div>
        <h3 className="product-title">{productName}</h3>
        {showDescription ? <p className="product-summary">{getProductCommercialSummary(product)}</p> : null}
        <div className="price-row">
          <strong>{formatCurrency(product.price)}</strong>
          {product.oldPrice && product.price !== null && product.oldPrice > product.price ? (
            <del>{formatCurrency(product.oldPrice)}</del>
          ) : null}
        </div>
        <span className="installment-note">{getProductPriceOrCondition(product)}</span>
        <span className="stock product-stock-note">{product.stockStatus}</span>
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
