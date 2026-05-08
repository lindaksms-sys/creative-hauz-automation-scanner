import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const ADMIN_EMAIL = "info@creativehauz.space";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization") ?? "";
    const token = authHeader.replace(/^Bearer\s+/i, "").trim();
    if (!token) {
      return json({ error: "Missing auth token" }, 401);
    }

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const ANON = Deno.env.get("SUPABASE_ANON_KEY")!;

    // Verify token + extract user
    const userClient = createClient(SUPABASE_URL, ANON, {
      global: { headers: { Authorization: `Bearer ${token}` } },
    });
    const { data: userRes, error: userErr } = await userClient.auth.getUser();
    if (userErr || !userRes.user) {
      return json({ error: "Invalid session" }, 401);
    }
    if ((userRes.user.email ?? "").toLowerCase() !== ADMIN_EMAIL) {
      return json({ error: "Forbidden" }, 403);
    }

    const body = await req.json().catch(() => ({}));
    const range = (body.range as string) ?? "7d"; // today | 7d | 30d | all
    const webhookFilter = (body.webhook as string) ?? "any"; // any | sent | failed
    const crmFilter = (body.crm as string) ?? "any"; // any | sent | failed
    const search = typeof body.q === "string" ? body.q.trim() : "";

    const admin = createClient(SUPABASE_URL, SERVICE_ROLE);
    let q = admin
      .from("scanner_leads")
      .select(
        "id,email,name,niche,created_at,booked,follow_up_stage,webhook_sent_at,crm_sent_at,last_resend_at,crm_payload,scanner_answers",
      )
      .order("created_at", { ascending: false })
      .limit(500);

    const now = new Date();
    if (range === "today") {
      const start = new Date(now);
      start.setHours(0, 0, 0, 0);
      q = q.gte("created_at", start.toISOString());
    } else if (range === "7d") {
      q = q.gte("created_at", new Date(now.getTime() - 7 * 864e5).toISOString());
    } else if (range === "30d") {
      q = q.gte("created_at", new Date(now.getTime() - 30 * 864e5).toISOString());
    }

    if (webhookFilter === "sent") q = q.not("webhook_sent_at", "is", null);
    if (webhookFilter === "failed") q = q.is("webhook_sent_at", null);
    if (crmFilter === "sent") q = q.not("crm_sent_at", "is", null);
    if (crmFilter === "failed") q = q.is("crm_sent_at", null);

    if (search) {
      const safe = search.replace(/[%,]/g, "");
      q = q.or(`email.ilike.%${safe}%,name.ilike.%${safe}%,niche.ilike.%${safe}%`);
    }

    const { data, error } = await q;
    if (error) {
      console.error("admin-list-leads query error", error);
      return json({ error: "Query failed" }, 500);
    }

    return json({ leads: data ?? [] }, 200);
  } catch (err) {
    console.error("admin-list-leads error", err);
    return json({ error: "Internal error" }, 500);
  }
});

function json(body: unknown, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
