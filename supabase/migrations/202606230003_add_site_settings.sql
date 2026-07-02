create table if not exists public.site_settings (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

insert into public.site_settings (key, value)
values (
  'home_banner',
  jsonb_build_object(
    'rotationMs', 4000,
    'slides', jsonb_build_array(
      jsonb_build_object(
        'id', 'banner-1',
        'eyebrow', 'Destaque ScannerTec',
        'title', 'Scanners e equipamentos para elevar a performance da oficina.',
        'description', 'Configure a vitrine principal com imagem, texto e produto vinculado para destacar o melhor momento comercial da loja.',
        'imageUrl', '/assets/marcas-parceiras.jpeg',
        'linkedProductSlug', 'scanner-multimec-x3'
      ),
      jsonb_build_object(
        'id', 'banner-2',
        'eyebrow', 'Linha profissional',
        'title', 'Escolha scanners, ferramentas e equipamentos com atendimento consultivo.',
        'description', 'Monte uma vitrine rotativa com os itens mais fortes da ScannerTec e direcione o cliente para o produto certo.',
        'imageUrl', '/assets/catalogo-secoes.jpeg',
        'linkedProductSlug', 'autel-mx900'
      )
    )
  )
)
on conflict (key) do nothing;
