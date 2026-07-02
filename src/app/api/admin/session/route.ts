import { NextResponse } from "next/server";
import { applyAdminSession, clearAdminSession, hasAdminSession, isValidAdminToken } from "@/lib/auth";

export async function GET() {
  return NextResponse.json({ authenticated: await hasAdminSession() });
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { token?: string };

    if (!isValidAdminToken(body?.token)) {
      return NextResponse.json({ message: "Token administrativo inválido." }, { status: 401 });
    }

    return applyAdminSession(NextResponse.json({ authenticated: true }));
  } catch {
    return NextResponse.json({ message: "Não foi possível iniciar a sessão administrativa." }, { status: 400 });
  }
}

export async function DELETE() {
  return clearAdminSession(NextResponse.json({ authenticated: false }));
}
