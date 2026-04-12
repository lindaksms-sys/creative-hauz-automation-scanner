

## Plan: Switch to Groq API

### What Changes

1. **Update the `GROK_API_KEY` secret** with your new Groq key
2. **Update `supabase/functions/generate-report/index.ts`** to call Groq's endpoint:
   - Endpoint: `https://api.groq.com/openai/v1/chat/completions`
   - Model: `llama-3.3-70b-versatile` (fast, free-tier eligible, great at JSON)
   - Format is OpenAI-compatible, so minimal code changes — just swap the URL and model name
   - Keep all existing prompt logic, validation, and value clamping

### Why This Works

Groq's free tier gives 30 requests/minute on most models — more than enough for this scanner tool.

