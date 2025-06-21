
"use client";

import { useState } from 'react';
import { useAppContext } from '@/contexts/AppContext';
import FileUpload from '@/components/FileUpload';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import AdminHeader from '@/components/AdminHeader';
import { useToast } from "@/hooks/use-toast";
import Image from 'next/image';
import { AssociationLogoPlaceholder } from '@/components/icons/AssociationLogoPlaceholder';
import { SchoolLogoPlaceholder } from '@/components/icons/SchoolLogoPlaceholder';

export default function ManageLogosPage() {
  const { logos, updateLogo } = useAppContext();
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState<'association' | 'school' | null>(null);

  const handleLogoSelect = async (logoType: 'associationLogo' | 'schoolLogo', fileDataUrl: string | null) => {
    setIsUploading(logoType === 'associationLogo' ? 'association' : 'school');
    try {
      await updateLogo(logoType, fileDataUrl);
      toast({
        title: "Logo Updated",
        description: `The ${logoType === 'associationLogo' ? 'association' : 'school'} logo has been saved successfully.`,
      });
    } catch (error: any) {
      console.error("Failed to update logo:", error);
      toast({
        title: "Upload Failed",
        description: error?.message || "An unknown error occurred. Please check your Supabase connection and try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(null);
    }
  };

  return (
    <div className="min-h-screen bg-muted/30">
      <AdminHeader />
      <main className="container mx-auto p-4 md:p-8">
        <Card className="max-w-3xl mx-auto shadow-lg rounded-xl">
          <CardHeader>
            <CardTitle className="text-3xl font-headline text-primary">Manage Logos</CardTitle>
            <CardDescription className="font-body">
              Upload or update the association and school logos. Changes are saved automatically.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            <div>
              <h3 className="text-xl font-headline text-foreground mb-3">Association Logo</h3>
              <div className="flex flex-col sm:flex-row items-start gap-6">
                <div className="w-32 h-32 border rounded-md flex items-center justify-center bg-card p-2 flex-shrink-0">
                  {isUploading === 'association' ? (
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  ) : logos.associationLogo ? (
                    <Image src={logos.associationLogo} alt="Association Logo Preview" width={120} height={120} className="object-contain" unoptimized />
                  ) : (
                    <AssociationLogoPlaceholder className="w-full h-full text-muted-foreground" />
                  )}
                </div>
                <FileUpload
                  onFileSelect={(fileDataUrl) => handleLogoSelect('associationLogo', fileDataUrl)}
                  currentImagePreview={logos.associationLogo}
                  label="Upload Association Logo"
                  disabled={!!isUploading}
                />
              </div>
            </div>

            <div className="border-t pt-8">
              <h3 className="text-xl font-headline text-foreground mb-3">School Logo</h3>
               <div className="flex flex-col sm:flex-row items-start gap-6">
                <div className="w-32 h-32 border rounded-md flex items-center justify-center bg-card p-2 flex-shrink-0">
                  {isUploading === 'school' ? (
                     <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  ) : logos.schoolLogo ? (
                    <Image src={logos.schoolLogo} alt="School Logo Preview" width={120} height={120} className="object-contain" unoptimized />
                  ) : (
                    <SchoolLogoPlaceholder className="w-full h-full text-muted-foreground" />
                  )}
                </div>
                <FileUpload
                  onFileSelect={(fileDataUrl) => handleLogoSelect('schoolLogo', fileDataUrl)}
                  currentImagePreview={logos.schoolLogo}
                  label="Upload School Logo"
                  disabled={!!isUploading}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
