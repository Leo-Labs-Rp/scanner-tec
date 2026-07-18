type StorageTarget = "banner" | "product";

type BucketInfo = {
  id: string;
  name?: string;
  public?: boolean;
};

export type StorageAdminStatus = {
  configured: boolean;
  bucket: string;
  bucketExists: boolean;
  publicBaseUrl: string;
  folders: {
    banners: string;
    products: string;
  };
  message?: string;
};

type UploadAdminAssetInput = {
  file: File;
  target: StorageTarget;
  reference?: string;
};

type UploadAdminAssetResult = {
  bucket: string;
  path: string;
  url: string;
};

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const storageBucket = "scannertec-assets";
const bannerFolder = "banners";
const productFolder = "products";
const allowedMimeTypes = ["image/jpeg", "image/png", "image/webp"];
const bucketFileSizeLimit = 10 * 1024 * 1024;

function hasStorageCredentials() {
  return Boolean(supabaseUrl && supabaseServiceRoleKey);
}

function encodePath(path: string) {
  return path
    .split("/")
    .filter(Boolean)
    .map((segment) => encodeURIComponent(segment))
    .join("/");
}

function sanitizeSegment(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function ensureFileExtension(file: File) {
  const lowerName = file.name.toLowerCase();

  if (file.type === "image/png") return ".png";
  if (file.type === "image/webp") return ".webp";
  if (file.type === "image/jpeg") return ".jpg";

  if (lowerName.endsWith(".png")) return ".png";
  if (lowerName.endsWith(".webp")) return ".webp";
  if (lowerName.endsWith(".jpeg")) return ".jpeg";
  if (lowerName.endsWith(".jpg")) return ".jpg";

  return "";
}

function buildObjectPath(target: StorageTarget, file: File, reference?: string) {
  const folder = target === "banner" ? bannerFolder : productFolder;
  const refFolder = reference ? `/${sanitizeSegment(reference)}` : "";
  const stem = sanitizeSegment(file.name.replace(/\.[^.]+$/, "")) || target;
  const ext = ensureFileExtension(file);
  const uniqueFileName = `${Date.now()}-${stem}${ext}`;
  return `${folder}${refFolder}/${uniqueFileName}`;
}

function buildPublicUrl(objectPath: string) {
  return `${supabaseUrl}/storage/v1/object/public/${encodeURIComponent(storageBucket)}/${encodePath(objectPath)}`;
}

async function storageFetch(path: string, init?: RequestInit) {
  if (!hasStorageCredentials()) {
    throw new Error("Storage do Supabase não configurado.");
  }

  const response = await fetch(`${supabaseUrl}/storage/v1/${path}`, {
    ...init,
    headers: {
      apikey: supabaseServiceRoleKey || "",
      Authorization: `Bearer ${supabaseServiceRoleKey}`,
      ...init?.headers
    },
    cache: "no-store"
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || "Erro ao acessar o Storage do Supabase.");
  }

  return response;
}

async function listBuckets() {
  const response = await storageFetch("bucket");
  return (await response.json()) as BucketInfo[];
}

async function getBucketById(bucketId: string) {
  const buckets = await listBuckets();
  return buckets.find((bucket) => bucket.id === bucketId || bucket.name === bucketId) || null;
}

export function getStorageAdminStatusSync(): StorageAdminStatus {
  return {
    configured: hasStorageCredentials(),
    bucket: storageBucket,
    bucketExists: false,
    publicBaseUrl: hasStorageCredentials() ? buildPublicUrl("") : "",
    folders: {
      banners: bannerFolder,
      products: productFolder
    },
    message: hasStorageCredentials()
      ? "Credenciais detectadas. Falta validar ou criar o bucket."
      : "Adicione SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY para ativar uploads."
  };
}

export async function getStorageAdminStatus(): Promise<StorageAdminStatus> {
  const baseStatus = getStorageAdminStatusSync();

  if (!baseStatus.configured) {
    return baseStatus;
  }

  try {
    const bucket = await getBucketById(storageBucket);
    return {
      ...baseStatus,
      bucketExists: Boolean(bucket),
      message: bucket
        ? "Storage pronto para upload."
        : "Bucket ainda não existe. Use o botão Preparar storage no admin."
    };
  } catch (error) {
    return {
      ...baseStatus,
      message: error instanceof Error ? error.message : "Não foi possível validar o Storage."
    };
  }
}

export async function ensureStorageBucket() {
  if (!hasStorageCredentials()) {
    throw new Error("Configure SUPABASE_SERVICE_ROLE_KEY para preparar o Storage.");
  }

  const currentBucket = await getBucketById(storageBucket);
  if (currentBucket) {
    return getStorageAdminStatus();
  }

  await storageFetch("bucket", {
    method: "POST",
    headers: {
      "Content-Type": "application/json; charset=utf-8"
    },
    body: JSON.stringify({
      id: storageBucket,
      name: storageBucket,
      public: true,
      file_size_limit: bucketFileSizeLimit,
      allowed_mime_types: allowedMimeTypes
    })
  });

  return getStorageAdminStatus();
}

export async function uploadAdminAsset(input: UploadAdminAssetInput): Promise<UploadAdminAssetResult> {
  if (!input.file) {
    throw new Error("Nenhum arquivo recebido para upload.");
  }

  if (!allowedMimeTypes.includes(input.file.type)) {
    throw new Error("Use JPG, PNG ou WEBP para o upload.");
  }

  if (input.file.size > bucketFileSizeLimit) {
    throw new Error("A imagem ultrapassa o limite de 10 MB.");
  }

  await ensureStorageBucket();

  const objectPath = buildObjectPath(input.target, input.file, input.reference);
  const fileBytes = new Uint8Array(await input.file.arrayBuffer());

  await storageFetch(`object/${encodeURIComponent(storageBucket)}/${encodePath(objectPath)}`, {
    method: "POST",
    headers: {
      "Content-Type": input.file.type || "application/octet-stream",
      "x-upsert": "true"
    },
    body: fileBytes
  });

  return {
    bucket: storageBucket,
    path: objectPath,
    url: buildPublicUrl(objectPath)
  };
}
