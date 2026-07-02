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
  businessHours,
  formatCategoryLabel,
  formatPaymentInfo,
  formatTagLabel,
  menuGroups,
  productCategories,
  productBrand,
  productTags,
  transparentLogoUrl,
  whatsappDisplayNumber,
  youtubeUrl
} from "@/lib/catalog";
import { formatCurrency } from "@/lib/format";
import { whatsappDirectUrl } from "@/lib/whatsapp";
import type { Product, ProductCategory } from "@/types/product";

const categoryLinks = Object.fromEntries(
  productCategories.map((category) => [category.value, category.href])
) as Record<ProductCategory, string>;

type Props = {
  product: Product;
  relatedProducts: Product[];
};

export default function ProductDetailsPage({ product, relatedProducts }: Props) {
  const initialImage = product.images?.[0] || product.imageUrl;
  const productYoutubeUrl = product.youtubeUrl?.trim() || "";
  const [search, setSearch] = useState("");
  const [contactOpen, setContactOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openMobileGroup, setOpenMobileGroup] = useState("");
  const [selectedImage, setSelectedImage] = useState(initialImage);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [checkoutError, setCheckoutError] = useState("");
  const { addToCart, cart, removeFromCart, total, totalItems } = useQuoteCart();

  const detailParagraphs = useMemo(() => {
    const unique = new Set<string>();

    [product.description, product.detail]
      .filter(Boolean)
      .flatMap((text) => String(text).split(/\n+/))
      .map((text) => text.trim())
      .filter(Boolean)
      .forEach((text) => unique.add(text));

    return Array.from(unique);
  }, [product.description, product.detail]);

  const productImages = Array.from(new Set([...(product.images || []), product.imageUrl].filter(Boolean)));
  const specEntries = Object.entries(product.specs || {}).filter(([, value]) => Boolean(value));
  function handlePrimaryAction(item: Product) {
    setCheckoutError("");
    addToCart(item);
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
    <main className="catalog-page product-page">
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
              const trimmedSearch = search.trim();
              window.location.href = trimmedSearch ? `/buscar?q=${encodeURIComponent(trimmedSearch)}` : "/buscar";
            }}
          >
            <span>Buscar produtos</span>
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
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
          <Link href="/buscar">Catálogo</Link>
          {menuGroups.map((group) => (
            <div className="nav-group" key={group.label}>
              <Link className={product.category === group.category ? "active" : ""} href={group.href}>
                {group.label}
              </Link>
              <button
                className={product.category === group.category ? "active" : ""}
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

      <div className="product-breadcrumb" aria-label="Breadcrumb">
        <Link href="/">Início</Link>
        <span>/</span>
        <Link href={categoryLinks[product.category]}>{formatCategoryLabel(product.category)}</Link>
        <span>/</span>
        <strong>{product.name}</strong>
      </div>

      <section className="product-page-hero">
        <div className="product-page-media">
          <img src={selectedImage} alt={product.name} />
          {productImages.length > 1 ? (
            <div className="product-gallery" aria-label="Galeria do produto">
              {productImages.map((image, index) => (
                <button
                  className={image === selectedImage ? "active" : ""}
                  key={image}
                  type="button"
                  onClick={() => setSelectedImage(image)}
                  aria-label={`Ver imagem ${index + 1}`}
                >
                  <img src={image} alt="" aria-hidden="true" />
                </button>
              ))}
            </div>
          ) : null}
        </div>

        <div className="product-page-copy">
          <p className="eyebrow">{formatCategoryLabel(product.category)}</p>
          <h1>{product.name}</h1>
          <div className="product-page-meta product-badges">
            <span>{productBrand(product)}</span>
            <span>{formatCategoryLabel(product.category)}</span>
            {productTags(product).map((tag) => (
              <span key={tag}>{formatTagLabel(tag)}</span>
            ))}
          </div>
          <p className="product-page-summary">{product.description}</p>
          <div className="price-row product-page-price">
            <strong>{formatCurrency(product.price)}</strong>
            {product.oldPrice ? <del>{formatCurrency(product.oldPrice)}</del> : null}
          </div>
          <span className="installment-note">{formatPaymentInfo(product)}</span>
          <div className="product-service-strip" aria-label="Serviços comerciais">
            <span>
              <i className="fa-solid fa-headset" aria-hidden="true"></i>
              Atendimento técnico
            </span>
            <span>
              <i className="fa-solid fa-screwdriver-wrench" aria-hidden="true"></i>
              Compatibilidade orientada
            </span>
            <span>
              <i className="fa-solid fa-truck-fast" aria-hidden="true"></i>
              Envio ou retirada
            </span>
          </div>

          <div className="product-page-actions">
            <button
              className="btn btn-primary btn-product-cta product-page-action-primary"
              type="button"
              onClick={() => handlePrimaryAction(product)}
            >
              <i className="fa-solid fa-list-check" aria-hidden="true"></i>
              Adicionar à lista
            </button>

            <div className={`product-page-actions-grid ${productYoutubeUrl ? "has-video" : ""}`}>
              <Link className="btn btn-secondary product-page-action-secondary" href={categoryLinks[product.category]}>
                <i className="fa-solid fa-layer-group" aria-hidden="true"></i>
                Ver categoria
              </Link>

              {productYoutubeUrl ? (
                <a
                  className="btn btn-secondary product-page-action-secondary product-page-action-video"
                  href={productYoutubeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Assistir vídeo do produto ${product.name} no YouTube`}
                >
                  <span className="action-icon youtube" aria-hidden="true">
                    <YoutubeIcon />
                  </span>
                  Ver vídeo do produto
                </a>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      <section className="product-page-layout">
        <div className="product-page-content">
          <article className="product-content-card">
            <h2>Sobre este produto</h2>
            {detailParagraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </article>

          <article className="product-content-card">
            <h2>Aplicações e informações comerciais</h2>
            <div className="product-info-grid">
              <span>
                <strong>Categoria</strong>
                {formatCategoryLabel(product.category)}
              </span>
              {product.sku ? (
                <span>
                  <strong>SKU</strong>
                  {product.sku}
                </span>
              ) : null}
              <span>
                <strong>Marca ou linha</strong>
                {productBrand(product)}
              </span>
              <span>
                <strong>Disponibilidade</strong>
                {product.stockStatus}
              </span>
              <span>
                <strong>Pagamento</strong>
                {formatPaymentInfo(product)}
              </span>
              <span>
                <strong>Atendimento</strong>
                {businessHours}
              </span>
              <span>
                <strong>Usos</strong>
                {productTags(product).map(formatTagLabel).join(", ") || "Sob consulta"}
              </span>
            </div>
          </article>

          <article className="product-content-card">
            <h2>Especificações técnicas</h2>
            {specEntries.length ? (
              <div className="spec-table">
                {specEntries.map(([label, value]) => (
                  <span key={label}>
                    <strong>{label}</strong>
                    {value}
                  </span>
                ))}
              </div>
            ) : (
              <p className="spec-placeholder">
                Consulte a equipe ScannerTec para confirmar compatibilidade, itens inclusos e
                aplicação ideal.
              </p>
            )}
          </article>
        </div>

        <aside className="product-page-side">
          <div className="product-summary-card">
            <span className="eyebrow">Atendimento consultivo</span>
            <h2>Solicite com a equipe ScannerTec</h2>
            <p>
              Tire dúvidas sobre aplicação, disponibilidade, condições e frete com um atendimento
              direto no WhatsApp.
            </p>
            <div className="product-summary-points">
              <span>
                <i className="fa-brands fa-whatsapp" aria-hidden="true"></i>
                WhatsApp: {whatsappDisplayNumber}
              </span>
              <span>
                <i className="fa-regular fa-clock" aria-hidden="true"></i>
                {businessHours}
              </span>
              <span>
                <i className="fa-solid fa-location-dot" aria-hidden="true"></i>
                {businessCity}
              </span>
            </div>
            <button
              className="btn btn-primary btn-product-cta"
              type="button"
              onClick={() => handlePrimaryAction(product)}
            >
              <i className="fa-solid fa-list-check" aria-hidden="true"></i>
              Adicionar à lista
            </button>
            {productYoutubeUrl ? (
              <a
                className="btn btn-secondary product-page-action-secondary product-page-action-video"
                href={productYoutubeUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                <span className="action-icon youtube" aria-hidden="true">
                  <YoutubeIcon />
                </span>
                Ver vídeo do produto
              </a>
            ) : null}
          </div>
        </aside>
      </section>

      {relatedProducts.length ? (
        <section className="section product-related">
          <div className="catalog-header">
            <div>
              <p className="eyebrow">Relacionados</p>
              <h2>Mais opções desta linha</h2>
              <p>Produtos próximos para comparar, complementar ou montar um orçamento maior.</p>
            </div>
          </div>

          <div className="catalog-results-grid product-related-grid">
            {relatedProducts.map((item) => (
              <ProductCard
                compact
                key={item.id}
                product={item}
                onPrimaryAction={handlePrimaryAction}
              />
            ))}
          </div>
        </section>
      ) : null}

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
