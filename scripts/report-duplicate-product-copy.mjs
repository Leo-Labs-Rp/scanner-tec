import fs from "node:fs";
import fsp from "node:fs/promises";
import path from "node:path";

const tableName = "products";
const reportDir = path.resolve(process.cwd(), "reports");
const jsonPath = path.join(reportDir, "duplicate-product-copy-report.json");
const csvPath = path.join(reportDir, "duplicate-product-copy-report.csv");

function loadLocalEnv() {
  const envPath = path.resolve(process.cwd(), ".env.local");
  if (!fs.existsSync(envPath)) return;

  const content = fs.readFileSync(envPath, "utf8");
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const separatorIndex = trimmed.indexOf("=");
    if (separatorIndex <= 0) continue;
    const key = trimmed.slice(0, separatorIndex).trim();
    const rawValue = trimmed.slice(separatorIndex + 1).trim();
    const value = rawValue.replace(/^['"]|['"]$/g, "");
    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

function sanitizeCopy(value = "") {
  let current = String(value);

  for (let attempt = 0; attempt < 3; attempt += 1) {
    if (!/[ÃƒÃ‚Ã¯Â¿Â½]/.test(current)) break;
    const decoded = Buffer.from(current, "latin1").toString("utf8");
    if (!decoded || decoded === current) break;
    current = decoded;
  }

  return current
    .replace(/Ã¯Â¿Â½/g, "à")
    .replace(/ï¿½/g, "")
    .replace(/\r\n/g, "\n")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeComparableCopy(value = "") {
  return sanitizeCopy(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function isDuplicatedDescription(name, description) {
  const normalizedName = normalizeComparableCopy(name);
  const normalizedDescription = normalizeComparableCopy(description);
  if (!normalizedName || !normalizedDescription) return false;
  return normalizedName === normalizedDescription;
}

function csvCell(value) {
  const text = Array.isArray(value) ? value.join(" | ") : String(value ?? "");
  return `"${text.replaceAll('"', '""')}"`;
}

function buildDraft(row) {
  return {
    status: "rascunho - revisar",
    full_name: sanitizeCopy(row.name),
    commercial_summary: "",
    applications: "",
    benefits: [],
    compatibility: "",
    brand: sanitizeCopy(row.brand || ""),
    price_or_condition: sanitizeCopy(row.payment_info || row.stock_status || ""),
    video_url: sanitizeCopy(row.youtube_url || "")
  };
}

loadLocalEnv();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Configure SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY antes de rodar o relatório.");
  process.exit(1);
}

const response = await fetch(
  `${supabaseUrl}/rest/v1/${tableName}?select=id,name,slug,category,brand,description,payment_info,stock_status,youtube_url&order=name.asc`,
  {
    headers: {
      apikey: supabaseKey,
      Authorization: `Bearer ${supabaseKey}`,
      Accept: "application/json; charset=utf-8"
    }
  }
);

if (!response.ok) {
  console.error(await response.text());
  process.exit(1);
}

const rows = await response.json();
const affected = rows
  .filter((row) => isDuplicatedDescription(row.name, row.description))
  .map((row) => ({
    id: row.id,
    slug: row.slug,
    name: sanitizeCopy(row.name),
    category: sanitizeCopy(row.category),
    description: sanitizeCopy(row.description),
    draft: buildDraft(row)
  }));

await fsp.mkdir(reportDir, { recursive: true });
await fsp.writeFile(
  jsonPath,
  JSON.stringify(
    {
      generatedAt: new Date().toISOString(),
      totalAffected: affected.length,
      products: affected
    },
    null,
    2
  ),
  "utf8"
);

const csvHeader = [
  "id",
  "slug",
  "name",
  "category",
  "description_atual",
  "full_name",
  "commercial_summary",
  "applications",
  "benefits",
  "compatibility",
  "brand",
  "price_or_condition",
  "video_url",
  "status"
].join(",");

const csvRows = affected.map((row) =>
  [
    row.id,
    row.slug,
    row.name,
    row.category,
    row.description,
    row.draft.full_name,
    row.draft.commercial_summary,
    row.draft.applications,
    row.draft.benefits,
    row.draft.compatibility,
    row.draft.brand,
    row.draft.price_or_condition,
    row.draft.video_url,
    row.draft.status
  ]
    .map(csvCell)
    .join(",")
);

await fsp.writeFile(csvPath, [csvHeader, ...csvRows].join("\n"), "utf8");

console.log(`Relatório gerado com ${affected.length} produto(s) em:`);
console.log(`- ${jsonPath}`);
console.log(`- ${csvPath}`);
