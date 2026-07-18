"use client";

import Link from "next/link";
import { CartIcon, ContactIcon, YoutubeIcon } from "@/components/SiteIcons";
import {
  businessCity,
  businessHours,
  menuGroups,
  transparentLogoUrl,
  whatsappDisplayNumber,
  youtubeUrl
} from "@/lib/catalog";
import { whatsappDirectUrl } from "@/lib/whatsapp";
import type { ProductCategory } from "@/types/product";

type Props = {
  aboutHref?: string;
  cartItems: number;
  catalogHref?: string;
  catalogLabel?: string;
  catalogActive?: boolean;
  homeHref?: string;
  includeAboutLink?: boolean;
  mobileMenuOpen: boolean;
  onContactClick: () => void;
  onOpenCart: () => void;
  onSearchChange: (value: string) => void;
  onSearchSubmit: () => void;
  onToggleMobileGroup: (group: string) => void;
  onToggleMobileMenu: () => void;
  openMobileGroup: string;
  searchValue: string;
  selectedCategory?: ProductCategory | null;
};

export default function StoreHeader({
  aboutHref = "/sobre",
  cartItems,
  catalogHref = "/buscar",
  catalogLabel = "Catálogo",
  catalogActive = false,
  homeHref = "/",
  includeAboutLink = false,
  mobileMenuOpen,
  onContactClick,
  onOpenCart,
  onSearchChange,
  onSearchSubmit,
  onToggleMobileGroup,
  onToggleMobileMenu,
  openMobileGroup,
  searchValue,
  selectedCategory
}: Props) {
  void onToggleMobileMenu;

  return (
    <>
      <div className="info-bar">
        <div>
          <div className="info-bar-copy">
            <span className="info-location">{businessCity}</span>
            <span className="info-hours">Atendimento: {businessHours}</span>
          </div>
          <a href={whatsappDirectUrl()} target="_blank" rel="noopener noreferrer">
            WhatsApp: {whatsappDisplayNumber}
          </a>
        </div>
      </div>

      <nav className="store-header" aria-label="Navegação principal">
        <div className="store-header-main">
          <Link className="brand store-brand" href={homeHref}>
            <span className="brand-logo-wordmark">
              <img src={transparentLogoUrl} alt="ScannerTec Equipamentos Automotivos" />
            </span>
          </Link>

          <form
            className="header-search"
            onSubmit={(event) => {
              event.preventDefault();
              onSearchSubmit();
            }}
          >
            <span>Buscar produtos</span>
            <input
              type="search"
              value={searchValue}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder="Digite o que você procura"
            />
            <button type="submit">Buscar</button>
          </form>

          <div className="header-actions">
            <button type="button" onClick={onContactClick} aria-label="Abrir contato com a equipe">
              <span className="action-icon" aria-hidden="true">
                <ContactIcon />
              </span>
            </button>

            <button type="button" onClick={onOpenCart} aria-label={`Abrir lista com ${cartItems} itens`}>
              <span className="action-icon" aria-hidden="true">
                <CartIcon />
              </span>
              <strong>{cartItems}</strong>
            </button>

            <a href={youtubeUrl} target="_blank" rel="noopener noreferrer" aria-label="Ver demonstrações no YouTube">
              <span className="action-icon youtube" aria-hidden="true">
                <YoutubeIcon />
              </span>
            </a>
          </div>
        </div>

        <p className="header-cart-hint">Monte sua lista e avance pelo WhatsApp ou pagamento.</p>

        <div className={`category-nav ${mobileMenuOpen ? "open" : ""}`} aria-label="Categorias">
          <Link className={catalogActive ? "active" : ""} href={catalogHref}>
            {catalogLabel}
          </Link>

          {menuGroups.map((group) => {
            const active = selectedCategory === group.category;

            return (
              <div className="nav-group" key={group.label}>
                <Link className={active ? "active" : ""} href={group.href}>
                  {group.label}
                </Link>
                <button
                  className={active ? "active" : ""}
                  type="button"
                  onClick={() => onToggleMobileGroup(group.label)}
                  aria-label={`Abrir subcategorias de ${group.label}`}
                >
                  {group.label}
                </button>
                <div className={`dropdown-menu ${openMobileGroup === group.label ? "open" : ""}`}>
                  <Link href={group.href}>Ver todos em {group.label}</Link>
                  {group.items.map((item) => (
                    <Link href={`${group.href}?uso=${encodeURIComponent(item.use)}`} key={item.use}>
                      {item.label}
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}

          {includeAboutLink ? <Link href={aboutHref}>Sobre</Link> : null}
        </div>
      </nav>
    </>
  );
}
