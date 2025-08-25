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
    .describe('A string containing the user\'s quiz responses, with each question and answer pair separated.'),
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
      'The AI reasoning behind the assessed proficiency level, explaining why the user was assigned that level based on their performance. Must be extensive and in Spanish.'
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
  prompt: `You are an expert language proficiency assessor. Your response MUST be in Spanish.

You will analyze the user's quiz responses to determine their language proficiency level according to the Common European Framework of Reference for Languages (CEFR). The levels are A1, A2, B1, B2, C1, and C2.

Analyze the user's answers, considering grammar, vocabulary, and comprehension. Based on their performance, determine the most appropriate proficiency level. A user who answers everything correctly should be rated C2.

Provide a detailed, extensive, and clear explanation for your assessment, written in Spanish.

Quiz Responses:
{{{quizResponses}}}
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
