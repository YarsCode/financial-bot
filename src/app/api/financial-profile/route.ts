import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { getProfilesForOpenAI, getQuestionsFromDocx } from '@/lib/docx-utils';

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
    
    // Get the questions to pair with answers
    const questions = await getQuestionsFromDocx();
    
    // Create a map of questionId to question for easy lookup
    const questionMap = new Map(questions.map(q => [q.id, q]));
    
    // Pair questions with answers
    const questionsAndAnswers = answers.map((answer: { questionId: number, answer: string }) => {
      const question = questionMap.get(answer.questionId);
      if (!question) {
        console.warn(`Question with ID ${answer.questionId} not found`);
        return `שאלה ${answer.questionId}: תשובה לא ידועה - ${answer.answer}`;
      }
      
      const questionText = question.text;
      
      return `שאלה ${answer.questionId}: ${questionText}\nתשובה: ${answer.answer}`;
    }).join('\n\n');

    const prompt = `אתה מומחה לתכנון פיננסי בעל ניסיון של למעלה מ-20 שנה בשוק ההון הישראלי והבינלאומי, עם הסמכת CFP בינלאומית יוקרתית והתמחות מעמיקה בניהול תיקי השקעות, תכנון פרישה, וייעוץ פיננסי מקיף. בזכות הידע הנרחב והניסיון העשיר שלך בניתוח מאות פרופילים פיננסיים, מטרתך היא לנתח תשובות של לקוח לשאלון פיננסי ובהתאם אליהן לשייך את הלקוח לאחד מארבעה פרופילים פיננסיים.

הנה הפרופילים הפיננסיים האפשריים ביחד עם ההסבר והתובנות עבור כל אחד מהם:
${profilesContent}

הנה השאלות והתשובות של המשתמש לשאלון:
${questionsAndAnswers}

**הוראות מפורטות לניתוח:**

1. **ניתוח מעמיק של התשובות (מינימום 150 מילים):**
   - זהה דפוסי התנהגות פיננסית מרכזיים מתוך התשובות
   - בחן את הגישה הכללית לניהול סיכונים והזדמנויות
   - הערך את מידת המעורבות והמחויבות לתכנון פיננסי
   - התייחס לשיקולים ארוכי טווח מול צרכים מיידיים
   - נתח את רמת הסיכון שהלקוח מוכן לקחת בהשקעותיו
   - בחן את היחס בין הרצון לסיכון לבין היכולת לספוג הפסדים

2. **התאמת הפרופיל (מינימום 50 מילים):**
   - שלב דוגמאות ספציפיות מתשובות המשתמש שמדגימות את התאמת הפרופיל
   - הצג את הקשר בין דפוסי ההתנהגות לבין מאפייני הפרופיל
   - התייחס לאיזון בין שיקולים שונים בבחירת הפרופיל

3. **הסבר מקצועי (מינימום 100 מילים):**
   - תאר את המשמעויות המעשיות של הפרופיל בשפה ברורה ומקצועית
   - הדגש הזדמנויות וסיכונים רלוונטיים למצב הספציפי
   - שלב תובנות מניסיון מקצועי עם לקוחות דומים
   - שמור על טון אישי ומקצועי, כמו יועץ פיננסי בפגישת ייעוץ

4. **המלצות פרקטיות (מינימום 150 מילים):**
   - הצע צעדים מעשיים וברורים המותאמים למצב האישי
   - הצע אסטרטגיות לגיוון והתאמת רמת הסיכון
   - תן דגשים לתכנון קצר וארוך טווח
   - התייחס לאפשרויות חיסכון והשקעה רלוונטיות בשוק הישראלי והעולמי
   - הצע דרכים לשיפור התנהלות פיננסית יומיומית

**סגנון ואופי התשובה:**
- שמור על טון מקצועי אך חם ואישי
- דבר ישירות אל הלקוח בגוף שני ("אתה", "שלך")
- אף פעם אל תדבר בתשובה שלך בגוף שלישי (לא לרשום דברים כמו ״הלקוח״ או ״הוא״)
- הימנע מניסוחים כלליים ומרוחקים, במקום זאת דבר כאילו אתה יושב מול הלקוח
- שלב משפטים כמו "אני ממליץ לך...", "בהתבסס על מה שסיפרת לי..."
- שמור על טון מקצועי אך חברותי, כמו יועץ אישי שמכיר את הלקוח
- דבר בגובה העיניים תוך שימוש בדוגמאות מוחשיות
- שלב תובנות מניסיון מקצועי בתחום
- הדגש את ההיבטים האישיים והייחודיים בניתוח

החזר את התשובה בפורמט JSON הבא:
{
  "profile": "שם הפרופיל",
  "explanation": "הסבר מפורט ומעמיק (מינימום 250 מילים) על התאמת הפרופיל למשתמש, כולל משמעות מעשית ויתרונות/חסרונות",
  "recommendations": ["המלצה 1", "המלצה 2", "המלצה 3"],
  "reasoning": "ניתוח מעמיק ומפורט (מינימום 200 מילים) של התשובותאמתן לפרופיל, כולל השוואה לפרופילים אחרים"
}

חשוב: 
- החזר רק את אובייקט ה-JSON, ללא טקסט נוסף או פורמט markdown
- וודא שכל השדות מכילים תוכן מפורט ומעמיק
- הימנע ממשפטי סיכום גנריים כמו "כל אלה מעידים על כך שאתה מתאים לפרופיל"`;

    // Log the data being sent to OpenAI
    // console.log('=== OPENAI REQUEST DATA ===');
    // console.log('Prompt:', prompt);
    // console.log('==========================');

    const completion = await openai.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'gpt-4o',
      response_format: { type: 'json_object' }
    });

    // Log the response received from OpenAI
    // console.log('=== OPENAI RESPONSE ===');
    // console.log('Raw response:', completion);
    // console.log('Content:', completion.choices[0].message.content);
    // console.log('Usage:', completion.usage);
    // console.log('======================');

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