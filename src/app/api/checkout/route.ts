import { NextResponse } from "next/server";
import { buildQuoteRequestMessage } from "@/lib/catalog";
import { listProducts } from "@/lib/supabase-products";
import { whatsappUrl } from "@/lib/whatsapp";

type CheckoutItem = {
  id: string;
  quantity: number;
};

type CheckoutBody = {
  items: CheckoutItem[];
  customer?: {
    name?: string;
    phone?: string;
  };
};

export async function POST(request: Request) {
  const body = (await request.json()) as CheckoutBody;
  const products = await listProducts();
  const selected = body.items
    .map((item) => {
      const product = products.find((candidate) => candidate.id === item.id);
      if (!product) return null;
      return { ...product, quantity: Math.max(1, item.quantity || 1) };
    })
    .filter((item): item is NonNullable<typeof item> => Boolean(item));

  if (!selected.length) {
    return NextResponse.json({ message: "Lista vazia." }, { status: 400 });
  }

  const mercadoPagoToken = process.env.MERCADO_PAGO_ACCESS_TOKEN;
  const baseUrl = process.env.PUBLIC_BASE_URL || "https://scannertec.com";

  if (!mercadoPagoToken || selected.some((item) => item.price === null)) {
    return NextResponse.json({
      mode: "whatsapp",
      whatsappUrl: whatsappUrl(buildQuoteRequestMessage(selected))
    });
  }

  const response = await fetch("https://api.mercadopago.com/checkout/preferences", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${mercadoPagoToken}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      items: selected.map((item) => ({
        id: item.id,
        title: item.name,
        quantity: item.quantity,
        unit_price: item.price,
        currency_id: "BRL"
      })),
      payer: {
        name: body.customer?.name,
        phone: { number: body.customer?.phone }
      },
      back_urls: {
        success: `${baseUrl}/pagamento/sucesso`,
        failure: `${baseUrl}/pagamento/erro`,
        pending: `${baseUrl}/pagamento/pendente`
      },
      auto_return: "approved",
      statement_descriptor: "SCANNERTEC"
    })
  });

  if (!response.ok) {
    return NextResponse.json(
      { message: "Não foi possível criar o checkout no Mercado Pago." },
      { status: 502 }
    );
  }

  const preference = await response.json();

  return NextResponse.json({
    mode: "mercado_pago",
    checkoutUrl: preference.init_point || preference.sandbox_init_point
  });
}
