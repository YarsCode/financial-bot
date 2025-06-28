import { ChatMessage as ChatMessageType } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import { ReactNode } from 'react';

interface ChatMessageProps {
  message: ChatMessageType;
}

const ErrorIcon = () => (
  <svg
    className="w-5 h-5 text-red-500 flex-shrink-0"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    aria-hidden="true"
    focusable="false"
  >
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="#fee2e2" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01" />
  </svg>
);

export function ChatMessage({ message }: ChatMessageProps) {
  if (message.type === 'error') {
    return (
      <div className="flex items-start justify-start">
        <div className="flex items-center bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 mb-2 max-w-xs shadow-sm">
          <ErrorIcon />
          <span className="text-sm font-medium mr-2">{message.content}</span>
        </div>
      </div>
    );
  }
  return (
    <div
      className={cn(
        'flex w-full',
        message.type === 'user' ? 'justify-end' : 'justify-start'
      )}
      dir="rtl"
    >
      <Card
        className={cn(
          'max-w-[80%] p-4 transition-all duration-200',
          message.type === 'user'
            ? 'bg-primary text-primary-foreground'
            : 'bg-muted border-2'
        )}
      >
        <div 
          className="text-sm md:text-base text-right leading-relaxed" 
          dir="rtl"
          style={{
            direction: 'rtl',
            textAlign: 'right'
          }}
        >
          {message.content.split('\n').map((line, index) => {
            // Check if this line contains "המלצות" and format it
            if (line.includes('המלצות:')) {
              return (
                <div key={index} className="mb-2">
                  <span className="font-bold underline">{line}</span>
                  {index < message.content.split('\n').length - 1 && <br />}
                </div>
              );
            }
            // Add spacing for recommendation lines (lines starting with •)
            if (line.trim().startsWith('•')) {
              return (
                <div key={index} className="mb-1 flex gap-2">
                  <span className="text-blue-500 font-bold">◀</span>
                  <span>{line.substring(1)}</span>
                  {index < message.content.split('\n').length - 1 && <br />}
                </div>
              );
            }
            // Regular lines
            return (
              <div key={index}>
                {line}
                {index < message.content.split('\n').length - 1 && <br />}
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
} 