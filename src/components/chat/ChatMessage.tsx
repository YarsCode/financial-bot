import { ChatMessage as ChatMessageType } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';

interface ChatMessageProps {
  message: ChatMessageType;
}

export function ChatMessage({ message }: ChatMessageProps) {
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