import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Clock, TrendingUp, Zap, ArrowRight, Mail, CheckCircle2, ExternalLink, RotateCcw } from "lucide-react";
import { motion } from "framer-motion";
import type { ScanReport as ScanReportType } from "@/types/scanner";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Props {
  report: ScanReportType;
  onRestart: () => void;
}

const ICON_MAP: Record<string, React.ElementType> = {
  zap: Zap,
  clock: Clock,
  trending: TrendingUp,
  mail: Mail,
  check: CheckCircle2,
};

const ScanReportView = ({ report, onRestart }: Props) => {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleEmailSubmit = async (e: React.FormEvent) => {
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

  return (
    <section className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-accent/10 text-green-accent text-sm font-medium mb-4">
            <CheckCircle2 className="w-4 h-4" />
            Scan Complete
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-foreground mb-3">
            Your Automation Report
          </h1>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            {report.summary}
          </p>
        </motion.div>

        {/* Hero stat */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-card rounded-2xl shadow-elevated p-8 text-center mb-8"
        >
          <div className="font-display text-5xl sm:text-6xl font-extrabold text-primary mb-2">
            {report.totalHoursSaved}+
          </div>
          <div className="text-lg text-muted-foreground">
            estimated hours saved per week
          </div>
          <div className="mt-4 inline-flex items-center gap-2 text-green-accent font-medium">
            <TrendingUp className="w-4 h-4" />
            That's {Math.round(report.totalHoursSaved * 4.3)} hours/month back in your schedule
          </div>
        </motion.div>

        {/* Recommendations */}
        <div className="space-y-4 mb-10">
          <h2 className="font-display text-xl font-bold text-foreground">
            Recommended Automations
          </h2>
          {report.recommendations.map((rec, i) => {
            const IconComp = ICON_MAP[rec.icon] || Zap;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
                className="bg-card rounded-xl shadow-card p-6 border border-border"
              >
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center shrink-0">
                    <IconComp className="w-5 h-5 text-primary-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-display font-bold text-foreground text-lg mb-1">
                      {rec.title}
                    </h3>
                    <p className="text-muted-foreground text-sm mb-3">
                      {rec.description}
                    </p>
                    <div className="flex flex-wrap gap-4 text-sm">
                      <span className="flex items-center gap-1 text-primary font-medium">
                        <Clock className="w-3.5 h-3.5" />
                        Saves ~{rec.hoursSaved} hrs/week
                      </span>
                      <span className="flex items-center gap-1 text-green-accent font-medium">
                        <TrendingUp className="w-3.5 h-3.5" />
                        +{rec.roiPercent}% potential ROI
                      </span>
                    </div>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="mt-4">
                  <div className="flex justify-between text-xs text-muted-foreground mb-1">
                    <span>Impact score</span>
                    <span>{Math.min(rec.hoursSaved * 10, 100)}%</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      className="h-full gradient-accent rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(rec.hoursSaved * 10, 100)}%` }}
                      transition={{ delay: 0.5 + i * 0.1, duration: 0.6 }}
                    />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-card rounded-2xl shadow-elevated p-8 mb-8 border border-border"
        >
          <h2 className="font-display text-2xl font-bold text-foreground mb-2 text-center">
            Ready to implement these automations?
          </h2>
          <p className="text-muted-foreground text-center mb-6">
            Our team at Creative Hauz will build and deploy these automations for you.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="hero" size="lg" asChild>
              <a href="https://calendly.com/creativehauz" target="_blank" rel="noopener noreferrer">
                Book a Free Discovery Call
                <ExternalLink className="w-4 h-4" />
              </a>
            </Button>
            <Button variant="outline-primary" size="lg" asChild>
              <a href="https://creativehauz.space" target="_blank" rel="noopener noreferrer">
                Get Full Blueprint + Deployment
                <ArrowRight className="w-4 h-4" />
              </a>
            </Button>
          </div>
        </motion.div>

        {/* Email capture */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="bg-card rounded-2xl shadow-card p-8 border border-border"
        >
          {submitted ? (
            <div className="text-center">
              <CheckCircle2 className="w-12 h-12 text-green-accent mx-auto mb-3" />
              <h3 className="font-display text-xl font-bold text-foreground mb-1">You're all set!</h3>
              <p className="text-muted-foreground">We'll send your full report and weekly AI automation tips.</p>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-3 mb-4">
                <Mail className="w-5 h-5 text-primary" />
                <h3 className="font-display text-lg font-bold text-foreground">
                  Get your full report as PDF + weekly AI tips
                </h3>
              </div>
              <form onSubmit={handleEmailSubmit} className="flex flex-col sm:flex-row gap-3">
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
            </>
          )}
        </motion.div>

        {/* Restart */}
        <div className="text-center mt-8">
          <Button variant="ghost" onClick={onRestart}>
            <RotateCcw className="w-4 h-4" />
            Run another scan
          </Button>
        </div>
      </div>
    </section>
  );
};

export default ScanReportView;
