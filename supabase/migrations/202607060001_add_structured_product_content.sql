alter table public.products
  add column if not exists full_name text,
  add column if not exists commercial_summary text,
  add column if not exists applications text,
  add column if not exists benefits text[] not null default '{}',
  add column if not exists compatibility text,
  add column if not exists price_or_condition text,
  add column if not exists image_alt text;

create index if not exists products_full_name_idx on public.products (full_name);
create index if not exists products_commercial_summary_idx on public.products (commercial_summary);
