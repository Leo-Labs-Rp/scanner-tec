"use client";

import { buildDefaultBudgetMessage } from "@/lib/catalog";
import { whatsappUrl } from "@/lib/whatsapp";

export default function FloatingWhatsApp() {
  const pathname = typeof window === "undefined" ? "" : window.location.pathname;
  const pageTitle =
    typeof document === "undefined" ? "" : document.title.replace(" | ScannerTec", "").trim();
  const currentUrl = typeof window === "undefined" ? "" : window.location.href;
  const message =
    pathname.startsWith("/produto/") && pageTitle && pageTitle !== "ScannerTec"
      ? [
          "Olá, vim pelo site da ScannerTec.",
          `Tenho interesse no produto: ${pageTitle}.`,
          currentUrl ? `Link: ${currentUrl}` : "",
          "Pode confirmar disponibilidade, pagamento, frete e retirada?"
        ]
          .filter(Boolean)
          .join("\n")
      : buildDefaultBudgetMessage();

  return (
    <a
      className="floating-whatsapp"
      href={whatsappUrl(message)}
      suppressHydrationWarning
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Falar no WhatsApp"
    >
      <i className="fa-brands fa-whatsapp" aria-hidden="true"></i>
      <span>Falar no WhatsApp</span>
    </a>
  );
}
