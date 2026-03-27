import { CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

interface Props {
  summary: string;
  industryInsight?: string;
}

const ReportHeader = ({ summary, industryInsight }: Props) => (
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
    <p className="text-muted-foreground text-lg max-w-xl mx-auto mb-2">
      {summary}
    </p>
    {industryInsight && (
      <p className="text-sm text-green-accent font-medium max-w-lg mx-auto bg-green-accent/5 rounded-lg px-4 py-2 mt-4">
        💡 {industryInsight}
      </p>
    )}
  </motion.div>
);

export default ReportHeader;
