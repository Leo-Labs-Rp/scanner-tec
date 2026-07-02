import Link from "next/link";
import { redirect } from "next/navigation";
import AdminLoginForm from "@/components/AdminLoginForm";
import { transparentLogoUrl } from "@/lib/catalog";
import { hasAdminSession } from "@/lib/auth";

type Props = {
  searchParams?: Promise<{ next?: string }>;
};

export const dynamic = "force-dynamic";

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
            <img src={transparentLogoUrl} alt="ScannerTec" />
          </span>
        </Link>

        <AdminLoginForm nextPath={nextPath} />
      </section>
    </main>
  );
}
