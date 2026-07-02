import type { Metadata } from "next";
import FloatingWhatsApp from "@/components/FloatingWhatsApp";
import { productionUrl, shareLogoUrl } from "@/lib/catalog";
import "./globals.css";

const baseUrl = process.env.PUBLIC_BASE_URL || productionUrl;
const shareImage = `${productionUrl}/assets/scannertec-logo.jpeg`;

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: "ScannerTec | Scanners e Equipamentos Automotivos",
  description:
    "ScannerTec em São José do Rio Preto: scanners automotivos, máquinas, manômetros, equipamentos de diagnóstico e suporte técnico especializado.",
  openGraph: {
    title: "ScannerTec | Scanners e Equipamentos Automotivos",
    description:
      "Catálogo consultivo com scanners, máquinas, manômetros e equipamentos para oficinas em São José do Rio Preto e região.",
    url: productionUrl,
    images: [shareImage]
  },
  twitter: {
    card: "summary_large_image",
    title: "ScannerTec | Scanners e Equipamentos Automotivos",
    description:
      "Catálogo consultivo com scanners, máquinas, manômetros e equipamentos para oficinas em São José do Rio Preto e região.",
    images: [shareLogoUrl]
  }
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Store",
    name: "ScannerTec",
    description:
      "Scanners automotivos, máquinas, manômetros, equipamentos de diagnóstico e suporte técnico especializado em São José do Rio Preto.",
    url: productionUrl,
    areaServed: "São José do Rio Preto e região",
    address: {
      "@type": "PostalAddress",
      addressLocality: "São José do Rio Preto",
      addressRegion: "SP",
      addressCountry: "BR"
    },
    openingHours: "Mo-Fr 08:00-18:00",
    sameAs: ["https://www.youtube.com/@scannertecsolucoesautomoti6957"]
  };

  return (
    <html lang="pt-BR">
      <head>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css"
          referrerPolicy="no-referrer"
        />
      </head>
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
        {children}
        <FloatingWhatsApp />
      </body>
    </html>
  );
}
