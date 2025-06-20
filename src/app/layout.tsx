
import type { Metadata } from 'next';
import './globals.css';
import { AppProvider } from '@/contexts/AppContext';
import { Toaster } from "@/components/ui/toaster";
import SiteLayout from '@/components/SiteLayout'; // To handle loading screen logic client-side

export const metadata: Metadata = {
  title: 'Zoology FYB Week',
  description: 'Online magazine for the National Association of Zoology Students (NAZS), Lokoja Chapter, FULOKOJA.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Alegreya:ital,wght@0,400..900;1,400..900&family=Belleza&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <AppProvider>
          <SiteLayout>
            {children}
          </SiteLayout>
          <Toaster />
        </AppProvider>
      </body>
    </html>
  );
}
