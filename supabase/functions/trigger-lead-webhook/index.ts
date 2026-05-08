import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

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
    const N8N_CRM_WEBHOOK_URL = Deno.env.get("N8N_CRM_WEBHOOK_URL");
    if (!N8N_WEBHOOK_URL && !N8N_CRM_WEBHOOK_URL) {
      console.error("No n8n webhook URLs are configured");
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

    const sanitize = (v: unknown, max: number) =>
      typeof v === "string" ? v.trim().slice(0, max) : "";
    const phone = sanitize(body.phone, 30).replace(/[^0-9+\-()\s]/g, "");
    const company = sanitize(body.company, 120);
    const fullName = sanitize(body.full_name ?? body.name, 120);

    // Payload aligned 1:1 with the scanner_leads schema, plus a CRM-shaped block.
    const payload = {
      id: typeof body.id === "string" ? body.id : null,
      email,
      name: typeof body.name === "string" ? body.name : (fullName || null),
      niche: typeof body.niche === "string" ? body.niche.slice(0, 200) : null,
      report_data: typeof body.report_data === "string" ? body.report_data : (body.report_data ?? null),
      scanner_answers:
        body.scanner_answers && typeof body.scanner_answers === "object" ? body.scanner_answers : {},
      booked: typeof body.booked === "boolean" ? body.booked : false,
      follow_up_stage: typeof body.follow_up_stage === "string" ? body.follow_up_stage : "report_sent",
      last_contacted_at: typeof body.last_contacted_at === "string" ? body.last_contacted_at : new Date().toISOString(),
      source: typeof body.source === "string" ? body.source : "scanner",
      created_at: typeof body.created_at === "string" ? body.created_at : new Date().toISOString(),
      crm: {
        full_name: fullName,
        email,
        phone,
        company,
        source: "scanner",
        campaign: "ai-automation-scanner",
        lead_magnet: "automation-report",
      },
    };

    const postTo = async (url: string, body: unknown, label: string) => {
      try {
        const r = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        if (!r.ok) {
          const text = await r.text().catch(() => "");
          console.error(
            `[${label}-retry] status=${r.status} email=${payload.email} id=${payload.id} body=${text.slice(0, 500)}`,
          );
          return { ok: false, status: r.status };
        }
        return { ok: true, status: r.status };
      } catch (err) {
        console.error(
          `[${label}-retry] network_error email=${payload.email} id=${payload.id} err=${String(err)}`,
        );
        return { ok: false, status: 0 };
      }
    };

    const tasks: Promise<{ ok: boolean; status: number }>[] = [];
    if (N8N_WEBHOOK_URL) tasks.push(postTo(N8N_WEBHOOK_URL, payload, "lead-webhook"));
    if (N8N_CRM_WEBHOOK_URL) tasks.push(postTo(N8N_CRM_WEBHOOK_URL, payload.crm, "crm-webhook"));

    const [emailResult, crmResult] = await Promise.all([
      N8N_WEBHOOK_URL ? tasks.shift()! : Promise.resolve({ ok: false, status: 0 }),
      N8N_CRM_WEBHOOK_URL ? tasks.shift()! : Promise.resolve({ ok: false, status: 0 }),
    ]);

    // Persist tracking + CRM snapshot for the admin page.
    if (payload.id) {
      try {
        const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
        const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
        if (SUPABASE_URL && SERVICE_ROLE) {
          const admin = createClient(SUPABASE_URL, SERVICE_ROLE);
          const nowIso = new Date().toISOString();
          await admin
            .from("scanner_leads")
            .update({
              crm_payload: payload.crm,
              ...(emailResult.ok ? { webhook_sent_at: nowIso } : {}),
              ...(crmResult.ok ? { crm_sent_at: nowIso } : {}),
            })
            .eq("id", payload.id);
        }
      } catch (e) {
        console.error("[trigger-lead-webhook] tracking update failed", e);
      }
    }

    return new Response(
      JSON.stringify({
        success: emailResult.ok || crmResult.ok,
        email_sent: emailResult.ok,
        crm_sent: crmResult.ok,
        queued: !emailResult.ok || (Boolean(N8N_CRM_WEBHOOK_URL) && !crmResult.ok),
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error: unknown) {
    console.error("Error triggering lead webhook:", error);
    // Still non-blocking on unexpected errors.
    return new Response(
      JSON.stringify({ success: false, queued: true, reason: "internal_error" }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
