import { repairMojibake, slugify } from "@/lib/format";

const productAssetsPrefix = "/assets/products/";

function safeDecode(value: string) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function normalizeProductAssetFileName(value: string) {
  const decoded = repairMojibake(safeDecode(value)).replace(/\\/g, "/").replace(/^\/+/, "");
  const [pathWithoutSuffix, suffix = ""] = decoded.split(/([?#].*)/, 2);
  const parts = pathWithoutSuffix.split("/");
  const filename = parts.pop() || "";
  const extensionMatch = filename.match(/(\.[a-z0-9]{2,5})$/i);
  const extension = extensionMatch?.[1]?.toLowerCase() || "";
  const basename = extension ? filename.slice(0, -extension.length) : filename;
  const normalizedFilename = `${slugify(repairMojibake(basename)) || slugify(filename)}${extension}`;

  return [...parts.filter(Boolean), normalizedFilename].join("/") + suffix;
}

export function normalizeProductAssetUrl(value?: string | null) {
  const raw = repairMojibake(String(value || "").trim());
  if (!raw) return "";
  if (/^(https?:|data:)/i.test(raw)) return raw;

  const decoded = safeDecode(raw).replace(/\\/g, "/");

  if (decoded.startsWith(productAssetsPrefix)) {
    return `${productAssetsPrefix}${normalizeProductAssetFileName(decoded.slice(productAssetsPrefix.length))}`;
  }

  if (decoded.startsWith("/assets/")) {
    return decoded;
  }

  if (decoded.startsWith("/")) {
    return decoded;
  }

  return `${productAssetsPrefix}${normalizeProductAssetFileName(decoded)}`;
}

export function normalizeProductAssetList(values?: Array<string | null | undefined> | null, fallback?: string) {
  const normalized = (values || []).map(normalizeProductAssetUrl).filter(Boolean);
  const fallbackUrl = normalizeProductAssetUrl(fallback);

  return Array.from(new Set([fallbackUrl, ...normalized].filter(Boolean)));
}
