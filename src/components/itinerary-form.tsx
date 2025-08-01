
'use client';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Loader2, Plus, Minus, UserCheck, Briefcase, Heart, Users, Backpack } from 'lucide-react';
import type { GeneratePersonalizedItineraryInput } from '@/ai/flows/itinerary-schemas';

const suggestedInterests = [
  { id: 'hiking', label: 'Hiking' },
  { id: 'food', label: 'Food' },
  { id: 'history', label: 'History' },
  { id: 'art', label: 'Art' },
  { id: 'nightlife', label: 'Nightlife' },
  { id: 'shopping', label: 'Shopping' },
] as const;

const travelStyles = [
  { id: 'backpacker', label: 'Backpacker', icon: <Backpack className="h-5 w-5" /> },
  { id: 'luxury', label: 'Luxury Seeker', icon: <Briefcase className="h-5 w-5" /> },
  { id: 'family', label: 'Family with Kids', icon: <Users className="h-5 w-5" /> },
  { id: 'romantic', label: 'Romantic Getaway', icon: <Heart className="h-5 w-5" /> },
] as const;

const formSchema = z.object({
  destination: z.string().min(2, { message: 'Destination must be at least 2 characters.' }),
  duration: z.coerce.number().int().min(1, { message: 'Duration must be at least 1 day.' }).max(14, { message: 'Duration cannot exceed 14 days.'}),
  travelStyle: z.string().optional(),
  suggestedInterests: z.array(z.string()).optional(),
  otherInterests: z.array(z.object({ value: z.string() })).optional(),
  budget: z.enum(['low', 'medium', 'high'], { required_error: 'Please select a budget level.'}),
}).refine(data => {
    const hasSuggestedInterest = data.suggestedInterests && data.suggestedInterests.length > 0;
    const hasOtherInterest = data.otherInterests && data.otherInterests.some(i => i.value.trim() !== '');
    return hasSuggestedInterest || hasOtherInterest;
}, {
    message: "Please select at least one interest or add your own.",
    path: ["suggestedInterests"], 
});


type ItineraryFormValues = z.infer<typeof formSchema>;

interface ItineraryFormProps {
  onSubmit: (data: GeneratePersonalizedItineraryInput) => void;
  isLoading: boolean;
}

export function ItineraryForm({ onSubmit, isLoading }: ItineraryFormProps) {
  const form = useForm<ItineraryFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      destination: '',
      duration: 3,
      suggestedInterests: [],
      otherInterests: [{ value: "" }],
      budget: 'medium',
      travelStyle: '',
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "otherInterests"
  });

  const handleFormSubmit = (data: ItineraryFormValues) => {
    const otherInterestsFiltered = data.otherInterests?.map(i => i.value).filter(i => i.trim() !== '') || [];
    const combinedInterests = [
        ...(data.suggestedInterests || []),
        ...otherInterestsFiltered
    ].join(', ');

    onSubmit({
        destination: data.destination,
        duration: data.duration,
        interests: combinedInterests,
        budget: data.budget,
        travelStyle: data.travelStyle,
    });
  };

  return (
    <Card className="border shadow-sm">
      <CardHeader>
        <CardTitle className="font-headline text-3xl">Plan Your Trip</CardTitle>
        <CardDescription>Tell us your travel preferences.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="destination"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Destination</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Paris, France" {...field} disabled={isLoading} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="duration"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Duration (in days)</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="e.g., 7" {...field} disabled={isLoading} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="budget"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Budget</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex flex-col space-y-1"
                      disabled={isLoading}
                    >
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="low" />
                        </FormControl>
                        <FormLabel className="font-normal">Budget-Friendly</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="medium" />
                        </FormControl>
                        <FormLabel className="font-normal">Moderate</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="high" />
                        </FormControl>
                        <FormLabel className="font-normal">Luxury</FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="travelStyle"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Travel Style (Optional)</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="grid grid-cols-2 gap-4"
                      disabled={isLoading}
                    >
                      {travelStyles.map((style) => (
                         <FormItem key={style.id}>
                          <FormControl>
                            <RadioGroupItem value={style.id} className="sr-only peer" />
                          </FormControl>
                          <FormLabel className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer">
                              {style.icon}
                              {style.label}
                          </FormLabel>
                        </FormItem>
                      ))}
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="suggestedInterests"
              render={() => (
                <FormItem>
                  <div className="mb-4">
                    <FormLabel className="text-base">Interests</FormLabel>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {suggestedInterests.map((item) => (
                      <FormField
                        key={item.id}
                        control={form.control}
                        name="suggestedInterests"
                        render={({ field }) => {
                          return (
                            <FormItem
                              key={item.id}
                              className="flex flex-row items-start space-x-3 space-y-0"
                            >
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(item.id)}
                                  onCheckedChange={(checked) => {
                                    return checked
                                      ? field.onChange([...(field.value || []), item.id])
                                      : field.onChange(
                                          field.value?.filter(
                                            (value) => value !== item.id
                                          )
                                        )
                                  }}
                                  disabled={isLoading}
                                />
                              </FormControl>
                              <FormLabel className="font-normal">
                                {item.label}
                              </FormLabel>
                            </FormItem>
                          )
                        }}
                      />
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="space-y-3">
               <FormLabel>Other Interests</FormLabel>
              {fields.map((field, index) => (
                <FormField
                  control={form.control}
                  key={field.id}
                  name={`otherInterests.${index}.value`}
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center gap-2">
                         <FormControl>
                          <Input {...field} placeholder="e.g., local markets" disabled={isLoading}/>
                        </FormControl>
                        <Button type="button" variant="outline" size="icon" onClick={() => remove(index)} disabled={isLoading || fields.length <= 1}>
                          <Minus className="h-4 w-4" />
                        </Button>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ))}
               <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={() => append({ value: "" })}
                disabled={isLoading}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Interest
              </Button>
            </div>


            <Button type="submit" disabled={isLoading} className="w-full text-lg py-6 font-bold">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                  Generating...
                </>
              ) : (
                'Create My Itinerary'
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
