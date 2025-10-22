# JSON Viewer & Editor — Next.js app

A modern, animated JSON viewer/editor with routes for tree view, raw editor (Monaco), formatter, search, theme, sessions, compare, convert, and a basic graph view. Built with Next.js App Router, Tailwind CSS v4, ShadCN (Radix), and small utilities.

## Features

- Tree View: inline edit, simple expand/collapse per node, keyboard undo/redo (Ctrl/Cmd+Z/Shift+Z)
- Raw View: Monaco editor, Format/Minify/Copy, live parse errors
- Formatter: pretty/minify with copy/reset
- Search: find by key/value with case sensitivity and match count
- Theme: Light/Dark/System with preview
- Sessions: auto/local save and restore
- Compare: simple diff listing a→b changes
- Convert: JSON↔YAML, JSON↔CSV
- Mobile: bottom nav, FAB, responsive layouts
- View Transitions: VTLink for smooth navigation in bottom nav

## Getting started

1. Install dependencies

```powershell
pnpm install
```

1. Run the dev server

```powershell
pnpm dev
```

1. Build for production (optional)

```powershell
pnpm build; pnpm start
```

## Routes

- / — hub with links
- /tree-view — expandable tree with inline edit and session save
- /raw-view — Monaco editor, format/minify/copy/save
- /formatter — pretty/minify utilities
- /search — key/value search with match count
- /theme — theme toggle with preview
- /sessions — list/restore/delete saved snapshots
- /compare — side-by-side input with textual diff
- /convert — JSON↔YAML↔CSV converter
- /graph-view — basic visual cards (placeholder for interactive graph)

## Notes

- Data persists to localStorage under the json-viewer: prefix.
- Some animations use the View Transitions API if the browser supports it.
- ShadCN UI primitives reside in components/ui and require Tailwind v4.
