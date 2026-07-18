# Plano de evolução do projeto ScannerTec

## Objetivo

Evoluir o catálogo comercial sem quebrar a operação atual, mantendo deploy simples, administração prática e foco em geração de orçamento.

## Princípios

- preservar o fluxo que já funciona
- aplicar mudanças em blocos pequenos
- validar build a cada etapa
- manter commits separados por responsabilidade
- priorizar retorno comercial antes de refinamentos cosméticos

## Fase 1 — Base estável e SEO

Status: concluída

- reorganização de estilos e componentes principais
- criação de utilitários de SEO
- metadata por home, categoria, produto e sobre
- robots e sitemap
- base estruturada para conteúdo mais rico de produto
- suporte a storage e melhorias na importação/exportação

## Fase 2 — Clareza comercial e consistência visual

Status: em andamento

- padronizar rótulos de CTA
- corrigir textos com acentuação quebrada
- revisar microcopy das telas principais
- alinhar navegação entre home, catálogo, categoria e produto
- melhorar leitura do conteúdo institucional e comercial

## Fase 3 — Conteúdo orientado a conversão

Prioridade: alta

- enriquecer os produtos principais com:
  - nome completo
  - resumo comercial
  - aplicações
  - benefícios
  - compatibilidade
  - vídeo do YouTube
- revisar categorias com texto próprio
- criar FAQs para páginas estratégicas
- reduzir páginas fracas com conteúdo genérico

## Fase 4 — Admin mais rápido para operação

Prioridade: alta

- edição mais rápida em modal ou drawer
- preview de imagem antes de salvar
- feedback claro em importação e atualização
- validações melhores para slug, id, categoria e link
- fluxo mais simples para banners e destaque de vitrine

## Fase 5 — Qualidade técnica

Prioridade: média

- testes para helpers críticos
- revisão de código morto
- centralização de mensagens e erros
- mais separação entre regra de negócio, UI e integração
- revisão de performance de imagens e carregamento

## Ordem sugerida de execução

1. consistência visual e textual
2. melhoria do conteúdo dos produtos
3. ergonomia do admin
4. qualidade técnica e testes
5. otimizações finas de performance

## Regra de segurança para mudanças

Cada bloco deve:

1. alterar uma responsabilidade por vez
2. passar em build
3. virar commit isolado
4. manter home, catálogo, produto e admin utilizáveis
