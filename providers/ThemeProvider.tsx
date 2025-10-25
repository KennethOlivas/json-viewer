"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
};

export function ThemeProvider({ children }: Props) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      themes={[
        "light",
        "dark",
        "system",
        // extended themes (class names defined in globals.css)
        "theme-light",
        "theme-dark",
        "theme-high-contrast",
        "theme-vscode",
        "theme-pastel",
        "theme-sunset",
        "theme-forest",
        "theme-neon-purple",
        "theme-cyberpunk",
        "theme-ocean",
      ]}
    >
      {children}
    </NextThemesProvider>
  );
}
