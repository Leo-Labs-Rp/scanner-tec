# Changelog de interface

Branch: `feature/pdp-restructure`

## Item 1 - Especificações rápidas

- A página de produto passou a exibir de três a cinco especificações reais logo abaixo do preço.
- Os dados são derivados de `product.specs`; nenhum campo ou registro foi criado no Supabase.
- Produtos com menos de três especificações não exibem um bloco vazio.
- Os chips usam o ícone local `Zap` do `lucide-react` e preservam leitura acessível do rótulo e valor.

## Item 2 - Descrição progressiva

- O resumo curto passou a aparecer uma única vez, na seção `Descrição`, e foi removido do hero.
- O conteúdo longo usa `<details>` e `<summary>` nativos, permanecendo integralmente no HTML para SEO e navegação por teclado.
- `Destaques do equipamento` e `Principais testes e funções` são interpretados do texto existente e renderizados como listas com check.
- A ficha técnica deixou o accordion e foi preservada na tabela técnica existente, pronta para a consolidação do Item 3.

## Item 3 - Especificações consolidadas

- Os blocos separados de informações comerciais e especificações foram substituídos por uma única definição semântica (`dl`).
- Nome, marca, categoria, grupo e categoria originais, usos, condições comercial e de pagamento, atendimento e ficha técnica aparecem em ordem única.
- Aliases como `Fabricante`, `Marca` e `Marca ou linha` são deduplicados na apresentação.
- Os chips rápidos passaram a priorizar os campos técnicos específicos extraídos da ficha existente.
- Benefícios cadastrados foram incorporados ao accordion de descrição, removendo o bloco visual separado sem descartar conteúdo.

## Item 4 - Aplicação e compatibilidade compactas

- A seção passou a exibir no máximo duas frases de aplicação e uma frase de compatibilidade.
- Quando `applications` repete `detail`, as frases usadas na aplicação são retiradas da introdução expandida para não aparecerem duas vezes.
- O restante do texto longo continua no accordion, preservando todo o conteúdo no HTML.
- Os fatos duplicados de aplicação e compatibilidade foram removidos do hero.
- A ordem das seções passou a ser Descrição, Especificações técnicas e Aplicação e compatibilidade.

## Item 5 - Navegação por âncoras

- A navegação foi implementada após a página fechada medir 7,2 viewports no mobile e 3,4 no desktop.
- Uma barra sticky oferece links semânticos para Descrição, Especificações e Aplicação.
- As seções usam `scroll-margin-top` para não ficarem escondidas atrás da barra.
- O scroll suave respeita `prefers-reduced-motion`.
