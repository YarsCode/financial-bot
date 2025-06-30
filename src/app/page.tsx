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
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [questionsAndAnswers, setQuestionsAndAnswers] = useState<QuestionAnswer[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingProfile, setIsGeneratingProfile] = useState(false);
  const [email, setEmail] = useState('');
  const [showEmailInput, setShowEmailInput] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [hasStartedQuestions, setHasStartedQuestions] = useState(false);
  const [userProfile, setUserProfile] = useState<string>('');
  const [showProfileMessage, setShowProfileMessage] = useState(false);
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
    if (lastMessage?.type === 'bot' && hasStartedQuestions && questions[currentQuestionIndex]?.type !== 'multiple') {
      chatInputRef.current?.focus();
    }
  }, [messages, currentQuestionIndex, questions, hasStartedQuestions]);

  const handleStartQuestions = () => {
    setHasStartedQuestions(true);
    setMessages(prev => [...prev, { type: 'user', content: 'יאללה!' }]);
    setTimeout(() => {
      setMessages(prev => [...prev, { type: 'bot', content: QUESTIONS[0].text }]);
    }, 1000);
  };

  // Function to determine if we've completed all s1 questions
  const hasCompletedS1Questions = (currentAnswers: QuestionAnswer[]) => {
    const s1Questions = questions.filter(q => q.section === 's1');
    const s1QuestionIds = s1Questions.map(q => q.id);
    const answeredS1Questions = currentAnswers.filter(qa => 
      s1QuestionIds.includes(questions[qa.questionId - 1]?.id || '')
    );
    return answeredS1Questions.length === s1Questions.length;
  };

  // Function to check if we've just completed the current s1 question
  const hasJustCompletedCurrentS1Question = (currentAnswers: QuestionAnswer[], currentQuestionId: string) => {
    const currentQuestion = questions.find(q => q.id === currentQuestionId);
    if (!currentQuestion || currentQuestion.section !== 's1') return false;
    
    // Check if this is the last s1 question we've answered
    const s1Questions = questions.filter(q => q.section === 's1');
    const s1QuestionIds = s1Questions.map(q => q.id);
    const answeredS1Questions = currentAnswers.filter(qa => 
      s1QuestionIds.includes(questions[qa.questionId - 1]?.id || '')
    );
    
    // If we've answered all s1 questions, we've just completed the current one
    return answeredS1Questions.length === s1Questions.length;
  };

  // Function to get the next s2 question index
  const getNextS2QuestionIndex = () => {
    const s2Questions = questions.filter(q => q.section === 's2');
    if (s2Questions.length === 0) return -1;
    return questions.findIndex(q => q.id === s2Questions[0].id);
  };

  // Function to determine user profile from s1 answers
  const determineUserProfile = async (s1Answers: QuestionAnswer[]) => {
    setIsGeneratingProfile(true);
    try {
      const res = await fetch('/api/financial-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questionsAndAnswers: s1Answers }),
      });
      const profile = await res.json();
      if (profile.error) throw new Error(profile.error);
      
      setUserProfile(profile.profile.name);
      return profile.profile.name;
    } catch (error) {
      console.error('Error determining profile:', error);
      setUserProfile('המאוזן'); // Default fallback
      return 'המאוזן';
    } finally {
      setIsGeneratingProfile(false);
    }
  };

  const handleAnswer = async (answer: string) => {
    if (!isInitialized || questions.length === 0 || !hasStartedQuestions) return;
    
    setIsLoading(true);
    setMessages(prev => [...prev, { type: 'user', content: answer }]);
    
    // Create the question-answer pair
    const currentQuestionData = questions[currentQuestionIndex];
    const questionAnswer: QuestionAnswer = {
      questionId: currentQuestionIndex + 1,
      question: currentQuestionData.text,
      answer: answer
    };
    
    const updatedAnswers = [...questionsAndAnswers, questionAnswer];
    setQuestionsAndAnswers(updatedAnswers);

    // Check if current question is the last question
    if (currentQuestionData.isLastQuestion) {
      // This was the last question, generate profile immediately
      generateProfile(updatedAnswers);
      return;
    }

    // Check if we've completed all s1 questions and need to determine profile
    if (currentQuestionData.section === 's1' && hasJustCompletedCurrentS1Question(updatedAnswers, currentQuestionData.id)) {
      // We've completed s1, determine profile and show transition message
      const profile = await determineUserProfile(updatedAnswers);
      
      const transitionMessage = `תודה ששיתפת אותי!
בהתאם לכל מה שסיפרת לי יצאת המשקיע/ה ה"${profile}" ובהתאם לכך הגדרתי מה רמת הסיכון שמתאימה לך, כדי שנוכל לבנות את תיק ההשקעות נצטרך להגדיר לאן את/ה רוצה להגיע.`;
      
      setMessages(prev => [...prev, { type: 'bot', content: transitionMessage }]);
      setShowProfileMessage(true);
      
      // Find the first s2 question
      const nextS2Index = getNextS2QuestionIndex();
      if (nextS2Index !== -1) {
        setCurrentQuestionIndex(nextS2Index);
        setTimeout(() => {
          setMessages(prev => [
            ...prev,
            { type: 'bot', content: questions[nextS2Index].text }
          ]);
          setIsLoading(false);
        }, 2000); // Give time for the transition message to be read
      } else {
        // No s2 questions, generate profile
        generateProfile(updatedAnswers);
      }
      return;
    }

    // Determine next question index
    let nextQuestionIndex = currentQuestionIndex + 1;

    // Check if this is a multiple choice question with next_question logic
    if (currentQuestionData.type === 'multiple' && currentQuestionData.options && currentQuestionData.nextQuestions) {
      const answerIndex = currentQuestionData.options.indexOf(answer);
      if (answerIndex !== -1) {
        const nextQuestionId = currentQuestionData.nextQuestions[answerIndex];
        
        // If next_question has a value, find that question by its ID
        if (nextQuestionId && nextQuestionId.trim() !== '') {
          // Find the question with the matching ID
          const targetQuestionIndex = questions.findIndex(q => q.id === nextQuestionId);
          if (targetQuestionIndex !== -1) {
            nextQuestionIndex = targetQuestionIndex;
          }
        }
        // If next_question is empty, continue with default (nextQuestionIndex = currentQuestionIndex + 1)
      }
    }

    // Check if the next question is marked as the last question
    const nextQuestion = questions[nextQuestionIndex];
    if (nextQuestion && nextQuestion.isLastQuestion) {
      // This is the last question, so after this we'll generate the profile
      setCurrentQuestionIndex(nextQuestionIndex);
      setTimeout(() => {
        setMessages(prev => [
          ...prev,
          { type: 'bot', content: nextQuestion.text }
        ]);
        setIsLoading(false);
      }, 1000);
    } else if (nextQuestionIndex < questions.length) {
      // Continue to next question
      setCurrentQuestionIndex(nextQuestionIndex);
      setTimeout(() => {
        setMessages(prev => [
          ...prev,
          { type: 'bot', content: questions[nextQuestionIndex].text }
        ]);
        setIsLoading(false);
      }, 1000);
    } else {
      // No more questions, generate profile
      generateProfile(updatedAnswers);
    }
  };

  const generateProfile = async (allAnswers: QuestionAnswer[]) => {
    setIsGeneratingProfile(true);
    try {
      const res = await fetch('/api/financial-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questionsAndAnswers: allAnswers }),
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
        {!hasError && hasStartedQuestions && <ProgressBar current={currentQuestionIndex + 1} total={questions.length} />}
        
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
          {!showEmailInput && hasStartedQuestions && questions[currentQuestionIndex]?.type === 'multiple' && 
           messages.some(msg => msg.type === 'bot' && msg.content === questions[currentQuestionIndex]?.text) && (
            <ChatInput
              ref={chatInputRef}
              onSend={handleAnswer}
              isLoading={isLoading}
              options={questions[currentQuestionIndex]?.options}
              inputType={questions[currentQuestionIndex]?.type}
              disabled={hasError}
            />
          )}
          
          <div ref={messagesEndRef} />
        </div>
        
        {!showEmailInput && hasStartedQuestions && questions[currentQuestionIndex]?.type !== 'multiple' ? (
          <ChatInput
            ref={chatInputRef}
            onSend={handleAnswer}
            isLoading={isLoading}
            options={questions[currentQuestionIndex]?.options}
            inputType={questions[currentQuestionIndex]?.type}
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
