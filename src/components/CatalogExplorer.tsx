"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import ContactModal from "@/components/ContactModal";
import ProductCard from "@/components/ProductCard";
import QuoteCartDrawer from "@/components/QuoteCartDrawer";
import StoreHeader from "@/components/StoreHeader";
import {
  catalogPriceRanges,
  categoryFilterLabels,
  storefrontCategoryOptions
} from "@/features/catalog/config";
import { useCheckoutFlow } from "@/hooks/useCheckoutFlow";
import { useQuoteCart } from "@/hooks/useQuoteCart";
import {
  formatTagLabel,
  matchesProductUse,
  productBrand,
  productTags,
  quickUseLinks,
  whatsappCtaLabel,
  whatsappDisplayNumber
} from "@/lib/catalog";
import { whatsappDirectUrl } from "@/lib/whatsapp";
import type { Product, ProductCategory } from "@/types/product";

const categoryLabels = categoryFilterLabels;
const categoryOptions = storefrontCategoryOptions;
const priceRanges = catalogPriceRanges;

const categoryCommercialContent: Record<
  ProductCategory | "todos",
  {
    heading: string;
    summary: string;
    highlights: Array<{ icon: string; title: string; text: string }>;
  }
> = {
  todos: {
    heading: "Vitrine completa para oficinas, auto centers e reparadores",
    summary:
      "Navegue por scanners, máquinas, manômetros e equipamentos com filtros rápidos para comparar as opções certas e montar o pedido com mais segurança.",
    highlights: [
      {
        icon: "fa-solid fa-layer-group",
        title: "Linhas organizadas",
        text: "Categorias pensadas para facilitar busca, comparação e envio da lista."
      },
      {
        icon: "fa-solid fa-headset",
        title: "Atendimento consultivo",
        text: "A equipe ajuda a validar a aplicação antes de fechar o orçamento."
      },
      {
        icon: "fa-solid fa-boxes-stacked",
        title: "Mix profissional",
        text: "Produtos para diagnóstico, testes, estrutura de oficina e apoio técnico."
      }
    ]
  },
  scanners: {
    heading: "Scanners para diagnóstico automotivo com escolha mais segura",
    summary:
      "Linha voltada para oficinas que precisam de leitura de falhas, testes, recalibrações e cobertura técnica para diferentes rotinas de diagnóstico.",
    highlights: [
      {
        icon: "fa-solid fa-microchip",
        title: "Diagnóstico rápido",
        text: "Equipamentos voltados para leitura, análise e produtividade no atendimento."
      },
      {
        icon: "fa-solid fa-car-side",
        title: "Aplicações variadas",
        text: "Opções para linha leve, usos específicos e cenários de oficina."
      },
      {
        icon: "fa-solid fa-comments",
        title: "Escolha orientada",
        text: "Compare modelos e confirme com a equipe a melhor opção para sua rotina."
      }
    ]
  },
  maquinas: {
    heading: "Máquinas para oficina com foco em produtividade e serviço",
    summary:
      "Seleção para limpeza, fluidos, testes e rotinas técnicas que pedem equipamento confiável e fácil de aplicar no dia a dia da oficina.",
    highlights: [
      {
        icon: "fa-solid fa-gears",
        title: "Rotina operacional",
        text: "Máquinas voltadas para acelerar processos e ampliar capacidade de serviço."
      },
      {
        icon: "fa-solid fa-screwdriver-wrench",
        title: "Uso profissional",
        text: "Soluções pensadas para oficina, reparador e auto center."
      },
      {
        icon: "fa-solid fa-truck-fast",
        title: "Negociação direta",
        text: "Avalie disponibilidade, entrega e retirada conforme a necessidade."
      }
    ]
  },
  manometros: {
    heading: "Manômetros e testes para medições técnicas mais confiáveis",
    summary:
      "Ferramentas e kits para pressão, compressão e validações técnicas, ideais para oficinas que precisam de medições mais precisas.",
    highlights: [
      {
        icon: "fa-solid fa-gauge-high",
        title: "Medição técnica",
        text: "Produtos voltados para checagens, testes e validações de sistema."
      },
      {
        icon: "fa-solid fa-sliders",
        title: "Comparação simples",
        text: "Filtre por aplicação, marca e faixa de preço para ganhar velocidade."
      },
      {
        icon: "fa-solid fa-circle-check",
        title: "Compra mais segura",
        text: "Confirme a compatibilidade com atendimento consultivo antes de seguir."
      }
    ]
  },
  equipamentos: {
    heading: "Equipamentos para estrutura e ganho de performance na oficina",
    summary:
      "Linha de apoio para elevar operação, atendimento e capacidade técnica com itens voltados para estrutura e produtividade do negócio.",
    highlights: [
      {
        icon: "fa-solid fa-warehouse",
        title: "Estrutura de oficina",
        text: "Produtos para apoiar montagem, operação e expansão do serviço."
      },
      {
        icon: "fa-solid fa-handshake",
        title: "Escolha comercial",
        text: "Avalie o que encaixa melhor no momento da oficina ou auto center."
      },
      {
        icon: "fa-solid fa-arrow-up-right-dots",
        title: "Investimento certo",
        text: "Compare condições e priorize o equipamento com mais impacto na rotina."
      }
    ]
  }
};

type Props = {
  initialCategory?: ProductCategory | "todos";
  introParagraphs?: string[];
  initialQuery?: string;
  initialUse?: string;
  products: Product[];
};

export default function CatalogExplorer({
  initialCategory = "todos",
  introParagraphs = [],
  initialQuery = "",
  initialUse = "todos",
  products
}: Props) {
  return (
    <CatalogExplorerContent
      key={`${initialCategory}:${initialQuery}:${initialUse || "todos"}`}
      initialCategory={initialCategory}
      introParagraphs={introParagraphs}
      initialQuery={initialQuery}
      initialUse={initialUse}
      products={products}
    />
  );
}

function CatalogExplorerContent({
  initialCategory = "todos",
  introParagraphs = [],
  initialQuery = "",
  initialUse = "todos",
  products
}: Props) {
  const [query, setQuery] = useState(initialQuery);
  const [category, setCategory] = useState<ProductCategory | "todos">(initialCategory);
  const [priceRange, setPriceRange] = useState("todos");
  const [brand, setBrand] = useState("todos");
  const [useFilter, setUseFilter] = useState(initialUse || "todos");
  const [contactOpen, setContactOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [openMobileGroup, setOpenMobileGroup] = useState("");
  const { addToCart, cart, removeFromCart, total, totalItems } = useQuoteCart();
  const { checkout, checkoutError, isCheckingOut, resetCheckoutError } = useCheckoutFlow(
    cart.map((item) => ({ id: item.id, quantity: item.quantity }))
  );

  const brands = useMemo(
    () => Array.from(new Set(products.map(productBrand))).sort((a, b) => a.localeCompare(b)),
    [products]
  );

  const useOptions = useMemo(
    () => Array.from(new Set(products.flatMap(productTags))).sort((a, b) => a.localeCompare(b)),
    [products]
  );

  const visibleProducts = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const range = priceRanges.find((item) => item.value === priceRange) || priceRanges[0];

    return products.filter((product) => {
      const matchesQuery =
        !normalizedQuery ||
        `${product.name} ${product.description} ${product.stockStatus} ${productBrand(product)} ${productTags(product).join(" ")}`
          .toLowerCase()
          .includes(normalizedQuery);
      const matchesCategory = category === "todos" || product.category === category;
      const matchesBrand = brand === "todos" || productBrand(product) === brand;
      const matchesUse = useFilter === "todos" || matchesProductUse(product, useFilter);
      const matchesPrice =
        range.value === "consulta"
          ? product.price === null
          : product.price !== null && product.price >= range.min && product.price <= range.max;

      return matchesQuery && matchesCategory && matchesBrand && matchesUse && matchesPrice;
    });
  }, [brand, category, priceRange, products, query, useFilter]);

  const hasActiveFilters =
    Boolean(query.trim()) ||
    category !== initialCategory ||
    priceRange !== "todos" ||
    brand !== "todos" ||
    useFilter !== "todos";

  const currentUseLabel =
    useFilter === "todos"
      ? "Todos os usos"
      : quickUseLinks.find((item) => item.use === useFilter)?.label || formatTagLabel(useFilter);

  const spotlightBrands = useMemo(
    () =>
      Array.from(new Set(visibleProducts.map((product) => productBrand(product))))
        .filter(Boolean)
        .slice(0, 6),
    [visibleProducts]
  );

  const spotlightUses = useMemo(
    () =>
      Array.from(new Set(visibleProducts.flatMap(productTags)))
        .filter(Boolean)
        .slice(0, 6),
    [visibleProducts]
  );

  const pageTitle = initialQuery ? `Busca por "${initialQuery}"` : categoryLabels[initialCategory];
  const pageCopy = initialQuery
    ? "Veja os resultados mais próximos do que você procurou, compare opções e monte sua lista para atendimento rápido."
    : "Filtre por categoria, aplicação, marca e faixa de preço para encontrar o equipamento certo para a rotina da oficina.";

  const commercialContent = initialQuery
    ? categoryCommercialContent.todos
    : categoryCommercialContent[initialCategory];

  function clearFilters() {
    setQuery("");
    setCategory(initialCategory);
    setPriceRange("todos");
    setBrand("todos");
    setUseFilter("todos");
    setMobileFiltersOpen(false);
  }

  function handlePrimaryAction(product: Product) {
    resetCheckoutError();
    addToCart(product);
    setCartOpen(true);
  }

  return (
    <main className="catalog-page">
      <StoreHeader
        aboutHref="/sobre"
        cartItems={totalItems}
        catalogActive={category === "todos"}
        mobileMenuOpen={mobileMenuOpen}
        onContactClick={() => setContactOpen(true)}
        onOpenCart={() => setCartOpen(true)}
        onSearchChange={setQuery}
        onSearchSubmit={() => {
          const trimmedQuery = query.trim();
          window.location.href = trimmedQuery ? `/buscar?q=${encodeURIComponent(trimmedQuery)}` : "/buscar";
        }}
        onToggleMobileGroup={(group) => setOpenMobileGroup((current) => (current === group ? "" : group))}
        onToggleMobileMenu={() => setMobileMenuOpen((current) => !current)}
        openMobileGroup={openMobileGroup}
        searchValue={query}
        selectedCategory={category === "todos" ? null : category}
      />

      <section className="catalog-page-title">
        <div className="catalog-page-title-copy">
          <p className="eyebrow">Catálogo ScannerTec</p>
          <h1>{pageTitle}</h1>
          <p className="catalog-title-copy">{pageCopy}</p>
          {introParagraphs.map((paragraph) => (
            <p className="catalog-title-copy" key={paragraph}>
              {paragraph}
            </p>
          ))}
        </div>
        <span>{visibleProducts.length} produto(s)</span>
      </section>

      <section className="catalog-quick-panel" aria-label="Filtros rápidos">
        <div className="catalog-quick-heading">
          <div>
            <strong>Aplicação rápida</strong>
            <span>{currentUseLabel}</span>
          </div>
          <div className="catalog-quick-actions">
            {hasActiveFilters ? (
              <button type="button" onClick={clearFilters}>
                Limpar filtros
              </button>
            ) : null}
            <Link href="/buscar">Ver catálogo completo</Link>
          </div>
        </div>
        <div className="filter-chips catalog-use-chips">
          <button
            className={useFilter === "todos" ? "active" : ""}
            type="button"
            onClick={() => setUseFilter("todos")}
          >
            Todos os usos
          </button>
          {quickUseLinks.map((item) => (
            <button
              className={useFilter === item.use ? "active" : ""}
              key={item.use}
              type="button"
              onClick={() => setUseFilter(item.use)}
            >
              {item.label}
            </button>
          ))}
        </div>
      </section>

      <section className="catalog-page-layout">
        <aside className={`catalog-sidebar ${mobileFiltersOpen ? "open" : ""}`}>
          <div className="catalog-sidebar-title">
            <strong>Refinar catálogo</strong>
            <span>{categoryLabels[category]}</span>
          </div>

          <label>
            Categoria
            <select value={category} onChange={(event) => setCategory(event.target.value as ProductCategory | "todos")}>
              {categoryOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label>
            Marca
            <select value={brand} onChange={(event) => setBrand(event.target.value)}>
              <option value="todos">Todas</option>
              {brands.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>

          <label>
            Uso
            <select value={useFilter} onChange={(event) => setUseFilter(event.target.value)}>
              <option value="todos">Todos</option>
              {useOptions.map((item) => (
                <option key={item} value={item}>
                  {formatTagLabel(item)}
                </option>
              ))}
            </select>
          </label>

          <label>
            Preço
            <select value={priceRange} onChange={(event) => setPriceRange(event.target.value)}>
              {priceRanges.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>

          <div className="catalog-sidebar-note">
            <strong>Lista ativa</strong>
            <span>{totalItems} item(ns) na sua seleção. Adicione os produtos e envie tudo em um único pedido.</span>
          </div>

          <div className="catalog-sidebar-support">
            <strong>{initialQuery ? "Busca orientada" : "Seleção comercial"}</strong>
            <p>{commercialContent.summary}</p>

            {spotlightBrands.length ? (
              <div className="catalog-commercial-tags">
                <span>Marcas em destaque</span>
                <div className="product-page-meta">
                  {spotlightBrands.map((item) => (
                    <span key={item}>{item}</span>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </aside>

        <div className="catalog-results">
          <div className="catalog-results-head">
            <div>
              <strong>{visibleProducts.length} produtos encontrados</strong>
              <span>
                {hasActiveFilters
                  ? "Filtros ativos para refinar a vitrine comercial"
                  : "Seleção principal pronta para comparação e envio pelo WhatsApp"}
              </span>
            </div>

            <div className="catalog-results-head-actions">
              <button
                className="catalog-mobile-filter-button"
                type="button"
                onClick={() => setMobileFiltersOpen((current) => !current)}
              >
                {mobileFiltersOpen ? "Fechar filtros" : "Filtrar catálogo"}
              </button>
              <a href={whatsappDirectUrl()} target="_blank" rel="noopener noreferrer">
                {whatsappCtaLabel()}
              </a>
            </div>
          </div>

          <div
            className={[
              "catalog-results-grid",
              visibleProducts.length > 0 && visibleProducts.length <= 3
                ? `results-count-${visibleProducts.length}`
                : ""
            ]
              .filter(Boolean)
              .join(" ")}
          >
            {visibleProducts.map((product) => (
              <ProductCard compact key={product.id} product={product} onPrimaryAction={handlePrimaryAction} />
            ))}

            {!visibleProducts.length ? (
              <div className="empty-results">
                <strong>Nenhum produto encontrado.</strong>
                <span>Tente outro termo, marca, uso ou faixa de preço.</span>
                <a className="btn btn-primary" href={whatsappDirectUrl()} target="_blank" rel="noopener noreferrer">
                  <i className="fa-brands fa-whatsapp" aria-hidden="true"></i>
                  {whatsappCtaLabel()}
                </a>
              </div>
            ) : null}
          </div>
        </div>
      </section>

      <section className="catalog-commercial-strip" aria-label="Apoio comercial da categoria">
        <div className="catalog-commercial-strip-copy">
          <strong>{commercialContent.heading}</strong>
          <p>{commercialContent.summary}</p>
          {spotlightUses.length ? (
            <div className="catalog-commercial-tags">
              <span>Aplicações mais buscadas</span>
              <div className="product-page-meta">
                {spotlightUses.map((item) => (
                  <span key={item}>{formatTagLabel(item)}</span>
                ))}
              </div>
            </div>
          ) : null}
        </div>

        <div className="catalog-commercial-highlights">
          {commercialContent.highlights.map((highlight) => (
            <article className="catalog-commercial-card" key={highlight.title}>
              <i className={highlight.icon} aria-hidden="true"></i>
              <strong>{highlight.title}</strong>
              <p>{highlight.text}</p>
            </article>
          ))}
        </div>
      </section>

      <div className="catalog-page-footer">
        <a href={whatsappDirectUrl()} target="_blank" rel="noopener noreferrer">
          WhatsApp: {whatsappDisplayNumber}
        </a>
      </div>

      <QuoteCartDrawer
        cart={cart}
        error={checkoutError}
        isCheckingOut={isCheckingOut}
        onCheckout={checkout}
        onClose={() => setCartOpen(false)}
        onRemove={removeFromCart}
        open={cartOpen}
        total={total}
      />

      <ContactModal onClose={() => setContactOpen(false)} open={contactOpen} />
    </main>
  );
}
