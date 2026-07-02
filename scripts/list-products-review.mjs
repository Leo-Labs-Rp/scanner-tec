const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const tableName = "products";

if (!supabaseUrl || !supabaseKey) {
  console.error("Configure SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY.");
  process.exit(1);
}

const response = await fetch(
  `${supabaseUrl}/rest/v1/${tableName}?select=name,description,price,payment_info,use_tags&order=name.asc`,
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

const products = await response.json();

for (const product of products) {
  console.log(`\nProduto: ${product.name}`);
  console.log(`Descrição: ${product.description}`);
  console.log(`Preço: ${product.price ?? "sob consulta"}`);
  console.log(`Pagamento: ${product.payment_info || "não informado"}`);
  console.log(`Usos: ${(product.use_tags || []).join(", ") || "não informado"}`);
}
