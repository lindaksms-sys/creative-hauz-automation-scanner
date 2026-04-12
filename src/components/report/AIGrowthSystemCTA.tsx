import { ArrowRight, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import type { ScannerFormData } from "@/types/scanner";

const PAIN_POINT_LABELS: Record<string, string> = {
  "lead-followup": "leads slipping through the cracks",
  "customer-onboarding": "manual client onboarding eating your day",
  "content-social": "content creation & social media taking hours",
  "appointment-booking": "missed appointments and no-shows",
  "invoice-chasing": "chasing invoices and late payments",
  "data-entry": "repetitive data entry and CRM updates",
  "email-management": "drowning in emails",
  "reporting": "spending hours on reports and analytics",
};

const NICHE_RESULTS: Record<string, string> = {
  "Real Estate": "80% faster lead response, 3x property viewings booked, 15+ hrs saved/week",
  "Healthcare / Clinic": "90% fewer no-shows, 3x appointment fill rate, 12+ hrs saved/week",
  "Recruitment Agency": "80% faster CV screening, 3x candidate placements, 15+ hrs saved/week",
  "Professional Services": "70% faster client onboarding, 2x billable hours recovered, 12+ hrs saved/week",
  "Marketing / Agency": "3x content output, 80% faster reporting, 15+ hrs saved/week",
  "Retail / E-Commerce": "60% fewer cart abandonments, 3x repeat purchases, 12+ hrs saved/week",
  "Construction / Trades": "90% fewer missed quotes, 2x job bookings, 10+ hrs saved/week",
  "Food & Hospitality": "80% faster reservations, 3x online orders, 12+ hrs saved/week",
};

const TESTIMONIALS = [
  {
    quote: "We went from spending full Mondays screening CVs to having our AI pre-qualify candidates overnight. Our placements tripled in 2 months.",
    name: "Priya N.",
    role: "Recruitment Agency Owner, Lagos",
  },
  {
    quote: "The AI voice agent books appointments 24/7 — even at 2am. We've never had this many consultations booked without lifting a finger.",
    name: "James O.",
    role: "Med Spa Director, Abuja",
  },
];

interface Props {
  scannerData?: ScannerFormData | null;
  variant?: "full" | "compact";
  delay?: number;
}

const AIGrowthSystemCTA = ({ scannerData, variant = "full", delay = 0 }: Props) => {
  const painDrains = scannerData?.painPoints
    ?.map((p) => PAIN_POINT_LABELS[p])
    .filter(Boolean)
    .slice(0, 2) || [];

  const customDrain = scannerData?.dailyTimeDrain?.trim();
  const drainText = painDrains.length > 0
    ? painDrains.join(" and ")
    : customDrain
      ? customDrain.slice(0, 80)
      : "repetitive manual tasks eating your day";

  const niche = scannerData?.businessType || "";
  const nicheResults = NICHE_RESULTS[niche] || "80% faster operations, 3x appointments booked, 15+ hrs saved/week";

  if (variant === "compact") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay }}
        className="bg-primary rounded-2xl shadow-elevated p-6 sm:p-8 border border-primary/20 text-primary-foreground"
      >
        <h2 className="font-display text-xl sm:text-2xl font-bold mb-3">
          🚀 Your Recommended System: AI Growth System
        </h2>
        <p className="text-primary-foreground/90 mb-4 text-sm">
          Ready to eliminate {drainText}? Book your free 30-min AI Audit and get this live in under 30 days.
        </p>
        <p className="text-xs text-primary-foreground/70 mb-4 font-medium">
          Clients in your niche see: {nicheResults}
        </p>
        <Button
          variant="secondary"
          size="lg"
          className="w-full text-base font-bold py-6"
          asChild
        >
          <a href="https://calendar.app.google/SfprwqMYFqERrAwi7" target="_blank" rel="noopener noreferrer">
            Book My Free AI Audit
            <ArrowRight className="w-4 h-4" />
          </a>
        </Button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="bg-card rounded-2xl shadow-elevated border-2 border-primary/30 overflow-hidden mb-8"
    >
      {/* Header badge */}
      <div className="bg-primary px-6 py-3 flex items-center gap-2">
        <Star className="w-5 h-5 text-primary-foreground fill-primary-foreground" />
        <span className="font-display font-bold text-primary-foreground text-lg">
          Recommended AI System for You
        </span>
      </div>

      <div className="p-6 sm:p-8 space-y-5">
        <p className="text-foreground leading-relaxed">
          Based on your biggest time drains — <span className="font-semibold text-primary">{drainText}</span> — the perfect fit is our{" "}
          <span className="font-bold">AI Growth System</span>{" "}
          <span className="text-muted-foreground">($9,997 one-time + $997/mo retainer)</span>.
        </p>

        <div className="space-y-2">
          <h4 className="font-display font-bold text-foreground text-sm uppercase tracking-wide">
            What's included:
          </h4>
          <ul className="space-y-2 text-foreground text-sm">
            {[
              "AI Voice Agent + 24/7 lead capture & booking",
              "Automated client intake & onboarding",
              "Full workflow automation + custom dashboard",
              "4-week build + 2 months of optimization calls",
            ].map((item) => (
              <li key={item} className="flex items-start gap-2">
                <span className="text-green-accent mt-0.5">✓</span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-green-accent/10 rounded-xl px-5 py-3 border border-green-accent/20">
          <p className="text-sm font-semibold text-green-accent">
            Clients in your exact niche see: {nicheResults}
          </p>
        </div>

        <p className="text-sm text-foreground font-medium">
          → Book your free AI Audit now to lock launch pricing and get this live in under 30 days.
        </p>

        <Button variant="hero" size="lg" className="w-full text-base font-bold py-6" asChild>
          <a href="https://calendar.app.google/SfprwqMYFqERrAwi7" target="_blank" rel="noopener noreferrer">
            Book My Free AI Audit
            <ArrowRight className="w-4 h-4" />
          </a>
        </Button>

        {/* Testimonials */}
        <div className="space-y-3 pt-2">
          {TESTIMONIALS.map((t) => (
            <div key={t.name} className="bg-muted/50 rounded-lg p-4 border border-border">
              <p className="text-sm text-foreground italic mb-2">"{t.quote}"</p>
              <p className="text-xs font-semibold text-primary">{t.name}</p>
              <p className="text-xs text-muted-foreground">{t.role}</p>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default AIGrowthSystemCTA;
