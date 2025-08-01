// src/lib/storage.ts
import type { GeneratePersonalizedItineraryOutput, GeneratePersonalizedItineraryInput, ItineraryDayWithImage } from "@/ai/flows/itinerary-schemas";

const STORAGE_KEY = 'itinerarygenius-itineraries';

export type SavedItinerary = GeneratePersonalizedItineraryOutput & {
  id: string;
  savedAt: string;
  destination: string;
  input: GeneratePersonalizedItineraryInput;
  itinerary: ItineraryDayWithImage[];
};

export function getSavedItineraries(): SavedItinerary[] {
  if (typeof window === 'undefined') {
    return [];
  }
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    const parsedSaved = saved ? JSON.parse(saved) : [];
    // Ensure backward compatibility and data integrity for older saved items
    return parsedSaved.map((itinerary: any) => {
      // A simple check to see if the structure looks roughly correct
      if (!itinerary.input || !itinerary.itinerary) {
        // This is a fallback for potentially malformed data.
        // In a real-world scenario, you might have more robust migration logic.
        const destination = itinerary.destination || 'Unknown Destination';
        return { 
          ...itinerary, 
          destination, 
          input: itinerary.input || { destination: destination, duration: 0, interests: '', budget: 'low' },
          itinerary: itinerary.itinerary || []
        };
      }
      return itinerary as SavedItinerary;
    });
  } catch (error) {
    console.error("Failed to retrieve itineraries from localStorage", error);
    return [];
  }
}

export function saveItinerary(itineraryData: GeneratePersonalizedItineraryOutput & { input: GeneratePersonalizedItineraryInput }): void {
  if (typeof window === 'undefined') {
    return;
  }
  try {
    const itineraries = getSavedItineraries();
    const destination = itineraryData.input.destination;
    
    const itineraryToSave: SavedItinerary = {
      ...itineraryData,
      id: new Date().toISOString(),
      savedAt: new Date().toISOString(),
      destination: destination,
      itinerary: itineraryData.itinerary,
    };

    itineraries.unshift(itineraryToSave);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(itineraries));
  } catch (error) {
    console.error("Failed to save itinerary to localStorage", error);
    if (error instanceof DOMException && (error.name === 'QuotaExceededError' || error.name === 'NS_ERROR_DOM_QUOTA_REACHED')) {
        throw new Error("Your browser storage is full. Please clear some space to save new itineraries.");
    }
    throw new Error("Could not save itinerary.");
  }
}

export function updateItineraryInStorage(updatedItinerary: SavedItinerary): void {
  if (typeof window === 'undefined') {
    return;
  }
  try {
    const itineraries = getSavedItineraries();
    const index = itineraries.findIndex(it => it.id === updatedItinerary.id);
    if (index !== -1) {
      itineraries[index] = updatedItinerary;
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(itineraries));
    } else {
      throw new Error("Itinerary to update not found.");
    }
  } catch (error) {
      console.error("Failed to update itinerary in localStorage", error);
      throw new Error("Could not update itinerary.");
  }
}

export function getItineraryById(id: string): SavedItinerary | undefined {
  const itineraries = getSavedItineraries();
  return itineraries.find(it => it.id === id);
}

export function deleteItineraryById(id: string): void {
    if (typeof window === 'undefined') {
        return;
    }
    try {
        let itineraries = getSavedItineraries();
        itineraries = itineraries.filter(it => it.id !== id);
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(itineraries));
    } catch (error) {
        console.error("Failed to delete itinerary from localStorage", error);
        throw new Error("Could not delete itinerary.");
    }
}
