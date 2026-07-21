import fs from "node:fs";
import path from "node:path";
import rawProducts from "@/lib/produtos_scannertec.json";
import type { Product, ProductCategory } from "@/types/product";

type RawProduct = {
  id: number;
  nome: string;
  subtitulo?: string | null;
  preco_vista?: number | null;
  preco_parcelado?: number | null;
  preco_texto?: string | null;
  condicao_pagamento?: string | null;
  categoria: string;
  slug: string;
  imagem_ref: string;
  observacao?: string | null;
};

const featuredSlugs = new Set([
  "scanner-multimec-x3",
  "scanner-raven-pro-3-com-tablet",
  "autel-ds900-bt",
  "launch-x431-pro",
  "autel-maxisys-ms908s3",
  "autel-mx900",
  "scanlink-moto-planatc",
  "maquina-bicos-injetores-planatc",
  "maquina-troca-oleo-cambio",
  "alinhador-digital-rack-laserteck",
  "elevador-25t-trifasico",
  "elevador-41t-trifasico"
]);

const descriptionOverrides: Record<string, string> = {
  "scanner-multimec-x3": "Scanner preparado para rotinas de diagnóstico com leitura ágil e apoio ao reparador no dia a dia da oficina.",
  "scanner-raven-pro-3-sem-tablet": "Versão sem tablet para oficinas que já possuem equipamento compatível e querem uma solução de diagnóstico mais enxuta.",
  "scanner-raven-pro-3-com-tablet": "Versão com tablet para atendimento mais prático, unindo mobilidade e leitura eletrônica em uma única solução.",
  "arla-32-dnox-tester-planatc": "Equipamento voltado ao diagnóstico de sistemas ARLA 32, ideal para análise técnica e apoio em manutenção diesel.",
  "arla-32-dnox-bancada-planatc": "Bancada de apoio para testes e verificação de componentes ligados ao sistema DNOX e ARLA 32.",
  "scanlink-moto-planatc": "Scanner para motos pensado para oficinas que atendem linha duas rodas com mais precisão no diagnóstico eletrônico.",
  "autel-ds900-bt": "Sistema de diagnóstico Autel com conectividade sem fio, boa cobertura de funções e foco em produtividade na oficina.",
  "launch-x431-pro": "Scanner profissional Launch para rotinas completas de leitura, testes e suporte aos reparos eletrônicos.",
  "autel-maxisys-ms908s3": "Plataforma avançada da Autel para oficinas que buscam recursos mais completos de diagnóstico e programação.",
  "autel-mx900": "Scanner Autel de uso profissional para leituras, testes e funções de serviço em diferentes sistemas do veículo.",
  "recalibracao-tecnica-ds808-mp208": "Recalibração técnica para manter o equipamento compatível com novos sistemas, funções e veículos suportados.",
  "recalibracao-carga-brasil": "Recalibração dedicada à linha carga, com foco em ampliar cobertura e manter o diagnóstico em dia.",
  "codificador-chave-chiptronic": "Solução para codificação de chaves automotivas com foco em serviços especializados e atendimento técnico.",
  "autel-km100": "Programador de chaves da Autel para rotinas de codificação, cadastro e suporte a serviços automotivos especializados.",
  "testador-de-baterias": "Ferramenta para avaliação rápida do estado da bateria, útil no diagnóstico elétrico e na triagem de oficina.",
  "carregador-de-baterias": "Carregador para apoio elétrico em manutenção automotiva, recarga e suporte em baterias de serviço.",
  "auxiliar-de-partida": "Equipamento de apoio para partida e atendimento rápido em situações de baixa carga da bateria.",
  "teste-fluido-de-freio": "Ferramenta para análise do fluido de freio e apoio na decisão de troca preventiva ou corretiva.",
  "teste-de-compressao": "Kit voltado à verificação de compressão, auxiliando o diagnóstico de desempenho e vedação do motor.",
  "teste-pressao-de-oleo": "Ferramenta para conferência da pressão de óleo em rotinas de verificação mecânica e preventiva.",
  "caneta-de-polaridade": "Caneta de apoio para testes elétricos rápidos, identificação de polaridade e conferências em chicotes e circuitos.",
  "osciloscopia-3-canais": "Osciloscópio de 3 canais para análises técnicas mais detalhadas em sinais automotivos e diagnóstico eletrônico.",
  "case-tecnoscopia": "Capa protetora para osciloscópio, pensada para transporte, organização e preservação do equipamento.",
  "transdutor-4-em-1": "Acessório para ampliar medições e apoiar diagnósticos avançados em diferentes rotinas de análise automotiva.",
  "teste-de-cilindros": "Ferramenta de apoio para testes em cilindros e verificação de desempenho em sistemas do motor.",
  "teste-bomba-combustivel": "Kit para conferência da bomba de combustível e apoio no diagnóstico de alimentação e pressão.",
  "sangrador-de-freios": "Equipamento para facilitar sangria do sistema de freio com mais agilidade e padronização no serviço.",
  "teste-de-arrefecimento": "Ferramenta para avaliação do sistema de arrefecimento, útil na identificação de falhas e vazamentos.",
  "maquina-bicos-injetores-planatc": "Máquina para limpeza e teste de bicos injetores com foco em manutenção precisa e ganho de produtividade.",
  "maquina-bicos-injetores-injetec": "Equipamento para limpeza e ensaio de bicos injetores, indicado para rotinas técnicas de injeção.",
  "maquina-injetora-de-fumaca": "Solução para geração de fumaça em testes de estanqueidade e localização de vazamentos.",
  "maquina-fumaca-detectora-vazamentos-raven-109200": "Máquina Raven voltada à detecção de vazamentos em sistemas automotivos com apoio visual rápido.",
  "raven-ecoblasting": "Equipamento de jateamento para descarbonização, indicado para processos técnicos de limpeza automotiva.",
  "kit-sincronismo": "Kit com aplicação ampla para serviços de sincronismo, pensado para atender diferentes montadoras do mercado nacional.",
  "ferramenta-comprimir-molas-multiair-raven": "Ferramenta específica para compressão de molas em aplicações Multiair, com foco em segurança e precisão.",
  "consulta-tecnica-circuitos-eletricos-ecu": "Material técnico de apoio para leitura de circuitos, análise elétrica e consulta em reparos eletrônicos.",
  "maquina-troca-fluido-direcao-hidraulica": "Equipamento para troca de fluido da direção hidráulica com mais controle e agilidade no serviço.",
  "carregador-bateria-maxfort": "Carregador Maxfort para bateria com perfil profissional, indicado para apoio em elétrica e manutenção.",
  "maquina-troca-oleo-cambio": "Máquina para troca de óleo de câmbio, voltada a oficinas que trabalham com manutenção de transmissão.",
  "desmontadora-pneus-potente-brasil": "Equipamento para desmontagem de pneus, ideal para estrutura de borracharia e auto center.",
  "alinhador-digital-rack-laserteck": "Alinhador digital com rack para serviços de geometria, leitura e ajuste no atendimento automotivo.",
  "balanceadora-de-rodas": "Balanceadora para apoio na montagem e correção de rodas, indicada para oficina e centro automotivo.",
  "robo-diagnostico-folga-suspensao": "Equipamento para diagnóstico de folgas em suspensão, ajudando a tornar a inspeção mais precisa.",
  "chave-impacto-pneumatica-1-2": "Chave de impacto pneumática 1/2 para desmontagem e aperto com desempenho compatível com uso profissional.",
  "chave-impacto-88kg-2-baterias": "Chave de impacto a bateria com bom torque para rotinas de oficina e mobilidade no serviço.",
  "catraca-pneumatica-1-2": "Catraca pneumática 1/2 indicada para serviços repetitivos com agilidade e melhor ergonomia.",
  "parafusadeira-5nm": "Parafusadeira compacta para ajustes rápidos, pequenos apertos e tarefas de acabamento técnico.",
  "elevador-25t-trifasico": "Elevador automotivo trifásico de 2,5 toneladas para estrutura profissional de oficina.",
  "elevador-41t-trifasico": "Elevador trifásico de maior capacidade, indicado para oficinas com demanda mais pesada.",
  "rampa-automotiva": "Rampa automotiva para compor estrutura de atendimento, inspeção e serviços em linha mecânica.",
  "macaco-25t": "Macaco hidráulico para apoio em elevação e serviços de manutenção no dia a dia da oficina.",
  "suporte-para-motores": "Suporte para motores pensado para organização, sustentação e segurança durante reparos.",
  "cavalete-2t": "Cavalete de apoio para sustentação do veículo em serviços mecânicos e preventivos.",
  "macaco-para-cambio": "Macaco para câmbio indicado para manuseio e remoção com mais controle durante o reparo.",
  "encolhedor-hidraulico-mola-1t": "Encolhedor hidráulico de mola para rotinas de suspensão com foco em segurança operacional.",
  "suporte-giratorio-motor-450kg": "Suporte giratório para motor com boa capacidade de carga, facilitando acesso e manipulação."
};

const detailOverrides: Record<string, string> = {
  "scanner-multimec-x3": "Indicado para oficinas que precisam de leitura rápida de sistemas e apoio prático em diagnóstico automotivo.",
  "scanner-raven-pro-3-sem-tablet": "Boa opção para quem já possui tablet compatível e quer montar uma solução mais enxuta para a bancada ou atendimento móvel.",
  "scanner-raven-pro-3-com-tablet": "Entrega uma experiência mais completa para a rotina da oficina, com visualização, mobilidade e praticidade no atendimento.",
  "arla-32-dnox-tester-planatc": "Voltado para oficinas e especialistas que trabalham com sistemas diesel e precisam de apoio técnico em análises de ARLA 32.",
  "arla-32-dnox-bancada-planatc": "Ajuda na verificação em bancada e complementa a rotina de manutenção de componentes ligados ao sistema DNOX.",
  "scanlink-moto-planatc": "Pensado para oficinas de motos que buscam uma solução dedicada ao diagnóstico eletrônico da linha duas rodas.",
  "autel-ds900-bt": "Combina mobilidade e cobertura funcional para a oficina que quer produtividade sem abrir mão de recursos técnicos.",
  "launch-x431-pro": "Linha conhecida por atender oficinas que precisam de um scanner versátil para leitura, testes e rotinas de serviço.",
  "autel-maxisys-ms908s3": "Modelo mais robusto para operações técnicas mais completas, incluindo demandas avançadas de diagnóstico.",
  "autel-mx900": "Boa escolha para oficinas que querem uma solução atual de diagnóstico com interface prática e funções de manutenção.",
  "codificador-chave-chiptronic": "Voltado para serviços de chave automotiva e suporte técnico em codificação, cadastro e atendimento especializado.",
  "autel-km100": "Atende rotinas de programação de chaves com praticidade e foco em serviços automotivos específicos.",
  "maquina-bicos-injetores-planatc": "Ajuda a padronizar processos de limpeza e teste, melhorando a entrega técnica em serviços de injeção.",
  "maquina-bicos-injetores-injetec": "Indicada para oficinas que desejam ampliar a capacidade de limpeza e ensaio de bicos injetores.",
  "maquina-fumaca-detectora-vazamentos-raven-109200": "Facilita testes de vedação e localização visual de vazamentos em diversos sistemas automotivos.",
  "maquina-troca-oleo-cambio": "Boa solução para oficinas que trabalham com transmissão e querem mais controle no processo de troca.",
  "alinhador-digital-rack-laserteck": "Equipamento pensado para estrutura de alinhamento com leitura digital e apoio ao serviço em auto center.",
  "balanceadora-de-rodas": "Essencial para quem deseja compor uma linha de pneus mais completa com melhor acabamento no serviço.",
  "robo-diagnostico-folga-suspensao": "Apoia inspeções em suspensão e ajuda a apresentar diagnóstico com mais clareza para o cliente.",
  "elevador-25t-trifasico": "Indicado para oficinas com fluxo constante de veículos leves e necessidade de estrutura confiável.",
  "elevador-41t-trifasico": "Atende uma demanda de carga maior e reforça a estrutura da oficina em serviços mais pesados.",
  "rampa-automotiva": "Complementa a operação da oficina com uma estrutura estável para inspeção e manutenção."
};

const productsDirectory = path.join(process.cwd(), "public", "assets", "products");
const availableProductAssets = fs.existsSync(productsDirectory)
  ? new Set(fs.readdirSync(productsDirectory))
  : new Set<string>();

const manometerSlugs = new Set([
  "teste-de-compressao",
  "teste-pressao-de-oleo",
  "teste-de-cilindros",
  "teste-bomba-combustivel",
  "teste-de-arrefecimento"
]);

function normalizeText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function mapCategory(category: string, product?: RawProduct): ProductCategory {
  if (product && manometerSlugs.has(product.slug)) {
    return "manometros";
  }

  const normalized = normalizeText(category);

  if (["scanners", "diagnostico", "recalibracoes", "chaves", "consultas"].includes(normalized)) {
    return "scanners";
  }

  if (["injecao", "limpeza", "fluidos", "pneus", "alinhamento"].includes(normalized)) {
    return "maquinas";
  }

  return "equipamentos";
}

function inferBrand(product: RawProduct) {
  const source = normalizeText(`${product.nome} ${product.subtitulo || ""}`);

  if (source.includes("autel")) return "Autel";
  if (source.includes("raven")) return "Raven";
  if (source.includes("launch")) return "Launch";
  if (source.includes("planatc")) return "Planatc";
  if (source.includes("injetec")) return "Injetec";
  if (source.includes("potente brasil") || source.includes("potente")) return "Potente Brasil";
  if (source.includes("chiptronic")) return "Chiptronic";
  if (source.includes("multimec")) return "Multimec";
  if (source.includes("laserteck")) return "Laserteck";
  if (source.includes("maxfort")) return "Maxfort";
  if (source.includes("autop")) return "Autop";
  if (source.includes("tecnoscopia")) return "Tecnoscópio";

  return "ScannerTec";
}

function inferUseTags(product: RawProduct) {
  const source = normalizeText(
    `${product.nome} ${product.subtitulo || ""} ${product.categoria} ${product.observacao || ""}`
  );
  const tags = new Set<string>();

  if (source.includes("scanner") || source.includes("diagnostico")) tags.add("diagnostico");
  if (source.includes("recalibracao")) tags.add("recalibracao");
  if (source.includes("bateria") || source.includes("eletric")) tags.add("bateria");
  if (source.includes("freio")) tags.add("freios");
  if (source.includes("mola") || source.includes("suspens")) tags.add("suspensao");
  if (
    source.includes("elevador") ||
    source.includes("rampa") ||
    source.includes("pneu") ||
    source.includes("balanceadora") ||
    source.includes("alinhador") ||
    source.includes("macaco")
  ) {
    tags.add("auto center");
  }
  if (source.includes("elevador") || source.includes("rampa")) tags.add("elevadores");
  if (source.includes("moto")) tags.add("motos");
  if (source.includes("chave")) tags.add("chaves");
  if (source.includes("motor") || source.includes("injecao") || source.includes("bico")) tags.add("motor");
  if (source.includes("arla") || source.includes("dnox")) tags.add("arla 32");

  return Array.from(tags);
}

function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function buildPlaceholderImage(product: RawProduct) {
  const title = product.nome.length > 34 ? `${product.nome.slice(0, 34)}...` : product.nome;
  const subtitle = product.subtitulo || "Imagem do produto pendente";
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="1200" height="1200" viewBox="0 0 1200 1200">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#14161c" />
          <stop offset="100%" stop-color="#251016" />
        </linearGradient>
      </defs>
      <rect width="1200" height="1200" rx="48" fill="url(#bg)" />
      <rect x="64" y="64" width="1072" height="1072" rx="36" fill="#10131a" stroke="#343946" stroke-width="2" />
      <circle cx="218" cy="208" r="72" fill="#b30d1f" opacity="0.18" />
      <path d="M132 248 L292 248" stroke="#e3061c" stroke-width="12" stroke-linecap="round" />
      <text x="132" y="408" fill="#ffffff" font-family="Arial, Helvetica, sans-serif" font-size="72" font-weight="700">
        ${escapeXml(title)}
      </text>
      <text x="132" y="492" fill="#c5cad5" font-family="Arial, Helvetica, sans-serif" font-size="40">
        ${escapeXml(subtitle)}
      </text>
      <text x="132" y="620" fill="#f4f7fb" font-family="Arial, Helvetica, sans-serif" font-size="44" font-weight="700">
        ScannerTec
      </text>
      <text x="132" y="676" fill="#9da6b6" font-family="Arial, Helvetica, sans-serif" font-size="28" letter-spacing="2">
        IMAGEM AINDA NÃO DISPONÍVEL
      </text>
      <rect x="132" y="776" width="936" height="164" rx="24" fill="#171b24" stroke="#303644" stroke-width="2" />
      <text x="180" y="842" fill="#f5b9c0" font-family="Arial, Helvetica, sans-serif" font-size="24" font-weight="700">
        ARQUIVO ESPERADO
      </text>
      <text x="180" y="892" fill="#ffffff" font-family="Arial, Helvetica, sans-serif" font-size="34">
        ${escapeXml(product.imagem_ref)}
      </text>
      <text x="180" y="934" fill="#9da6b6" font-family="Arial, Helvetica, sans-serif" font-size="24">
        Use este nome ao subir a imagem final na pasta de produtos.
      </text>
    </svg>
  `;

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg.replace(/\s+/g, " ").trim())}`;
}

function resolveProductImage(product: RawProduct) {
  const imageRefBase = product.imagem_ref.replace(/\.[^.]+$/, "");
  const candidates = [
    product.imagem_ref,
    `${imageRefBase}.png`,
    `${imageRefBase}.jpg`,
    `${imageRefBase}.jpeg`,
    `${product.slug}.png`,
    `${product.slug}.jpg`,
    `${product.slug}.jpeg`
  ];

  const match = candidates.find((candidate) => availableProductAssets.has(candidate));
  return match ? `/assets/products/${match}` : buildPlaceholderImage(product);
}

function buildDescription(product: RawProduct) {
  if (descriptionOverrides[product.slug]) return descriptionOverrides[product.slug];
  if (product.subtitulo) return product.subtitulo;

  const labels: Record<string, string> = {
    scanners: "Scanner automotivo para rotina profissional de oficina.",
    diagnostico: "Linha de diagnóstico para leitura, testes e reparo automotivo.",
    recalibracoes: "Recalibração e suporte técnico para manter o equipamento em dia.",
    chaves: "Solução para programação e serviços com chaves automotivas.",
    baterias: "Ferramenta para apoio elétrico e atendimento de bateria.",
    testes: "Item voltado para testes e verificação técnica na oficina.",
    eletrica: "Ferramenta de apoio para diagnóstico elétrico automotivo.",
    freios: "Equipamento para serviços e manutenção de freios.",
    injecao: "Equipamento para limpeza, testes e serviços de injeção.",
    limpeza: "Equipamento para limpeza técnica e descarbonização.",
    ferramentas: "Ferramenta profissional para o dia a dia da oficina.",
    consultas: "Conteúdo técnico de apoio para diagnóstico eletrônico.",
    fluidos: "Equipamento para troca e manutenção de fluidos automotivos.",
    pneus: "Equipamento para estrutura de auto center e borracharia.",
    alinhamento: "Equipamento para alinhamento e balanceamento.",
    elevadores: "Equipamento de estrutura para elevação e atendimento da oficina.",
    macacos: "Item de apoio para sustentação e manuseio na oficina."
  };

  return labels[normalizeText(product.categoria)] || "Produto disponível sob consulta com a equipe ScannerTec.";
}

function buildDetail(product: RawProduct, brand: string, paymentInfo: string, stockStatus: string) {
  const sections = [
    detailOverrides[product.slug] || `${product.nome}${product.subtitulo ? ` - ${product.subtitulo}` : ""}.`,
    `Linha ${brand} para oficinas, reparadores e auto centers.`,
    product.observacao,
    `Condição comercial: ${paymentInfo}.`,
    `Status exibido: ${stockStatus}.`
  ];

  return sections.filter(Boolean).join("\n");
}

function buildSpecs(product: RawProduct, brand: string, paymentInfo: string) {
  return {
    "Categoria principal": mapCategory(product.categoria, product),
    "Grupo original": product.categoria,
    Marca: brand,
    "Condição de pagamento": paymentInfo,
    "Observação comercial": product.observacao || "Consultar detalhes com a ScannerTec"
  };
}

const sourceProducts = rawProducts as RawProduct[];

export const seedProducts: Product[] = sourceProducts.map((product, index) => {
  const category = mapCategory(product.categoria, product);
  const brand = inferBrand(product);
  const price = product.preco_vista ?? product.preco_parcelado ?? null;
  const paymentInfo = product.condicao_pagamento || product.preco_texto || "Consulte condições";
  const stockStatus =
    product.preco_texto === "Consulte"
      ? "Consulte"
      : product.condicao_pagamento || "Consultar disponibilidade";
  const imageUrl = resolveProductImage(product);

  return {
    id: product.slug,
    name: product.nome,
    slug: product.slug,
    category,
    brand,
    description: buildDescription(product),
    detail: buildDetail(product, brand, paymentInfo, stockStatus),
    price,
    oldPrice: null,
    imageUrl,
    images: [imageUrl],
    active: true,
    featured: featuredSlugs.has(product.slug) || index < 12,
    mostViewed: featuredSlugs.has(product.slug) || index < 8,
    stockStatus,
    paymentInfo,
    useTags: inferUseTags(product),
    specs: buildSpecs(product, brand, paymentInfo)
  };
});
