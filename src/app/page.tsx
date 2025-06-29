'use client';

import { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '@/components/chat/ChatMessage';
import { ChatInput } from '@/components/chat/ChatInput';
import { ProgressBar } from '@/components/chat/ProgressBar';
import { Button } from '@/components/ui/button';
import { QUESTIONS, initializeQuestions, QUESTIONS_ERROR } from '@/lib/constants';
import { ChatMessage as ChatMessageType, Question } from '@/lib/types';
import { QuestionAnswer } from '@/services/openai';

export default function Home() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [questionsAndAnswers, setQuestionsAndAnswers] = useState<QuestionAnswer[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingProfile, setIsGeneratingProfile] = useState(false);
  const [email, setEmail] = useState('');
  const [showEmailInput, setShowEmailInput] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [hasStartedQuestions, setHasStartedQuestions] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const chatInputRef = useRef<{ focus: () => void }>(null);

  // Initialize questions from DOCX file
  useEffect(() => {
    const initQuestions = async () => {
      try {
        await initializeQuestions();
        setQuestions(QUESTIONS);
        setIsInitialized(true);
        setHasError(false);
        if (QUESTIONS.length > 0) {
          setMessages([
            { type: 'bot', content: 'היי,\nאני FUTURE.AI והמטרה שלי היא להוביל אותך להפסיק לפחד מכסף ולחיות בשלווה כלכלית.' },
            { type: 'bot', content: 'אני הולך לשאול אותך מספר שאלות, כדי להכיר אותך יותר טוב ולעזור לך לתכנן את החיים העשירים שתמיד חלמת לחיות ולבנות תיק השקעות מגוון.' },
            { type: 'bot', content: 'שנתחיל?' }
          ]);
        }
      } catch (e) {
        setIsInitialized(true);
        setHasError(true);
        setMessages([
          { type: 'error', content: QUESTIONS_ERROR || 'מצטערים, אירעה שגיאה בטעינת השאלות. אנא נסו שוב מאוחר יותר.' }
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
    // Focus input after bot messages, but only if we're not showing options and questions have started
    const lastMessage = messages[messages.length - 1];
    if (lastMessage?.type === 'bot' && hasStartedQuestions && questions[currentQuestion]?.type !== 'multiple') {
      chatInputRef.current?.focus();
    }
  }, [messages, currentQuestion, questions, hasStartedQuestions]);

  const handleStartQuestions = () => {
    setHasStartedQuestions(true);
    setMessages(prev => [...prev, { type: 'user', content: 'יאללה!' }]);
    setTimeout(() => {
      setMessages(prev => [...prev, { type: 'bot', content: QUESTIONS[0].text }]);
    }, 1000);
  };

  const handleAnswer = async (answer: string) => {
    if (!isInitialized || questions.length === 0 || !hasStartedQuestions) return;
    
    setIsLoading(true);
    setMessages(prev => [...prev, { type: 'user', content: answer }]);
    
    // Create the question-answer pair
    const currentQuestionData = questions[currentQuestion];
    const questionAnswer: QuestionAnswer = {
      questionId: currentQuestion + 1,
      question: currentQuestionData.text,
      answer: answer
    };
    
    setQuestionsAndAnswers(prev => [...prev, questionAnswer]);

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
          body: JSON.stringify({ questionsAndAnswers: [...questionsAndAnswers, questionAnswer] }),
        });
        const profile = await res.json();
        if (profile.error) throw new Error(profile.error);
        const newMessages: ChatMessageType[] = [
          { type: 'bot' as const, content: `הפרופיל הפיננסי שלך הוא: ${profile.profile.name}` },
          { type: 'bot' as const, content: profile.explanation.profile_match },
          { type: 'bot' as const, content: `המלצה מיידית:\n• ${profile.recommendations.immediate_actions.title}: ${profile.recommendations.immediate_actions.description}` },
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
    console.log('Sending data to webhook:', { questionsAndAnswers, email });
    setMessages(prev => [...prev, 
      { type: 'user', content: email },
      { type: 'bot', content: 'תודה! נציג שלנו יצור איתך קשר בהקדם.' }
    ]);
  };

  if (!isInitialized) {
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
        {!hasError && hasStartedQuestions && <ProgressBar current={currentQuestion + 1} total={questions.length} />}
        
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
          
          {/* Start Questions Button */}
          {!hasStartedQuestions && messages.length === 3 && !hasError && (
            <div className="flex justify-center mt-4">
              <Button
                onClick={handleStartQuestions}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-10 rounded-md text-lg shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-300 animate-in fade-in slide-in-from-bottom-4 duration-700 cursor-pointer"
                size="lg"
              >
                יאללה!
              </Button>
            </div>
          )}
          
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
          {!showEmailInput && hasStartedQuestions && questions[currentQuestion]?.type === 'multiple' && 
           messages.some(msg => msg.type === 'bot' && msg.content === questions[currentQuestion]?.text) && (
            <ChatInput
              ref={chatInputRef}
              onSend={handleAnswer}
              isLoading={isLoading}
              options={questions[currentQuestion]?.options}
              inputType={questions[currentQuestion]?.type}
              disabled={hasError}
            />
          )}
          
          <div ref={messagesEndRef} />
        </div>
        
        {!showEmailInput && hasStartedQuestions && questions[currentQuestion]?.type !== 'multiple' ? (
          <ChatInput
            ref={chatInputRef}
            onSend={handleAnswer}
            isLoading={isLoading}
            options={questions[currentQuestion]?.options}
            inputType={questions[currentQuestion]?.type}
            disabled={hasError}
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
