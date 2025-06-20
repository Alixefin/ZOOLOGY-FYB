
"use client";

import { useAppContext } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import FileUpload from '@/components/FileUpload'; // Use a modified version for multiple files or handle multiple instances
import AdminHeader from '@/components/AdminHeader';
import { useToast } from "@/hooks/use-toast";
import { Save, Image as ImageIcon, Trash2, UploadCloud } from 'lucide-react';
import Image from 'next/image'; // For Next.js optimized images
import type { ChangeEvent } from 'react';


export default function ManageFybWeekPage() {
  const { fybWeekSettings, setFybWeekSettings, addFybEventImage, deleteFybEventImage } = useAppContext();
  const { toast } = useToast();

  const handleToggleUnlock = (checked: boolean) => {
    setFybWeekSettings(prev => ({ ...prev, isUnlocked: checked }));
  };

  const handleInputChange = (e: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    const { name, value } = e.target;
    setFybWeekSettings(prev => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      Array.from(files).forEach(file => {
        addFybEventImage(file);
      });
    }
  };

  const handleSaveChanges = () => {
    toast({
      title: "FYB Week Settings Updated",
      description: "The FYB Week content has been saved successfully.",
    });
  };

  return (
    <div className="min-h-screen bg-muted/30">
      <AdminHeader />
      <main className="container mx-auto p-4 md:p-8">
        <Card className="max-w-4xl mx-auto shadow-lg rounded-xl">
          <CardHeader>
            <CardTitle className="text-3xl font-headline text-primary">Manage FYB Week</CardTitle>
            <CardDescription className="font-body">
              Control the content displayed on the FYB Week page, including schedule, activities, and event gallery.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="flex items-center space-x-3 p-4 border rounded-md bg-card">
              <Switch
                id="unlock-fyb-week"
                checked={fybWeekSettings.isUnlocked}
                onCheckedChange={handleToggleUnlock}
                aria-label="Unlock FYB Week Page"
              />
              <Label htmlFor="unlock-fyb-week" className="text-lg font-medium font-body">
                {fybWeekSettings.isUnlocked ? "FYB Week Page is LIVE" : "FYB Week Page is LOCKED (Coming Soon)"}
              </Label>
            </div>

            <div>
              <Label htmlFor="fyb-week-title" className="text-xl font-headline text-foreground mb-2 block">Page Title</Label>
              <Input
                id="fyb-week-title"
                name="title"
                value={fybWeekSettings.title}
                onChange={handleInputChange}
                className="text-lg"
                placeholder="Enter title for the FYB Week page"
              />
            </div>
            
            <div>
              <Label htmlFor="schedule" className="text-xl font-headline text-foreground mb-2 block">Schedule Details</Label>
              <Textarea
                id="schedule"
                name="schedule"
                value={fybWeekSettings.schedule}
                onChange={handleInputChange}
                placeholder="Enter the schedule for FYB Week..."
                rows={8}
                className="font-mono text-sm"
              />
            </div>

            <div>
              <Label htmlFor="activities" className="text-xl font-headline text-foreground mb-2 block">Activities Description</Label>
              <Textarea
                id="activities"
                name="activities"
                value={fybWeekSettings.activities}
                onChange={handleInputChange}
                placeholder="Describe the activities planned for FYB Week..."
                rows={8}
                className="font-mono text-sm"
              />
            </div>

            <div className="border-t pt-8">
              <h3 className="text-xl font-headline text-foreground mb-3">Event Gallery Images</h3>
              <div className="mb-4 p-4 border-dashed border-2 border-primary rounded-md text-center bg-primary/5">
                <Label htmlFor="event-image-upload" className="cursor-pointer">
                    <UploadCloud className="mx-auto h-12 w-12 text-primary/70 mb-2"/>
                    <p className="text-primary font-semibold">Click or drag to upload event images</p>
                    <p className="text-xs text-muted-foreground">Supports multiple JPEGs, PNGs</p>
                </Label>
                <Input 
                    id="event-image-upload" 
                    type="file" 
                    multiple 
                    accept="image/jpeg, image/png" 
                    onChange={handleImageUpload}
                    className="hidden"
                />
              </div>
              {fybWeekSettings.eventImages.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {fybWeekSettings.eventImages.map((image) => (
                    <div key={image.id} className="relative group aspect-square border rounded-md overflow-hidden">
                      <Image src={image.src} alt={image.name || 'Event image'} layout="fill" objectFit="cover" unoptimized />
                      <Button
                        variant="destructive"
                        size="icon"
                        className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                        onClick={() => deleteFybEventImage(image.id)}
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
              <Button onClick={handleSaveChanges} size="lg" className="font-headline">
                <Save className="mr-2 h-5 w-5" /> Save FYB Week Settings
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
