"use client";

import { Moon01, Sun } from "@untitledui/icons";
import { useCallback, useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { THEME_STORAGE_KEY } from "@/lib/theme";

type Theme = "light" | "dark";

const themeListeners = new Set<() => void>();

function subscribeTheme(listener: () => void) {
  themeListeners.add(listener);
  const onStorage = (e: StorageEvent) => {
    if (e.key !== THEME_STORAGE_KEY) return;
    if (e.newValue === "dark") document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
    listener();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    themeListeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

function emitThemeChange() {
  themeListeners.forEach((l) => l());
}

function getThemeSnapshot(): Theme {
  return document.documentElement.classList.contains("dark") ? "dark" : "light";
}

function getServerThemeSnapshot(): Theme {
  return "light";
}

export function ThemeToggle({ inline = false }: { inline?: boolean }) {
  const pathname = usePathname();
  const theme = useSyncExternalStore(subscribeTheme, getThemeSnapshot, getServerThemeSnapshot);

  const toggle = useCallback(() => {
    const next: Theme = getThemeSnapshot() === "dark" ? "light" : "dark";
    document.documentElement.classList.toggle("dark", next === "dark");
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {
      /* ignore quota / private mode */
    }
    emitThemeChange();
  }, []);

  const isDark = theme === "dark";
  if (!inline && (pathname === "/" || pathname === "/live")) return null;

  return (
    <button
      type="button"
      onClick={toggle}
      className={cn(
        inline
          ? "inline-flex size-9 shrink-0 items-center justify-center rounded-xl border transition-colors"
          : "fixed right-[max(1.5rem,calc((100vw-72rem)/2+1.5rem))] top-4 z-50 inline-flex size-9 shrink-0 items-center justify-center rounded-xl border transition-colors",
        isDark
          ? "border-neutral-700 bg-neutral-800 text-neutral-200 hover:bg-neutral-700"
          : "border-neutral-200 bg-white text-neutral-900 shadow-sm hover:bg-neutral-50"
      )}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      {isDark ? <Sun className="size-4" /> : <Moon01 className="size-4" />}
    </button>
  );
}
