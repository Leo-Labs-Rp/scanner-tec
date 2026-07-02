export const whatsappNumber = "5517981561200";

export function whatsappUrl(message: string) {
  return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
}

export function whatsappDirectUrl() {
  return `https://wa.me/${whatsappNumber}`;
}
