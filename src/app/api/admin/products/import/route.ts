import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import {
  buildProductInputFromSpreadsheetRow,
  parseProductsWorkbook,
  type ProductSpreadsheetImportResult
} from "@/lib/product-spreadsheet";
import { slugify } from "@/lib/format";
import { createProduct, hasDatabase, listProducts, updateProduct } from "@/lib/supabase-products";

export async function POST(request: Request) {
  const authError = requireAdmin(request);
  if (authError) return authError;

  if (!hasDatabase()) {
    return NextResponse.json(
      { message: "Conecte o Supabase para importar produtos de verdade." },
      { status: 503 }
    );
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ message: "Envie uma planilha .xlsx para importar." }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const rows = await parseProductsWorkbook(buffer);
    const currentProducts = await listProducts(true);
    const productsBySlug = new Map(currentProducts.map((product) => [product.slug, product]));
    const productsById = new Map(currentProducts.map((product) => [product.id, product]));
    const result: ProductSpreadsheetImportResult = {
      created: 0,
      updated: 0,
      skipped: 0,
      errors: []
    };
    const importedIds = new Set<string>();
    const importedSlugs = new Set<string>();

    for (const row of rows) {
      const rowId = slugify(String(row.fields.id || "").trim());
      const rowSlug = slugify(String(row.fields.slug || "").trim());
      const rowNameSlug = slugify(String(row.fields.name || "").trim());
      const existingByRowId = rowId ? productsById.get(rowId) : undefined;
      const existingByRowSlug = rowSlug ? productsBySlug.get(rowSlug) : undefined;
      const existingByRowNameSlug = rowNameSlug ? productsBySlug.get(rowNameSlug) : undefined;

      if (existingByRowId && existingByRowSlug && existingByRowId.id !== existingByRowSlug.id) {
        result.skipped += 1;
        result.errors.push(
          `Linha ${row.rowNumber}: o id "${rowId}" pertence a "${existingByRowId.name}", mas o slug "${rowSlug}" pertence a "${existingByRowSlug.name}".`
        );
        continue;
      }

      if (rowId && existingByRowSlug && existingByRowSlug.id !== rowId) {
        result.skipped += 1;
        result.errors.push(
          `Linha ${row.rowNumber}: o slug "${rowSlug}" já está em uso por "${existingByRowSlug.name}" e não pode receber o id "${rowId}".`
        );
        continue;
      }

      if (rowId && existingByRowNameSlug && existingByRowNameSlug.id !== rowId) {
        result.skipped += 1;
        result.errors.push(
          `Linha ${row.rowNumber}: o nome informado gera o slug "${rowNameSlug}", que já está em uso por "${existingByRowNameSlug.name}".`
        );
        continue;
      }

      const existingFromSheet =
        existingByRowId ||
        existingByRowSlug ||
        existingByRowNameSlug;
      const parsed = buildProductInputFromSpreadsheetRow(
        row,
        existingFromSheet
      );

      if ("error" in parsed) {
        result.skipped += 1;
        result.errors.push(parsed.error);
        continue;
      }

      const nextId = parsed.input.id || parsed.slug;
      if (importedIds.has(nextId) || importedSlugs.has(parsed.slug)) {
        result.skipped += 1;
        result.errors.push(`Linha ${row.rowNumber}: id ou slug repetido na planilha (${nextId} / ${parsed.slug}).`);
        continue;
      }

      importedIds.add(nextId);
      importedSlugs.add(parsed.slug);

      const existingByNextId = productsById.get(nextId);
      const existingByNextSlug = productsBySlug.get(parsed.slug);

      if (existingByNextId && existingByNextSlug && existingByNextId.id !== existingByNextSlug.id) {
        result.skipped += 1;
        result.errors.push(
          `Linha ${row.rowNumber}: id "${nextId}" e slug "${parsed.slug}" apontam para produtos diferentes.`
        );
        continue;
      }

      if (rowId && existingByNextSlug && existingByNextSlug.id !== nextId && !existingByNextId) {
        result.skipped += 1;
        result.errors.push(
          `Linha ${row.rowNumber}: slug "${parsed.slug}" já está em uso por "${existingByNextSlug.name}".`
        );
        continue;
      }

      const existing = existingByNextId || existingByNextSlug;

      try {
        const saved = existing
          ? await updateProduct(existing.id, parsed.input)
          : await createProduct(parsed.input);

        productsBySlug.set(saved.slug, saved);
        productsById.set(saved.id, saved);

        if (existing) {
          result.updated += 1;
        } else {
          result.created += 1;
        }
      } catch (error) {
        result.skipped += 1;
        result.errors.push(
          `Linha ${row.rowNumber}: ${
            error instanceof Error ? error.message : "não foi possível salvar este produto."
          }`
        );
      }
    }

    return NextResponse.json({
      ...result,
      message: `Importação concluída: ${result.updated} atualizado(s), ${result.created} criado(s), ${result.skipped} ignorado(s).`
    });
  } catch (error) {
    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "Não foi possível importar a planilha."
      },
      { status: 500 }
    );
  }
}
