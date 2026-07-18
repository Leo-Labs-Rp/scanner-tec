import type { MetadataRoute } from "next";
import { productCategories } from "@/lib/catalog";
import { absoluteUrl } from "@/lib/seo";
import { listProducts } from "@/lib/supabase-products";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const products = await listProducts();
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: absoluteUrl("/"),
      lastModified: now,
      changeFrequency: "daily",
      priority: 1
    },
    {
      url: absoluteUrl("/sobre"),
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7
    }
  ];

  const categoryRoutes: MetadataRoute.Sitemap = productCategories.map((category) => ({
    url: absoluteUrl(category.href),
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.8
  }));

  const productRoutes: MetadataRoute.Sitemap = products.map((product) => ({
    url: absoluteUrl(`/produto/${product.slug}`),
    lastModified: now,
    changeFrequency: "weekly",
    priority: product.featured ? 0.9 : 0.7
  }));

  return [...staticRoutes, ...categoryRoutes, ...productRoutes];
}
