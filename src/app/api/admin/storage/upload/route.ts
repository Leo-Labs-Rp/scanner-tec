import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { uploadAdminAsset } from "@/lib/supabase-storage";

export async function POST(request: Request) {
  const authError = requireAdmin(request);
  if (authError) return authError;

  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const targetValue = String(formData.get("target") || "product");
    const reference = String(formData.get("reference") || "");

    if (!(file instanceof File)) {
      return NextResponse.json({ message: "Selecione uma imagem para enviar." }, { status: 400 });
    }

    if (targetValue !== "banner" && targetValue !== "product") {
      return NextResponse.json({ message: "Destino de upload inválido." }, { status: 400 });
    }

    const uploaded = await uploadAdminAsset({
      file,
      target: targetValue,
      reference
    });

    return NextResponse.json({
      message: "Imagem enviada com sucesso.",
      file: uploaded
    });
  } catch (error) {
    return NextResponse.json(
      {
        message: error instanceof Error ? error.message : "Não foi possível enviar a imagem."
      },
      { status: 500 }
    );
  }
}
