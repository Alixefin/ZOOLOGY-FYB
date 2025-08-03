
"use client";

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Camera } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAppContext } from '@/contexts/AppContext';
import Image from 'next/image';

export default function FybWeekGalleryPage() {
    const pathname = usePathname();
    const { fybWeekEvents, fybWeekGallery } = useAppContext();

    const dayIndexStr = pathname.split('/').pop() || '0';
    const dayIndex = parseInt(dayIndexStr, 10);

    const event = fybWeekEvents.find(e => e.day_index === dayIndex);
    const galleryImages = fybWeekGallery.filter(img => img.event_id === event?.id);

    return (
        <div className="min-h-screen bg-background p-4 md:p-8">
            <header className="mb-8 container mx-auto max-w-5xl">
                <Button variant="outline" asChild>
                    <Link href="/fyb-week"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Schedule</Link>
                </Button>
            </header>
            <main className="container mx-auto max-w-5xl">
                <Card className="shadow-lg">
                    <CardHeader>
                        <CardTitle className="text-3xl font-headline text-primary">Media Gallery: {event?.title || `Day ${dayIndex + 1}`}</CardTitle>
                        <CardDescription>{event?.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {galleryImages.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                {galleryImages.map(image => (
                                    <div key={image.id} className="relative overflow-hidden rounded-lg shadow-md bg-muted flex items-center justify-center">
                                        <Image
                                            src={image.image_url}
                                            alt={`Gallery image for ${event?.title}`}
                                            width={500}
                                            height={500}
                                            className="w-full h-auto object-contain transition-transform duration-300 hover:scale-105"
                                            unoptimized
                                        />
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center text-center h-80">
                                <Camera className="h-24 w-24 text-muted-foreground mb-4" />
                                <h2 className="text-2xl font-semibold">Gallery is Empty</h2>
                                <p className="text-muted-foreground mt-2">
                                    No photos or videos have been uploaded for this event yet.
                                    <br />
                                    Please check back later!
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </main>
        </div>
    );
}
