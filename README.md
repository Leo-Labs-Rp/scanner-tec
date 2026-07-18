# ScannerTec Pro

Catalogo comercial da ScannerTec em Next.js, com vitrine publica, paginas de categoria e produto, lista de orcamento via WhatsApp, painel administrativo, importacao/exportacao Excel e integracao com Supabase.

## Requisitos

- Node.js 20+
- npm
- Projeto Supabase configurado, se for usar banco, storage e admin em producao

## Desenvolvimento

```bash
npm install
npm run dev
```

Abra `http://localhost:3000`.

## Scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
npm run products:audit-content
```

## Variaveis de Ambiente

Use `.env.example` como modelo. Nao commite `.env.local`.

```bash
PUBLIC_BASE_URL=http://localhost:3000
ADMIN_TOKEN=troque-por-uma-senha-forte
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_SERVICE_ROLE_KEY=sua-service-role-key
MERCADO_PAGO_ACCESS_TOKEN=APP_USR_ou_TEST_token_aqui
```

`MERCADO_PAGO_ACCESS_TOKEN` e opcional. Sem ele, ou quando algum produto estiver sem preco, o checkout cai para WhatsApp.

## Deploy na Vercel

1. Suba a branch `main` para o GitHub.
2. Importe o repositorio na Vercel.
3. Configure as mesmas variaveis de ambiente no painel da Vercel.
4. Use o comando de build padrao: `npm run build`.

## Supabase

O schema base esta em `supabase/schema.sql`, com migracoes incrementais em `supabase/migrations`.

Quando `SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY` nao estiverem configurados, o site usa os produtos locais de fallback.
