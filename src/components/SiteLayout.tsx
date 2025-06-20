
"use client";

import type { ReactNode } from 'react';
import { useState, useEffect } from 'react';
import LoadingScreen from '@/components/LoadingScreen';
import { usePathname } from 'next/navigation';

export default function SiteLayout({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const pathname = usePathname();

  useEffect(() => {
    // Show loading screen for a short duration on initial load or critical path changes
    // This is a simple example; more complex logic might be needed for specific routes
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500); // Adjust duration as needed

    return () => clearTimeout(timer);
  }, [pathname]); // Re-trigger on path change if desired, or remove pathname for initial load only

  // If you want loading screen ONLY on first app load, adjust useEffect dependency array to []
  // and manage initial state carefully to avoid flash of content.
  // For this example, it shows briefly on each navigation to simulate "loading section".
  
  // A better approach for initial-only loading:
  // const [initialLoading, setInitialLoading] = useState(true);
  // useEffect(() => {
  //   const timer = setTimeout(() => setInitialLoading(false), 2000);
  //   return () => clearTimeout(timer);
  // }, []);
  // if (initialLoading && !sessionStorage.getItem('siteLoadedBefore')) {
  //    sessionStorage.setItem('siteLoadedBefore', 'true');
  //    return <LoadingScreen />;
  // }
  // This version still has a small flicker issue and hydration.
  // The simplest for now is a short loading screen always.


  if (isLoading) {
    return <LoadingScreen />;
  }

  return <>{children}</>;
}
