import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ProductDetailsPage from "@/components/ProductDetailsPage";
import { productBrand, productionUrl } from "@/lib/catalog";
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

  const image = product.imageUrl.startsWith("http")
    ? product.imageUrl
    : `${productionUrl}${product.imageUrl}`;

  return {
    title: `${product.name} | ScannerTec`,
    description: product.description,
    openGraph: {
      title: `${product.name} | ScannerTec`,
      description: product.description,
      images: [image]
    },
    twitter: {
      card: "summary_large_image",
      title: `${product.name} | ScannerTec`,
      description: product.description,
      images: [image]
    }
  };
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

  const image = product.imageUrl.startsWith("http")
    ? product.imageUrl
    : `${productionUrl}${product.imageUrl}`;
  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    image,
    description: product.description,
    sku: product.sku || product.id,
    brand: {
      "@type": "Brand",
      name: productBrand(product)
    },
    ...(product.price !== null
      ? {
          offers: {
            "@type": "Offer",
            price: product.price,
            priceCurrency: "BRL",
            availability: "https://schema.org/InStock",
            url: `${productionUrl}/produto/${product.slug}`
          }
        }
      : {})
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />
      <ProductDetailsPage product={product} relatedProducts={relatedProducts} />
    </>
  );
}
