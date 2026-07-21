import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import AdminLoginForm from "@/components/AdminLoginForm";
import { transparentLogoUrl } from "@/lib/catalog";
import { hasAdminSession } from "@/lib/auth";
import type { Metadata } from "next";

type Props = {
  searchParams?: Promise<{ next?: string }>;
};

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Login admin | ScannerTec",
  robots: {
    index: false,
    follow: false
  }
};

export default async function AdminLoginPage({ searchParams }: Props) {
  if (await hasAdminSession()) {
    redirect("/admin");
  }

  const resolved = (await searchParams) || {};
  const nextPath = resolved.next?.startsWith("/") ? resolved.next : "/admin";

  return (
    <main className="admin-login-page">
      <section className="admin-login-shell">
        <Link className="brand admin-brand" href="/">
          <span className="brand-logo-wordmark">
            <Image
              src={transparentLogoUrl}
              alt="ScannerTec"
              width={314}
              height={96}
              sizes="(max-width: 768px) 220px, 314px"
              style={{ width: "100%", height: "auto", objectFit: "contain" }}
            />
          </span>
        </Link>

        <AdminLoginForm nextPath={nextPath} />
      </section>
    </main>
  );
}
