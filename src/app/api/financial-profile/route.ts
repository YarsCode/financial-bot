import { NextRequest, NextResponse } from 'next/server';
import { analyzeFinancialProfile, FinancialProfileRequest } from '@/services/openai';

export async function POST(req: NextRequest) {
  try {
    const { questionsAndAnswers }: FinancialProfileRequest = await req.json();
    
    if (!process.env.OPENAI_API_KEY) {
      console.error('OPENAI_API_KEY is missing');
      return NextResponse.json({ error: 'Missing OpenAI API key' }, { status: 500 });
    }
    
    if (!questionsAndAnswers || !Array.isArray(questionsAndAnswers)) {
      console.error('Invalid or missing questionsAndAnswers:', questionsAndAnswers);
      return NextResponse.json({ error: 'Invalid questions and answers' }, { status: 400 });
    }

    // Use the new function that handles everything automatically
    const response = await analyzeFinancialProfile({ questionsAndAnswers });
    
    return NextResponse.json(response);
    
  } catch (error) {
    console.error('API route error:', error);
    return NextResponse.json(
      { error: 'Failed to generate financial profile', details: String(error) },
      { status: 500 }
    );
  }
} 