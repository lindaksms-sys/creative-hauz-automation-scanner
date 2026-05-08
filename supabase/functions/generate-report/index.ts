import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = await req.json();
    const businessType = typeof body.businessType === "string" ? body.businessType.slice(0, 200) : "";
    const businessSize = typeof body.businessSize === "string" ? body.businessSize.slice(0, 100) : "";
    const painPoints = Array.isArray(body.painPoints)
      ? body.painPoints.filter((p: unknown) => typeof p === "string").slice(0, 20).map((p: string) => p.slice(0, 500))
      : [];
    const customPainPoint = typeof body.customPainPoint === "string" ? body.customPainPoint.slice(0, 1000) : "";
    const dailyTimeDrain = typeof body.dailyTimeDrain === "string" ? body.dailyTimeDrain.slice(0, 200) : "";
    const industry = typeof body.industry === "string" ? body.industry.slice(0, 200) : "";

    if (!businessType) {
      return new Response(JSON.stringify({ error: "businessType is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const GROK_API_KEY = Deno.env.get("GROK_API_KEY");
    if (!GROK_API_KEY) throw new Error("GROK_API_KEY is not configured");

    const prompt = `You are a practical, honest AI automation consultant working for Creative Hauz (creativehauz.space), a boutique agency led by Linda Kisimisi that helps small and medium businesses automate repetitive tasks.

Your job is to analyze this business profile and provide REALISTIC, SPECIFIC automation recommendations that Creative Hauz would actually build and deploy.

Business Type: ${businessType}
Business Size: ${businessSize}
Industry: ${industry || businessType}
Pain Points: ${painPoints?.join(", ") || "General efficiency"}
Custom Pain Point Details: ${customPainPoint || "None provided"}
Daily Time Drain: ${dailyTimeDrain || "Not specified"}

CRITICAL RULES:
1. Base EVERY recommendation strictly on the user's stated pain points and business context. Do NOT suggest things unrelated to what they described.
2. Calculate totalHoursSaved tied to the user's actual workload — DO NOT default to a "safe" middle number. Use these tiers:
   - Base by number of pain points: 1 → 4-7, 2 → 7-10, 3 → 10-13, 4+ → 12-16 hrs/week
   - Adjust by business size: solo/1-person → bottom of the range, 2-10 → middle, 11+ → top
   - Adjust by dailyTimeDrain: mentions "all day"/"most of my day"/≥4 hrs/day → push to top; short or vague → bottom
   - The individual recommendation hoursSaved values MUST sum to roughly totalHoursSaved
3. Individual recommendation hoursSaved should be 2-5 hrs/week max. These are realistic for simple automations.
4. ROI percentages should be modest: 10-30% range. Frame as "reduction in manual work" or "improvement in response time," not inflated revenue claims.
5. Focus on automations Creative Hauz actually delivers: WhatsApp/SMS auto-replies, email sequences, appointment booking bots, invoice reminders, CRM auto-updates, lead follow-up workflows, client onboarding flows, social media scheduling, basic AI chatbots.
6. Use plain language. No jargon like "multi-modal content engine" or "orchestration layer." Speak like you're advising a busy SMB owner over coffee.
7. Each recommendation should name a specific tool/approach simply (e.g., "Automated WhatsApp Follow-Up for New Leads" not "AI-Powered Omnichannel Lead Nurturing System").
8. Difficulty should mostly be "easy" or "medium" — these are meant to be quick wins.

Respond with a JSON object (no markdown) with this exact structure:
{
  "totalHoursSaved": <number 4-16, calculated per the tier rules above>,
  "summary": "<one practical sentence about the biggest opportunity, mentioning their specific pain point>",
  "industryInsight": "<one sentence with a believable stat about automation in their industry, e.g. 'Businesses that automate client follow-ups typically see 30-40% fewer missed appointments'>",
  "recommendations": [
    {
      "title": "<specific, simple automation name>",
      "description": "<2 sentences: what it does in plain language, and one concrete outcome tied to their pain point>",
      "hoursSaved": <number 2-5>,
      "roiPercent": <number 10-30>,
      "difficulty": "<easy or medium>",
      "timeToImplement": "<e.g. '2-3 days', '1 week'>",
      "icon": "<one of: zap, clock, trending, mail, check, phone, calendar, brain, megaphone>"
    }
  ]
}

Provide exactly 4 recommendations. Order by relevance to their stated pain points (most relevant first). Make each one feel like a practical suggestion from someone who understands their daily struggles.`;

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${GROK_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          {
            role: "user",
            content: "You are a practical automation consultant. Always respond with valid JSON only, no markdown. Be honest and conservative with estimates.\n\n" + prompt,
          },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      const t = await response.text();
      console.error("Grok API error:", response.status, t);
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited. Please try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(`Grok API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) throw new Error("No content in Grok response");

    let report;
    try {
      const cleaned = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      report = JSON.parse(cleaned);
    } catch {
      console.error("Failed to parse Grok response:", content);
      throw new Error("Failed to parse AI response");
    }

    // Clamp per-recommendation values
    if (report.recommendations) {
      report.recommendations = report.recommendations.map((rec: any) => ({
        ...rec,
        hoursSaved: Math.max(1, Math.min(rec.hoursSaved || 3, 5)),
        roiPercent: Math.min(rec.roiPercent || 15, 35),
      }));
    }

    // Recompute totalHoursSaved from the actual recommendations so it varies per submission
    const recs = Array.isArray(report.recommendations) ? report.recommendations : [];
    const recSum = recs.reduce((s: number, r: any) => s + (Number(r.hoursSaved) || 0), 0);
    let total = recSum > 0 ? recSum : Number(report.totalHoursSaved) || 8;

    // Deterministic ±1 jitter seeded by the user's inputs (same inputs → same number)
    const seedStr = `${businessType}|${businessSize}|${industry}|${painPoints.join(",")}|${customPainPoint}|${dailyTimeDrain}`;
    let seed = 0;
    for (let i = 0; i < seedStr.length; i++) seed = ((seed << 5) - seed + seedStr.charCodeAt(i)) | 0;
    const jitter = (Math.abs(seed) % 3) - 1; // -1, 0, +1
    total = Math.max(4, Math.min(16, total + jitter));
    report.totalHoursSaved = total;

    return new Response(JSON.stringify(report), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-report error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
