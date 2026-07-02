import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { ensureStorageBucket, getStorageAdminStatus } from "@/lib/supabase-storage";

export async function GET(request: Request) {
  const authError = requireAdmin(request);
  if (authError) return authError;

  return NextResponse.json({
    storage: await getStorageAdminStatus()
  });
}

export async function POST(request: Request) {
  const authError = requireAdmin(request);
  if (authError) return authError;

  try {
    const storage = await ensureStorageBucket();
    return NextResponse.json({
      message: "Storage preparado com sucesso.",
      storage
    });
  } catch (error) {
    return NextResponse.json(
      {
        message: error instanceof Error ? error.message : "Não foi possível preparar o Storage."
      },
      { status: 500 }
    );
  }
}
