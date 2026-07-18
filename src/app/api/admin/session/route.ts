import { NextResponse } from "next/server";
import {
  applyAdminSession,
  checkAdminLoginRateLimit,
  clearAdminLoginAttempts,
  clearAdminSession,
  hasAdminSession,
  isValidAdminToken,
  recordFailedAdminLogin
} from "@/lib/auth";

export async function GET() {
  return NextResponse.json({ authenticated: await hasAdminSession() });
}

export async function POST(request: Request) {
  const rateLimitError = checkAdminLoginRateLimit(request);
  if (rateLimitError) return rateLimitError;

  try {
    const body = (await request.json()) as { token?: string };

    if (!isValidAdminToken(body?.token)) {
      recordFailedAdminLogin(request);
      return NextResponse.json({ message: "Token administrativo invalido." }, { status: 401 });
    }

    clearAdminLoginAttempts(request);
    return applyAdminSession(NextResponse.json({ authenticated: true }));
  } catch {
    recordFailedAdminLogin(request);
    return NextResponse.json({ message: "Nao foi possivel iniciar a sessao administrativa." }, { status: 400 });
  }
}

export async function DELETE() {
  return clearAdminSession(NextResponse.json({ authenticated: false }));
}
