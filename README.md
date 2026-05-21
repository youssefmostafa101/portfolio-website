# Yusef — Portfolio & Client Onboarding

A single-page portfolio for a DTC email-marketing agency, plus a private
client onboarding page that's reachable only by direct link.

## What's in here

| File | Purpose |
| --- | --- |
| `index.html` | Public portfolio — 11 sections, dark editorial |
| `onboarding.html` | Private client onboarding — 6 chapters, course-style |
| `admin.html` | Local-only panel to update working hours / timezone |
| `style.css` | Shared design system (typography, tokens, dark theme) |
| `onboarding.css` | Onboarding-only styles (chapters, availability widget) |
| `script.js` | Public-site behavior (nav, FAQ accordion, fade-ins) |
| `onboarding.js` | Availability widget + timezone conversion |
| `availability.json` | Working hours config (committed) |
| `robots.txt` | Allows public site, blocks onboarding & admin |
| `sitemap.xml` | Public site only — onboarding never indexed |
| `CNAME` | GitHub Pages custom domain |

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

- **Calendly URL** — `https://calendly.com/yusef/discovery-call` in
  `index.html` (final CTA + header "Book Call" link)
- **Social links** — `#` placeholders in the footer of `index.html`
  (Twitter / LinkedIn / Instagram)
- **Google Form embed** — placeholder block in onboarding Chapter 2
  (replace with your live form's `<iframe>` — sample code commented in
  the HTML)
- **Slack invite link** — `#` in onboarding Chapter 5
- **WhatsApp number** — `+00 000 000 0000` in onboarding Chapter 5
- **Google Drive "Brand Vault" link** — `#` in onboarding Chapter 4
  (one per client — swap before sending each link)
- **Admin passphrase** — `change-me` in `admin.html` (line 133)
- **Klaviyo / Shopify access screenshots** — onboarding Chapter 3 has
  placeholder boxes (`<div class="screenshot-placeholder">`) where the
  real screenshots will go. Drop them into `/assets/` and swap the
  placeholder divs for `<img>` tags.
- **Founder Name placeholders** — the six CLiYRA welcome flow emails in
  `/assets/work/` contain `[Founder Name]` text. Re-export them from
  Figma with your real name before launch.

## Making updates

Edit the file, commit, push. GitHub Pages redeploys in ~30 seconds.

## Stack

HTML + CSS + vanilla JS. Tailwind via CDN for utility classes. Three
Google Fonts (Instrument Serif, Inter, JetBrains Mono). No build step.
No framework. No tracking.
