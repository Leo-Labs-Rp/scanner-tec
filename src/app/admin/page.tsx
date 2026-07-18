import AdminProducts from "@/components/AdminProducts";
import { hasAdminSession } from "@/lib/auth";
import { getHomeBannerSettings } from "@/lib/site-settings";
import { getStorageAdminStatus } from "@/lib/supabase-storage";
import { hasDatabase, listProducts } from "@/lib/supabase-products";
import { redirect } from "next/navigation";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Admin | ScannerTec",
  robots: {
    index: false,
    follow: false
  }
};

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
