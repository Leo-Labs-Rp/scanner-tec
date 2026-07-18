# Supabase Storage - ScannerTec

Este projeto ja esta preparado para:

- enviar imagens de banner pelo admin;
- enviar imagem principal e galeria de produtos pelo admin;
- salvar URLs publicas no banco, sem novo deploy.

## Variaveis de ambiente

Configure no `.env.local` e tambem no provedor de deploy:

```env
SUPABASE_URL=https://SEU-PROJETO.supabase.co
SUPABASE_SERVICE_ROLE_KEY=SEU_SERVICE_ROLE_KEY
ADMIN_TOKEN=seu-token-admin
```

## Como funciona

- o site continua lendo URLs normais em `imageUrl`;
- quando voce envia um arquivo pelo admin, a API manda a imagem para o bucket do Supabase;
- o painel recebe a URL publica e salva isso no banner ou no produto.

## Primeiro uso

1. Acesse `/admin`.
2. Informe o `ADMIN_TOKEN`.
3. Na caixa de storage, clique em `Preparar storage`.
4. O sistema cria o bucket publico automaticamente se ele ainda nao existir.

## Plano gratuito

Para o uso atual do projeto, o plano gratuito costuma atender bem se voce:

- usar JPG/WEBP sempre que possivel;
- evitar banners enormes;
- manter imagens de produto em resolucao equilibrada.

## Observacoes

- Sem `SUPABASE_SERVICE_ROLE_KEY`, o upload nao funciona.
- Sem `SUPABASE_URL`, o site nao consegue montar as URLs publicas.
- O upload aceita JPG, PNG e WEBP. SVG nao e aceito no storage publico por seguranca.
- Se quiser, voce ainda pode informar uma URL manualmente no admin em vez de enviar arquivo.
