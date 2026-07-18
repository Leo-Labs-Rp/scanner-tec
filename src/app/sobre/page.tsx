import AboutPage from "@/components/AboutPage";
import { buildAboutMetadata } from "@/lib/seo";
import { listProducts } from "@/lib/supabase-products";

export const metadata = buildAboutMetadata();

export default async function AboutRoutePage() {
  const products = await listProducts();
  return <AboutPage products={products} />;
}
