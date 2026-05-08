## Problem

Every report shows roughly the same `totalHoursSaved` value (often 12+). The Llama model — instructed to stay between 8 and 14 — converges on a "safe" middle number, so reports feel cookie-cutter.

## Root cause

In `supabase/functions/generate-report/index.ts`:
- The prompt tells the model `"totalHoursSaved": <number between 8 and 14>` with no guidance on how to vary it.
- The server-side clamp only caps the upper bound; it never recomputes or varies the value.
- The per-recommendation `hoursSaved` (2–5) sums to ~12 by default, reinforcing the same number.

## Fix

Make `totalHoursSaved` a deterministic function of the user's actual inputs, not a free-form number from the LLM.

### 1. Tier the range by inputs (prompt change)

Replace the flat "8–14" instruction with explicit tiers based on signals the user provided:

```text
Calculate totalHoursSaved tied to the user's actual workload:
- Base by number of pain points selected:
  • 1 pain point  → 4-7  hrs/week
  • 2 pain points → 7-10 hrs/week
  • 3 pain points → 10-13 hrs/week
  • 4+ pain points→ 12-16 hrs/week
- Adjust by business size:
  • Solo / 1-person  → bottom of the range
  • 2-10 employees   → middle
  • 11+ employees    → top of the range
- Adjust by dailyTimeDrain text:
  • Mentions "all day", "most of my day", numbers ≥4 hrs/day → push to top
  • Short or vague drain → bottom
Recommendations' individual hoursSaved must SUM to roughly totalHoursSaved.
```

### 2. Server-side: recompute total from the recommendations

After the model returns, override `totalHoursSaved` with the sum of `recommendations[].hoursSaved`, then clamp to a sensible window (4–16). This guarantees the number reflects the actual recommended mix and varies as the LLM varies the per-rec hours.

```ts
const recSum = recs.reduce((s, r) => s + (r.hoursSaved || 0), 0);
report.totalHoursSaved = Math.max(4, Math.min(16, recSum || report.totalHoursSaved));
```

### 3. Deterministic jitter to break ties

If two users produce identical rec sums, add ±1 hr jitter seeded by a hash of `businessType + businessSize + painPoints + dailyTimeDrain`. Same inputs → same number (stable), different inputs → different number.

```ts
const seed = hash(`${businessType}|${businessSize}|${painPoints.join(',')}|${dailyTimeDrain}`);
const jitter = (seed % 3) - 1; // -1, 0, or +1
report.totalHoursSaved = Math.max(4, Math.min(16, report.totalHoursSaved + jitter));
```

## Files touched

- `supabase/functions/generate-report/index.ts` — prompt update + post-processing (sum + clamp + jitter).

Nothing else changes — the field flows unchanged into the web report, PDF, and email.

## Out of scope

- No UI changes.
- No DB changes.
- Per-recommendation hours stay capped at 5 (already in place).
- Won't switch model providers.

## Verification

- Run the scanner with 3 different profiles (e.g., 1 pain point + solo, 2 pain points + 2-10, 4 pain points + 11+) and confirm three distinct `totalHoursSaved` values.
- Run the same profile twice → same value (stable, deterministic).
