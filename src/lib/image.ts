export function shouldUseUnoptimizedImage(src?: string | null) {
  if (!src) return true;
  if (src.startsWith("data:")) return true;
  if (!/^https?:\/\//i.test(src)) return false;

  try {
    const url = new URL(src);
    return !url.pathname.startsWith("/storage/v1/object/public/");
  } catch {
    return true;
  }
}
