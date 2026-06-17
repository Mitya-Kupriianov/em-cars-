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
 *
 * Важно: `ref` должен указывать на уже смонтированный элемент к моменту
 * запуска эффекта. Смену `ref.current` React не сигнализирует, поэтому если
 * элемент монтируется условно/позже — хук останется false. Для текущих
 * вызовов (элемент рендерится безусловно) это безопасно.
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
    // Проценты в rootMargin считаются от высоты root (вьюпорта): "100%" ≈ один
    // экран упреждения сверху и снизу, "50%" ≈ половина экрана.
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
