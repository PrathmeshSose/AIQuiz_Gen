
import { config } from 'dotenv';
config();

import '@/ai/flows/summarize-content.ts';
import '@/ai/flows/generate-quiz-questions.ts';
import '@/ai/flows/extract-text-from-pdf-flow.ts';
import '@/ai/flows/extract-content-from-url-flow.ts';
