import Link from "next/link";

const labels: Record<string, string> = {
  sucesso: "Pagamento aprovado",
  erro: "Pagamento não concluído",
  pendente: "Pagamento pendente"
};

export default async function PaymentStatusPage({
  params
}: {
  params: Promise<{ status: string }>;
}) {
  const { status } = await params;

  return (
    <main className="status-page">
      <Link href="/" className="brand compact">
        <span className="brand-mark">ST</span>
        <span>ScannerTec</span>
      </Link>
      <section className="status-card">
        <p className="eyebrow">Checkout</p>
        <h1>{labels[status] || "Status do pagamento"}</h1>
        <p>
          Caso precise confirmar disponibilidade, nota fiscal, entrega ou retirada, fale com o
          vendedor pelo WhatsApp.
        </p>
        <Link className="btn btn-primary" href="/">
          Voltar ao catálogo
        </Link>
      </section>
    </main>
  );
}
