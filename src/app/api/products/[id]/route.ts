import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { deleteProduct, hasDatabase, updateProduct } from "@/lib/supabase-products";
import type { ProductInput } from "@/types/product";

type Params = {
  params: Promise<{ id: string }>;
};

export async function PUT(request: Request, { params }: Params) {
  const authError = requireAdmin(request);
  if (authError) return authError;

  if (!hasDatabase()) {
    return NextResponse.json(
      { message: "Conecte o Supabase para alterar produtos de verdade." },
      { status: 503 }
    );
  }

  try {
    const { id } = await params;
    const input = (await request.json()) as ProductInput;
    const product = await updateProduct(id, input);

    return NextResponse.json({ product });
  } catch (error) {
    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "Não foi possível atualizar o produto no Supabase."
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request, { params }: Params) {
  const authError = requireAdmin(request);
  if (authError) return authError;

  if (!hasDatabase()) {
    return NextResponse.json(
      { message: "Conecte o Supabase para remover produtos de verdade." },
      { status: 503 }
    );
  }

  try {
    const { id } = await params;
    await deleteProduct(id);

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "Não foi possível remover o produto no Supabase."
      },
      { status: 500 }
    );
  }
}
