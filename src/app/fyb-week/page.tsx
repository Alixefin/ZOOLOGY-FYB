
"use client";

import { useAppContext } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Info, Calendar, Shirt, Gamepad2, Mic, PartyPopper } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const schedule = [
  { day: "Monday", event: "Back to School (Primary/Secondary)", icon: Shirt },
  { day: "Tuesday", event: "Jersey Day", icon: Gamepad2 },
  { day: "Wednesday", event: "Talent Hunt", icon: Mic },
  { day: "Thursday", event: "Traditional Day / Food Competition", icon: PartyPopper },
  { day: "Friday", event: "Dinner / Award Night", icon: Award },
];

export default function FybWeekPage() {
  const { fybWeekSettings } = useAppContext();
  const router = useRouter();

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
        <Button variant="outline" asChild className="mb-4">
            <Link href="/"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Home</Link>
        </Button>
        <h1 className="text-4xl font-headline text-primary mb-2 font-bold">FYB Week Schedule</h1>
        <p className="text-lg text-muted-foreground font-body">Check out the events planned for the week!</p>
      </header>
      <main className="container mx-auto max-w-3xl">
        <Card className="shadow-lg">
          <CardContent className="p-6">
            <div className="space-y-6">
              {schedule.map((item, index) => (
                <div key={index} className="flex items-start space-x-4">
                  <div className="flex flex-col items-center">
                    <div className="bg-primary text-primary-foreground rounded-full w-12 h-12 flex items-center justify-center">
                      <item.icon className="w-6 h-6" />
                    </div>
                    {index < schedule.length - 1 && (
                      <div className="w-px h-12 bg-border mt-2"></div>
                    )}
                  </div>
                  <div>
                    <h3 className="text-xl font-headline font-semibold text-primary">{item.day}</h3>
                    <p className="text-muted-foreground">{item.event}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
