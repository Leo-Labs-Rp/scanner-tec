import type { HomeBannerSettings, HomeBannerSlide } from "@/types/site-settings";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const tableName = "site_settings";
const bannerKey = "home_banner";

const defaultSlides: HomeBannerSlide[] = [
  {
    id: "banner-1",
    eyebrow: "Destaque ScannerTec",
    title: "Scanners e equipamentos para elevar a performance da oficina.",
    description:
      "Configure a vitrine principal com imagem, texto e produto vinculado para destacar o melhor momento comercial da loja.",
    imageUrl: "/assets/marcas-parceiras.jpeg",
    linkedProductSlug: "scanner-multimec-x3"
  },
  {
    id: "banner-2",
    eyebrow: "Linha profissional",
    title: "Escolha scanners, máquinas, manômetros e equipamentos com atendimento consultivo.",
    description:
      "Monte uma vitrine rotativa com os itens mais fortes da ScannerTec e direcione o cliente para o produto certo.",
    imageUrl: "/assets/catalogo-secoes.jpeg",
    linkedProductSlug: "autel-mx900"
  }
];

export const defaultHomeBannerSettings: HomeBannerSettings = {
  rotationMs: 4000,
  slides: defaultSlides
};

type LegacyBannerSettings = {
  eyebrow?: string;
  title?: string;
  description?: string;
  imageUrl?: string;
  linkedProductSlug?: string;
};

type DbSiteSettings = {
  key: string;
  value: HomeBannerSettings | LegacyBannerSettings;
};

function isSupabaseConfigured() {
  return Boolean(supabaseUrl && supabaseServiceRoleKey);
}

async function supabaseFetch(path: string, init?: RequestInit) {
  if (!isSupabaseConfigured()) {
    throw new Error("Supabase não configurado");
  }

  const response = await fetch(`${supabaseUrl}/rest/v1/${path}`, {
    ...init,
    headers: {
      apikey: supabaseServiceRoleKey || "",
      Authorization: `Bearer ${supabaseServiceRoleKey}`,
      "Content-Type": "application/json; charset=utf-8",
      Accept: "application/json; charset=utf-8",
      Prefer: "return=representation,resolution=merge-duplicates",
      ...init?.headers
    },
    cache: "no-store"
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || "Erro ao acessar Supabase");
  }

  return response;
}

function normalizeSlide(slide: Partial<HomeBannerSlide> | undefined, index: number): HomeBannerSlide {
  const fallback = defaultSlides[index] || defaultSlides[0];
  const hasLinkedProductSlug = typeof slide?.linkedProductSlug === "string";

  return {
    id: slide?.id?.trim() || `banner-${index + 1}`,
    eyebrow: slide?.eyebrow?.trim() || fallback.eyebrow,
    title: slide?.title?.trim() || fallback.title,
    description: slide?.description?.trim() || fallback.description,
    imageUrl: slide?.imageUrl?.trim() || fallback.imageUrl,
    linkedProductSlug: hasLinkedProductSlug ? slide?.linkedProductSlug?.trim() || "" : fallback.linkedProductSlug
  };
}

function normalizeBannerSettings(
  value?: Partial<HomeBannerSettings> | LegacyBannerSettings | null
): HomeBannerSettings {
  if (value && "slides" in value && Array.isArray(value.slides)) {
    return {
      rotationMs:
        typeof value.rotationMs === "number" && value.rotationMs >= 1000 ? value.rotationMs : 4000,
      slides: value.slides.length
        ? value.slides.map((slide, index) => normalizeSlide(slide, index))
        : defaultSlides
    };
  }

  if (value) {
    return {
      rotationMs: 4000,
      slides: [normalizeSlide(value as LegacyBannerSettings, 0)]
    };
  }

  return defaultHomeBannerSettings;
}

export async function getHomeBannerSettings(): Promise<HomeBannerSettings> {
  if (!isSupabaseConfigured()) {
    return defaultHomeBannerSettings;
  }

  try {
    const response = await supabaseFetch(
      `${tableName}?select=key,value&key=eq.${encodeURIComponent(bannerKey)}&limit=1`
    );
    const rows = (await response.json()) as DbSiteSettings[];
    return normalizeBannerSettings(rows[0]?.value);
  } catch {
    return defaultHomeBannerSettings;
  }
}

export async function updateHomeBannerSettings(input: HomeBannerSettings): Promise<HomeBannerSettings> {
  const value = normalizeBannerSettings(input);
  const response = await supabaseFetch(tableName, {
    method: "POST",
    body: JSON.stringify([{ key: bannerKey, value }])
  });
  const rows = (await response.json()) as DbSiteSettings[];
  return normalizeBannerSettings(rows[0]?.value || value);
}
