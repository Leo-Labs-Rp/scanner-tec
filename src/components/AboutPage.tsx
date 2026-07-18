"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import ContactModal from "@/components/ContactModal";
import QuoteCartDrawer from "@/components/QuoteCartDrawer";
import StoreHeader from "@/components/StoreHeader";
import { useCheckoutFlow } from "@/hooks/useCheckoutFlow";
import { useQuoteCart } from "@/hooks/useQuoteCart";
import {
  businessCity,
  businessHours,
  productBrand,
  productCategories,
  whatsappCtaLabel,
  whatsappDisplayNumber,
  youtubeUrl
} from "@/lib/catalog";
import { whatsappDirectUrl } from "@/lib/whatsapp";
import type { Product } from "@/types/product";

const serviceFlow = [
  {
    title: "Atendimento consultivo",
    text: "A ScannerTec ajuda a filtrar o equipamento mais coerente com a rotina da oficina antes do orçamento."
  },
  {
    title: "Comparação simplificada",
    text: "O cliente encontra categorias, aplicações e produtos organizados para escolher com mais segurança."
  },
  {
    title: "Canal direto de venda",
    text: "O contato comercial segue direto para o WhatsApp com contexto do produto e mais chance de conversão."
  }
] as const;

type Props = {
  products: Product[];
};

export default function AboutPage({ products }: Props) {
  const [search, setSearch] = useState("");
  const [contactOpen, setContactOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openMobileGroup, setOpenMobileGroup] = useState("");
  const { cart, removeFromCart, total, totalItems } = useQuoteCart();
  const { checkout, checkoutError, isCheckingOut } = useCheckoutFlow(
    cart.map((item) => ({ id: item.id, quantity: item.quantity }))
  );

  const brands = useMemo(
    () => Array.from(new Set(products.map((product) => productBrand(product)))).sort((a, b) => a.localeCompare(b)),
    [products]
  );

  const stats = useMemo(
    () => [
      { value: `${products.length}+`, label: "produtos organizados" },
      { value: `${brands.length}+`, label: "marcas e linhas" },
      { value: `${productCategories.length}`, label: "categorias principais" }
    ],
    [brands.length, products.length]
  );

  return (
    <main className="catalog-page about-page">
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
      />

      <section className="catalog-page-title about-page-title">
        <div>
          <p className="eyebrow">Institucional</p>
          <h1>Sobre a ScannerTec</h1>
          <p className="catalog-title-copy">
            A ScannerTec atende oficinas, reparadores e auto centers em São José do Rio Preto com scanners automotivos, máquinas, manômetros e equipamentos profissionais.
          </p>
          <p className="catalog-title-copy">
            O foco comercial da empresa está em orientar a compra certa para a necessidade da oficina, combinando vitrine técnica com atendimento consultivo por WhatsApp.
          </p>
        </div>
      </section>

      <section className="about-page-layout">
        <div className="about-page-content">
          <article className="product-content-card">
            <h2>História e posicionamento</h2>
            <p>
              A ScannerTec construiu sua presença comercial em torno de equipamentos automotivos voltados à rotina de diagnóstico, teste, reparação e ganho de produtividade em oficinas.
            </p>
            <p>
              Em vez de uma vitrine genérica, a proposta é trabalhar com atendimento mais próximo, ajudando o cliente a comparar opções e entender qual equipamento faz sentido para o momento da operação.
            </p>
          </article>

          <article className="product-content-card">
            <h2>Como a ScannerTec atende</h2>
            <div className="about-highlights-grid">
              {serviceFlow.map((item) => (
                <div className="about-highlight-card" key={item.title}>
                  <strong>{item.title}</strong>
                  <p>{item.text}</p>
                </div>
              ))}
              <div className="about-highlight-card">
                <strong>Atuação local</strong>
                <p>Presença comercial em {businessCity}, com atendimento pensado para oficina e reparador.</p>
              </div>
            </div>
          </article>

          <article className="product-content-card">
            <h2>Marcas e linhas trabalhadas</h2>
            <div className="product-page-meta product-badges">
              {brands.map((brand) => (
                <span key={brand}>{brand}</span>
              ))}
            </div>
          </article>
        </div>

        <aside className="about-page-side">
          <div className="product-summary-card">
            <span className="eyebrow">Contato comercial</span>
            <h2>Fale com a ScannerTec</h2>
            <p>Solicite orientação, disponibilidade e orçamento direto com a equipe, sem sair do fluxo do site.</p>
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
            <div className="about-side-stats">
              {stats.map((item) => (
                <span key={item.label}>
                  <strong>{item.value}</strong>
                  {item.label}
                </span>
              ))}
            </div>
            <a className="btn btn-primary" href={whatsappDirectUrl()} target="_blank" rel="noopener noreferrer">
              <i className="fa-brands fa-whatsapp" aria-hidden="true"></i>
              {whatsappCtaLabel()}
            </a>
            <Link className="btn btn-secondary" href="/buscar">
              Ver catálogo
            </Link>
            <a className="btn btn-secondary" href={youtubeUrl} target="_blank" rel="noopener noreferrer">
              Ver canal no YouTube
            </a>
          </div>
        </aside>
      </section>

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
          <Link href="/">Página inicial</Link>
          <Link href="/buscar">Catálogo</Link>
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
