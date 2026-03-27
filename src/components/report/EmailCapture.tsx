import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Mail, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { ScanReport } from "@/types/scanner";

interface Props {
  report: ScanReport;
}

const EmailCapture = ({ report }: Props) => {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubmitting(true);
    try {
      const { error } = await supabase.from("scanner_leads").insert({
        email,
        name: name || null,
        report_data: report as any,
      });
      if (error) throw error;
      setSubmitted(true);
      toast.success("Report saved! Check your inbox for AI tips.");
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card rounded-2xl shadow-card p-8 border border-border text-center"
      >
        <CheckCircle2 className="w-12 h-12 text-green-accent mx-auto mb-3" />
        <h3 className="font-display text-xl font-bold text-foreground mb-1">You're all set!</h3>
        <p className="text-muted-foreground">We'll send your full report and weekly AI automation tips.</p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.9 }}
      className="bg-card rounded-2xl shadow-card p-8 border border-border"
    >
      <div className="flex items-center gap-3 mb-4">
        <Mail className="w-5 h-5 text-primary" />
        <h3 className="font-display text-lg font-bold text-foreground">
          Get your full report as PDF + weekly AI tips
        </h3>
      </div>
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          placeholder="Your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="h-12 px-4 rounded-lg border border-input bg-background text-foreground flex-1 min-w-0 outline-none focus:ring-2 focus:ring-ring"
        />
        <input
          type="email"
          required
          placeholder="your@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="h-12 px-4 rounded-lg border border-input bg-background text-foreground flex-1 min-w-0 outline-none focus:ring-2 focus:ring-ring"
        />
        <Button type="submit" variant="accent" size="lg" disabled={submitting}>
          {submitting ? "Saving..." : "Send Report"}
        </Button>
      </form>
      <p className="text-xs text-muted-foreground mt-3">No spam. Unsubscribe anytime.</p>
    </motion.div>
  );
};

export default EmailCapture;
