# Supabase Storage - ScannerTec

Este projeto já está preparado para:

- enviar imagens de banner pelo admin;
- enviar imagem principal e galeria de produtos pelo admin;
- salvar URLs públicas no banco, sem novo deploy no Netlify.

## Variáveis de ambiente

Configure no `.env.local` e no Netlify:

```env
SUPABASE_URL=https://SEU-PROJETO.supabase.co
SUPABASE_SERVICE_ROLE_KEY=SEU_SERVICE_ROLE_KEY
ADMIN_TOKEN=seu-token-admin
```

## Como funciona

- o site continua lendo URLs normais em `imageUrl`;
- quando você envia um arquivo pelo admin, a API manda a imagem para o bucket do Supabase;
- o painel recebe a URL pública e salva isso no banner ou no produto.

## Primeiro uso

1. Acesse `/admin`.
2. Informe o `ADMIN_TOKEN`.
3. Na caixa de storage, clique em `Preparar storage`.
4. O sistema cria o bucket público automaticamente se ele ainda não existir.

## Plano gratuito

Para o uso atual do projeto, o plano gratuito costuma atender bem se você:

- usar JPG/WEBP sempre que possível;
- evitar banners enormes;
- manter imagens de produto em resolução equilibrada.

## Observações

- Sem `SUPABASE_SERVICE_ROLE_KEY`, o upload não funciona.
- Sem `SUPABASE_URL`, o site não consegue montar as URLs públicas.
- Se quiser, você ainda pode informar uma URL manualmente no admin em vez de enviar arquivo.
