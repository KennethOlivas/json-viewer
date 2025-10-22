"use client";

import { VTLink } from "./VTLink";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";
import { Home, TreeDeciduous, Code2, Scissors, Search, Palette, Clock, ArrowLeftRight, Repeat2, Network } from "lucide-react";

const items = [
  { href: "/", label: "Home", Icon: Home },
  { href: "/tree-view", label: "Tree", Icon: TreeDeciduous },
  { href: "/raw-view", label: "Raw", Icon: Code2 },
  { href: "/formatter", label: "Format", Icon: Scissors },
  { href: "/search", label: "Search", Icon: Search },
  { href: "/theme", label: "Theme", Icon: Palette },
  { href: "/sessions", label: "Sessions", Icon: Clock },
  { href: "/compare", label: "Compare", Icon: ArrowLeftRight },
  { href: "/convert", label: "Convert", Icon: Repeat2 },
  { href: "/graph-view", label: "Graph", Icon: Network },
];

export function BottomNav() {
  const pathname = usePathname();
  return (
  <nav className="fixed bottom-0 left-0 right-0 z-40 border-t bg-background/80 backdrop-blur supports-backdrop-filter:bg-background/60 md:hidden">
      <ul className="mx-auto flex max-w-xl items-stretch justify-between gap-1 p-1">
        {items.map(({ href, label, Icon }) => {
          const active = pathname === href;
          return (
            <li key={href} className="flex-1">
              <VTLink href={href} className={clsx(
                "group flex h-12 items-center justify-center gap-1 rounded-md px-2 text-xs transition-colors",
                active ? "bg-secondary text-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}>
                <Icon className={clsx("h-5 w-5 transition-transform", active ? "scale-110" : "group-hover:scale-110")}/>
                <span className="hidden xs:inline">{label}</span>
              </VTLink>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
