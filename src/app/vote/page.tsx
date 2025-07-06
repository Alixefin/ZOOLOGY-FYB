
"use client";

import { useState, useEffect, useMemo } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAppContext } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { FormControl, FormField, FormItem } from '@/components/ui/form';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, CheckCircle, Loader2, Info, Send } from 'lucide-react';

export default function VotePage() {
  const { votingSettings, awards, nominations, submitVotes } = useAppContext();
  const router = useRouter();
  const { toast } = useToast();
  
  const [hasVoted, setHasVoted] = useState<boolean | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm();
  
  useEffect(() => {
    const votedStatus = localStorage.getItem('hasVoted');
    setHasVoted(votedStatus === 'true');
  }, []);
  
  // Group nominations by award ID for easy lookup
  const nominationsByAward = useMemo(() => {
    return nominations.reduce((acc, nom) => {
      if (!acc[nom.award_id]) {
        acc[nom.award_id] = [];
      }
      acc[nom.award_id].push(nom);
      return acc;
    }, {} as Record<string, typeof nominations>);
  }, [nominations]);
  
  const awardsWithNominees = useMemo(() => {
    return awards.filter(award => nominationsByAward[award.id] && nominationsByAward[award.id].length > 0);
  }, [awards, nominationsByAward]);

  const onSubmit = async (data: any) => {
    setIsSubmitting(true);
    const votesToSubmit = Object.entries(data)
      .filter(([, nominationId]) => nominationId)
      .map(([awardId, nominationId]) => ({
        awardId: awardId,
        nominationId: nominationId as string,
      }));
      
    if (votesToSubmit.length !== awardsWithNominees.length) {
        toast({ title: "Incomplete Vote", description: "Please cast a vote for every award category.", variant: "destructive" });
        setIsSubmitting(false);
        return;
    }

    try {
      await submitVotes(votesToSubmit);
      localStorage.setItem('hasVoted', 'true');
      setHasVoted(true);
      toast({ title: "Vote Submitted!", description: "Thank you for participating!", className: "bg-green-500 text-white" });
    } catch (error: any) {
      toast({ title: "Submission Failed", description: error.message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (hasVoted === null) {
    return <div className="flex items-center justify-center min-h-screen"><Loader2 className="h-8 w-8 animate-spin"/></div>;
  }
  
  if (!votingSettings.isVotingActive) {
     return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
        <Info className="h-16 w-16 text-destructive mb-4" />
        <h1 className="text-3xl font-headline text-destructive mb-2">Voting Is Not Active</h1>
        <p className="text-muted-foreground mb-6">The voting session is currently closed. Please check back later.</p>
        <Button onClick={() => router.push('/')}><ArrowLeft className="mr-2 h-4 w-4" /> Back to Home</Button>
      </div>
    );
  }
  
  if (hasVoted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
        <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
        <h1 className="text-3xl font-headline text-primary mb-2">Thank You For Voting!</h1>
        <p className="text-muted-foreground mb-6">Your vote has been recorded. Results will be announced soon.</p>
        <Button onClick={() => router.push('/')}><ArrowLeft className="mr-2 h-4 w-4" /> Back to Home</Button>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <header className="mb-8 container mx-auto max-w-3xl">
        <Button variant="outline" asChild className="mb-4" onClick={() => router.push('/')}>
            <span><ArrowLeft className="mr-2 h-4 w-4" /> Back to Home</span>
        </Button>
        <h1 className="text-4xl font-headline text-primary mb-2 font-bold">Award Night Voting</h1>
        <p className="text-lg text-muted-foreground font-body">Cast your vote for each category. You can only vote once.</p>
      </header>

      <main className="container mx-auto max-w-3xl">
        <FormProvider {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <Card className="shadow-lg">
              <CardContent className="p-4 md:p-6">
                <Accordion type="multiple" className="w-full" defaultValue={awardsWithNominees.map(a => a.id)}>
                  {awardsWithNominees.map(award => (
                    <AccordionItem key={award.id} value={award.id}>
                      <AccordionTrigger className="text-xl font-headline hover:no-underline">
                        {award.name}
                      </AccordionTrigger>
                      <AccordionContent>
                        <p className="text-muted-foreground mb-4 text-sm">{award.description}</p>
                        <FormField
                          control={form.control}
                          name={award.id}
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <RadioGroup onValueChange={field.onChange} value={field.value} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                  {(nominationsByAward[award.id] || []).map(nom => (
                                    <Label key={nom.id} htmlFor={nom.id} className="flex flex-col items-center space-y-2 border rounded-md p-4 hover:bg-accent has-[:checked]:bg-primary has-[:checked]:text-primary-foreground cursor-pointer transition-colors">
                                       <RadioGroupItem value={nom.id} id={nom.id} className="sr-only"/>
                                       <Image 
                                         src={nom.students?.image_src || 'https://placehold.co/150x150.png'}
                                         alt={nom.students?.name || ''}
                                         width={150} height={150}
                                         className="w-24 h-24 rounded-full object-cover border-2 border-transparent has-[:checked]:border-accent"
                                       />
                                       <span className="font-semibold text-center">{nom.students?.name}</span>
                                    </Label>
                                  ))}
                                </RadioGroup>
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
            <div className="mt-8 flex justify-end">
              <Button type="submit" size="lg" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Send className="mr-2 h-5 w-5" />}
                Submit My Votes
              </Button>
            </div>
          </form>
        </FormProvider>
      </main>
    </div>
  );
}
