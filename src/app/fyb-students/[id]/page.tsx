
"use client";

import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAppContext } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { ArrowLeft, Download, User, Cake, Heart, MapPin, BookOpen, Mic, Users, Trophy, ThumbsDown, MessageSquare, Edit3, Briefcase, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { format, parse } from 'date-fns';
import { useState } from 'react';

interface DetailItemProps {
  icon: React.ElementType;
  label: string;
  value: string | string[] | null | undefined;
}

const DetailItem: React.FC<DetailItemProps> = ({ icon: Icon, label, value }) => {
  if (!value || (Array.isArray(value) && value.length === 0)) return null;
  const displayValue = Array.isArray(value) ? value.join(', ') : value;
  return (
    <div className="flex items-start space-x-3 py-3 border-b border-border/50">
      <Icon className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
      <div>
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <p className="text-md text-foreground font-body">{displayValue}</p>
      </div>
    </div>
  );
};


export default function StudentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { students } = useAppContext();
  const studentId = params.id as string;
  const [isDownloading, setIsDownloading] = useState(false);

  const student = students.find(s => s.id === studentId);

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
  
  const formatBirthday = (birthdayStr: string | null | undefined): string | null => {
    if (!birthdayStr) return null;
    try {
      const date = parse(birthdayStr, 'MM/dd/yyyy', new Date());
      return format(date, 'MMMM d');
    } catch (e) {
      console.error("Error formatting birthday:", e);
      return birthdayStr;
    }
  };

  const handleDownloadFlyer = async () => {
    if (!student.flyer_image_src) return;
    setIsDownloading(true);

    try {
      const response = await fetch(student.flyer_image_src);
      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.statusText}`);
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const fileExtension = blob.type.split('/')[1] || 'png';
      link.download = `${student.name.replace(/\s+/g, '_')}_FYB_Flyer.${fileExtension}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Flyer download failed:", error);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/10 p-4 md:p-8">
      <header className="mb-6 container mx-auto max-w-4xl">
        <Button variant="outline" onClick={() => router.back()} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Students
        </Button>
      </header>

      <main className="container mx-auto max-w-4xl">
        <Card className="shadow-xl rounded-xl overflow-hidden">
          <CardHeader className="bg-primary text-primary-foreground p-6 md:p-8 relative">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden border-4 border-primary-foreground shadow-lg flex-shrink-0">
                {student.image_src ? (
                  <Image src={student.image_src} alt={student.name} layout="fill" objectFit="cover" unoptimized data-ai-hint="student profile" />
                ) : (
                  <div className="w-full h-full bg-muted flex items-center justify-center">
                    <User className="w-16 h-16 text-muted-foreground" />
                  </div>
                )}
              </div>
              <div>
                <CardTitle className="text-3xl md:text-4xl font-headline">{student.name}</CardTitle>
                {student.nickname && student.nickname.toLowerCase() !== 'non' && (
                  <p className="text-xl text-primary-foreground/80 font-body">{student.nickname}</p>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
            <DetailItem icon={Cake} label="Birthday" value={formatBirthday(student.birthday)} />
            <DetailItem icon={Heart} label="Relationship Status" value={student.relationship_status} />
            <DetailItem icon={MapPin} label="State of Origin" value={student.state_of_origin} />
            <DetailItem icon={MapPin} label="LGA" value={student.lga} />
            <DetailItem icon={BookOpen} label="Favourite Course" value={student.favourite_course} />
            <DetailItem icon={Mic} label="Favourite Lecturer" value={student.favourite_lecturer} />
            <DetailItem icon={Users} label="Favourite Coursemate(s)" value={student.favourite_coursemates} />
            <DetailItem icon={Edit3} label="Hobby(s)" value={student.hobbies} />
            <DetailItem icon={User} label="Post(s) Held" value={student.posts_held} />
            <DetailItem icon={Trophy} label="Best Level" value={student.best_level} />
            <DetailItem icon={ThumbsDown} label="Worst Level" value={student.worst_level} />
            <DetailItem icon={Briefcase} label="If not Zoology, then what?" value={student.alternative_career} />
            
            <div className="md:col-span-2 pt-4">
              <h3 className="text-lg font-headline text-primary mb-2">Reflections</h3>
              <DetailItem icon={MessageSquare} label="Your Class Rep Once Said:" value={`"${student.class_rep_quote}"`} />
              <DetailItem icon={MessageSquare} label="Parting Words:" value={`"${student.parting_words}"`} />
            </div>

             {student.favourite_course === "ZOO 202" && student.name === "Idoko Sarah" && (
              <div className="md:col-span-2 mt-4 p-4 bg-accent/10 rounded-md border border-accent/30">
                 <p className="text-sm font-semibold text-accent font-headline">Special Note for Idoko Sarah:</p>
                 <p className="text-sm text-accent/80 font-body">Microbiology might have been cool, but Zoology is where the wild things are! 😉</p>
              </div>
            )}


          </CardContent>
          {student.flyer_image_src && (
            <CardFooter className="p-6 md:p-8 bg-muted/50">
              <Button onClick={handleDownloadFlyer} size="lg" className="w-full md:w-auto font-headline bg-accent hover:bg-accent/90 text-accent-foreground" disabled={isDownloading}>
                {isDownloading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Downloading...
                  </>
                ) : (
                  <>
                    <Download className="mr-2 h-5 w-5" />
                    Download FYB Flyer
                  </>
                )}
              </Button>
            </CardFooter>
          )}
        </Card>
      </main>
    </div>
  );
}
