import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';
import { getGoogleApiKeyForPlugin } from './apiKeyHolder';

export const ai = genkit({
  plugins: [
    googleAI({
      apiKey: getGoogleApiKeyForPlugin, // Pass the function reference
    }),
  ],
  model: 'googleai/gemini-2.0-flash', // Default model
});
