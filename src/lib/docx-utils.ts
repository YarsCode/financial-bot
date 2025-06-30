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