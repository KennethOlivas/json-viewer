import type { LucideIcon } from "lucide-react";
import {
  Home,
  TreeDeciduous,
  Code2,
  Scissors,
  Search,
  Palette,
  Clock,
  ArrowLeftRight,
  Repeat2,
  Network,
} from "lucide-react";

export type NavItem = { href: string; label: string };

// Primary navigation items (used in header + sheet menu)
export const navItems: NavItem[] = [
  { href: "/", label: "Home" },
  { href: "/tree-view", label: "Tree View" },
  { href: "/raw-view", label: "Raw View" },
  { href: "/formatter", label: "Formatter" },
  { href: "/search", label: "Search" },
  { href: "/theme", label: "Theme" },
  { href: "/sessions", label: "Sessions" },
  { href: "/compare", label: "Compare" },
  { href: "/convert", label: "Convert" },
  { href: "/graph-view", label: "Graph View" },
];

export type MobileNavItem = { href: string; label: string; Icon: LucideIcon };

// Mobile bottom navigation items (with icons)
export const mobileNavItems: MobileNavItem[] = [
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
