
"use client";

import { useAppContext } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import AdminHeader from '@/components/AdminHeader';
import { useToast } from "@/hooks/use-toast";
import type { FYBWeekSettings } from '@/types';

export default function ManageFybWeekPage() {
  const { 
    fybWeekSettings, updateFybWeekStatus,
  } = useAppContext();
  const { toast } = useToast();

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

  return (
    <div className="min-h-screen bg-muted/30">
      <AdminHeader />
      <main className="container mx-auto p-4 md:p-8 space-y-8">
        
        <Card className="shadow-lg rounded-xl">
          <CardHeader>
            <CardTitle className="text-3xl font-headline text-primary">Manage FYB Week</CardTitle>
            <CardDescription className="font-body">Enable or disable the public FYB Week schedule page.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-3 p-4 border rounded-md bg-card">
              <Switch
                id="unlock-fyb-week"
                checked={fybWeekSettings.isFybWeekActive}
                onCheckedChange={handleToggleFybWeek}
                aria-label="Toggle FYB Week"
              />
              <Label htmlFor="unlock-fyb-week" className="text-lg font-medium font-body">
                {fybWeekSettings.isFybWeekActive ? "FYB Week is LIVE" : "FYB Week is LOCKED"}
              </Label>
            </div>
            <div className="mt-6 p-4 border-dashed border-2 rounded-lg bg-card">
                <h3 className="font-headline text-lg text-primary">Content Management</h3>
                <p className="text-muted-foreground mt-2">
                    Currently, the FYB Week schedule is pre-defined in the code. Future updates could allow for dynamic schedule management here.
                </p>
            </div>
          </CardContent>
        </Card>

      </main>
    </div>
  );
}
