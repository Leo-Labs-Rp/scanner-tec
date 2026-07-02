# ScannerTec Pro

Site catálogo/e-commerce consultivo da ScannerTec, feito em Next.js com:

- Página inicial com banners, prateleiras de produtos e filtros.
- Catálogo com busca por texto, categoria, uso, marca e preço.
- Página individual de produto com galeria, descrição longa, especificações e CTA para WhatsApp.
- Lista de orçamento em drawer.
- Checkout preparado para Mercado Pago, com fallback para WhatsApp.
- Painel `/admin` para adicionar, editar e remover produtos.
- Banco de dados via Supabase.
- Fallback com produtos de exemplo quando o banco ainda não foi configurado.

## Rodar Localmente

```bash
npm install
npm run dev
```

Acesse:

- Site: `http://localhost:3000`
- Painel: `http://localhost:3000/admin`

## Variáveis De Ambiente

Copie `.env.example` para `.env.local` e preencha:

```bash
PUBLIC_BASE_URL=http://localhost:3000
ADMIN_TOKEN=crie-uma-senha-forte
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_SERVICE_ROLE_KEY=sua-service-role-key
MERCADO_PAGO_ACCESS_TOKEN=seu-token
```

Sem Supabase, o site mostra dados de exemplo e o painel não salva produtos.

Sem Mercado Pago, o botão de pagamento envia a lista do carrinho para o WhatsApp.

## Banco De Dados

1. Crie um projeto no Supabase.
2. Abra o SQL Editor.
3. Rode o arquivo `supabase/schema.sql`.
4. Se o banco já existir, rode também:
   - `supabase/migrations/202606230001_add_catalog_enhancements.sql`
   - `supabase/migrations/202606230002_add_sku_and_use_tags.sql`
5. Copie `Project URL` para `SUPABASE_URL`.
6. Copie `service_role key` para `SUPABASE_SERVICE_ROLE_KEY`.

Importante: a `service_role key` deve ficar somente no servidor. Não coloque essa chave no frontend.

## Painel De Produtos

No painel `/admin`, informe o mesmo valor configurado em `ADMIN_TOKEN`.

Você pode editar:

- Nome, slug, categoria, marca e descrições.
- SKU/código interno.
- Preço atual, preço antigo e condição de pagamento.
- Imagem principal e galeria de imagens.
- Tags comerciais e filtros de uso.
- Especificações técnicas em JSON.
- Produto ativo, destaque e “mais vistos”.

Para imagens novas, suba o arquivo em `public/assets` e use o caminho `/assets/nome-do-arquivo.ext`, ou use uma URL pública.

Observação sobre Netlify:
Evite cadastrar variáveis públicas ou nomes internos de tabela/bucket no painel. Este projeto já usa constantes para:

- número do WhatsApp;
- tabela `products`;
- tabela `site_settings`;
- bucket `scannertec-assets`;
- pastas `banners` e `products`.

## Assets E Logo

- Logo transparente usada no site: `public/assets/scannertec-logo-transparent.png`.
- Imagem social/preview: `public/assets/scannertec-logo.jpeg`.
- O `og:image` de produção aponta para `https://scannertec.netlify.app/assets/scannertec-logo.jpeg`.

## Revisão De Produtos

Para listar nomes e descrições vindos do Supabase e revisar acentuação:

```bash
node scripts/list-products-review.mjs
```

O site também aplica uma sanitização leve em textos comuns de catálogo para corrigir termos como `diagnostico`, `orcamento`, `condicoes` e similares.

## Pagamento

A rota `POST /api/checkout` cria uma preferência no Mercado Pago quando `MERCADO_PAGO_ACCESS_TOKEN` está configurado.

Configure também:

```bash
PUBLIC_BASE_URL=https://seudominio.com.br
```

Assim o Mercado Pago consegue voltar para:

- `/pagamento/sucesso`
- `/pagamento/erro`
- `/pagamento/pendente`

## Domínio

Na Netlify:

1. Importe o repositório.
2. Build command: `npm run build`.
3. Publish directory: `.next`.
4. Configure as variáveis de ambiente.
5. Adicione o domínio em `Domain management`.

Na Vercel:

1. Suba o projeto para o GitHub.
2. Importe na Vercel.
3. Configure as variáveis de ambiente.
4. Em `Settings > Domains`, adicione o domínio do cliente.
5. Ajuste o DNS conforme a Vercel mostrar.

Para Next.js com rotas de API, Vercel costuma ser o caminho mais simples. Na Netlify, mantenha o `netlify.toml` do projeto.
