'use server';

/**
 * @fileOverview A quiz question generation AI agent.
 *
 * - generateQuizQuestions - A function that handles the quiz question generation process.
 * - GenerateQuizQuestionsInput - The input type for the generateQuizQuestions function.
 * - GenerateQuizQuestionsOutput - The return type for the generateQuizQuestions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateQuizQuestionsInputSchema = z.object({
  content: z.string().describe('The content to generate quiz questions from.'),
});
export type GenerateQuizQuestionsInput = z.infer<typeof GenerateQuizQuestionsInputSchema>;

const GenerateQuizQuestionsOutputSchema = z.object({
  questions: z.array(
    z.object({
      question: z.string().describe('The quiz question.'),
      options: z.array(z.string()).describe('The multiple-choice options.'),
      answer: z.string().describe('The correct answer.'),
    })
  ).describe('The generated quiz questions.'),
});
export type GenerateQuizQuestionsOutput = z.infer<typeof GenerateQuizQuestionsOutputSchema>;

export async function generateQuizQuestions(input: GenerateQuizQuestionsInput): Promise<GenerateQuizQuestionsOutput> {
  return generateQuizQuestionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateQuizQuestionsPrompt',
  input: {schema: GenerateQuizQuestionsInputSchema},
  output: {schema: GenerateQuizQuestionsOutputSchema},
  prompt: `You are an expert quiz creator. Given the following content, generate multiple-choice quiz questions with 4 options each, and indicate the correct answer.

Content: {{{content}}}

Format the output as a JSON array of objects, where each object has a "question" field, an "options" field (an array of strings), and an "answer" field (the correct answer).`,
});

const generateQuizQuestionsFlow = ai.defineFlow(
  {
    name: 'generateQuizQuestionsFlow',
    inputSchema: GenerateQuizQuestionsInputSchema,
    outputSchema: GenerateQuizQuestionsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input); // This line can throw errors like 503
    if (!output || !output.questions) {
      // Handles cases where the prompt resolves but output is empty/undefined or questions array is missing
      console.error('Quiz generation prompt returned no output, or output did not conform to schema.');
      return { questions: [] }; // Provide a default, schema-compliant response
    }
    return output;
  }
);
