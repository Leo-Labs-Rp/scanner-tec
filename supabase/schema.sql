create table if not exists public.products (
  id text primary key,
  name text not null,
  slug text not null unique,
  sku text,
  category text not null check (category in ('scanners', 'maquinas', 'manometros', 'equipamentos')),
  brand text,
  full_name text,
  commercial_summary text,
  applications text,
  benefits text[] not null default '{}',
  compatibility text,
  price_or_condition text,
  image_alt text,
  description text not null,
  detail text,
  price numeric(12, 2),
  old_price numeric(12, 2),
  image_url text not null default '/assets/catalogo-secoes.jpeg',
  images text[] not null default '{}',
  youtube_url text,
  active boolean not null default true,
  featured boolean not null default false,
  most_viewed boolean not null default false,
  stock_status text not null default 'Disponivel sob consulta',
  payment_note text,
  payment_info text,
  tags text[] not null default '{}',
  use_tags text[] not null default '{}',
  "use" text[] not null default '{}',
  specs jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.products add column if not exists brand text;
alter table public.products add column if not exists full_name text;
alter table public.products add column if not exists commercial_summary text;
alter table public.products add column if not exists applications text;
alter table public.products add column if not exists benefits text[] not null default '{}';
alter table public.products add column if not exists compatibility text;
alter table public.products add column if not exists price_or_condition text;
alter table public.products add column if not exists image_alt text;
alter table public.products add column if not exists sku text;
alter table public.products add column if not exists detail text;
alter table public.products add column if not exists payment_note text;
alter table public.products add column if not exists payment_info text;
alter table public.products add column if not exists tags text[] not null default '{}';
alter table public.products add column if not exists images text[] not null default '{}';
alter table public.products add column if not exists youtube_url text;
alter table public.products add column if not exists most_viewed boolean not null default false;
alter table public.products add column if not exists use_tags text[] not null default '{}';
alter table public.products add column if not exists "use" text[] not null default '{}';
alter table public.products add column if not exists specs jsonb not null default '{}'::jsonb;

create index if not exists products_active_idx on public.products (active);
create index if not exists products_category_idx on public.products (category);
create index if not exists products_full_name_idx on public.products (full_name);
create index if not exists products_commercial_summary_idx on public.products (commercial_summary);
create index if not exists products_featured_idx on public.products (featured);
create index if not exists products_most_viewed_idx on public.products (most_viewed);
create index if not exists products_use_tags_idx on public.products using gin (use_tags);
create index if not exists products_use_idx on public.products using gin ("use");

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

insert into public.products (
  id,
  name,
  slug,
  sku,
  category,
  description,
  price,
  old_price,
  image_url,
  active,
  featured,
  stock_status
) values
(
  'autel-mx900',
  'Scanner Autel modelo MX900',
  'autel-mx900',
  'AUTEL-MX900',
  'scanners',
  'Scanner automotivo Autel para diagnósticos, leituras e funções de oficina.',
  5500,
  6000,
  '/assets/catalogo-secoes.jpeg',
  true,
  true,
  'Disponível sob consulta'
),
(
  'autel-km100',
  'Programador de chaves Autel KM100',
  'autel-km100',
  'AUTEL-KM100',
  'scanners',
  'Programador de chaves Autel para serviços especializados em chave automotiva.',
  5000,
  5500,
  '/assets/catalogo-secoes.jpeg',
  true,
  true,
  'Disponível sob consulta'
),
(
  'osciloscopio-4-canais',
  'Osciloscópio de 4 canais',
  'osciloscopio-4-canais',
  'OSC-4C',
  'equipamentos',
  'Osciloscópio automotivo de quatro canais para análise e diagnóstico técnico.',
  5300,
  5500,
  '/assets/catalogo-secoes.jpeg',
  true,
  false,
  'Disponível sob consulta'
)
on conflict (id) do nothing;
