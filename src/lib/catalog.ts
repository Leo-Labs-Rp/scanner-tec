import { formatCurrency, repairMojibake } from "@/lib/format";
import type { CartItem, Product, ProductCategory } from "@/types/product";

const brandFallbacks = [
  "Autel",
  "Raven",
  "Launch",
  "Planatc",
  "Injetec",
  "Potente Brasil",
  "Chiptronic",
  "Multimec",
  "Laserteck"
] as const;

const categoryLabels: Record<ProductCategory, string> = {
  scanners: "Scanners",
  maquinas: "Máquinas",
  manometros: "Manômetros",
  equipamentos: "Equipamentos"
};

export const productCategories: Array<{ label: string; value: ProductCategory; href: string }> = [
  { label: "Scanners", value: "scanners", href: "/categoria/scanners" },
  { label: "Máquinas", value: "maquinas", href: "/categoria/maquinas" },
  { label: "Manômetros", value: "manometros", href: "/categoria/manometros" },
  { label: "Equipamentos", value: "equipamentos", href: "/categoria/equipamentos" }
];

const tagLabels: Record<string, string> = {
  diagnostico: "Diagnóstico",
  bateria: "Bateria / Elétrica",
  freios: "Freios",
  suspensao: "Suspensão",
  "auto center": "Auto center",
  motos: "Linha Moto",
  chaves: "Chaves",
  "arla 32": "ARLA 32",
  atualizacao: "Atualizações",
  motor: "Motor",
  elevadores: "Elevadores / Rampas",
  maquinas: "Máquinas",
  manometros: "Manômetros",
  combustivel: "Combustível",
  arrefecimento: "Arrefecimento",
  ferramentas: "Ferramentas"
};

export const quickUseLinks = [
  { label: "Scanners", href: "/categoria/scanners", use: "diagnostico" },
  { label: "Máquinas", href: "/categoria/maquinas", use: "maquinas" },
  { label: "Manômetros", href: "/categoria/manometros", use: "manometros" },
  { label: "Linha Moto", href: "/buscar?uso=motos", use: "motos" },
  { label: "Atualizações", href: "/buscar?uso=atualizacao", use: "atualizacao" },
  { label: "Bateria / Elétrica", href: "/buscar?uso=bateria", use: "bateria" },
  { label: "Freios", href: "/buscar?uso=freios", use: "freios" },
  { label: "Suspensão", href: "/buscar?uso=suspensao", use: "suspensao" },
  { label: "Auto Center", href: "/buscar?uso=auto%20center", use: "auto center" },
  { label: "Elevadores / Rampas", href: "/buscar?uso=elevadores", use: "elevadores" }
] as const;

export const youtubeUrl = "https://www.youtube.com/@scannertecsolucoesautomoti6957";
export const businessCity = "São José do Rio Preto - SP";
export const businessHours = "Seg. a sex., 08h às 18h";
export const whatsappDisplayNumber = "(17) 98156-1200";
export const productionUrl = "https://scannertec.netlify.app";
export const transparentLogoUrl = "/assets/scannertec-logo-transparent.png";
export const shareLogoUrl = `${productionUrl}/assets/scannertec-logo.jpeg`;

export const menuGroups = [
  {
    label: "Scanners",
    href: "/categoria/scanners",
    category: "scanners",
    items: [
      { label: "Linha Auto", use: "diagnostico" },
      { label: "Linha Moto", use: "motos" },
      { label: "Atualizações", use: "atualizacao" }
    ]
  },
  {
    label: "Máquinas",
    href: "/categoria/maquinas",
    category: "maquinas",
    items: [
      { label: "Bicos injetores", use: "motor" },
      { label: "Limpeza e fluidos", use: "maquinas" },
      { label: "Auto center", use: "auto center" }
    ]
  },
  {
    label: "Manômetros",
    href: "/categoria/manometros",
    category: "manometros",
    items: [
      { label: "Compressão e pressão", use: "manometros" },
      { label: "Bomba de combustível", use: "combustivel" },
      { label: "Arrefecimento", use: "arrefecimento" }
    ]
  },
  {
    label: "Equipamentos",
    href: "/categoria/equipamentos",
    category: "equipamentos",
    items: [
      { label: "Elevadores / Rampas", use: "elevadores" },
      { label: "Bateria / Elétrica", use: "bateria" },
      { label: "Ferramentas", use: "ferramentas" }
    ]
  }
] as const;

function normalizeText(value: string) {
  return repairMojibake(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

const categoryAliases: Record<string, ProductCategory> = {
  scanner: "scanners",
  scanners: "scanners",
  diagnostico: "scanners",
  diagnosticos: "scanners",
  atualizacao: "scanners",
  atualizacoes: "scanners",
  chave: "scanners",
  chaves: "scanners",
  maquina: "maquinas",
  maquinas: "maquinas",
  injecao: "maquinas",
  limpeza: "maquinas",
  fluidos: "maquinas",
  pneus: "maquinas",
  alinhamento: "maquinas",
  manometro: "manometros",
  manometros: "manometros",
  teste: "manometros",
  testes: "manometros",
  ferramenta: "equipamentos",
  ferramentas: "equipamentos",
  equipamento: "equipamentos",
  equipamentos: "equipamentos",
  eletrica: "equipamentos",
  baterias: "equipamentos",
  freios: "equipamentos",
  elevadores: "equipamentos",
  macacos: "equipamentos"
};

export function normalizeProductCategory(value?: string | null, fallback: ProductCategory = "equipamentos") {
  const normalized = normalizeText(value || "")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/(^_|_$)+/g, "");

  return categoryAliases[normalized] || fallback;
}

const copyReplacements: Array<[RegExp, string]> = [
  [/\bdiagnostico\b/gi, "diagnóstico"],
  [/\bdiagnosticos\b/gi, "diagnósticos"],
  [/\batualizacao\b/gi, "atualização"],
  [/\batualizacoes\b/gi, "atualizações"],
  [/\bsuspensao\b/gi, "suspensão"],
  [/\bfuncao\b/gi, "função"],
  [/\bfuncoes\b/gi, "funções"],
  [/\banalise\b/gi, "análise"],
  [/\bservico\b/gi, "serviço"],
  [/\bservicos\b/gi, "serviços"],
  [/\bgratis\b/gi, "grátis"],
  [/\btrifasico\b/gi, "trifásico"],
  [/\bpneumatica\b/gi, "pneumática"],
  [/\bpneumatico\b/gi, "pneumático"],
  [/\bdescarbonizacao\b/gi, "descarbonização"],
  [/\bhidraulico\b/gi, "hidráulico"],
  [/\bhidraulica\b/gi, "hidráulica"],
  [/\bRobo\b/g, "Robô"],
  [/\brobo\b/gi, "robô"],
  [/\bcusto-beneficio\b/gi, "custo-benefício"],
  [/\beletrica\b/gi, "elétrica"],
  [/\beletrico\b/gi, "elétrico"],
  [/\beletronico\b/gi, "eletrônico"],
  [/\beletronica\b/gi, "eletrônica"],
  [/\btecnico\b/gi, "técnico"],
  [/\btecnica\b/gi, "técnica"],
  [/\bpreco\b/gi, "preço"],
  [/\borcamento\b/gi, "orçamento"],
  [/\bcondicao\b/gi, "condição"],
  [/\bcondicoes\b/gi, "condições"],
  [/\bdisponivel\b/gi, "disponível"],
  [/\bmaquina\b/gi, "máquina"],
  [/\bmaquinas\b/gi, "máquinas"],
  [/\baplicacao\b/gi, "aplicação"],
  [/\baplicacoes\b/gi, "aplicações"],
  [/\btecnicas\b/gi, "técnicas"],
  [/\btecnica\b/gi, "técnica"],
  [/\bopcoes\b/gi, "opções"],
  [/\bproximos\b/gi, "próximos"],
  [/\bvisualizacao\b/gi, "visualização"]
];

export function sanitizeCopy(value?: string | null) {
  if (!value) return "";

  const repaired = repairMojibake(value);
  return copyReplacements.reduce((text, [pattern, replacement]) => text.replace(pattern, replacement), repaired);
}

export function sanitizeProductCopy(product: Product): Product {
  return {
    ...product,
    sku: product.sku ? sanitizeCopy(product.sku) : product.sku,
    brand: product.brand ? sanitizeCopy(product.brand) : product.brand,
    name: sanitizeCopy(product.name),
    description: sanitizeCopy(product.description),
    detail: product.detail ? sanitizeCopy(product.detail) : product.detail,
    stockStatus: sanitizeCopy(product.stockStatus),
    paymentNote: product.paymentNote ? sanitizeCopy(product.paymentNote) : product.paymentNote,
    paymentInfo: product.paymentInfo ? sanitizeCopy(product.paymentInfo) : product.paymentInfo,
    tags: product.tags?.map(sanitizeCopy),
    useTags: product.useTags?.map(sanitizeCopy),
    specs: product.specs
      ? Object.fromEntries(
          Object.entries(product.specs).map(([key, value]) => [sanitizeCopy(key), sanitizeCopy(value)])
        )
      : product.specs
  };
}

export function formatCategoryLabel(category: ProductCategory) {
  return categoryLabels[category];
}

export function formatTagLabel(tag: string) {
  const normalizedTag = normalizeText(tag).replace(/-/g, " ");
  return tagLabels[normalizedTag] || sanitizeCopy(tag);
}

export function productBrand(product: Product) {
  if (product.brand) return sanitizeCopy(product.brand);

  const normalizedName = normalizeText(product.name);
  return brandFallbacks.find((brand) => normalizedName.includes(normalizeText(brand))) || "ScannerTec";
}

export function productTags(product: Product) {
  if (product.useTags?.length) return product.useTags.map(sanitizeCopy);
  if (product.tags?.length) return product.tags.map(sanitizeCopy);

  const source = normalizeText(`${product.name} ${product.description}`);
  const tags = new Set<string>();

  if (source.includes("scanner") || source.includes("diagnostico")) tags.add("diagnostico");
  if (source.includes("atualizacao")) tags.add("atualizacao");
  if (source.includes("maquina") || source.includes("bico") || source.includes("fumaca") || source.includes("fluido")) tags.add("maquinas");
  if (source.includes("manometro") || source.includes("compressao") || source.includes("pressao") || source.includes("cilindro")) tags.add("manometros");
  if (source.includes("combustivel")) tags.add("combustivel");
  if (source.includes("arrefecimento")) tags.add("arrefecimento");
  if (source.includes("bateria") || source.includes("eletric")) tags.add("bateria");
  if (source.includes("freio")) tags.add("freios");
  if (source.includes("mola") || source.includes("suspens")) tags.add("suspensao");
  if (source.includes("elevador") || source.includes("rampa") || source.includes("pneu")) tags.add("auto center");
  if (source.includes("moto")) tags.add("motos");
  if (source.includes("chave")) tags.add("chaves");
  if (source.includes("motor")) tags.add("motor");
  if (source.includes("chave") || source.includes("impacto") || source.includes("parafusadeira") || source.includes("catraca")) tags.add("ferramentas");
  if (source.includes("arla") || source.includes("dnox")) tags.add("arla 32");

  return Array.from(tags);
}

export function matchesProductUse(product: Product, use: string) {
  const expected = normalizeText(use).replace(/-/g, " ");
  return productTags(product).some((tag) => normalizeText(tag).replace(/-/g, " ") === expected);
}

export function needsConsultation(product: Product) {
  const stock = normalizeText(product.stockStatus);
  const payment = normalizeText(product.paymentNote || product.paymentInfo || "");
  return (
    product.price === null ||
    stock.includes("consulta") ||
    stock.includes("disponibilidade") ||
    payment.includes("consulta")
  );
}

export function formatPaymentInfo(product: Product) {
  const raw = normalizeText(product.paymentInfo || product.paymentNote || "");

  if (raw.includes("10x")) return "em até 10x no cartão";
  if (raw.includes("a vista") || raw.includes("avista")) return "à vista";
  if (!raw || raw.includes("consulta") || raw.includes("consultar")) return "consulte condições";

  return sanitizeCopy(product.paymentInfo || product.paymentNote || "consulte condições");
}

export function productUrl(product: Product) {
  return `${productionUrl}/produto/${product.slug}`;
}

export function discountPercent(product: Product) {
  if (!product.oldPrice || !product.price || product.oldPrice <= product.price) return null;
  return Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100);
}

export function primaryProductActionLabel(product?: Product) {
  void product;
  return "Adicionar à lista";
}

export function buildProductInquiryMessage(product: Product) {
  const priceLine = product.price === null ? "Preço exibido: sob consulta." : `Preço exibido: ${formatCurrency(product.price)}.`;

  return [
    "Olá, vim pelo site da ScannerTec.",
    `Tenho interesse no produto: ${sanitizeCopy(product.name)}.`,
    `Marca/linha: ${productBrand(product)}.`,
    priceLine,
    `Link: ${productUrl(product)}`,
    "Pode confirmar disponibilidade, pagamento, frete e retirada?"
  ].join("\n");
}

export function buildProductFloatingMessage(productOrName: Product | string) {
  if (typeof productOrName === "string") {
    return `Olá, tenho interesse no produto ${sanitizeCopy(productOrName)}. Pode confirmar disponibilidade, pagamento, frete e retirada?`;
  }

  return buildProductInquiryMessage(productOrName);
}

export function buildDefaultBudgetMessage() {
  return "Olá, vim pelo site e gostaria de um orçamento.";
}

export function buildQuoteRequestMessage(items: CartItem[]) {
  const pricedItems = items.filter((item) => item.price !== null);
  const total = pricedItems.reduce((sum, item) => sum + (item.price || 0) * item.quantity, 0);

  return [
    "Olá, vim pelo site da ScannerTec.",
    "Quero solicitar um orçamento para estes itens:",
    ...items.map(
      (item) =>
        `- ${item.quantity}x ${sanitizeCopy(item.name)} (${productBrand(item)}): ${
          item.price === null ? "sob consulta" : formatCurrency(item.price)
        }`
    ),
    "",
    pricedItems.length ? `Total estimado dos itens com preço: ${formatCurrency(total)}.` : "Total estimado: sob consulta.",
    "",
    "Minha oficina/cidade:",
    "Pode confirmar disponibilidade, condições de pagamento, frete e opção de retirada?"
  ].join("\n");
}

