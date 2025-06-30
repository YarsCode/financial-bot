export interface Question {
  id: string;
  text: string;
  type: 'text' | 'number' | 'sum' | 'multiple';
  options?: string[];
  nextQuestions?: string[];
  isLastQuestion?: boolean;
  section?: string;
}

export interface Answer {
  questionId: number;
  answer: string;
}

export type FinancialProfile = 'המתכנן' | 'המהמר' | 'המאוזן' | 'המחושב';

export interface ChatMessage {
  type: 'user' | 'bot' | 'error';
  content: string;
}

export interface FinancialProfileResponse {
  profile: {
    name: string;
    confidence: number;
    alternative_profiles: string;
  };
  analysis: {
    key_insights: string;
    risk_tolerance: 'נמוך' | 'בינוני' | 'גבוה';
    investment_horizon: 'קצר' | 'בינוני' | 'ארוך טווח';
    financial_goals: string;
  };
  explanation: {
    profile_match: string;
    practical_implications: string;
    advantages: string;
    considerations: string;
  };
  recommendations: {
    immediate_actions: RecommendationAction;
    long_term_strategy: RecommendationAction;
    investment_approach: {
      asset_allocation: string;
      risk_management: string;
      diversification: string;
    };
  };
  reasoning: {
    answer_analysis: string;
    profile_comparison: string;
    key_factors: string;
  };
}

interface RecommendationAction {
  title: string;
  description: string;
  priority?: 'גבוה' | 'בינוני' | 'נמוך';
  timeline: string;
} 