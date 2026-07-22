# Changelog de performance

Branch: `perf/pagespeed-fixes`

## Fase 1 - Diagnostico de LCP/TBT

### Verificacoes realizadas

- Home validada em viewport mobile de 390 x 844 pixels.
- Console do navegador sem erros, warnings de hidratacao ou loops de renderizacao.
- Conteudo principal, produtos e banner sao entregues pelo servidor. Nao existe fetch client-side bloqueando o primeiro paint da home.
- Os `useEffect` da home iniciam apenas a rotacao do banner e o deslocamento do carrossel depois da renderizacao.
- Nenhum pixel de marketing, analytics ou chat externo foi encontrado no `head`.
- O unico recurso de terceiros sincrono no `head` e o CSS completo do Font Awesome carregado pelo cdnjs.
- A imagem do banner usa `fetchPriority="high"`, mas o HTML gerado ainda a marca como `loading="lazy"`.
- No layout mobile, o maior conteudo visual inicial passa a ser a vitrine de produtos, cujas imagens tambem usam lazy-load.

### Lighthouse local

Execucao em perfil mobile com throttling simulado, Lighthouse 13.4.1:

| Metrica | Baseline local em desenvolvimento |
| --- | ---: |
| Performance | 38 |
| FCP | 4,2 s |
| LCP | 10,0 s |
| TBT | 1.180 ms |
| Speed Index | 6,1 s |
| CLS | 0,015 |
| Resposta do documento | 1.790 ms |

O processador de trace registrou `LanternError: NO_LCP`, reproduzindo o sintoma do PageSpeed, embora o relatorio JSON tenha conseguido calcular LCP e TBT. Como a execucao foi feita no servidor de desenvolvimento, os tempos absolutos nao serao usados como criterio final; a comparacao final sera feita no build de producao.

### Causas e riscos identificados

1. Font Awesome adiciona CSS bloqueante e tres webfonts externas antes da primeira pintura completa.
2. O lazy-load de todas as imagens candidatas ao LCP torna a deteccao mais sensivel a rede lenta.
3. A home renderiza uma quantidade grande de cards e imagens. Esse ponto foi documentado, mas nao sera alterado porque o escopo do trabalho proibe mudancas em queries e logica de negocio.
4. Nao foi encontrada evidencia de erro de JavaScript, hidratacao ou fetch client-side como causa do `NO_LCP`.

### Evidencia visual

- `artifacts/performance/baseline-mobile.png`

## Fase 2 - Font Awesome

Status: concluida.

### Alteracoes

- `package.json` e `package-lock.json`: adicionada a dependencia `lucide-react`.
- `src/app/layout.tsx`: removido o stylesheet bloqueante do Font Awesome no cdnjs.
- `src/components/SiteIcons.tsx`: icones compartilhados migrados para Lucide; o YouTube usa SVG inline local porque a versao instalada nao expoe um icone de marca equivalente.
- `src/features/catalog/config.ts`: vantagens da home passaram a referenciar componentes locais.
- `src/components/Storefront.tsx`: vantagens renderizam SVGs locais.
- `src/components/CatalogExplorer.tsx`: destaques comerciais e WhatsApp migrados para SVGs locais.
- `src/components/AboutPage.tsx`, `FloatingWhatsApp.tsx` e `ProductDetailsPage.tsx`: icones de contato, horario, localizacao, servicos e beneficios migrados.
- CSS em `base.css`, `home.css`, `catalog.css` e `responsive.css`: os seletores existentes foram ampliados para estilizar SVG sem remover suporte aos seletores anteriores.

As classes historicas `fa-solid`, `fa-regular` e `fa-brands` foram preservadas nos SVGs para evitar quebra de contratos visuais e seletores existentes, mas nao dependem mais do Font Awesome.

### Validacao

- Build de producao aprovado.
- Nenhum link ou request para Font Awesome/cdnjs no HTML.
- Home, catalogo, produto e pagina Sobre sem erros no console.
- Header, cards, WhatsApp flutuante, filtros e footers presentes.
- Evidencia visual: `artifacts/performance/phase2-mobile.png`.

## Fase 3 - Imagens do Supabase

Status: concluida.

### Estrategia

- A transformacao nativa do Supabase Storage foi validada primeiro em uma imagem publica real.
- A URL de teste original, com 725.686 bytes, passou a responder com 340.013 bytes em `700x700`, `resize=contain` e qualidade 80.
- As URLs persistidas no banco e o fluxo de upload administrativo nao foram alterados. A conversao acontece somente no `src` das imagens publicas de produto.
- Cards, pagina de produto, visualizacao rapida e imagens do carrinho usam a rota `/storage/v1/render/image/public/` para arquivos publicos do Supabase.
- Imagens locais, placeholders e banners mantem o comportamento anterior.
- O `next.config.ts` aceita as rotas publica original e transformada sem restringir os parametros de transformacao.

### Validacao

- Build de producao e TypeScript aprovados.
- Catalogo real do Supabase validado com 85 cards renderizados e 55 imagens apontando para a origem transformada.
- Nenhuma imagem visivel quebrada e nenhum erro no console.
- `alt`, `aria-hidden`, `sizes`, `data-nimg` e a geracao de `srcset` pelo `next/image` foram preservados.
- Pagina de produto validada em 390 x 844 e 1440 x 900 pixels, sem sobreposicao ou overflow horizontal.
- A imagem principal testada foi carregada pela transformacao de 700 pixels e entregue pelo otimizador do Next no tamanho adequado ao viewport.

## Fase 4 - JavaScript legado

Status: concluida com limitacao documentada.

### Alteracao

- `package.json`: adicionada a configuracao solicitada de `browserslist` com `defaults`, exclusao do IE 11 e versoes mantidas do Node.

### Resultado do build

- Build de producao e TypeScript aprovados.
- Antes e depois da configuracao: 17 chunks JavaScript, totalizando 841.148 bytes. Nao houve aumento nem reducao no bundle gerado pelo Turbopack.
- O Next 16 continua gerando seu arquivo padrao de compatibilidade com 112.594 bytes e o marca com `nomodule`.
- No navegador moderno, o arquivo `nomodule` nao foi executado: o global do `core-js` permaneceu ausente.
- Home real validada em desktop com 85 cards, header, filtros, WhatsApp e footer presentes, sem erros de console, imagens visiveis quebradas ou overflow horizontal.

Essa configuracao explicita os navegadores suportados, mas nao remove fisicamente o arquivo de compatibilidade produzido pelo Next. Remover ou editar artefatos internos do framework seria fragil e ficou fora do escopo seguro desta fase.

## Fase 5 - Validacao final

Status: pendente.
