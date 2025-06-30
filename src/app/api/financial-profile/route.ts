import { NextRequest, NextResponse } from 'next/server';
import { analyzeFinancialProfile } from '@/services/openai';
import { QuestionAnswer } from '@/services/openai';

export async function POST(req: NextRequest) {
  try {
    const { questionsAndAnswers } = await req.json();
    
    if (!process.env.OPENAI_API_KEY) {
      console.error('OPENAI_API_KEY is missing');
      return NextResponse.json({ error: 'Missing OpenAI API key' }, { status: 500 });
    }
    
    if (!questionsAndAnswers || !Array.isArray(questionsAndAnswers)) {
      console.error('Invalid or missing questionsAndAnswers:', questionsAndAnswers);
      return NextResponse.json({ error: 'Invalid request: questionsAndAnswers array is required' }, { status: 400 });
    }

    // Call the OpenAI assistant to analyze the profile
    const profileAnalysis = await analyzeFinancialProfile({
      questionsAndAnswers: questionsAndAnswers as QuestionAnswer[]
    });

    return NextResponse.json(profileAnalysis);
  } catch (error) {
    console.error('Error analyzing financial profile:', error);
    return NextResponse.json(
      { error: 'Failed to analyze financial profile' },
      { status: 500 }
    );
  }
} 