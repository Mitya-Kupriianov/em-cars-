"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

export function ThemeToggle() {
  const [isLight, setIsLight] = useState(false);

  useEffect(() => {
    setIsLight(document.documentElement.classList.contains("light"));
  }, []);

  function toggle() {
    const next = !isLight;
    setIsLight(next);
    document.documentElement.classList.toggle("light", next);
    // Cookie so the server renders the right theme on next load (no flash)
    document.cookie = `theme=${next ? "light" : "dark"}; path=/; max-age=31536000; samesite=lax`;
  }

  return (
    <button
      onClick={toggle}
      aria-label={isLight ? "Тёмная тема" : "Светлая тема"}
      className="inline-flex h-9 w-9 items-center justify-center rounded-md border transition-colors hover:bg-muted"
    >
      {isLight ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
    </button>
  );
}
