import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export const adminSessionCookieName = "scannertec_admin_session";

function expectedAdminToken() {
  return process.env.ADMIN_TOKEN || "";
}

function isConfigured() {
  return Boolean(expectedAdminToken());
}

function parseCookies(header: string | null) {
  if (!header) return new Map<string, string>();

  return new Map(
    header
      .split(";")
      .map((part) => part.trim())
      .filter(Boolean)
      .map((part) => {
        const separator = part.indexOf("=");
        if (separator < 0) return [part, ""] as const;
        return [part.slice(0, separator), decodeURIComponent(part.slice(separator + 1))] as const;
      })
  );
}

export function isValidAdminToken(token?: string | null) {
  return Boolean(token && isConfigured() && token === expectedAdminToken());
}

export async function hasAdminSession() {
  if (!isConfigured()) return false;

  const cookieStore = await cookies();
  return cookieStore.get(adminSessionCookieName)?.value === expectedAdminToken();
}

export function requireAdmin(request: Request) {
  if (!isConfigured()) {
    return NextResponse.json(
      { message: "Configure ADMIN_TOKEN no ambiente antes de usar o painel." },
      { status: 503 }
    );
  }

  const token = request.headers.get("x-admin-token");
  if (isValidAdminToken(token)) {
    return null;
  }

  const cookieToken = parseCookies(request.headers.get("cookie")).get(adminSessionCookieName);
  if (isValidAdminToken(cookieToken)) {
    return null;
  }

  return NextResponse.json({ message: "Acesso administrativo negado." }, { status: 401 });
}

export function applyAdminSession(response: NextResponse) {
  response.cookies.set({
    name: adminSessionCookieName,
    value: expectedAdminToken(),
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 8
  });

  return response;
}

export function clearAdminSession(response: NextResponse) {
  response.cookies.set({
    name: adminSessionCookieName,
    value: "",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0
  });

  return response;
}
