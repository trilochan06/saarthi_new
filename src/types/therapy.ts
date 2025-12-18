    export type Language = 'english' | 'hindi' | 'tamil';

export type ActivityType = 'aac' | 'matching' | 'visual-schedule' | 'speech';

export type ActivityStatus = 'assigned' | 'in-progress' | 'completed';

export interface Learner {
  id: string;
  name: string;
  age: number;
  preferredLanguage: Language;
  createdAt: Date;
}

export interface AACItem {
  id: string;
  label: string;
  labelTranslations: Record<Language, string>;
  imageUrl?: string;
}

export interface MatchingOption {
  id: string;
  text: string;
  textTranslations: Record<Language, string>;
  isCorrect: boolean;
}

export interface VisualStep {
  id: string;
  label: string;
  labelTranslations: Record<Language, string>;
  imageUrl?: string;
  order: number;
}

export interface SpeechPromptData {
  promptText: string;
  promptTranslations: Record<Language, string>;
  imageUrl?: string;
}

export interface Activity {
  id: string;
  name: string;
  type: ActivityType;
  targetLanguage: Language;
  instruction: string;
  instructionTranslations: Record<Language, string>;
  createdAt: Date;
  updatedAt: Date;
  // Type-specific content
  aacItems?: AACItem[];
  matchingOptions?: MatchingOption[];
  visualSteps?: VisualStep[];
  speechPrompt?: SpeechPromptData;
}

export interface Assignment {
  id: string;
  activityId: string;
  learnerId: string;
  status: ActivityStatus;
  lastUpdate: string;
  therapistNotes?: string;
  audioSubmissionUrl?: string;
  assignedAt: Date;
  updatedAt: Date;
}

export interface ProgressEntry {
  childName: string;
  activityName: string;
  status: ActivityStatus;
  lastUpdate: string;
  assignmentId: string;
  learnerId: string;
  activityId: string;
}
