import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ProductDetailsPage from "@/components/ProductDetailsPage";
import { formatCategoryLabel } from "@/lib/catalog";
import { getProductDisplayName } from "@/lib/product-content";
import { buildBreadcrumbSchema, buildProductMetadata, buildProductSchema } from "@/lib/seo";
import { getProductBySlug, listProducts } from "@/lib/supabase-products";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    return {
      title: "Produto não encontrado | ScannerTec"
    };
  }

  return buildProductMetadata(product);
}

export default async function ProductPage({
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const products = await listProducts();
  const relatedProducts = products
    .filter((item) => item.id !== product.id && item.category === product.category)
    .slice(0, 3);

  const productSchema = buildProductSchema(product);
  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: "Home", url: "/" },
    { name: formatCategoryLabel(product.category), url: `/categoria/${product.category}` },
    { name: getProductDisplayName(product), url: `/produto/${product.slug}` }
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <ProductDetailsPage product={product} relatedProducts={relatedProducts} />
    </>
  );
}
