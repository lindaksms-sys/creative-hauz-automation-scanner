import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const ADMIN_EMAIL = "info@creativehauz.space";
const EMAIL_RE = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const token = (req.headers.get("Authorization") ?? "").replace(/^Bearer\s+/i, "").trim();
    if (!token) return json({ error: "Missing auth token" }, 401);

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const ANON = Deno.env.get("SUPABASE_ANON_KEY")!;
    const N8N_CRM_WEBHOOK_URL = Deno.env.get("N8N_CRM_WEBHOOK_URL");
    if (!N8N_CRM_WEBHOOK_URL) return json({ error: "CRM webhook not configured" }, 500);

    const userClient = createClient(SUPABASE_URL, ANON, {
      global: { headers: { Authorization: `Bearer ${token}` } },
    });
    const { data: userRes, error: userErr } = await userClient.auth.getUser();
    if (userErr || !userRes.user) return json({ error: "Invalid session" }, 401);
    if ((userRes.user.email ?? "").toLowerCase() !== ADMIN_EMAIL) {
      return json({ error: "Forbidden" }, 403);
    }

    const { lead_id } = await req.json().catch(() => ({}));
    if (!lead_id || typeof lead_id !== "string") {
      return json({ error: "lead_id required" }, 400);
    }

    const admin = createClient(SUPABASE_URL, SERVICE_ROLE);
    const { data: lead, error: leadErr } = await admin
      .from("scanner_leads")
      .select("id,email,name,niche,crm_payload,scanner_answers")
      .eq("id", lead_id)
      .maybeSingle();

    if (leadErr || !lead) return json({ error: "Lead not found" }, 404);
    if (!lead.email || !EMAIL_RE.test(lead.email)) {
      return json({ error: "Lead has no valid email" }, 400);
    }

    // Build CRM payload from snapshot if present, else from lead fields.
    const fromSnap = (lead.crm_payload && typeof lead.crm_payload === "object")
      ? lead.crm_payload as Record<string, unknown>
      : null;
    const answers = (lead.scanner_answers && typeof lead.scanner_answers === "object"
      ? lead.scanner_answers as Record<string, unknown>
      : {}) as Record<string, unknown>;

    const crm = fromSnap ?? {
      full_name: (lead.name ?? "").toString().slice(0, 120),
      email: lead.email,
      phone: typeof answers.phone === "string" ? answers.phone : "",
      company: typeof answers.company === "string" ? answers.company : "",
      source: "scanner",
      campaign: "ai-automation-scanner",
      lead_magnet: "automation-report",
    };

    const r = await fetch(N8N_CRM_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...crm, resent: true, lead_id: lead.id }),
    });

    const ok = r.ok;
    const nowIso = new Date().toISOString();
    await admin
      .from("scanner_leads")
      .update({
        last_resend_at: nowIso,
        ...(ok ? { crm_sent_at: nowIso } : {}),
      })
      .eq("id", lead.id);

    if (!ok) {
      const text = await r.text().catch(() => "");
      console.error(`[admin-resend-crm] status=${r.status} body=${text.slice(0, 500)}`);
      return json({ ok: false, status: r.status }, 502);
    }
    return json({ ok: true }, 200);
  } catch (err) {
    console.error("admin-resend-crm error", err);
    return json({ error: "Internal error" }, 500);
  }
});

function json(body: unknown, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
