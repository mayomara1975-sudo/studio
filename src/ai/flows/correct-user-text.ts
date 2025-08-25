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
  feedback: z.string().describe('AI-generated feedback and corrections for the user text.'),
});
export type CorrectUserTextOutput = z.infer<typeof CorrectUserTextOutputSchema>;

export async function correctUserText(input: CorrectUserTextInput): Promise<CorrectUserTextOutput> {
  return correctUserTextFlow(input);
}

const prompt = ai.definePrompt({
  name: 'correctUserTextPrompt',
  input: {schema: CorrectUserTextInputSchema},
  output: {schema: CorrectUserTextOutputSchema},
  prompt: `You are an AI-powered grammar and style correction tool. Please correct the following text and provide feedback.

Text: {{{text}}}

Corrected Text:`,
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
