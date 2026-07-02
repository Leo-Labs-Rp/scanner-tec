"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import ContactModal from "@/components/ContactModal";
import ProductCard from "@/components/ProductCard";
import QuoteCartDrawer from "@/components/QuoteCartDrawer";
import { CartIcon, ContactIcon, YoutubeIcon } from "@/components/SiteIcons";
import { useQuoteCart } from "@/hooks/useQuoteCart";
import {
  businessCity,
  formatTagLabel,
  matchesProductUse,
  menuGroups,
  productCategories,
  productBrand,
  productTags,
  quickUseLinks,
  transparentLogoUrl,
  whatsappDisplayNumber,
  youtubeUrl
} from "@/lib/catalog";
import { whatsappDirectUrl } from "@/lib/whatsapp";
import type { Product, ProductCategory } from "@/types/product";

const categoryLabels = {
  todos: "Todos os produtos",
  ...Object.fromEntries(productCategories.map((category) => [category.value, category.label]))
} as Record<ProductCategory | "todos", string>;

const categoryOptions: Array<{ label: string; value: ProductCategory | "todos" }> = [
  { label: "Todos os produtos", value: "todos" },
  ...productCategories.map((category) => ({ label: category.label, value: category.value }))
];

const priceRanges = [
  { label: "Todos os preços", value: "todos", min: 0, max: Infinity },
  { label: "Até R$ 1.000", value: "ate-1000", min: 0, max: 1000 },
  { label: "R$ 1.000 a R$ 5.000", value: "1000-5000", min: 1000, max: 5000 },
  { label: "Acima de R$ 5.000", value: "acima-5000", min: 5000, max: Infinity },
  { label: "Sob consulta", value: "consulta", min: 0, max: 0 }
];

type Props = {
  initialCategory?: ProductCategory | "todos";
  initialQuery?: string;
  initialUse?: string;
  products: Product[];
};

export default function CatalogExplorer({
  initialCategory = "todos",
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
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [checkoutError, setCheckoutError] = useState("");
  const { addToCart, cart, removeFromCart, total, totalItems } = useQuoteCart();

  const brands = useMemo(() => {
    return Array.from(new Set(products.map(productBrand))).sort((a, b) => a.localeCompare(b));
  }, [products]);

  const useOptions = useMemo(() => {
    return Array.from(new Set(products.flatMap(productTags))).sort((a, b) => a.localeCompare(b));
  }, [products]);

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

  function clearFilters() {
    setQuery("");
    setCategory(initialCategory);
    setPriceRange("todos");
    setBrand("todos");
    setUseFilter("todos");
    setMobileFiltersOpen(false);
  }

  function handlePrimaryAction(product: Product) {
    setCheckoutError("");
    addToCart(product);
    setCartOpen(true);
  }

  async function checkout() {
    setCheckoutError("");
    setIsCheckingOut(true);

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: cart.map((item) => ({ id: item.id, quantity: item.quantity }))
        })
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Não foi possível finalizar a solicitação.");
      }

      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
        return;
      }

      if (data.whatsappUrl) {
        window.open(data.whatsappUrl, "_blank", "noopener,noreferrer");
        return;
      }

      throw new Error("Não foi possível iniciar o próximo passo da solicitação.");
    } catch (error) {
      setCheckoutError(
        error instanceof Error ? error.message : "Não foi possível finalizar a solicitação."
      );
    } finally {
      setIsCheckingOut(false);
    }
  }

  return (
    <main className="catalog-page">
      <div className="info-bar">
        <div>
          <span className="info-location">{businessCity} · Atendimento: 08h às 18h</span>
          <a href={whatsappDirectUrl()} target="_blank" rel="noopener noreferrer">
            WhatsApp: {whatsappDisplayNumber}
          </a>
        </div>
      </div>

      <nav className="store-header" aria-label="Navegação principal">
        <div className="store-header-main">
          <Link className="brand store-brand" href="/">
            <span className="brand-logo-wordmark">
              <img src={transparentLogoUrl} alt="ScannerTec Equipamentos Automotivos" />
            </span>
          </Link>

          <form
            className="header-search"
            onSubmit={(event) => {
              event.preventDefault();
              const trimmedQuery = query.trim();
              window.location.href = trimmedQuery ? `/buscar?q=${encodeURIComponent(trimmedQuery)}` : "/buscar";
            }}
          >
            <span>Buscar produtos</span>
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Digite o que você procura"
            />
            <button type="submit">Buscar</button>
          </form>

          <div className="header-actions">
            <button type="button" onClick={() => setContactOpen(true)} aria-label="Fale conosco">
              <span className="action-icon" aria-hidden="true">
                <ContactIcon />
              </span>
            </button>
            <button
              type="button"
              onClick={() => setCartOpen(true)}
              aria-label={`Abrir lista de orçamento com ${totalItems} itens`}
            >
              <span className="action-icon" aria-hidden="true">
                <CartIcon />
              </span>
              <strong>{totalItems}</strong>
            </button>
            <a href={youtubeUrl} target="_blank" rel="noopener noreferrer" aria-label="Demonstrações no YouTube">
              <span className="action-icon youtube" aria-hidden="true">
                <YoutubeIcon />
              </span>
            </a>
            <button
              className="menu-toggle"
              type="button"
              onClick={() => setMobileMenuOpen((current) => !current)}
              aria-label="Abrir menu"
            >
              <span></span>
              <span></span>
              <span></span>
            </button>
          </div>
        </div>

        <p className="header-cart-hint">
          Monte sua lista e envie tudo de uma vez pelo WhatsApp.
        </p>

        <div className={`category-nav ${mobileMenuOpen ? "open" : ""}`} aria-label="Categorias">
          <Link className={category === "todos" ? "active" : ""} href="/buscar">
            Catálogo
          </Link>
          {menuGroups.map((group) => (
            <div className="nav-group" key={group.label}>
              <Link className={category === group.category ? "active" : ""} href={group.href}>
                {group.label}
              </Link>
              <button
                className={category === group.category ? "active" : ""}
                type="button"
                onClick={() => setOpenMobileGroup((current) => (current === group.label ? "" : group.label))}
                aria-label={`Abrir subcategorias de ${group.label}`}
              >
                {group.label}
              </button>
              <div className={`dropdown-menu ${openMobileGroup === group.label ? "open" : ""}`}>
                <Link href={group.href}>Ver todos em {group.label}</Link>
                {group.items.map((item) => (
                  <Link href={`/buscar?uso=${encodeURIComponent(item.use)}`} key={item.use}>
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </nav>

      <section className="catalog-page-title">
        <div>
          <p className="eyebrow">Catálogo</p>
          <h1>{initialQuery ? `Busca por "${initialQuery}"` : categoryLabels[initialCategory]}</h1>
          <p className="catalog-title-copy">
            Compare produtos, filtre pela aplicação da oficina e envie a lista para atendimento pelo WhatsApp.
          </p>
        </div>
        <span>{visibleProducts.length} produto(s)</span>
      </section>

      <section className="catalog-quick-panel" aria-label="Filtros rápidos">
        <div className="catalog-quick-heading">
          <div>
            <strong>Aplicação rápida</strong>
            <span>{currentUseLabel}</span>
          </div>
          {hasActiveFilters ? (
            <button type="button" onClick={clearFilters}>
              Limpar filtros
            </button>
          ) : null}
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
            <span>
              {totalItems} item(ns) na sua seleção. Envie a lista pelo WhatsApp quando terminar.
            </span>
          </div>
        </aside>

        <div className="catalog-results">
          <div className="catalog-results-head">
            <div>
              <strong>{visibleProducts.length} produtos encontrados</strong>
              <span>{hasActiveFilters ? "Filtros aplicados ao catálogo" : "Mostrando o catálogo principal"}</span>
            </div>
            <button
              className="catalog-mobile-filter-button"
              type="button"
              onClick={() => setMobileFiltersOpen((current) => !current)}
            >
              {mobileFiltersOpen ? "Fechar filtros" : "Filtrar catálogo"}
            </button>
            <a href={whatsappDirectUrl()} target="_blank" rel="noopener noreferrer">
              Atendimento consultivo
            </a>
          </div>

          <div className="catalog-results-grid">
            {visibleProducts.map((product) => (
              <ProductCard
                compact
                key={product.id}
                product={product}
                onPrimaryAction={handlePrimaryAction}
              />
            ))}

            {!visibleProducts.length ? (
              <div className="empty-results">
                <strong>Nenhum produto encontrado.</strong>
                <span>Tente outro termo, marca, uso ou faixa de preço.</span>
                <a className="btn btn-primary" href={whatsappDirectUrl()} target="_blank" rel="noopener noreferrer">
                  <i className="fa-brands fa-whatsapp" aria-hidden="true"></i>
                  Pedir ajuda no WhatsApp
                </a>
              </div>
            ) : null}
          </div>
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
