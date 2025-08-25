'use server';

/**
 * @fileOverview This file defines a Genkit flow for providing automated feedback on language learner answers.
 *
 * - provideAutomatedFeedback - A function that takes a user's answer and provides feedback.
 * - ProvideAutomatedFeedbackInput - The input type for the provideAutomatedFeedback function.
 * - ProvideAutomatedFeedbackOutput - The return type for the provideAutomatedFeedback function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ProvideAutomatedFeedbackInputSchema = z.object({
  answer: z.string().describe('The user-provided answer to be evaluated.'),
  question: z.string().describe('The question the user was answering.'),
  level: z.string().describe('The proficiency level of the user (e.g., A1, B2).'),
});
export type ProvideAutomatedFeedbackInput = z.infer<
  typeof ProvideAutomatedFeedbackInputSchema
>;

const ProvideAutomatedFeedbackOutputSchema = z.object({
  feedback: z.string().describe('AI-generated feedback on the user\'s answer.'),
  correctedAnswer: z
    .string()
    .optional()
    .describe('The corrected version of the user\'s answer, if applicable.'),
});
export type ProvideAutomatedFeedbackOutput = z.infer<
  typeof ProvideAutomatedFeedbackOutputSchema
>;

export async function provideAutomatedFeedback(
  input: ProvideAutomatedFeedbackInput
): Promise<ProvideAutomatedFeedbackOutput> {
  return provideAutomatedFeedbackFlow(input);
}

const prompt = ai.definePrompt({
  name: 'provideAutomatedFeedbackPrompt',
  input: {schema: ProvideAutomatedFeedbackInputSchema},
  output: {schema: ProvideAutomatedFeedbackOutputSchema},
  prompt: `You are an AI language tutor providing feedback to a student. The student is at level {{{level}}}.

  Question: {{{question}}}
  Answer: {{{answer}}}

  Provide feedback to the student, highlighting any errors and suggesting improvements. If the answer contains errors, provide a corrected answer as well.
  Be concise and encouraging.
  Speak directly to the student.
  Do not refer to yourself.
  Feedback:
  `,
});

const provideAutomatedFeedbackFlow = ai.defineFlow(
  {
    name: 'provideAutomatedFeedbackFlow',
    inputSchema: ProvideAutomatedFeedbackInputSchema,
    outputSchema: ProvideAutomatedFeedbackOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
