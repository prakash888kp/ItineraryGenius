
'use client';

import { useState, useEffect } from 'react';
import { getSavedItineraries, deleteItineraryById, SavedItinerary, updateItineraryInStorage } from '@/lib/storage';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Home, Trash2, Calendar, MapPin } from 'lucide-react';
import { ItineraryDisplay } from '@/components/itinerary-display';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export default function HistoryPage() {
  const [itineraries, setItineraries] = useState<SavedItinerary[]>([]);
  const [selectedItinerary, setSelectedItinerary] = useState<SavedItinerary | null>(null);

  useEffect(() => {
    setItineraries(getSavedItineraries());
  }, []);
  
  const handleViewDetails = (savedItinerary: SavedItinerary) => {
    setSelectedItinerary(savedItinerary);
  };

  const handleDelete = (id: string) => {
    deleteItineraryById(id);
    setItineraries(getSavedItineraries());
    if (selectedItinerary && selectedItinerary.id === id) {
        setSelectedItinerary(null);
    }
  };

  const handleNoteChange = (dayIndex: number, newNote: string) => {
    if (!selectedItinerary) return;

    // Create a new itinerary object with the updated note
    const newSelectedItinerary: SavedItinerary = {
      ...selectedItinerary,
      itinerary: selectedItinerary.itinerary.map((day, index) => 
        index === dayIndex ? { ...day, notes: newNote } : day
      ),
    };

    // Update the state
    setSelectedItinerary(newSelectedItinerary);
    
    // Persist the changes to localStorage
    updateItineraryInStorage(newSelectedItinerary);

    // Also update the main list of itineraries in state
    setItineraries(prev => prev.map(it => it.id === newSelectedItinerary.id ? newSelectedItinerary : it));
  };


  if (selectedItinerary) {
    return (
      <div className="min-h-screen container mx-auto px-4 py-8">
         <Button variant="outline" onClick={() => setSelectedItinerary(null)} className="mb-8">
            &larr; Back to History
        </Button>
        <ItineraryDisplay itineraryData={selectedItinerary} isLoading={false} error={null} onNoteChange={handleNoteChange} />
      </div>
    );
  }

  return (
    <div className="min-h-screen container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
            <h1 className="font-headline text-5xl md:text-6xl font-bold tracking-tight">Saved Trips</h1>
            <Link href="/" passHref>
                <Button>
                <Home className="mr-2 h-4 w-4" />
                Create New Trip
                </Button>
            </Link>
        </div>
      
      {itineraries.length === 0 ? (
        <Card className="text-center py-20">
          <CardHeader>
            <CardTitle className="font-headline text-3xl">No Saved Trips Yet</CardTitle>
            <CardDescription className="text-lg mt-2">
              Go back to the main page to create and save your first adventure!
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {itineraries.map((itinerary) => (
            <Card key={itinerary.id} className="flex flex-col">
              <CardHeader>
                <CardTitle className="font-headline text-2xl truncate">{itinerary.destination}</CardTitle>
                <CardDescription className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Saved on {new Date(itinerary.savedAt).toLocaleDateString()}
                </CardDescription>
                <CardDescription className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  {itinerary.itinerary.length} day trip
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-grow flex flex-col justify-end gap-2">
                <Button onClick={() => handleViewDetails(itinerary)} className="w-full">View Details</Button>
                 <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" className="w-full">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete this itinerary
                        from your saved trips.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleDelete(itinerary.id)}>
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
