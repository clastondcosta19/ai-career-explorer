export interface CareerMatch {
  careerId: number;
  careerTitle: string;
  compatibilityScore: number;
  educationScore: number;
  confidence: string;
  matchedFactors: string[];
}

export interface SkillDetail {
  id: number;
  name: string;
  description: string;
  category: string;
}

export interface SkillGapAnalysis {
  careerId: number;
  careerTitle: string;

  requiredSkills: string[];

  matchedSkills: string[];

  missingSkills: string[];

  skillMatchPercentage: number;

  totalRequiredSkills: number;

  totalMatchedSkills: number;

  totalMissingSkills: number;

  missingSkillDetails: SkillDetail[];

  matchedSkillDetails: SkillDetail[];
}

export interface CareerAnalysisResult {
  id: number;

  careerId: number;
  careerTitle: string;

  compatibilityScore: number;
  skillMatchPercentage: number;
  educationScore: number;

  matchedSkills: string[];
  missingSkills: string[];

  matchedInterests: string[];
  matchedStrengths: string[];

  explanation: string;
  educationExplanation: string;

  analyzedAt: string;
}