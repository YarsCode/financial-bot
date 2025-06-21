import { useState, forwardRef, useImperativeHandle, useRef } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';

interface ChatInputProps {
  onSend: (message: string) => void;
  isLoading?: boolean;
  options?: string[];
  inputType?: 'text' | 'number' | 'multiple';
}

export const ChatInput = forwardRef<{ focus: () => void }, ChatInputProps>(
  ({ onSend, isLoading, options, inputType = 'text' }, ref) => {
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

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      
      // For number input, only allow numbers
      if (inputType === 'number') {
        const numericValue = value.replace(/[^0-9]/g, '');
        setInput(numericValue);
      } else {
        setInput(value);
      }
    };

    if (options && inputType === 'multiple') {
      return (
        <div className="space-y-3" dir="rtl">
          <div className="text-sm text-gray-600 mb-3 text-right">
            בחר את התשובה המתאימה:
          </div>
          <div className="grid gap-3">
            {options.map((option, index) => (
              <button
                key={option}
                onClick={() => onSend(option)}
                disabled={isLoading}
                className={cn(
                  "w-full p-4 text-right rounded-xl border-2 transition-all duration-200",
                  "bg-white hover:bg-blue-50 hover:border-blue-300 hover:shadow-md",
                  "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
                  "disabled:opacity-50 disabled:cursor-not-allowed",
                  "transform hover:scale-[1.02] active:scale-[0.98]",
                  "relative overflow-hidden group",
                  "cursor-pointer"
                )}
                style={{
                  direction: 'rtl'
                }}
              >
                {/* Background gradient on hover */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-indigo-50 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                
                {/* Content */}
                <div className="relative z-10 flex items-center justify-between">
                  {/* Number badge - positioned at far right (visually left in RTL) */}
                  <div className={cn(
                    "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold",
                    "bg-blue-100 text-blue-700 group-hover:bg-blue-200 transition-colors duration-200"
                  )}>
                    {index + 1}
                  </div>
                  
                  {/* Option text */}
                  <span className="text-gray-800 font-medium group-hover:text-blue-900 transition-colors duration-200 flex-1 text-right mr-2">
                    {option}
                  </span>
                  
                  {/* Arrow indicator - positioned at far left (visually right in RTL) */}
                  <div className="flex-shrink-0 text-gray-400 group-hover:text-blue-500 transition-colors duration-200">
                    <svg className="w-5 h-5 transform group-hover:-translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      );
    }

    return (
      <form onSubmit={handleSubmit} className="mt-4" dir="rtl">
        <Card className="p-4 hover:shadow-lg transition-shadow duration-200 border-2 hover:border-blue-300">
          <div className="flex gap-2">
            <Input
              ref={inputRef}
              type={inputType === 'number' ? 'number' : 'text'}
              value={input}
              onChange={handleInputChange}
              disabled={isLoading}
              placeholder={
                inputType === 'number' 
                  ? 'הכנס מספר...' 
                  : 'הקלד את תשובתך...'
              }
              className={cn(
                "flex-1 transition-all duration-200",
                "hover:border-blue-300 focus:border-blue-500",
                "hover:shadow-sm focus:shadow-md",
                "transform hover:scale-[1.01] focus:scale-[1.01]"
              )}
              style={{
                direction: 'rtl',
                textAlign: 'right'
              }}
              min={inputType === 'number' ? 0 : undefined}
              step={inputType === 'number' ? 1 : undefined}
            />
            <Button
              type="submit"
              disabled={isLoading || !input.trim()}
              variant="default"
              className={cn(
                "transition-all duration-200",
                "hover:scale-105 active:scale-95",
                "hover:shadow-md focus:shadow-lg"
              )}
            >
              שלח
            </Button>
          </div>
        </Card>
      </form>
    );
  }
); 