import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

type Status = "loading" | "valid" | "already" | "invalid" | "success" | "error";

const Unsubscribe = () => {
  const [params] = useSearchParams();
  const token = params.get("token");
  const [status, setStatus] = useState<Status>("loading");

  useEffect(() => {
    if (!token) { setStatus("invalid"); return; }
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const anonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
    fetch(`${supabaseUrl}/functions/v1/handle-email-unsubscribe?token=${token}`, {
      headers: { apikey: anonKey },
    })
      .then((r) => r.json())
      .then((d) => {
        if (d.valid === false && d.reason === "already_unsubscribed") setStatus("already");
        else if (d.valid) setStatus("valid");
        else setStatus("invalid");
      })
      .catch(() => setStatus("invalid"));
  }, [token]);

  const handleConfirm = async () => {
    if (!token) return;
    try {
      const { error } = await supabase.functions.invoke("handle-email-unsubscribe", { body: { token } });
      if (error) throw error;
      setStatus("success");
    } catch {
      setStatus("error");
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-card rounded-2xl shadow-elevated p-8 border border-border text-center space-y-4">
        <h1 className="font-display text-2xl font-bold text-foreground">Email Preferences</h1>

        {status === "loading" && <p className="text-muted-foreground">Verifying…</p>}

        {status === "valid" && (
          <>
            <p className="text-muted-foreground">Click below to unsubscribe from future emails.</p>
            <button
              onClick={handleConfirm}
              className="w-full h-12 rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors"
            >
              Confirm Unsubscribe
            </button>
          </>
        )}

        {status === "already" && <p className="text-muted-foreground">You've already unsubscribed.</p>}
        {status === "invalid" && <p className="text-muted-foreground">This unsubscribe link is invalid or expired.</p>}
        {status === "success" && <p className="text-green-accent font-semibold">You've been unsubscribed successfully.</p>}
        {status === "error" && <p className="text-destructive">Something went wrong. Please try again.</p>}

        <a href="https://creativehauz.space" className="text-sm text-muted-foreground hover:text-foreground transition-colors inline-block mt-4">
          ← Back to Creative Hauz
        </a>
      </div>
    </div>
  );
};

export default Unsubscribe;
