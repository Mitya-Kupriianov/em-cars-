-- ============================================================
-- RLS-политики для Electro-Motors (Supabase)
-- Запускать в Supabase Dashboard → SQL Editor.
--
-- Модель доступа:
--   * Сервер (API-роуты) ходит в БД под SERVICE_ROLE ключом — он
--     ОБХОДИТ RLS, поэтому ВСЕ админ-операции продолжат работать
--     без отдельных политик.
--   * Публичный ANON ключ виден в браузере. Ему даём строгий минимум:
--       - INSERT заявок в contact_requests (публичная форма);
--       - SELECT только публичного / активного / видимого контента.
--   * Админ-таблицы и чтение заявок анону НЕ даём вообще.
--
-- Если какой-то таблицы в вашей схеме нет — просто пропустите её блок.
-- ============================================================

-- ---------- CARS ----------
-- Аноним видит только видимые и не архивные машины.
-- ВНИМАНИЕ: политика ссылается на колонки is_visible и archived_at.
-- Если archived_at ещё не создана — сначала выполните:
--   ALTER TABLE public.cars ADD COLUMN archived_at timestamptz DEFAULT NULL;
alter table public.cars enable row level security;
drop policy if exists "public read visible cars" on public.cars;
create policy "public read visible cars" on public.cars
  for select to anon, authenticated
  using (is_visible is not false and archived_at is null);

-- ---------- BRANDS / MODELS / TRIMS / SPECS (публичный каталог) ----------
alter table public.brands enable row level security;
drop policy if exists "public read brands" on public.brands;
create policy "public read brands" on public.brands
  for select to anon, authenticated using (true);

alter table public.brand_models enable row level security;
drop policy if exists "public read brand_models" on public.brand_models;
create policy "public read brand_models" on public.brand_models
  for select to anon, authenticated using (true);

alter table public.model_trims enable row level security;
drop policy if exists "public read model_trims" on public.model_trims;
create policy "public read model_trims" on public.model_trims
  for select to anon, authenticated using (true);

alter table public.model_specs enable row level security;
drop policy if exists "public read model_specs" on public.model_specs;
create policy "public read model_specs" on public.model_specs
  for select to anon, authenticated using (true);

-- ---------- OFFICES (публичные контакты компании) ----------
alter table public.offices enable row level security;
drop policy if exists "public read offices" on public.offices;
create policy "public read offices" on public.offices
  for select to anon, authenticated using (true);

-- ---------- BANNERS (только активные) ----------
alter table public.banners enable row level security;
drop policy if exists "public read active banners" on public.banners;
create policy "public read active banners" on public.banners
  for select to anon, authenticated using (is_active = true);

-- ---------- REVIEWS (только активные) ----------
alter table public.reviews enable row level security;
drop policy if exists "public read active reviews" on public.reviews;
create policy "public read active reviews" on public.reviews
  for select to anon, authenticated using (is_active = true);

-- ---------- CONTACT_REQUESTS (только вставка заявок) ----------
-- Аноним может ТОЛЬКО создавать заявки. Чтение/изменение/удаление —
-- через сервер (service_role), политик для этого не даём.
alter table public.contact_requests enable row level security;
drop policy if exists "anon submit contact request" on public.contact_requests;
create policy "anon submit contact request" on public.contact_requests
  for insert to anon, authenticated with check (true);

-- ---------- АДМИН-ТАБЛИЦЫ (полностью закрыты для anon) ----------
-- RLS включаем, политик НЕ создаём → доступ только через service_role.
alter table public.admin_team enable row level security;

-- Легаси-таблица admin_users (если существует). Включаем RLS безопасно:
do $$
begin
  if exists (select 1 from information_schema.tables
             where table_schema = 'public' and table_name = 'admin_users') then
    execute 'alter table public.admin_users enable row level security';
  end if;
end $$;

-- ============================================================
-- STORAGE (бакет car-images)
-- ------------------------------------------------------------
-- Изображения должны открываться по публичному URL на сайте, но
-- ПЕРЕЧИСЛЯТЬ (list) содержимое бакета аноним не должен.
--
-- Правильная конфигурация:
--   1) Бакет car-images = PUBLIC (Dashboard → Storage → car-images →
--      Settings → Public bucket = ON). Тогда файлы отдаются по
--      /storage/v1/object/public/... без политик.
--   2) НЕ создавайте для роли anon политик SELECT/INSERT/UPDATE/DELETE
--      на storage.objects для этого бакета — иначе аноним сможет
--      листать и менять файлы напрямую публичным ключом.
--   3) Всю загрузку/удаление/листинг делает сервер под service_role.
--
-- Проверить, что лишних анонимных политик на storage нет:
--   select policyname, cmd, roles
--   from pg_policies
--   where schemaname = 'storage' and tablename = 'objects';
-- Если найдёте политики, дающие anon доступ к bucket_id = 'car-images',
-- удалите их:  drop policy "<имя>" on storage.objects;
-- ============================================================

-- ============================================================
-- ПРОВЕРКА после применения:
--   -- 1) RLS включён на всех таблицах (rowsecurity = true):
--   select tablename, rowsecurity from pg_tables
--   where schemaname = 'public' order by tablename;
--
--   -- 2) Список политик:
--   select tablename, policyname, cmd, roles, qual
--   from pg_policies where schemaname = 'public' order by tablename;
-- ============================================================
