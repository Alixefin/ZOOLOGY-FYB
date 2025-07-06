
"use client";

import { useState, useMemo } from 'react';
import { useAppContext } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import AdminHeader from '@/components/AdminHeader';
import { useToast } from "@/hooks/use-toast";
import { Save, Trash2, PlusCircle, Loader2, Trophy, Users, UserPlus } from 'lucide-react';
import type { Award, Student, AwardNomination } from '@/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger
} from "@/components/ui/alert-dialog";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Image from 'next/image';

export default function ManageAwardsPage() {
  const { 
    votingSettings, updateVotingStatus,
    awards, addAward, deleteAward,
    nominations, addNomination, deleteNomination,
    students
  } = useAppContext();
  const { toast } = useToast();

  const [newAwardName, setNewAwardName] = useState('');
  const [newAwardDesc, setNewAwardDesc] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);
  const [manageNomineesAward, setManageNomineesAward] = useState<Award | null>(null);


  const handleToggleVoting = async (checked: boolean) => {
    try {
      await updateVotingStatus(checked);
      toast({
        title: `Voting is now ${checked ? 'ACTIVE' : 'INACTIVE'}`,
        description: `Users ${checked ? 'can now' : 'can no longer'} access the voting page.`,
      });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handleAddAward = async () => {
    if (!newAwardName.trim()) {
      toast({ title: "Award name is required.", variant: "destructive" });
      return;
    }
    setIsSaving(true);
    try {
      await addAward({ name: newAwardName, description: newAwardDesc });
      toast({ title: "Award Added", description: `"${newAwardName}" has been created.` });
      setNewAwardName('');
      setNewAwardDesc('');
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddNomination = async () => {
    if (!manageNomineesAward || !selectedStudent) return;
    try {
      await addNomination({ award_id: manageNomineesAward.id, student_id: selectedStudent });
      toast({ title: "Nominee Added" });
      setSelectedStudent(null);
    } catch (error: any) {
      toast({ title: "Error Adding Nominee", description: "This student may already be nominated for this award.", variant: "destructive" });
    }
  };

  const nomineesByAward = useMemo(() => {
    return nominations.reduce((acc, nom) => {
      if (!acc[nom.award_id]) {
        acc[nom.award_id] = [];
      }
      acc[nom.award_id].push(nom);
      return acc;
    }, {} as Record<string, AwardNomination[]>);
  }, [nominations]);
  
  const studentMap = useMemo(() => {
    return students.reduce((acc, student) => {
      acc[student.id] = student;
      return acc;
    }, {} as Record<string, Student>);
  }, [students]);

  return (
    <div className="min-h-screen bg-muted/30">
      <AdminHeader />
      <main className="container mx-auto p-4 md:p-8 space-y-8">
        
        {/* Voting Status Card */}
        <Card className="shadow-lg rounded-xl">
          <CardHeader>
            <CardTitle className="text-3xl font-headline text-primary">Manage Award Voting</CardTitle>
            <CardDescription className="font-body">Enable or disable the public voting page.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-3 p-4 border rounded-md bg-card">
              <Switch
                id="unlock-voting"
                checked={votingSettings.isVotingActive}
                onCheckedChange={handleToggleVoting}
                aria-label="Toggle Voting"
              />
              <Label htmlFor="unlock-voting" className="text-lg font-medium font-body">
                {votingSettings.isVotingActive ? "Voting is LIVE" : "Voting is LOCKED"}
              </Label>
            </div>
          </CardContent>
        </Card>

        {/* Award Categories Management */}
        <Card className="shadow-lg rounded-xl">
          <CardHeader>
            <CardTitle className="text-2xl font-headline text-primary flex items-center"><Trophy className="mr-2"/>Award Categories</CardTitle>
            <CardDescription className="font-body">Create and manage the awards that users can vote for.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4 mb-6 p-4 border rounded-lg">
              <Input
                placeholder="New Award Name (e.g., Most Influential)"
                value={newAwardName}
                onChange={(e) => setNewAwardName(e.target.value)}
                className="flex-grow"
              />
              <Textarea
                placeholder="Optional Description"
                value={newAwardDesc}
                onChange={(e) => setNewAwardDesc(e.target.value)}
                rows={1}
                className="flex-grow"
              />
              <Button onClick={handleAddAward} disabled={isSaving}>
                {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <PlusCircle className="mr-2 h-4 w-4" />}
                Add Award
              </Button>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Award Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Nominees</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {awards.map(award => (
                  <TableRow key={award.id}>
                    <TableCell className="font-medium">{award.name}</TableCell>
                    <TableCell>{award.description}</TableCell>
                    <TableCell>{nomineesByAward[award.id]?.length || 0}</TableCell>
                    <TableCell className="text-right space-x-2">
                      <Dialog onOpenChange={(open) => !open && setManageNomineesAward(null)}>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" onClick={() => setManageNomineesAward(award)}>
                            <Users className="mr-2 h-4 w-4"/> Manage Nominees
                          </Button>
                        </DialogTrigger>
                      </Dialog>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                           <Button variant="destructive" size="icon"><Trash2 className="h-4 w-4" /></Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete "{award.name}"?</AlertDialogTitle>
                            <AlertDialogDescription>This will also delete all nominations and votes for this award. This action cannot be undone.</AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => deleteAward(award.id)}>Delete</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Voting Results */}
        <Card className="shadow-lg rounded-xl">
          <CardHeader>
            <CardTitle className="text-2xl font-headline text-primary">Voting Results</CardTitle>
            <CardDescription>Live results of the award voting.</CardDescription>
          </CardHeader>
          <CardContent>
            {awards.map(award => (
              <div key={award.id} className="mb-6">
                <h3 className="font-bold text-lg mb-2">{award.name}</h3>
                <Table>
                  <TableHeader>
                    <TableRow><TableHead>Nominee</TableHead><TableHead className="text-right">Votes</TableHead></TableRow>
                  </TableHeader>
                  <TableBody>
                    {(nomineesByAward[award.id] || [])
                      .sort((a,b) => b.votes - a.votes)
                      .map(nom => (
                      <TableRow key={nom.id}>
                        <TableCell>{studentMap[nom.student_id]?.name || 'Unknown Student'}</TableCell>
                        <TableCell className="text-right font-bold">{nom.votes}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ))}
          </CardContent>
        </Card>

      </main>

      {/* Manage Nominees Dialog */}
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Manage Nominees for "{manageNomineesAward?.name}"</DialogTitle>
          <DialogDescription>Add or remove students nominated for this award.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="flex items-center gap-2 p-4 border rounded-md">
            <Select onValueChange={setSelectedStudent}>
              <SelectTrigger><SelectValue placeholder="Select a student to nominate" /></SelectTrigger>
              <SelectContent>
                {students.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
              </SelectContent>
            </Select>
            <Button onClick={handleAddNomination}><UserPlus className="mr-2 h-4 w-4" /> Nominate</Button>
          </div>
          <div>
            <h4 className="font-medium mb-2">Current Nominees:</h4>
            <div className="max-h-60 overflow-y-auto space-y-2 pr-2">
            {(nomineesByAward[manageNomineesAward?.id || ''] || []).map(nom => (
              <div key={nom.id} className="flex items-center justify-between p-2 bg-muted rounded-md">
                <div className="flex items-center gap-2">
                  <Image 
                    src={studentMap[nom.student_id]?.image_src || 'https://placehold.co/40x40.png'}
                    alt={studentMap[nom.student_id]?.name || ''}
                    width={40} height={40} className="rounded-full object-cover"
                  />
                  <span>{studentMap[nom.student_id]?.name}</span>
                </div>
                <Button variant="ghost" size="icon" onClick={() => deleteNomination(nom.id)}><Trash2 className="h-4 w-4 text-destructive"/></Button>
              </div>
            ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </div>
  );
}
