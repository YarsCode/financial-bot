// This file now only exports types for the OpenAI request payload.
import OpenAI from 'openai';
import { Answer } from '@/lib/types';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Assistant management
let assistantId: string | null = null;

export async function getOrCreateAssistant(): Promise<string> {
  if (assistantId) {
    return assistantId;
  }

  try {
    // Check if assistant already exists (you might want to store this ID in env vars)
    const existingAssistantId = process.env.OPENAI_ASSISTANT_ID;
    
    if (existingAssistantId) {
      // Verify the assistant exists
      try {
        await openai.beta.assistants.retrieve(existingAssistantId);
        assistantId = existingAssistantId;
        return assistantId;
      } catch (error) {
        console.warn('Stored assistant ID not found, creating new one');
      }
    }

    // Check if we already have an assistant in the current session
    if (assistantId) {
      return assistantId;
    }

    throw new Error('No assistant ID found. Please run npm run create-assistant first.');
  } catch (error) {
    console.error('Error retrieving assistant:', error);
    throw new Error('Failed to retrieve assistant');
  }
}

// Thread management
export async function createThread(): Promise<string> {
  try {
    const thread = await openai.beta.threads.create();
    return thread.id;
  } catch (error) {
    console.error('Error creating thread:', error);
    throw new Error('Failed to create thread');
  }
}

export async function addMessageToThread(threadId: string, content: string): Promise<string> {
  try {
    const message = await openai.beta.threads.messages.create(threadId, {
      role: 'user',
      content,
    });
    return message.id;
  } catch (error) {
    console.error('Error adding message to thread:', error);
    throw new Error('Failed to add message to thread');
  }
}

export async function runAssistant(threadId: string): Promise<string> {
  try {
    const assistantId = await getOrCreateAssistant();
    
    const run = await openai.beta.threads.runs.create(threadId, {
      assistant_id: assistantId,
    });
    
    return run.id;
  } catch (error) {
    console.error('Error running assistant:', error);
    throw new Error('Failed to run assistant');
  }
}

// Run completion check - no artificial timeout
export async function checkRunCompletion(threadId: string, runId: string): Promise<boolean> {
  // No artificial timeout - let the API handle timing naturally
  // If there's an issue, the existing error handling will catch it
  return true;
}

export async function getThreadMessages(threadId: string) {
  try {
    const messages = await openai.beta.threads.messages.list(threadId);
    return messages.data;
  } catch (error) {
    console.error('Error getting thread messages:', error);
    throw new Error('Failed to get thread messages');
  }
}

// File management for assistant context
export async function uploadFileToAssistant(filePath: string, fileName: string): Promise<string> {
  try {
    const fs = require('fs');
    const fileBuffer = fs.readFileSync(filePath);
    
    const file = await openai.files.create({
      file: fileBuffer,
      purpose: 'assistants',
    });

    return file.id;
  } catch (error) {
    console.error('Error uploading file:', error);
    throw new Error(`Failed to upload file ${fileName}`);
  }
}

// Types for the new structure
export type FinancialProfileRequest = {
  questionsAndAnswers: QuestionAnswer[];
};

export type QuestionAnswer = {
  questionId: number;
  question: string;
  answer: string;
};

export type AssistantResponse = {
  profile: {
    name: string;
    confidence: number;
    alternative_profiles: string;
  };
  analysis: {
    key_insights: string;
    risk_tolerance: 'נמוך' | 'בינוני' | 'גבוה';
    investment_horizon: 'קצר' | 'בינוני' | 'ארוך טווח';
    financial_goals: string;
  };
  explanation: {
    profile_match: string;
    practical_implications: string;
    advantages: string;
    considerations: string;
  };
  recommendations: {
    immediate_actions: {
      title: string;
      description: string;
      priority?: 'גבוה' | 'בינוני' | 'נמוך';
      timeline: string;
    };
    long_term_strategy: {
      title: string;
      description: string;
      timeline: string;
    };
    investment_approach: {
      asset_allocation: string;
      risk_management: string;
      diversification: string;
    };
  };
  reasoning: {
    answer_analysis: string;
    profile_comparison: string;
    key_factors: string;
  };
};

// Main function to analyze financial profile with thread management
export async function analyzeFinancialProfile(request: FinancialProfileRequest): Promise<AssistantResponse> {
  try {
    // Always create a new thread for each analysis (as requested)
    const threadId = await createThread();
    console.log('Created new thread:', threadId);

    // Format the questions and answers into a structured message
    const questionsAndAnswersText = request.questionsAndAnswers
      .map((qa) => `שאלה ${qa.questionId}: ${qa.question}\nתשובה: ${qa.answer}`)
      .join('\n\n');

    const userMessage = `אלו השאלות והתשובות המתאימות מהמשתמש לשאלון הפיננסי:

${questionsAndAnswersText}

אנא בצע ניתוח מעמיק והחזר את התוצאה בפורמט JSON כפי שהוגדר בהוראות.`;

    // Add the message to the thread
    await addMessageToThread(threadId, userMessage);

    // Run the assistant
    const runId = await runAssistant(threadId);
    console.log('Started assistant run:', runId);

    // Wait for the run to complete
    let runStatus = 'queued';
    let attempts = 0;
    const maxAttempts = 60; // 5 minutes with 5-second intervals
    
    console.log('Waiting for assistant run to complete...');
    
    while (runStatus !== 'completed' && attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds
      
      try {
        const run = await openai.beta.threads.runs.retrieve(runId, { thread_id: threadId });
        runStatus = run.status;
        console.log(`Run status (attempt ${attempts + 1}/${maxAttempts}): ${runStatus}`);
        
        if (runStatus === 'failed') {
          const errorMessage = run.last_error?.message || 'Unknown error';
          console.error('Assistant run failed:', run.last_error);
          throw new Error(`Assistant run failed: ${errorMessage}`);
        }
        
        if (runStatus === 'cancelled') {
          throw new Error('Assistant run was cancelled');
        }
        
        if (runStatus === 'expired') {
          throw new Error('Assistant run expired');
        }
        
        if (runStatus === 'requires_action') {
          console.log('Run requires action, waiting for completion...');
        }
        
      } catch (error) {
        console.error('Error checking run status:', error);
        throw new Error('Failed to check run status');
      }
      
      attempts++;
    }
    
    if (runStatus !== 'completed') {
      throw new Error(`Assistant run did not complete within expected time. Final status: ${runStatus}`);
    }
    
    console.log('Assistant run completed successfully!');

    // Get the messages after the run is completed
    const messages = await getThreadMessages(threadId);
    console.log(`Retrieved ${messages.length} messages from thread`);
    
    const assistantMessage = messages.find(msg => msg.role === 'assistant');
    
    if (!assistantMessage) {
      console.error('No assistant message found in thread. All messages:', messages.map(m => ({ role: m.role, contentLength: m.content.length })));
      throw new Error('No assistant response found in thread');
    }
    
    if (!assistantMessage.content || assistantMessage.content.length === 0) {
      console.error('Assistant message has no content:', assistantMessage);
      throw new Error('Assistant message has no content');
    }
    
    if (assistantMessage.content[0].type !== 'text') {
      console.error('Assistant message content is not text:', assistantMessage.content[0]);
      throw new Error('Assistant response is not in text format');
    }

    const responseText = assistantMessage.content[0].text.value;
    console.log('Assistant response:', responseText);
    
    // Parse the JSON response
    try {
      const response = JSON.parse(responseText) as AssistantResponse;
      
      // Validate that all required fields are present
      if (!response.profile?.name || !response.explanation?.profile_match || 
          !response.recommendations?.immediate_actions || !response.reasoning?.answer_analysis) {
        console.error('Response missing required fields:', response);
        throw new Error('Assistant response is missing required fields');
      }
      
      console.log('Successfully parsed assistant response');
      return response;
    } catch (parseError) {
      console.error('Failed to parse assistant response as JSON');
      console.error('Original response:', responseText);
      console.error('Parse error:', parseError);
      
      throw new Error('Invalid response format from assistant - expected valid JSON');
    }

  } catch (error) {
    console.error('Error in analyzeFinancialProfile:', error);
    throw error;
  }
} 