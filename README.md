# JSON Viewer & Editor — Next.js app

A modern, animated JSON viewer/editor with routes for tree view, raw editor (Monaco), formatter, search, theming, sessions, compare, convert, and a basic graph view. Built with Next.js App Router, Tailwind CSS v4, shadcn/ui (Radix), and small utilities.

## Highlights

- Fast, local-first JSON exploration with sessions and undo/redo
- Theme system with Light/Dark/System plus custom palettes; instant switching and persistence
- Consistent glassmorphism styling across dialogs, menus, and cards
- Mobile-friendly: bottom nav, responsive header menu, and FAB

## Features

JSON editing and views

- Tree View: inline edit, expand/collapse per node, add field/item, copy value, object/array editor modal, keyboard undo/redo (Ctrl/Cmd+Z, Shift+Z)
- Raw View: Monaco editor with adaptive theme (light/dark), format/minify/copy, live parse errors
- Formatter: pretty/minify with copy/reset
- Search: find by key/value with case sensitivity and match count
- Random JSON Generator for mock data (see docs/random-json-generator.md)

Import, preview, and sessions

- Import JSON: drag & drop or open/paste dialog; consistent UI
- Duplicate detection: detects identical JSON; choose Overwrite existing or Create new
- Unsaved changes guard: Save/Discard/Cancel before overwriting by import
- Preview JSON: quick header button to view, copy, and download the currently loaded JSON
- Sessions: create/restore/rename/duplicate/delete; last modified timestamp and active session persistence
- Session preview: view any session’s JSON read-only without activating it
- Delete confirmation dialog for sessions
- Keyboard shortcut: Ctrl/Cmd+S to save to the active session

Compare and convert

- Compare: simple diff listing a → b changes
- Convert: JSON ↔ YAML, JSON ↔ CSV

Navigation and UX

- Header uses a categorized NavigationMenu (desktop) and a sheet menu (mobile); logo links home
- Responsive overflow handling so all nav items remain reachable
- Glass styles applied to menus, dialogs, and panels

Graph (early)

- Basic graph/cards route. Interactive layout presets were explored and may evolve.

## Theme system

- Light, Dark, and System modes out of the box
- Custom themes available (class-based): High Contrast, VS Code, Pastel, Sunset, Forest, Neon Purple, Cyberpunk, Ocean
- Theme switching uses a context provider and persists in local storage
- ThemeToggle includes a dropdown with emojis/icons and a quick selector
- Color tokens (background, foreground, primary, etc.) drive all components; WCAG AA mindful palettes
- Monaco editor adapts to the selected theme (vs-light/vs-dark)

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
- /theme — theme toggle and comprehensive component showcase
- /sessions — list, preview, restore, rename, duplicate, delete (with confirmation)
- /compare — side-by-side input with textual diff
- /convert — JSON ↔ YAML ↔ CSV converter
- /graph-view — basic visual cards (placeholder for interactive graph)
- /random-json — random JSON generator

## Keyboard shortcuts

- Ctrl/Cmd+Z: Undo
- Ctrl/Cmd+Shift+Z: Redo
- Ctrl/Cmd+S: Save to active session

## Data and persistence

- Data persists to localStorage under the `json-viewer:` prefix (sessions, active session, current JSON)
- Theme preference is stored and restored across reloads

## Tech stack

- Next.js (App Router), React, TypeScript
- Tailwind CSS v4, shadcn/ui (Radix)
- Monaco editor
- Sonner for toasts

## Notes

- Some animations use the View Transitions API if the browser supports it.
- shadcn/ui primitives reside in `components/ui` and target Tailwind v4.
