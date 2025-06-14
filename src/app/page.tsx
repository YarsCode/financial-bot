'use client';

import { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '@/components/chat/ChatMessage';
import { ChatInput } from '@/components/chat/ChatInput';
import { ProgressBar } from '@/components/chat/ProgressBar';
import { QUESTIONS } from '@/lib/constants';
import { Answer, ChatMessage as ChatMessageType } from '@/lib/types';

export default function Home() {
  const [messages, setMessages] = useState<ChatMessageType[]>([
    { type: 'bot', content: 'שלום! אני כאן כדי לעזור לך להבין את הפרופיל הפיננסי שלך. בוא נתחיל?' },
    { type: 'bot', content: QUESTIONS[0].text }
  ]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [showEmailInput, setShowEmailInput] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const chatInputRef = useRef<{ focus: () => void }>(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      const scrollOptions = {
        behavior: 'smooth' as ScrollBehavior,
        block: 'end' as ScrollLogicalPosition,
      };
      messagesEndRef.current.scrollIntoView(scrollOptions);
    }
  }, [messages]);

  useEffect(() => {
    // Focus input after bot messages, but only if we're not showing options
    const lastMessage = messages[messages.length - 1];
    if (lastMessage?.type === 'bot' && !QUESTIONS[currentQuestion]?.options) {
      chatInputRef.current?.focus();
    }
  }, [messages, currentQuestion]);

  const handleAnswer = async (answer: string) => {
    setIsLoading(true);
    setMessages(prev => [...prev, { type: 'user', content: answer }]);
    setAnswers(prev => [...prev, { questionId: currentQuestion + 1, answer }]);

    if (currentQuestion < QUESTIONS.length - 1) {
      setCurrentQuestion(prev => prev + 1);
      setTimeout(() => {
        setMessages(prev => [
          ...prev,
          { type: 'bot', content: QUESTIONS[currentQuestion + 1].text }
        ]);
        setIsLoading(false);
      }, 1000);
    } else {
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
          { type: 'bot' as const, content: profile.description },
          { type: 'bot' as const, content: 'המלצות:' },
          ...(profile.recommendations || []).map((rec: string) => ({ type: 'bot' as const, content: `• ${rec}` })),
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

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-4 md:p-24">
      <div className="w-full max-w-2xl">
        <ProgressBar current={currentQuestion + 1} total={QUESTIONS.length} />
        <div
          className="mt-4 space-y-4 overflow-y-auto scroll-smooth-fast"
          style={{ maxHeight: 400 }}
          ref={chatContainerRef}
        >
          {messages.map((message, index) => (
            <ChatMessage
              key={index}
              message={message}
            />
          ))}
          <div ref={messagesEndRef} />
        </div>
        {!showEmailInput ? (
          <ChatInput
            ref={chatInputRef}
            onSend={handleAnswer}
            isLoading={isLoading}
            options={QUESTIONS[currentQuestion].options}
          />
        ) : (
          <form onSubmit={handleEmailSubmit} className="mt-4">
            <div className="flex gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="הכנס את כתובת המייל שלך"
                className="flex-1 p-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors duration-200"
              >
                שלח
              </button>
            </div>
          </form>
        )}
      </div>
    </main>
  );
}
