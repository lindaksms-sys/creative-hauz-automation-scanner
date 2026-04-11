import { useState } from "react";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import ScannerQuestionnaire from "@/components/ScannerQuestionnaire";
import ReportGate from "@/components/ReportGate";
import ScanReportView from "@/components/ScanReport";
import Footer from "@/components/Footer";
import type { ScannerFormData, ScanReport } from "@/types/scanner";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type View = "home" | "scan" | "gate" | "report";

const Index = () => {
  const [view, setView] = useState<View>("home");
  const [report, setReport] = useState<ScanReport | null>(null);
  const [scannerData, setScannerData] = useState<ScannerFormData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleStartScan = () => setView("scan");

  const handleScanComplete = async (data: ScannerFormData) => {
    setIsLoading(true);
    setScannerData(data);

    const maxRetries = 3;
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const { data: result, error } = await supabase.functions.invoke("generate-report", {
          body: data,
        });

        if (error) {
          // Check if it's a rate limit (429) and we can retry
          if (attempt < maxRetries) {
            const delay = 2000 * attempt;
            toast.info(`Generating your report... (attempt ${attempt + 1})`);
            await new Promise((r) => setTimeout(r, delay));
            continue;
          }
          throw error;
        }
        if (result?.error) {
          if (result.error.includes("Rate limited") && attempt < maxRetries) {
            const delay = 2000 * attempt;
            toast.info(`High demand — retrying in a moment...`);
            await new Promise((r) => setTimeout(r, delay));
            continue;
          }
          throw new Error(result.error);
        }

        setReport(result);
        setView("gate");
        setIsLoading(false);
        return;
      } catch (err: any) {
        if (attempt === maxRetries) {
          console.error("Report generation failed:", err);
          toast.error("Failed to generate report. Please try again.");
        }
      }
    }
    setIsLoading(false);
  };

  const handleRestart = () => {
    setView("home");
    setReport(null);
    setScannerData(null);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1">
        {view === "home" && <HeroSection onStartScan={handleStartScan} />}
        {view === "scan" && (
          <ScannerQuestionnaire onComplete={handleScanComplete} isLoading={isLoading} />
        )}
        {view === "gate" && report && scannerData && (
          <ReportGate
            report={report}
            scannerData={scannerData}
            onContinueToReport={() => setView("report")}
          />
        )}
        {view === "report" && report && (
          <ScanReportView report={report} scannerData={scannerData} onRestart={handleRestart} />
        )}
      </div>
      <Footer />
    </div>
  );
};

export default Index;
