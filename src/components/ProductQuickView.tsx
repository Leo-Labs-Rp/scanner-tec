"use client";

import Image from "next/image";
import { CloseIcon } from "@/components/SiteIcons";
import {
  formatCategoryLabel,
  formatTagLabel,
  primaryProductActionLabel,
  productBrand,
  productTags
} from "@/lib/catalog";
import { formatCurrency } from "@/lib/format";
import { shouldUseUnoptimizedImage } from "@/lib/image";
import type { Product } from "@/types/product";

type Props = {
  onClose: () => void;
  onPrimaryAction: (product: Product) => void;
  product: Product | null;
};

export default function ProductQuickView({
  onClose,
  onPrimaryAction,
  product
}: Props) {
  if (!product) return null;
  const unoptimizedImage = shouldUseUnoptimizedImage(product.imageUrl);

  return (
    <div className="product-modal" role="dialog" aria-modal="true" aria-label={product.name}>
      <div className="product-modal-backdrop" onClick={onClose}></div>
      <article className="product-detail">
        <button className="modal-close" type="button" onClick={onClose} aria-label="Fechar detalhes">
          <CloseIcon />
        </button>
        <div className="detail-image">
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 100vw, 420px"
            style={{ objectFit: "contain" }}
            unoptimized={unoptimizedImage}
          />
        </div>
        <div className="detail-copy">
          <span className="product-category">{formatCategoryLabel(product.category)}</span>
          <h2>{product.name}</h2>
          <p>{product.detail || product.description}</p>
          <div className="detail-specs">
            <span>
              <strong>Marca/Linha</strong>
              {productBrand(product)}
            </span>
            <span>
              <strong>Condição</strong>
              {product.paymentNote || product.stockStatus}
            </span>
            <span>
              <strong>Preço</strong>
              {formatCurrency(product.price)}
            </span>
          </div>
          <div className="tag-list detail-tags">
            {productTags(product).map((tag) => (
              <span key={tag}>{formatTagLabel(tag)}</span>
            ))}
          </div>
          <div className="detail-actions">
            <button className="btn btn-primary btn-product-cta" type="button" onClick={() => onPrimaryAction(product)}>
              {primaryProductActionLabel(product)}
            </button>
            <button
              className="btn btn-secondary"
              type="button"
              onClick={onClose}
            >
              Continuar escolhendo
            </button>
          </div>
        </div>
      </article>
    </div>
  );
}
