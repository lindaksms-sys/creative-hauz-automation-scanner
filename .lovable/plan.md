

## Plan: Switch Report Generation to Free Gemini API Key

### What Changes

One file: `supabase/functions/generate-report/index.ts`

Replace the Lovable AI Gateway call with a direct call to Google's Gemini API (`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent`).

### Steps

1. **You provide a Gemini API key** — get one free at [aistudio.google.com/apikey](https://aistudio.google.com/apikey)
2. **I store it as a secret** called `GEMINI_API_KEY` using the add_secret tool
3. **Update the Edge Function** to:
   - Read `GEMINI_API_KEY` instead of `LOVABLE_API_KEY`
   - Call `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent` directly
   - Adapt the request/response format to Gemini's native API (slightly different from OpenAI format)
   - Keep all existing prompt logic, input validation, and clamping unchanged

### Free Tier Limits (Gemini)

- **gemini-2.0-flash**: 15 requests/minute, 1M tokens/day — more than enough for a scanner tool
- No credit card required

### Technical Detail

The main code change is swapping the fetch call:

**Before** (Lovable AI Gateway — OpenAI-compatible format):
```
fetch("https://ai.gateway.lovable.dev/v1/chat/completions", { ... })
```

**After** (Gemini direct):
```
fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=API_KEY", { ... })
```

The prompt stays identical. Response parsing changes slightly since Gemini returns `candidates[0].content.parts[0].text` instead of `choices[0].message.content`.

