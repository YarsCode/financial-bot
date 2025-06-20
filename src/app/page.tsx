'use client';

import { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '@/components/chat/ChatMessage';
import { ChatInput } from '@/components/chat/ChatInput';
import { ProgressBar } from '@/components/chat/ProgressBar';
import { QUESTIONS, initializeQuestions } from '@/lib/constants';
import { Answer, ChatMessage as ChatMessageType, Question } from '@/lib/types';

export default function Home() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingProfile, setIsGeneratingProfile] = useState(false);
  const [email, setEmail] = useState('');
  const [showEmailInput, setShowEmailInput] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const chatInputRef = useRef<{ focus: () => void }>(null);

  // Initialize questions from DOCX file
  useEffect(() => {
    const initQuestions = async () => {
      await initializeQuestions();
      setQuestions(QUESTIONS);
      setIsInitialized(true);
      
      // Set initial messages after questions are loaded
      if (QUESTIONS.length > 0) {
        setMessages([
          { type: 'bot', content: 'שלום! אני כאן כדי לעזור לך להבין את הפרופיל הפיננסי שלך. בוא נתחיל?' },
          { type: 'bot', content: QUESTIONS[0].text }
        ]);
      }
    };
    
    initQuestions();
  }, []);

  useEffect(() => {
    // debugger;
    // Only scroll if the last message is from the bot (not from user)
    const lastMessage = messages[messages.length - 1];
    if (lastMessage?.type === 'bot' && chatContainerRef.current) {
      // Use setTimeout to ensure DOM has fully updated before scrolling
      setTimeout(() => {
        if (chatContainerRef.current) {
          // Smooth scroll to the absolute bottom of the chat container
          chatContainerRef.current.scrollTo({
            top: chatContainerRef.current.scrollHeight,
            behavior: 'smooth'
          });
        }
      }, 0);
    }
  }, [messages]);

  useEffect(() => {
    // Focus input after bot messages, but only if we're not showing options
    const lastMessage = messages[messages.length - 1];
    if (lastMessage?.type === 'bot' && questions[currentQuestion]?.type !== 'multiple') {
      chatInputRef.current?.focus();
    }
  }, [messages, currentQuestion, questions]);

  const handleAnswer = async (answer: string) => {
    if (!isInitialized || questions.length === 0) return;
    
    setIsLoading(true);
    setMessages(prev => [...prev, { type: 'user', content: answer }]);
    setAnswers(prev => [...prev, { questionId: currentQuestion + 1, answer }]);

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
      setTimeout(() => {
        setMessages(prev => [
          ...prev,
          { type: 'bot', content: questions[currentQuestion + 1].text }
        ]);
        setIsLoading(false);
      }, 1000);
    } else {
      setIsGeneratingProfile(true);
      try {
        const res = await fetch('/api/financial-profile', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ answers: [...answers, { questionId: currentQuestion + 1, answer }] }),
        });
        const profile = await res.json();
        if (profile.error) throw new Error(profile.error);
        const newMessages: ChatMessageType[] = [
          { type: 'bot' as const, content: `הפרופיל הפיננסי שלך הוא: ${profile.profile}` },
          { type: 'bot' as const, content: profile.explanation },
          { type: 'bot' as const, content: `המלצות:\n${(profile.recommendations || []).map((rec: string) => `• ${rec}`).join('\n')}` },
          { type: 'bot' as const, content: 'אנא הזן את כתובת המייל שלך כדי שנציג שלנו יוכל ליצור איתך קשר:' }
        ];
        setMessages(prev => [
          ...prev,
          ...newMessages.filter(msg => msg.content && msg.content.trim() !== '')
        ]);
        setShowEmailInput(true);
      } catch {
        setMessages(prev => [...prev, { 
          type: 'bot', 
          content: 'מצטערים, אירעה שגיאה. אנא נסו שוב מאוחר יותר.' 
        }]);
      }
      setIsLoading(false);
      setIsGeneratingProfile(false);
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    // Here you would typically send the data to your webhook
    console.log('Sending data to webhook:', { answers, email });
    setMessages(prev => [...prev, 
      { type: 'user', content: email },
      { type: 'bot', content: 'תודה! נציג שלנו יצור איתך קשר בהקדם.' }
    ]);
  };

  if (!isInitialized || questions.length === 0) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-4 md:p-24" dir="rtl">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg font-medium">טוען שאלות...</p>
          <p className="text-gray-500 text-sm mt-2">אנא המתן</p>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-4 md:p-24" dir="rtl">
      <div className="w-full max-w-2xl">
        <ProgressBar current={currentQuestion + 1} total={questions.length} />
        
        <div
          className="mt-4 space-y-4 overflow-y-auto bg-white rounded-xl border border-gray-200 p-4"
          style={{ maxHeight: 700 }}
          ref={chatContainerRef}
        >
          {messages.map((message, index) => (
            <ChatMessage
              key={index}
              message={message}
            />
          ))}
          
          {/* AI Response Loader */}
          {isLoading && (
            <div className="flex items-center space-x-reverse p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
              <div className="text-sm text-gray-600 mr-3">
                {isGeneratingProfile ? (
                  <>
                    <p className="font-medium">מסיק מסקנות ומעבד את התשובות...</p>
                    <p className="text-xs text-gray-500">מייצר עבורך מסקנה מפורטת</p>
                  </>
                ) : (
                  <>
                    <p className="font-medium">מעבד את התשובה שלך...</p>
                    <p className="text-xs text-gray-500">אנא המתן</p>
                  </>
                )}
              </div>
            </div>
          )}
          
          {/* Choices are now inside the chat container */}
          {!showEmailInput && questions[currentQuestion]?.type === 'multiple' && (
            <ChatInput
              ref={chatInputRef}
              onSend={handleAnswer}
              isLoading={isLoading}
              options={questions[currentQuestion]?.options}
              inputType={questions[currentQuestion]?.type}
            />
          )}
          
          <div ref={messagesEndRef} />
        </div>
        
        {!showEmailInput && questions[currentQuestion]?.type !== 'multiple' ? (
          <ChatInput
            ref={chatInputRef}
            onSend={handleAnswer}
            isLoading={isLoading}
            options={questions[currentQuestion]?.options}
            inputType={questions[currentQuestion]?.type}
          />
        ) : showEmailInput ? (
          <form onSubmit={handleEmailSubmit} className="mt-4" dir="rtl">
            <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
              <div className="text-sm text-gray-600 mb-3 text-right">
                הזן את כתובת המייל שלך:
              </div>
              <div className="flex gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="הכנס את כתובת המייל שלך"
                  className="flex-1 p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 hover:border-green-300 hover:shadow-sm"
                  style={{
                    direction: 'rtl',
                    textAlign: 'right'
                  }}
                  required
                />
                <button
                  type="submit"
                  className="px-6 py-3 rounded-lg bg-green-500 text-white hover:bg-green-600 transition-all duration-200 hover:shadow-md hover:scale-105 active:scale-95 font-medium"
                >
                  שלח
                </button>
              </div>
            </div>
          </form>
        ) : null}
      </div>
    </main>
  );
}
