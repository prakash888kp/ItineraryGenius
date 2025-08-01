
import {z} from 'genkit';

/**
 * Represents a geographical location with latitude and longitude, address, phone, and website.
 */
const LocationSchema = z.object({
  lat: z.number().describe('The latitude of the location.'),
  lon: z.number().describe('The longitude of the location.'),
  address: z.string().optional().describe('The full address of the location.'),
  phone: z.string().optional().describe('The phone number for the location.'),
  website: z.string().optional().describe('The website for the location.'),
});

/**
 * Defines the schema for a single activity within a day's itinerary.
 */
const DayActivitySchema = z.object({
  time: z.string().optional().describe('Estimated time for the activity (e.g., "9:00 AM - 12:00 PM").'),
  activity: z.string().describe('A short title for the activity.'),
  description: z.string().describe('A detailed description of the activity.'),
  location: LocationSchema.describe('The geographical coordinates and contact information of the activity.'),
  estimatedCost: z.number().optional().describe('Estimated cost for this specific activity.'),
});

/**
 * Defines the schema for a part of the day (e.g., morning, afternoon, evening).
 */
const DayPartSchema = z.object({
  title: z.string().describe('A creative title for this part of the day (e.g., "Morning Market Exploration").'),
  activities: z.array(DayActivitySchema).describe('A list of activities for this part of the day.'),
});

/**
 * Defines the schema for a single day's itinerary.
 */
export const DayItinerarySchema = z.object({
  day: z.number().describe('The day number (e.g., 1).'),
  title: z.string().describe("A captivating title for the entire day's plan."),
  imagePrompt: z.string().describe("A concise, visually descriptive prompt for generating an image that represents this day's activities. Should be simple, e.g. 'A beautiful sunset over the mountains'."),
  morning: DayPartSchema,
  afternoon: DayPartSchema,
  evening: DayPartSchema,
  notes: z.string().optional().describe('Space for user notes for this day.'),
  imageUrl: z.string().optional().describe("Data URI of a generated image for the day's summary.")
});
export type ItineraryDayWithImage = z.infer<typeof DayItinerarySchema>;


/**
 * Defines the schema for a more detailed estimated budget breakdown.
 */
const BudgetSchema = z.object({
  accommodation: z.number().describe('Estimated cost for accommodation per day.'),
  food: z.number().describe('Estimated cost for food per day.'),
  activities: z.number().describe('Estimated cost for activities per day.'),
  total: z.number().describe('Total estimated cost per day.'),
  accommodationOptions: z.array(z.object({
    type: z.string().describe('Type of accommodation (e.g., Budget, Mid-Range).'),
    costPerNight: z.number().describe('Estimated cost per night.'),
  })).optional().describe('Suggested accommodation options with estimated costs.'),
  activityCosts: z.array(z.object({
    activityName: z.string().describe('Name of the activity.'),
    estimatedCost: z.number().describe('Estimated cost for this activity.'),
  })).optional().describe('Estimated costs for specific activities.'),
});

/**
 * Defines the schema for local phrases.
 */
const PhraseSchema = z.object({
    phrase: z.string().describe('The phrase in the local language.'),
    translation: z.string().describe('The English translation of the phrase.'),
});

/**
 * Defines the schema for practical travel information.
 */
const PracticalInfoSchema = z.object({
  packingList: z.array(z.string()).describe("A personalized packing list based on the destination's climate and planned activities."),
  localEtiquette: z.array(z.string()).describe('Key cultural etiquette tips for the destination.'),
  localPhrases: z.array(PhraseSchema).describe('Useful local phrases with translations.'),
  currency: z.string().describe('Local currency.'),
  transportationTips: z.array(z.string()).describe('Tips for getting around the destination.'),
  visaInfo: z.string().describe('Brief information on visa requirements for common nationalities.'),
  emergencyContacts: z.record(z.string()).describe('Important emergency contact numbers.'),
  mapUrl: z.string().optional().describe('URL for an interactive map of the itinerary.'),
});

/**
 * Defines the input schema for the personalized itinerary generation.
 */
export const GeneratePersonalizedItineraryInputSchema = z.object({
  destination: z.string().describe('The travel destination (city, country, etc.).'),
  duration: z.number().describe('The duration of the trip in days.'),
  interests: z.string().describe('A list of interests the user has (e.g., "history, food, hiking").'),
  budget: z.enum(['low', 'medium', 'high']).describe("The user's budget level."),
  travelers: z.number().optional().describe('The number of people traveling.'),
  travelStyle: z.string().optional().describe('The travel style of the user (e.g., "backpacker", "luxury", "family", "romantic").'),
});
export type GeneratePersonalizedItineraryInput = z.infer<typeof GeneratePersonalizedItineraryInputSchema>;


/**
 * Defines the output schema for the personalized itinerary from the AI model.
 * This does NOT include the 'input' field, which will be added back in the flow.
 */
export const GeneratePersonalizedItineraryOutputSchema = z.object({
  tripTitle: z.string().describe('A creative title for the trip.'),
  overview: z.string().describe('A brief overview of the itinerary.'),
  itinerary: z.array(DayItinerarySchema).describe('A detailed day-by-day breakdown of activities.'),
  budget: BudgetSchema.describe('Estimated daily budget breakdown.'),
  practicalInfo: PracticalInfoSchema.describe('Practical travel information.'),
});
export type GeneratePersonalizedItineraryOutput = z.infer<typeof GeneratePersonalizedItineraryOutputSchema>;
