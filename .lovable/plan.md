

## Plan: Switch Report Generation to Grok (xAI)

### What Changes

One file: `supabase/functions/generate-report/index.ts`

Replace the Gemini API call with a call to xAI's Grok API.

### Steps

1. **You provide a Grok API key** — get one at [console.x.ai](https://console.x.ai). xAI offers free credits for new accounts.
2. **I store it as a secret** called `GROK_API_KEY`
3. **Update the Edge Function** to:
   - Read `GROK_API_KEY` instead of `GEMINI_API_KEY`
   - Call `https://api.x.ai/v1/chat/completions` (OpenAI-compatible format)
   - Parse response as `choices[0].message.content`
   - Keep all existing prompt logic, validation, and clamping unchanged

### Technical Detail

Grok uses the OpenAI-compatible API format, so the change is straightforward:

```
fetch("https://api.x.ai/v1/chat/completions", {
  headers: { Authorization: "Bearer GROK_API_KEY", "Content-Type": "application/json" },
  body: JSON.stringify({
    model: "grok-3-mini",
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" }
  })
})
```

Response parsing: `data.choices[0].message.content` — simpler than Gemini's format.

### xAI Free Tier

- New accounts get $25 in free credits
- `grok-3-mini` is fast and cost-effective for structured output tasks like this

