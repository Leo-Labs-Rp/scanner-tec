import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { hasDatabase } from "@/lib/supabase-products";
import { getHomeBannerSettings, updateHomeBannerSettings } from "@/lib/site-settings";
import type { HomeBannerSettings } from "@/types/site-settings";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const authError = requireAdmin(request);
  if (authError) return authError;

  return NextResponse.json({
    databaseConfigured: hasDatabase(),
    settings: await getHomeBannerSettings()
  });
}

export async function PUT(request: Request) {
  const authError = requireAdmin(request);
  if (authError) return authError;

  if (!hasDatabase()) {
    return NextResponse.json(
      { message: "Conecte o Supabase para salvar as configurações do banner." },
      { status: 503 }
    );
  }

  try {
    const input = (await request.json()) as HomeBannerSettings;
    const settings = await updateHomeBannerSettings(input);

    return NextResponse.json({ settings });
  } catch (error) {
    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "Não foi possível salvar o banner no Supabase."
      },
      { status: 500 }
    );
  }
}
