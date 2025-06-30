import { NextResponse } from 'next/server';
import { getQuestionsAndAnswers } from '@/lib/google-sheets';
import { Question } from '@/lib/types';

export async function GET() {
  try {
    const questionsData = await getQuestionsAndAnswers();
    
    // Transform the data to match the frontend's expected Question type
    const questions: Question[] = questionsData.map((q) => {
      const question: Question = {
        id: q.id, // Keep the original string ID from Google Sheets
        text: q.question, // Map 'question' field to 'text'
        type: q.type, // Keep the original type (text, number, sum, multiple)
        isLastQuestion: q.is_last_question, // Map 'is_last_question' field
        section: q.section, // Include section field for s1/s2 logic
      };
      
      // Add options for multiple choice questions
      if (q.type === 'multiple' && q.answers) {
        question.options = q.answers.map(a => a.answer);
        // Add next_question mapping for each option
        question.nextQuestions = q.answers.map(a => a.next_question);
      }
      
      return question;
    });
    
    return NextResponse.json({ questions });
  } catch (error) {
    console.error('Error loading questions:', error);
    return NextResponse.json(
      { error: 'Failed to load questions' },
      { status: 500 }
    );
  }
} 