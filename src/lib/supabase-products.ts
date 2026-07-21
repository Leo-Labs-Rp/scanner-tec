import { normalizeProductAssetList, normalizeProductAssetUrl } from "@/lib/assets";
import { normalizeProductCategory, sanitizeCopy, sanitizeProductCopy } from "@/lib/catalog";
import { slugify } from "@/lib/format";
import { seedProducts } from "@/lib/seed-products";
import type { Product, ProductCategory, ProductInput } from "@/types/product";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const tableName = "products";

const canonicalProductSlugs: Record<string, string> = {
  "atualizacao-carga-brasil": "recalibracao-carga-brasil",
  "atualizacao-ds808-mp208-1-ano": "recalibracao-tecnica-ds808-mp208",
  "diagrama-eletrico": "consulta-tecnica-circuitos-eletricos-ecu"
};

const legacyProductSlugs = Object.fromEntries(
  Object.entries(canonicalProductSlugs).map(([legacySlug, canonicalSlug]) => [canonicalSlug, legacySlug])
);

type DbProduct = {
  id: string;
  name: string;
  slug: string;
  sku?: string | null;
  category: string;
  brand?: string | null;
  full_name?: string | null;
  commercial_summary?: string | null;
  applications?: string | null;
  benefits?: string[] | null;
  compatibility?: string | null;
  price_or_condition?: string | null;
  image_alt?: string | null;
  description: string;
  detail?: string | null;
  price: number | null;
  old_price: number | null;
  image_url: string;
  images?: string[] | null;
  youtube_url?: string | null;
  active: boolean;
  featured: boolean;
  most_viewed?: boolean | null;
  stock_status: string;
  payment_note?: string | null;
  payment_info?: string | null;
  tags?: string[] | null;
  use_tags?: string[] | null;
  use?: string[] | null;
  specs?: Record<string, string> | null;
};

function isSupabaseConfigured() {
  return Boolean(supabaseUrl && supabaseServiceRoleKey);
}

function normalizeProduct(product: Product): Product {
  const imageUrl = normalizeProductAssetUrl(product.imageUrl);

  return sanitizeProductCopy({
    ...product,
    imageUrl,
    images: normalizeProductAssetList(product.images?.length ? product.images : [imageUrl], imageUrl),
    mostViewed: product.mostViewed ?? product.featured,
    paymentInfo: product.paymentInfo || product.paymentNote || product.stockStatus,
    useTags: product.useTags || product.tags || inferTags(product.name, product.description),
    specs: product.specs || {},
    fullName: product.fullName || product.name,
    commercialSummary: product.commercialSummary || product.description,
    applications: product.applications || product.detail || product.description,
    benefits: product.benefits || [],
    compatibility: product.compatibility || "",
    priceOrCondition: product.priceOrCondition || product.paymentInfo || product.paymentNote || product.stockStatus,
    imageAlt: product.imageAlt || ""
  });
}

function fallbackProducts(includeInactive = false) {
  const products = dedupeProducts(seedProducts.map(normalizeProduct));
  return includeInactive ? products : products.filter((product) => product.active);
}

function dedupeProducts(products: Product[]) {
  const merged = new Map<string, Product>();

  products.forEach((product) => {
    for (const [slug, existing] of merged) {
      if (slug === product.slug || existing.id === product.id) {
        merged.delete(slug);
      }
    }

    merged.set(product.slug, product);
  });

  return Array.from(merged.values());
}

function dbProducts(rows: DbProduct[], includeInactive = false) {
  const products = dedupeProducts(rows.map(toProduct)).sort((left, right) => {
    if (left.featured !== right.featured) return left.featured ? -1 : 1;
    return left.name.localeCompare(right.name, "pt-BR");
  });

  return includeInactive ? products : products.filter((product) => product.active);
}

function toProduct(row: DbProduct): Product {
  const rawSlug = slugify(sanitizeCopy(row.slug || row.name));
  const normalizedSlug = canonicalProductSlugs[rawSlug] || rawSlug;
  const imageUrl = normalizeProductAssetUrl(row.image_url);
  const category = inferCategory(row.category, `${row.name} ${row.description} ${normalizedSlug}`, [
    ...(row.tags || []),
    ...(row.use_tags || []),
    ...(row.use || [])
  ]);

  return normalizeProduct({
    id: row.id,
    name: row.name,
    slug: normalizedSlug || row.id,
    sku: row.sku || undefined,
    category,
    brand: row.brand || inferBrand(row.name),
    fullName: row.full_name || row.name,
    commercialSummary: row.commercial_summary || row.description,
    applications: row.applications || row.detail || row.description,
    benefits: row.benefits || [],
    compatibility: row.compatibility || undefined,
    priceOrCondition: row.price_or_condition || row.payment_info || row.payment_note || row.stock_status,
    imageAlt: row.image_alt || undefined,
    description: row.description,
    detail: row.detail || row.description,
    price: row.price,
    oldPrice: row.old_price,
    imageUrl,
    images: normalizeProductAssetList(row.images?.length ? row.images : [imageUrl], imageUrl),
    youtubeUrl: row.youtube_url || undefined,
    active: row.active,
    featured: row.featured,
    mostViewed: Boolean(row.most_viewed),
    stockStatus: row.stock_status,
    paymentNote: row.payment_note || row.stock_status,
    paymentInfo: row.payment_info || row.payment_note || row.stock_status,
    tags: row.tags || inferTags(row.name, row.description),
    useTags: row.use_tags || row.use || row.tags || inferTags(row.name, row.description),
    specs: row.specs || {}
  });
}

function toDbProduct(input: ProductInput): DbProduct {
  const slug = slugify(sanitizeCopy(input.slug || input.name));
  const inferredTags = input.tags || inferTags(input.name, input.description);
  const imageUrl = normalizeProductAssetUrl(input.imageUrl);
  const category = inferCategory(input.category, `${input.name} ${input.description} ${slug}`, [
    ...(input.tags || []),
    ...(input.useTags || [])
  ]);

  return {
    id: input.id || slug,
    name: input.name,
    slug,
    sku: input.sku || undefined,
    category,
    brand: input.brand || inferBrand(input.name),
    full_name: input.fullName || input.name,
    commercial_summary: input.commercialSummary || input.description,
    applications: input.applications || input.detail || input.description,
    benefits: input.benefits || [],
    compatibility: input.compatibility || null,
    price_or_condition: input.priceOrCondition || input.paymentInfo || input.paymentNote || input.stockStatus,
    image_alt: input.imageAlt || null,
    description: input.description,
    detail: input.detail || input.description,
    price: input.price,
    old_price: input.oldPrice,
    image_url: imageUrl,
    images: normalizeProductAssetList(input.images || [imageUrl], imageUrl),
    youtube_url: input.youtubeUrl || null,
    active: input.active,
    featured: input.featured,
    most_viewed: Boolean(input.mostViewed),
    stock_status: input.stockStatus,
    payment_note: input.paymentNote || input.stockStatus,
    payment_info: input.paymentInfo || input.paymentNote || input.stockStatus,
    tags: inferredTags,
    use_tags: input.useTags || inferredTags,
    specs: input.specs || {}
  };
}

function inferBrand(name: string) {
  const brands = ["Autel", "Raven", "Launch", "Planatc", "Injetec", "Potente Brasil", "Chiptronic", "Multimec", "Laserteck"];
  return brands.find((brand) => name.toLowerCase().includes(brand.toLowerCase())) || "ScannerTec";
}

function normalizeSearchText(value: string) {
  return sanitizeCopy(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function inferCategory(category: string | null | undefined, text: string, tags: string[] = []): ProductCategory {
  const normalizedCategory = normalizeProductCategory(category);
  if (normalizedCategory !== "equipamentos") return normalizedCategory;

  const source = normalizeSearchText(`${text} ${tags.join(" ")}`);

  if (source.includes("recalibracao")) {
    return "scanners";
  }

  if (
    source.includes("manometro") ||
    source.includes("compressao") ||
    source.includes("pressao") ||
    source.includes("bomba de combustivel") ||
    source.includes("arrefecimento") ||
    source.includes("cilindro")
  ) {
    return "manometros";
  }

  if (
    source.includes("maquina") ||
    source.includes("bico") ||
    source.includes("injetor") ||
    source.includes("oleo") ||
    source.includes("cambio") ||
    source.includes("fluido") ||
    source.includes("descarbonizacao") ||
    source.includes("fumaca") ||
    source.includes("limpeza")
  ) {
    return "maquinas";
  }

  return normalizedCategory;
}

function inferTags(name: string, description: string) {
  const source = `${name} ${description}`
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
  const tags = new Set<string>();
  if (source.includes("scanner") || source.includes("diagnostico")) tags.add("diagnostico");
  if (source.includes("recalibracao")) tags.add("recalibracao");
  if (source.includes("bateria") || source.includes("eletric")) tags.add("bateria");
  if (source.includes("freio")) tags.add("freios");
  if (source.includes("mola") || source.includes("suspens")) tags.add("suspensao");
  if (source.includes("elevador") || source.includes("rampa")) tags.add("elevadores");
  if (source.includes("pneu") || source.includes("balanceadora") || source.includes("alinhador")) tags.add("auto center");
  if (source.includes("moto")) tags.add("motos");
  if (source.includes("chave")) tags.add("chaves");
  if (source.includes("motor")) tags.add("motor");
  return Array.from(tags);
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
      Prefer: "return=representation",
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

export async function listProducts(includeInactive = false): Promise<Product[]> {
  if (!isSupabaseConfigured()) {
    return fallbackProducts(includeInactive);
  }

  try {
    const activeFilter = includeInactive ? "" : "&active=eq.true";
    const response = await supabaseFetch(
      `${tableName}?select=*&order=featured.desc,name.asc${activeFilter}`
    );
    const rows = (await response.json()) as DbProduct[];

    if (!rows.length) {
      return fallbackProducts(includeInactive);
    }

    return dbProducts(rows, includeInactive);
  } catch {
    return fallbackProducts(includeInactive);
  }
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const normalizedSlug = slugify(sanitizeCopy(decodeURIComponent(slug)));
  const canonicalSlug = canonicalProductSlugs[normalizedSlug] || normalizedSlug;
  const legacySlug = legacyProductSlugs[canonicalSlug] || canonicalSlug;

  if (!isSupabaseConfigured()) {
    return (
      fallbackProducts().find(
        (product) =>
          product.slug === canonicalSlug ||
          product.id === canonicalSlug ||
          product.slug === legacySlug ||
          product.id === legacySlug
      ) || null
    );
  }

  try {
    const response = await supabaseFetch(
      `${tableName}?select=*&or=(slug.eq.${encodeURIComponent(canonicalSlug)},slug.eq.${encodeURIComponent(legacySlug)},id.eq.${encodeURIComponent(canonicalSlug)},id.eq.${encodeURIComponent(legacySlug)})&active=eq.true&limit=1`
    );
    const rows = (await response.json()) as DbProduct[];

    if (rows.length) {
      return toProduct(rows[0]);
    }

    return null;
  } catch {
    return (
      fallbackProducts(true).find(
        (product) =>
          product.slug === canonicalSlug ||
          product.id === canonicalSlug ||
          product.slug === legacySlug ||
          product.id === legacySlug
      ) || null
    );
  }
}

export async function createProduct(input: ProductInput): Promise<Product> {
  const product = toDbProduct(input);
  const response = await supabaseFetch(tableName, {
    method: "POST",
    body: JSON.stringify(product)
  });
  const [created] = (await response.json()) as DbProduct[];

  return toProduct(created);
}

export async function updateProduct(id: string, input: ProductInput): Promise<Product> {
  const product = toDbProduct({ ...input, id });
  const response = await supabaseFetch(`${tableName}?id=eq.${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: JSON.stringify(product)
  });
  const rows = (await response.json()) as DbProduct[];
  const [updated] = rows;

  if (!updated) {
    const upsertResponse = await supabaseFetch(tableName, {
      method: "POST",
      body: JSON.stringify(product)
    });
    const [created] = (await upsertResponse.json()) as DbProduct[];

    if (!created) {
      throw new Error("O produto não foi encontrado para alteração e não pôde ser criado no Supabase.");
    }

    return toProduct(created);
  }

  return toProduct(updated);
}

export async function deleteProduct(id: string): Promise<void> {
  await supabaseFetch(`${tableName}?id=eq.${encodeURIComponent(id)}`, {
    method: "DELETE"
  });
}

export function hasDatabase() {
  return isSupabaseConfigured();
}
