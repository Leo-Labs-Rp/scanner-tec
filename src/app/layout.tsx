import type { Metadata } from "next";
import FloatingWhatsApp from "@/components/FloatingWhatsApp";
import { productionUrl, shareLogoUrl } from "@/lib/catalog";
import { buildOrganizationSchema } from "@/lib/seo";
import "./globals.css";

const baseUrl = process.env.PUBLIC_BASE_URL || productionUrl;
const shareImage = `${baseUrl}/assets/scannertec-logo.jpeg`;

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: "ScannerTec | Scanners automotivos e equipamentos para oficina",
  description:
    "ScannerTec em São José do Rio Preto: scanners automotivos, máquinas, manômetros, equipamentos de diagnóstico e suporte técnico especializado.",
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
    shortcut: ["/icon.svg"],
    apple: ["/assets/scannertec-logo-transparent.png"]
  },
  openGraph: {
    title: "ScannerTec | Scanners automotivos e equipamentos para oficina",
    description:
      "Catálogo consultivo com scanners, máquinas, manômetros e equipamentos para oficinas em São José do Rio Preto e região.",
    url: baseUrl,
    siteName: "ScannerTec",
    locale: "pt_BR",
    images: [shareImage]
  },
  twitter: {
    card: "summary_large_image",
    title: "ScannerTec | Scanners automotivos e equipamentos para oficina",
    description:
      "Catálogo consultivo com scanners, máquinas, manômetros e equipamentos para oficinas em São José do Rio Preto e região.",
    images: [shareLogoUrl]
  }
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const schema = buildOrganizationSchema();

  return (
    <html lang="pt-BR">
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
