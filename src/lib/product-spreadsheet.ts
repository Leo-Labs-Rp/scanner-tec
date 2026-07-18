import ExcelJS from "exceljs";
import { normalizeProductAssetUrl } from "@/lib/assets";
import { formatCategoryLabel, normalizeProductCategory, sanitizeCopy } from "@/lib/catalog";
import { slugify } from "@/lib/format";
import type { Product, ProductCategory, ProductInput } from "@/types/product";

type SpreadsheetField =
  | "id"
  | "slug"
  | "name"
  | "fullName"
  | "commercialSummary"
  | "applications"
  | "benefits"
  | "compatibility"
  | "priceOrCondition"
  | "imageAlt"
  | "description"
  | "detail"
  | "price"
  | "oldPrice"
  | "youtubeUrl"
  | "category"
  | "brand"
  | "paymentInfo"
  | "stockStatus"
  | "active"
  | "featured"
  | "imageUrl"
  | "images"
  | "tags"
  | "useTags"
  | "specs";

export type ParsedProductSpreadsheetRow = {
  rowNumber: number;
  raw: Record<string, unknown>;
  fields: Partial<Record<SpreadsheetField, unknown>>;
};

export type ProductSpreadsheetImportResult = {
  created: number;
  updated: number;
  skipped: number;
  errors: string[];
};

const productColumns: Array<{ header: string; field: SpreadsheetField; width: number }> = [
  { header: "id_nao_alterar", field: "id", width: 30 },
  { header: "slug_nao_alterar", field: "slug", width: 30 },
  { header: "nome", field: "name", width: 38 },
  { header: "nome_completo", field: "fullName", width: 42 },
  { header: "resumo_comercial", field: "commercialSummary", width: 52 },
  { header: "aplicacoes", field: "applications", width: 52 },
  { header: "beneficios", field: "benefits", width: 42 },
  { header: "compatibilidade", field: "compatibility", width: 42 },
  { header: "preco_ou_condicao", field: "priceOrCondition", width: 28 },
  { header: "alt_imagem_principal", field: "imageAlt", width: 52 },
  { header: "descricao", field: "description", width: 54 },
  { header: "detalhes", field: "detail", width: 62 },
  { header: "preco_novo", field: "price", width: 16 },
  { header: "preco_antigo", field: "oldPrice", width: 16 },
  { header: "link_youtube", field: "youtubeUrl", width: 42 },
  { header: "categoria", field: "category", width: 18 },
  { header: "marca", field: "brand", width: 18 },
  { header: "condicao_pagamento", field: "paymentInfo", width: 34 },
  { header: "observacao_estoque", field: "stockStatus", width: 32 },
  { header: "ativo", field: "active", width: 12 },
  { header: "destaque", field: "featured", width: 12 },
  { header: "imagem_principal", field: "imageUrl", width: 50 },
  { header: "galeria_imagens", field: "images", width: 62 },
  { header: "tags", field: "tags", width: 34 },
  { header: "usos_filtros", field: "useTags", width: 34 },
  { header: "especificacoes_json", field: "specs", width: 54 }
];

const headerAliases: Record<string, SpreadsheetField> = {
  id: "id",
  id_nao_alterar: "id",
  codigo: "id",
  codigo_interno: "id",
  slug: "slug",
  slug_nao_alterar: "slug",
  nome: "name",
  produto: "name",
  titulo: "name",
  nome_completo: "fullName",
  nome_tecnico: "fullName",
  resumo_comercial: "commercialSummary",
  resumo: "commercialSummary",
  aplicacoes: "applications",
  aplicacao: "applications",
  beneficios: "benefits",
  beneficio: "benefits",
  compatibilidade: "compatibility",
  preco_ou_condicao: "priceOrCondition",
  condicao_preco: "priceOrCondition",
  alt_imagem_principal: "imageAlt",
  alt_imagem: "imageAlt",
  descricao: "description",
  descricao_curta: "description",
  descricaocurta: "description",
  detalhes: "detail",
  descricao_completa: "detail",
  descricaocompleta: "detail",
  detalhe: "detail",
  preco: "price",
  preco_novo: "price",
  preconovo: "price",
  preco_vista: "price",
  precovista: "price",
  valor: "price",
  preco_antigo: "oldPrice",
  precoantigo: "oldPrice",
  valor_antigo: "oldPrice",
  link_youtube: "youtubeUrl",
  link_youtobe: "youtubeUrl",
  youtube: "youtubeUrl",
  youtube_url: "youtubeUrl",
  video: "youtubeUrl",
  categoria: "category",
  categoria_vinculada: "category",
  marca: "brand",
  linha: "brand",
  condicao_pagamento: "paymentInfo",
  condicao_de_pagamento: "paymentInfo",
  pagamento: "paymentInfo",
  observacao_estoque: "stockStatus",
  estoque: "stockStatus",
  status: "stockStatus",
  ativo: "active",
  ativo_no_site: "active",
  destaque: "featured",
  imagem: "imageUrl",
  imagem_principal: "imageUrl",
  foto: "imageUrl",
  galeria: "images",
  galeria_imagens: "images",
  imagens: "images",
  tags: "tags",
  usos: "useTags",
  usos_filtros: "useTags",
  filtros: "useTags",
  especificacoes: "specs",
  especificacoes_json: "specs",
  specs: "specs"
};

const categoryAliases: Record<string, ProductCategory> = {
  scanner: "scanners",
  scanners: "scanners",
  diagnostico: "scanners",
  diagnosticos: "scanners",
  maquina: "maquinas",
  maquinas: "maquinas",
  manometro: "manometros",
  manometros: "manometros",
  teste: "manometros",
  testes: "manometros",
  ferramenta: "equipamentos",
  ferramentas: "equipamentos",
  equipamento: "equipamentos",
  equipamentos: "equipamentos"
};

function normalizeHeader(value: string) {
  return sanitizeCopy(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/(^_|_$)+/g, "");
}

function normalizeValue(value: unknown) {
  if (value === null || value === undefined) return "";
  return sanitizeCopy(String(value)).trim();
}

function parseListCell(value: unknown) {
  const text = normalizeValue(value);
  if (!text) return [];

  return text
    .split(/\r?\n|;|,/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function formatListCell(value?: string[]) {
  return (value || []).filter(Boolean).join("\n");
}

function parseBooleanCell(value: unknown, fallback: boolean) {
  const text = normalizeValue(value).toLowerCase();
  if (!text) return fallback;
  if (["sim", "s", "true", "1", "ativo", "x"].includes(text)) return true;
  if (["nao", "não", "n", "false", "0", "inativo"].includes(text)) return false;
  return fallback;
}

function parsePriceCell(value: unknown) {
  if (value === null || value === undefined || value === "") return null;
  if (typeof value === "number" && Number.isFinite(value)) return value;

  const text = normalizeValue(value);
  if (!text || /consulte|sob consulta/i.test(text)) return null;

  const normalized = text
    .replace(/[^\d,.-]/g, "")
    .replace(/\.(?=\d{3}(\D|$))/g, "")
    .replace(",", ".");
  const parsed = Number(normalized);

  return Number.isFinite(parsed) ? parsed : null;
}

function parseCategoryCell(value: unknown, fallback: ProductCategory) {
  const normalized = normalizeHeader(normalizeValue(value));
  return categoryAliases[normalized] || normalizeProductCategory(normalized, fallback);
}

function normalizeImageCell(value: unknown) {
  const text = normalizeValue(value);
  if (!text) return "";
  return normalizeProductAssetUrl(text);
}

function parseImagesCell(value: unknown, fallbackImage: string) {
  const images = parseListCell(value).map(normalizeImageCell).filter(Boolean);
  return Array.from(new Set([fallbackImage, ...images].filter(Boolean)));
}

function productToRow(product: Product) {
  return {
    id_nao_alterar: product.id,
    slug_nao_alterar: product.slug,
    nome: sanitizeCopy(product.name),
    nome_completo: sanitizeCopy(product.fullName || ""),
    resumo_comercial: sanitizeCopy(product.commercialSummary || ""),
    aplicacoes: sanitizeCopy(product.applications || ""),
    beneficios: formatListCell(product.benefits),
    compatibilidade: sanitizeCopy(product.compatibility || ""),
    preco_ou_condicao: sanitizeCopy(product.priceOrCondition || ""),
    alt_imagem_principal: sanitizeCopy(product.imageAlt || ""),
    descricao: sanitizeCopy(product.description),
    detalhes: sanitizeCopy(product.detail || ""),
    preco_novo: product.price ?? "",
    preco_antigo: product.oldPrice ?? "",
    link_youtube: product.youtubeUrl || "",
    categoria: product.category,
    marca: sanitizeCopy(product.brand || ""),
    condicao_pagamento: sanitizeCopy(product.paymentInfo || product.paymentNote || ""),
    observacao_estoque: sanitizeCopy(product.stockStatus || ""),
    ativo: product.active ? "sim" : "nao",
    destaque: product.featured ? "sim" : "nao",
    imagem_principal: product.imageUrl,
    galeria_imagens: formatListCell(product.images),
    tags: formatListCell(product.tags),
    usos_filtros: formatListCell(product.useTags),
    especificacoes_json: JSON.stringify(product.specs || {}, null, 2)
  };
}

export async function buildProductsWorkbook(products: Product[]) {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "ScannerTec";
  workbook.created = new Date();

  const sheet = workbook.addWorksheet("Produtos", {
    views: [{ state: "frozen", ySplit: 1 }]
  });

  sheet.columns = productColumns.map((column) => ({
    header: column.header,
    key: column.header,
    width: column.width
  }));
  products.forEach((product) => sheet.addRow(productToRow(product)));
  sheet.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };
  sheet.getRow(1).fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF1A2A3A" }
  };
  sheet.eachRow((row) => {
    row.alignment = { vertical: "top", wrapText: true };
  });

  const categorySheet = workbook.addWorksheet("Categorias");
  categorySheet.columns = [
    { header: "categoria", key: "category", width: 18 },
    { header: "nome exibido", key: "label", width: 28 }
  ];
  categorySheet.addRows([
    { category: "scanners", label: formatCategoryLabel("scanners") },
    { category: "maquinas", label: formatCategoryLabel("maquinas") },
    { category: "manometros", label: formatCategoryLabel("manometros") },
    { category: "equipamentos", label: formatCategoryLabel("equipamentos") }
  ]);
  categorySheet.getRow(1).font = { bold: true };

  const helpSheet = workbook.addWorksheet("Orientacoes");
  helpSheet.columns = [
    { header: "Campo", key: "field", width: 24 },
    { header: "Como preencher", key: "help", width: 86 }
  ];
  helpSheet.addRows([
    { field: "id_nao_alterar", help: "Identificador principal do produto. Evite alterar; use para atualizar o cadastro certo." },
    { field: "slug_nao_alterar", help: "Endereço do produto no site. Se preencher com acento, o sistema normaliza automaticamente." },
    { field: "nome_completo", help: "Nome técnico/comercial mais completo para SEO e página de produto." },
    { field: "resumo_comercial", help: "Resumo curto com proposta de valor do produto. Evite repetir apenas o nome." },
    { field: "aplicacoes / beneficios / compatibilidade", help: "Campos estruturados para enriquecer SEO e a página do produto." },
    { field: "alt_imagem_principal", help: "Texto alternativo descritivo da imagem principal para SEO e acessibilidade." },
    { field: "preco_novo / preco_antigo", help: "Use número, R$ 3.990,00 ou deixe vazio para Sob consulta." },
    { field: "link_youtube", help: "Cole a URL do vídeo do produto. Se ficar vazio, o botão não aparece." },
    { field: "imagem_principal", help: "Use uma URL completa, caminho /assets/... ou nome de arquivo em /assets/products." },
    { field: "galeria_imagens", help: "Uma imagem por linha, por vírgula ou por ponto e vírgula." },
    { field: "especificacoes_json", help: "Opcional. Use JSON, por exemplo: {\"Garantia\":\"12 meses\"}." }
  ]);
  helpSheet.getRow(1).font = { bold: true };
  helpSheet.eachRow((row) => {
    row.alignment = { vertical: "top", wrapText: true };
  });

  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
}

function excelCellToValue(value: ExcelJS.CellValue | undefined): unknown {
  if (value === null || value === undefined) return "";
  if (typeof value !== "object") return value;
  if (value instanceof Date) return value.toISOString();

  if ("text" in value && typeof value.text === "string") {
    return value.text;
  }

  if ("richText" in value && Array.isArray(value.richText)) {
    return value.richText.map((part) => part.text).join("");
  }

  if ("result" in value) {
    return excelCellToValue(value.result as ExcelJS.CellValue);
  }

  return String(value);
}

export async function parseProductsWorkbook(buffer: Buffer): Promise<ParsedProductSpreadsheetRow[]> {
  const workbook = new ExcelJS.Workbook();
  const workbookBuffer = buffer as unknown as Parameters<typeof workbook.xlsx.load>[0];
  await workbook.xlsx.load(workbookBuffer);

  const sheet = workbook.getWorksheet("Produtos") || workbook.worksheets[0];
  if (!sheet) return [];

  const headerRow = sheet.getRow(1);
  const headers = headerRow.values as Array<unknown>;
  const rows: ParsedProductSpreadsheetRow[] = [];

  sheet.eachRow((sheetRow, rowIndex) => {
    if (rowIndex === 1) return;

    const raw: Record<string, unknown> = {};
    headers.forEach((header, columnIndex) => {
      if (!header || columnIndex === 0) return;
      raw[String(header)] = excelCellToValue(sheetRow.getCell(columnIndex).value);
    });

    const fields: Partial<Record<SpreadsheetField, unknown>> = {};

    Object.entries(raw).forEach(([header, value]) => {
      const field = headerAliases[normalizeHeader(header)];
      if (field) {
        fields[field] = value;
      }
    });

    if (!Object.values(fields).some((value) => normalizeValue(value))) return;

    rows.push({
      rowNumber: rowIndex,
      raw,
      fields
    });
  });

  return rows;
}

export function buildProductInputFromSpreadsheetRow(
  row: ParsedProductSpreadsheetRow,
  existing?: Product
): { slug: string; input: ProductInput } | { error: string } {
  const fields = row.fields;
  const hasField = (field: SpreadsheetField) => Object.prototype.hasOwnProperty.call(fields, field);
  const rawId = normalizeValue(fields.id);
  const rawSlug = normalizeValue(fields.slug);
  const name = normalizeValue(fields.name) || existing?.name || "";
  const normalizedId = rawId ? slugify(rawId) : "";
  const normalizedSlug = rawSlug ? slugify(rawSlug) : "";
  const slug = normalizedSlug || existing?.slug || normalizedId || slugify(name);
  const id = existing?.id || normalizedId || slug;

  if (!slug) {
    return { error: `Linha ${row.rowNumber}: informe o id, o slug ou o nome do produto.` };
  }

  if (!name) {
    return { error: `Linha ${row.rowNumber}: informe o nome do produto.` };
  }

  const category = parseCategoryCell(fields.category, existing?.category || "scanners");
  const imageUrl =
    (hasField("imageUrl") ? normalizeImageCell(fields.imageUrl) : existing?.imageUrl) ||
    existing?.imageUrl ||
    "/assets/catalogo-secoes.jpeg";
  const specsText = normalizeValue(fields.specs);
  let specs = existing?.specs || {};

  if (specsText) {
    try {
      specs = JSON.parse(specsText) as Record<string, string>;
    } catch {
      return { error: `Linha ${row.rowNumber}: revise o JSON de especificações.` };
    }
  }

  const input: ProductInput = {
    id,
    slug,
    name,
    fullName: normalizeValue(fields.fullName) || existing?.fullName || name,
    commercialSummary: normalizeValue(fields.commercialSummary) || existing?.commercialSummary || "",
    applications: normalizeValue(fields.applications) || existing?.applications || "",
    benefits: parseListCell(fields.benefits).length ? parseListCell(fields.benefits) : existing?.benefits || [],
    compatibility: normalizeValue(fields.compatibility) || existing?.compatibility || "",
    priceOrCondition: normalizeValue(fields.priceOrCondition) || existing?.priceOrCondition || "",
    imageAlt: normalizeValue(fields.imageAlt) || existing?.imageAlt || "",
    sku: existing?.sku || "",
    category,
    brand: normalizeValue(fields.brand) || existing?.brand || "ScannerTec",
    description: normalizeValue(fields.description) || existing?.description || name,
    detail: normalizeValue(fields.detail) || existing?.detail || normalizeValue(fields.description) || existing?.description || name,
    price: hasField("price") ? parsePriceCell(fields.price) : existing?.price ?? null,
    oldPrice: hasField("oldPrice") ? parsePriceCell(fields.oldPrice) : existing?.oldPrice ?? null,
    imageUrl,
    images: hasField("images") ? parseImagesCell(fields.images, imageUrl) : existing?.images || [imageUrl],
    youtubeUrl: hasField("youtubeUrl") ? normalizeValue(fields.youtubeUrl) : existing?.youtubeUrl || "",
    active: parseBooleanCell(fields.active, existing?.active ?? true),
    featured: parseBooleanCell(fields.featured, existing?.featured ?? false),
    mostViewed: existing?.mostViewed || false,
    stockStatus: normalizeValue(fields.stockStatus) || existing?.stockStatus || "Consultar disponibilidade",
    paymentNote: normalizeValue(fields.paymentInfo) || existing?.paymentNote || existing?.paymentInfo || "Consultar condições",
    paymentInfo: normalizeValue(fields.paymentInfo) || existing?.paymentInfo || existing?.paymentNote || "Consultar condições",
    tags: parseListCell(fields.tags).length ? parseListCell(fields.tags) : existing?.tags || [],
    useTags: parseListCell(fields.useTags).length ? parseListCell(fields.useTags) : existing?.useTags || existing?.tags || [],
    specs
  };

  return { slug, input };
}
