
"use client";

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Camera } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

export default function FybWeekGalleryPage() {
    const pathname = usePathname();
    const router = useRouter();
    const day = pathname.split('/').pop() || 'event';
    const capitalizedDay = day.charAt(0).toUpperCase() + day.slice(1);

    return (
        <div className="min-h-screen bg-background p-4 md:p-8">
            <header className="mb-8 container mx-auto max-w-3xl">
                <Button variant="outline" asChild>
                    <Link href="/fyb-week"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Schedule</Link>
                </Button>
            </header>
            <main className="container mx-auto max-w-3xl">
                <Card className="shadow-lg">
                    <CardHeader>
                        <CardTitle className="text-3xl font-headline text-primary">Media Gallery: {capitalizedDay}</CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center justify-center text-center h-96">
                        <Camera className="h-24 w-24 text-muted-foreground mb-4" />
                        <h2 className="text-2xl font-semibold">Coming Soon!</h2>
                        <p className="text-muted-foreground mt-2">
                            The media gallery for this day's event is not yet available.
                            <br />
                            Please check back later for photos and videos!
                        </p>
                    </CardContent>
                </Card>
            </main>
        </div>
    );
}
