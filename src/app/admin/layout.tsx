
"use client";

import type { ReactNode } from 'react';
import { useState, useEffect } from 'react';
import { useAppContext } from '@/contexts/AppContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Lock, LogIn } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { AssociationLogoPlaceholder } from '@/components/icons/AssociationLogoPlaceholder';

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { isAdminLoggedIn, loginAdmin, adminPin, logos } = useAppContext();
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginAdmin(pin)) {
      setError('');
    } else {
      setError('Invalid PIN. Please try again.');
      setPin('');
    }
  };

  if (!isClient) {
    // Avoid rendering login form on server or during hydration mismatch
    return <div className="flex items-center justify-center min-h-screen bg-background"><p>Loading admin area...</p></div>;
  }

  if (!isAdminLoggedIn) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-primary/10 to-secondary/20 p-4">
        <Link href="/" className="mb-8">
            {logos.associationLogo ? (
                <Image src={logos.associationLogo} alt="Association Logo" width={100} height={100} className="object-contain" unoptimized />
              ) : (
                <AssociationLogoPlaceholder className="w-24 h-24 text-primary" />
            )}
        </Link>
        <Card className="w-full max-w-md shadow-2xl">
          <CardHeader className="text-center">
            <Lock className="mx-auto h-12 w-12 text-primary mb-4" />
            <CardTitle className="text-2xl font-headline">Admin Access</CardTitle>
            <CardDescription>Enter the PIN to manage the application content.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-6">
              <Input
                type="password"
                placeholder="Enter PIN"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                className="text-center text-lg py-6"
                aria-label="Admin PIN"
              />
              {error && <p className="text-destructive text-sm text-center">{error}</p>}
              <Button type="submit" className="w-full text-lg py-6 bg-primary hover:bg-primary/90">
                <LogIn className="mr-2 h-5 w-5" /> Unlock
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <div className="admin-dashboard">{children}</div>;
}
