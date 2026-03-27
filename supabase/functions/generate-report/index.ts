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
2. Keep total hours saved CONSERVATIVE and HONEST — typically 8-14 hours/week total across all recommendations. Never exceed 16 unless the user described extreme manual workload.
3. Individual recommendation hoursSaved should be 2-5 hrs/week max. These are realistic for simple automations.
4. ROI percentages should be modest: 10-30% range. Frame as "reduction in manual work" or "improvement in response time," not inflated revenue claims.
5. Focus on automations Creative Hauz actually delivers: WhatsApp/SMS auto-replies, email sequences, appointment booking bots, invoice reminders, CRM auto-updates, lead follow-up workflows, client onboarding flows, social media scheduling, basic AI chatbots.
6. Use plain language. No jargon like "multi-modal content engine" or "orchestration layer." Speak like you're advising a busy SMB owner over coffee.
7. Each recommendation should name a specific tool/approach simply (e.g., "Automated WhatsApp Follow-Up for New Leads" not "AI-Powered Omnichannel Lead Nurturing System").
8. Difficulty should mostly be "easy" or "medium" — these are meant to be quick wins.

Respond with a JSON object (no markdown) with this exact structure:
{
  "totalHoursSaved": <number between 8 and 14>,
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

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: "You are a practical automation consultant. Always respond with valid JSON only, no markdown. Be honest and conservative with estimates." },
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

    let report;
    try {
      const cleaned = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      report = JSON.parse(cleaned);
    } catch {
      console.error("Failed to parse AI response:", content);
      throw new Error("Failed to parse AI response");
    }

    // Clamp values to enforce conservative limits
    if (report.totalHoursSaved > 16) report.totalHoursSaved = Math.min(report.totalHoursSaved, 14);
    if (report.recommendations) {
      report.recommendations = report.recommendations.map((rec: any) => ({
        ...rec,
        hoursSaved: Math.min(rec.hoursSaved || 3, 5),
        roiPercent: Math.min(rec.roiPercent || 15, 35),
      }));
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
