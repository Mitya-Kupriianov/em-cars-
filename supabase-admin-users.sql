-- Список людей с доступом в админку (новая система на Clerk).
-- Отдельная таблица admin_team, чтобы не конфликтовать со старой admin_users,
-- от которой зависят RLS-политики других таблиц.
--
-- Владелец (owner) задаётся через переменную окружения ADMIN_OWNER_EMAIL
-- и НЕ обязан быть в этой таблице — так его нельзя случайно заблокировать.
-- Здесь хранятся приглашённые редакторы (и при желании доп. владельцы).

create table if not exists admin_team (
  email      text primary key,
  role       text not null default 'editor' check (role in ('owner', 'editor')),
  created_at timestamptz not null default now()
);

-- Доступ только через service role key (серверная часть приложения).
-- RLS без политик => клиентский anon-ключ ничего не прочитает/запишет.
alter table admin_team enable row level security;
