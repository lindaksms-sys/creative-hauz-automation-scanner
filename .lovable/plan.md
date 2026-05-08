## Goal
Refresh the scanner's visual identity to match the new Creative Hauz 2025 brand kit (Charcoal-first hybrid palette + Cormorant Garamond / DM Sans typography), while keeping every text/button combination at AA contrast.

## New brand tokens (HSL)

| Role | Name | Hex | HSL |
|---|---|---|---|
| Primary surface (light) | Bone | `#EDE7D8` | `43 35% 89%` |
| Card surface (light) | Bone Soft | `#F2ECDD` | `43 41% 91%` |
| Body text / dark surface | Charcoal | `#14130F` | `45 11% 7%` |
| Deepest contrast / footer | Deep Black | `#0E0D0A` | `40 14% 5%` |
| Card surface (dark) | Ink Soft | `#1F1D18` | `40 14% 11%` |
| Accent / CTAs / links | Antique Brass | `#D4A24C` | `38 60% 56%` |
| Secondary highlight (tags only) | Rust | `#C8451A` | `14 78% 45%` |
| Muted copy on light | Muted Mid | `#5A5247` | `30 13% 32%` |

**Contrast rule:** Antique Brass on Bone fails AA for body text — Brass is reserved for CTA backgrounds (with **Charcoal** foreground, ~7:1) and for non-text accents (icons, underlines, dividers). Body links use Charcoal underline + Brass on hover. Rust is used **only** on small tag/badge chips with white text.

## Typography
Replace `DM Serif Display` + `Inter` with the new pairing:
- **Headings:** Cormorant Garamond (400/600/700)
- **Body:** DM Sans (300/400/500)

Update the Google Fonts `@import` in `src/index.css` and the `fontFamily` map in `tailwind.config.ts` (`display` → Cormorant, `sans` → DM Sans). Bump heading weight to 600 since Cormorant is lighter than DM Serif Display.

## Files to update

1. **`src/index.css`** — swap font import; rewrite the `:root` and `.dark` token blocks with the values above; update `--gradient-primary` to a Brass→Rust ramp, `--gradient-hero` to Bone→Bone Soft, `--shadow-glow` to Brass-tinted; update the `.font-display` rule to Cormorant 600.

2. **`tailwind.config.ts`** — update `fontFamily.display` to Cormorant and `fontFamily.sans` to DM Sans; keep the existing semantic color mappings (they read from CSS vars, so no rename needed). Drop unused `green-accent` / `navy` aliases or repoint them to neutral charcoal so old class usages still render on-brand.

3. **`src/lib/buildReportHtml.ts`** (email/PDF HTML) — replace the hardcoded hex values with the new palette: card stripe `#4a9e7a` → Brass `#D4A24C`; brand wordmark accent `#c4572a` → Brass; hero stat block bg `#fdf3ef` → Bone Soft `#F2ECDD` with Brass border; CTA button `#c4572a` → Charcoal `#14130F` bg with Bone text (CTAs in email need very high contrast); urgency line `#e67e22` → Rust `#C8451A`; footer link `#c4572a` → Charcoal underline.

4. **Visual sweep** of components that may hardcode old terracotta classes or `text-white` on light surfaces:
   - `Navbar.tsx`, `HeroSection.tsx`, `Footer.tsx`
   - `ScannerQuestionnaire.tsx`, `ReportGate.tsx`, `ScanReport.tsx`
   - `report/ReportHeader.tsx`, `HeroStat.tsx`, `RecommendationList.tsx`, `ShareReport.tsx`, `EmailCapture.tsx`
   - `CookieConsent.tsx`
   Replace any `text-white`, `bg-black`, raw hexes, or `text-terracotta` literals with semantic tokens (`text-primary-foreground`, `bg-primary`, `text-accent`, etc.). No business-logic changes.

5. **`index.html`** — update the `<meta name="theme-color">` to Bone `#EDE7D8` so mobile browser chrome matches.

## Out of scope
- No copy changes, no layout changes, no component restructure.
- No changes to scanner logic, AI prompts, lead flow, n8n payload, or PDF layout structure (only the colors/fonts inside it).
- Memory file `mem://style/visual-identity` will be refreshed in the same pass to record the new palette/fonts and retire the old terracotta `#BF5728` reference.

## Verification
- Visually confirm light theme on `/index`, scanner steps, gate form, and report page at the current 384px viewport.
- Spot-check the generated PDF and the email HTML preview for contrast.
- Confirm no `text-white`/raw-hex regressions via a quick `rg` after edits.
