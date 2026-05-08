import { useEffect, useMemo, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Session } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Loader2, RefreshCcw, Send, LogOut, Search } from "lucide-react";

const ADMIN_EMAIL = "info@creativehauz.space";

type Range = "today" | "7d" | "30d" | "all";
type Filter = "any" | "sent" | "failed";

interface Lead {
  id: string;
  email: string;
  name: string | null;
  niche: string | null;
  created_at: string;
  booked: boolean;
  follow_up_stage: string;
  webhook_sent_at: string | null;
  crm_sent_at: string | null;
  last_resend_at: string | null;
}

const fmt = (iso: string | null) =>
  iso ? new Date(iso).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" }) : "—";

export default function Admin() {
  const [session, setSession] = useState<Session | null>(null);
  const [bootstrapping, setBootstrapping] = useState(true);
  const [magicEmail, setMagicEmail] = useState(ADMIN_EMAIL);
  const [sendingLink, setSendingLink] = useState(false);

  const [range, setRange] = useState<Range>("7d");
  const [webhook, setWebhook] = useState<Filter>("any");
  const [crm, setCrm] = useState<Filter>("any");
  const [search, setSearch] = useState("");
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState<string | null>(null);

  // Auth bootstrap
  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setBootstrapping(false);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const isAdmin = session?.user?.email?.toLowerCase() === ADMIN_EMAIL;

  const fetchLeads = useCallback(async () => {
    if (!session) return;
    setLoading(true);
    try {
      const params = new URLSearchParams({ range, webhook, crm, q: search });
      const { data, error } = await supabase.functions.invoke(
        `admin-list-leads?${params.toString()}`,
        { method: "GET" },
      );
      if (error) throw error;
      setLeads((data as { leads: Lead[] })?.leads ?? []);
    } catch (e) {
      console.error(e);
      toast.error("Failed to load leads");
    } finally {
      setLoading(false);
    }
  }, [session, range, webhook, crm, search]);

  useEffect(() => {
    if (isAdmin) fetchLeads();
  }, [isAdmin, fetchLeads]);

  const sendMagicLink = async () => {
    const email = magicEmail.trim().toLowerCase();
    if (email !== ADMIN_EMAIL) {
      toast.error("Only the admin email can sign in here.");
      return;
    }
    setSendingLink(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: `${window.location.origin}/admin` },
      });
      if (error) throw error;
      toast.success("Magic link sent. Check your inbox.");
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to send link");
    } finally {
      setSendingLink(false);
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setLeads([]);
  };

  const resendCrm = async (id: string) => {
    setResending(id);
    try {
      const { data, error } = await supabase.functions.invoke("admin-resend-crm", {
        body: { lead_id: id },
      });
      if (error) throw error;
      if ((data as any)?.ok) toast.success("Sent to CRM ✓");
      else toast.error("CRM did not accept the resend");
      fetchLeads();
    } catch (e: any) {
      toast.error(e?.message ?? "Resend failed");
    } finally {
      setResending(null);
    }
  };

  const counts = useMemo(() => {
    const total = leads.length;
    const webhookOk = leads.filter((l) => l.webhook_sent_at).length;
    const crmOk = leads.filter((l) => l.crm_sent_at).length;
    return { total, webhookOk, crmOk };
  }, [leads]);

  if (bootstrapping) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!session || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="w-full max-w-md rounded-lg border border-border bg-card p-8 shadow-sm">
          <h1 className="font-serif text-3xl text-foreground mb-2">Admin Access</h1>
          <p className="text-sm text-muted-foreground mb-6">
            Magic link sign-in. Only <span className="font-mono">{ADMIN_EMAIL}</span> can enter.
          </p>
          {session && !isAdmin && (
            <div className="mb-4 rounded border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
              Signed in as {session.user.email}. Not authorized.
              <Button variant="link" className="px-1 h-auto" onClick={signOut}>
                Sign out
              </Button>
            </div>
          )}
          <Label htmlFor="magic-email" className="mb-2 block">Email</Label>
          <Input
            id="magic-email"
            type="email"
            value={magicEmail}
            onChange={(e) => setMagicEmail(e.target.value)}
            placeholder={ADMIN_EMAIL}
          />
          <Button
            className="mt-4 w-full bg-brass text-charcoal hover:bg-brass/90"
            onClick={sendMagicLink}
            disabled={sendingLink}
          >
            {sendingLink ? <Loader2 className="h-4 w-4 animate-spin" /> : "Send magic link"}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="mx-auto max-w-7xl px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="font-serif text-2xl text-foreground">Leads</h1>
            <p className="text-xs text-muted-foreground">
              {counts.total} shown · {counts.webhookOk} email ✓ · {counts.crmOk} CRM ✓
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={signOut}>
            <LogOut className="h-4 w-4 mr-2" /> Sign out
          </Button>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-6 space-y-4">
        {/* Filters */}
        <div className="flex flex-wrap items-end gap-3 rounded-lg border border-border bg-card p-4">
          <div>
            <Label className="text-xs">Range</Label>
            <div className="mt-1 flex gap-1">
              {(["today", "7d", "30d", "all"] as Range[]).map((r) => (
                <Button
                  key={r}
                  size="sm"
                  variant={range === r ? "default" : "outline"}
                  className={range === r ? "bg-charcoal text-bone" : ""}
                  onClick={() => setRange(r)}
                >
                  {r === "today" ? "Today" : r === "all" ? "All" : r}
                </Button>
              ))}
            </div>
          </div>

          <div>
            <Label className="text-xs">Webhook (email)</Label>
            <div className="mt-1 flex gap-1">
              {(["any", "sent", "failed"] as Filter[]).map((f) => (
                <Button
                  key={f}
                  size="sm"
                  variant={webhook === f ? "default" : "outline"}
                  className={webhook === f ? "bg-charcoal text-bone" : ""}
                  onClick={() => setWebhook(f)}
                >
                  {f}
                </Button>
              ))}
            </div>
          </div>

          <div>
            <Label className="text-xs">CRM</Label>
            <div className="mt-1 flex gap-1">
              {(["any", "sent", "failed"] as Filter[]).map((f) => (
                <Button
                  key={f}
                  size="sm"
                  variant={crm === f ? "default" : "outline"}
                  className={crm === f ? "bg-charcoal text-bone" : ""}
                  onClick={() => setCrm(f)}
                >
                  {f}
                </Button>
              ))}
            </div>
          </div>

          <div className="flex-1 min-w-[200px]">
            <Label className="text-xs">Search</Label>
            <div className="mt-1 relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && fetchLeads()}
                placeholder="email, name, niche"
                className="pl-8"
              />
            </div>
          </div>

          <Button onClick={fetchLeads} disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCcw className="h-4 w-4" />}
          </Button>
        </div>

        {/* Table */}
        <div className="rounded-lg border border-border bg-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-3 py-2">Created</th>
                  <th className="px-3 py-2">Lead</th>
                  <th className="px-3 py-2">Niche</th>
                  <th className="px-3 py-2">Email</th>
                  <th className="px-3 py-2">CRM</th>
                  <th className="px-3 py-2">Last resend</th>
                  <th className="px-3 py-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {leads.length === 0 && !loading && (
                  <tr>
                    <td colSpan={7} className="px-3 py-8 text-center text-muted-foreground">
                      No leads match the filters.
                    </td>
                  </tr>
                )}
                {leads.map((l) => (
                  <tr key={l.id} className="border-t border-border align-top">
                    <td className="px-3 py-3 whitespace-nowrap text-muted-foreground">{fmt(l.created_at)}</td>
                    <td className="px-3 py-3">
                      <div className="font-medium text-foreground">{l.name || "—"}</div>
                      <div className="text-xs text-muted-foreground">{l.email}</div>
                    </td>
                    <td className="px-3 py-3 text-muted-foreground">{l.niche || "—"}</td>
                    <td className="px-3 py-3">
                      {l.webhook_sent_at ? (
                        <Badge className="bg-green-accent/15 text-green-accent border-green-accent/30">Sent</Badge>
                      ) : (
                        <Badge variant="outline" className="border-rust/40 text-rust">Pending</Badge>
                      )}
                    </td>
                    <td className="px-3 py-3">
                      {l.crm_sent_at ? (
                        <Badge className="bg-green-accent/15 text-green-accent border-green-accent/30">Sent</Badge>
                      ) : (
                        <Badge variant="outline" className="border-rust/40 text-rust">Pending</Badge>
                      )}
                    </td>
                    <td className="px-3 py-3 text-xs text-muted-foreground whitespace-nowrap">
                      {fmt(l.last_resend_at)}
                    </td>
                    <td className="px-3 py-3 text-right">
                      <Button
                        size="sm"
                        className="bg-brass text-charcoal hover:bg-brass/90"
                        onClick={() => resendCrm(l.id)}
                        disabled={resending === l.id}
                      >
                        {resending === l.id ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <>
                            <Send className="h-3.5 w-3.5 mr-1" /> Resend CRM
                          </>
                        )}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
