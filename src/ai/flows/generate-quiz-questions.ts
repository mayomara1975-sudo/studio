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
    .default(5)
    .describe('The number of questions to generate for the quiz.'),
});
export type GenerateQuizQuestionsInput = z.infer<typeof GenerateQuizQuestionsInputSchema>;

const GenerateQuizQuestionsOutputSchema = z.object({
  questions: z.array(
    z.object({
      question: z.string().describe('The quiz question.'),
      answer: z.string().describe('The correct answer to the question.'),
      options: z.array(z.string()).describe('The possible answer options.'),
      feedback: z.string().describe('AI feedback for the user response.'),
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
  prompt: `You are an AI quiz generator that generates quizzes based on a given topic and proficiency level.  The user will specify a topic and proficiency level, and you will generate a quiz with multiple choice questions. Each question should have a question, answer, possible options and feedback.

Topic: {{{topic}}}
Proficiency Level: {{{proficiencyLevel}}}
Number of Questions: {{{numberOfQuestions}}}

Output the quiz in JSON format.`,
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
