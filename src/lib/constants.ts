import { Question, FinancialProfile } from './types';

// This will be populated dynamically from the API
export let QUESTIONS: Question[] = [];
export let QUESTIONS_ERROR: string | null = null;

// Initialize questions from API
export async function initializeQuestions(): Promise<void> {
  try {
    const response = await fetch('/api/questions');
    if (!response.ok) {
      throw new Error('Failed to fetch questions');
    }
    const data = await response.json();
    QUESTIONS = data.questions;
    QUESTIONS_ERROR = null;
  } catch (error) {
    console.error('Failed to load questions from API:', error);
    QUESTIONS_ERROR = 'מצטערים, אירעה שגיאה בטעינת השאלות. אנא נסו שוב מאוחר יותר.';
    throw error;
  }
}

export const FINANCIAL_PROFILES: Record<FinancialProfile, string> = {
  'המתכנן': 'אתה מתכנן פיננסי זהיר ומחושב, המעדיף ביטחון ויציבות.',
  'המהמר': 'אתה משקיע אמיץ, מוכן לקחת סיכונים משמעותיים להשגת תשואות גבוהות.',
  'המאוזן': 'אתה משקיע מאוזן, המשלב בין סיכון לתשואה בצורה חכמה.',
  'המחושב': 'אתה משקיע מחושב, המשלב בין תכנון קפדני לנטילת סיכונים מבוקרת.'
}; 