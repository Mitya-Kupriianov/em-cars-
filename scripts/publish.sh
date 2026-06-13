#!/usr/bin/env bash
# Публикация сайта: сохраняет все изменения и отправляет на GitHub.
# Vercel сам соберёт и обновит https://em-cars-five.vercel.app/ через ~1 минуту.
#
# Использование:
#   npm run publish              # авто-сообщение с датой
#   npm run publish -- "текст"   # своё описание изменений
set -e

# Сообщение коммита: аргумент или дата по умолчанию
MSG="${1:-Обновление $(date '+%Y-%m-%d %H:%M')}"

# Есть ли вообще что сохранять?
if [ -z "$(git status --porcelain)" ]; then
  echo "✅ Изменений нет — публиковать нечего."
  exit 0
fi

echo "📦 Сохраняю изменения..."
git add -A
git commit -m "$MSG"

echo "🚀 Отправляю на GitHub..."
git push

echo ""
echo "✅ Готово! Vercel собирает сайт."
echo "   Через ~1 минуту обнови https://em-cars-five.vercel.app/ (⌘+Option+R в Safari)."
