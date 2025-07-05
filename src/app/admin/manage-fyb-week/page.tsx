
"use client";

import { useAppContext } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import AdminHeader from '@/components/AdminHeader';
import { useToast } from "@/hooks/use-toast";
import { Save, Trash2, UploadCloud, Loader2 } from 'lucide-react';
import Image from 'next/image';
import type { ChangeEvent } from 'react';
import { useState, useEffect } from 'react';
import type { FYBWeekSettings } from '@/types';

export default function ManageFybWeekPage() {
  const { 
    fybWeekSettings: initialSettings, 
    updateFybWeekTextSettings, 
    addFybEventImages, 
    deleteFybEventImage 
  } = useAppContext();
  
  const [settings, setSettings] = useState<FYBWeekSettings>(initialSettings);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadFileCount, setUploadFileCount] = useState(0);
  
  const { toast } = useToast();

  useEffect(() => {
    setSettings(initialSettings);
  }, [initialSettings]);

  const handleToggleUnlock = (checked: boolean) => {
    setSettings(prev => ({ ...prev, isUnlocked: checked }));
  };

  const handleInputChange = (e: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    const { name, value } = e.target;
    setSettings(prev => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      setIsUploading(true);
      setUploadFileCount(files.length);
      try {
        await addFybEventImages(Array.from(files));
        toast({
          title: "Images Uploaded",
          description: `${files.length} gallery image(s) have been added successfully.`,
        });
      } catch (error: any) {
        toast({
          title: "Image Upload Failed",
          description: error?.message || "An error occurred during upload.",
          variant: "destructive",
        });
      } finally {
        setIsUploading(false);
        setUploadFileCount(0);
        // Clear the file input so the same files can be selected again if needed
        event.target.value = ''; 
      }
    }
  };
  
  const handleDeleteImage = async (imageId: string) => {
     try {
      await deleteFybEventImage(imageId);
      toast({
        title: "Image Deleted",
        description: "The image has been removed from the gallery.",
      });
    } catch (error: any) {
       toast({
          title: "Deletion Failed",
          description: error?.message || "An error occurred while deleting the image.",
          variant: "destructive",
        });
    }
  }

  const handleSaveChanges = async () => {
    setIsSaving(true);
    try {
      await updateFybWeekTextSettings({
        isUnlocked: settings.isUnlocked,
        title: settings.title,
        schedule: settings.schedule,
        activities: settings.activities,
      });
      toast({
        title: "Cyber Clan Week Settings Updated",
        description: "The Cyber Clan Week content has been saved successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Save Failed",
        description: error?.message || "An error occurred. Please check the console.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-muted/30">
      <AdminHeader />
      <main className="container mx-auto p-4 md:p-8">
        <Card className="max-w-4xl mx-auto shadow-lg rounded-xl">
          <CardHeader>
            <CardTitle className="text-3xl font-headline text-primary">Manage Cyber Clan Week</CardTitle>
            <CardDescription className="font-body">
              Control the content displayed on the Cyber Clan Week page, including schedule, activities, and event gallery.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="flex items-center space-x-3 p-4 border rounded-md bg-card">
              <Switch
                id="unlock-fyb-week"
                checked={settings.isUnlocked}
                onCheckedChange={handleToggleUnlock}
                aria-label="Unlock Cyber Clan Week Page"
              />
              <Label htmlFor="unlock-fyb-week" className="text-lg font-medium font-body">
                {settings.isUnlocked ? "Cyber Clan Week Page is LIVE" : "Cyber Clan Week Page is LOCKED (Coming Soon)"}
              </Label>
            </div>

            <div>
              <Label htmlFor="fyb-week-title" className="text-xl font-headline text-foreground mb-2 block">Page Title</Label>
              <Input
                id="fyb-week-title"
                name="title"
                value={settings.title}
                onChange={handleInputChange}
                className="text-lg"
                placeholder="Enter title for the Cyber Clan Week page"
              />
            </div>
            
            <div>
              <Label htmlFor="schedule" className="text-xl font-headline text-foreground mb-2 block">Schedule Details</Label>
              <Textarea
                id="schedule"
                name="schedule"
                value={settings.schedule}
                onChange={handleInputChange}
                placeholder="Enter the schedule for Cyber Clan Week..."
                rows={8}
                className="font-mono text-sm"
              />
            </div>

            <div>
              <Label htmlFor="activities" className="text-xl font-headline text-foreground mb-2 block">Activities Description</Label>
              <Textarea
                id="activities"
                name="activities"
                value={settings.activities}
                onChange={handleInputChange}
                placeholder="Describe the activities planned for Cyber Clan Week..."
                rows={8}
                className="font-mono text-sm"
              />
            </div>

            <div className="border-t pt-8">
              <h3 className="text-xl font-headline text-foreground mb-3">Event Gallery Images</h3>
              <div className="mb-4 p-4 border-dashed border-2 border-primary rounded-md text-center bg-primary/5">
                <Label htmlFor="event-image-upload" className={`cursor-pointer ${isUploading ? 'opacity-50' : ''}`}>
                    {isUploading ? <Loader2 className="mx-auto h-12 w-12 text-primary/70 animate-spin mb-2"/> : <UploadCloud className="mx-auto h-12 w-12 text-primary/70 mb-2"/>}
                    <p className="text-primary font-semibold">{isUploading ? `Uploading ${uploadFileCount} images...` : 'Click or drag to upload event images'}</p>
                    <p className="text-xs text-muted-foreground">Supports multiple JPEGs, PNGs</p>
                </Label>
                <Input 
                    id="event-image-upload" 
                    type="file" 
                    multiple 
                    accept="image/jpeg, image/png" 
                    onChange={handleImageUpload}
                    className="hidden"
                    disabled={isUploading}
                />
              </div>
              {settings.eventImages.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {settings.eventImages.map((image) => (
                    <div key={image.id} className="relative group aspect-square border rounded-md overflow-hidden">
                      <Image src={image.src || ''} alt={image.name || 'Event image'} layout="fill" objectFit="cover" unoptimized />
                      <Button
                        variant="destructive"
                        size="icon"
                        className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                        onClick={() => handleDeleteImage(image.id)}
                        aria-label="Delete image"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-1 truncate">
                        {image.name}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-4 font-body">No event images uploaded yet.</p>
              )}
            </div>

            <div className="flex justify-end pt-6">
              <Button onClick={handleSaveChanges} size="lg" className="font-headline" disabled={isSaving}>
                {isSaving ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Save className="mr-2 h-5 w-5" />} 
                {isSaving ? 'Saving...' : 'Save Cyber Clan Week Settings'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
