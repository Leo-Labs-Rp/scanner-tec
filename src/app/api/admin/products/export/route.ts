import { requireAdmin } from "@/lib/auth";
import { buildProductsWorkbook } from "@/lib/product-spreadsheet";
import { listProducts } from "@/lib/supabase-products";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const authError = requireAdmin(request);
  if (authError) return authError;

  const products = await listProducts(true);
  const workbook = await buildProductsWorkbook(products);
  const filename = `scannertec-produtos-${new Date().toISOString().slice(0, 10)}.xlsx`;
  const spreadsheet = new Blob([new Uint8Array(workbook)], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  });

  return new Response(spreadsheet, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store"
    }
  });
}
