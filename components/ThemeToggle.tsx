"use client";

import { useMemo } from "react";
import { useTheme } from "next-themes";
import { Check } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

const customThemes = [
  { id: "light", label: "Light", emoji: "☀️" },
  { id: "dark", label: "Dark", emoji: "🌙" },
  { id: "system", label: "System", emoji: "💻" },
  { id: "theme-high-contrast", label: "High contrast", emoji: "🔳" },
  { id: "theme-vscode", label: "VS Code", emoji: "🧩" },
  { id: "theme-pastel", label: "Pastel", emoji: "🎨" },
  { id: "theme-sunset", label: "Sunset", emoji: "🌅" },
  { id: "theme-forest", label: "Forest", emoji: "🌲" },
  { id: "theme-neon-purple", label: "Neon Purple", emoji: "💜" },
  { id: "theme-cyberpunk", label: "Cyberpunk", emoji: "🤖" },
  { id: "theme-ocean", label: "Ocean", emoji: "🌊" },
];

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();

  const currentLabel = useMemo(() => {
    const c = customThemes.find((t) => t.id === theme);
    if (theme === "system")
      return `${c?.label ?? "System"} (${resolvedTheme ?? "light"})`;
    return c?.label ?? "Theme";
  }, [theme, resolvedTheme]);

  const currentEmoji = useMemo(() => {
    const c = customThemes.find((t) => t.id === theme);
    return c?.emoji ?? "🎨";
  }, [theme]);

  return (
    <div className="inline-flex items-center gap-1">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" aria-label="Select theme">
            <span className="mr-2" aria-hidden>
              {currentEmoji}
            </span>
            {currentLabel}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-56">
          <DropdownMenuLabel>Themes</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {customThemes.map((t) => (
            <DropdownMenuItem key={t.id} onClick={() => setTheme(t.id)}>
              <div className="flex w-full items-center justify-between">
                <span className="inline-flex items-center gap-2">
                  <span aria-hidden>{t.emoji}</span>
                  <span>{t.label}</span>
                </span>
                {theme === t.id ? <Check className="h-4 w-4" /> : null}
              </div>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
