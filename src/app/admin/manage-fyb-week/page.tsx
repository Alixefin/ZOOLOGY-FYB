
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
import { Loader2, Save, CalendarDays, Image as ImageIcon } from 'lucide-react';
import type { FYBWeekEvent } from '@/types';
import Image from 'next/image';

export default function ManageFybWeekPage() {
  const { 
    fybWeekSettings, updateFybWeekStatus,
    fybWeekEvents, updateFybWeekEvent
  } = useAppContext();
  const { toast } = useToast();
  
  // Local state to manage edits before saving
  const [localEvents, setLocalEvents] = useState<FYBWeekEvent[]>([]);
  const [savingStates, setSavingStates] = useState<Record<string, boolean>>({});

  useEffect(() => {
    // Sync local state with context on initial load or when context changes
    setLocalEvents(fybWeekEvents);
  }, [fybWeekEvents]);

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

  const handleEventChange = (id: string, field: keyof Omit<FYBWeekEvent, 'id' | 'created_at'>, value: any) => {
    setLocalEvents(prev => prev.map(e => e.id === id ? { ...e, [field]: value } : e));
  };
  
  const handleSaveChanges = async (event: FYBWeekEvent) => {
    setSavingStates(prev => ({ ...prev, [event.id]: true }));
    try {
      await updateFybWeekEvent(event);
      toast({ title: "Event Saved", description: `Changes for "Day ${event.day_index + 1}" have been saved.` });
    } catch (error: any) {
      toast({ title: "Save Error", description: error.message, variant: "destructive" });
    } finally {
      setSavingStates(prev => ({ ...prev, [event.id]: false }));
    }
  };

  return (
    <div className="min-h-screen bg-muted/30">
      <AdminHeader />
      <main className="container mx-auto p-4 md:p-8 space-y-8">
        
        <Card className="shadow-lg rounded-xl">
          <CardHeader>
            <CardTitle className="text-3xl font-headline text-primary">Manage FYB Week</CardTitle>
            <CardDescription className="font-body">Enable the public page and manage the schedule content for each day.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-3 p-4 border rounded-md bg-card mb-8">
              <Switch
                id="unlock-fyb-week"
                checked={fybWeekSettings.isFybWeekActive}
                onCheckedChange={handleToggleFybWeek}
                aria-label="Toggle FYB Week"
              />
              <Label htmlFor="unlock-fyb-week" className="text-lg font-medium font-body">
                {fybWeekSettings.isFybWeekActive ? "FYB Week Page is LIVE" : "FYB Week Page is LOCKED"}
              </Label>
            </div>

            <div className="space-y-6">
              <h3 className="font-headline text-xl text-primary flex items-center"><CalendarDays className="mr-2"/>Event Schedule</h3>
              {localEvents.map(event => (
                <Card key={event.id} className="bg-card/80">
                  <CardHeader>
                    <CardTitle>Day {event.day_index + 1}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
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
                        </div>
                         <div className="space-y-2">
                            <Label>Event Image</Label>
                            <div className="flex items-start gap-4">
                               <div className="w-40 h-40 border rounded-md flex items-center justify-center bg-muted flex-shrink-0">
                                {savingStates[event.id] && event.image_src ? (
                                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                                 ) : event.image_src ? (
                                    <Image src={event.image_src} alt={`Day ${event.day_index + 1}`} width={160} height={160} className="object-cover rounded-md" unoptimized />
                                 ) : (
                                    <div className="text-center text-muted-foreground p-2">
                                        <ImageIcon className="w-10 h-10 mx-auto" />
                                        <p className="text-xs mt-1">No Image</p>
                                    </div>
                                )}
                               </div>
                               <FileUpload
                                onFileSelect={(fileDataUrl) => handleEventChange(event.id, 'image_src', fileDataUrl)}
                                currentImagePreview={event.image_src}
                                label=""
                                disabled={savingStates[event.id]}
                               />
                            </div>
                        </div>
                    </div>
                    <div className="flex justify-end">
                      <Button onClick={() => handleSaveChanges(event)} disabled={savingStates[event.id]}>
                        {savingStates[event.id] ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Save className="mr-2 h-4 w-4"/>}
                        Save Day {event.day_index + 1}
                      </Button>
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
