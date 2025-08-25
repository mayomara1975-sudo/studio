'use server';

/**
 * @fileOverview A text correction AI agent.
 *
 * - correctUserText - A function that handles the text correction process.
 * - CorrectUserTextInput - The input type for the correctUserText function.
 * - CorrectUserTextOutput - The return type for the correctUserText function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CorrectUserTextInputSchema = z.object({
  text: z.string().describe('The text to be corrected.'),
});
export type CorrectUserTextInput = z.infer<typeof CorrectUserTextInputSchema>;

const CorrectUserTextOutputSchema = z.object({
  correctedText: z.string().describe('The corrected text with grammar and style improvements.'),
  feedback: z.string().describe('Detailed, constructive feedback explaining the corrections made and suggesting areas for improvement.'),
});
export type CorrectUserTextOutput = z.infer<typeof CorrectUserTextOutputSchema>;

export async function correctUserText(input: CorrectUserTextInput): Promise<CorrectUserTextOutput> {
  return correctUserTextFlow(input);
}

const prompt = ai.definePrompt({
  name: 'correctUserTextPrompt',
  input: {schema: CorrectUserTextInputSchema},
  output: {schema: CorrectUserTextOutputSchema},
  prompt: `You are an AI-powered Spanish language tutor. Correct the following text for grammar, spelling, and style. Provide clear, constructive feedback explaining the reasons for your corrections.

Text to correct:
{{{text}}}

Respond with the corrected text and detailed feedback.`,
});

const correctUserTextFlow = ai.defineFlow(
  {
    name: 'correctUserTextFlow',
    inputSchema: CorrectUserTextInputSchema,
    outputSchema: CorrectUserTextOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
