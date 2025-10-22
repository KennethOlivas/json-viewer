"use client";

import { useTheme } from "next-themes";
import { Sun, Moon, Laptop } from "lucide-react";

export function ThemeToggle() {
  const { theme, setTheme, systemTheme } = useTheme();
  const current = theme === "system" ? systemTheme : theme;

  return (
    <div className="inline-flex items-center rounded-md border p-1 text-sm">
      <button
        type="button"
        className={`mr-1 rounded px-2 py-1 ${current === "light" ? "bg-secondary" : ""}`}
        onClick={() => setTheme("light")}
        aria-label="Light theme"
        title="Light"
      >
        <Sun className="h-4 w-4" />
      </button>
      <button
        type="button"
        className={`mr-1 rounded px-2 py-1 ${current === "dark" ? "bg-secondary" : ""}`}
        onClick={() => setTheme("dark")}
        aria-label="Dark theme"
        title="Dark"
      >
        <Moon className="h-4 w-4" />
      </button>
      <button
        type="button"
        className={`rounded px-2 py-1 ${theme === "system" ? "bg-secondary" : ""}`}
        onClick={() => setTheme("system")}
        aria-label="System theme"
        title="System"
      >
        <Laptop className="h-4 w-4" />
      </button>
    </div>
  );
}
