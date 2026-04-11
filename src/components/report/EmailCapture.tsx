import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Mail, CheckCircle2, Download, Send } from "lucide-react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { ScanReport, ScannerFormData } from "@/types/scanner";
import { downloadReportPdf } from "@/lib/generateReportPdf";

interface Props {
  report: ScanReport;
  scannerData?: ScannerFormData | null;
}

const EmailCapture = ({ report }: Props) => {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubmitting(true);
    try {
      const leadId = crypto.randomUUID();
      const { error } = await supabase.from("scanner_leads").insert({
        id: leadId,
        email: email.trim(),
        name: name.trim() || null,
        report_data: report as any,
      });
      if (error) throw error;

      // Send the report email
      const topRecs = (report.recommendations || []).slice(0, 5).map((r) => ({
        title: r.title,
        hoursSaved: r.hoursSaved,
        roi: `${r.roiPercent}%`,
      }));
      await supabase.functions.invoke("send-transactional-email", {
        body: {
          templateName: "report-summary",
          recipientEmail: email.trim(),
          idempotencyKey: `report-summary-${leadId}`,
          templateData: {
            name: name.trim() || undefined,
            totalHoursSaved: report.totalHoursSaved,
            recommendations: topRecs,
          },
        },
      });

      setSubmitted(true);
      toast.success("Report saved and emailed! Check your inbox.");
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDownloadPdf = () => {
    downloadReportPdf(report);
    toast.success("PDF downloaded!");
  };

  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card rounded-2xl shadow-elevated p-8 border border-border text-center space-y-5"
      >
        <CheckCircle2 className="w-14 h-14 text-green-accent mx-auto" />
        <div>
          <h3 className="font-display text-2xl font-bold text-foreground mb-1">You're all set!</h3>
          <p className="text-muted-foreground">Your report has been saved. Download your branded PDF below.</p>
        </div>
        <Button
          onClick={handleDownloadPdf}
          size="lg"
          className="w-full sm:w-auto bg-green-accent hover:bg-green-accent/90 text-white font-bold text-base px-8 py-6"
        >
          <Download className="w-5 h-5 mr-2" />
          Download Free Report as PDF
        </Button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.9 }}
      className="bg-card rounded-2xl shadow-elevated p-8 border border-border"
    >
      <div className="flex items-center gap-3 mb-2">
        <Mail className="w-6 h-6 text-primary" />
        <h3 className="font-display text-xl font-bold text-foreground">
          Save your report & download PDF
        </h3>
      </div>
      <p className="text-muted-foreground text-sm mb-5">
        Enter your details to save your personalized report and get a professional PDF copy.
      </p>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            placeholder="Full Name"
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
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            type="submit"
            size="lg"
            disabled={submitting}
            className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-base py-6"
          >
            <Send className="w-5 h-5 mr-2" />
            {submitting ? "Saving..." : "Save & Email My Report"}
          </Button>
          <Button
            type="button"
            size="lg"
            onClick={handleDownloadPdf}
            className="flex-1 bg-green-accent hover:bg-green-accent/90 text-white font-bold text-base py-6"
          >
            <Download className="w-5 h-5 mr-2" />
            Download PDF Now
          </Button>
        </div>
      </form>
      <p className="text-xs text-muted-foreground mt-3">
        No spam. Your data is secure and never shared.{" "}
        <a href="/privacy-policy" className="text-primary hover:underline">Privacy Policy</a>
      </p>
    </motion.div>
  );
};

export default EmailCapture;
