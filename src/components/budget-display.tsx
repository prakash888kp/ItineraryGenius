// src/components/budget-display.tsx
'use client';

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import type { GeneratePersonalizedItineraryOutput } from '@/ai/flows/itinerary-schemas';
import { Separator } from './ui/separator';

interface BudgetDisplayProps {
  budget: GeneratePersonalizedItineraryOutput['budget'];
  duration: number;
}

export function BudgetDisplay({ budget, duration }: BudgetDisplayProps) {
  const totalBudget = {
    accommodation: budget.accommodation * duration,
    food: budget.food * duration,
    activities: budget.activities * duration,
  };
  const grandTotal = totalBudget.accommodation + totalBudget.food + totalBudget.activities;

  const chartData = [
    { name: 'Accommodation', cost: totalBudget.accommodation, fill: 'hsl(var(--chart-1))' },
    { name: 'Food', cost: totalBudget.food, fill: 'hsl(var(--chart-2))' },
    { name: 'Activities', cost: totalBudget.activities, fill: 'hsl(var(--chart-3))' },
  ];

  return (
    <Card className="border shadow-sm mt-6">
      <CardHeader>
        <CardTitle className="font-headline text-2xl">Estimated Budget</CardTitle>
        <CardDescription>
          Estimated cost for a {duration}-day trip. All values are in USD.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="flex flex-col justify-center">
            <p className="text-sm text-muted-foreground">Total Estimated Cost</p>
            <p className="text-4xl font-bold text-primary">${grandTotal.toFixed(2)}</p>
            <div className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between"><span>Accommodation:</span> <span>${totalBudget.accommodation.toFixed(2)}</span></div>
                <div className="flex justify-between"><span>Food:</span> <span>${totalBudget.food.toFixed(2)}</span></div>
                <div className="flex justify-between"><span>Activities:</span> <span>${totalBudget.activities.toFixed(2)}</span></div>
            </div>

            {/* Detailed Budget Breakdown */}
            {(budget.accommodationOptions || budget.activityCosts) && (
                <div className="mt-6 pt-4 border-t">
                    <h4 className="font-semibold text-card-foreground mb-3">Detailed Breakdown</h4>
                    {budget.accommodationOptions && budget.accommodationOptions.length > 0 && (
                        <div className="mb-4">
                            <h5 className="font-medium text-card-foreground mb-1">Accommodation Options:</h5>
                            <ul className="text-sm text-muted-foreground space-y-1">
                                {budget.accommodationOptions.map((option, i) => (
                                    <li key={i} className="flex justify-between">
                                        <span>{option.type}:</span> <span>${option.costPerNight.toFixed(2)} / night</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                    {budget.activityCosts && budget.activityCosts.length > 0 && (
                         <div>
                            <h5 className="font-medium text-card-foreground mb-1">Specific Activity Costs:</h5>
                             <ul className="text-sm text-muted-foreground space-y-1">
                                {budget.activityCosts.map((activity, i) => (
                                    <li key={i} className="flex justify-between">
                                        <span>{activity.activityName}:</span> <span>${activity.estimatedCost.toFixed(2)}</span>
                                    </li>
                                ))}
                            </ul>
                         </div>
                    )}
                </div>
            )}

        </div>
        <div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData} layout="vertical" margin={{ left: 10, right: 10 }}>
              <XAxis type="number" hide />
              <YAxis
                dataKey="name"
                type="category"
                tickLine={false}
                axisLine={false}
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tick={{ fill: 'hsl(var(--muted-foreground))' }}
              />
              <Tooltip
                cursor={{ fill: 'hsl(var(--card))' }}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="rounded-lg border bg-background p-2 shadow-sm">
                        <p className="text-sm font-bold">{`${payload[0].name}: $${payload[0].value?.toFixed(2)}`}</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="cost" radius={[4, 4, 4, 4]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
