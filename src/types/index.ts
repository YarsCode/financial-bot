export interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}

export interface ChatState {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
}

export interface ApiResponse<T> {
  data: T;
  error: string | null;
}

export type ApiError = {
  message: string;
  code: string;
  status: number;
};

export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface FinancialData {
  income: number;
  expenses: number;
  savings: number;
  investments: number;
  debt: number;
} 