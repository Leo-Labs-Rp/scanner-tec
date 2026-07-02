import type { Metadata } from "next";
import CatalogExplorer from "@/components/CatalogExplorer";
import { formatCategoryLabel, normalizeProductCategory, productCategories } from "@/lib/catalog";
import { listProducts } from "@/lib/supabase-products";
import type { ProductCategory } from "@/types/product";

const allowedCategories = productCategories.map((category) => category.value);

function parseCategory(category: string): ProductCategory {
  const normalized = normalizeProductCategory(category, "scanners");
  return allowedCategories.includes(normalized) ? normalized : "scanners";
}

export async function generateMetadata({
  params
}: {
  params: Promise<{ category: string }>;
}): Promise<Metadata> {
  const { category } = await params;
  const parsedCategory = parseCategory(category);
  const label = formatCategoryLabel(parsedCategory);

  return {
    title: `${label} | ScannerTec`,
    description: `Catálogo ScannerTec de ${label.toLowerCase()} para oficinas, reparadores e auto centers, com orçamento pelo WhatsApp.`
  };
}

export default async function CategoryPage({
  params,
  searchParams
}: {
  params: Promise<{ category: string }>;
  searchParams: Promise<{ uso?: string }>;
}) {
  const { category } = await params;
  const query = await searchParams;
  const parsedCategory = parseCategory(category);
  const products = await listProducts();

  return <CatalogExplorer products={products} initialCategory={parsedCategory} initialUse={query.uso || "todos"} />;
}
