export interface ScannerFormData {
  businessType: string;
  businessSize: string;
  industry: string;
  painPoints: string[];
  customPainPoint: string;
  dailyTimeDrain: string;
}

export interface AutomationRecommendation {
  title: string;
  description: string;
  hoursSaved: number;
  roiPercent: number;
  icon: string;
  difficulty?: string;
  timeToImplement?: string;
}

export interface ScanReport {
  totalHoursSaved: number;
  recommendations: AutomationRecommendation[];
  summary: string;
  industryInsight?: string;
}
