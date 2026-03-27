import { Clock, TrendingUp, Zap, Mail, CheckCircle2, Phone, CalendarCheck, Brain, Megaphone } from "lucide-react";
import { motion } from "framer-motion";
import type { AutomationRecommendation } from "@/types/scanner";

const ICON_MAP: Record<string, React.ElementType> = {
  zap: Zap,
  clock: Clock,
  trending: TrendingUp,
  mail: Mail,
  check: CheckCircle2,
  phone: Phone,
  calendar: CalendarCheck,
  brain: Brain,
  megaphone: Megaphone,
};

const DIFFICULTY_STYLES: Record<string, { label: string; className: string }> = {
  easy: { label: "Easy setup", className: "bg-green-accent/10 text-green-accent" },
  medium: { label: "Moderate", className: "bg-amber-100 text-amber-700" },
  advanced: { label: "Advanced", className: "bg-primary/10 text-primary" },
};

interface Props {
  recommendations: (AutomationRecommendation & { difficulty?: string; timeToImplement?: string })[];
}

const RecommendationList = ({ recommendations }: Props) => (
  <div className="space-y-4 mb-10">
    <h2 className="font-display text-xl font-bold text-foreground">
      Recommended Automations
    </h2>
    {recommendations.map((rec, i) => {
      const IconComp = ICON_MAP[rec.icon] || Zap;
      const diff = DIFFICULTY_STYLES[rec.difficulty || "medium"] || DIFFICULTY_STYLES.medium;
      const impactScore = Math.min(rec.hoursSaved * 12.5, 100);

      return (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 + i * 0.12 }}
          className="bg-card rounded-xl shadow-card p-6 border border-border hover:shadow-elevated transition-shadow"
        >
          <div className="flex items-start gap-4">
            <div className="w-11 h-11 rounded-xl gradient-primary flex items-center justify-center shrink-0">
              <IconComp className="w-5 h-5 text-primary-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 mb-1">
                <h3 className="font-display font-bold text-foreground text-lg leading-tight">
                  {rec.title}
                </h3>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full whitespace-nowrap ${diff.className}`}>
                  {diff.label}
                </span>
              </div>
              <p className="text-muted-foreground text-sm mb-3 leading-relaxed">
                {rec.description}
              </p>
              <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm">
                <span className="flex items-center gap-1.5 text-primary font-medium">
                  <Clock className="w-3.5 h-3.5" />
                  Saves ~{rec.hoursSaved} hrs/week
                </span>
                <span className="flex items-center gap-1.5 text-green-accent font-medium">
                  <TrendingUp className="w-3.5 h-3.5" />
                  +{rec.roiPercent}% ROI
                </span>
                {rec.timeToImplement && (
                  <span className="flex items-center gap-1.5 text-muted-foreground">
                    ⏱ {rec.timeToImplement}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Impact bar */}
          <div className="mt-4">
            <div className="flex justify-between text-xs text-muted-foreground mb-1">
              <span>Impact score</span>
              <span>{Math.round(impactScore)}%</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{
                  background: `linear-gradient(90deg, hsl(152 60% 45%), hsl(207 90% 54%))`,
                }}
                initial={{ width: 0 }}
                animate={{ width: `${impactScore}%` }}
                transition={{ delay: 0.5 + i * 0.12, duration: 0.6 }}
              />
            </div>
          </div>
        </motion.div>
      );
    })}
  </div>
);

export default RecommendationList;
