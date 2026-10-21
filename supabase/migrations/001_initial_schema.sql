create extension if not exists pgcrypto;

create table public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null check (char_length(display_name) between 1 and 120),
  role text not null check (role in ('admin', 'editor')),
  created_at timestamptz not null default now()
);

create table public.categories (
  id bigint generated always as identity primary key,
  name text not null unique check (char_length(name) between 1 and 80),
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  description text check (char_length(description) <= 500),
  created_at timestamptz not null default now()
);

create table public.apps (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 160),
  search_code text not null unique check (search_code ~ '^[A-Z0-9-]{2,40}$'),
  description text not null check (char_length(description) between 1 and 5000),
  short_description text check (char_length(short_description) <= 280),
  poster_url text check (char_length(poster_url) <= 2048),
  play_store_url text not null check (char_length(play_store_url) <= 2048),
  developer_name text check (char_length(developer_name) <= 160),
  category_id bigint references public.categories(id) on delete set null,
  status text not null default 'published' check (status in ('draft', 'published', 'unpublished')),
  featured boolean not null default false,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.app_events (
  id bigint generated always as identity primary key,
  app_id uuid references public.apps(id) on delete set null,
  event_type text not null check (event_type in ('search', 'detail_view', 'play_store_click')),
  created_at timestamptz not null default now()
);

create index apps_search_code_idx on public.apps(search_code);
create index apps_published_created_idx on public.apps(status, created_at desc);
create index apps_category_published_idx on public.apps(category_id, status);
create index apps_featured_published_idx on public.apps(featured, status) where featured = true;
create index app_events_app_type_created_idx on public.app_events(app_id, event_type, created_at desc);
create index app_events_type_created_idx on public.app_events(event_type, created_at desc);

create or replace function public.normalize_app_search_code()
returns trigger language plpgsql as $$
begin
  new.search_code := upper(trim(new.search_code));
  return new;
end;
$$;

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger normalize_apps_search_code before insert or update of search_code on public.apps
for each row execute function public.normalize_app_search_code();
create trigger apps_set_updated_at before update on public.apps
for each row execute function public.set_updated_at();

-- Security-definer helper avoids recursive RLS checks. It is not exposed for direct calls.
create or replace function public.current_admin_role()
returns text language sql stable security definer set search_path = public as $$
  select role from public.admin_users where user_id = auth.uid();
$$;
revoke all on function public.current_admin_role() from public;
grant execute on function public.current_admin_role() to authenticated;

alter table public.admin_users enable row level security;
alter table public.categories enable row level security;
alter table public.apps enable row level security;
alter table public.app_events enable row level security;

create policy "admins can view own role" on public.admin_users for select to authenticated
using (user_id = auth.uid());

create policy "public can read categories" on public.categories for select to anon, authenticated using (true);
create policy "admins manage categories" on public.categories for all to authenticated
using (public.current_admin_role() = 'admin') with check (public.current_admin_role() = 'admin');

create policy "public reads published apps" on public.apps for select to anon, authenticated using (status = 'published');
create policy "editors create apps" on public.apps for insert to authenticated
with check (public.current_admin_role() in ('admin', 'editor') and created_by = auth.uid());
create policy "editors update apps" on public.apps for update to authenticated
using (public.current_admin_role() in ('admin', 'editor')) with check (public.current_admin_role() in ('admin', 'editor'));
create policy "admins delete apps" on public.apps for delete to authenticated using (public.current_admin_role() = 'admin');

create policy "admins read analytics" on public.app_events for select to authenticated
using (public.current_admin_role() in ('admin', 'editor'));

insert into public.categories (name, slug, description) values
  ('Games', 'games', 'Games and interactive entertainment'),
  ('Education', 'education', 'Learning and study apps'),
  ('Productivity', 'productivity', 'Work and organization tools'),
  ('Entertainment', 'entertainment', 'Media and entertainment'),
  ('Tools', 'tools', 'Useful utilities'),
  ('Finance', 'finance', 'Financial tools and services'),
  ('Social', 'social', 'Social and communication apps'),
  ('Lifestyle', 'lifestyle', 'Everyday lifestyle apps'),
  ('Other', 'other', 'Other app categories')
on conflict (slug) do nothing;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('app-posters', 'app-posters', true, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update set public = excluded.public, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

create policy "public reads app posters" on storage.objects for select to public using (bucket_id = 'app-posters');
create policy "admins upload app posters" on storage.objects for insert to authenticated
with check (bucket_id = 'app-posters' and public.current_admin_role() in ('admin', 'editor'));
create policy "admins update app posters" on storage.objects for update to authenticated
using (bucket_id = 'app-posters' and public.current_admin_role() in ('admin', 'editor'));
create policy "admins delete app posters" on storage.objects for delete to authenticated
using (bucket_id = 'app-posters' and public.current_admin_role() in ('admin', 'editor'));
