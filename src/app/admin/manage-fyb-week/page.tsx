
"use client";

import { useState, useEffect } from 'react';
import { useAppContext } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import AdminHeader from '@/components/AdminHeader';
import FileUpload from '@/components/FileUpload';
import { useToast } from "@/hooks/use-toast";
import { Loader2, Save, CalendarDays, Image as ImageIcon, Trash2, UploadCloud } from 'lucide-react';
import type { FYBWeekEvent, FYBWeekGalleryImage } from '@/types';
import Image from 'next/image';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';

export default function ManageFybWeekPage() {
  const { 
    fybWeekSettings, updateFybWeekStatus, updateFybWeekSettings,
    fybWeekEvents, updateFybWeekEvent,
    fybWeekGallery, addGalleryImage, deleteGalleryImage,
  } = useAppContext();
  const { toast } = useToast();
  
  const [localEvents, setLocalEvents] = useState<FYBWeekEvent[]>([]);
  const [localSettings, setLocalSettings] = useState(fybWeekSettings);
  const [savingStates, setSavingStates] = useState<Record<string, boolean>>({});
  const [isUploading, setIsUploading] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setLocalEvents(fybWeekEvents);
  }, [fybWeekEvents]);

  useEffect(() => {
    setLocalSettings(fybWeekSettings);
  }, [fybWeekSettings]);

  const handleToggleFybWeek = async (checked: boolean) => {
    try {
      await updateFybWeekStatus(checked);
      toast({
        title: `FYB Week is now ${checked ? 'ACTIVE' : 'INACTIVE'}`,
        description: `Users ${checked ? 'can now' : 'can no longer'} access the schedule page.`,
      });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };
  
  const handleSettingsSave = async () => {
    setSavingStates(prev => ({ ...prev, global: true }));
    try {
      await updateFybWeekSettings(localSettings);
      toast({ title: "Settings Saved", description: "FYB Week settings have been updated." });
    } catch (error: any) {
      toast({ title: "Save Error", description: error.message, variant: "destructive" });
    } finally {
      setSavingStates(prev => ({ ...prev, global: false }));
    }
  }

  const handleEventChange = (id: string, field: keyof Omit<FYBWeekEvent, 'id' | 'created_at'>, value: any) => {
    setLocalEvents(prev => prev.map(e => e.id === id ? { ...e, [field]: value } : e));
  };
  
  const handleSaveChanges = async (event: FYBWeekEvent) => {
    setSavingStates(prev => ({ ...prev, [event.id]: true }));
    try {
      await updateFybWeekEvent(event);
      toast({ title: "Event Saved", description: `Changes for "${event.title}" have been saved.` });
    } catch (error: any) {
      toast({ title: "Save Error", description: error.message, variant: "destructive" });
    } finally {
      setSavingStates(prev => ({ ...prev, [event.id]: false }));
    }
  };

  const handleGalleryImageUpload = async (eventId: string, fileDataUrl: string | null) => {
    if (!fileDataUrl) return;
    setIsUploading(prev => ({ ...prev, [eventId]: true }));
    try {
        await addGalleryImage(eventId, fileDataUrl);
        toast({ title: "Image Uploaded", description: "The image has been added to the gallery."});
    } catch (error: any) {
        toast({ title: "Upload Failed", description: error.message, variant: "destructive" });
    } finally {
        setIsUploading(prev => ({ ...prev, [eventId]: false }));
    }
  };


  return (
    <div className="min-h-screen bg-muted/30">
      <AdminHeader />
      <main className="container mx-auto p-4 md:p-8 space-y-8">
        
        <Card className="shadow-lg rounded-xl">
          <CardHeader>
            <CardTitle className="text-3xl font-headline text-primary">Manage FYB Week</CardTitle>
            <CardDescription className="font-body">Enable the page, set the schedule, and manage content for each day.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center space-x-3 p-4 border rounded-md bg-card">
              <Switch
                id="unlock-fyb-week"
                checked={localSettings.isFybWeekActive}
                onCheckedChange={handleToggleFybWeek}
                aria-label="Toggle FYB Week"
              />
              <Label htmlFor="unlock-fyb-week" className="text-lg font-medium font-body">
                {localSettings.isFybWeekActive ? "FYB Week Page is LIVE" : "FYB Week Page is LOCKED"}
              </Label>
            </div>
            
            <Card className="bg-card/80">
              <CardHeader>
                <CardTitle className="text-xl font-headline">Schedule Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="start-date" className="font-medium">Schedule Start Date</Label>
                     <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className="w-full justify-start font-normal mt-2">
                             <CalendarDays className="mr-2 h-4 w-4" />
                             {localSettings.startDate ? format(new Date(localSettings.startDate), "PPP") : <span>Pick a date</span>}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={localSettings.startDate ? new Date(localSettings.startDate) : undefined}
                            onSelect={(date) => setLocalSettings(prev => ({...prev, startDate: date ? date.toISOString() : null}))}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                  </div>
                  <div>
                     <Label className="font-medium">Schedule Design Image</Label>
                     <p className="text-xs text-muted-foreground mb-2">This image appears as a banner on the public schedule page.</p>
                     <FileUpload
                        onFileSelect={(fileDataUrl) => setLocalSettings(prev => ({ ...prev, scheduleDesignImage: fileDataUrl }))}
                        currentImagePreview={localSettings.scheduleDesignImage}
                        label=""
                        disabled={savingStates['global']}
                     />
                  </div>
                </div>
                 <div className="flex justify-end">
                    <Button onClick={handleSettingsSave} disabled={savingStates['global']}>
                      {savingStates['global'] ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Save className="mr-2 h-4 w-4"/>}
                      Save Settings
                    </Button>
                  </div>
              </CardContent>
            </Card>

            <div className="space-y-6">
              <h3 className="font-headline text-xl text-primary flex items-center"><CalendarDays className="mr-2"/>Daily Event Content</h3>
              {localEvents.map(event => (
                <Card key={event.id} className="bg-card/80">
                  <CardHeader>
                    <CardTitle>Day {event.day_index + 1}: {event.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                           <div className="space-y-2">
                              <Label htmlFor={`title-${event.id}`}>Event Title</Label>
                              <Input 
                                id={`title-${event.id}`}
                                value={event.title}
                                onChange={e => handleEventChange(event.id, 'title', e.target.value)}
                              />
                           </div>
                            <div className="space-y-2">
                              <Label htmlFor={`desc-${event.id}`}>Event Description</Label>
                              <Textarea 
                                id={`desc-${event.id}`}
                                value={event.description || ''}
                                onChange={e => handleEventChange(event.id, 'description', e.target.value)}
                                rows={4}
                              />
                           </div>
                           <div className="flex justify-end">
                            <Button onClick={() => handleSaveChanges(event)} disabled={savingStates[event.id]}>
                              {savingStates[event.id] ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Save className="mr-2 h-4 w-4"/>}
                              Save Day {event.day_index + 1} Details
                            </Button>
                          </div>
                        </div>
                         <div className="space-y-4">
                            <Label>Event Media Gallery</Label>
                            <div className="p-4 border rounded-md">
                                <FileUpload 
                                    onFileSelect={(fileDataUrl) => handleGalleryImageUpload(event.id, fileDataUrl)}
                                    label="Add Image to Gallery"
                                    disabled={isUploading[event.id]}
                                />
                                {isUploading[event.id] && (
                                    <div className="flex items-center text-sm text-muted-foreground mt-2">
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Uploading...
                                    </div>
                                )}
                            </div>
                            <div className="grid grid-cols-3 gap-2 mt-4">
                                {fybWeekGallery.filter(img => img.event_id === event.id).map(img => (
                                    <div key={img.id} className="relative group">
                                        <Image src={img.image_url} alt="Gallery image" width={100} height={100} className="rounded-md object-cover aspect-square"/>
                                        <Button variant="destructive" size="icon" className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100" onClick={() => deleteGalleryImage(img.id)}>
                                            <Trash2 className="h-3 w-3" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

      </main>
    </div>
  );
}

    
