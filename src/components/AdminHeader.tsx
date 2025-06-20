
"use client";

import { Button } from "@/components/ui/button";
import { useAppContext } from "@/contexts/AppContext";
import { LogOut, Home } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

export default function AdminHeader() {
  const { logoutAdmin, logos } = useAppContext();
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = () => {
    logoutAdmin();
    router.push('/admin'); // Redirect to PIN screen
  };

  return (
    <header className="bg-card shadow-md p-4 mb-8 sticky top-0 z-50">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/admin" className="flex items-center gap-2">
           {/* Placeholder for a small admin logo/icon or text */}
          <span className="font-headline text-xl text-primary">Admin Panel</span>
        </Link>
        <div className="space-x-2">
          {pathname !== "/admin" && (
            <Button variant="outline" asChild>
              <Link href="/admin">
                <Home className="mr-2 h-4 w-4" /> Admin Home
              </Link>
            </Button>
          )}
          <Button variant="ghost" onClick={handleLogout} className="text-destructive hover:bg-destructive/10 hover:text-destructive">
            <LogOut className="mr-2 h-4 w-4" /> Logout
          </Button>
        </div>
      </div>
    </header>
  );
}
