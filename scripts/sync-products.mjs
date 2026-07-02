import fs from 'node:fs';
import path from 'node:path';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const tableName = 'products';

if (!supabaseUrl || !supabaseKey) {
  console.log('❌ Erro: Configure SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY no ambiente.');
  process.exit(1);
}

const jsonPath = path.resolve('src/lib/produtos_scannertec.json');

const manometerSlugs = new Set([
  'teste-fluido-de-freio',
  'teste-de-compressao',
  'teste-pressao-de-oleo',
  'teste-de-cilindros',
  'teste-bomba-combustivel',
  'teste-de-arrefecimento'
]);

const featuredSlugs = new Set([
  'scanner-multimec-x3',
  'scanner-raven-pro-3-com-tablet',
  'autel-ds900-bt',
  'launch-x431-pro',
  'autel-maxisys-ms908s3',
  'autel-mx900',
  'scanlink-moto-planatc',
  'maquina-bicos-injetores-planatc',
  'maquina-troca-oleo-cambio',
  'alinhador-digital-rack-laserteck',
  'elevador-25t-trifasico',
  'elevador-41t-trifasico'
]);

function normalizeText(value) {
  return (value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

function mapCategory(category, slug) {
  if (manometerSlugs.has(slug)) {
    return 'manometros';
  }
  const normalized = normalizeText(category);
  if (['scanners', 'diagnostico', 'atualizacoes', 'chaves', 'diagramas'].includes(normalized)) {
    return 'scanners';
  }
  if (['injecao', 'limpeza', 'fluidos', 'pneus', 'alinhamento'].includes(normalized)) {
    return 'maquinas';
  }
  return 'equipamentos';
}

function inferBrand(name) {
  const brands = [
    'Autel', 'Raven', 'Launch', 'Planatc', 'Injetec', 'Potente Brasil', 
    'Chiptronic', 'Multimec', 'Laserteck', 'Maxfort', 'Autop', 'Tecnoscópio'
  ];
  return brands.find((b) => name.toLowerCase().includes(b.toLowerCase())) || 'ScannerTec';
}

// 1. SEED: Lê o JSON e envia/atualiza no Supabase
async function seedSupabase() {
  console.log('Lendo produtos do JSON...');
  const rawData = fs.readFileSync(jsonPath, 'utf8');
  const rawProducts = JSON.parse(rawData);

  console.log(`Carregados ${rawProducts.length} produtos do JSON. Enviando para o Supabase...`);

  let count = 0;
  for (const product of rawProducts) {
    const category = mapCategory(product.categoria, product.slug);
    const brand = inferBrand(product.nome);
    const price = product.preco_vista ?? product.preco_parcelado ?? null;
    const paymentInfo = product.condicao_pagamento || product.preco_texto || 'Consulte condições';
    const stockStatus = product.preco_texto === 'Consulte' ? 'Consulte' : 'Disponível sob consulta';
    const imageUrl = `/assets/products/${product.imagem_ref}`;

    const dbProduct = {
      id: product.slug,
      name: product.nome,
      slug: product.slug,
      category: category,
      brand: brand,
      description: product.subtitulo || `Equipamento profissional da linha ${brand}.`,
      detail: `${product.nome}${product.subtitulo ? ` - ${product.subtitulo}` : ''}.\nLinha ${brand} para oficinas e reparadores.\n${product.observacao || ''}`,
      price: price,
      old_price: null,
      image_url: imageUrl,
      images: [imageUrl],
      active: true,
      featured: featuredSlugs.has(product.slug),
      most_viewed: featuredSlugs.has(product.slug),
      stock_status: stockStatus,
      payment_note: paymentInfo,
      payment_info: paymentInfo,
      tags: [],
      use_tags: [],
      use: [],
      specs: {
        'Categoria original': product.categoria,
        'Marca': brand,
        'Pagamento': paymentInfo
      },
      youtube_url: null
    };

    try {
      const response = await fetch(`${supabaseUrl}/rest/v1/${tableName}`, {
        method: 'POST',
        headers: {
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
          Prefer: 'resolution=merge-duplicates' // UPSERT
        },
        body: JSON.stringify(dbProduct)
      });

      if (!response.ok) {
        console.error(`❌ Erro ao enviar ${product.nome}:`, await response.text());
      } else {
        count++;
      }
    } catch (err) {
      console.error(`❌ Erro de rede para ${product.nome}:`, err.message);
    }
  }

  console.log(`\n🎉 Concluído! ${count} de ${rawProducts.length} produtos sincronizados com sucesso no Supabase.`);
}

// 2. PULL: Busca do Supabase e atualiza o JSON local
async function pullToJson() {
  console.log('Buscando produtos do Supabase...');
  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/${tableName}?select=*&order=name.asc`, {
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
        Accept: 'application/json; charset=utf-8'
      }
    });

    if (!response.ok) {
      throw new Error(await response.text());
    }

    const dbProducts = await response.json();
    console.log(`Obtidos ${dbProducts.length} produtos do Supabase.`);

    let existingProducts = [];
    try {
      existingProducts = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    } catch {
      console.log('Nenhum JSON existente ou arquivo corrompido, criando novo.');
    }

    const existingMap = new Map(existingProducts.map((p) => [p.slug, p]));
    let maxId = existingProducts.reduce((max, p) => (p.id > max ? p.id : max), 0);

    const updatedJsonProducts = dbProducts.map((dbProd) => {
      const existing = existingMap.get(dbProd.slug);
      const id = existing ? existing.id : ++maxId;
      const categoria = existing ? existing.categoria : dbProd.category;
      const subtitulo = dbProd.description !== `Equipamento profissional da linha ${dbProd.brand}.` 
        ? dbProd.description 
        : null;

      let preco_vista = dbProd.price;
      let preco_parcelado = null;
      let preco_texto = null;

      if (dbProd.payment_info?.toLowerCase().includes('10x')) {
        preco_parcelado = dbProd.price;
        preco_vista = null;
      }
      if (dbProd.stock_status === 'Consulte') {
        preco_texto = 'Consulte';
        preco_vista = null;
      }

      let imagem_ref = '';
      if (dbProd.image_url) {
        const parts = dbProd.image_url.split('/');
        imagem_ref = parts[parts.length - 1];
      }

      return {
        id,
        nome: dbProd.name,
        subtitulo: subtitulo || null,
        preco_vista,
        preco_parcelado,
        preco_texto,
        condicao_pagamento: dbProd.payment_info || null,
        categoria,
        slug: dbProd.slug,
        imagem_ref,
        observacao: dbProd.specs?.['Observação comercial'] || null
      };
    });

    fs.writeFileSync(jsonPath, JSON.stringify(updatedJsonProducts, null, 2), 'utf8');
    console.log(`\n🎉 Arquivo ${jsonPath} atualizado com sucesso com ${updatedJsonProducts.length} produtos.`);
  } catch (err) {
    console.error('❌ Erro ao buscar do Supabase:', err.message);
  }
}

const mode = process.argv[2];
if (mode === '--seed') {
  seedSupabase();
} else if (mode === '--pull') {
  pullToJson();
} else {
  console.log('Uso:');
  console.log('  node --env-file=.env.local scripts/sync-products.mjs --seed   (Envia os produtos do JSON local para o Supabase)');
  console.log('  node --env-file=.env.local scripts/sync-products.mjs --pull   (Busca os produtos do Supabase e atualiza o JSON local)');
}
