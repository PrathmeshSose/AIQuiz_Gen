
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
  subject: z.string().optional().describe('The subject of the quiz (e.g., science, history). The quiz should focus on aspects of the content related to this subject.'),
  difficulty: z.enum(['easy', 'medium', 'hard']).optional().describe('The difficulty level of the quiz.'),
  numQuestions: z.number().int().positive().optional().describe('The desired number of questions. Generate as close to this number as possible.'),
  questionFormat: z.enum(['mcq', 'true_false']).optional().describe("The format of the questions. 'mcq' for multiple-choice (4 options), 'true_false' for True/False questions (options will be ['True', 'False'])."),
});
export type GenerateQuizQuestionsInput = z.infer<typeof GenerateQuizQuestionsInputSchema>;

const GenerateQuizQuestionsOutputSchema = z.object({
  questions: z.array(
    z.object({
      question: z.string().describe('The quiz question.'),
      options: z.array(z.string()).describe('The multiple-choice options (4 for mcq, ["True", "False"] for true_false).'),
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
  prompt: `You are an expert quiz creator. Given the following content, generate a quiz based on the specifications.

Content:
{{{content}}}

Quiz Specifications:
{{#if subject}}Subject Focus: {{{subject}}}{{/if}}
{{#if difficulty}}Difficulty: {{{difficulty}}}{{/if}}
{{#if numQuestions}}Target Number of Questions: {{{numQuestions}}} (Generate as close to this number as possible based on the content. If not specified, generate a suitable number, e.g., 5-10 questions if content allows.){{else}}Generate a suitable number of questions (e.g., 5-10) based on the content.{{/if}}
{{#if questionFormat}}Preferred Question Format: {{{questionFormat}}} (If 'mcq', provide 4 distinct multiple-choice options. If 'true_false', provide "True" and "False" as options. Default to 'mcq' if format is not specified or unclear.){{else}}Question Format: Default to multiple-choice (mcq) with 4 options.{{/if}}

For each question, you MUST provide:
- "question": The quiz question text.
- "options": An array of strings. For MCQs, this must be exactly 4 options. For True/False, this must be ["True", "False"].
- "answer": The correct answer string, which must be one of the provided options.

Format the output as a JSON array of objects, where each object adheres to the structure described above.
Example for MCQ: { "question": "What is 2+2?", "options": ["3", "4", "5", "6"], "answer": "4" }
Example for True/False: { "question": "Is the sky blue?", "options": ["True", "False"], "answer": "True" }
Ensure the options for MCQ are plausible distractors.
`,
});

const generateQuizQuestionsFlow = ai.defineFlow(
  {
    name: 'generateQuizQuestionsFlow',
    inputSchema: GenerateQuizQuestionsInputSchema,
    outputSchema: GenerateQuizQuestionsOutputSchema,
  },
  async input => {
    // Provide default for numQuestions if not specified, to guide the AI better.
    const effectiveInput = {
      ...input,
      numQuestions: input.numQuestions || 5, 
      questionFormat: input.questionFormat || 'mcq',
    };

    const {output} = await prompt(effectiveInput);
    if (!output || !output.questions) {
      console.error('Quiz generation prompt returned no output, or output did not conform to schema.');
      return { questions: [] }; 
    }
    return output;
  }
);
