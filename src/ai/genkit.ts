
import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

// The API key will now be sourced directly from the environment variable
// as configured in the googleAI plugin by default if no key is provided,
// or by explicitly passing process.env.GOOGLE_API_KEY.
// For development, ensure GOOGLE_API_KEY is set in your .env file.

export const ai = genkit({
  plugins: [
    googleAI({
      apiKey: process.env.GOOGLE_API_KEY, // Explicitly use the environment variable
    }),
  ],
  model: 'googleai/gemini-2.0-flash', // Default model
});
