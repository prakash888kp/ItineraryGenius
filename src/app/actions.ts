
'use server';

import { generatePersonalizedItinerary } from '@/ai/flows/generate-itinerary';
import { GeneratePersonalizedItineraryInput, GeneratePersonalizedItineraryOutput } from '@/ai/flows/itinerary-schemas';

type ActionResult = (GeneratePersonalizedItineraryOutput & { input: GeneratePersonalizedItineraryInput }) | { error: string };

export async function generateItineraryAction(input: GeneratePersonalizedItineraryInput): Promise<ActionResult> {
  try {
    const output = await generatePersonalizedItinerary(input);
    return output;
  } catch (error) {
    console.error('Itinerary generation failed:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    return { error: `Failed to communicate with the AI model. ${errorMessage} Please try again later.` };
  }
}
