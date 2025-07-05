
"use client";

import { useAppContext } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, CalendarCheck, Image as ImageIcon, Download, Construction } from 'lucide-react';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function FybWeekPage() {
  const { fybWeekSettings } = useAppContext();

  const handleDownloadImage = (imageSrc: string, imageName: string) => {
    const link = document.createElement('a');
    link.href = imageSrc;
    link.download = imageName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <header className="mb-8 container mx-auto max-w-5xl">
        <Button variant="outline" asChild className="mb-4">
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
          </Link>
        </Button>
        <h1 className="text-4xl font-headline text-primary mb-2">{fybWeekSettings.title || "Cyber Clan Week"}</h1>
        <p className="text-lg text-muted-foreground font-body">
          {fybWeekSettings.isUnlocked ? "Check out the schedule, activities, and photos from the week!" : "Stay tuned for exciting updates about the Cyber Clan Week!"}
        </p>
      </header>

      <main className="container mx-auto max-w-5xl">
        {!fybWeekSettings.isUnlocked ? (
          <Card className="text-center shadow-lg rounded-xl">
            <CardHeader>
              <div className="mx-auto bg-primary/10 rounded-full p-4 w-fit mb-4">
                <Construction className="h-16 w-16 text-primary" />
              </div>
              <CardTitle className="text-3xl font-headline text-primary">Coming Soon!</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xl text-muted-foreground font-body mb-2">
                The Cyber Clan Week page is currently under construction.
              </p>
              <p className="text-md text-muted-foreground/80 font-body">
                Our team is working hard to bring you all the details. Please check back later!
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-8">
            <Card className="shadow-lg rounded-xl">
              <CardHeader>
                <CardTitle className="text-2xl font-headline text-primary flex items-center">
                  <CalendarCheck className="mr-3 h-7 w-7" /> Schedule
                </CardTitle>
                <CardDescription className="font-body">The official timeline of events for the Cyber Clan Week.</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-60 w-full rounded-md border p-4 bg-muted/30">
                  <pre className="whitespace-pre-wrap font-body text-sm leading-relaxed text-foreground">
                    {fybWeekSettings.schedule || "No schedule details available yet."}
                  </pre>
                </ScrollArea>
              </CardContent>
            </Card>

            <Card className="shadow-lg rounded-xl">
              <CardHeader>
                <CardTitle className="text-2xl font-headline text-primary flex items-center">
                  <CalendarCheck className="mr-3 h-7 w-7" /> Activities
                </CardTitle>
                <CardDescription className="font-body">Details about the planned activities.</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-60 w-full rounded-md border p-4 bg-muted/30">
                  <pre className="whitespace-pre-wrap font-body text-sm leading-relaxed text-foreground">
                    {fybWeekSettings.activities || "No activity details available yet."}
                  </pre>
                </ScrollArea>
              </CardContent>
            </Card>

            <Card className="shadow-lg rounded-xl">
              <CardHeader>
                <CardTitle className="text-2xl font-headline text-primary flex items-center">
                  <ImageIcon className="mr-3 h-7 w-7" /> Event Gallery
                </CardTitle>
                <CardDescription className="font-body">Memories from the Cyber Clan Week events. Click to download.</CardDescription>
              </CardHeader>
              <CardContent>
                {fybWeekSettings.eventImages.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {fybWeekSettings.eventImages.map((image) => (
                      <div key={image.id} className="group relative aspect-square rounded-md overflow-hidden border">
                        <Image src={image.src} alt={image.name || 'Event image'} layout="fill" objectFit="cover" unoptimized />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-2">
                          <p className="text-xs text-white text-center truncate mb-2">{image.name}</p>
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => handleDownloadImage(image.src, image.name || `event_image_${image.id}.png`)}
                            className="bg-accent hover:bg-accent/90 text-accent-foreground"
                          >
                            <Download className="mr-2 h-4 w-4" /> Download
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground font-body text-center py-8">No event images uploaded yet.</p>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
