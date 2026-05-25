---
name: testing-nyaga
description: Test the Intech Computer Shop (nyaga) app. Use when verifying UI, account, checkout, or admin features.
---

# Testing the Intech Computer Shop (nyaga)

## Stack
- **Frontend/SSR:** TanStack Start + React 19 + Vite
- **Deployment:** Cloudflare Workers
- **Backend:** Supabase (auth, database, realtime)
- **Styling:** Tailwind CSS v4 + shadcn/ui components

## Local Dev Setup
```bash
cd /home/ubuntu/repos/nyaga
npm install
npm run dev    # starts Vite dev server (default port 8080, falls back to 8081+)
```

## Key Commands
- `npm run lint` — ESLint + Prettier
- `npm run build` — Vite production build
- `npx tsc --noEmit` — TypeScript type checking
- `npm run dev` — dev server

## Supabase Configuration
The app requires Supabase environment variables to enable authentication and database features:
- `VITE_SUPABASE_URL` — e.g., `https://<project-id>.supabase.co`
- `VITE_SUPABASE_PUBLISHABLE_KEY` — the anon/public key from Supabase dashboard

Without these, pages that require auth (account, checkout, admin) will show "Account unavailable" or "Sign-in unavailable". The Supabase project ID can be found in `supabase/config.toml`.

## Devin Secrets Needed
- `VITE_SUPABASE_URL` — Supabase project URL (repo-scoped)
- `VITE_SUPABASE_PUBLISHABLE_KEY` — Supabase anon key (repo-scoped)

## Testing Notes
- **Unauthenticated features** (homepage, categories, product pages, cart, static pages) can be tested without Supabase credentials.
- **Authenticated features** (account page, checkout, admin dashboard, orders) require Supabase credentials and a test user account.
- The account page action cards (Wishlist, Logout) only render when a user is logged in — if testing changes to these, you must have Supabase configured and be signed in.
- Cloudflare Workers preview deployments are created automatically on PR — check the PR comments from `cloudflare-workers-and-pages[bot]` for preview URLs.
- The app uses TanStack Router with file-based routing — routes are in `src/routes/`.

## Route Structure
- `/` — Homepage with hero carousel and product listings
- `/account` — User account (requires auth)
- `/auth` — Sign in / Sign up
- `/cart` — Shopping cart
- `/checkout` — Checkout flow (requires auth)
- `/admin` — Admin dashboard (requires admin role)
- `/category/:slug` — Category pages
- `/product/:id` — Product detail pages
