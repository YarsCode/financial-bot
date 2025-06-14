// This file now only exports types for the OpenAI request payload.
import { Answer } from '@/lib/types';

export type FinancialProfileRequest = {
  answers: Answer[];
}; 