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
  feedback: z.string().describe('AI-generated feedback on the user\'s answer. Must be extensive and in Spanish.'),
  correctedAnswer: z
    .string()
    .optional()
    .describe('The corrected version of the user\'s answer, if applicable. Must be in Spanish.'),
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
  prompt: `You are an AI language tutor. Your response MUST be in Spanish.

{{#ifCond question '==' 'Conversación abierta'}}
You are acting as a conversational chatbot. The user wants to practice their Spanish. Engage in a natural conversation with them.
User's message: {{{answer}}}
Respond naturally to continue the conversation.
{{else}}
You are providing feedback to a student. The student is at level {{{level}}}.

Question: {{{question}}}
Answer: {{{answer}}}

Provide extensive and detailed feedback to the student, highlighting any errors and suggesting improvements. If the answer contains errors, provide a corrected answer as well.
Be encouraging but thorough.
Speak directly to the student in Spanish.
Do not refer to yourself as an AI.
Feedback:
{{/ifCond}}
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
    
    // If it's open conversation, the corrected answer is the AI's response text.
    if (input.question === 'Conversación abierta' && output) {
        return {
            correctedAnswer: output.correctedText,
            feedback: output.feedback
        };
    }
    
    return output!;
  }
);
