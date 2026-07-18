import type { Metadata } from "next";
import CatalogExplorer from "@/components/CatalogExplorer";
import { inferCategoryFromUse, quickUseLinks } from "@/lib/catalog";
import { absoluteUrl } from "@/lib/seo";
import { listProducts } from "@/lib/supabase-products";

export async function generateMetadata({
  searchParams
}: {
  searchParams: Promise<{ q?: string; uso?: string }>;
}): Promise<Metadata> {
  const params = await searchParams;
  const query = params.q?.trim();
  const use = params.uso?.trim();
  const useLabel = use ? quickUseLinks.find((item) => item.use === use)?.label || use : "";

  const title = query
    ? `Buscar ${query} | ScannerTec`
    : useLabel
      ? `${useLabel} | Catálogo ScannerTec`
      : "Catálogo ScannerTec | Scanners, máquinas, manômetros e equipamentos";

  const description = query
    ? `Resultados para ${query} no catálogo ScannerTec, com atendimento consultivo e contato comercial rápido.`
    : useLabel
      ? `Explore a linha de ${useLabel.toLowerCase()} da ScannerTec com filtros comerciais e atendimento consultivo.`
      : "Busque scanners automotivos, máquinas, manômetros e equipamentos para oficina com atendimento direto da ScannerTec.";

  const canonical = query
    ? `/buscar?q=${encodeURIComponent(query)}`
    : use
      ? `/buscar?uso=${encodeURIComponent(use)}`
      : "/buscar";

  return {
    title,
    description,
    alternates: {
      canonical: absoluteUrl(canonical)
    },
    robots: {
      index: false,
      follow: true,
      googleBot: {
        index: false,
        follow: true
      }
    },
    openGraph: {
      title,
      description,
      url: absoluteUrl(canonical),
      siteName: "ScannerTec",
      locale: "pt_BR"
    }
  };
}

export default async function SearchPage({
  searchParams
}: {
  searchParams: Promise<{ q?: string; uso?: string }>;
}) {
  const params = await searchParams;
  const products = await listProducts();
  const initialUse = params.uso || "todos";
  const initialCategory = inferCategoryFromUse(initialUse) || "todos";

  return (
    <CatalogExplorer
      products={products}
      initialCategory={initialCategory}
      initialQuery={params.q || ""}
      initialUse={initialUse}
    />
  );
}
