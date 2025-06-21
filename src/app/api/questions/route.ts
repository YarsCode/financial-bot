import { NextResponse } from 'next/server';
import { getQuestionsFromDocx } from '@/lib/docx-utils';

export async function GET() {
  try {
    const questions = await getQuestionsFromDocx();
    return NextResponse.json({ questions });
  } catch (error) {
    console.error('Error loading questions:', error);
    return NextResponse.json(
      { error: 'Failed to load questions' },
      { status: 500 }
    );
  }
} 