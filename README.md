# Yusef — Portfolio & Client Onboarding

A single-page portfolio for a men's-skincare email specialist, plus a
private client onboarding page that's reachable only by direct link.

## What's in here

| File | Purpose |
| --- | --- |
| `index.html` | Public portfolio — work grid, lightbox, ROI calculator, lead magnet, gold cursor |
| `onboarding.html` | Private onboarding — intake iframe, Klaviyo/Shopify guides, Week One, comms, referral |
| `intake.html` | Multi-step client intake form (submits to Formspree); iframed into onboarding |
| `admin.html` | Local-only panel to update working hours / timezone |
| `style.css` | Shared design system + ROI calculator + gold accent |
| `onboarding.css` | Onboarding-only styles (hero, step guides, timeline, referral form) |
| `script.js` | Public-site behavior (nav, FAQ, lightbox, lead magnet, ROI calc, cursor glow) |
| `onboarding.js` | Availability widget, screenshot fallback, referral submit |
| `availability.json` | Working hours config (committed) |
| `assets/work/` | Email previews (cliyra/labseries/brickell ×2 each) |
| `assets/onboarding/` | Klaviyo/Shopify access screenshots (kv-01…04, sh-01…05) — add PNGs here |
| `assets/the-email-design-system.pdf` | Lead magnet download |
| `robots.txt` | Allows public site, blocks onboarding / intake / admin |
| `sitemap.xml` | Public site only — onboarding never indexed |
| `CNAME` | GitHub Pages custom domain |

## ROI calculator (main site, "— 05 · THE MATH")

Two sliders (monthly revenue, current email %) drive live outputs against a 30%
benchmark, with auto-detected retainer tier and a count-up animation. Edge cases:
revenue < $30K, or current email % ≥ 30%, swap the outputs for a "book a call"
message. Annual estimate = monthly uplift × 11.25 (accounts for the 60-day ramp).

## Onboarding page

Rebuilt to the new brief: hero → intake form (iframed `intake.html`) → Klaviyo
4-step guide → Shopify 5-step guide → Week One timeline → communication (with the
live availability indicator) → referral section. Screenshot boxes show a styled
empty state until you drop real PNGs into `assets/onboarding/`. The referral form
submits to Formspree with `form_type=referral` and swaps to an inline thank-you.

## Portfolio work section

Three brand groups (CLiYRA = client, Lab Series + Brickell = prototypes),
each with two clickable email previews + a narrative block. Status pills use
colored dots: green = client, amber = prototype, outlined gray = genre tag.
Clicking any email opens a zoom/pan lightbox (wheel to zoom, drag to pan,
Esc / click-out / X to close). To swap an email, drop a new PNG over the
matching file in `assets/work/` — filenames are `brand-NN.png`.

## Lead magnet

A floating button (bottom-right, off-white pill on desktop, icon square on
mobile) and an auto-pop modal both offer `the-email-design-system.pdf`. The
modal auto-opens once per browser session after 20s (skips if the visitor
already clicked the button or is sitting on the contact section). State is
tracked in `sessionStorage` under `yusef_leadmagnet_shown`.

## View locally

Just open `index.html` in a browser — no build step. For the
onboarding page or admin panel, you'll want a local server so that
`availability.json` can be fetched:

```bash
# any of these work
python3 -m http.server 8080
# or
npx serve .
```

Then open <http://localhost:8080/>.

## Deploy to GitHub Pages

1. Push this repo to GitHub.
2. **Repo Settings → Pages → Source:** select the `main` branch (root).
3. Set your custom domain in `CNAME` (currently `yusef.info`).
4. In your registrar, point a CNAME DNS record for `yusef.info`
   to `<your-username>.github.io`.

After it's live:

- Public portfolio → `https://yusef.info/`
- Private onboarding → `https://yusef.info/onboarding.html`
- Admin panel → `https://yusef.info/admin.html`

The onboarding page is `noindex/nofollow` and not linked anywhere on the
public site or in the sitemap. It's reachable only by direct URL — share
the link with paying clients after they've confirmed the invoice.

## How the availability widget works

The onboarding page shows a green/red "Available now / Unavailable"
status, plus your hours and the visitor's local equivalent (auto-detected
via `Intl.DateTimeFormat`).

There are two ways to update it:

1. **Quick (local only)** — Open `/admin.html`, edit the values, hit
   **Save**. The widget reads from your browser's `localStorage` and
   reflects the change immediately. This only affects *your* browser.
2. **Permanent (visible to all visitors)** — Open `/admin.html`, edit
   the values, hit **Download availability.json**. Replace the file in
   the repo root with the downloaded one and commit + push. The widget
   reads from this file for every visitor.

The default admin passphrase is `change-me`. Edit the `ADMIN_PASSPHRASE`
constant inside `admin.html` to change it. It's friction, not real auth —
everything is client-side.

## What's still placeholder

Swap these in before sharing the URL widely:

- **Instagram link** — footer `href="#"` in `index.html`
- **Klaviyo / Shopify access screenshots** — drop PNGs named `kv-01…04` and
  `sh-01…05` into `assets/onboarding/`. Until then the boxes show a styled
  empty state (no broken-image icons).
- **Slack** — the onboarding copy tells clients to confirm "via Slack," but
  there's no Slack invite link element on the page yet. Say the word and I'll
  add a "Join your workspace →" link wherever you want it.
- **Admin passphrase** — `change-me` in `admin.html`

### Now live (no longer placeholder)

- Email → `yusef@cliyra.com` · Calendly → `yusef-cliyra/15min` · WhatsApp → `+20 106 504 2688`
- Intake form → hosted at `intake.html`, iframed into onboarding, submits to your Formspree
- Brand Vault → Google Drive link already set inside the intake form (Section 06)
- Portfolio emails, lead-magnet PDF, ROI calculator, referral form → all wired

## Making updates

Edit the file, commit, push. GitHub Pages redeploys in ~30 seconds.

## Stack

HTML + CSS + vanilla JS. Tailwind via CDN for utility classes. Three
Google Fonts (Instrument Serif, Inter, JetBrains Mono). No build step.
No framework. No tracking.
