// src/ai/flows/generate-keyword-replies.ts
'use server';

/**
 * @fileOverview A flow for generating automatic replies based on keywords.
 *
 * - generateKeywordReplies - A function that handles the generation of automatic replies based on keywords.
 * - GenerateKeywordRepliesInput - The input type for the generateKeywordReplies function.
 * - GenerateKeywordRepliesOutput - The return type for the generateKeywordReplies function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateKeywordRepliesInputSchema = z.object({
  message: z.string().describe('The incoming message to be analyzed.'),
  keywords: z
    .array(z.string())
    .describe('An array of keywords to check against the message.'),
  replies: z
    .array(z.string())
    .describe('An array of corresponding replies for the keywords.'),
});

export type GenerateKeywordRepliesInput = z.infer<
  typeof GenerateKeywordRepliesInputSchema
>;

const GenerateKeywordRepliesOutputSchema = z.object({
  reply: z
    .string()
    .describe(
      'The generated reply based on the keywords found in the message. If no keywords are matched, it returns an empty string.'
    ),
});

export type GenerateKeywordRepliesOutput = z.infer<
  typeof GenerateKeywordRepliesOutputSchema
>;

export async function generateKeywordReplies(
  input: GenerateKeywordRepliesInput
): Promise<GenerateKeywordRepliesOutput> {
  return generateKeywordRepliesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateKeywordRepliesPrompt',
  input: {schema: GenerateKeywordRepliesInputSchema},
  output: {schema: GenerateKeywordRepliesOutputSchema},
  prompt: `You are an AI assistant designed to generate automatic replies based on keywords found in incoming messages.

You will receive a message, a list of keywords, and a list of corresponding replies.
Your task is to analyze the message and identify if any of the keywords are present in the message.
If a keyword is found, return the corresponding reply.
If multiple keywords are found, return the reply for the first matched keyword.
If no keywords are found, return an empty string.

Message: "{{message}}"
Keywords: {{keywords}}
Replies: {{replies}}

Output only the reply, or an empty string if no keywords are matched. Do not include any additional explanations or information.
`,
});

const generateKeywordRepliesFlow = ai.defineFlow(
  {
    name: 'generateKeywordRepliesFlow',
    inputSchema: GenerateKeywordRepliesInputSchema,
    outputSchema: GenerateKeywordRepliesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
