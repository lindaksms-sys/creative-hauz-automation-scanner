import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { businessType, businessSize, painPoints, customPainPoint, dailyTimeDrain, industry } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const prompt = `You are an AI automation consultant for small and medium businesses. Analyze this business profile and provide specific, actionable automation recommendations.

Business Type: ${businessType}
Business Size: ${businessSize}
Industry: ${industry || businessType}
Pain Points: ${painPoints?.join(", ") || "General"}
Custom Pain Point: ${customPainPoint || "None specified"}
Daily Time Drain: ${dailyTimeDrain || "Not specified"}

Respond with a JSON object (no markdown) with this exact structure:
{
  "totalHoursSaved": <number between 8 and 25>,
  "summary": "<one sentence summarizing what you found>",
  "recommendations": [
    {
      "title": "<automation name>",
      "description": "<2-3 sentence description of what this automation does and why it helps>",
      "hoursSaved": <number 2-8>,
      "roiPercent": <number 15-50>,
      "icon": "<one of: zap, clock, trending, mail, check>"
    }
  ]
}

Provide 3-5 recommendations. Make them specific to the business type and pain points. Be realistic but optimistic about time savings. Focus on AI-powered automations like AI voice agents, chatbots, automated email sequences, AI content generation, smart scheduling, automated data entry, and AI-powered CRM updates.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: "You are an expert AI automation consultant. Always respond with valid JSON only, no markdown." },
          { role: "user", content: prompt },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited. Please try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Service temporarily unavailable." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) throw new Error("No content in AI response");

    // Parse the JSON from the response, handling potential markdown wrapping
    let report;
    try {
      const cleaned = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      report = JSON.parse(cleaned);
    } catch {
      console.error("Failed to parse AI response:", content);
      throw new Error("Failed to parse AI response");
    }

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
