export interface Question {
  id: number;
  text: string;
  type: 'text' | 'multiple';
  options?: string[];
}

export interface Answer {
  questionId: number;
  answer: string;
}

export type FinancialProfile = 'תכנן' | 'המהמר' | 'המאוזן' | 'המחושב';

export interface ChatMessage {
  type: 'user' | 'bot';
  content: string;
}

export interface FinancialProfileResponse {
  profile: FinancialProfile;
  description: string;
  recommendations: string[];
} 