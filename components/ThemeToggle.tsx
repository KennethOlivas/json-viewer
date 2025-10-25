"use client";

import { useMemo } from "react";
import { useTheme } from "next-themes";
import { Palette, Check } from "lucide-react";
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
  { id: "theme-high-contrast", label: "High contrast" },
  { id: "theme-vscode", label: "VS Code" },
  { id: "theme-pastel", label: "Pastel" },
  { id: "theme-sunset", label: "Sunset" },
  { id: "theme-forest", label: "Forest" },
  { id: "theme-neon-purple", label: "Neon Purple" },
  { id: "theme-cyberpunk", label: "Cyberpunk" },
  { id: "theme-ocean", label: "Ocean" },
];

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();

  const currentLabel = useMemo(() => {
    if (theme === "system") return `System (${resolvedTheme ?? "light"})`;
    if (theme === "light" || theme === "dark") return theme;
    const c = customThemes.find((t) => t.id === theme);
    return c?.label ?? "Theme";
  }, [theme, resolvedTheme]);

  return (
    <div className="inline-flex items-center gap-1">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" aria-label="Select theme">
            <Palette className="mr-2 h-4 w-4" /> {currentLabel}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-56">
          <DropdownMenuLabel>Custom themes</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {customThemes.map((t) => (
            <DropdownMenuItem key={t.id} onClick={() => setTheme(t.id)}>
              <div className="flex w-full items-center justify-between">
                <span>{t.label}</span>
                {theme === t.id ? <Check className="h-4 w-4" /> : null}
              </div>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
