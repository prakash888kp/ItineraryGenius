
// src/ai/flows/generate-image.ts
'use server';

/**
 * @fileOverview An AI image generation flow using Pollinations.ai.
 *
 * - generateImage - A function that handles image generation.
 * - GenerateImageInput - The input type for the generateImage function.
 * - GenerateImageOutput - The return type for the generateImage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateImageInputSchema = z.object({
  prompt: z.string().describe('The text prompt to generate an image from.'),
});
export type GenerateImageInput = z.infer<typeof GenerateImageInputSchema>;

const GenerateImageOutputSchema = z.object({
  imageUrl: z.string().describe('The data URI of the generated image.'),
});
export type GenerateImageOutput = z.infer<typeof GenerateImageOutputSchema>;

export async function generateImage(input: GenerateImageInput): Promise<GenerateImageOutput> {
  return generateImageFlow(input);
}

const generateImageFlow = ai.defineFlow(
  {
    name: 'generateImageFlow',
    inputSchema: GenerateImageInputSchema,
    outputSchema: GenerateImageOutputSchema,
  },
  async (input) => {
    // Pollinations.ai URL encode prompts.
    const urlEncodedPrompt = encodeURIComponent(input.prompt);
    const pollinationUrl = `https://image.pollinations.ai/prompt/${urlEncodedPrompt}`;

    try {
      const response = await fetch(pollinationUrl);
      if (!response.ok) {
        throw new Error(`Pollinations API failed with status: ${response.statusText}`);
      }
      
      const imageBuffer = await response.arrayBuffer();
      const contentType = response.headers.get('content-type') || 'image/jpeg';
      const base64Image = Buffer.from(imageBuffer).toString('base64');
      const imageUrl = `data:${contentType};base64,${base64Image}`;

      return {
        imageUrl: imageUrl,
      };

    } catch (e: any) {
        console.error("Failed to generate image from Pollinations", e);
        throw new Error(`Failed to generate image: ${e.message}`);
    }
  }
);
