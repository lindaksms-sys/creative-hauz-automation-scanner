## Goal

Remove the generic "AI Growth System" recommendation block (the $9,997 one-time + $997/mo offer) everywhere it currently appears in the scanner output. Keep the personalized automation recommendations, the hours-saved hero stat, the booking CTA, and the email-summary delivery flow intact.

## Audit — where the offer currently lives

1. **Web report (`src/components/ScanReport.tsx`)** — renders `<AIGrowthSystemCTA variant="full">` near the top and `<AIGrowthSystemCTA variant="compact">` near the bottom.
2. **Component (`src/components/report/AIGrowthSystemCTA.tsx`)** — full file is the offer (badge "Recommended AI System for You", $9,997 line, "What's included" list, niche-results box, two testimonials, audit CTA).
3. **PDF (`src/lib/generateReportPdf.ts`)**
   - Lines ~153–222: top "Recommended AI System for You" card with $9,997 pricing, includes list, niche-results box, testimonial.
   - Lines ~298–319: bottom "Your Recommended System: AI Growth System" orange CTA banner.
4. **Email HTML (`src/lib/buildReportHtml.ts`)** lines ~91–107: "🚀 Recommended AI System for You" block with $9,997 line, includes list, niche-results, testimonial.
5. **Transactional email template (`supabase/functions/_shared/transactional-email-templates/report-summary.tsx`)** lines ~85–~110 (similar block).
6. **Memory** — `mem://business/ai-growth-system-offer` exists for this offer; should be marked retired so future sessions don't re-introduce it.

## What changes

### Web report
- Delete both `<AIGrowthSystemCTA>` usages from `ScanReport.tsx` (and the import).
- Delete `src/components/report/AIGrowthSystemCTA.tsx` entirely.
- Keep the existing "Ready to implement these automations?" CTA card (Book My Free AI Audit + Full Blueprint links) — it stays as the single conversion CTA.

### PDF (`generateReportPdf.ts`)
- Remove the top AI Growth System card (the section labeled `── AI GROWTH SYSTEM SECTION (TOP — Full) ──`, ~lines 153–222, including its `ensureSpace`, header bar, body, includes list, niche box, testimonial, and the trailing `y += 74`).
- Remove the bottom AI Growth System CTA banner (~lines 298–319).
- Add a small replacement footer CTA (single line + booking URL) so the PDF still ends with a clear next step:
  > "Want help implementing these? Book a free 30-min AI Audit — calendar.app.google/3RL1z4zboDkeWLebA"
- Drop now-unused locals (`drainText`, `nicheResults`, related niche maps) only if nothing else references them after the cuts.

### Email summary
- In `buildReportHtml.ts`: remove the "🚀 Recommended AI System for You" block (the entire `<div style="background:#fdf3ef …">` containing pain section, $9,997 line, includes list, niche-result line, and Priya testimonial). Keep the recommendations list, the hours-saved hero, and the existing "Book My Free AI Audit →" CTA further down.
- In `report-summary.tsx` template: delete the equivalent block (lines ~85–110) so the queued/transactional email matches.

### Memory hygiene
- Update `mem://business/ai-growth-system-offer` to mark the offer as retired ("Do not re-introduce the $9,997 AI Growth System recommendation in scanner output.") and update the index entry so future sessions know not to re-add it.

## Out of scope

- No copy changes to the personalized recommendations themselves.
- No changes to questionnaire, lead capture, n8n webhook, Supabase tables, RLS, or auth.
- No new offer or replacement product copy — user only asked to remove the generic recommendation. If you later want a different offer block, that's a follow-up.

## Files touched

- `src/components/ScanReport.tsx` (edit)
- `src/components/report/AIGrowthSystemCTA.tsx` (delete)
- `src/lib/generateReportPdf.ts` (edit)
- `src/lib/buildReportHtml.ts` (edit)
- `supabase/functions/_shared/transactional-email-templates/report-summary.tsx` (edit)
- `mem://business/ai-growth-system-offer` + `mem://index.md` (update)

## Verification

- Run the scanner end-to-end in preview, confirm no "AI Growth System" / "$9,997" copy in the rendered report.
- Download PDF, confirm the two removed sections are gone and layout still flows.
- Trigger an email summary (or use the `preview-transactional-email` function) and confirm the offer block is gone.
- `rg -n "AI Growth System|9,?997"` returns zero hits in `src/` and `supabase/functions/`.
