
'use server';

import { ai } from '@/ai/genkit';
import { generateImage } from './generate-image';
import {
  GeneratePersonalizedItineraryOutput,
  GeneratePersonalizedItineraryOutputSchema,
  GeneratePersonalizedItineraryInputSchema,
  GeneratePersonalizedItineraryInput,
} from './itinerary-schemas';

function createTextPrompt(input: GeneratePersonalizedItineraryInput): string {
  // Explicitly define the full schema in the prompt for clarity.
  const schemaForPrompt = `{
    "tripTitle": "string",
    "overview": "string",
    "itinerary": [
      {
        "day": "number",
        "title": "string", 
        "imagePrompt": "string",
        "morning": {
          "title": "string",
          "activities": [
            {
              "time": "string",
              "activity": "string",
              "description": "string",
              "location": {
                "lat": "number",
                "lon": "number",
                "address": "string",
                "phone": "string",
                "website": "string"
              },
              "estimatedCost": "number"
            }
          ]
        },
        "afternoon": {
          "title": "string",
          "activities": [
            {
              "time": "string",
              "activity": "string",
              "description": "string",
              "location": {
                "lat": "number",
                "lon": "number",
                "address": "string",
                "phone": "string",
                "website": "string"
              },
              "estimatedCost": "number"
            }
          ]
        },
        "evening": {
          "title": "string",
          "activities": [
            {
              "time": "string",
              "activity": "string",
              "description": "string",
              "location": {
                "lat": "number",
                "lon": "number",
                "address": "string",
                "phone": "string",
                "website": "string"
              },
              "estimatedCost": "number"
            }
          ]
        },
        "notes": "string"
      }
    ],
    "budget": {
      "accommodation": "number",
      "food": "number",
      "activities": "number",
      "total": "number",
      "accommodationOptions": [
        {
          "type": "string",
          "costPerNight": "number"
        }
      ],
      "activityCosts": [
        {
          "activityName": "string",
          "estimatedCost": "number"
        }
      ]
    },
    "practicalInfo": {
      "packingList": ["string"],
      "localEtiquette": ["string"],
      "localPhrases": [
        {
          "phrase": "string",
          "translation": "string"
        }
      ],
      "currency": "string",
      "transportationTips": ["string"],
      "visaInfo": "string",
      "emergencyContacts": {
        "string": "string"
      },
      "mapUrl": "string"
    }
  }`;

  return `
    You are an expert travel planner. Your task is to generate a personalized travel itinerary in JSON format.
    The output MUST be valid JSON and strictly adhere to the following schema. Ensure ALL fields are included and have the correct data types. For optional fields, include them if you have relevant information, otherwise omit them or use null.
    ${schemaForPrompt}

    Based on the following preferences, generate the complete itinerary:
    - Destination: ${input.destination}
    - Duration: ${input.duration} days
    - Interests: ${input.interests}
    - Budget: ${input.budget}
    ${input.travelers ? `- Number of travelers: ${input.travelers}` : ''}
    ${input.travelStyle ? `- Travel Style: This traveler is a '${input.travelStyle}'. Tailor the suggestions for activities, accommodation, and tone to fit this style.` : ''}

    Generate the itinerary now, ensuring all required fields in the JSON schema are present and correctly populated. For activities, provide estimated timings, full addresses, phone numbers, and websites if available. Also, include estimated costs for specific activities and suggest accommodation options with costs. Provide a URL for an interactive map covering the itinerary locations.
  `;
}

const generateItineraryFlow = ai.defineFlow(
  {
    name: 'generateItineraryFlow',
    inputSchema: GeneratePersonalizedItineraryInputSchema,
    outputSchema: GeneratePersonalizedItineraryOutputSchema.extend({ input: GeneratePersonalizedItineraryInputSchema }),
  },
  async (input) => {
    let itineraryResult: GeneratePersonalizedItineraryOutput;

    // STEP 1: Use Pollinations text endpoint to generate JSON string response
    try {
      const prompt = createTextPrompt(input);
      const encoded = encodeURIComponent(prompt);
      const url = `https://text.pollinations.ai/${encoded}?model=openai&json=true`;

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Pollinations text API failed with status ${response.status}`);
      }

      const textResult = await response.text();
      // since we requested json=true, response is the JSON object as a string

      const parsedJson = JSON.parse(textResult);
      const validationResult = GeneratePersonalizedItineraryOutputSchema.safeParse(parsedJson);

      if (!validationResult.success) {
        console.error("JSON validation failed:", validationResult.error);
        throw new Error(`Invalid AI response format. Details: ${validationResult.error.message}`);
      }

      itineraryResult = validationResult.data;

    } catch (e: any) {
      console.error("Text generation failed.", e);
      throw new Error(`Text generation failed. Please try again. Details: ${e.message}`);
    }

    // STEP 2: Generate images per day using your generateImage helper
    const itineraryWithImages = await Promise.all(
      itineraryResult.itinerary.map(async (day) => {
        try {
          // Use a simpler prompt for image generation
          const imagePrompt = `A scenic view of ${input.destination} related to: ${day.title}`;
          const { imageUrl } = await generateImage({ prompt: imagePrompt });
          return { ...day, imageUrl };
        } catch (err) {
          console.error(`Image failed for day ${day.day}`, err);
          return { ...day, imageUrl: `https://placehold.co/600x400.png` }; // Provide a placeholder on failure
        }
      })
    );
    
    // STEP 3: Combine the AI-generated itinerary with the original input
    return { ...itineraryResult, itinerary: itineraryWithImages, input: input };
  }
);


export async function generatePersonalizedItinerary(input: GeneratePersonalizedItineraryInput): Promise<GeneratePersonalizedItineraryOutput & { input: GeneratePersonalizedItineraryInput }> {
  try {
    return await generateItineraryFlow(input);
  } catch (e: any) {
    console.error("Itinerary generation flow failed:", e);
    throw new Error(`Failed to communicate with AI. ${e.message}`);
  }
}
