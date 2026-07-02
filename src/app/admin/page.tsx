import AdminProducts from "@/components/AdminProducts";
import { hasAdminSession } from "@/lib/auth";
import { getHomeBannerSettings } from "@/lib/site-settings";
import { getStorageAdminStatus } from "@/lib/supabase-storage";
import { hasDatabase, listProducts } from "@/lib/supabase-products";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  if (!(await hasAdminSession())) {
    redirect("/admin/login?next=/admin");
  }

  const products = await listProducts(true);
  const bannerSettings = await getHomeBannerSettings();
  const storageStatus = await getStorageAdminStatus();

  return (
    <AdminProducts
      initialProducts={products}
      initialBannerSettings={bannerSettings}
      initialDatabaseConfigured={hasDatabase()}
      initialStorageStatus={storageStatus}
    />
  );
}
