# EdgeMind Lab

Website for the EdgeMind Lab at WIGWE UNIVERSITY – College of Science and Computing: hands-on labs and exercises in Arduino, Raspberry Pi + Linux, language models, AI agents and Ender-3 V3 SE 3D printing for robotics.

## Stack

- Next.js (App Router) + TypeScript
- Tailwind CSS v4 + shadcn/ui
- Vitest, ESLint, Prettier
- Hosted on Vercel

## Local setup

Requires Node.js 22 (see `.nvmrc`).

```bash
npm ci
cp .env.example .env.local   # optional
npm run dev
```

Open http://localhost:3000.

## Environment variables

| Name                   | Purpose                                             | Default                 |
| ---------------------- | --------------------------------------------------- | ----------------------- |
| `NEXT_PUBLIC_SITE_URL` | Public base URL used for metadata and absolute URLs | `http://localhost:3000` |

It is read in one place, `lib/site.ts`.

## Scripts

| Script                 | What it does                              |
| ---------------------- | ----------------------------------------- |
| `npm run dev`          | Start the development server              |
| `npm run build`        | Production build                          |
| `npm run start`        | Serve the production build                |
| `npm run lint`         | ESLint                                    |
| `npm run lint:fix`     | ESLint with auto-fix                      |
| `npm run typecheck`    | Generate route types, then `tsc --noEmit` |
| `npm run format`       | Format with Prettier                      |
| `npm run format:check` | Check formatting without writing          |
| `npm test`             | Run the Vitest suite once                 |
| `npm run test:watch`   | Run Vitest in watch mode                  |

Before opening a pull request, run:

```bash
npm run format:check && npm run lint && npm run typecheck && npm test && npm run build
```

CI runs the same checks on pull requests and on `main` once `.github/workflows/ci.yml` is committed.

## Notes for contributors and coding agents

This project uses a recent Next.js release whose conventions differ from older versions. Read the relevant guide in `node_modules/next/dist/docs/` before changing routing, metadata or configuration (see `AGENTS.md`).
