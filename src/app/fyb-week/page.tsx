
"use client";

import { useAppContext } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ArrowLeft, Info, Camera } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { addDays, format, isBefore, startOfToday } from 'date-fns';
import Image from 'next/image';

export default function FybWeekPage() {
  const { fybWeekSettings, fybWeekEvents, fybWeekGallery } = useAppContext();
  const router = useRouter();
  const today = startOfToday();

  const fybWeekStartDate = fybWeekSettings.startDate ? new Date(fybWeekSettings.startDate) : null;

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
      <main className="container mx-auto max-w-3xl space-y-8">
        
        {fybWeekSettings.scheduleDesignImage && (
          <div className="relative w-full h-64 rounded-xl overflow-hidden shadow-lg">
             <Image 
                src={fybWeekSettings.scheduleDesignImage} 
                alt="FYB Week Schedule Design" 
                layout="fill"
                objectFit="cover"
                unoptimized
             />
          </div>
        )}

        {!fybWeekStartDate && (
            <Card className="text-center p-8 bg-amber-100 dark:bg-amber-900/30 border-amber-500">
                <h3 className="font-headline text-xl text-amber-800 dark:text-amber-200">Schedule Coming Soon!</h3>
                <p className="text-muted-foreground">The event dates have not been set yet. Please check back later.</p>
            </Card>
        )}

        <Card className="shadow-lg rounded-2xl">
          <CardContent className="p-4">
             <Accordion type="multiple" className="w-full" defaultValue={['item-0']}>
                {fybWeekEvents.map((event, index) => {
                    const eventDate = fybWeekStartDate ? addDays(fybWeekStartDate, event.day_index) : null;
                    const hasPassed = eventDate ? isBefore(eventDate, today) : false;
                    const galleryForEvent = fybWeekGallery.filter(img => img.event_id === event.id);

                    return (
                        <AccordionItem key={event.id} value={`item-${index}`} className="border-b-2">
                            <AccordionTrigger className="text-lg font-headline hover:no-underline p-4">
                                <div className="flex items-center gap-4">
                                    <div className="bg-primary text-primary-foreground rounded-full w-10 h-10 flex items-center justify-center text-xl font-bold">
                                        {index + 1}
                                    </div>
                                    <div>
                                        <h3 className="text-left">Day {index + 1}: {event.title}</h3>
                                        {eventDate && (
                                            <p className="text-sm text-muted-foreground font-normal text-left">
                                                {format(eventDate, 'EEEE, MMM d')}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </AccordionTrigger>
                            <AccordionContent className="p-4 pt-0">
                                <div className="pl-14 space-y-4">
                                    <p className="text-muted-foreground">{event.description || "Event details will be displayed here."}</p>
                                    
                                    {galleryForEvent.length > 0 && (
                                        <div>
                                            <h4 className="font-semibold mb-2">Event Highlights:</h4>
                                            <div className="flex gap-2 overflow-x-auto pb-2">
                                                {galleryForEvent.slice(0, 5).map(img => (
                                                    <div key={img.id} className="flex-shrink-0 w-32 h-32 relative rounded-md overflow-hidden bg-muted">
                                                        <Image src={img.image_url} alt={event.title} layout="fill" objectFit="contain" unoptimized/>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {hasPassed && (
                                        <Button asChild variant="outline">
                                            <Link href={`/fyb-week/gallery/${event.day_index}`}>
                                                <Camera className="mr-2 h-4 w-4" /> View Full Gallery ({galleryForEvent.length})
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
