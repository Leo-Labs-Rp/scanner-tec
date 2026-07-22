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

Status: pendente.

## Fase 4 - JavaScript legado

Status: pendente.

## Fase 5 - Validacao final

Status: pendente.
