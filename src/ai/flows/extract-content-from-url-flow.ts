
'use server';
/**
 * @fileOverview Extracts text content from a given URL.
 *
 * - extractContentFromUrl - A function that handles URL content extraction.
 * - ExtractContentFromUrlInput - The input type for the extractContentFromUrl function.
 * - ExtractContentFromUrlOutput - The return type for the extractContentFromUrl function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExtractContentFromUrlInputSchema = z.object({
  url: z.string().url().describe('The URL to extract content from.'),
});
export type ExtractContentFromUrlInput = z.infer<typeof ExtractContentFromUrlInputSchema>;

const ExtractContentFromUrlOutputSchema = z.object({
  extractedText: z.string().describe('The text extracted from the URL.'),
});
export type ExtractContentFromUrlOutput = z.infer<typeof ExtractContentFromUrlOutputSchema>;

export async function extractContentFromUrl(input: ExtractContentFromUrlInput): Promise<ExtractContentFromUrlOutput> {
  return extractContentFromUrlFlow(input);
}

const prompt = ai.definePrompt({
  name: 'extractContentFromUrlPrompt',
  input: {schema: z.object({ fetchedContent: z.string() })},
  output: {schema: ExtractContentFromUrlOutputSchema},
  prompt: `You are an expert web content extractor. Extract the main readable text content from the following fetched page content. Ignore navigation, ads, footers, and other non-essential elements. Focus on the primary article or body text.

Fetched Content:
{{{fetchedContent}}}

Return the extracted text. The output should be a JSON object with a single key "extractedText" containing the extracted text.`,
});

const extractContentFromUrlFlow = ai.defineFlow(
  {
    name: 'extractContentFromUrlFlow',
    inputSchema: ExtractContentFromUrlInputSchema,
    outputSchema: ExtractContentFromUrlOutputSchema,
  },
  async (input) => {
    let fetchedContent = '';
    try {
      const response = await fetch(input.url, { headers: { 'User-Agent': 'QuizifyAI/1.0' } });
      if (!response.ok) {
        console.error(`Failed to fetch URL: ${input.url}, Status: ${response.status}`);
        // Try to get error message from response body if available
        let errorBody = '';
        try {
            errorBody = await response.text();
        } catch (e) {
            // ignore if can't read body
        }
        return { extractedText: `Error: Could not fetch content from URL. Status: ${response.status}. ${errorBody}` };
      }
      fetchedContent = await response.text();
    } catch (error: any) {
      console.error('Error fetching URL content:', error);
      return { extractedText: `Error: Could not fetch content from URL. ${error.message || 'Network error'}` };
    }

    if (!fetchedContent.trim()) {
        return { extractedText: 'Error: Fetched content was empty.' };
    }

    try {
        const {output} = await prompt({ fetchedContent });
        if (!output) {
          console.error('URL content extraction failed to produce valid structured output from the model.');
          return { extractedText: 'Error: AI could not process the fetched content.' };
        }
        return output;
    } catch (modelError: any) {
        console.error('Error processing fetched content with AI model:', modelError);
        return { extractedText: `Error: AI processing failed. ${modelError.message || 'Model error'}` };
    }
  }
);
