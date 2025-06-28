export interface Question {
  id: number;
  text: string;
  type: 'text' | 'number' | 'multiple';
  options?: string[];
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
  profile: FinancialProfile;
  explanation: string;
  recommendations: string[];
  reasoning: string;
} 