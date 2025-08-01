
'use client';

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Share, Copy, Check, FileText, Printer } from 'lucide-react';
import type { GeneratePersonalizedItineraryOutput } from '@/ai/flows/itinerary-schemas';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PrintView } from './print-view';
import { renderToStaticMarkup } from 'react-dom/server';


interface ExportDialogProps {
  itineraryData: GeneratePersonalizedItineraryOutput;
}

function generatePlainText(itineraryData: GeneratePersonalizedItineraryOutput): string {
    const { itinerary, budget, practicalInfo } = itineraryData;
    const destination = itineraryData.input.destination || 'your destination';

    let text = `Your Trip to ${destination}\n\n`;

    if (budget) {
        const total = (budget.accommodation + budget.food + budget.activities) * itinerary.length;
        text += `## Estimated Budget ##\n`;
        text += `- Total for ${itinerary.length} days: $${total.toFixed(2)}\n`;
        text += `- Accommodation (per day): $${budget.accommodation.toFixed(2)}\n`;
        text += `- Food (per day): $${budget.food.toFixed(2)}\n`;
        text += `- Activities (per day): $${budget.activities.toFixed(2)}\n\n`;
    }
    
    if (practicalInfo) {
        text += `## Practical Information ##\n\n`;
        text += `### Packing List ###\n${practicalInfo.packingList.map(item => `- ${item}`).join('\n')}\n\n`;
        text += `### Local Etiquette ###\n${practicalInfo.localEtiquette.map(item => `- ${item}`).join('\n')}\n\n`;
        text += `### Local Phrases ###\n${practicalInfo.localPhrases.map(item => `- ${item.phrase}: "${item.translation}"`).join('\n')}\n\n`;
        text += `### Transportation Tips ###\n${practicalInfo.transportationTips.map(item => `- ${item}`).join('\n')}\n\n`;
    }


    itinerary.forEach(day => {
        text += `## Day ${day.day}: ${day.title} ##\n\n`;
        
        text += `### ${day.morning.title} ###\n`;
        day.morning.activities.forEach(act => {
        text += `- ${act.activity}: ${act.description}\n`;
        });
        text += `\n`;

        text += `### ${day.afternoon.title} ###\n`;
        day.afternoon.activities.forEach(act => {
        text += `- ${act.activity}: ${act.description}\n`;
        });
        text += `\n`;

        text += `### ${day.evening.title} ###\n`;
        day.evening.activities.forEach(act => {
        text += `- ${act.activity}: ${act.description}\n`;
        });
        text += `\n`;
    });

    return text;
}


export function ExportDialog({ itineraryData }: ExportDialogProps) {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const plainTextContent = useMemo(() => generatePlainText(itineraryData), [itineraryData]);

  const handleCopy = () => {
    navigator.clipboard.writeText(plainTextContent).then(() => {
      setCopied(true);
      toast({ title: 'Copied to clipboard!' });
      setTimeout(() => setCopied(false), 2000);
    }).catch(err => {
      console.error('Failed to copy text: ', err);
      toast({ variant: 'destructive', title: 'Failed to copy', description: 'Could not copy text to clipboard.' });
    });
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
        const printContent = renderToStaticMarkup(<PrintView itineraryData={itineraryData} />);
        printWindow.document.write(`
            <html>
                <head>
                    <title>Print Itinerary</title>
                    <style>
                        @import url('https://fonts.googleapis.com/css2?family=Alegreya:wght@400;700&family=Belleza&display=swap');
                        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600&display=swap');
                        
                        body { 
                            font-family: 'Poppins', sans-serif;
                            margin: 0; 
                            -webkit-print-color-adjust: exact;
                            print-color-adjust: exact;
                            background-color: #f8f9fa;
                            color: #343a40;
                        }
                        .print-container {
                            max-width: 800px;
                            margin: 2rem auto;
                            padding: 2rem;
                            background-color: #ffffff;
                            box-shadow: 0 0 20px rgba(0,0,0,0.05);
                        }
                        .print-h1 { font-family: 'Belleza', sans-serif; font-size: 2.8rem; color: #212529; text-align: center; margin-bottom: 0.5rem; }
                        .print-overview { text-align: center; font-size: 1.1rem; color: #6c757d; margin-bottom: 2rem; }
                        .print-h2 { font-family: 'Belleza', sans-serif; font-size: 2rem; color: #343a40; margin-top: 2rem; border-bottom: 2px solid hsl(39 100% 64%); padding-bottom: 0.5rem; margin-bottom: 1.5rem; display: flex; align-items: center; gap: 0.75rem;}
                        .print-h3 { font-family: 'Poppins', sans-serif; font-weight: 600; font-size: 1.25rem; color: #495057; margin-top: 1.5rem; margin-bottom: 0.75rem; display: flex; align-items: center; gap: 0.5rem; }
                        .print-h4 { font-family: 'Poppins', sans-serif; font-weight: 500; font-size: 1rem; color: #495057; margin-bottom: 0.5rem; }

                        ul { list-style-type: none; padding-left: 0; }
                        li { margin-bottom: 0.75rem; padding-left: 1.5rem; position: relative; }
                        li::before {
                            content: '•';
                            position: absolute;
                            left: 0;
                            color: hsl(39 100% 64%);
                            font-weight: bold;
                            display: inline-block;
                            width: 1em;
                        }

                        strong { font-weight: 600; color: #212529; }
                        p { color: #495057; line-height: 1.6; margin: 0.25rem 0; }
                        
                        .page-break-before { page-break-before: always; }
                        .print-section-card { background-color: #fff; border: 1px solid #dee2e6; padding: 1.5rem; border-radius: 12px; margin-bottom: 2rem; page-break-inside: avoid; }
                        .print-day-section { margin-top: 2rem; }
                        
                        .print-day-image { margin-bottom: 1.5rem; }
                        .print-day-image img { width: 100%; border-radius: 12px; object-fit: cover; aspect-ratio: 16/9; }
                        
                        .print-activity-time { font-style: italic; color: #6c757d; }
                        .print-activity-description { margin-top: 0.25rem; padding-left: 1.5rem; border-left: 2px solid #e9ecef; }
                        .print-activity-location { font-size: 0.9rem; color: #6c757d; padding-left: 1.5rem; }
                        .print-activity-cost { font-size: 0.9rem; font-weight: 500; color: #212529; margin-top: 0.25rem; padding-left: 1.5rem; }

                        .icon { width: 24px; height: 24px; fill: hsl(39 100% 64%); }
                        .icon-sm { width: 20px; height: 20px; fill: hsl(39 100% 64%); }
                        
                        .print-qr-code { text-align: center; }
                        .print-map-url { text-align: center; font-size: 0.8rem; word-break: break-all; margin-top: 0.5rem; }

                        .print-notes-photos-section { page-break-inside: avoid; margin-top: 2rem; display: flex; gap: 1.5rem; }
                        .print-notes, .print-photos { flex: 1; }
                        .print-notes-box { height: 150px; border: 1px dashed #ced4da; border-radius: 8px; padding: 0.75rem; background-color: #f8f9fa; }
                        .print-photos-box { height: 150px; border: 2px dashed #ced4da; border-radius: 8px; display: flex; align-items: center; justify-content: center; background-color: #f8f9fa; color: #adb5bd; font-style: italic; }


                        @media print {
                            body { margin: 0; background-color: #fff; }
                            .print-container { margin: 0; padding: 1in; box-shadow: none; }
                            h1, h2, h3 { color: #000; }
                        }
                    </style>
                </head>
                <body>
                    <div class="print-container">
                      ${printContent}
                    </div>
                </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.focus();
        
        // Add a small delay to allow images to render before printing
        setTimeout(() => {
            printWindow.print();
            printWindow.close();
        }, 500);

    } else {
        toast({ variant: 'destructive', title: 'Could not open print window', description: 'Please check your browser\'s pop-up settings.' });
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Share className="mr-2 h-4 w-4" />
          Export
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle>Export Itinerary</DialogTitle>
          <DialogDescription>
            Choose your preferred export format.
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="text" className="w-full mt-4">
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="text"><FileText className="mr-2"/>Plain Text</TabsTrigger>
                <TabsTrigger value="print"><Printer className="mr-2"/>Print / PDF</TabsTrigger>
            </TabsList>
            <TabsContent value="text" className="mt-4">
                 <div className="my-4">
                    <Textarea
                        readOnly
                        value={plainTextContent}
                        className="h-80 resize-none bg-muted font-mono"
                        aria-label="Itinerary in plain text format"
                    />
                    </div>
                    <Button onClick={handleCopy} className="w-full">
                        {copied ? <Check className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />}
                        {copied ? 'Copied!' : 'Copy to Clipboard'}
                    </Button>
            </TabsContent>
            <TabsContent value="print" className="mt-4">
                <div className="my-4 p-6 bg-muted rounded-lg text-center">
                    <Printer className="h-12 w-12 mx-auto text-muted-foreground mb-4"/>
                    <h4 className="font-semibold text-lg">Print to PDF</h4>
                    <p className="text-muted-foreground mt-2">
                        This will open a print-friendly version of your itinerary.
                        You can then use your browser's print dialog to save it as a PDF file.
                    </p>
                </div>
                 <Button onClick={handlePrint} className="w-full">
                    <Printer className="mr-2 h-4 w-4" />
                    Open Print View
                </Button>
            </TabsContent>
        </Tabs>
        
        <DialogFooter className="mt-4">
            <DialogClose asChild>
                <Button type="button" variant="secondary">
                    Close
                </Button>
            </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
