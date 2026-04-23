import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-workflow-secret",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const ALLOWED_FIELDS = [
  "booked",
  "follow_up_stage",
  "booking_date",
  "last_contacted_at",
  "case_study_sent_at",
  "reminder_sent_at",
] as const;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return json({ success: false, error: "method_not_allowed" }, 405);
  }

  const expected = Deno.env.get("WORKFLOW_SHARED_SECRET");
  const provided = req.headers.get("x-workflow-secret");
  if (!expected || !provided || provided !== expected) {
    console.warn("[update-scanner-lead-state] invalid_secret");
    return json({ success: false, error: "unauthorized" }, 401);
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return json({ success: false, error: "invalid_json" }, 400);
  }

  const id = typeof body.id === "string" ? body.id : undefined;
  const email = typeof body.email === "string" ? body.email : undefined;

  if (!id && !email) {
    console.warn("[update-scanner-lead-state] missing_identifier");
    return json(
      { success: false, error: "missing_identifier_id_or_email" },
      400,
    );
  }

  const updates: Record<string, unknown> = {};
  for (const key of ALLOWED_FIELDS) {
    if (key in body && body[key] !== undefined) {
      updates[key] = body[key];
    }
  }

  if (Object.keys(updates).length === 0) {
    return json({ success: false, error: "no_updatable_fields" }, 400);
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    { auth: { persistSession: false } },
  );

  const matchColumn = id ? "id" : "email";
  const matchValue = id ?? email!;

  const { data, error } = await supabase
    .from("scanner_leads")
    .update(updates)
    .eq(matchColumn, matchValue)
    .select()
    .maybeSingle();

  if (error) {
    console.error("[update-scanner-lead-state] db_error", error);
    return json({ success: false, error: error.message }, 500);
  }

  if (!data) {
    console.warn(
      `[update-scanner-lead-state] no_match ${matchColumn}=${matchValue}`,
    );
    return json({ success: false, error: "lead_not_found" }, 404);
  }

  console.log(
    `[update-scanner-lead-state] updated id=${data.id} stage=${data.follow_up_stage}`,
  );
  return json({ success: true, lead: data }, 200);
});
