# Предзагрузка наперёд + фиксация секций — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Грузить картинки/контент примерно на один экран вперёд при скролле и
зарезервировать высоту всех тяжёлых секций, чтобы убрать лаг картинок и дёрганье layout.

**Architecture:** Один хук `useNearViewport` (IntersectionObserver с зоной упреждения
~1 экран на десктопе / ~0.5 на мобиле). `CarImage` через него переключает `loading`
`lazy → eager`, стартуя загрузку заранее. Анти-прыжок — скелетоны для секций с `fetch`,
`min-height` для офисов и CSS `content-visibility` для длинных статичных секций.

**Tech Stack:** Next.js 16.2.7 (App Router), React 19, Tailwind CSS v4, `next/image`.

> **Перед кодом с `next/image`:** в Next 16 `priority` устарел (→ `preload`),
> `next/image` НЕ настраивает `rootMargin` нативного lazy — поэтому упреждение делаем
> своим `IntersectionObserver`. При сомнениях сверяйся с
> `node_modules/next/dist/docs/01-app/03-api-reference/02-components/image.md`.

> **Тестов в проекте нет** (нет vitest/jest, `test/` — это PDF-данные). Не добавляем
> тест-раннер (YAGNI + конвенция проекта). Верификация каждой задачи — через
> browser-preview инструменты: `preview_network` (тайминг старта загрузки картинок),
> `preview_screenshot`/`preview_snapshot` (отсутствие сдвигов), `preview_console_logs`
> (нет ошибок). Запускать dev так: `preview_start`, затем переходить на нужный путь.

> **iCloud-дубликаты:** перед `git add` проверяй `find . -path ./node_modules -prune -o
> -name "* 2.*" -print` и не коммить файлы вида `name 2.ext`.

> **Ветка:** вся работа в ветке `scroll-preload-section-stability` (уже создана, в ней
> лежит spec). Не коммитить в `main`.

---

## File Structure

| Файл | Ответственность | Действие |
|---|---|---|
| `src/hooks/use-near-viewport.ts` | Хук: вошёл ли элемент в зону упреждения ~1 экран | Create |
| `src/components/ui/car-image.tsx` | Картинка авто + предзагрузка наперёд | Modify |
| `src/components/cars/CarCardSkeleton.tsx` | Скелетон карточки (резерв высоты) | Create |
| `src/app/catalog/page.tsx` | Использовать `CarCardSkeleton` (DRY) | Modify |
| `src/app/page.tsx` | Скелетоны popular + `min-height` offices | Modify |
| `src/app/globals.css` | Утилита `.cv-section` (content-visibility) | Modify |
| `src/components/layout/Header.tsx`, `Footer.tsx` | Логотипы — eager; применить `.cv-section` к футеру | Modify |
| `src/components/layout/WhyUsSection.tsx`, `VideoReviews.tsx` | Применить `.cv-section` | Modify |

---

## Task 1: Хук `useNearViewport`

**Files:**
- Create: `src/hooks/use-near-viewport.ts`

- [ ] **Step 1: Создать хук**

```tsx
"use client";

import { useEffect, useState, type RefObject } from "react";

/**
 * Возвращает true, как только `ref` входит в расширенную «зону упреждения»
 * перед вьюпортом, после чего перестаёт наблюдать. Нужно, чтобы начинать
 * загрузку контента примерно за один экран до его появления в кадре.
 *
 * Зона упреждения (rootMargin) адаптивна: ~1 экран на десктопе, ~0.5 экрана
 * на мобиле (бережём трафик). SSR-safe; при отсутствии IntersectionObserver
 * возвращает true (грузим сразу).
 */
export function useNearViewport(ref: RefObject<Element | null>): boolean {
  const [near, setNear] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      setNear(true);
      return;
    }

    const isMobile = window.matchMedia("(max-width: 767px)").matches;
    const rootMargin = isMobile ? "50% 0px" : "100% 0px";

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setNear(true);
          observer.disconnect();
        }
      },
      { rootMargin }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [ref]);

  return near;
}
```

- [ ] **Step 2: Проверить компиляцию**

Run: `npx tsc --noEmit`
Expected: без новых ошибок по `use-near-viewport.ts`.

- [ ] **Step 3: Commit**

```bash
find . -path ./node_modules -prune -o -name "* 2.*" -print
git add src/hooks/use-near-viewport.ts
git commit -m "feat: useNearViewport hook for preload-ahead on scroll

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 2: `CarImage` — предзагрузка наперёд

**Files:**
- Modify: `src/components/ui/car-image.tsx`

Наблюдаем за самим `<Image>` (next/image форвардит ref на `<img>`; при `fill` его
геометрия равна родителю). До входа в зону — `loading="lazy"`, после — `"eager"`, что
форсирует старт загрузки за ~экран до появления. DOM-структура не меняется (важно, т.к.
`CarImage` везде используется с `fill`).

- [ ] **Step 1: Переписать компонент**

```tsx
"use client";

import { useRef, useState } from "react";
import Image, { ImageProps } from "next/image";
import { ImageOff } from "lucide-react";
import { useNearViewport } from "@/hooks/use-near-viewport";

interface CarImageProps extends Omit<ImageProps, "onError"> {
  fallbackText?: string;
  /** Грузить за ~1 экран до появления (default: true). false — обычный lazy. */
  preloadAhead?: boolean;
}

export function CarImage({
  fallbackText = "Немає фото",
  className,
  preloadAhead = true,
  ...props
}: CarImageProps) {
  const [error, setError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const near = useNearViewport(imgRef);

  if (error || !props.src) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center gap-1.5 bg-muted text-muted-foreground">
        <ImageOff className="h-6 w-6" />
        <span className="text-xs">{fallbackText}</span>
      </div>
    );
  }

  const loading = preloadAhead
    ? near
      ? "eager"
      : "lazy"
    : props.loading;

  return (
    <Image
      {...props}
      ref={imgRef}
      loading={loading}
      className={className}
      onError={() => setError(true)}
    />
  );
}
```

- [ ] **Step 2: Отключить предзагрузку в админке (мелкие превью, не нужно)**

В `src/app/admin/cars/page.tsx` у обоих `<CarImage ...>` (строки ~247 и ~374) добавить
проп `preloadAhead={false}`. Открыть файл, найти оба вхождения `<CarImage`, добавить
атрибут. Пример:

```tsx
<CarImage
  preloadAhead={false}
  // ...остальные пропсы без изменений
/>
```

- [ ] **Step 3: tsc**

Run: `npx tsc --noEmit`
Expected: без новых ошибок.

- [ ] **Step 4: Проверить в браузере — картинки грузятся заранее**

```
preview_start (если не запущен)
```
Перейти на `/catalog`. В `preview_network` отфильтровать запросы изображений
(`/_next/image` или supabase). Медленно проскроллить вниз и убедиться: запрос картинки
карточки уходит, когда карточка ещё примерно за экран до вьюпорта (а не в момент входа).
`preview_console_logs` — без ошибок про ref/Image.

- [ ] **Step 5: Commit**

```bash
find . -path ./node_modules -prune -o -name "* 2.*" -print
git add src/components/ui/car-image.tsx src/app/admin/cars/page.tsx
git commit -m "feat: CarImage preloads ~1 screen ahead via useNearViewport

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 3: `CarCardSkeleton` + резерв высоты popular (главная) и DRY каталога

**Files:**
- Create: `src/components/cars/CarCardSkeleton.tsx`
- Modify: `src/app/catalog/page.tsx` (заменить инлайн-скелетон)
- Modify: `src/app/page.tsx` (скелетоны popular, пока пусто)

- [ ] **Step 1: Создать `CarCardSkeleton` (разметка перенесена 1:1 из каталога)**

```tsx
export function CarCardSkeleton() {
  return (
    <div className="animate-pulse overflow-hidden rounded-xl border-0 bg-card shadow-sm">
      <div className="aspect-[16/10] bg-muted" />
      <div className="space-y-3 p-4">
        <div className="h-3 w-16 rounded bg-muted" />
        <div className="h-5 w-3/4 rounded bg-muted" />
        <div className="flex gap-4">
          <div className="h-3 w-16 rounded bg-muted" />
          <div className="h-3 w-16 rounded bg-muted" />
          <div className="h-3 w-16 rounded bg-muted" />
        </div>
        <div className="mt-2 h-7 w-1/2 rounded bg-muted" />
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Каталог — использовать общий скелетон (DRY)**

В `src/app/catalog/page.tsx`:
1. Добавить импорт: `import { CarCardSkeleton } from "@/components/cars/CarCardSkeleton";`
2. Заменить блок инлайн-скелетона (внутри `{loading ? (` — `Array.from({ length: pageSize }).map(...)`) на:

```tsx
<div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
  {Array.from({ length: pageSize }).map((_, i) => (
    <CarCardSkeleton key={i} />
  ))}
</div>
```

- [ ] **Step 3: Главная — скелетоны popular, пока `fetch` не пришёл**

В `src/app/page.tsx`:
1. Добавить импорт: `import { CarCardSkeleton } from "@/components/cars/CarCardSkeleton";`
2. В секции Popular Cars заменить рендер грида (`popularCars.map(...)`) на условный — пока массив пуст, показываем 3 скелетона, чтобы grid держал высоту:

```tsx
<div className="grid gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
  {popularCars.length === 0
    ? Array.from({ length: 3 }).map((_, i) => <CarCardSkeleton key={i} />)
    : popularCars.map((car) => <CarCard key={car.id} car={car} />)}
</div>
```

- [ ] **Step 4: tsc**

Run: `npx tsc --noEmit`
Expected: без новых ошибок.

- [ ] **Step 5: Проверить отсутствие прыжка на главной**

Перейти на `/`. В `preview_network` искусственно не нужно — просто перезагрузить
страницу (`preview_eval: window.location.reload()`), сделать `preview_screenshot` сразу
и после прихода данных. Секция «Популярные» должна занимать ту же высоту со скелетонами
и с карточками — контент ниже не должен сдвигаться. Сверить два скриншота.

- [ ] **Step 6: Commit**

```bash
find . -path ./node_modules -prune -o -name "* 2.*" -print
git add src/components/cars/CarCardSkeleton.tsx src/app/catalog/page.tsx src/app/page.tsx
git commit -m "feat: CarCardSkeleton reserves height for popular + dedups catalog skeleton

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 4: `min-height` для секции офисов (главная)

**Files:**
- Modify: `src/app/page.tsx`

Секция офисов стартует с `defaultOffices`, затем заменяется серверными — при разнице в
числе карточек layout сдвигается. Резервируем высоту контейнера.

- [ ] **Step 1: Задать min-height контейнеру офисов**

В `src/app/page.tsx`, секция Offices, у обёртки списка
`<div className="flex flex-wrap justify-center gap-4">` добавить `min-h`:

```tsx
<div className="flex min-h-[220px] flex-wrap justify-center gap-4">
```

- [ ] **Step 2: Проверить и подогнать значение в браузере**

Перейти на `/` (desktop-ширина, офисы видны на `sm+`). Дождаться загрузки офисов,
`preview_inspect` высоту контейнера. Если фактическая высота заметно отличается от
`220px` так, что при загрузке виден сдвиг — поднять значение `min-h-[...]` под реальную
высоту (две строки карточек) и перепроверить `preview_screenshot` до/после загрузки.

- [ ] **Step 3: Commit**

```bash
git add src/app/page.tsx
git commit -m "fix: reserve min-height for offices section to avoid layout shift

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 5: Утилита `.cv-section` (content-visibility) для длинных статичных секций

**Files:**
- Modify: `src/app/globals.css`
- Modify: `src/app/page.tsx` (About/Advantages section)
- Modify: `src/components/layout/WhyUsSection.tsx`
- Modify: `src/components/layout/VideoReviews.tsx`
- Modify: `src/components/layout/Footer.tsx`

`content-visibility: auto` пропускает рендер вне экрана; `contain-intrinsic-size:
auto 600px` резервирует 600px до первого показа, а далее браузер запоминает реальную
высоту секции (ключевое слово `auto`) — поэтому одного значения хватает для всех.
НЕ применять к секциям первого экрана (Hero, DealTools) — там это вредно.

- [ ] **Step 1: Добавить утилиту в globals.css**

В `src/app/globals.css` после блока импортов/`@custom-variant` (до или после `@theme`,
на верхнем уровне файла) добавить:

```css
@utility cv-section {
  content-visibility: auto;
  contain-intrinsic-size: auto 600px;
}
```

- [ ] **Step 2: Применить к секции About/Advantages на главной**

В `src/app/page.tsx` у секции About & Advantages
`<section className="bg-section py-10 sm:py-16">` (та, что с текстом про Electro-Motors)
добавить класс `cv-section`:

```tsx
<section className="cv-section bg-section py-10 sm:py-16">
```

- [ ] **Step 3: Применить к корневым секциям WhyUsSection / VideoReviews / Footer**

Открыть каждый файл, у корневого `<section>` / `<footer>` добавить класс `cv-section`
к существующему `className` (не меняя остальных классов):
- `src/components/layout/WhyUsSection.tsx` — корневой `<section>`.
- `src/components/layout/VideoReviews.tsx` — корневой `<section>`.
- `src/components/layout/Footer.tsx` — корневой `<footer>`.

- [ ] **Step 4: Проверить скролл и отсутствие сдвигов**

Перейти на `/`. Медленно проскроллить всю страницу сверху донизу. Убедиться через
`preview_screenshot` в нескольких позициях скролла, что секции рендерятся корректно,
ничего не схлопывается и не прыгает при входе в кадр. `preview_console_logs` — без
ошибок. Также проверить `/catalog` (там в футере применится `cv-section`).

- [ ] **Step 5: Commit**

```bash
find . -path ./node_modules -prune -o -name "* 2.*" -print
git add src/app/globals.css src/app/page.tsx src/components/layout/WhyUsSection.tsx src/components/layout/VideoReviews.tsx src/components/layout/Footer.tsx
git commit -m "perf: content-visibility on long static sections (reserve height, skip offscreen render)

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 6: Логотипы Header/Footer — eager + сквозная проверка

**Files:**
- Modify: `src/components/layout/Header.tsx`
- Modify: `src/components/layout/Footer.tsx`

Логотипы находятся в самом верху/важны для первого впечатления — должны грузиться сразу.

- [ ] **Step 1: Поставить логотипам eager**

В `src/components/layout/Header.tsx` и `src/components/layout/Footer.tsx` найти `<img`
логотипа и добавить атрибуты:

```tsx
<img
  /* ...существующие src/alt/className... */
  loading="eager"
  fetchPriority="high"
/>
```

(Если у `<img>` уже стоит `loading="lazy"` — заменить на `"eager"`.)

- [ ] **Step 2: tsc + lint**

Run: `npx tsc --noEmit && npm run lint`
Expected: без новых ошибок.

- [ ] **Step 3: Финальная сквозная проверка**

Прогнать через preview основные страницы: `/`, `/catalog`, страница авто
(`/catalog/<любой-slug>`), `/blog`. На каждой:
- `preview_network`: загрузка картинок стартует заранее (за ~экран), логотип — сразу.
- скролл сверху донизу: `preview_screenshot` в нескольких точках — нет layout shift,
  секции держат высоту.
- `preview_console_logs`: без ошибок.
- `preview_resize` на мобильную ширину (~390px) — проверить, что зона упреждения уже
  (картинки грузятся не так агрессивно) и секции не прыгают.

- [ ] **Step 4: Commit**

```bash
find . -path ./node_modules -prune -o -name "* 2.*" -print
git add src/components/layout/Header.tsx src/components/layout/Footer.tsx
git commit -m "perf: eager-load header/footer logos

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Итоговая проверка против spec

- [x] Предзагрузка ~1 экран вперёд (адаптивно мобайл/десктоп) — Task 1, 2.
- [x] Картинки во всех ключевых местах через `CarImage` — Task 2 (CarCard, галерея авто
      используют `CarImage`; блог использует `next/image` напрямую — см. примечание ниже).
- [x] Анти-прыжок секций главной: popular (скелетоны) — Task 3; offices (min-height) —
      Task 4.
- [x] `content-visibility` для длинных статичных секций — Task 5.
- [x] Логотипы eager — Task 6.

**Примечание по блогу:** `blog/page.tsx` и `ArticleClient.tsx` используют `next/image`
напрямую, не `CarImage`. Если при финальной проверке (Task 6, шаг 3) на `/blog` виден
заметный лаг картинок — добавить отдельную мелкую задачу: обернуть их в `useNearViewport`
тем же приёмом, что в `CarImage` (ref + переключение `loading`). Не делаем превентивно
(YAGNI) — блог второстепенен и его картинки крупные/одиночные.
