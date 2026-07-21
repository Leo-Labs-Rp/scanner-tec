import type { NextConfig } from "next";

const supabaseStoragePattern = process.env.SUPABASE_URL
  ? new URL("/storage/v1/object/public/**", process.env.SUPABASE_URL)
  : null;

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 60 * 60 * 24,
    remotePatterns: supabaseStoragePattern ? [supabaseStoragePattern] : []
  },
  async redirects() {
    return [
      {
        source: "/produto/atualizacao-carga-brasil",
        destination: "/produto/recalibracao-carga-brasil",
        permanent: true
      },
      {
        source: "/produto/atualizacao-ds808-mp208-1-ano",
        destination: "/produto/recalibracao-tecnica-ds808-mp208",
        permanent: true
      },
      {
        source: "/produto/diagrama-eletrico",
        destination: "/produto/consulta-tecnica-circuitos-eletricos-ecu",
        permanent: true
      }
    ];
  }
};

export default nextConfig;
