'use server';

/**
 * @fileOverview This file defines a Genkit flow to analyze a user's quiz responses and assess their language proficiency level.
 *
 * - analyzeProficiencyLevel - A function that analyzes quiz responses and assesses language proficiency.
 * - AnalyzeProficiencyLevelInput - The input type for the analyzeProficiencyLevel function.
 * - AnalyzeProficiencyLevelOutput - The return type for the analyzeProficiencyLevel function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeProficiencyLevelInputSchema = z.object({
  quizResponses: z
    .string()
    .describe('A string containing the user\'s quiz responses.'),
});
export type AnalyzeProficiencyLevelInput = z.infer<
  typeof AnalyzeProficiencyLevelInputSchema
>;

const AnalyzeProficiencyLevelOutputSchema = z.object({
  proficiencyLevel: z
    .string()
    .describe(
      'The assessed language proficiency level (e.g., A1, A2, B1, B2, C1, C2).'
    ),
  reasoning: z
    .string()
    .describe(
      'The AI reasoning behind the assessed proficiency level, explaining why the user was assigned that level.'
    ),
});
export type AnalyzeProficiencyLevelOutput = z.infer<
  typeof AnalyzeProficiencyLevelOutputSchema
>;

export async function analyzeProficiencyLevel(
  input: AnalyzeProficiencyLevelInput
): Promise<AnalyzeProficiencyLevelOutput> {
  return analyzeProficiencyLevelFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeProficiencyLevelPrompt',
  input: {schema: AnalyzeProficiencyLevelInputSchema},
  output: {schema: AnalyzeProficiencyLevelOutputSchema},
  prompt: `You are an expert language proficiency assessor.

You will analyze the user's quiz responses and determine their language proficiency level according to the Common European Framework of Reference for Languages (CEFR) levels (A1, A2, B1, B2, C1, C2).

Based on the responses, determine the user's proficiency level and provide a brief explanation of your reasoning.

Quiz Responses: {{{quizResponses}}}
`,
});

const analyzeProficiencyLevelFlow = ai.defineFlow(
  {
    name: 'analyzeProficiencyLevelFlow',
    inputSchema: AnalyzeProficiencyLevelInputSchema,
    outputSchema: AnalyzeProficiencyLevelOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
