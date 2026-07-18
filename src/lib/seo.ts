import type { Metadata } from "next";
import {
  businessCity,
  businessPostalCode,
  businessPriceRange,
  businessStreetAddress,
  formatCategoryLabel,
  productionUrl,
  shareLogoUrl,
  transparentLogoUrl,
  whatsappDisplayNumber,
  whatsappIntlNumber,
  youtubeUrl
} from "@/lib/catalog";
import {
  getProductCommercialSummary,
  getProductDisplayName,
  getProductImageAlt,
  getProductPriceOrCondition,
  isDescriptionDuplicated
} from "@/lib/product-content";
import type { Product, ProductCategory } from "@/types/product";

type BreadcrumbItem = {
  name: string;
  url: string;
};

const baseUrl = process.env.PUBLIC_BASE_URL || productionUrl;

const defaultKeywords = [
  "scanner automotivo",
  "equipamentos automotivos",
  "diagnóstico automotivo",
  "scanner para oficina",
  "máquinas automotivas",
  "manômetros automotivos",
  "equipamentos para oficina",
  "ScannerTec",
  businessCity
];

export const categorySeoCopy: Record<ProductCategory, { title: string; description: string; intro: string[] }> = {
  scanners: {
    title: "Scanners automotivos",
    description:
      "Scanners automotivos profissionais para diagnóstico, leitura e programação com atendimento consultivo em São José do Rio Preto.",
    intro: [
      "A categoria de scanners da ScannerTec reúne equipamentos para diagnóstico automotivo, leitura de falhas, testes avançados e rotinas de oficina com mais agilidade.",
      "Aqui você encontra soluções para linha leve, aplicações especiais e atualizações, com apoio consultivo para escolher o scanner certo para a realidade da oficina.",
      "Se você busca scanner automotivo em São José do Rio Preto, esta vitrine concentra opções profissionais com orientação de compra e atendimento direto pelo WhatsApp."
    ]
  },
  maquinas: {
    title: "Máquinas automotivas",
    description:
      "Máquinas para limpeza, testes e serviços de oficina com atendimento consultivo e seleção profissional pela ScannerTec.",
    intro: [
      "A linha de máquinas automotivas da ScannerTec foi organizada para oficinas que precisam elevar produtividade em serviços de limpeza, fluidos, testes e processos técnicos.",
      "São equipamentos voltados para uso profissional, com foco em operação prática, durabilidade e suporte comercial antes da compra.",
      "Se a sua oficina procura máquinas automotivas em São José do Rio Preto, esta categoria facilita a comparação entre soluções e a solicitação rápida de orçamento."
    ]
  },
  manometros: {
    title: "Manômetros e testes automotivos",
    description:
      "Manômetros e kits de teste para pressão, compressão e medições técnicas com suporte da ScannerTec em São José do Rio Preto.",
    intro: [
      "Nesta categoria estão os manômetros e equipamentos de teste usados para medições técnicas em diagnóstico automotivo, como pressão, compressão e validações de sistema.",
      "A ScannerTec organiza essa vitrine para facilitar a escolha de ferramentas mais adequadas para oficinas, reparadores e auto centers que trabalham com análise precisa.",
      "Para quem busca manômetros automotivos em São José do Rio Preto, esta página concentra opções profissionais com apoio consultivo para compra."
    ]
  },
  equipamentos: {
    title: "Equipamentos para oficina",
    description:
      "Equipamentos automotivos profissionais para oficina, auto center e reparação com atendimento consultivo da ScannerTec.",
    intro: [
      "A categoria de equipamentos reúne soluções complementares para oficina, como elevadores, ferramentas, estruturas de apoio e itens voltados à rotina operacional do reparador.",
      "A proposta da ScannerTec é ajudar na escolha de equipamentos com melhor encaixe para o perfil de serviço da oficina, auto center ou centro de diagnóstico.",
      "Se você procura equipamentos automotivos em São José do Rio Preto, esta vitrine foi montada para facilitar comparação, avaliação e solicitação de orçamento."
    ]
  }
};

export function absoluteUrl(pathname = "/") {
  return pathname.startsWith("http") ? pathname : `${baseUrl}${pathname}`;
}

export function buildCanonicalMetadata(pathname: string) {
  return {
    alternates: {
      canonical: absoluteUrl(pathname)
    }
  } satisfies Partial<Metadata>;
}

export function shouldIndexProduct(product: Product) {
  return !isDescriptionDuplicated(product.name, product.description);
}

export function buildBreadcrumbSchema(items: BreadcrumbItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.url)
    }))
  };
}

export function buildOrganizationSchema() {
  const imageUrl = absoluteUrl(transparentLogoUrl);

  return {
    "@context": "https://schema.org",
    "@type": "AutoPartsStore",
    name: "ScannerTec",
    url: absoluteUrl("/"),
    logo: shareLogoUrl,
    image: [imageUrl, shareLogoUrl],
    description:
      "ScannerTec em São José do Rio Preto com scanners automotivos, máquinas, manômetros e equipamentos para oficinas.",
    telephone: whatsappIntlNumber,
    priceRange: businessPriceRange,
    address: {
      "@type": "PostalAddress",
      streetAddress: businessStreetAddress,
      addressLocality: "São José do Rio Preto",
      addressRegion: "SP",
      postalCode: businessPostalCode || undefined,
      addressCountry: "BR"
    },
    areaServed: businessCity,
    openingHours: "Mo-Fr 08:00-18:00",
    sameAs: [youtubeUrl],
    contactPoint: [
      {
        "@type": "ContactPoint",
        contactType: "sales",
        telephone: whatsappIntlNumber,
        areaServed: "BR",
        availableLanguage: ["pt-BR"]
      }
    ]
  };
}

export function buildWebsiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "ScannerTec",
    url: absoluteUrl("/"),
    potentialAction: {
      "@type": "SearchAction",
      target: `${absoluteUrl("/buscar")}?q={search_term_string}`,
      "query-input": "required name=search_term_string"
    }
  };
}

export function buildProductSchema(product: Product) {
  const image = product.imageUrl.startsWith("http") ? product.imageUrl : absoluteUrl(product.imageUrl);

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: getProductDisplayName(product),
    image: [image],
    description: getProductCommercialSummary(product),
    sku: product.sku || product.id,
    brand: {
      "@type": "Brand",
      name: product.brand || "ScannerTec"
    },
    category: formatCategoryLabel(product.category),
    additionalProperty: [
      {
        "@type": "PropertyValue",
        name: "Condição comercial",
        value: getProductPriceOrCondition(product)
      },
      {
        "@type": "PropertyValue",
        name: "Texto alternativo da imagem",
        value: getProductImageAlt(product)
      }
    ],
    ...(product.price !== null
      ? {
          offers: {
            "@type": "Offer",
            price: product.price,
            priceCurrency: "BRL",
            availability: "https://schema.org/InStock",
            url: absoluteUrl(`/produto/${product.slug}`)
          }
        }
      : {})
  };
}

export function buildHomeMetadataLegacy(): Metadata {
  const title = "Scanner automotivo e equipamentos para oficina em São José do Rio Preto | ScannerTec";
  const description =
    "ScannerTec em São José do Rio Preto com scanners automotivos, máquinas, manômetros e equipamentos para oficina com atendimento consultivo, lista inteligente e contato comercial rápido.";

  return {
    title,
    description,
    keywords: defaultKeywords,
    alternates: {
      canonical: absoluteUrl("/")
    },
    openGraph: {
      title,
      description,
      url: absoluteUrl("/"),
      siteName: "ScannerTec",
      locale: "pt_BR",
      images: [shareLogoUrl]
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [shareLogoUrl]
    }
  };
}

export function buildHomeMetadata(): Metadata {
  const title = "ScannerTec | Scanner automotivo, máquinas e equipamentos para oficina";
  const description =
    "Scanners automotivos, máquinas, manômetros e equipamentos para oficina em São José do Rio Preto. Atendimento consultivo e orçamento rápido pelo WhatsApp.";

  return {
    title,
    description,
    keywords: defaultKeywords,
    alternates: {
      canonical: absoluteUrl("/")
    },
    openGraph: {
      title,
      description,
      url: absoluteUrl("/"),
      siteName: "ScannerTec",
      locale: "pt_BR",
      images: [shareLogoUrl]
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [shareLogoUrl]
    }
  };
}

export function buildCategoryMetadata(category: ProductCategory): Metadata {
  const categoryInfo = categorySeoCopy[category];
  const title = `${categoryInfo.title} em ${businessCity} | ScannerTec`;

  return {
    title,
    description: categoryInfo.description,
    keywords: [...defaultKeywords, categoryInfo.title],
    alternates: {
      canonical: absoluteUrl(`/categoria/${category}`)
    },
    openGraph: {
      title,
      description: categoryInfo.description,
      url: absoluteUrl(`/categoria/${category}`),
      siteName: "ScannerTec",
      locale: "pt_BR",
      images: [shareLogoUrl]
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: categoryInfo.description,
      images: [shareLogoUrl]
    }
  };
}

export function buildProductMetadata(product: Product): Metadata {
  const title = `${getProductDisplayName(product)} | ScannerTec ${businessCity}`;
  const description = getProductCommercialSummary(product);
  const image = product.imageUrl.startsWith("http") ? product.imageUrl : absoluteUrl(product.imageUrl);
  const shouldIndex = shouldIndexProduct(product);

  return {
    title,
    description,
    keywords: [
      ...defaultKeywords,
      getProductDisplayName(product),
      formatCategoryLabel(product.category),
      product.brand || "ScannerTec"
    ],
    alternates: {
      canonical: absoluteUrl(`/produto/${product.slug}`)
    },
    robots: shouldIndex
      ? undefined
      : {
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
      url: absoluteUrl(`/produto/${product.slug}`),
      siteName: "ScannerTec",
      locale: "pt_BR",
      images: [image]
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image]
    }
  };
}

export function buildAboutMetadata(): Metadata {
  const title = `Sobre a ScannerTec | Equipamentos automotivos em ${businessCity}`;
  const description =
    "Conheça a ScannerTec, empresa de scanners automotivos, máquinas, manômetros e equipamentos para oficina em São José do Rio Preto.";

  return {
    title,
    description,
    keywords: [...defaultKeywords, "sobre a ScannerTec"],
    alternates: {
      canonical: absoluteUrl("/sobre")
    },
    openGraph: {
      title,
      description,
      url: absoluteUrl("/sobre"),
      siteName: "ScannerTec",
      locale: "pt_BR",
      images: [shareLogoUrl]
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [shareLogoUrl]
    }
  };
}
