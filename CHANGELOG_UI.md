# Changelog de interface

Branch: `feature/pdp-restructure`

## Item 1 - Especificações rápidas

- A página de produto passou a exibir de três a cinco especificações reais logo abaixo do preço.
- Os dados são derivados de `product.specs`; nenhum campo ou registro foi criado no Supabase.
- Produtos com menos de três especificações não exibem um bloco vazio.
- Os chips usam o ícone local `Zap` do `lucide-react` e preservam leitura acessível do rótulo e valor.
