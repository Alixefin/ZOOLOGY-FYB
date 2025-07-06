
"use client";

import Image from 'next/image';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAppContext } from '@/contexts/AppContext';
import { AssociationLogoPlaceholder } from '@/components/icons/AssociationLogoPlaceholder';
import { SchoolLogoPlaceholder } from '@/components/icons/SchoolLogoPlaceholder';
import { Users, CalendarDays } from 'lucide-react';

export default function HomePage() {
  const { logos } = useAppContext();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-background to-secondary/30 p-4 sm:p-8">
      <Card className="w-full max-w-2xl shadow-2xl rounded-xl overflow-hidden">
        <CardHeader className="bg-primary text-primary-foreground p-8 text-center relative">
          <Image
            alt="Person using a laptop"
            src="https://placehold.co/1000x500.png"
            data-ai-hint="laptop user"
            layout="fill"
            objectFit="cover"
            className="opacity-10 z-0"
          />
          <div className="relative z-10">
            <div className="flex flex-row items-center justify-center gap-6 mb-6">
              <div className="w-24 h-24 md:w-32 md:h-32 bg-primary-foreground/20 rounded-full p-2 flex items-center justify-center">
                {logos.associationLogo ? (
                  <Image src={logos.associationLogo} alt="Association Logo" width={128} height={128} className="object-contain rounded-full" unoptimized />
                ) : (
                  <AssociationLogoPlaceholder className="w-full h-full text-primary-foreground" />
                )}
              </div>
              <div className="w-24 h-24 md:w-32 md:h-32 bg-primary-foreground/20 rounded-full p-2 flex items-center justify-center">
                {logos.schoolLogo ? (
                  <Image src={logos.schoolLogo} alt="School Logo" width={128} height={128} className="object-contain rounded-full" unoptimized />
                ) : (
                  <SchoolLogoPlaceholder className="w-full h-full text-primary-foreground" />
                )}
              </div>
            </div>
            <h1 className="text-3xl md:text-4xl font-headline tracking-tight">
              Cyber Clan FYB Week
            </h1>
            <p className="text-lg md:text-xl font-body text-primary-foreground/80 mt-2">
              Nigerian Association of Computing Students (NACOS)
            </p>
            <p className="text-md font-body text-primary-foreground/70">
              Federal University Lokoja Chapter
            </p>
          </div>
        </CardHeader>
        <CardContent className="p-8 md:p-12 text-center">
          <p className="text-muted-foreground mb-8 text-lg font-body">
            Welcome to the official portal for the Final Year Brethren activities and celebrations.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <Button asChild size="lg" className="font-headline text-lg py-8 bg-accent hover:bg-accent/90 text-accent-foreground shadow-lg transition-transform hover:scale-105">
              <Link href="/fyb-students">
                <Users className="mr-3 h-6 w-6" />
                Meet the Cyber Clan
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="font-headline text-lg py-8 border-primary text-primary hover:bg-primary/10 shadow-lg transition-transform hover:scale-105">
              <Link href="/fyb-week">
                <CalendarDays className="mr-3 h-6 w-6" />
                Cyber Clan Week
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
      <footer className="mt-12 text-center">
        <p className="text-sm text-muted-foreground font-body">
          &copy; 2025 NACOS. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
