import { formatCategoryLabel, formatPaymentInfo, productBrand, sanitizeCopy } from "@/lib/catalog";
import type { Product } from "@/types/product";

export type ProductAuditRow = {
  id: string;
  slug: string;
  name: string;
  category: string;
  brand: string;
  description: string;
  duplicatedDescription: boolean;
  draft: {
    status: "rascunho - revisar";
    full_name: string;
    commercial_summary: string;
    applications: string;
    benefits: string[];
    compatibility: string;
    brand: string;
    price_or_condition: string;
    video_url: string;
  };
};

export function normalizeComparableCopy(value?: string | null) {
  return sanitizeCopy(value || "")
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ");
}

export function isDescriptionDuplicated(name?: string | null, description?: string | null) {
  const normalizedName = normalizeComparableCopy(name);
  const normalizedDescription = normalizeComparableCopy(description);

  if (!normalizedName || !normalizedDescription) return false;
  return normalizedName === normalizedDescription;
}

export function getProductDisplayName(product: Product) {
  return sanitizeCopy(product.fullName || product.name);
}

export function getProductCommercialSummary(product: Product) {
  return sanitizeCopy(product.commercialSummary || product.description);
}

export function getProductApplications(product: Product) {
  return sanitizeCopy(product.applications || product.detail || product.description);
}

export function getProductBenefits(product: Product) {
  const benefits = (product.benefits || []).map((item) => sanitizeCopy(item)).filter(Boolean);
  if (benefits.length) return benefits;

  return [
    `Categoria: ${formatCategoryLabel(product.category)}`,
    `Marca ou linha: ${productBrand(product)}`,
    `Condição comercial: ${getProductPriceOrCondition(product)}`
  ];
}

export function getProductCompatibility(product: Product) {
  return sanitizeCopy(
    product.compatibility || product.tags?.map(sanitizeCopy).join(", ") || "Confirmar aplicação com a equipe ScannerTec."
  );
}

export function getProductPriceOrCondition(product: Product) {
  return sanitizeCopy(product.priceOrCondition || formatPaymentInfo(product));
}

export function getProductImageAlt(product: Product) {
  return sanitizeCopy(
    product.imageAlt || `${getProductDisplayName(product)} - ${formatCategoryLabel(product.category)} - ScannerTec`
  );
}

export function buildProductAuditRow(product: Product): ProductAuditRow {
  return {
    id: product.id,
    slug: product.slug,
    name: sanitizeCopy(product.name),
    category: formatCategoryLabel(product.category),
    brand: productBrand(product),
    description: sanitizeCopy(product.description),
    duplicatedDescription: isDescriptionDuplicated(product.name, product.description),
    draft: {
      status: "rascunho - revisar",
      full_name: sanitizeCopy(product.fullName || product.name),
      commercial_summary: sanitizeCopy(product.commercialSummary || ""),
      applications: sanitizeCopy(product.applications || ""),
      benefits: (product.benefits || []).map((item) => sanitizeCopy(item)),
      compatibility: sanitizeCopy(product.compatibility || ""),
      brand: productBrand(product),
      price_or_condition: sanitizeCopy(product.priceOrCondition || formatPaymentInfo(product)),
      video_url: sanitizeCopy(product.youtubeUrl || "")
    }
  };
}
