"use client";

import { CloseIcon, TrashIcon } from "@/components/SiteIcons";
import { formatCurrency } from "@/lib/format";
import type { CartItem } from "@/types/product";

type Props = {
  cart: CartItem[];
  error?: string;
  isCheckingOut: boolean;
  onCheckout: () => void;
  onClose: () => void;
  onRemove: (productId: string) => void;
  open: boolean;
  total: number;
};

export default function QuoteCartDrawer({
  cart,
  error,
  isCheckingOut,
  onCheckout,
  onClose,
  onRemove,
  open,
  total
}: Props) {
  if (!open) return null;

  const hasConsultationItems = cart.some((item) => item.price === null);
  const totalLabel = hasConsultationItems && total === 0 ? "Sob consulta" : formatCurrency(total);

  return (
    <aside className="cart-drawer" role="dialog" aria-modal="true" aria-label="Lista de orçamento">
      <div className="cart-drawer-backdrop" onClick={onClose}></div>
      <div className="cart-drawer-panel">
        <header>
          <div>
            <span>Lista de orçamento</span>
            <h2>Itens selecionados</h2>
          </div>
          <button type="button" onClick={onClose} aria-label="Fechar lista de orçamento">
            <CloseIcon />
          </button>
        </header>

        {!cart.length ? (
          <div className="cart-empty drawer-empty">
            Adicione produtos para montar sua lista e enviar tudo de uma vez pelo WhatsApp.
          </div>
        ) : (
          <ul className="cart-list drawer-list">
            {cart.map((item) => (
              <li key={item.id}>
                <img src={item.imageUrl} alt="" aria-hidden="true" />
                <span>
                  <strong>{item.name}</strong>
                  <small>
                    {item.quantity}x {formatCurrency(item.price)}
                  </small>
                </span>
                <button type="button" onClick={() => onRemove(item.id)} aria-label={`Remover ${item.name}`}>
                  <TrashIcon />
                </button>
              </li>
            ))}
          </ul>
        )}

        <footer>
          <div className="cart-total">
            <span>{hasConsultationItems ? "Total parcial estimado" : "Total estimado"}</span>
            <strong>{totalLabel}</strong>
          </div>
          <p className="drawer-note">
            {hasConsultationItems
              ? "Alguns itens estão sob consulta. A equipe confirma valores, pagamento, frete e retirada."
              : "A equipe recebe sua lista e confirma pagamento, disponibilidade, frete e retirada."}
          </p>
          {error ? <p className="drawer-error">{error}</p> : null}
          <button className="btn btn-primary btn-full" type="button" disabled={!cart.length || isCheckingOut} onClick={onCheckout}>
            {isCheckingOut ? "Preparando..." : "Enviar lista pelo WhatsApp"}
          </button>
          <button className="btn btn-secondary btn-full" type="button" onClick={onClose}>
            Continuar escolhendo
          </button>
        </footer>
      </div>
    </aside>
  );
}
