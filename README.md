# Euan Livingstone — Portfolio

Personal portfolio for **Euan Livingstone MBCS** — freelance web designer & developer based in Dunfermline, Scotland.

**Live site:** [euanliv.click](https://euanliv.click)

A Next.js portfolio with case studies, booking, theming, hosting/photography pages, and a client portal (auth, billing, contracts). Open-sourced so others can learn from the structure or fork it as a starting point.

---

## Features

- **Case studies** — project pages with brand colours, SEO copy, and adjacent-project navigation (stored in Cloudflare D1)
- **Client portal** — invites, login (password / TOTP / passkeys), orgs, invoices, contracts, Stripe billing
- **Booking** — Google Calendar consultation embeds (`/book`)
- **Contact form** — MailerSend-powered API route
- **Hosting & photography** — service pages (`/hosting`, `/photography`)
- **Light / dark mode** — persisted preference with a welcome cue
- **Accent hues** — random accent each visit plus a footer swatch swapper
- **Motion** — boot intro, typewriter hero, page transitions (respects `prefers-reduced-motion`)
- **Discord presence** — live status via Lanyard
- **Local SEO pages** — About, Charity, Dunfermline landing
- **SEO** — sitemap, robots, JSON-LD, breadcrumbs, Open Graph

## Stack

| Layer | Choice |
| --- | --- |
| Framework | [Next.js](https://nextjs.org) 16 (App Router) |
| UI | React 19, TypeScript |
| Styles | Tailwind CSS 4 |
| Fonts | Outfit, Instrument Serif, Syne (`next/font`) |
| Deploy | [Cloudflare Workers](https://developers.cloudflare.com/workers/) via [@opennextjs/cloudflare](https://opennext.js.org/cloudflare) |
| Database | [Cloudflare D1](https://developers.cloudflare.com/d1/) (Workers binding in production) |
| Billing | Stripe |
| Presence | [use-lanyard](https://github.com/alii/use-lanyard) |

## Project structure

```text
app/                      # Routes
  api/contact/            # Contact form → MailerSend
  api/client/             # Client portal APIs (e.g. WebAuthn)
  client/                 # Client portal + admin
  work/[slug]/            # Case study pages
  hosting/ photography/   # Service pages
components/               # UI (public site + client portal)
lib/
  data.ts                 # Site copy, nav, booking options
  seo.ts                  # Metadata + JSON-LD helpers
  db.ts                   # D1 binding / remote API / local SQLite
  caseStudies.ts          # Case studies from D1
  auth/ stripe/ mail/     # Portal auth, billing, email
migrations/               # D1 SQL migrations
wrangler.jsonc            # Worker name, D1 binding, OpenNext output
open-next.config.ts       # OpenNext Cloudflare adapter config
public/projects/          # Case study logos
```

Most public copy lives in `lib/data.ts`. Case studies are seeded into D1 (`lib/caseStudySeed.ts` + `npm run db:seed-case-studies`).

## Getting started

**Requirements:** Node.js **22+** (see `.node-version`). Cloudflare Workers Builds defaults to a recent Node as well.

```bash
git clone https://github.com/einc123/portfolio.git
cd portfolio
npm install
cp .env.example .env.local   # fill in as needed
npm run db:migrate:local     # create local SQLite schema
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

```bash
npm run build      # Next.js only (`next build`) — required name for OpenNext
npm run start      # Node server (local only)
npm run preview    # OpenNext build + Workers runtime locally
npm run lint
```

OpenNext invokes `npm run build` internally, so that script **must** stay as `next build`. Do not point it at `opennextjs-cloudflare build` (infinite loop).

### Database modes

`lib/db.ts` picks a driver from `CLOUDFLARE_D1_MODE` (default `auto`):

| Mode | Where | How |
| --- | --- | --- |
| `binding` | Production Worker | `env.DB` D1 binding via OpenNext |
| `remote` | Scripts / fallback | Cloudflare D1 HTTP API |
| `local` | `next dev` | SQLite file (`.data/euanliv-click.sqlite`) |

`auto` tries **binding → remote (if credentials) → local**. Admin pages show the effective mode under the hero.

```bash
npm run db:migrate:local
npm run db:migrate:remote
npm run db:seed-admin          # optional first admin user
npm run db:seed-case-studies
```

## Environment variables

See [`.env.example`](./.env.example) for the full list. Typical local file:

```env
# Contact + invites (MailerSend)
MAILERSEND_API_KEY=
MAILERSEND_FROM_EMAIL=noreply@euanliv.click
MAILERSEND_FROM_NAME=Euan Livingstone
CONTACT_TO_EMAIL=hello@euanliv.click

# D1
CLOUDFLARE_D1_MODE=local
CLOUDFLARE_ACCOUNT_ID=
CLOUDFLARE_API_TOKEN=
CLOUDFLARE_D1_DATABASE_ID=

# Client portal auth
AUTH_SECRET=
WEBAUTHN_RP_ID=localhost
WEBAUTHN_RP_NAME=Euan Livingstone Client Portal
WEBAUTHN_ORIGIN=http://localhost:3000

# Stripe
STRIPE_SECRET_KEY=
STRIPE_PUBLISHABLE_KEY=

# Optional analytics
NEXT_PUBLIC_CF_BEACON_TOKEN=
```

Without MailerSend, the site still runs; contact/invite email fails until configured.

On **Cloudflare Workers**, set runtime secrets under **Settings → Variables and Secrets**. Encrypted secrets are not available at `next build` — redeploy after changing them. Prefer reading secrets via `getRuntimeEnv()` / the Worker binding where needed.

Google Calendar booking URLs live in `lib/data.ts` (`bookingOptions`).

## Customising

1. **Identity** — `site`, `about`, and `aboutPage` in `lib/data.ts`
2. **Case studies** — seed data in `lib/caseStudySeed.ts`, logos under `public/projects/`, then re-seed D1
3. **SEO** — `lib/seo.ts` (site-wide) and per-study fields in the admin / seed
4. **Accents** — `app/globals.css` (`data-accent="…"`) and `lib/accent.ts`
5. **Nav** — `nav` array in `lib/data.ts`

## Routes

| Path | Purpose |
| --- | --- |
| `/` | Home |
| `/work` | Case study index |
| `/work/[slug]` | Individual case study |
| `/about` | About |
| `/contact` | Contact form |
| `/book` | Book a consultation |
| `/charity` | Charity & community work |
| `/dunfermline` | Local Dunfermline / Fife landing |
| `/hosting` | Hosting options (managed OVH, Spaceship, Verpex) |
| `/photography` | Still & drone photography |
| `/cookies` | Cookie policy |
| `/client/*` | Client portal (login, dashboard, invoices, security, …) |
| `/client/admin/*` | Admin (people, orgs, contracts, settings) |

`/spaceship` and `/verpex` redirect to `/hosting`.

## Deploy (Cloudflare Workers)

Production runs as the Cloudflare Worker named **`portfolio`** (see `wrangler.jsonc`) with OpenNext output and a **D1** binding named `DB`.

### Local deploy

```bash
npm run deploy    # opennextjs-cloudflare build && deploy
```

### Workers Builds (Git)

Your log failed with *“Could not find compiled Open Next config”* because the build step was only `npm run build` → `next build`. That never creates `.open-next/`.

Set **both** of these in Cloudflare → Worker → Settings → Builds:

| Setting | Value |
| --- | --- |
| **Build command** | `npx opennextjs-cloudflare build` |
| **Deploy command** | `npx wrangler deploy` |

Alternative if you prefer to keep build as `npm run build`:

| Setting | Value |
| --- | --- |
| **Build command** | `npm run build` |
| **Deploy command** | `npm run deploy` |

(`npm run deploy` runs OpenNext build + deploy itself.)

Keep `"build": "next build"` in `package.json`. OpenNext calls that internally — pointing `build` at `opennextjs-cloudflare build` causes an infinite loop.

After a successful deploy, run remote D1 migrations if tables are missing (`organisation_case_studies` etc.):

```bash
npm run db:migrate:remote
npm run db:seed-case-studies:remote   # optional
```

Then confirm `https://your-domain/sitemap.xml` returns XML and resubmit it in Google Search Console. If crawlers fail intermittently, check Cloudflare **Bot Fight Mode**.

## Licence

This project is released under the [Portfolio Attribution License](./LICENSE).

You may use, modify, and redistribute it, including for your own portfolio —
**provided you credit Euan Livingstone** and link back to
[euanliv.click](https://euanliv.click) (for example in your site footer and README).

Replace personal content, branding, and case studies with your own when you fork.

---

Built by [Euan Livingstone](https://euanliv.click) · [LinkedIn](https://www.linkedin.com/in/euan-livingstone-mbcs-b0b049214/)
