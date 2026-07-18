import type { ProductInput } from "@/types/product";
import type { HomeBannerSettings, HomeBannerSlide } from "@/types/site-settings";

export const emptyProduct: ProductInput = {
  name: "",
  slug: "",
  sku: "",
  category: "scanners",
  brand: "",
  fullName: "",
  commercialSummary: "",
  applications: "",
  benefits: [],
  compatibility: "",
  priceOrCondition: "",
  imageAlt: "",
  description: "",
  detail: "",
  price: null,
  oldPrice: null,
  imageUrl: "/assets/catalogo-secoes.jpeg",
  images: ["/assets/catalogo-secoes.jpeg"],
  youtubeUrl: "",
  active: true,
  featured: false,
  mostViewed: false,
  stockStatus: "Disponível sob consulta",
  paymentNote: "Consultar condições",
  paymentInfo: "Consultar condições",
  tags: [],
  useTags: [],
  specs: {}
};

export function createBannerSlide(id: string): HomeBannerSlide {
  return {
    id,
    eyebrow: "Destaque ScannerTec",
    title: "",
    description: "",
    imageUrl: "/assets/marcas-parceiras.jpeg",
    linkedProductSlug: ""
  };
}

export const emptyBannerSettings: HomeBannerSettings = {
  rotationMs: 4000,
  slides: [createBannerSlide("banner-1")]
};

export function parseList(value: string) {
  return value
    .split(/[\n,;]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export function formatList(value?: string[]) {
  return (value || []).join("\n");
}

export function parseSpecs(value: string) {
  if (!value.trim()) return {};

  const parsed = JSON.parse(value) as Record<string, unknown>;
  return Object.fromEntries(
    Object.entries(parsed)
      .map(([key, item]) => [key.trim(), String(item).trim()])
      .filter(([key, item]) => key && item)
  );
}
