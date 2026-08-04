# Euan Livingstone — Portfolio

Personal portfolio for **Euan Livingstone MBCS** — web designer & developer based in Dunfermline, Scotland.

**Live site:** [euanliv.click](https://euanliv.click)

A minimalist Next.js portfolio with case studies, booking, theming, and a few playful extras. Open-sourced so others can learn from the structure or fork it as a starting point.

---

## Features

- **Case studies** — project pages with brand colours, SEO copy, and adjacent-project navigation
- **Booking** — Google Calendar consultation embeds (`/book`)
- **Contact form** — MailerSend-powered API route
- **Light / dark mode** — persisted preference with a welcome cue
- **Accent hues** — random accent each visit (cyan, blue, pink, orange, violet, gold) plus a footer swatch swapper
- **Motion** — boot intro, typewriter hero, page transitions (respects `prefers-reduced-motion`)
- **Discord presence** — live status via Lanyard
- **Local pages** — About, Charity, Dunfermline SEO landing
- **SEO** — sitemap, robots, JSON-LD, breadcrumbs, Open Graph

## Stack

| Layer | Choice |
| --- | --- |
| Framework | [Next.js](https://nextjs.org) 16 (App Router) |
| UI | React 19, TypeScript |
| Styles | Tailwind CSS 4 |
| Fonts | Outfit, Instrument Serif, Syne (`next/font`) |
| Presence | [use-lanyard](https://github.com/alii/use-lanyard) |

## Project structure

```text
app/                 # Routes (home, work, about, contact, book, charity, dunfermline)
  api/contact/       # Contact form → MailerSend
  work/[slug]/       # Case study pages
components/          # UI (header, footer, intro, theming, booking, …)
lib/
  data.ts            # Site copy, projects, nav
  accent.ts          # Accent colour system
  theme.ts           # Light / dark
  caseStudySeo.ts    # Per-project meta
  caseStudyTheme.ts  # Palette → readable CSS vars
  seo.ts             # Structured data helpers
public/projects/     # Case study logos
```

Most content lives in `lib/data.ts` — edit projects, about copy, and nav there first.

## Getting started

**Requirements:** Node.js 20+ recommended.

```bash
git clone https://github.com/einc123/portfolio.git
cd portfolio
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

```bash
npm run build    # production build
npm run start    # serve production build
npm run lint     # ESLint
```

## Environment variables

Create a `.env.local` for optional integrations:

```env
# Contact form (MailerSend)
MAILERSEND_API_KEY=your_api_key
MAILERSEND_FROM_EMAIL=noreply@yourdomain.com
MAILERSEND_FROM_NAME=Portfolio contact form
CONTACT_TO_EMAIL=you@yourdomain.com

# Cloudflare Web Analytics (cookieless — no consent toggle)
NEXT_PUBLIC_CF_BEACON_TOKEN=your_beacon_token
```

Without MailerSend vars, the site still runs; the contact API returns an error if email isn’t configured.

On Cloudflare Pages, set these under **Settings → Variables and Secrets** for the **Production** (and Preview, if needed) runtime environment. Encrypted secrets like `MAILERSEND_API_KEY` are only available at runtime — redeploy after adding or changing them so Functions pick them up.

Google Calendar booking URLs live in `lib/data.ts` (`bookingOptions`).

Cloudflare Web Analytics does not use cookies. You can enable it in the Cloudflare dashboard and/or set `NEXT_PUBLIC_CF_BEACON_TOKEN`; visitors are informed on the cookies policy page, without an analytics opt-in.

## Customising

1. **Identity** — update `site`, `about`, and `aboutPage` in `lib/data.ts`
2. **Projects** — add entries to `projects` and logos under `public/projects/`
3. **SEO for case studies** — extend `lib/caseStudySeo.ts`
4. **Accents** — palettes in `app/globals.css` (`data-accent="…"`) and `lib/accent.ts`
5. **Nav** — `nav` array in `lib/data.ts` (header + footer)

## Routes

| Path | Purpose |
| --- | --- |
| `/` | Home |
| `/work` | Case study index |
| `/work/[slug]` | Individual case study |
| `/about` | About me |
| `/contact` | Contact form |
| `/book` | Book a consultation |
| `/charity` | Charity & community work |
| `/dunfermline` | Local Dunfermline / Fife landing |

## Deploy

Built for any Node host that supports Next.js (Vercel, Cloudflare, etc.):

```bash
npm run build
npm run start
```

Point your domain at the deployment and set the MailerSend env vars in the host dashboard.

## Licence

This project is released under the [Portfolio Attribution License](./LICENSE).

You may use, modify, and redistribute it, including for your own portfolio —
**provided you credit Euan Livingstone** and link back to
[euanliv.click](https://euanliv.click) (for example in your site footer and README).

Replace personal content, branding, and case studies with your own when you fork.

---

Built by [Euan Livingstone](https://euanliv.click) · [LinkedIn](https://www.linkedin.com/in/euan-livingstone-mbcs-b0b049214/)
