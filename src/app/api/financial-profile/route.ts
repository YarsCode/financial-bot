import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { getProfilesForOpenAI } from '@/lib/docx-utils';

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

    // Get the financial profiles content from DOCX files
    const profilesContent = await getProfilesForOpenAI();

    const prompt = `אתה מומחה פיננסי שמנתח תשובות לשאלון פיננסי ומתאים אותן לאחד מארבעה פרופילים פיננסיים.

הנה הפרופילים הפיננסיים האפשריים:
${profilesContent}

הנה התשובות של המשתמש לשאלון:
${answers.map((a: { questionId: number, answer: string }) => `שאלה ${a.questionId}: ${a.answer}`).join('\n')}

בבקשה:
1. ניתוח את התשובות של המשתמש
2. התאם את המשתמש לאחד מארבעת הפרופילים הפיננסיים (תכנן, המהמר, המאוזן, המחושב)
3. הסבר למה הפרופיל הזה מתאים למשתמש, בהתבסס על התשובות שלו
4. תן 2-3 המלצות ספציפיות למשתמש, בהתבסס על הפרופיל שנבחר

החזר את התשובה בפורמט JSON הבא:
{
  "profile": "שם הפרופיל",
  "explanation": "הסבר מפורט למה הפרופיל מתאים למשתמש",
  "recommendations": ["המלצה 1", "המלצה 2", "המלצה 3"],
  "reasoning": "ניתוח מפורט של התשובותאמתן לפרופיל"
}

חשוב: החזר רק את אובייקט ה-JSON, ללא טקסט נוסף או פורמט markdown.`;

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