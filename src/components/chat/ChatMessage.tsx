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
    >
      <Card
        className={cn(
          'max-w-[80%] p-4',
          message.type === 'user'
            ? 'bg-primary text-primary-foreground'
            : 'bg-muted'
        )}
      >
        <p className="text-sm md:text-base">{message.content}</p>
      </Card>
    </div>
  );
} 