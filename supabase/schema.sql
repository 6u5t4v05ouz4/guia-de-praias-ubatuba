-- =============================================================================
-- Guia de Praias & Serviços Ubatuba — schema do Supabase
--
-- Espelha 1:1 os modelos TypeScript de docs/DATA_SCHEMA.md.
-- No painel do Supabase: SQL Editor → cole e execute.
--
-- O app funciona SEM este schema (fallback local em localStorage, conforme
-- docs/ARCHITECTURE.md §4). Ele só é necessário para sincronizar entre
-- dispositivos e persistir as fotos enviadas pela comunidade.
-- =============================================================================

create extension if not exists "pgcrypto";

-- --------------------------------------------------------------------- --
-- 1. Praias
-- --------------------------------------------------------------------- --
create table if not exists public.beaches (
  id                   text primary key,
  name                 text        not null,
  region               text        not null check (region in ('norte', 'centro', 'sul')),
  km                   numeric(5, 1) not null,
  distance_from_center_km numeric(5, 1) not null,
  description          text        not null default '',
  how_to_get           text        not null default '',
  tips                 jsonb       not null default '[]'::jsonb,
  tags                 text[]      not null default '{}',
  cetesb_status        text        not null default 'propria'
                                 check (cetesb_status in ('propria', 'impropria')),
  cetesb_last_update   date        not null default current_date,
  cover_image          text        not null default '',
  cover_author         text,
  cover_author_instagram text,
  gallery              jsonb       not null default '[]'::jsonb,
  latitude             double precision not null,
  longitude            double precision not null,
  features             jsonb       not null default '{}'::jsonb,
  is_active            boolean     not null default true,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);

create index if not exists beaches_region_idx on public.beaches (region);
create index if not exists beaches_km_idx on public.beaches (km);
create index if not exists beaches_tags_idx on public.beaches using gin (tags);

-- --------------------------------------------------------------------- --
-- 2. Parceiros comerciais
-- --------------------------------------------------------------------- --
create table if not exists public.partners (
  id               text primary key,
  name             text        not null,
  category         text        not null check (category in (
                     'restaurante_quiosque', 'pousada_hotel', 'passeio_nautico',
                     'escola_surf', 'aluguel_equipamentos', 'servicos_locais')),
  beach_id         text references public.beaches (id) on delete set null,
  region           text        not null check (region in ('norte', 'centro', 'sul')),
  short_description text       not null default '',
  whatsapp         text        not null,
  default_message  text        not null default '',
  instagram        text,
  logo_url         text        not null default '',
  is_featured      boolean     not null default false,
  is_active        boolean     not null default true,
  discount_info    text,
  plan             text        not null default 'basico'
                           check (plan in ('basico', 'verificado', 'vip', 'master')),
  rating           numeric(2, 1),
  address          text,
  highlights       text[]      not null default '{}',
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create index if not exists partners_beach_idx on public.partners (beach_id);
create index if not exists partners_region_idx on public.partners (region);
create index if not exists partners_active_featured_idx
  on public.partners (is_active, is_featured desc);

-- --------------------------------------------------------------------- --
-- 3. Fotos da comunidade (UGC) — fila de moderação
-- --------------------------------------------------------------------- --
create table if not exists public.ugc_photos (
  id                 text primary key,
  beach_id           text        not null references public.beaches (id) on delete cascade,
  storage_path       text,               -- caminho no Storage (bucket 'ugc')
  image_url          text        not null default '',
  author_name        text        not null,
  author_instagram   text        not null default '',
  status             text        not null default 'pendente'
                             check (status in ('pendente', 'aprovada', 'rejeitada')),
  is_cover_candidate boolean     not null default true,
  created_at         timestamptz not null default now(),
  moderated_at       timestamptz,
  moderator_notes    text
);

create index if not exists ugc_status_idx on public.ugc_photos (status, created_at desc);
create index if not exists ugc_beach_idx on public.ugc_photos (beach_id);

-- --------------------------------------------------------------------- --
-- 4. Banners promocionais
-- --------------------------------------------------------------------- --
create table if not exists public.banners (
  id           uuid primary key default gen_random_uuid(),
  title        text        not null,
  subtitle     text,
  image_url    text        not null default '',
  target_url   text        not null,
  position     text        not null default 'home_top'
                         check (position in ('home_top', 'beaches_top', 'services_top')),
  is_active    boolean     not null default true,
  clicks_count integer     not null default 0,
  palette      text[]      not null default '{}',
  start_date   date,
  end_date     date,
  created_at   timestamptz not null default now()
);

create index if not exists banners_position_idx
  on public.banners (position, is_active);

-- --------------------------------------------------------------------- --
-- Row Level Security
--
-- O guia é público na leitura. A escrita é restrita ao painel administrativo
-- (Supabase Auth). O Storage `ugc` permite upload anônimo de fotos pela
-- comunidade (sem cadastro, conforme SPEC §5), com limite de tamanho.
-- --------------------------------------------------------------------- --
alter table public.beaches  enable row level security;
alter table public.partners enable row level security;
alter table public.ugc_photos enable row level security;
alter table public.banners enable row level security;

create policy "leitura pública de beaches"
  on public.beaches for select using (true);

create policy "leitura pública de partners"
  on public.partners for select using (is_active = true);

create policy "leitura pública de banners ativos"
  on public.banners for select using (is_active = true);

-- Fotos: o público lê apenas as aprovadas e insere as próprias pendentes.
create policy "leitura pública de fotos aprovadas"
  on public.ugc_photos for select using (status = 'aprovada' or auth.role() = 'authenticated');

create policy "envio anônimo de fotos"
  on public.ugc_photos for insert with check (status = 'pendente');

create policy "moderação de fotos por administradores"
  on public.ugc_photos for update using (auth.role() = 'authenticated');

-- Demais escritas ficam restritas a administradores autenticados.
create policy "escrita de beaches por administradores"
  on public.beaches for all using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

create policy "escrita de partners por administradores"
  on public.partners for all using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

create policy "escrita de banners por administradores"
  on public.banners for all using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- --------------------------------------------------------------------- --
-- updated_at automático
-- --------------------------------------------------------------------- --
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists beaches_touch on public.beaches;
create trigger beaches_touch before update on public.beaches
  for each row execute function public.touch_updated_at();

drop trigger if exists partners_touch on public.partners;
create trigger partners_touch before update on public.partners
  for each row execute function public.touch_updated_at();

-- --------------------------------------------------------------------- --
-- Views de conveniência para a camada de leitura
-- --------------------------------------------------------------------- --
create or replace view public.beaches_public
as
select
  b.id, b.name, b.region, b.km, b.distance_from_center_km, b.description,
  b.how_to_get, b.tips, b.tags, b.cetesb_status, b.cetesb_last_update,
  b.cover_image, b.cover_author, b.cover_author_instagram, b.gallery,
  b.latitude as lat, b.longitude as lng, b.features
from public.beaches b;

comment on view public.beaches_public is
  'Projeção usada pelo app: latitude/longitude achatadas para lat/lng.';

-- --------------------------------------------------------------------- --
-- Storage: bucket único `uploads` para capas, galeria e fotos da comunidade.
-- Prefixos usados pelo app: covers/, gallery/, ugc/.
-- --------------------------------------------------------------------- --
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('uploads', 'uploads', true, 10485760, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;

create policy "leitura publica de imagens enviadas"
  on storage.objects for select using (bucket_id = 'uploads');

-- Envio anônimo: a comunidade manda foto sem cadastro (SPEC §5).
create policy "envio anonimo no bucket uploads"
  on storage.objects for insert with check (bucket_id = 'uploads');

-- Remoção/edição restrita a administradores autenticados.
create policy "escrita de imagens por administradores"
  on storage.objects for update using (bucket_id = 'uploads' and auth.role() = 'authenticated');

create policy "remocao de imagens por administradores"
  on storage.objects for delete using (bucket_id = 'uploads' and auth.role() = 'authenticated');
