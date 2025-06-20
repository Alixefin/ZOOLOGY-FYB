
"use client";

import Image from 'next/image';
import { useAppContext } from '@/contexts/AppContext';
import { AssociationLogoPlaceholder } from '@/components/icons/AssociationLogoPlaceholder';

export default function LoadingScreen() {
  const { logos } = useAppContext(); // Access logos, though might not be loaded yet if AppProvider is a child
                                     // For simplicity, we can use a static placeholder or the context's default

  return (
    <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-background transition-opacity duration-500">
      <div className="w-32 h-32 md:w-48 md:h-48 animate-pulse">
        {logos?.associationLogo ? (
          <Image src={logos.associationLogo} alt="Association Logo" width={192} height={192} className="object-contain" unoptimized />
        ) : (
          <AssociationLogoPlaceholder className="w-full h-full text-primary" />
        )}
      </div>
      <p className="mt-4 text-lg font-headline text-primary">Loading Zoology FYB Week...</p>
    </div>
  );
}
