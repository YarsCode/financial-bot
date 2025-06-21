import { promises as fs } from 'fs';
import path from 'path';
import mammoth from 'mammoth';
import { Question } from './types';

export interface ProfileData {
  name: string;
  content: string;
}

export async function readProfileDocx(profileName: string): Promise<ProfileData> {
  const filePath = path.join(process.cwd(), 'src', 'data', 'profiles', `דוח פיננסי - ${profileName}.docx`);
  const buffer = await fs.readFile(filePath);
  const result = await mammoth.extractRawText({ buffer });
  
  return {
    name: profileName,
    content: result.value
  };
}

export async function getAllProfiles(): Promise<ProfileData[]> {
  const profiles = ['המאוזן', 'המהמר', 'המחושב', 'המתכנן'];
  const profileContents: ProfileData[] = [];

  for (const profile of profiles) {
    try {
      const content = await readProfileDocx(profile);
      profileContents.push(content);
    } catch (error) {
      console.error(`Error reading profile ${profile}:`, error);
    }
  }

  return profileContents;
}

export async function getProfilesForOpenAI(): Promise<string> {
  const profiles = await getAllProfiles();
  
  // Format the profiles in a way that's easy for OpenAI to understand
  return profiles.map(profile => 
    `פרופיל פיננסי: ${profile.name}\n${profile.content}\n---\n`
  ).join('\n');
}

export async function readQuestionsDocx(): Promise<string> {
  const filePath = path.join(process.cwd(), 'src', 'data', 'questions', 'שאלון פיננסי AI.docx');
  const buffer = await fs.readFile(filePath);
  const result = await mammoth.extractRawText({ buffer });
  
  return result.value;
}

export function parseQuestionsFromText(text: string): Question[] {
  const questions: Question[] = [];
  const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  
  let currentQuestion: Partial<Question> = {};
  let questionId = 1;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Check if this is a question line (contains a number followed by a dot)
    const questionMatch = line.match(/^(\d+)\.\s*(.+?)\s*\*([^*]+)\*$/);
    
    if (questionMatch) {
      // Save previous question if exists
      if (currentQuestion.text && currentQuestion.type) {
        questions.push(currentQuestion as Question);
      }
      
      const [, id, questionText, questionType] = questionMatch;
      const type = questionType.trim();
      
      let questionTypeEnum: 'text' | 'number' | 'multiple';
      if (type === 'בחירה') {
        questionTypeEnum = 'multiple';
      } else if (type === 'מספר') {
        questionTypeEnum = 'number';
      } else {
        questionTypeEnum = 'text';
      }
      
      currentQuestion = {
        id: questionId++,
        text: questionText.trim(),
        type: questionTypeEnum
      };
      
      // If it's a choice question, look for options in the next lines
      if (currentQuestion.type === 'multiple') {
        const options: string[] = [];
        let j = i + 1;
        
        // Look for options (א., ב., ג., ד.)
        while (j < lines.length) {
          const optionLine = lines[j];
          const optionMatch = optionLine.match(/^([א-ד])\.\s*(.+)$/);
          
          if (optionMatch) {
            const [, optionLetter, optionText] = optionMatch;
            options.push(optionText.trim());
            j++;
          } else {
            // If we hit another question or non-option line, stop
            if (optionLine.match(/^\d+\./) || !optionLine.match(/^[א-ד]\./)) {
              break;
            }
            j++;
          }
        }
        
        if (options.length > 0) {
          currentQuestion.options = options;
        }
      }
    }
  }
  
  // Add the last question
  if (currentQuestion.text && currentQuestion.type) {
    questions.push(currentQuestion as Question);
  }
  
  return questions;
}

export async function getQuestionsFromDocx(): Promise<Question[]> {
  try {
    const questionsText = await readQuestionsDocx();
    return parseQuestionsFromText(questionsText);
  } catch (error) {
    console.error('Error reading questions from DOCX:', error);
    // Fallback to default questions if DOCX reading fails
    return getDefaultQuestions();
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