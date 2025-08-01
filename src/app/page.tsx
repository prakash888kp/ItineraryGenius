
'use client';

import { useState } from 'react';
import { ItineraryForm } from '@/components/itinerary-form';
import { ItineraryDisplay } from '@/components/itinerary-display';
import { generateItineraryAction } from '@/app/actions';
import { Wand2, Info, History } from 'lucide-react';
import { useToast } from "@/hooks/use-toast"
import { GeneratePersonalizedItineraryOutput, GeneratePersonalizedItineraryInput } from '@/ai/flows/itinerary-schemas';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { saveItinerary } from '@/lib/storage';

type ItineraryData = GeneratePersonalizedItineraryOutput & { input: GeneratePersonalizedItineraryInput };


export default function Home() {
  const [itineraryData, setItineraryData] = useState<ItineraryData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleFormSubmit = async (data: GeneratePersonalizedItineraryInput) => {
    setIsLoading(true);
    setError(null);
    setItineraryData(null);
    try {
      const result = await generateItineraryAction(data);
      if ('itinerary' in result) {
        // The action now returns the full structure including input
        setItineraryData(result as ItineraryData);
      } else {
        const errorMessage = result.error || 'Failed to generate itinerary. Please try again.';
        setError(errorMessage);
        toast({
          variant: "destructive",
          title: "Generation Failed",
          description: errorMessage,
        })
      }
    } catch (e) {
      const errorMessage = 'An unexpected error occurred. Please try again later.';
      setError(errorMessage);
      toast({
        variant: "destructive",
        title: "Error",
        description: errorMessage,
      })
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveItinerary = (data: ItineraryData) => {
    try {
        saveItinerary(data);
        toast({
            title: "Itinerary Saved!",
            description: "Your trip has been saved to your history.",
        });
    } catch (e: any) {
        const errorMessage = e.message || 'Failed to save itinerary.';
        setError(errorMessage);
        toast({
            variant: "destructive",
            title: "Error",
            description: errorMessage,
        });
    }
  };

  const handleNoteChange = (dayIndex: number, newNote: string) => {
    if (!itineraryData) return;

    setItineraryData(prevData => {
      if (!prevData) return null;
      const newItinerary = [...prevData.itinerary];
      newItinerary[dayIndex] = { ...newItinerary[dayIndex], notes: newNote };
      return { ...prevData, itinerary: newItinerary };
    });
  };


  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-grow container mx-auto px-4 py-8 md:py-16">
        <header className="text-center mb-12">
          <div className="inline-block bg-primary/20 text-primary p-3 rounded-full mb-4 animate-pulse">
            <Wand2 className="h-10 w-10 md:h-12 md:w-12" />
          </div>
          <h1 className="font-headline text-5xl md:text-7xl font-bold tracking-tight">ItineraryGenius</h1>
          <p className="mt-4 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Your personal AI travel assistant. Craft your perfect summer getaway in seconds.
          </p>
          <div className="mt-6">
            <Link href="/history" passHref>
              <Button variant="outline">
                <History className="mr-2 h-4 w-4" />
                View Saved Trips
              </Button>
            </Link>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-2">
            <ItineraryForm onSubmit={handleFormSubmit} isLoading={isLoading} />
            <div className="mt-8 p-6 bg-card rounded-lg border">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 bg-primary/20 text-primary p-2 rounded-full">
                  <Info className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-headline text-2xl font-semibold mb-2">How It Works</h3>
                  <p className="text-muted-foreground">
                    Our app uses a powerful AI to create a personalized travel itinerary just for you. Enter your destination, trip duration, interests, and budget, and our system generates a day-by-day plan with images, maps, and cost estimates to make your trip unforgettable.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-3">
            <ItineraryDisplay 
                itineraryData={itineraryData} 
                isLoading={isLoading} 
                error={error} 
                onSave={handleSaveItinerary}
                onNoteChange={handleNoteChange}
            />
          </div>
        </div>
      </main>
      <footer className="text-center py-6 px-4 text-muted-foreground text-sm">
        <p>Designed with a summer theme ☀️ for your next adventure.</p>
      </footer>
    </div>
  );
}
