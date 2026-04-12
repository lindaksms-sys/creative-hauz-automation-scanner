const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const EMAIL_RE = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const N8N_WEBHOOK_URL = Deno.env.get("N8N_WEBHOOK_URL");
    if (!N8N_WEBHOOK_URL) {
      throw new Error("N8N_WEBHOOK_URL is not configured");
    }

    const body = await req.json();
    const email = typeof body.email === "string" ? body.email.trim() : "";
    const niche = typeof body.niche === "string" ? body.niche.slice(0, 200) : "";
    const painPoints = Array.isArray(body.painPoints)
      ? body.painPoints.filter((p: unknown) => typeof p === "string").slice(0, 20).map((p: string) => p.slice(0, 500))
      : [];
    const totalHoursSaved = typeof body.totalHoursSaved === "number" ? body.totalHoursSaved : 0;
    const recommendations = Array.isArray(body.recommendations)
      ? body.recommendations.slice(0, 10)
      : [];

    if (!email || !EMAIL_RE.test(email)) {
      return new Response(JSON.stringify({ error: "A valid email is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const response = await fetch(N8N_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        niche,
        painPoints,
        totalHoursSaved,
        recommendations,
        triggeredAt: new Date().toISOString(),
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`n8n webhook failed [${response.status}]: ${text}`);
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    console.error("Error triggering lead webhook:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
