import { getProfilesForOpenAI } from './docx-utils';
import { Answer, FinancialProfile, FinancialProfileResponse, Question } from './types';

// This will be populated dynamically from the API
export let QUESTIONS: Question[] = [];

// Initialize questions from API
export async function initializeQuestions(): Promise<void> {
  try {
    const response = await fetch('/api/questions');
    if (!response.ok) {
      throw new Error('Failed to fetch questions');
    }
    const data = await response.json();
    QUESTIONS = data.questions;
  } catch (error) {
    console.error('Failed to load questions from API, using defaults:', error);
    // Fallback to default questions if API call fails
    QUESTIONS = getDefaultQuestions();
  }
}

function getDefaultQuestions(): Question[] {
  return [
    {
      id: 1,
      text: 'כמה כסף צברת?',
      type: 'text'
    },
    {
      id: 2,
      text: 'כמה אתה חוסך כל חודש?',
      type: 'text'
    },
    {
      id: 3,
      text: 'מהי מטרת השקעה?',
      type: 'multiple',
      options: ['דירה', 'פרישה מוקדמת', 'חיסכון', 'אחר']
    },
    {
      id: 4,
      text: 'מהי רמת הסיכון שאתה מוכן לקחת?',
      type: 'multiple',
      options: ['נמוכה', 'בינונית', 'גבוהה', 'גבוהה מאוד']
    },
    {
      id: 5,
      text: 'מהו אופק ההשקעה שלך?',
      type: 'multiple',
      options: ['קצר טווח (עד שנה)', 'בינוני (1-5 שנים)', 'ארוך טווח (מעל 5 שנים)']
    },
    {
      id: 6,
      text: 'האם יש לך חובות?',
      type: 'multiple',
      options: ['כן', 'לא']
    },
    {
      id: 7,
      text: 'מהי רמת ההכנסה החודשית שלך?',
      type: 'text'
    },
    {
      id: 8,
      text: 'האם יש לך ביטוח חיים?',
      type: 'multiple',
      options: ['כן', 'לא']
    },
    {
      id: 9,
      text: 'מהי רמת הידע שלך בשוק ההון?',
      type: 'multiple',
      options: ['מתחיל', 'בינוני', 'מתקדם']
    },
    {
      id: 10,
      text: 'מהי המטרה הפיננסית העיקרית שלך?',
      type: 'multiple',
      options: ['ביטחון פיננסי', 'צבירת הון', 'הכנסה פסיבית', 'אחר']
    }
  ];
}

export async function getProfileRecommendation(answers: Answer[]): Promise<FinancialProfileResponse> {
  const profilesContent = await getProfilesForOpenAI();
  
  // Format the answers in a way that's easy for OpenAI to understand
  const formattedAnswers = answers.map(answer => {
    const question = QUESTIONS.find(q => q.id === answer.questionId);
    return `שאלה: ${question?.text}\nתשובה: ${answer.answer}`;
  }).join('\n\n');

  // Here you would make the API call to OpenAI with both the profiles and answers
  // This is where you'd implement the actual OpenAI integration
  // For now, we'll return a placeholder response
  return {
    profile: {
      name: 'המאוזן',
      confidence: 85,
      alternative_profiles: ['תכנן', 'המחושב']
    },
    analysis: {
      key_insights: ['תובנה מרכזית 1', 'תובנה מרכזית 2'],
      risk_tolerance: 'בינוני',
      investment_horizon: 'ארוך טווח',
      financial_goals: ['מטרה 1', 'מטרה 2']
    },
    explanation: {
      profile_match: 'Based on your answers and the profile information...',
      practical_implications: 'Practical implications of this profile...',
      advantages: ['יתרון 1', 'יתרון 2'],
      considerations: ['שיקול 1', 'שיקול 2']
    },
    recommendations: {
      immediate_actions: [
        {
          title: 'Recommendation 1',
          description: 'Description of recommendation 1',
          priority: 'גבוה',
          timeline: '1-3 חודשים'
        },
        {
          title: 'Recommendation 2',
          description: 'Description of recommendation 2',
          priority: 'בינוני',
          timeline: '3-6 חודשים'
        }
      ],
      long_term_strategy: [
        {
          title: 'Long term strategy',
          description: 'Description of long term strategy',
          timeline: '1-3 שנים'
        }
      ],
      investment_approach: {
        asset_allocation: '60% מניות, 30% אג״ח, 10% מזומן',
        risk_management: 'גישה לניהול סיכונים',
        diversification: 'אסטרטגיית גיוון'
      }
    },
    reasoning: {
      answer_analysis: 'The reasoning behind this recommendation...',
      profile_comparison: 'Comparison with other profiles...',
      key_factors: ['גורם 1', 'גורם 2', 'גורם 3']
    },
    metadata: {
      analysis_date: new Date().toISOString().split('T')[0],
      questions_answered: answers.length,
      confidence_factors: ['עקביות בתשובות', 'בהירות בהעדפות']
    }
  };
} 