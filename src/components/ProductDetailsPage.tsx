"use client";

import Link from "next/link";
import Image from "next/image";
import {
  Check,
  ChevronDown,
  CircleCheck,
  Clock3,
  Headset,
  ListChecks,
  MapPin,
  MessageCircle,
  Truck,
  Zap
} from "lucide-react";
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
import { optimizeSupabaseImageUrl, shouldUseUnoptimizedImage } from "@/lib/image";
import { parseProductDetailContent } from "@/lib/product-detail-content";
import {
  getProductApplications,
  getProductCommercialSummary,
  getProductCompatibility,
  getProductDisplayName,
  getProductImageAlt,
  getProductPriceOrCondition,
  normalizeComparableCopy
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

function buildSentencePreview(text: string, maxSentences = 2, max = 420) {
  const normalized = text.replace(/\s+/g, " ").trim();
  const sentences = normalized.match(/[^.!?]+[.!?]+|[^.!?]+$/g)?.map((sentence) => sentence.trim()) || [];
  const preview = sentences.slice(0, maxSentences).join(" ") || normalized;
  if (preview.length <= max) return preview;

  return `${preview.slice(0, max - 3).trimEnd()}...`;
}

const specLabelAliases: Record<string, string> = {
  fabricante: "marca",
  "marca ou linha": "marca",
  "categoria principal": "categoria original"
};

function normalizeSpecLabel(label: string) {
  const normalized = label
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
  return specLabelAliases[normalized] || normalized;
}

function uniqueSpecEntries(entries: Array<[string, string | undefined]>) {
  const seen = new Set<string>();

  return entries.filter(([label, value]) => {
    const normalizedLabel = normalizeSpecLabel(label);
    if (!value?.trim() || seen.has(normalizedLabel)) return false;
    seen.add(normalizedLabel);
    return true;
  }) as Array<[string, string]>;
}

export default function ProductDetailsPage({ product, relatedProducts }: Props) {
  const productImages = Array.from(
    new Set(
      [...(product.images || []), product.imageUrl]
        .filter(Boolean)
        .map((imageUrl) => optimizeSupabaseImageUrl(imageUrl))
    )
  );
  const initialImage = productImages[0] || optimizeSupabaseImageUrl(product.imageUrl);
  const productYoutubeUrl = product.youtubeUrl?.trim() || "";
  const productName = getProductDisplayName(product);
  const commercialSummary = getProductCommercialSummary(product);
  const applications = getProductApplications(product);
  const benefits = (product.benefits || []).filter(Boolean);
  const compatibility = getProductCompatibility(product);
  const priceOrCondition = getProductPriceOrCondition(product);
  const productTagsList = productTags(product);
  const [search, setSearch] = useState("");
  const [contactOpen, setContactOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openMobileGroup, setOpenMobileGroup] = useState("");
  const [selectedImage, setSelectedImage] = useState(initialImage);
  const selectedImageUnoptimized = shouldUseUnoptimizedImage(selectedImage);
  const { addToCart, cart, removeFromCart, total, totalItems } = useQuoteCart();
  const { checkout, checkoutError, isCheckingOut, resetCheckoutError } = useCheckoutFlow(
    cart.map((item) => ({ id: item.id, quantity: item.quantity }))
  );

  const parsedDetail = useMemo(
    () => parseProductDetailContent(product.detail || product.description),
    [product.description, product.detail]
  );
  const parsedApplications = useMemo(() => parseProductDetailContent(applications), [applications]);
  const applicationSource = parsedApplications.intro.join(" ") || applications;
  const applicationText = buildSentencePreview(applicationSource);
  const compatibilityText = buildSentencePreview(compatibility, 1, 240);
  const applicationsDuplicateDetail =
    normalizeComparableCopy(applications) === normalizeComparableCopy(product.detail || product.description);

  const sourceSpecEntries = Object.entries(product.specs || {}).filter(([, value]) => Boolean(value));
  const findSourceSpec = (label: string) =>
    sourceSpecEntries.find(([currentLabel]) => normalizeSpecLabel(currentLabel) === normalizeSpecLabel(label))?.[1];
  const specEntries = uniqueSpecEntries([
    ["Nome do produto", productName],
    ["Marca", productBrand(product)],
    ["Categoria", formatCategoryLabel(product.category)],
    ["SKU", product.sku],
    ["Grupo original", findSourceSpec("Grupo original")],
    ["Categoria original", findSourceSpec("Categoria principal")],
    ["Usos", productTagsList.map(formatTagLabel).join(", ") || "Sob consulta"],
    ["Condição comercial", product.stockStatus],
    ["Condição de pagamento", product.paymentInfo || product.paymentNote || priceOrCondition],
    ["Atendimento", businessHours],
    ...sourceSpecEntries,
    ...parsedDetail.technicalSpecs
  ]);
  const quickSpecs = uniqueSpecEntries([
    ...parsedDetail.technicalSpecs.filter(([label]) => normalizeSpecLabel(label) !== "marca"),
    ...sourceSpecEntries.filter(([label]) => !/observação|condição de pagamento/i.test(label))
  ]).slice(0, 5);
  const productDisplayLine =
    product.fullName && product.fullName.trim() && product.fullName.trim() !== productName
      ? product.fullName.trim()
      : "";
  const originalDescriptionIntro = parsedDetail.intro.filter((paragraph) => paragraph !== commercialSummary);
  const combinedDescriptionIntro = originalDescriptionIntro.join(" ");
  const descriptionWithoutApplication = applicationsDuplicateDetail
    ? combinedDescriptionIntro.slice(applicationText.length).trim()
    : combinedDescriptionIntro;
  const descriptionIntro = descriptionWithoutApplication ? [descriptionWithoutApplication] : [];
  const hasCompleteDescription = Boolean(
    descriptionIntro.length || parsedDetail.highlights.length || parsedDetail.functions.length || benefits.length
  );

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
          <div className="product-page-main-image">
            <Image
              src={selectedImage}
              alt={getProductImageAlt(product)}
              fill
              sizes="(max-width: 960px) 100vw, 46vw"
              style={{ objectFit: "contain" }}
              fetchPriority="high"
              unoptimized={selectedImageUnoptimized}
            />
          </div>
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
                  <Image
                    src={image}
                    alt=""
                    aria-hidden="true"
                    fill
                    sizes="74px"
                    style={{ objectFit: "contain" }}
                    unoptimized={shouldUseUnoptimizedImage(image)}
                  />
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

          <div className="price-row product-page-price">
            <strong>{formatCurrency(product.price)}</strong>
            {product.oldPrice ? <del>{formatCurrency(product.oldPrice)}</del> : null}
          </div>
          <span className="installment-note">{priceOrCondition}</span>

          {quickSpecs.length >= 3 ? (
            <div className="product-quick-specs" aria-label="Especificações em destaque">
              {quickSpecs.map(([label, value]) => (
                <span className="product-quick-spec" key={label}>
                  <Zap aria-hidden="true" focusable="false" />
                  <span>
                    <strong>{label}</strong>
                    {value}
                  </span>
                </span>
              ))}
            </div>
          ) : null}

          <div className="product-service-strip" aria-label="Serviços comerciais">
            <span>
              <Headset className="fa-solid fa-headset" aria-hidden="true" focusable="false" />
              Atendimento consultivo
            </span>
            <span>
              <CircleCheck className="fa-solid fa-circle-check" aria-hidden="true" focusable="false" />
              Escolha orientada
            </span>
            <span>
              <Truck className="fa-solid fa-truck-fast" aria-hidden="true" focusable="false" />
              Envio ou retirada
            </span>
          </div>

          <div className="product-page-actions">
            <button className="btn btn-primary product-page-action-primary" type="button" onClick={() => handlePrimaryAction(product)}>
              <ListChecks className="fa-solid fa-list-check" aria-hidden="true" focusable="false" />
              Adicionar à lista
            </button>

            <div className={`product-page-actions-grid ${productYoutubeUrl ? "has-video" : ""}`}>
              <a
                className="btn btn-secondary product-page-action-secondary"
                href={whatsappUrl(buildProductFloatingMessage(product))}
                target="_blank"
                rel="noopener noreferrer"
              >
                <MessageCircle className="fa-brands fa-whatsapp" aria-hidden="true" focusable="false" />
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
          <article className="product-content-card product-description-section" id="descricao">
            <h2>Descrição</h2>
            <p className="product-content-lead">{commercialSummary}</p>
            {hasCompleteDescription ? (
              <details className="product-description-details">
                <summary>
                  <span>Ver descrição completa</span>
                  <ChevronDown aria-hidden="true" focusable="false" />
                </summary>
                <div className="product-description-expanded">
                  {descriptionIntro.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}

                  {parsedDetail.highlights.length ? (
                    <div className="product-description-group">
                      <h3>Destaques do equipamento</h3>
                      <ul className="product-description-list">
                        {parsedDetail.highlights.map((item) => (
                          <li key={item}>
                            <Check aria-hidden="true" focusable="false" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}

                  {parsedDetail.functions.length ? (
                    <div className="product-description-group">
                      <h3>Principais testes e funções</h3>
                      <ul className="product-description-list">
                        {parsedDetail.functions.map((item) => (
                          <li key={item}>
                            <Check aria-hidden="true" focusable="false" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}

                  {benefits.length ? (
                    <div className="product-description-group">
                      <h3>Benefícios para a oficina</h3>
                      <ul className="product-description-list">
                        {benefits.map((item) => (
                          <li key={item}>
                            <Check aria-hidden="true" focusable="false" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                </div>
              </details>
            ) : null}
          </article>

          <article className="product-content-card product-specifications-section" id="especificacoes">
            <h2>Especificações técnicas</h2>
            <dl className="product-specs-grid">
              {specEntries.map(([label, value]) => (
                <div key={label}>
                  <dt>{label}</dt>
                  <dd>{value}</dd>
                </div>
              ))}
            </dl>
          </article>

          <article className="product-content-card product-application-section" id="aplicacao">
            <h2>Aplicação e compatibilidade</h2>
            <div className="product-application-grid">
              <div>
                <h3>Aplicação</h3>
                <p>{applicationText}</p>
              </div>
              <div>
                <h3>Compatibilidade</h3>
                <p>{compatibilityText}</p>
              </div>
            </div>
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
                <MessageCircle className="fa-brands fa-whatsapp" aria-hidden="true" focusable="false" />
                WhatsApp: {whatsappDisplayNumber}
              </span>
              <span>
                <Clock3 className="fa-regular fa-clock" aria-hidden="true" focusable="false" />
                {businessHours}
              </span>
              <span>
                <MapPin className="fa-solid fa-location-dot" aria-hidden="true" focusable="false" />
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
