const SUPABASE_PUBLIC_OBJECT_PATH = "/storage/v1/object/public/";
const SUPABASE_PUBLIC_RENDER_PATH = "/storage/v1/render/image/public/";

type SupabaseImageOptions = {
  height?: number;
  quality?: number;
  width?: number;
};

export function optimizeSupabaseImageUrl(
  src?: string | null,
  { height = 700, quality = 80, width = 700 }: SupabaseImageOptions = {}
) {
  if (!src || !/^https?:\/\//i.test(src)) return src || "";

  try {
    const url = new URL(src);
    if (!url.pathname.startsWith(SUPABASE_PUBLIC_OBJECT_PATH)) return src;

    url.pathname = url.pathname.replace(SUPABASE_PUBLIC_OBJECT_PATH, SUPABASE_PUBLIC_RENDER_PATH);
    url.searchParams.set("width", String(width));
    url.searchParams.set("height", String(height));
    url.searchParams.set("resize", "contain");
    url.searchParams.set("quality", String(quality));
    return url.toString();
  } catch {
    return src;
  }
}

export function shouldUseUnoptimizedImage(src?: string | null) {
  if (!src) return true;
  if (src.startsWith("data:")) return true;
  if (!/^https?:\/\//i.test(src)) return false;

  try {
    const url = new URL(src);
    return !(
      url.pathname.startsWith(SUPABASE_PUBLIC_OBJECT_PATH) ||
      url.pathname.startsWith(SUPABASE_PUBLIC_RENDER_PATH)
    );
  } catch {
    return true;
  }
}
