
"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Image as ImageIcon, Users, Award, Settings } from 'lucide-react';
import AdminHeader from '@/components/AdminHeader';

export default function AdminDashboardPage() {
  const features = [
    {
      title: "Manage Logos",
      description: "Update the association and school logos.",
      href: "/admin/manage-logos",
      icon: ImageIcon,
    },
    {
      title: "Manage Clan Students",
      description: "Add, edit, or remove clan member profiles.",
      href: "/admin/manage-students",
      icon: Users,
    },
    {
      title: "Manage Award Voting",
      description: "Control Award Night voting, categories, and results.",
      href: "/admin/manage-awards",
      icon: Award,
    },
  ];

  return (
    <div className="min-h-screen bg-muted/30">
      <AdminHeader />
      <main className="container mx-auto p-4 md:p-8">
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-headline text-primary">Welcome, Administrator!</h1>
          <p className="text-lg text-muted-foreground mt-2 font-body">
            Select a section below to manage the application content.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature) => (
            <Card key={feature.title} className="hover:shadow-xl transition-shadow duration-300 rounded-lg flex flex-col">
              <CardHeader className="items-center text-center">
                <div className="p-4 bg-primary/10 rounded-full mb-3 w-fit">
                  <feature.icon className="h-10 w-10 text-primary" />
                </div>
                <CardTitle className="font-headline text-2xl">{feature.title}</CardTitle>
                <CardDescription className="font-body min-h-[40px]">{feature.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow flex flex-col justify-end">
                <Button asChild className="w-full mt-4 bg-primary hover:bg-primary/90 text-lg py-3">
                  <Link href={feature.href}>
                    <Settings className="mr-2 h-5 w-5" /> Manage
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}
