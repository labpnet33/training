# Development workflow

## Local development

Use Node.js 22.12+ (the Vercel project currently uses Node 24). Install the locked dependencies and start the Vite server:

```bash
npm ci
npm run dev
```

Open the local URL printed by Vite and visit `/sandbox`. Sign-in is still enforced by the existing Supabase auth gate; use an authorized test account to exercise authenticated routes.

Before opening a pull request, run:

```bash
npm test
```

This checks the browser bootstrap modules, builds the site, copies the existing runtime into `dist/`, and verifies the required pages and pinned assets are present. To inspect the built output locally, run `npm run preview` after `npm run build`.

## Source and compatibility boundary

New React behavior and styles belong in `src/`. The first source-owned feature is `src/SandboxSourceEnhancements.jsx` with `src/styles/sandbox-compact.css`; Vite builds it into `/vite-assets/` and the app shell loads it. The existing simulator and most site UI still live in generated, hash-pinned files under `assets/`. Those files are a legacy compatibility layer: the build copies them unchanged so their URLs, auth ordering, and existing routes continue to work while features are migrated gradually. Avoid hand-editing generated bundles for new work.

The legacy entry pages and auth/session scripts remain at their current paths. `scripts/copy-legacy-to-dist.mjs` copies those paths and the complete `assets/` tree into the Vite output. New Vite bundles use `/vite-assets/` to avoid collisions with the existing `/assets/` contract.

## Pull requests and previews

Push feature branches and open a pull request against `main`. GitHub Actions runs `npm test`; the connected Vercel project creates a separate Preview Deployment for the branch/PR. Review the Vercel preview before merging. The existing Vercel SSO protection for preview deployments remains in place. Only merges to `main` update the production site.

Keep the auth routes (`/login`, `/register`, `/forgot-password`, `/reset-password`, `/verify-email`, `/account`) and catch-all rewrite order in `vercel.json` unchanged unless a migration explicitly includes route-parity tests.
