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
