# Design system

The visual language of EdgeMind Lab: academic, clean, technical and accessible. This file lists the tokens, the shared components and the rules for using them.

## Principles

- **Plain surfaces.** No gradients, no decorative imagery, no hero banners.
- **No motion** beyond the colour transition on hover and focus. Menus open and close without sliding or fading.
- **Text first.** The wordmark is the text "EdgeMind Lab". There is no logo until the university supplies one.
- **Accessible by default.** Every colour pair below is checked against WCAG 2.1 AA by `tests/tokens.test.ts`, and the smoke test runs axe on the home page in both themes.

## Tokens

Tokens are CSS variables in `app/globals.css`. The `:root` block holds the light theme and the `.dark` block holds the dark theme. The `@theme inline` block maps each variable to a Tailwind utility, so `--muted-foreground` is used as `text-muted-foreground`.

Use the utilities. Do not write hex values or Tailwind palette classes such as `text-slate-600` in components: they would not change with the theme.

### Colour

Greys come from the Tailwind slate scale.

| Token                            | Light     | Dark      | Use                                             |
| -------------------------------- | --------- | --------- | ----------------------------------------------- |
| `background`                     | `#ffffff` | `#020617` | Page background                                 |
| `foreground`                     | `#0f172a` | `#f1f5f9` | Body text and headings                          |
| `card` / `popover`               | `#ffffff` | `#0f172a` | Raised surfaces: cards, the mobile menu         |
| `muted` / `secondary` / `accent` | `#f1f5f9` | `#1e293b` | Quiet surfaces: footer, hover and active states |
| `muted-foreground`               | `#475569` | `#94a3b8` | Secondary text: descriptions, captions          |
| `primary`                        | `#0f172a` | `#f1f5f9` | Filled buttons                                  |
| `primary-foreground`             | `#f8fafc` | `#0f172a` | Text on filled buttons                          |
| `brand`                          | `#1d4ed8` | `#93c5fd` | The accent: links and the current-page marker   |
| `brand-foreground`               | `#ffffff` | `#020617` | Text on a `brand` background                    |
| `destructive`                    | `#b91c1c` | `#f87171` | Error text                                      |
| `border`                         | `#e2e8f0` | `#1e293b` | Dividers and decorative borders                 |
| `input`                          | `#64748b` | `#64748b` | Borders of controls (buttons, fields)           |
| `ring`                           | `#1d4ed8` | `#93c5fd` | Focus outline                                   |

`brand` is a **placeholder**. It will be replaced when the university's official colours are supplied; change the two `--brand` values and the two `--ring` values, then run `npm test` to confirm the contrast checks still pass.

Contrast rules, enforced by `tests/tokens.test.ts` in both themes:

- `foreground`, `muted-foreground` and `brand` are at least 4.5:1 on every surface (`background`, `card`, `popover`, `muted`, `accent`).
- Each `*-foreground` token is at least 4.5:1 on its own background.
- `input` and `ring` are at least 3:1 on every surface.
- `border` is decorative and is not held to a ratio. A border that is the only thing marking a control's edge must use `border-input`.

When you add a colour token, add its pair to that test.

### Typography

| Token       | Font       | Use                                     |
| ----------- | ---------- | --------------------------------------- |
| `font-sans` | Geist      | Interface text, prose and headings      |
| `font-mono` | Geist Mono | Code, commands, pin names and filenames |

Both fonts are loaded in `app/layout.tsx` through `next/font`, which downloads them at build time and serves them from the site. No request goes to a font host at run time.

| Element         | Classes                                             |
| --------------- | --------------------------------------------------- |
| Page title (H1) | `text-3xl sm:text-4xl font-semibold tracking-tight` |
| Section (H2)    | `text-2xl font-semibold tracking-tight`             |
| Subsection (H3) | `text-lg font-semibold tracking-tight`              |
| Lead paragraph  | `text-lg text-muted-foreground`                     |
| Body            | default size (`text-base`)                          |
| Small print     | `text-sm text-muted-foreground`                     |

A page has exactly one H1, rendered by `PageHeader`. Heading levels are not skipped.

### Spacing, radius and width

- **Spacing:** the default Tailwind scale (multiples of `0.25rem`). No custom spacing tokens.
- **Radius:** `--radius` is `0.375rem`. Use `rounded-lg` for controls and cards, `rounded-md` and `rounded-sm` for smaller elements.
- **Page width:** `max-w-content` is `72rem`. `Container` applies it.
- **Reading width:** `max-w-prose` is `70ch`, inside the limit of 75 characters per line. Apply it to paragraphs and lists of running text.

### Focus

Every focusable element gets a 2px `ring`-coloured outline with a 2px offset on `:focus-visible`. This is set once in `app/globals.css`. Do not remove outlines in components.

## Themes

`components/theme-provider.tsx` wraps `next-themes`. The theme follows the operating system until the visitor uses the toggle, then the choice is stored in the browser. `next-themes` sets the `dark` class on `<html>` before the first paint, so the page does not flash in the wrong theme.

Write theme-specific styles with the `dark:` variant only when a token cannot express them. A component must not read the theme during render: the server does not know it. `ThemeToggle` shows the pattern, rendering both icons and letting CSS pick one.

## Components

### Layout (`components/layout/`)

| Component        | Purpose                                                                                                 |
| ---------------- | ------------------------------------------------------------------------------------------------------- |
| `Header`         | Institution line, wordmark, primary navigation, search trigger, theme toggle, mobile menu button        |
| `NavLinks`       | The primary navigation items from `site.nav`, with `aria-current="page"` on the current section         |
| `MobileNav`      | Menu for screens narrower than `md`. Traps focus; closes on Escape, on backdrop click and on navigation |
| `Footer`         | Full institution name, section links, repository link, copyright year                                   |
| `SkipLink`       | "Skip to content". The first focusable element on every page; moves focus to `<main>`                   |
| `Container`      | Centres content at `max-w-content` with side padding                                                    |
| `PageShell`      | `Container` plus the vertical spacing every page uses                                                   |
| `PageHeader`     | Breadcrumbs, the H1 and an optional lead paragraph                                                      |
| `Breadcrumbs`    | Trail from Home to the current page; the last item is text with `aria-current="page"`                   |
| `SectionHeading` | An H2 or H3 with an optional description                                                                |
| `PageLinkList`   | A list of links, each with a one-line description                                                       |
| `SearchTrigger`  | Disabled placeholder until search is built                                                              |
| `ThemeToggle`    | Switches between light and dark                                                                         |

`Header`, `Footer` and `SkipLink` are rendered once, in `app/layout.tsx`. Pages do not render them.

### Primitives (`components/ui/`)

| Component | Notes                                                                                      |
| --------- | ------------------------------------------------------------------------------------------ |
| `Button`  | Variants `default`, `outline`, `ghost`, `link`; sizes `default`, `sm`, `lg`, `icon`        |
| `Sheet`   | Modal side panel built on the Base UI dialog. Used by `MobileNav`. No open/close animation |

These started from shadcn/ui and were trimmed. If you add another shadcn component, remove its animation classes and check that it imports `cn` from `@/lib/utils`.

## Usage rules

### A new page

```tsx
import type { Metadata } from "next";

import { PageHeader } from "@/components/layout/page-header";
import { PageShell } from "@/components/layout/page-shell";
import { pageMetadata } from "@/lib/metadata";

export const metadata: Metadata = pageMetadata({
  title: "Resources",
  description:
    "Code, wiring diagrams, 3D models and parts lists from the labs.",
  path: "/resources",
});

export default function ResourcesPage() {
  return (
    <PageShell>
      <PageHeader
        title="Resources"
        description="Code, wiring diagrams, 3D models and parts lists from the labs."
        breadcrumbs={[{ label: "Resources" }]}
      />
      {/* Page content */}
    </PageShell>
  );
}
```

- Wrap the page in `PageShell` and start it with `PageHeader`.
- Pass breadcrumbs without "Home"; `PageHeader` adds it. The last item has no `href`.
- Set metadata with `pageMetadata` so the title, description, canonical URL and Open Graph tags stay consistent.
- Add a static page to `STATIC_ROUTES` in `lib/routes.ts`. That list feeds `sitemap.xml` and the smoke test. Pages generated from `content/` are picked up automatically.
- A top-level section also needs an entry in `site.nav` (`lib/site.ts`) and in `lib/sections.ts`.

### Text and names

- The institution name comes from `site.institution`. Do not type it into a component.
- Links inside running text are underlined and use `text-brand`. Colour alone never marks a link.
- An icon-only button needs a text label in a `sr-only` span, and the icon gets `aria-hidden="true"`.

### Responsive layout

- Design for 320px first. The smoke test fails if any route scrolls horizontally at 320px or 1920px.
- The primary navigation is in the header from `md` (768px) up, and in `MobileNav` below it.

## Checks

| Check                         | Command                             |
| ----------------------------- | ----------------------------------- |
| Token contrast, route list    | `npm test`                          |
| Routes, keyboard, themes, axe | `npm run build && npm run test:e2e` |
