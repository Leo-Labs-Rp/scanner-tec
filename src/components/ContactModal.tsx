"use client";

import { CloseIcon } from "@/components/SiteIcons";
import { businessCity, businessHours, whatsappDisplayNumber, youtubeUrl } from "@/lib/catalog";
import { whatsappDirectUrl, whatsappUrl } from "@/lib/whatsapp";

type Props = {
  onClose: () => void;
  open: boolean;
};

export default function ContactModal({ onClose, open }: Props) {
  if (!open) return null;

  return (
    <div className="product-modal" role="dialog" aria-modal="true" aria-label="Fale com a ScannerTec">
      <div className="product-modal-backdrop" onClick={onClose}></div>
      <article className="contact-modal">
        <button className="modal-close" type="button" onClick={onClose} aria-label="Fechar contato">
          <CloseIcon />
        </button>
        <header>
          <h2>Fale com a ScannerTec</h2>
          <p>Envie uma mensagem rápida ou siga direto para o WhatsApp com o seu contexto.</p>
        </header>
        <div className="contact-modal-grid">
          <form
            onSubmit={(event) => {
              event.preventDefault();
              const form = new FormData(event.currentTarget);
              const name = String(form.get("name") || "").trim();
              const phone = String(form.get("phone") || "").trim();
              const message =
                String(form.get("message") || "").trim() ||
                "Gostaria de ajuda para escolher um equipamento.";

              const lines = [
                "Olá, vim pelo site da ScannerTec.",
                name ? `Nome: ${name}` : "",
                phone ? `Telefone: ${phone}` : "",
                `Mensagem: ${message}`
              ].filter(Boolean);

              window.open(whatsappUrl(lines.join("\n")), "_blank", "noopener,noreferrer");
            }}
          >
            <label>
              Nome
              <input name="name" />
            </label>
            <label>
              Telefone
              <input name="phone" />
            </label>
            <label>
              Mensagem
              <textarea name="message" defaultValue="Gostaria de ajuda para escolher um equipamento." />
            </label>
            <button className="btn btn-primary" type="submit">
              Enviar pelo WhatsApp
            </button>
          </form>
          <div className="contact-info">
            <strong>ScannerTec Equipamentos Automotivos</strong>
            <span>{businessCity}</span>
            <span>Atendimento: {businessHours}</span>
            <a href={whatsappDirectUrl()} target="_blank" rel="noopener noreferrer">
              WhatsApp: {whatsappDisplayNumber}
            </a>
            <a href={youtubeUrl} target="_blank" rel="noopener noreferrer">
              YouTube: ScannerTec Soluções Automotivas
            </a>
          </div>
        </div>
      </article>
    </div>
  );
}
