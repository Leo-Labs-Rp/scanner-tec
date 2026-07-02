import Storefront from "@/components/Storefront";
import { getHomeBannerSettings } from "@/lib/site-settings";
import { listProducts } from "@/lib/supabase-products";

export const dynamic = "force-dynamic";

export default async function Home() {
  const products = await listProducts();
  const bannerSettings = await getHomeBannerSettings();

  return <Storefront initialProducts={products} initialBannerSettings={bannerSettings} />;
}
