import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle2, CalendarDays, Loader2, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { ScanReport, ScannerFormData } from "@/types/scanner";
import { buildReportHtml } from "@/lib/buildReportHtml";
import { BUSINESS_TYPES, BOOKING_URL } from "@/constants/scanner";

interface Props {
  report: ScanReport;
  scannerData: ScannerFormData;
  onContinueToReport: () => void;
}

const ReportGate = ({ report, scannerData, onContinueToReport }: Props) => {
  const [email, setEmail] = useState("");
  const [niche, setNiche] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !niche) return;
    setSubmitting(true);
    try {
      const leadId = crypto.randomUUID();

      // Build full report HTML
      const reportHtml = buildReportHtml({
        totalHoursSaved: report.totalHoursSaved,
        recommendations: report.recommendations,
        summary: report.summary,
        industryInsight: report.industryInsight,
        niche,
        painPoints: scannerData.painPoints || [],
      });

      // Save lead to database with full follow-up workflow schema
      const nowIso = new Date().toISOString();
      const leadRow = {
        id: leadId,
        email: email.trim(),
        name: null as string | null,
        niche,
        report_data: reportHtml as any,
        scanner_answers: scannerData as any,
        booked: false,
        follow_up_stage: "report_sent",
        last_contacted_at: nowIso,
        source: "scanner",
        created_at: nowIso,
      };
      const { error } = await supabase.from("scanner_leads").insert(leadRow);
      if (error) throw error;

      // Fire webhook with the EXACT same payload shape as scanner_leads.
      // Non-blocking: failures are logged server-side for retry but won't disrupt UX.
      try {
        const { error: webhookError } = await supabase.functions.invoke("trigger-lead-webhook", {
          body: leadRow,
        });
        if (webhookError) {
          console.warn("[lead-webhook] non-blocking failure:", webhookError);
        }
      } catch (webhookErr) {
        console.warn("[lead-webhook] non-blocking exception:", webhookErr);
      }

      setSubmitted(true);
      toast.success("Report sent to your inbox!");
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <section className="min-h-screen flex items-center justify-center bg-background py-12 px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-lg text-center space-y-6"
        >
          <CheckCircle2 className="w-16 h-16 text-green-accent mx-auto" />
          <h2 className="font-display text-3xl font-bold text-foreground">
            Report sent! 🎉
          </h2>
          <p className="text-muted-foreground text-lg">
            Check your inbox for your full personalized AI automation report.
          </p>

          <div className="bg-card rounded-2xl shadow-elevated p-6 border border-border space-y-4">
            <div className="flex items-center gap-3 justify-center">
              <CalendarDays className="w-6 h-6 text-primary" />
              <h3 className="font-display text-xl font-bold text-foreground">
                Next step: Book your free 30-min AI Audit
              </h3>
            </div>
            <Button variant="hero" size="lg" className="w-full text-base py-6" asChild>
              <a
                href={BOOKING_URL}
                target="_blank"
                rel="noopener noreferrer"
              >
                Book My Free AI Audit →
              </a>
            </Button>
            <Button
              variant="outline-primary"
              size="lg"
              className="w-full text-base py-6"
              asChild
            >
              <a
                href={BOOKING_URL}
                target="_blank"
                rel="noopener noreferrer"
              >
                I just booked my audit → skip all follow-ups
              </a>
            </Button>
            <p className="text-sm text-orange-500 font-semibold">
              ⚡ Limited audit slots this week — 4 already booked today
            </p>
          </div>

          <Button
            variant="outline-primary"
            size="lg"
            onClick={onContinueToReport}
            className="mt-4"
          >
            View My Detailed Report
            <ArrowRight className="w-4 h-4" />
          </Button>
        </motion.div>
      </section>
    );
  }

  return (
    <section className="min-h-screen flex items-center justify-center bg-background py-12 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg"
      >
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", delay: 0.1 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-4"
          >
            <Sparkles className="w-4 h-4" />
            Analysis Complete
          </motion.div>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-foreground mb-3">
            Your AI Automation Report is Ready
          </h1>
           <p className="text-muted-foreground text-lg">
             These recommendations could save you{" "}
             <span className="font-bold text-foreground">{report.totalHoursSaved}+ hours/week</span>{" "}
             and <span className="font-bold text-foreground">3x your appointments</span>.
           </p>
        </div>

        <div className="bg-card rounded-2xl shadow-elevated p-6 sm:p-8 border border-border">
          <p className="text-foreground mb-6">
            Want me (Linda from Creative Hauz) to turn this exact report into a{" "}
            <span className="font-semibold">custom proposal with pricing</span> and a{" "}
            <span className="font-semibold">2–4 week build timeline</span>?
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Email address <span className="text-destructive">*</span>
              </label>
              <input
                type="email"
                required
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-12 px-4 rounded-lg border border-input bg-background text-foreground focus:ring-2 focus:ring-ring outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Business type / Niche <span className="text-destructive">*</span>
              </label>
              <select
                required
                value={niche}
                onChange={(e) => setNiche(e.target.value)}
                className="w-full h-12 px-4 rounded-lg border border-input bg-background text-foreground focus:ring-2 focus:ring-ring outline-none"
              >
                <option value="">Select your niche...</option>
                {BUSINESS_TYPES.map((n) => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </div>

            <Button
              type="submit"
              variant="hero"
              size="lg"
              disabled={submitting || !email.trim() || !niche}
              className="w-full text-sm sm:text-base py-6 whitespace-normal text-center leading-snug"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  Yes — Send Me the Full Proposal + Book My Free 30-Min AI Audit
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </form>

          <p className="text-xs text-muted-foreground text-center mt-3">
            Takes 30 seconds. You'll get instant access to the detailed report + next steps.
          </p>
        </div>

        <div className="text-center mt-6">
          <button
            onClick={onContinueToReport}
            className="text-sm text-muted-foreground hover:text-foreground underline transition-colors"
          >
            Skip — just show my report
          </button>
        </div>
      </motion.div>
    </section>
  );
};

export default ReportGate;
