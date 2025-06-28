import { NextRequest, NextResponse } from 'next/server';
import {
  createThread,
  addMessageToThread,
  runAssistant,
  getThreadMessages,
  checkRunCompletion,
} from '@/services/openai';

export async function POST(req: NextRequest) {
  try {
    const { message, threadId } = await req.json();
    
    if (!process.env.OPENAI_API_KEY) {
      console.error('OPENAI_API_KEY is missing');
      return NextResponse.json({ error: 'Missing OpenAI API key' }, { status: 500 });
    }
    
    if (!message || typeof message !== 'string') {
      console.error('Invalid or missing message:', message);
      return NextResponse.json({ error: 'Invalid message' }, { status: 400 });
    }

    // Create or use existing thread
    const currentThreadId = threadId || await createThread();
    
    // Add user message to thread
    await addMessageToThread(currentThreadId, message);
    
    // Run the assistant
    const runId = await runAssistant(currentThreadId);
    
    // Wait for the run to complete
    const isCompleted = await checkRunCompletion(currentThreadId, runId);
    if (!isCompleted) {
      throw new Error('Assistant run did not complete in time');
    }
    
    // Get the assistant's response
    const messages = await getThreadMessages(currentThreadId);
    
    // Find the latest assistant message
    const assistantMessages = messages.filter(msg => msg.role === 'assistant');
    const latestAssistantMessage = assistantMessages[assistantMessages.length - 1];
    
    if (!latestAssistantMessage) {
      throw new Error('No response from assistant');
    }
    
    // Check if content array is empty
    if (!latestAssistantMessage.content || latestAssistantMessage.content.length === 0) {
      throw new Error('Assistant response is empty - the run may not have completed properly');
    }
    
    // Extract the text content from the message
    const textContent = latestAssistantMessage.content.find(content => content.type === 'text');
    if (!textContent || textContent.type !== 'text') {
      throw new Error('No valid text response from assistant');
    }
    
    const content = textContent.text.value;
    if (!content) {
      throw new Error('No content received from assistant');
    }

    // Return the response and thread ID
    return NextResponse.json({
      message: content,
      threadId: currentThreadId
    });
  } catch (error) {
    console.error('Chat API route error:', error);
    return NextResponse.json(
      { error: 'Failed to process chat message', details: String(error) },
      { status: 500 }
    );
  }
} 