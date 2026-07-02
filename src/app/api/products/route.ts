import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { createProduct, hasDatabase, listProducts } from "@/lib/supabase-products";
import type { ProductInput } from "@/types/product";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const includeInactive = searchParams.get("includeInactive") === "true";

  if (includeInactive) {
    const authError = requireAdmin(request);
    if (authError) return authError;
  }

  return NextResponse.json({
    databaseConfigured: hasDatabase(),
    products: await listProducts(includeInactive)
  });
}

export async function POST(request: Request) {
  const authError = requireAdmin(request);
  if (authError) return authError;

  if (!hasDatabase()) {
    return NextResponse.json(
      { message: "Conecte o Supabase para salvar produtos de verdade." },
      { status: 503 }
    );
  }

  try {
    const input = (await request.json()) as ProductInput;
    const product = await createProduct(input);

    return NextResponse.json({ product }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "Não foi possível salvar o produto no Supabase."
      },
      { status: 500 }
    );
  }
}
