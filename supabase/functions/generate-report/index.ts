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

    const industryExamples: Record<string, string> = {
      "Real Estate": `For Real Estate specifically, consider these automation categories:
- AI Voice Agent for inbound/outbound lead calls (answers property inquiries 24/7, books showings, qualifies buyers by budget/timeline/location)
- Automated listing syndication & social media posting (auto-generate property descriptions, post to MLS/Zillow/social with AI-written copy and staged photos)
- Smart CRM drip campaigns (trigger personalized follow-ups based on buyer behavior: open house attendance, listing views, price drop alerts)
- AI-powered comparative market analysis (auto-pull comps, generate seller presentations, predict days-on-market)
- Automated transaction coordination (deadline tracking, document collection, closing checklist management)
- Virtual tour scheduling bot (syncs with calendar, sends reminders, handles rescheduling)`,
      "Healthcare / Clinic": `For Healthcare/Clinic specifically, consider these automation categories:
- AI receptionist & appointment scheduling (handles inbound calls, books/reschedules appointments, sends reminders, reduces no-shows by 40%+)
- Automated patient intake & forms (digital pre-visit questionnaires, insurance verification, consent form collection)
- AI-powered patient follow-up (post-visit check-ins, medication reminders, satisfaction surveys, review requests)
- Smart billing & claims automation (auto-code procedures, submit claims, track denials, send patient statements)
- Clinical documentation assistant (AI-generated visit summaries, SOAP notes from voice recordings, referral letter drafting)
- Patient communication hub (bulk appointment reminders, waitlist management, seasonal campaign automation)`,
    };

    const industryContext = industryExamples[businessType] || `Focus on AI-powered automations specific to ${businessType || industry || "this business type"}: AI voice agents, chatbots, automated email sequences, AI content generation, smart scheduling, automated data entry, and AI-powered CRM updates.`;

    const prompt = `You are an expert AI automation consultant specializing in small and medium businesses. Analyze this business profile and provide hyper-specific, actionable automation recommendations.

Business Type: ${businessType}
Business Size: ${businessSize}
Industry: ${industry || businessType}
Pain Points: ${painPoints?.join(", ") || "General"}
Custom Pain Point: ${customPainPoint || "None specified"}
Daily Time Drain: ${dailyTimeDrain || "Not specified"}

${industryContext}

Respond with a JSON object (no markdown) with this exact structure:
{
  "totalHoursSaved": <number between 10 and 25>,
  "summary": "<one sentence summarizing the key finding, mention specific tools or workflows>",
  "industryInsight": "<one sentence with a specific stat or insight about automation in their industry>",
  "recommendations": [
    {
      "title": "<specific automation name — include the tool type e.g. 'AI Voice Agent for...' or 'Automated...' >",
      "description": "<2-3 sentences: what it does, how it integrates with their existing workflow, and a concrete example of the outcome>",
      "hoursSaved": <number 2-8>,
      "roiPercent": <number 15-50>,
      "difficulty": "<one of: easy, medium, advanced>",
      "timeToImplement": "<e.g. '1-2 weeks', '3-5 days'>",
      "icon": "<one of: zap, clock, trending, mail, check, phone, calendar, brain, megaphone>"
    }
  ]
}

Provide exactly 4 recommendations. Make them HIGHLY specific to the business type — use real tool names, specific workflows, and concrete numbers. Each recommendation should feel like it was written by someone who deeply understands ${businessType || "their"} operations. Order by impact (highest hoursSaved first).`;

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
