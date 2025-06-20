
"use client";

import { useAppContext } from '@/contexts/AppContext';
import FileUpload from '@/components/FileUpload';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Save } from 'lucide-react';
import AdminHeader from '@/components/AdminHeader';
import { useToast } from "@/hooks/use-toast";
import Image from 'next/image';
import { AssociationLogoPlaceholder } from '@/components/icons/AssociationLogoPlaceholder';
import { SchoolLogoPlaceholder } from '@/components/icons/SchoolLogoPlaceholder';

export default function ManageLogosPage() {
  const { logos, setLogos } = useAppContext();
  const { toast } = useToast();

  const handleAssociationLogoSelect = (fileDataUrl: string | null) => {
    setLogos(prev => ({ ...prev, associationLogo: fileDataUrl }));
  };

  const handleSchoolLogoSelect = (fileDataUrl: string | null) => {
    setLogos(prev => ({ ...prev, schoolLogo: fileDataUrl }));
  };

  const handleSaveChanges = () => {
    // In a real app, this would involve an API call.
    // Here, AppContext already updates localStorage on state change.
    toast({
      title: "Logos Updated",
      description: "The new logos have been saved successfully.",
    });
  };

  return (
    <div className="min-h-screen bg-muted/30">
      <AdminHeader />
      <main className="container mx-auto p-4 md:p-8">
        <Card className="max-w-3xl mx-auto shadow-lg rounded-xl">
          <CardHeader>
            <CardTitle className="text-3xl font-headline text-primary">Manage Logos</CardTitle>
            <CardDescription className="font-body">
              Upload or update the association and school logos that appear on the homepage.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            <div>
              <h3 className="text-xl font-headline text-foreground mb-3">Association Logo</h3>
              <div className="flex flex-col sm:flex-row items-start gap-6">
                <div className="w-32 h-32 border rounded-md flex items-center justify-center bg-card p-2 flex-shrink-0">
                  {logos.associationLogo ? (
                    <Image src={logos.associationLogo} alt="Association Logo Preview" width={120} height={120} className="object-contain" unoptimized />
                  ) : (
                    <AssociationLogoPlaceholder className="w-full h-full text-muted-foreground" />
                  )}
                </div>
                <FileUpload
                  onFileSelect={handleAssociationLogoSelect}
                  currentImagePreview={logos.associationLogo}
                  label="Upload Association Logo"
                />
              </div>
            </div>

            <div className="border-t pt-8">
              <h3 className="text-xl font-headline text-foreground mb-3">School Logo</h3>
               <div className="flex flex-col sm:flex-row items-start gap-6">
                <div className="w-32 h-32 border rounded-md flex items-center justify-center bg-card p-2 flex-shrink-0">
                  {logos.schoolLogo ? (
                    <Image src={logos.schoolLogo} alt="School Logo Preview" width={120} height={120} className="object-contain" unoptimized />
                  ) : (
                    <SchoolLogoPlaceholder className="w-full h-full text-muted-foreground" />
                  )}
                </div>
                <FileUpload
                  onFileSelect={handleSchoolLogoSelect}
                  currentImagePreview={logos.schoolLogo}
                  label="Upload School Logo"
                />
              </div>
            </div>

            <div className="flex justify-end pt-6">
              <Button onClick={handleSaveChanges} size="lg" className="font-headline">
                <Save className="mr-2 h-5 w-5" /> Save Changes
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
