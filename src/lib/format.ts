export function formatCurrency(value: number | null) {
  if (value === null) return "Sob consulta";

  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL"
  });
}

export function formatInstallment(value: number | null, installments = 10) {
  if (value === null) return null;

  return `${installments}x de ${formatCurrency(value / installments)}`;
}

export function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

export function repairMojibake(value?: string | null) {
  if (!value) return "";

  let current = value;

  for (let attempt = 0; attempt < 3; attempt += 1) {
    if (!/[ÃÂï¿½]/.test(current)) break;

    const decoded = Buffer.from(current, "latin1").toString("utf8");
    if (!decoded || decoded === current) break;
    current = decoded;
  }

  return current
    .replace(/ï¿½/g, "à")
    .replace(/�/g, "")
    .trim();
}
