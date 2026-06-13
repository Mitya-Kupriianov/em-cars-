-- Список людей с доступом в админку.
-- Владелец (owner) задаётся через переменную окружения ADMIN_OWNER_EMAIL
-- и НЕ обязан быть в этой таблице — так его нельзя случайно заблокировать.
-- Здесь хранятся приглашённые редакторы (и при желании доп. владельцы).

create table if not exists admin_users (
  email      text primary key,
  role       text not null default 'editor' check (role in ('owner', 'editor')),
  created_at timestamptz not null default now()
);

-- Доступ к таблице только через service role key (серверная часть приложения).
-- Включаем RLS без политик => клиентский anon-ключ ничего не прочитает/запишет.
alter table admin_users enable row level security;
