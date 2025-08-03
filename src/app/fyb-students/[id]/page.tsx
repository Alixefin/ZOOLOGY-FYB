
"use client";

import { useState, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAppContext } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, User, Heart, Mic, Trophy, ThumbsDown, Briefcase, Smile, Frown, Send, Flame, Loader2, Download, X, BookOpen, GraduationCap } from 'lucide-react';
import { roastStudent, RoastStudentOutput } from '@/ai/flows/roast-student-flow';
import type { Student } from '@/types';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';

interface DetailItemProps {
  icon: React.ElementType;
  label: string;
  value: string | string[] | null | undefined;
}

const DetailItem: React.FC<DetailItemProps> = ({ icon: Icon, label, value }) => {
  if (!value || (Array.isArray(value) && value.length === 0)) return null;
  const displayValue = Array.isArray(value) ? value.join(', ') : value;
  return (
    <div className="flex items-start space-x-4 py-3">
      <Icon className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
      <div>
        <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">{label}</p>
        <p className="text-md text-foreground font-body">{`"${displayValue}"`}</p>
      </div>
    </div>
  );
};


export default function StudentDetailPage() {
  const pathname = usePathname();
  const router = useRouter();
  const { students, logos } = useAppContext();
  const { toast } = useToast();
  
  const segments = pathname.split('/');
  const studentId = segments[segments.length - 1];

  const student = students.find(s => s.id === studentId);

  const [isRoasting, setIsRoasting] = useState(false);
  const [roastResult, setRoastResult] = useState<RoastStudentOutput | null>(null);
  const [isRoastDialogOpen, setIsRoastDialogOpen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);


  const handleRoastMe = async () => {
    if (!student) return;
    setIsRoasting(true);
    setIsRoastDialogOpen(true);
    try {
      const result = await roastStudent(student);
      setRoastResult(result);
    } catch (error) {
      console.error("Error roasting student:", error);
      toast({
        title: "Roast Failed",
        description: "The AI is taking a coffee break. Please try again later.",
        variant: "destructive",
      });
      setIsRoastDialogOpen(false);
    } finally {
      setIsRoasting(false);
    }
  };

  const drawOnCanvas = (roast: RoastStudentOutput) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const background = new (window.Image)();
    background.crossOrigin = "Anonymous";
    background.src = logos.roastBackground || 'https://placehold.co/1080x1080.png';

    background.onload = () => {
        canvas.width = 1080;
        canvas.height = 1080;

        // Background
        ctx.drawImage(background, 0, 0, canvas.width, canvas.height);
        
        // Overlay
        ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Text
        ctx.fillStyle = "white";
        ctx.textAlign = "center";
        
        // Title
        ctx.font = "bold 72px Poppins, sans-serif";
        ctx.fillText("You've Been Roasted!", canvas.width / 2, 180);

        // Roast Text
        ctx.font = "48px Poppins, sans-serif";
        const roastLines = wrapText(ctx, roast.roast, 900);
        let y = 300;
        roastLines.forEach(line => {
            ctx.fillText(line, canvas.width / 2, y);
            y += 60;
        });

        // Student Name
        ctx.font = "italic 36px Poppins, sans-serif";
        ctx.fillText(`- The Cyber Clan Roaster on ${student.name}`, canvas.width / 2, canvas.height - 100);

        const dataUrl = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = `roast_${student.name.toLowerCase().replace(/\s+/g, '_')}.png`;
        link.click();
        setIsDownloading(false);
    };
     background.onerror = () => {
        setIsDownloading(false);
        toast({
            title: 'Error loading background',
            description: 'Could not load the roast background image.',
            variant: 'destructive',
        });
    };
  }

  const handleDownload = () => {
      if (!roastResult) return;
      setIsDownloading(true);
      drawOnCanvas(roastResult);
  };
  
  function wrapText(context: CanvasRenderingContext2D, text: string, maxWidth: number) {
      const words = text.split(' ');
      let lines: string[] = [];
      let currentLine = words[0];

      for (let i = 1; i < words.length; i++) {
          const word = words[i];
          const width = context.measureText(currentLine + " " + word).width;
          if (width < maxWidth) {
              currentLine += " " + word;
          } else {
              lines.push(currentLine);
              currentLine = word;
          }
      }
      lines.push(currentLine);
      return lines;
  }

  if (!student) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <h1 className="text-2xl font-headline text-destructive mb-4">Student Not Found</h1>
        <Button onClick={() => router.push('/fyb-students')}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Student List
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20 p-4 sm:p-8">
      <header className="container mx-auto max-w-4xl mb-6 flex justify-between items-center">
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Clan
        </Button>
         <Button onClick={handleRoastMe} disabled={isRoasting} className="bg-destructive hover:bg-destructive/90">
            {isRoasting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Flame className="mr-2 h-4 w-4" />}
            Roast Me!
        </Button>
      </header>

      <main className="container mx-auto max-w-2xl flex flex-col items-center">
        {/* Student Image and Name */}
        <div className="flex flex-col items-center space-y-4 w-full">
            <div className="relative w-48 h-48 sm:w-64 sm:h-64 rounded-full overflow-hidden shadow-2xl border-4 border-card">
            {student.image_src ? (
                <Image
                src={student.image_src}
                alt={student.name}
                layout="fill"
                objectFit="cover"
                unoptimized
                data-ai-hint="student portrait"
                />
            ) : (
                <div className="w-full h-full flex items-center justify-center bg-muted">
                <User className="w-24 h-24 text-muted-foreground" />
                </div>
            )}
            </div>
            <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-headline text-primary font-bold tracking-tight">{student.name}</h1>
            {student.nickname && student.nickname.toLowerCase() !== 'non' && (
                <p className="text-xl md:text-2xl text-muted-foreground font-body mt-2">"{student.nickname}"</p>
            )}
            </div>
        </div>
        
        {/* Details Sections */}
        <div className="w-full mt-10 space-y-6">
            <Card className="shadow-lg rounded-xl">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-xl font-headline"><GraduationCap/> Academic Profile</CardTitle>
                </CardHeader>
                <CardContent className="pt-0 divide-y divide-border/50">
                    <DetailItem icon={Trophy} label="Best Level" value={student.best_level} />
                    <DetailItem icon={ThumbsDown} label="Worst Level" value={student.worst_level} />
                    <DetailItem icon={Mic} label="Favourite Lecturer" value={student.favourite_lecturer} />
                </CardContent>
            </Card>

            <Card className="shadow-lg rounded-xl">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-xl font-headline"><User/> Personal Profile</CardTitle>
                </CardHeader>
                 <CardContent className="pt-0 divide-y divide-border/50">
                    <DetailItem icon={Heart} label="Relationship Status" value={student.relationship_status} />
                    <DetailItem icon={Briefcase} label="If not Computing, then what?" value={student.alternative_career} />
                </CardContent>
            </Card>

            <Card className="shadow-lg rounded-xl">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-xl font-headline"><BookOpen/> University Experience</CardTitle>
                </CardHeader>
                <CardContent className="pt-0 divide-y divide-border/50">
                    <DetailItem icon={Smile} label="Best Experience in FUL" value={student.best_experience} />
                    <DetailItem icon={Frown} label="Worst Experience in FUL" value={student.worst_experience} />
                    <DetailItem icon={Send} label="What will you miss after FUL?" value={student.will_miss} />
                </CardContent>
            </Card>
        </div>
      </main>

      {/* Roast Dialog */}
       <Dialog open={isRoastDialogOpen} onOpenChange={setIsRoastDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-2xl font-headline text-destructive flex items-center justify-center">
                <Flame className="mr-2 h-6 w-6"/> You've Been Roasted!
            </DialogTitle>
            <DialogDescription className="text-center">
              Courtesy of the Cyber Clan Roasting AI.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 text-center">
            {isRoasting ? (
              <div className="space-y-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
                <p className="text-muted-foreground">The AI is sharpening its wit...</p>
              </div>
            ) : roastResult ? (
              <p className="text-lg font-body">{roastResult.roast}</p>
            ) : (
                <p className="text-destructive">Something went wrong. Please try again.</p>
            )}
          </div>
          <DialogFooter className="sm:justify-between gap-2">
             <Button variant="outline" onClick={() => setIsRoastDialogOpen(false)}>
                <X className="mr-2 h-4 w-4" /> Close
              </Button>
            {!isRoasting && roastResult && logos.roastBackground && (
                <Button onClick={handleDownload} disabled={isDownloading}>
                    {isDownloading ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Download className="mr-2 h-4 w-4" />}
                    Download Roast
                </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Hidden canvas for image generation */}
      <canvas ref={canvasRef} style={{ display: 'none' }}></canvas>
    </div>
  );
}
