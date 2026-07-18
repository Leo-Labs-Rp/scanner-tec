export const whatsappNumber = "5517981126458";

export function whatsappUrl(message: string) {
  return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
}

export function whatsappDirectUrl() {
  return `https://wa.me/${whatsappNumber}`;
}
