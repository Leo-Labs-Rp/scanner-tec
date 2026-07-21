const whatsappNumberEnv = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "";

function normalizeWhatsappNumber(value: string) {
  const digits = value.replace(/\D/g, "");
  if (!digits) return "";
  return digits.startsWith("55") ? digits : `55${digits}`;
}

export const whatsappNumber = normalizeWhatsappNumber(whatsappNumberEnv);

export function whatsappUrl(message: string) {
  return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
}

export function whatsappDirectUrl() {
  return `https://wa.me/${whatsappNumber}`;
}
