alter table public.products add column if not exists sku text;
alter table public.products add column if not exists use_tags text[] not null default '{}';

create index if not exists products_use_tags_idx on public.products using gin (use_tags);
