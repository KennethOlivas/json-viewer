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

export type NavCategory = {
  id: string;
  title: string;
  items: Array<MobileNavItem & { description?: string }>;
};

// Grouped navigation for the header NavigationMenu (with descriptions)
export const navCategories: NavCategory[] = [
  {
    id: "views",
    title: "Views",
    items: [
      {
        href: "/",
        label: "Home",
        Icon: Home,
        description: "Project overview and quick links",
      },
      {
        href: "/tree-view",
        label: "Tree",
        Icon: TreeDeciduous,
        description: "Browse JSON as an editable tree",
      },
      {
        href: "/raw-view",
        label: "Raw",
        Icon: Code2,
        description: "Edit raw JSON text",
      },
      {
        href: "/formatter",
        label: "Formatter",
        Icon: Scissors,
        description: "Format and tidy JSON",
      },
      {
        href: "/graph-view",
        label: "Graph",
        Icon: Network,
        description: "Visualize JSON as a graph",
      },
    ],
  },
  {
    id: "tools",
    title: "Tools",
    items: [
      {
        href: "/search",
        label: "Search",
        Icon: Search,
        description: "Search keys and values",
      },
      {
        href: "/compare",
        label: "Compare",
        Icon: ArrowLeftRight,
        description: "Diff two JSON documents",
      },
      {
        href: "/convert",
        label: "Convert",
        Icon: Repeat2,
        description: "Convert between formats",
      },
    ],
  },
  {
    id: "settings",
    title: "Settings",
    items: [
      {
        href: "/theme",
        label: "Theme",
        Icon: Palette,
        description: "Customize the appearance",
      },
      {
        href: "/sessions",
        label: "Sessions",
        Icon: Clock,
        description: "Save and restore sessions",
      },
    ],
  },
];
