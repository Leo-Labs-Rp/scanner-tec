"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState, type RefObject } from "react";
import ContactModal from "@/components/ContactModal";
import ProductCard from "@/components/ProductCard";
import QuoteCartDrawer from "@/components/QuoteCartDrawer";
import StoreHeader from "@/components/StoreHeader";
import { ChevronLeftIcon, ChevronRightIcon } from "@/components/SiteIcons";
import {
  catalogPriceRanges,
  storefrontAboutItems,
  storefrontAdvantages,
  storefrontCategoryOptions
} from "@/features/catalog/config";
import { useCheckoutFlow } from "@/hooks/useCheckoutFlow";
import { useQuoteCart } from "@/hooks/useQuoteCart";
import {
  aboutPageUrl,
  businessCity,
  businessHours,
  buildProductFloatingMessage,
  formatCategoryLabel,
  formatTagLabel,
  matchesProductUse,
  productCategories,
  productBrand,
  productTags,
  transparentLogoUrl,
  whatsappCtaLabel,
  whatsappDisplayNumber,
  youtubeUrl
} from "@/lib/catalog";
import { whatsappDirectUrl, whatsappUrl } from "@/lib/whatsapp";
import type { Product, ProductCategory } from "@/types/product";
import type { HomeBannerSettings } from "@/types/site-settings";

const categories = storefrontCategoryOptions;
const priceRanges = catalogPriceRanges;
const aboutItems = storefrontAboutItems;
const advantages = storefrontAdvantages;

type Props = {
  initialProducts: Product[];
  initialBannerSettings: HomeBannerSettings;
};

function advanceShelfCarousel(track: HTMLDivElement | null) {
  if (!track || track.clientWidth <= 0) return;

  const firstCard = track.querySelector<HTMLElement>(".shelf-card");
  if (!firstCard) return;

  const styles = window.getComputedStyle(track);
  const gap = Number.parseFloat(styles.columnGap || styles.gap || "0");
  const step = firstCard.getBoundingClientRect().width + (Number.isFinite(gap) ? gap : 0);
  const maxScroll = track.scrollWidth - track.clientWidth;

  if (maxScroll <= 1 || step <= 0) return;

  if (track.scrollLeft + step >= maxScroll - 4) {
    track.scrollTo({ left: 0, behavior: "smooth" });
    return;
  }

  track.scrollBy({ left: step, behavior: "smooth" });
}

export default function Storefront({ initialProducts, initialBannerSettings }: Props) {
  const [products] = useState(initialProducts);
  const [filter, setFilter] = useState<ProductCategory | "todos">("todos");
  const [search, setSearch] = useState("");
  const [priceRange, setPriceRange] = useState("todos");
  const [brandFilter, setBrandFilter] = useState("todos");
  const [tagFilter, setTagFilter] = useState("todos");
  const [contactOpen, setContactOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openMobileGroup, setOpenMobileGroup] = useState("");
  const [slideIndex, setSlideIndex] = useState(0);
  const [featuredCarouselPaused, setFeaturedCarouselPaused] = useState(false);
  const desktopFeaturedTrackRef = useRef<HTMLDivElement | null>(null);
  const mobileFeaturedTrackRef = useRef<HTMLDivElement | null>(null);
  const { addToCart, cart, removeFromCart, total, totalItems } = useQuoteCart();
  const { checkout, checkoutError, isCheckingOut, resetCheckoutError } = useCheckoutFlow(
    cart.map((item) => ({ id: item.id, quantity: item.quantity }))
  );

  const brandOptions = useMemo(
    () => Array.from(new Set(products.map(productBrand))).sort((a, b) => a.localeCompare(b)),
    [products]
  );

  const tagOptions = useMemo(
    () => Array.from(new Set(products.flatMap(productTags))).sort((a, b) => a.localeCompare(b)),
    [products]
  );

  const visibleProducts = useMemo(() => {
    const selectedRange = priceRanges.find((range) => range.value === priceRange) || priceRanges[0];
    const normalizedSearch = search.trim().toLowerCase();

    return products.filter((product) => {
      const matchesCategory = filter === "todos" || product.category === filter;
      const matchesSearch =
        !normalizedSearch ||
        `${product.name} ${product.description} ${product.stockStatus} ${productBrand(product)} ${productTags(product).join(" ")}`
          .toLowerCase()
          .includes(normalizedSearch);
      const matchesBrand = brandFilter === "todos" || productBrand(product) === brandFilter;
      const matchesTag = tagFilter === "todos" || matchesProductUse(product, tagFilter);
      const matchesPrice =
        selectedRange.value === "consulta"
          ? product.price === null
          : product.price !== null &&
            product.price >= selectedRange.min &&
            product.price <= selectedRange.max;

      return matchesCategory && matchesSearch && matchesBrand && matchesTag && matchesPrice;
    });
  }, [brandFilter, filter, priceRange, products, search, tagFilter]);

  const featuredProducts = useMemo(() => {
    const featured = products.filter((product) => product.featured);
    return featured.length ? featured : products.slice(0, 8);
  }, [products]);

  const bannerSlides = useMemo(() => {
    return initialBannerSettings.slides
      .map((slide) => {
        const linkedProduct = slide.linkedProductSlug
          ? products.find((item) => item.slug === slide.linkedProductSlug) || null
          : null;
        const fallbackProduct = featuredProducts[0] || products[0] || null;
        const displayProduct = linkedProduct || fallbackProduct;

        return {
          ...slide,
          linkedProduct,
          imageUrl: slide.imageUrl || displayProduct?.imageUrl || ""
        };
      })
      .filter((slide) => Boolean(slide.imageUrl || slide.title || slide.description)) as Array<{
        id: string;
        eyebrow: string;
        title: string;
        description: string;
        imageUrl: string;
        linkedProductSlug: string;
        linkedProduct: Product | null;
      }>;
  }, [featuredProducts, initialBannerSettings.slides, products]);

  const activeSlideIndex = bannerSlides.length ? slideIndex % bannerSlides.length : 0;
  const currentSlide = bannerSlides[activeSlideIndex] || bannerSlides[0] || null;

  useEffect(() => {
    if (bannerSlides.length <= 1) return;

    const timer = window.setInterval(() => {
      setSlideIndex((current) => (current + 1) % bannerSlides.length);
    }, Math.max(1000, initialBannerSettings.rotationMs || 1000));

    return () => window.clearInterval(timer);
  }, [bannerSlides.length, initialBannerSettings.rotationMs]);

  useEffect(() => {
    if (featuredProducts.length <= 1 || featuredCarouselPaused) return;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (prefersReducedMotion.matches) return;

    const timer = window.setInterval(() => {
      advanceShelfCarousel(desktopFeaturedTrackRef.current);
      advanceShelfCarousel(mobileFeaturedTrackRef.current);
    }, 2000);

    return () => window.clearInterval(timer);
  }, [featuredCarouselPaused, featuredProducts.length]);

  function handlePrimaryAction(product: Product) {
    resetCheckoutError();
    addToCart(product);
    setCartOpen(true);
  }

  function nextSlide() {
    if (!bannerSlides.length) return;
    setSlideIndex((current) => (current + 1) % bannerSlides.length);
  }

  function previousSlide() {
    if (!bannerSlides.length) return;
    setSlideIndex((current) => (current - 1 + bannerSlides.length) % bannerSlides.length);
  }

  function renderProductShelf(
    title: string,
    subtitle: string,
    shelfProducts: Product[],
    className = "",
    trackRef?: RefObject<HTMLDivElement | null>
  ) {
    return (
      <section className={`product-shelf ${className}`.trim()} aria-label={title}>
        <div className="shelf-heading">
          <div>
            <p className="eyebrow">{subtitle}</p>
            <h2>{title}</h2>
          </div>
          <Link href="/buscar">Ver todos</Link>
        </div>
        <div
          className="shelf-carousel"
          onBlur={() => setFeaturedCarouselPaused(false)}
          onFocus={() => setFeaturedCarouselPaused(true)}
          onMouseEnter={() => setFeaturedCarouselPaused(true)}
          onMouseLeave={() => setFeaturedCarouselPaused(false)}
        >
          <div className="shelf-track product-carousel-track" ref={trackRef}>
            {shelfProducts.map((product) => (
              <div className="shelf-card" key={product.id}>
                <ProductCard compact product={product} onPrimaryAction={handlePrimaryAction} />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <>
      <header className="site-header">
        <StoreHeader
          aboutHref={aboutPageUrl}
          cartItems={totalItems}
          catalogHref="/buscar"
          catalogLabel="Catálogo"
          homeHref="#inicio"
          includeAboutLink
          mobileMenuOpen={mobileMenuOpen}
          onContactClick={() => setContactOpen(true)}
          onOpenCart={() => setCartOpen(true)}
          onSearchChange={setSearch}
          onSearchSubmit={() => {
            const trimmedSearch = search.trim();
            window.location.href = trimmedSearch ? `/buscar?q=${encodeURIComponent(trimmedSearch)}` : "/buscar";
          }}
          onToggleMobileGroup={(group) => setOpenMobileGroup((current) => (current === group ? "" : group))}
          onToggleMobileMenu={() => setMobileMenuOpen((current) => !current)}
          openMobileGroup={openMobileGroup}
          searchValue={search}
        />

        {currentSlide ? (
          <section
            className="banner-carousel"
            id="inicio"
            style={{
              backgroundImage: `linear-gradient(90deg, rgba(7, 9, 12, 0.94) 0%, rgba(7, 9, 12, 0.72) 46%, rgba(7, 9, 12, 0.28) 100%), url(${currentSlide.imageUrl})`
            }}
          >
            <div className="banner-content">
              <p className="eyebrow">
                {currentSlide.eyebrow ||
                  (currentSlide.linkedProduct
                    ? formatCategoryLabel(currentSlide.linkedProduct.category)
                    : "ScannerTec")}
              </p>
              <h1>
                {currentSlide.title || "Scanners e equipamentos automotivos para oficina com atendimento consultivo"}
              </h1>
              <p>
                {currentSlide.description ||
                  currentSlide.linkedProduct?.description ||
                  "Linha profissional de scanners, máquinas, manômetros e equipamentos para oficinas, auto centers e reparadores."}
              </p>
              {currentSlide.linkedProduct ? (
                <div className="banner-actions">
                  <Link className="btn btn-primary" href={`/produto/${currentSlide.linkedProduct.slug}`}>
                    Ver produto
                  </Link>
                  <a
                    className="btn btn-secondary"
                    href={whatsappUrl(buildProductFloatingMessage(currentSlide.linkedProduct))}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {whatsappCtaLabel()}
                  </a>
                </div>
              ) : (
                <div className="banner-actions">
                  <Link className="btn btn-primary" href="/buscar">
                    Ver catálogo
                  </Link>
                  <a className="btn btn-secondary" href={whatsappDirectUrl()} target="_blank" rel="noopener noreferrer">
                    {whatsappCtaLabel()}
                  </a>
                </div>
              )}
              <div className="banner-proof-strip" aria-label="Diferenciais comerciais">
                <span>Atendimento consultivo</span>
                <span>Envio ou retirada</span>
                <span>Suporte para escolha</span>
              </div>
            </div>
            {bannerSlides.length > 1 ? (
              <div className="banner-controls">
                <button type="button" onClick={previousSlide} aria-label="Banner anterior">
                  <ChevronLeftIcon />
                </button>
                <div className="banner-dots" aria-hidden="true">
                  {bannerSlides.map((slide, index) => (
                    <button
                      className={index === activeSlideIndex ? "active" : ""}
                      key={slide.id}
                      type="button"
                      onClick={() => setSlideIndex(index)}
                      aria-label={`Ir para banner ${index + 1}`}
                    ></button>
                  ))}
                </div>
                <button type="button" onClick={nextSlide} aria-label="Próximo banner">
                  <ChevronRightIcon />
                </button>
              </div>
            ) : null}
          </section>
        ) : null}
      </header>

      <main>
        <section className="mobile-home-shop" aria-label="Vitrine principal">
          <div className="mobile-home-head">
            <p className="eyebrow">Loja ScannerTec</p>
            <h2>Produtos em destaque</h2>
            <p>Comece pelos principais produtos da loja e abra o catálogo completo quando quiser refinar a busca.</p>
          </div>

          <div
            className="shelf-carousel mobile-home-carousel"
            onBlur={() => setFeaturedCarouselPaused(false)}
            onFocus={() => setFeaturedCarouselPaused(true)}
            onMouseEnter={() => setFeaturedCarouselPaused(true)}
            onMouseLeave={() => setFeaturedCarouselPaused(false)}
          >
            <div className="shelf-track mobile-home-track product-carousel-track" ref={mobileFeaturedTrackRef}>
              {featuredProducts.slice(0, 8).map((product) => (
                <div className="shelf-card" key={`mobile-${product.id}`}>
                  <ProductCard compact product={product} onPrimaryAction={handlePrimaryAction} />
                </div>
              ))}
            </div>
          </div>

          <Link className="btn btn-primary mobile-home-cta" href="/buscar">
            Ver catálogo completo
          </Link>
        </section>

        {renderProductShelf(
          "Produtos em destaque",
          "Destaques",
          featuredProducts.slice(0, 10),
          "desktop-home-shelf",
          desktopFeaturedTrackRef
        )}

        <section className="section" id="catalogo">
          <div className="catalog-header">
            <div>
              <p className="eyebrow">Catálogo</p>
              <h2>Encontre o equipamento ideal</h2>
              <p>
                Pesquise por nome, filtre por categoria ou faixa de preço e monte uma lista para atendimento direto com o vendedor.
              </p>
            </div>
          </div>

          <div className="catalog-tools" aria-label="Filtros do catálogo">
            <label>
              <span>Categoria</span>
              <select value={filter} onChange={(event) => setFilter(event.target.value as ProductCategory | "todos")}>
                {categories.map((category) => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span>Preço</span>
              <select value={priceRange} onChange={(event) => setPriceRange(event.target.value)}>
                {priceRanges.map((range) => (
                  <option key={range.value} value={range.value}>
                    {range.label}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span>Marca</span>
              <select value={brandFilter} onChange={(event) => setBrandFilter(event.target.value)}>
                <option value="todos">Todas as marcas</option>
                {brandOptions.map((brand) => (
                  <option key={brand} value={brand}>
                    {brand}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span>Uso</span>
              <select value={tagFilter} onChange={(event) => setTagFilter(event.target.value)}>
                <option value="todos">Todos os usos</option>
                {tagOptions.map((tag) => (
                  <option key={tag} value={tag}>
                    {formatTagLabel(tag)}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="catalog-meta">
            <strong>{visibleProducts.length}</strong>
            <span>produto(s) encontrado(s)</span>
            <small>Adicione os itens à lista e envie um único pedido pelo WhatsApp.</small>
          </div>

          <div className="catalog-grid">
            {visibleProducts.map((product) => (
              <ProductCard key={product.id} product={product} showDescription onPrimaryAction={handlePrimaryAction} />
            ))}
          </div>

          {!visibleProducts.length ? (
            <div className="empty-results">
              <strong>Nenhum produto encontrado.</strong>
              <span>Limpe a busca ou escolha outra faixa de preço.</span>
            </div>
          ) : null}
        </section>

        <section className="section about-section" id="sobre">
          <div className="about-copy">
            <p className="eyebrow">Sobre a ScannerTec</p>
            <h2>Especialistas em diagnóstico e equipamentos para oficinas.</h2>
            <p>
              A ScannerTec atua em São José do Rio Preto com uma linha completa de scanners automotivos, máquinas, manômetros e equipamentos para diagnóstico eletrônico. O atendimento é consultivo: a equipe ajuda o mecânico a escolher a solução certa para a rotina da oficina.
            </p>
            <div className="about-actions">
              <Link className="btn btn-primary" href="/buscar">
                Ver catálogo
              </Link>
              <a className="btn btn-secondary" href={youtubeUrl} target="_blank" rel="noopener noreferrer">
                Ver demonstrações
              </a>
            </div>
          </div>
          <div className="about-card">
            <img src={transparentLogoUrl} alt="ScannerTec Equipamentos Automotivos" />
            <ul>
              {aboutItems.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <div className="about-card-meta">
              <span>
                <strong>Atendimento</strong>
                {businessHours}
              </span>
              <span>
                <strong>Base comercial</strong>
                {businessCity}
              </span>
            </div>
          </div>
        </section>

        <section className="section advantages-section" aria-label="Nossas vantagens">
          <div className="section-title-center">
            <h2>Nossas vantagens</h2>
            <p>Um atendimento pensado para oficina, auto center e reparador.</p>
          </div>
          <div className="advantages-grid">
            {advantages.map((item) => (
              <article key={item.title}>
                <span className="advantage-icon" aria-hidden="true">
                  <i className={item.icon}></i>
                </span>
                <strong>{item.title}</strong>
                <p>{item.text}</p>
              </article>
            ))}
          </div>
        </section>
      </main>

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

      <footer className="site-footer">
        <div>
          <h3>Categorias</h3>
          {productCategories.map((category) => (
            <Link href={category.href} key={category.value}>
              {category.label}
            </Link>
          ))}
        </div>
        <div>
          <h3>Institucional</h3>
          <button type="button" onClick={() => setContactOpen(true)}>
            Fale conosco
          </button>
          <Link href={aboutPageUrl}>Sobre a ScannerTec</Link>
          <a href={youtubeUrl} target="_blank" rel="noopener noreferrer">
            Canal no YouTube
          </a>
        </div>
        <div>
          <h3>Contatos</h3>
          <a href={whatsappDirectUrl()} target="_blank" rel="noopener noreferrer">
            WhatsApp: {whatsappDisplayNumber}
          </a>
          <span>{businessCity}</span>
          <span>Atendimento: {businessHours}</span>
        </div>
      </footer>
    </>
  );
}
