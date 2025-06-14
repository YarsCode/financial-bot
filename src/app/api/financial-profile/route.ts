import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const { answers } = await req.json();
    if (!process.env.OPENAI_API_KEY) {
      console.error('OPENAI_API_KEY is missing');
      return NextResponse.json({ error: 'Missing OpenAI API key' }, { status: 500 });
    }
    if (!answers || !Array.isArray(answers)) {
      console.error('Invalid or missing answers:', answers);
      return NextResponse.json({ error: 'Invalid answers' }, { status: 400 });
    }

    const prompt = `Based on the following financial questionnaire answers, generate a personalized financial profile in Hebrew. The profile should be one of: "תכנן", "המהמר", "המאוזן", or "המחושב". Include a description and 2-3 specific recommendations.\n\nAnswers:\n${answers.map((a: { questionId: number, answer: string }) => `Question ${a.questionId}: ${a.answer}`).join('\n')}\n\nFormat the response as a JSON object with the following structure:\n{\n  "profile": "PROFILE_TYPE",\n  "description": "DESCRIPTION_IN_HEBREW",\n  "recommendations": ["RECOMMENDATION1", "RECOMMENDATION2", "RECOMMENDATION3"]\n}\n\nImportant: Return ONLY the JSON object, no markdown formatting or additional text.`;

    const completion = await openai.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'gpt-4o',
      response_format: { type: 'json_object' }
    });

    const content = completion.choices[0].message.content;
    if (!content) {
      throw new Error('No content received from OpenAI');
    }

    // Clean the response by removing any markdown formatting
    const cleanedContent = content.replace(/```json\n?|\n?```/g, '').trim();
    
    try {
      const response = JSON.parse(cleanedContent);
      return NextResponse.json(response);
    } catch (parseError) {
      console.error('Failed to parse OpenAI response:', parseError);
      console.error('Raw content:', content);
      return NextResponse.json(
        { error: 'Failed to parse AI response', details: String(parseError) },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('API route error:', error);
    return NextResponse.json(
      { error: 'Failed to generate financial profile', details: String(error) },
      { status: 500 }
    );
  }
} 