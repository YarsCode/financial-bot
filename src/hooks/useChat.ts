import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { type Message, type ChatState } from '@/types';
import { CHAT_CONFIG, LOCAL_STORAGE_KEYS } from '@/constants';
import { validateMessage, sanitizeInput } from '@/utils';

interface ChatStore extends ChatState {
  addMessage: (content: string, role: 'user' | 'assistant') => void;
  clearMessages: () => void;
  setError: (error: string | null) => void;
  setIsLoading: (isLoading: boolean) => void;
}

export const useChat = create<ChatStore>()(
  persist(
    (set) => ({
      messages: [],
      isLoading: false,
      error: null,

      addMessage: (content: string, role: 'user' | 'assistant') => {
        const sanitizedContent = sanitizeInput(content);
        if (!validateMessage(sanitizedContent)) {
          set({ error: 'Invalid message content' });
          return;
        }

        set((state) => {
          const newMessage: Message = {
            id: crypto.randomUUID(),
            content: sanitizedContent,
            role,
            timestamp: new Date(),
          };

          const updatedMessages = [...state.messages, newMessage].slice(
            -CHAT_CONFIG.MAX_MESSAGES
          );

          return { messages: updatedMessages, error: null };
        });
      },

      clearMessages: () => set({ messages: [], error: null }),

      setError: (error: string | null) => set({ error }),

      setIsLoading: (isLoading: boolean) => set({ isLoading }),
    }),
    {
      name: LOCAL_STORAGE_KEYS.CHAT_HISTORY,
      partialize: (state) => ({ messages: state.messages }),
    }
  )
); 