
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Skeleton } from '@/components/ui/skeleton';
import { Sun, Route, Utensils, Building2, MapPin, AlertCircle, Sunrise, Sunset, Save, Share, Backpack, Languages, Sparkles, TramFront, Users, CalendarDays, Tag, Globe, UserCheck, Briefcase, Heart } from 'lucide-react';
import Image from 'next/image';
import type { GeneratePersonalizedItineraryOutput, ItineraryDayWithImage, GeneratePersonalizedItineraryInput } from '@/ai/flows/itinerary-schemas';
import dynamic from 'next/dynamic';
import { BudgetDisplay } from './budget-display';
import { Button } from './ui/button';
import { ExportDialog } from './export-dialog';
import { QRCodeSVG } from 'qrcode.react';
import Link from 'next/link';

const ItineraryMap = dynamic(() => import('./itinerary-map'), { 
    ssr: false,
    loading: () => <Skeleton className="h-[400px] w-full rounded-lg" />
});

interface ItineraryDisplayProps {
  itineraryData: (GeneratePersonalizedItineraryOutput & { input: GeneratePersonalizedItineraryInput }) | null;
  isLoading: boolean;
  error: string | null;
  onSave?: (data: GeneratePersonalizedItineraryOutput & { input: any }) => void;
  onNoteChange?: (dayIndex: number, newNote: string) => void;
}

// Basic icon mapping (can be expanded)
const activityIconMap: { [key: string]: React.ReactNode } = {
    food: <Utensils className="h-4 w-4 text-primary" />,
    restaurant: <Utensils className="h-4 w-4 text-primary" />,
    culinary: <Utensils className="h-4 w-4 text-primary" />,
    explore: <Route className="h-4 w-4 text-primary" />,
    walk: <Route className="h-4 w-4 text-primary" />,
    nature: <Route className="h-4 w-4 text-primary" />,
    park: <Route className="h-4 w-4 text-primary" />,
    relax: <Sun className="h-4 w-4 text-primary" />,
    beach: <Sun className="h-4 w-4 text-primary" />,
    sun: <Sun className="h-4 w-4 text-primary" />,
    museum: <Building2 className="h-4 w-4 text-primary" />,
    history: <Building2 className="h-4 w-4 text-primary" />,
    art: <Building2 className="h-4 w-4 text-primary" />,
    culture: <Building2 className="h-4 w-4 text-primary" />,
    hiking: <Backpack className="h-4 w-4 text-primary" />,
    wildlife: <MapPin className="h-4 w-4 text-primary" />,
    stargazing: <Sun className="h-4 w-4 text-primary" />,
    transportation: <TramFront className="h-4 w-4 text-primary" />,
};

const getDayIcon = (dayTitle: string) => {
    const lowercased = dayTitle.toLowerCase();
    for (const keyword in activityIconMap) {
        if (lowercased.includes(keyword)) {
            return activityIconMap[keyword];
        }
    }
    return <MapPin className="h-5 w-5 text-primary" />;
};

const travelStyleInfo: { [key: string]: { icon: React.ReactNode; label: string } } = {
  backpacker: { icon: <Backpack className="h-4 w-4" />, label: 'Backpacker' },
  luxury: { icon: <Briefcase className="h-4 w-4" />, label: 'Luxury Seeker' },
  family: { icon: <Users className="h-4 w-4" />, label: 'Family with Kids' },
  romantic: { icon: <Heart className="h-4 w-4" />, label: 'Romantic Getaway' },
};

const DayPartDisplay = ({ title, activities, icon }: { title: string; activities: ItineraryDayWithImage['morning']['activities']; icon: React.ReactNode }) => (
  <div className="mb-6">
    <div className="flex items-center gap-3 mb-3">
      {icon}
      <h4 className="font-headline text-xl font-semibold text-card-foreground">{title}</h4>
    </div>
    <div className="pl-8 border-l-2 border-primary/20 ml-2 space-y-4">
      {activities.map((act, index) => (
        <div key={index} className="pl-4">
          <div className="flex items-center gap-2">
             {/* Activity Icon Placeholder */}
             {/* We'll add a more specific icon mapping here later */}
             {getDayIcon(act.activity)}
             <p className="font-semibold text-card-foreground">{act.activity}</p>
          </div>
          {act.time && <p className="text-sm text-muted-foreground italic">{act.time}</p>}
          <p className="text-muted-foreground">{act.description}</p>
          {act.location && (
            <div className="text-sm text-muted-foreground mt-1 space-y-0.5">
              {act.location.address && <p className="flex items-center gap-1"><MapPin className="h-3 w-3" />{act.location.address}</p>}
              {act.location.phone && <p className="flex items-center gap-1"><span className="sr-only">Phone:</span>{act.location.phone}</p>}
              {act.location.website && <p className="flex items-center gap-1"><Globe className="h-3 w-3" /><Link href={act.location.website} target="_blank" rel="noopener noreferrer" className="hover:underline">{act.location.website}</Link></p>}
            </div>
          )}
           {act.estimatedCost !== undefined && <p className="text-sm text-muted-foreground">Estimated Cost: {act.estimatedCost}</p>}
        </div>
      ))}
    </div>
  </div>
);

const PracticalInfoSection = ({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) => (
  <div>
    <div className="flex items-center gap-3 mb-3">
      {icon}
      <h3 className="font-headline text-2xl font-semibold">{title}</h3>
    </div>
    <div className="pl-10 text-muted-foreground space-y-2">
      {children}
    </div>
  </div>
);

export function ItineraryDisplay({ itineraryData, isLoading, error, onSave, onNoteChange }: ItineraryDisplayProps) {
  if (isLoading) {
    return <LoadingSkeleton />;
  }
  if (error) {
    return (
      <Card className="h-full flex items-center justify-center border-destructive bg-destructive/10">
        <div className="text-center text-destructive p-8">
          <AlertCircle className="mx-auto h-12 w-12 mb-4" />
          <h3 className="font-headline text-2xl font-semibold mb-2">Oops! Something went wrong.</h3>
          <p>{error}</p>
        </div>
      </Card>
    );
  }
  if (!itineraryData) {
    return (
      <Card className="h-full flex items-center justify-center bg-card border shadow-sm">
        <div className="text-center text-muted-foreground p-8">
            <Image data-ai-hint="travel luggage" src="https://placehold.co/400x300.png" alt="Luggage with travel items" width={300} height={225} className="mx-auto mb-6 rounded-lg shadow-md" />
            <h3 className="font-headline text-2xl font-semibold text-card-foreground">Your Adventure Awaits</h3>
            <p>Fill out the form to generate your personalized travel plan.</p>
        </div>
      </Card>
    );
  }

  const { itinerary, budget, practicalInfo, input } = itineraryData;
  const destination = input.destination || 'your destination';
  const duration = input.duration;
  const travelers = input.travelers;
  const interests = input.interests;
  const travelStyle = input.travelStyle && travelStyleInfo[input.travelStyle];

  return (
    <div className="space-y-6">
      <Card className="border shadow-sm">
        <CardHeader className="flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
                <CardTitle className="font-headline text-3xl">{itineraryData.tripTitle || 'Your Custom Itinerary'}</CardTitle>
                {itineraryData.overview && <CardDescription className="mt-1">{itineraryData.overview}</CardDescription>}
                
                {/* Enhanced Trip Details */}
                <div className="text-sm text-muted-foreground mt-3 space-y-1">
                    <p className="flex items-center gap-1"><MapPin className="h-4 w-4" /> Destination: {destination}</p>
                    <p className="flex items-center gap-1"><CalendarDays className="h-4 w-4" /> Duration: {duration} days</p>
                    {travelers !== undefined && <p className="flex items-center gap-1"><Users className="h-4 w-4" /> Travelers: {travelers}</p>}
                    {interests && <p className="flex items-center gap-1"><Sparkles className="h-4 w-4" /> Interests: {interests}</p>}
                    {travelStyle && <p className="flex items-center gap-1">{travelStyle.icon} Travel Style: {travelStyle.label}</p>}
                </div>

            </div>
            <div className="flex gap-2">
              {itineraryData && <ExportDialog itineraryData={itineraryData} />}
              {onSave && (
                  <Button onClick={() => onSave(itineraryData)}>
                      <Save className="mr-2 h-4 w-4" />
                      Save Itinerary
                  </Button>
              )}
            </div>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible defaultValue="day-0" className="w-full">
            {itinerary.map((day, index) => (
                <AccordionItem value={`day-${index}`} key={index}>
                  <AccordionTrigger className="text-xl font-semibold hover:no-underline">
                      <div className="flex items-center gap-4">
                         {getDayIcon(day.title)} 
                         <span className="text-left">{`Day ${day.day}: ${day.title}`}</span>
                      </div>
                  </AccordionTrigger>
                  <AccordionContent className="text-base text-muted-foreground pt-4 space-y-6">
                    {day.imageUrl ? (
                       <Image data-ai-hint={day.imagePrompt} src={day.imageUrl} alt={day.title} width={600} height={400} className="rounded-lg object-cover w-full aspect-[16/9]" />
                    ) : (
                       <Skeleton className="w-full aspect-[16/9] rounded-lg" />
                    )}
                    
                    <div className="pl-4">
                        <DayPartDisplay title={day.morning.title} activities={day.morning.activities} icon={<Sunrise className="h-6 w-6 text-primary/80" />} />
                        <DayPartDisplay title={day.afternoon.title} activities={day.afternoon.activities} icon={<Sun className="h-6 w-6 text-primary/80" />} />
                        <DayPartDisplay title={day.evening.title} activities={day.evening.activities} icon={<Sunset className="h-6 w-6 text-primary/80" />} />
                    </div>

                    {/* Map and QR Code Section */}
                    {(practicalInfo?.mapUrl || day.morning.activities.length > 0 || day.afternoon.activities.length > 0 || day.evening.activities.length > 0) && (
                      <div>
                        <h3 className="font-headline text-2xl font-semibold mb-3 text-card-foreground pl-4">Map for Day {day.day}</h3>
                        <ItineraryMap key={`map-for-day-${day.day}`} day={day} />
                        {practicalInfo?.mapUrl && (
                           <div className="mt-4 text-center">
                             <p className="mb-2">Scan the QR code to view the interactive map:</p>
                             <QRCodeSVG value={practicalInfo.mapUrl} size={128} level="H" includeMargin={true} />
                           </div>
                        )}
                      </div>
                    )}

                    {/* Notes and Photo Placeholders */}
                    <div className="pl-4 mt-6 space-y-4">
                        <div>
                            <h4 className="font-semibold text-card-foreground">Notes for Day {day.day}:</h4>
                            <textarea 
                                className="w-full p-2 border rounded-md min-h-[80px] text-sm text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                                placeholder="Jot down your thoughts and memories for this day..."
                                value={day.notes || ''}
                                onChange={(e) => onNoteChange?.(index, e.target.value)}
                            />
                        </div>
                        <div>
                            <h4 className="font-semibold text-card-foreground">Photos:</h4>
                            <div className="w-full h-32 border-dashed border-2 border-muted-foreground/50 rounded-md flex items-center justify-center text-muted-foreground text-sm">
                                {/* Placeholder for photos */}
                                Photo Placeholder
                            </div>
                        </div>
                    </div>

                  </AccordionContent>
                </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>
      
      {budget && <BudgetDisplay budget={budget} duration={itinerary.length} />}

      {practicalInfo && (
        <Card className="border shadow-sm mt-6">
            <CardHeader>
                <CardTitle className="font-headline text-2xl">Practical Information</CardTitle>
                <CardDescription>Essential tips for your trip.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <PracticalInfoSection title="Packing List" icon={<Backpack className="h-6 w-6 text-primary" />}>
                    {practicalInfo.packingList && practicalInfo.packingList.length > 0 ? (
                        <ul className="list-disc pl-5 grid grid-cols-1 md:grid-cols-2 gap-x-4">
                            {practicalInfo.packingList.map((item, i) => <li key={i}>{item}</li>)}
                        </ul>
                    ) : (
                        <p>No specific packing list provided.</p>
                    )}
                </PracticalInfoSection>

                <PracticalInfoSection title="Local Etiquette" icon={<Sparkles className="h-6 w-6 text-primary" />}>
                    {practicalInfo.localEtiquette && practicalInfo.localEtiquette.length > 0 ? (
                        <ul className="list-disc pl-5 space-y-1">
                            {practicalInfo.localEtiquette.map((tip, i) => <li key={i}>{tip}</li>)}
                        </ul>
                    ) : (
                       <p>No specific local etiquette tips provided.</p>
                    )}
                </PracticalInfoSection>
                 
                <PracticalInfoSection title="Local Phrases" icon={<Languages className="h-6 w-6 text-primary" />}>
                     {practicalInfo.localPhrases && practicalInfo.localPhrases.length > 0 ? (
                        <ul className="space-y-1">
                           {practicalInfo.localPhrases.map((phrase, i) => (
                               <li key={i}><strong>{phrase.phrase}:</strong> "{phrase.translation}"</li>
                           ))}
                        </ul>
                     ) : (
                        <p>No specific local phrases provided.</p>
                     )}
                </PracticalInfoSection>

                {practicalInfo.currency && (
                     <PracticalInfoSection title="Currency" icon={<Tag className="h-6 w-6 text-primary" />}>
                        <p>{practicalInfo.currency}</p>
                     </PracticalInfoSection>
                )}

                <PracticalInfoSection title="Transportation Tips" icon={<TramFront className="h-6 w-6 text-primary" />}>
                     {practicalInfo.transportationTips && practicalInfo.transportationTips.length > 0 ? (
                         <ul className="list-disc pl-5 space-y-1">
                            {practicalInfo.transportationTips.map((tip, i) => <li key={i}>{tip}</li>)}
                        </ul>
                     ) : (
                        <p>No specific transportation tips provided.</p>
                     )}
                </PracticalInfoSection>

                {practicalInfo.visaInfo && (
                     <PracticalInfoSection title="Visa Information" icon={<Building2 className="h-6 w-6 text-primary" />}>
                        <p>{practicalInfo.visaInfo}</p>
                     </PracticalInfoSection>
                )}

                {practicalInfo.emergencyContacts && Object.keys(practicalInfo.emergencyContacts).length > 0 && (
                     <PracticalInfoSection title="Emergency Contacts" icon={<AlertCircle className="h-6 w-6 text-primary" />}>
                        <ul className="space-y-1">
                            {Object.entries(practicalInfo.emergencyContacts).map(([label, contact], i) => (
                                <li key={i}><strong>{label}:</strong> {contact}</li>
                            ))}
                        </ul>
                     </PracticalInfoSection>
                )}

            </CardContent>
        </Card>
      )}

    </div>
  );
}

function LoadingSkeleton() {
    return (
        <Card className="h-full border shadow-sm">
            <CardHeader>
                <Skeleton className="h-8 w-3/4" />
                <Skeleton className="h-4 w-1/2 mt-2" />
            </CardHeader>
            <CardContent className="space-y-6 pt-2">
                {[...Array(3)].map((_, i) => (
                    <div key={i} className="space-y-4 border-t pt-4">
                        <Skeleton className="h-7 w-1/2" />
                        <Skeleton className="w-full h-48 rounded-lg" />
                        <div className="pl-12 space-y-2 pt-2">
                          <Skeleton className="h-4 w-full" />
                          <Skeleton className="h-4 w-5/6" />
                        </div>
                    </div>
                ))}
            </CardContent>
        </Card>
    );
}
