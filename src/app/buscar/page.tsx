import type { Metadata } from "next";
import CatalogExplorer from "@/components/CatalogExplorer";
import { listProducts } from "@/lib/supabase-products";

export const metadata: Metadata = {
  title: "Catálogo ScannerTec | Scanners, Máquinas, Manômetros e Equipamentos",
  description:
    "Busque scanners automotivos, máquinas, manômetros e equipamentos para oficina com orçamento direto pelo WhatsApp da ScannerTec."
};

export default async function SearchPage({
  searchParams
}: {
  searchParams: Promise<{ q?: string; uso?: string }>;
}) {
  const params = await searchParams;
  const products = await listProducts();

  return <CatalogExplorer products={products} initialQuery={params.q || ""} initialUse={params.uso || "todos"} />;
}
