import Storefront from "@/components/Storefront";
import { buildHomeMetadata, buildWebsiteSchema } from "@/lib/seo";
import { getHomeBannerSettings } from "@/lib/site-settings";
import { listProducts } from "@/lib/supabase-products";

export const dynamic = "force-dynamic";
export const metadata = buildHomeMetadata();

export default async function Home() {
  const products = await listProducts();
  const bannerSettings = await getHomeBannerSettings();
  const websiteSchema = buildWebsiteSchema();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
      <Storefront initialProducts={products} initialBannerSettings={bannerSettings} />
    </>
  );
}
