"use client";

import { ThemeToggle } from "@/components/ThemeToggle";
import { VTLink } from "@/components/VTLink";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { Menu } from "lucide-react";
import { navItems } from "@/const/navItem";
import { Logo } from "@/components/Logo";
import { JsonPreviewButton } from "@/components/JsonPreview";

export function SiteHeader() {
  return (
    <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4">
      <Logo />
      <nav className="hidden items-center gap-6 md:flex">
        {navItems.map((n) => (
          <VTLink
            key={n.href}
            href={n.href}
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <span className="underline-offset-8 hover:underline">{n.label}</span>
          </VTLink>
        ))}
      </nav>
      <div className="flex items-center gap-2">
        <JsonPreviewButton />
        <ThemeToggle />
        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="md:hidden"
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-72">
            <SheetHeader>
              <SheetTitle>Menu</SheetTitle>
            </SheetHeader>
            <Separator className="my-3" />
            <div className="grid gap-2">
              {navItems.map((n) => (
                <VTLink
                  key={n.href}
                  href={n.href}
                  className="rounded px-2 py-2 text-sm hover:bg-secondary"
                >
                  {n.label}
                </VTLink>
              ))}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}

export default SiteHeader;
