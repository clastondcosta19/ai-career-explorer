export interface RoadmapStep {
  step: number;
  skill: string;
  description?: string;
  action: string;
  status: string;
}

export interface RoadmapData {
  career: string;
  totalMissingSkills: number;
  missingSkills: string[];
  steps: RoadmapStep[];
}

export interface StudentRoadmap {
  id: number;
  goal: string;
  currentStage: string;
  targetStage: string;
  roadmapData: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  career: {
    id: number;
    title: string;
  };
}
