import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { ScannerFormData } from "@/types/scanner";

const BUSINESS_TYPES = [
  "Real Estate",
  "Healthcare / Clinic",
  "Retail / E-Commerce",
  "Professional Services",
  "Marketing / Agency",
  "Construction / Trades",
  "Food & Hospitality",
  "Other",
];

const BUSINESS_SIZES = [
  "Solo / Freelancer",
  "2-10 employees",
  "11-50 employees",
  "51-200 employees",
  "200+ employees",
];

const PAIN_POINTS = [
  { id: "lead-followup", label: "Lead follow-up & nurturing" },
  { id: "customer-onboarding", label: "Customer onboarding" },
  { id: "content-social", label: "Content creation / social media" },
  { id: "appointment-booking", label: "Appointment booking & reminders" },
  { id: "invoice-chasing", label: "Invoice chasing & payments" },
  { id: "data-entry", label: "Data entry / CRM updates" },
  { id: "email-management", label: "Email management" },
  { id: "reporting", label: "Reporting & analytics" },
];

interface Props {
  onComplete: (data: ScannerFormData) => void;
  isLoading: boolean;
}

const ScannerQuestionnaire = ({ onComplete, isLoading }: Props) => {
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState<ScannerFormData>({
    businessType: "",
    businessSize: "",
    industry: "",
    painPoints: [],
    customPainPoint: "",
    dailyTimeDrain: "",
  });

  const totalSteps = 3;
  const progress = ((step + 1) / totalSteps) * 100;

  const canProceed = () => {
    if (step === 0) return formData.businessType && formData.businessSize;
    if (step === 1) return formData.painPoints.length > 0;
    return true;
  };

  const handleNext = () => {
    if (step < totalSteps - 1) setStep(step + 1);
    else onComplete(formData);
  };

  const togglePainPoint = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      painPoints: prev.painPoints.includes(id)
        ? prev.painPoints.filter((p) => p !== id)
        : [...prev.painPoints, id],
    }));
  };

  return (
    <section className="min-h-screen flex items-center justify-center bg-background py-12 px-4">
      <div className="w-full max-w-2xl">
        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-muted-foreground mb-2">
            <span>Step {step + 1} of {totalSteps}</span>
            <span>{Math.round(progress)}% complete</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <motion.div
              className="h-full gradient-primary rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        <div className="bg-card rounded-2xl shadow-elevated p-6 sm:p-10">
          <AnimatePresence mode="wait">
            {step === 0 && (
              <motion.div
                key="step0"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
              >
                <h2 className="font-display text-2xl font-bold text-foreground mb-2">
                  Tell us about your business
                </h2>
                <p className="text-muted-foreground mb-8">
                  This helps us tailor recommendations to your industry.
                </p>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Business Type
                    </label>
                    <select
                      value={formData.businessType}
                      onChange={(e) => setFormData({ ...formData, businessType: e.target.value })}
                      className="w-full h-12 px-4 rounded-lg border border-input bg-background text-foreground focus:ring-2 focus:ring-ring outline-none"
                    >
                      <option value="">Select your business type...</option>
                      {BUSINESS_TYPES.map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Business Size
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {BUSINESS_SIZES.map((size) => (
                        <button
                          key={size}
                          onClick={() => setFormData({ ...formData, businessSize: size })}
                          className={`px-4 py-3 rounded-lg border text-sm font-medium transition-all ${
                            formData.businessSize === size
                              ? "border-primary bg-primary/10 text-primary"
                              : "border-input bg-background text-foreground hover:border-primary/50"
                          }`}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Industry (optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., Dental clinic, SaaS startup..."
                      value={formData.industry}
                      onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                      className="w-full h-12 px-4 rounded-lg border border-input bg-background text-foreground focus:ring-2 focus:ring-ring outline-none"
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
              >
                <h2 className="font-display text-2xl font-bold text-foreground mb-2">
                  What's eating your time?
                </h2>
                <p className="text-muted-foreground mb-8">
                  Select all the tasks that take up too much of your day.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                  {PAIN_POINTS.map((pp) => (
                    <button
                      key={pp.id}
                      onClick={() => togglePainPoint(pp.id)}
                      className={`px-4 py-3 rounded-lg border text-sm font-medium text-left transition-all ${
                        formData.painPoints.includes(pp.id)
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-input bg-background text-foreground hover:border-primary/50"
                      }`}
                    >
                      {pp.label}
                    </button>
                  ))}
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Other (describe)
                  </label>
                  <input
                    type="text"
                    placeholder="Any other time-consuming tasks..."
                    value={formData.customPainPoint}
                    onChange={(e) => setFormData({ ...formData, customPainPoint: e.target.value })}
                    className="w-full h-12 px-4 rounded-lg border border-input bg-background text-foreground focus:ring-2 focus:ring-ring outline-none"
                  />
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
              >
                <h2 className="font-display text-2xl font-bold text-foreground mb-2">
                  One more thing...
                </h2>
                <p className="text-muted-foreground mb-8">
                  Describe your biggest daily time drain in a sentence or two. This helps our AI give you better recommendations.
                </p>

                <textarea
                  value={formData.dailyTimeDrain}
                  onChange={(e) => setFormData({ ...formData, dailyTimeDrain: e.target.value })}
                  placeholder="e.g., I spend 2 hours every morning manually following up with leads from Facebook ads, copying info into my CRM, and sending the same welcome emails..."
                  rows={5}
                  className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground focus:ring-2 focus:ring-ring outline-none resize-none"
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex justify-between items-center mt-8 pt-6 border-t border-border">
            <Button
              variant="ghost"
              onClick={() => setStep(step - 1)}
              disabled={step === 0}
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>

            <Button
              variant="hero"
              size="lg"
              onClick={handleNext}
              disabled={!canProceed() || isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Analyzing...
                </>
              ) : step === totalSteps - 1 ? (
                <>
                  Get My Report
                  <ArrowRight className="w-4 h-4" />
                </>
              ) : (
                <>
                  Continue
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ScannerQuestionnaire;
