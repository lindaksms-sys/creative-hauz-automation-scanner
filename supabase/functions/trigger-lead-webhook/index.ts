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
      console.error("N8N_WEBHOOK_URL is not configured");
      // Non-blocking: report success to client so user flow isn't interrupted.
      return new Response(
        JSON.stringify({ success: false, queued: true, reason: "webhook_not_configured" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const body = await req.json();
    const email = typeof body.email === "string" ? body.email.trim() : "";
    if (!email || !EMAIL_RE.test(email)) {
      return new Response(JSON.stringify({ error: "A valid email is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Payload aligned 1:1 with the scanner_leads schema.
    const payload = {
      id: typeof body.id === "string" ? body.id : null,
      email,
      name: typeof body.name === "string" ? body.name : null,
      niche: typeof body.niche === "string" ? body.niche.slice(0, 200) : null,
      report_data: typeof body.report_data === "string" ? body.report_data : (body.report_data ?? null),
      scanner_answers:
        body.scanner_answers && typeof body.scanner_answers === "object" ? body.scanner_answers : {},
      booked: typeof body.booked === "boolean" ? body.booked : false,
      follow_up_stage: typeof body.follow_up_stage === "string" ? body.follow_up_stage : "report_sent",
      last_contacted_at: typeof body.last_contacted_at === "string" ? body.last_contacted_at : new Date().toISOString(),
      source: typeof body.source === "string" ? body.source : "scanner",
      created_at: typeof body.created_at === "string" ? body.created_at : new Date().toISOString(),
    };

    try {
      const response = await fetch(N8N_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const text = await response.text().catch(() => "");
        // Log for later retry — lead is already saved in DB, do not throw to client.
        console.error(
          `[lead-webhook-retry] status=${response.status} email=${payload.email} id=${payload.id} body=${text.slice(0, 500)}`,
        );
        return new Response(
          JSON.stringify({ success: false, queued: true, status: response.status }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }

      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    } catch (fetchErr) {
      console.error(
        `[lead-webhook-retry] network_error email=${payload.email} id=${payload.id} err=${String(fetchErr)}`,
      );
      return new Response(
        JSON.stringify({ success: false, queued: true, reason: "network_error" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }
  } catch (error: unknown) {
    console.error("Error triggering lead webhook:", error);
    // Still non-blocking on unexpected errors.
    return new Response(
      JSON.stringify({ success: false, queued: true, reason: "internal_error" }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
