import { timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export const adminSessionCookieName = "scannertec_admin_session";

const adminLoginWindowMs = 15 * 60 * 1000;
const adminLoginMaxAttempts = 8;
const adminLoginAttempts = new Map<string, { count: number; resetAt: number }>();

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

function adminLoginKey(request: Request) {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "local"
  );
}

function constantTimeEquals(value: string, expected: string) {
  const valueBuffer = Buffer.from(value);
  const expectedBuffer = Buffer.from(expected);

  if (valueBuffer.length !== expectedBuffer.length) {
    const maxLength = Math.max(valueBuffer.length, expectedBuffer.length);
    timingSafeEqual(Buffer.alloc(maxLength, 0), Buffer.alloc(maxLength, 1));
    return false;
  }

  return timingSafeEqual(valueBuffer, expectedBuffer);
}

export function isValidAdminToken(token?: string | null) {
  const expected = expectedAdminToken();
  return Boolean(token && expected && constantTimeEquals(token, expected));
}

export function checkAdminLoginRateLimit(request: Request) {
  const key = adminLoginKey(request);
  const now = Date.now();
  const current = adminLoginAttempts.get(key);

  if (!current || current.resetAt <= now) {
    adminLoginAttempts.delete(key);
    return null;
  }

  if (current.count < adminLoginMaxAttempts) {
    return null;
  }

  const retryAfterSeconds = Math.ceil((current.resetAt - now) / 1000);

  return NextResponse.json(
    { message: "Muitas tentativas de acesso. Aguarde alguns minutos e tente novamente." },
    {
      status: 429,
      headers: {
        "Retry-After": String(retryAfterSeconds)
      }
    }
  );
}

export function recordFailedAdminLogin(request: Request) {
  const key = adminLoginKey(request);
  const now = Date.now();
  const current = adminLoginAttempts.get(key);

  if (!current || current.resetAt <= now) {
    adminLoginAttempts.set(key, { count: 1, resetAt: now + adminLoginWindowMs });
    return;
  }

  adminLoginAttempts.set(key, {
    count: current.count + 1,
    resetAt: current.resetAt
  });
}

export function clearAdminLoginAttempts(request: Request) {
  adminLoginAttempts.delete(adminLoginKey(request));
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
