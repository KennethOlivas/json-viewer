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
import { mobileNavItems, navCategories } from "@/const/navItem";
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuTrigger,
  NavigationMenuContent,
  NavigationMenuLink,
} from "@/components/ui/navigation-menu";
import { Logo } from "@/components/Logo";
import { JsonPreviewButton } from "@/components/JsonPreview";
import { useIsMobile } from "@/hooks/use-mobile";

export function SiteHeader() {
  const isMobile = useIsMobile();
  return (
    <header className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-4">
      <Logo />
      <nav className="hidden items-center gap-6 md:flex">
        <NavigationMenu viewport={isMobile}>
          <NavigationMenuList>
            {navCategories.map((cat) => (
              <NavigationMenuItem key={cat.id}>
                <NavigationMenuTrigger>{cat.title}</NavigationMenuTrigger>
                <NavigationMenuContent className="bg-background">
                  <div className="p-2 md:w-[560px] lg:w-[720px]">
                    <div className="grid grid-cols-2 gap-4 p-2 md:grid-cols-3">
                      {cat.items.map((it) => (
                        <NavigationMenuLink asChild key={it.href}>
                          <VTLink
                            href={it.href}
                            className=" border flex w-full items-start gap-3 rounded-md p-2 transition-colors bg-background"
                          >
                            <it.Icon className="h-5 w-5 shrink-0" />
                            <div className="flex flex-col">
                              <span className="font-medium text-primary">
                                {it.label}
                              </span>
                              {it.description ? (
                                <span className="text-xs text-muted-foreground">
                                  {it.description}
                                </span>
                              ) : null}
                            </div>
                          </VTLink>
                        </NavigationMenuLink>
                      ))}
                    </div>
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>
            ))}
          </NavigationMenuList>
        </NavigationMenu>
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
          <SheetContent
            side="right"
            className="w-72 max-h-full overflow-y-auto"
          >
            <SheetHeader>
              <SheetTitle>Menu</SheetTitle>
            </SheetHeader>
            <Separator className="my-3" />
            <div className="grid gap-2">
              {mobileNavItems.map((n) => (
                <VTLink
                  key={n.href}
                  href={n.href}
                  className="rounded px-2 py-2 text-sm hover:bg-secondary inline-flex items-center gap-2"
                >
                  <n.Icon className="h-4 w-4" /> {n.label}
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
