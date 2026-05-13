# SEO Review — Creative Hauz Automation Scanner

## Findings

**Critical**
1. **Broken HTML in `index.html`** — `</head>` is missing before `<body>`. Browsers tolerate it, but it's invalid markup and risks meta tags being ignored by some crawlers.
2. **No canonical URL** — required to consolidate `scanner.creativehauz.space` vs `creativehauz-scanner.lovable.app` vs preview URLs.
3. **No `sitemap.xml`** — crawlers have no map of the site.
4. **`robots.txt` missing `Sitemap:` directive.**

**Important**
5. **No JSON-LD structured data** — should declare `Organization` + `WebSite` for richer SERP appearance.
6. **Admin / Unsubscribe routes are publicly crawlable** — should be `Disallow`-ed in robots.txt (can't add per-route noindex without Helmet).
7. **OG image lacks `og:image:width` / `og:image:height` / `og:image:alt`** — recommended for LinkedIn/Slack previews.
8. **No `<meta name="robots">`** — explicit `index, follow` is best practice.
9. **Title is brand-only** ("Creative Hauz Automation Scanner") — would benefit from a value-prop keyword (e.g. "Free AI Automation Scanner for SMBs | Creative Hauz") for CTR + keyword targeting.

**Passing**
- Single H1 in HeroSection ✓
- Meta description present and within length ✓
- OG + Twitter card tags present ✓
- Favicon + manifest + theme-color ✓
- `lang="en"` ✓

## Plan

### 1. Fix `index.html`
- Add the missing `</head>` before `<body>`.
- Add `<link rel="canonical" href="https://scanner.creativehauz.space/" />`.
- Add `<meta name="robots" content="index, follow" />`.
- Improve `<title>` → `Free AI Automation Scanner for SMBs | Creative Hauz`.
- Add `og:image:width` (1200), `og:image:height` (640), `og:image:alt`, `og:site_name`, `og:locale`.
- Add JSON-LD blocks: `Organization` (Creative Hauz, logo, contact `info@creativehauz.space`, sameAs links) and `WebSite` (name, url, potentialAction SearchAction omitted as no search).

### 2. Create `scripts/generate-sitemap.ts`
- BASE_URL = `https://scanner.creativehauz.space`.
- Entries: `/` only (priority 1.0). Exclude `/admin`, `/unsubscribe`, `/privacy-policy` is debatable — include `/privacy-policy` at low priority for transparency.
- Wire `predev` + `prebuild` scripts in `package.json`.

### 3. Update `public/robots.txt`
- Add `Disallow: /admin` and `Disallow: /unsubscribe` under `User-agent: *`.
- Add `Sitemap: https://scanner.creativehauz.space/sitemap.xml`.

### 4. (Optional) Confirm with user before doing
- Generating a richer OG image variant — current one is fine, skip unless asked.
- Adding `react-helmet-async` for per-route titles — only `/` matters for SEO; other routes are utility. **Skip** unless user wants per-route control.

## Out of scope
- No content/copy rewrites.
- No backlink/keyword research (can run via Semrush after fixes if desired).
- No design changes.

Approve to implement.
