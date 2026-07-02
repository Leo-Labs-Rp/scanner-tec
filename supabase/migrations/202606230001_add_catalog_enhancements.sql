alter table public.products add column if not exists sku text;
alter table public.products add column if not exists images text[] not null default '{}';
alter table public.products add column if not exists most_viewed boolean not null default false;
alter table public.products add column if not exists payment_info text;
alter table public.products add column if not exists use_tags text[] not null default '{}';
alter table public.products add column if not exists "use" text[] not null default '{}';
alter table public.products add column if not exists specs jsonb not null default '{}'::jsonb;

create index if not exists products_most_viewed_idx on public.products (most_viewed);
create index if not exists products_use_tags_idx on public.products using gin (use_tags);
create index if not exists products_use_idx on public.products using gin ("use");
