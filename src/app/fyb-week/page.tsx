
"use client";

import { useAppContext } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ArrowLeft, Info, Calendar, Shirt, Gamepad2, Mic, PartyPopper, Award as AwardIcon, Camera } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { addDays, format, isBefore, startOfToday } from 'date-fns';

// --- Configuration ---
// Set the start date of the FYB week here.
// The schedule will be calculated based on this date.
const fybWeekStartDate = new Date('2025-09-08'); 
// -------------------

const schedule = [
  { dayIndex: 0, title: "Back to School (Primary/Secondary)", icon: Shirt },
  { dayIndex: 1, title: "Jersey Day", icon: Gamepad2 },
  { dayIndex: 2, title: "Talent Hunt", icon: Mic },
  { dayIndex: 3, title: "Traditional Day / Food Competition", icon: PartyPopper },
  { dayIndex: 4, title: "Dinner / Award Night", icon: AwardIcon },
];

export default function FybWeekPage() {
  const { fybWeekSettings } = useAppContext();
  const router = useRouter();
  const today = startOfToday();

  if (!fybWeekSettings.isFybWeekActive) {
    return (
     <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
       <Info className="h-16 w-16 text-destructive mb-4" />
       <h1 className="text-3xl font-headline text-destructive mb-2">FYB Week Not Active</h1>
       <p className="text-muted-foreground mb-6">The FYB week schedule is not currently available. Please check back later.</p>
       <Button onClick={() => router.push('/')}><ArrowLeft className="mr-2 h-4 w-4" /> Back to Home</Button>
     </div>
   );
 }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <header className="mb-8 container mx-auto max-w-3xl">
        <Button variant="outline" asChild>
            <Link href="/"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Home</Link>
        </Button>
        <div className="text-center mt-4">
            <h1 className="text-4xl font-headline text-foreground mb-2 font-bold">Final Year Brethren Week</h1>
            <p className="text-lg text-muted-foreground font-body">Get ready for an unforgettable week of fun, learning, and connection!</p>
        </div>
      </header>
      <main className="container mx-auto max-w-3xl">
        <Card className="shadow-lg rounded-2xl">
          <CardContent className="p-4">
             <Accordion type="multiple" className="w-full">
                {schedule.map((item, index) => {
                    const eventDate = addDays(fybWeekStartDate, item.dayIndex);
                    const hasPassed = isBefore(eventDate, today);

                    return (
                        <AccordionItem key={index} value={`item-${index}`} className="border-b-2">
                            <AccordionTrigger className="text-lg font-headline hover:no-underline p-4">
                                <div className="flex items-center gap-4">
                                    <div className="bg-primary text-primary-foreground rounded-full w-10 h-10 flex items-center justify-center text-xl font-bold">
                                        {index + 1}
                                    </div>
                                    <div>
                                        <h3 className="text-left">Day {index + 1}: {item.title}</h3>
                                        <p className="text-sm text-muted-foreground font-normal text-left">{format(eventDate, 'EEEE, MMM d')}</p>
                                    </div>
                                </div>
                            </AccordionTrigger>
                            <AccordionContent className="p-4 pt-0">
                                <div className="pl-14">
                                    <p className="text-muted-foreground mb-4">Event details will be displayed here.</p>
                                    {hasPassed && (
                                        <Button asChild variant="outline">
                                            <Link href={`/fyb-week/gallery/${format(eventDate, 'EEEE').toLowerCase()}`}>
                                                <Camera className="mr-2 h-4 w-4" /> View Media Gallery
                                            </Link>
                                        </Button>
                                    )}
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                    )
                })}
             </Accordion>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

