import { useState, forwardRef, useImperativeHandle, useRef } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';

interface ChatInputProps {
  onSend: (message: string) => void;
  isLoading?: boolean;
  options?: string[];
}

export const ChatInput = forwardRef<{ focus: () => void }, ChatInputProps>(
  ({ onSend, isLoading, options }, ref) => {
    const [input, setInput] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);

    useImperativeHandle(ref, () => ({
      focus: () => {
        inputRef.current?.focus();
      }
    }));

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (input.trim() && !isLoading) {
        onSend(input.trim());
        setInput('');
      }
    };

    if (options) {
      return (
        <div className="flex flex-wrap gap-2 mt-4">
          {options.map((option) => (
            <Button
              key={option}
              onClick={() => onSend(option)}
              disabled={isLoading}
              variant="secondary"
            >
              {option}
            </Button>
          ))}
        </div>
      );
    }

    return (
      <form onSubmit={handleSubmit} className="mt-4">
        <Card className="p-4">
          <div className="flex gap-2">
            <Input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isLoading}
              placeholder="הקלד את תשובתך..."
              className="flex-1"
            />
            <Button
              type="submit"
              disabled={isLoading || !input.trim()}
              variant="default"
            >
              שלח
            </Button>
          </div>
        </Card>
      </form>
    );
  }
); 