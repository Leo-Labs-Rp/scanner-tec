"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import ContactModal from "@/components/ContactModal";
import ProductCard from "@/components/ProductCard";
import QuoteCartDrawer from "@/components/QuoteCartDrawer";
import { YoutubeIcon } from "@/components/SiteIcons";
import StoreHeader from "@/components/StoreHeader";
import { useCheckoutFlow } from "@/hooks/useCheckoutFlow";
import { useQuoteCart } from "@/hooks/useQuoteCart";
import {
  businessCity,
  businessHours,
  buildProductFloatingMessage,
  formatCategoryLabel,
  formatTagLabel,
  productCategories,
  productBrand,
  productTags,
  whatsappCtaLabel,
  whatsappDisplayNumber
} from "@/lib/catalog";
import { formatCurrency } from "@/lib/format";
import {
  getProductApplications,
  getProductBenefits,
  getProductCommercialSummary,
  getProductCompatibility,
  getProductDisplayName,
  getProductImageAlt,
  getProductPriceOrCondition
} from "@/lib/product-content";
import { whatsappUrl } from "@/lib/whatsapp";
import type { Product, ProductCategory } from "@/types/product";

const categoryLinks = Object.fromEntries(
  productCategories.map((category) => [category.value, category.href])
) as Record<ProductCategory, string>;

type Props = {
  product: Product;
  relatedProducts: Product[];
};

function buildReadablePreview(text: string, max = 170) {
  const normalized = text.replace(/\s+/g, " ").trim();
  if (normalized.length <= max) return normalized;

  const firstSentence = normalized.match(/^.*?[.!?](\s|$)/)?.[0]?.trim();
  if (firstSentence && firstSentence.length <= max) return firstSentence;

  return `${normalized.slice(0, max - 3).trimEnd()}...`;
}

export default function ProductDetailsPage({ product, relatedProducts }: Props) {
  const initialImage = product.images?.[0] || product.imageUrl;
  const productYoutubeUrl = product.youtubeUrl?.trim() || "";
  const productName = getProductDisplayName(product);
  const commercialSummary = getProductCommercialSummary(product);
  const applications = getProductApplications(product);
  const benefits = getProductBenefits(product);
  const compatibility = getProductCompatibility(product);
  const priceOrCondition = getProductPriceOrCondition(product);
  const productTagsList = productTags(product);
  const [search, setSearch] = useState("");
  const [contactOpen, setContactOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openMobileGroup, setOpenMobileGroup] = useState("");
  const [selectedImage, setSelectedImage] = useState(initialImage);
  const { addToCart, cart, removeFromCart, total, totalItems } = useQuoteCart();
  const { checkout, checkoutError, isCheckingOut, resetCheckoutError } = useCheckoutFlow(
    cart.map((item) => ({ id: item.id, quantity: item.quantity }))
  );

  const detailParagraphs = useMemo(() => {
    const unique = new Set<string>();

    [product.detail, product.description]
      .filter(Boolean)
      .flatMap((text) => String(text).split(/\n+/))
      .map((text) => text.trim())
      .filter(Boolean)
      .forEach((text) => unique.add(text));

    return Array.from(unique);
  }, [product.description, product.detail]);

  const applicationPreview = useMemo(() => buildReadablePreview(applications), [applications]);
  const compatibilityPreview = useMemo(() => buildReadablePreview(compatibility, 150), [compatibility]);

  const productImages = Array.from(new Set([...(product.images || []), product.imageUrl].filter(Boolean)));
  const specEntries = Object.entries(product.specs || {}).filter(([, value]) => Boolean(value));
  const productDisplayLine =
    product.fullName && product.fullName.trim() && product.fullName.trim() !== productName
      ? product.fullName.trim()
      : "";
  const detailContent = detailParagraphs.filter((paragraph) => paragraph !== commercialSummary);

  function handlePrimaryAction(item: Product) {
    resetCheckoutError();
    addToCart(item);
    setCartOpen(true);
  }

  return (
    <main className="catalog-page product-page">
      <StoreHeader
        aboutHref="/sobre"
        cartItems={totalItems}
        catalogActive={false}
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
        selectedCategory={product.category}
      />

      <div className="product-breadcrumb" aria-label="Breadcrumb">
        <Link href="/">Início</Link>
        <span>/</span>
        <Link href={categoryLinks[product.category]}>{formatCategoryLabel(product.category)}</Link>
        <span>/</span>
        <strong>{productName}</strong>
      </div>

      <section className="product-page-hero">
        <div className="product-page-media">
          <img src={selectedImage} alt={getProductImageAlt(product)} />
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
          <h1>{productName}</h1>
          {productDisplayLine ? <p className="product-page-nameplate">{productDisplayLine}</p> : null}

          <div className="product-page-meta product-badges">
            <span>{productBrand(product)}</span>
            <span>{formatCategoryLabel(product.category)}</span>
            {productTagsList.map((tag) => (
              <span key={tag}>{formatTagLabel(tag)}</span>
            ))}
          </div>

          <p className="product-page-summary">{commercialSummary}</p>

          <div className="price-row product-page-price">
            <strong>{formatCurrency(product.price)}</strong>
            {product.oldPrice ? <del>{formatCurrency(product.oldPrice)}</del> : null}
          </div>
          <span className="installment-note">{priceOrCondition}</span>

          <div className="product-service-strip" aria-label="Serviços comerciais">
            <span>
              <i className="fa-solid fa-headset" aria-hidden="true"></i>
              Atendimento consultivo
            </span>
            <span>
              <i className="fa-solid fa-circle-check" aria-hidden="true"></i>
              Escolha orientada
            </span>
            <span>
              <i className="fa-solid fa-truck-fast" aria-hidden="true"></i>
              Envio ou retirada
            </span>
          </div>

          <div className="product-page-facts" aria-label="Resumo rápido do produto">
            <span>
              <strong>Aplicação:</strong> {applicationPreview}
            </span>
            <span>
              <strong>Compatibilidade:</strong> {compatibilityPreview}
            </span>
          </div>

          <div className="product-page-actions">
            <button className="btn btn-primary product-page-action-primary" type="button" onClick={() => handlePrimaryAction(product)}>
              <i className="fa-solid fa-list-check" aria-hidden="true"></i>
              Adicionar à lista
            </button>

            <div className={`product-page-actions-grid ${productYoutubeUrl ? "has-video" : ""}`}>
              <a
                className="btn btn-secondary product-page-action-secondary"
                href={whatsappUrl(buildProductFloatingMessage(product))}
                target="_blank"
                rel="noopener noreferrer"
              >
                <i className="fa-brands fa-whatsapp" aria-hidden="true"></i>
                {whatsappCtaLabel()}
              </a>

              {productYoutubeUrl ? (
                <a
                  className="btn btn-secondary product-page-action-secondary product-page-action-video"
                  href={productYoutubeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Assistir vídeo do produto ${productName} no YouTube`}
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
            <h2>Resumo comercial</h2>
            <p className="product-content-lead">{commercialSummary}</p>
            {detailContent.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </article>

          <article className="product-content-card">
            <h2>Aplicação e compatibilidade</h2>
            <div className="product-text-section">
              <div className="product-text-block">
                <strong>Aplicações</strong>
                <p>{applications}</p>
              </div>
              <div className="product-text-block">
                <strong>Compatibilidade</strong>
                <p>{compatibility}</p>
              </div>
            </div>
          </article>

          <article className="product-content-card">
            <h2>Benefícios para a oficina</h2>
            <div className="product-benefits-grid">
              {benefits.map((benefit) => (
                <span className="product-benefit-card" key={benefit}>
                  <i className="fa-solid fa-check" aria-hidden="true"></i>
                  <span>{benefit}</span>
                </span>
              ))}
            </div>
          </article>

          <article className="product-content-card">
            <h2>Informações comerciais e técnicas</h2>
            <div className="product-info-grid">
              <span>
                <strong>Nome do produto</strong>
                {productName}
              </span>
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
                <strong>Atendimento</strong>
                {businessHours}
              </span>
              <span>
                <strong>Usos</strong>
                {productTagsList.map(formatTagLabel).join(", ") || "Sob consulta"}
              </span>
              <span className="product-info-grid-wide">
                <strong>Condição comercial</strong>
                {priceOrCondition}
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
                Consulte a equipe ScannerTec para confirmar compatibilidade, itens inclusos e aplicação ideal.
              </p>
            )}
          </article>
        </div>

        <aside className="product-page-side">
          <div className="product-summary-card">
            <span className="eyebrow">Atendimento consultivo</span>
            <h2>Fale com a ScannerTec com contexto pronto</h2>
            <p>
              A equipe pode confirmar aplicação, disponibilidade, condição comercial, frete e retirada para este produto.
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
            <p className="product-summary-footnote">
              Ao abrir o WhatsApp por esta página, a mensagem já segue com o nome do produto para agilizar o atendimento.
            </p>
          </div>
        </aside>
      </section>

      {relatedProducts.length ? (
        <section className="section product-related">
          <div className="catalog-header">
            <div>
              <p className="eyebrow">Relacionados</p>
              <h2>Mais opções desta linha</h2>
              <p>Produtos próximos para comparar, complementar ou montar uma lista maior.</p>
            </div>
          </div>

          <div className="catalog-results-grid product-related-grid">
            {relatedProducts.map((item) => (
              <ProductCard compact key={item.id} product={item} onPrimaryAction={handlePrimaryAction} />
            ))}
          </div>
        </section>
      ) : null}

      <div className="catalog-page-footer">
        <a href={whatsappUrl(buildProductFloatingMessage(product))} target="_blank" rel="noopener noreferrer">
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
