'use server';

import { generateKeywordReplies, type GenerateKeywordRepliesInput, type GenerateKeywordRepliesOutput } from '@/ai/flows/generate-keyword-replies';
import { generateReply, type GenerateReplyInput, type GenerateReplyOutput } from '@/ai/flows/generate-reply';

export async function callGenerateKeywordReplies(input: GenerateKeywordRepliesInput): Promise<GenerateKeywordRepliesOutput> {
  try {
    const result = await generateKeywordReplies(input);
    return result;
  } catch (error) {
    console.error("Error in callGenerateKeywordReplies:", error);
    return { reply: '' }; // Return a default or error-indicating output
  }
}

export async function callGenerateSmartReply(input: GenerateReplyInput): Promise<GenerateReplyOutput> {
  try {
    const result = await generateReply(input);
    return result;
  } catch (error) {
    console.error("Error in callGenerateSmartReply:", error);
    // Consider returning a more specific error object or message
    return { reply: "Sorry, I couldn't generate a reply at this moment." };
  }
}
