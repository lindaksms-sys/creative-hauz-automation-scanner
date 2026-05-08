import { Button } from "@/components/ui/button";
import { ArrowRight, RotateCcw } from "lucide-react";
import { BOOKING_URL } from "@/constants/scanner";
import { motion } from "framer-motion";
import type { ScanReport as ScanReportType, ScannerFormData } from "@/types/scanner";
import ReportHeader from "./report/ReportHeader";
import HeroStat from "./report/HeroStat";
import RecommendationList from "./report/RecommendationList";
import EmailCapture from "./report/EmailCapture";
import ShareReport from "./report/ShareReport";

interface Props {
  report: ScanReportType;
  scannerData?: ScannerFormData | null;
  onRestart: () => void;
}

const ScanReportView = ({ report, scannerData, onRestart }: Props) => (
  <section className="min-h-screen bg-background py-12 px-4">
    <div className="max-w-3xl mx-auto">
      <ReportHeader summary={report.summary} industryInsight={report.industryInsight} />
      <HeroStat totalHoursSaved={report.totalHoursSaved} />

      <RecommendationList recommendations={report.recommendations} />

      {/* Disclaimer */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9 }}
        className="text-xs text-muted-foreground text-center italic mb-8 max-w-lg mx-auto"
      >
        These estimates are based on typical results from similar businesses. Actual savings depend on your current processes and implementation.
      </motion.p>

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
            <a href={BOOKING_URL} target="_blank" rel="noopener noreferrer">
              Book My Free AI Audit →
            </a>
          </Button>
          <Button variant="outline-primary" size="lg" asChild>
            <a href={BOOKING_URL} target="_blank" rel="noopener noreferrer">
              I just booked my audit → skip all follow-ups
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

      <EmailCapture report={report} scannerData={scannerData} />

      <div className="flex flex-col items-center gap-4 mt-8">
        <ShareReport report={report} />
        <Button variant="ghost" onClick={onRestart}>
          <RotateCcw className="w-4 h-4" />
          Run another scan
        </Button>
      </div>
    </div>
  </section>
);

export default ScanReportView;
