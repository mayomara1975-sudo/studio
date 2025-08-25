'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating quiz questions based on a specified proficiency level and topic.
 *
 * - generateQuizQuestions - A function that generates quiz questions based on the specified proficiency level and topic.
 * - GenerateQuizQuestionsInput - The input type for the generateQuizQuestions function.
 * - GenerateQuizQuestionsOutput - The return type for the generateQuizQuestions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateQuizQuestionsInputSchema = z.object({
  topic: z
    .string()
    .describe('The topic of the quiz, e.g., "greetings", "introductions", "present simple tense".'),
  proficiencyLevel: z
    .string()
    .describe(
      'The desired proficiency level for the quiz, e.g., "A1", "A2", "B1", "B2", "C1", "C2".'
    ),
  numberOfQuestions: z
    .number()
    .default(15)
    .describe('The number of questions to generate for the quiz.'),
});
export type GenerateQuizQuestionsInput = z.infer<typeof GenerateQuizQuestionsInputSchema>;

const GenerateQuizQuestionsOutputSchema = z.object({
  questions: z.array(
    z.object({
      question: z.string().describe('The quiz question.'),
      answer: z.string().describe('The correct answer to the question.'),
      options: z.array(z.string()).describe('The possible answer options.'),
      feedback: z.string().describe('Brief, encouraging feedback for the user response, always in Spanish.'),
    })
  ),
});
export type GenerateQuizQuestionsOutput = z.infer<typeof GenerateQuizQuestionsOutputSchema>;

export async function generateQuizQuestions(input: GenerateQuizQuestionsInput): Promise<GenerateQuizQuestionsOutput> {
  return generateQuizQuestionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateQuizQuestionsPrompt',
  input: {schema: GenerateQuizQuestionsInputSchema},
  output: {schema: GenerateQuizQuestionsOutputSchema},
  prompt: `You are an AI quiz generator specializing in Spanish language learning. Create a set of multiple-choice questions to assess a user's proficiency. The questions should cover a wide range of difficulties from A1 (beginner) to C2 (proficient) to accurately determine their level.

Ensure the questions test various aspects of the language, including grammar (verb tenses, ser vs. estar, prepositions, subjunctive), advanced vocabulary, and reading comprehension of complex texts. The difficulty must be varied, with some easy questions and some very challenging ones.

Topic: {{{topic}}}
Target Proficiency Range: {{{proficiencyLevel}}}
Number of Questions: {{{numberOfQuestions}}}

For each question, provide:
1. The question text.
2. The correct answer.
3. Plausible incorrect options.
4. Brief, encouraging feedback for when a user selects an answer.

IMPORTANT: All output text, including questions, answers, options, and feedback, MUST be in Spanish.

Generate the quiz in JSON format.`,
});

const generateQuizQuestionsFlow = ai.defineFlow(
  {
    name: 'generateQuizQuestionsFlow',
    inputSchema: GenerateQuizQuestionsInputSchema,
    outputSchema: GenerateQuizQuestionsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
