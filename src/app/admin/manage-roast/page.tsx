
"use client";

import { useState } from 'react';
import { useAppContext } from '@/contexts/AppContext';
import FileUpload from '@/components/FileUpload';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Image as ImageIcon } from 'lucide-react';
import AdminHeader from '@/components/AdminHeader';
import { useToast } from "@/hooks/use-toast";
import Image from 'next/image';

export default function ManageRoastPage() {
  const { logos, updateLogo } = useAppContext();
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);

  const handleImageSelect = async (fileDataUrl: string | null) => {
    setIsUploading(true);
    try {
      await updateLogo('roastBackground', fileDataUrl);
      toast({
        title: "Image Updated",
        description: `The roast background image has been saved successfully.`,
      });
    } catch (error: any) {
      console.error("Failed to update image:", error);
      toast({
        title: "Upload Failed",
        description: error?.message || "An unknown error occurred. Please check your Supabase connection and try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-muted/30">
      <AdminHeader />
      <main className="container mx-auto p-4 md:p-8">
        <Card className="max-w-3xl mx-auto shadow-lg rounded-xl">
          <CardHeader>
            <CardTitle className="text-3xl font-headline text-primary">Manage Roast Background Image</CardTitle>
            <CardDescription className="font-body">
              Upload the background image that will be used for the downloadable "Roast Me" feature.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            <div>
              <h3 className="text-xl font-headline text-foreground mb-3">Roast Background</h3>
              <div className="flex flex-col sm:flex-row items-start gap-6">
                <div className="w-48 h-48 border rounded-md flex items-center justify-center bg-card p-2 flex-shrink-0">
                  {isUploading ? (
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  ) : logos.roastBackground ? (
                    <Image src={logos.roastBackground} alt="Roast background preview" width={192} height={192} className="object-contain" unoptimized />
                  ) : (
                    <div className="text-center text-muted-foreground">
                        <ImageIcon className="w-12 h-12 mx-auto" />
                        <p>No Image</p>
                    </div>
                  )}
                </div>
                <FileUpload
                  onFileSelect={handleImageSelect}
                  currentImagePreview={logos.roastBackground}
                  label="Upload Roast Background"
                  disabled={isUploading}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
