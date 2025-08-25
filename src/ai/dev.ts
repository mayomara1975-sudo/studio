import { config } from 'dotenv';
config();

import '@/ai/flows/generate-quiz-questions.ts';
import '@/ai/flows/analyze-proficiency-level.ts';
import '@/ai/flows/provide-automated-feedback.ts';
import '@/ai/flows/correct-user-text.ts';
import '@/ai/flows/text-to-speech.ts';
