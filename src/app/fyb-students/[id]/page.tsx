
"use client";

import { usePathname, useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAppContext } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { ArrowLeft, Download, User, Cake, Heart, MapPin, BookOpen, Mic, Users, Trophy, ThumbsDown, MessageSquare, Edit3, Briefcase, Loader2 } from 'lucide-react';
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
    <div className="flex items-start space-x-4 py-3">
      <Icon className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
      <div>
        <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">{label}</p>
        <p className="text-md text-foreground font-body">{displayValue}</p>
      </div>
    </div>
  );
};


export default function StudentDetailPage() {
  const pathname = usePathname();
  const router = useRouter();
  const { students } = useAppContext();
  
  const segments = pathname.split('/');
  const studentId = segments[segments.length - 1];

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
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20 p-4 sm:p-8">
      <header className="container mx-auto max-w-7xl mb-6">
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Clan
        </Button>
      </header>

      <main className="container mx-auto max-w-7xl">
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-6xl font-headline text-primary font-bold tracking-tight">{student.name}</h1>
          {student.nickname && student.nickname.toLowerCase() !== 'non' && (
            <p className="text-xl md:text-2xl text-muted-foreground font-body mt-2">"{student.nickname}"</p>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column */}
          <Card className="lg:col-span-4 shadow-lg rounded-xl">
            <CardContent className="p-6 divide-y divide-border/50">
              <DetailItem icon={Cake} label="Birthday" value={formatBirthday(student.birthday)} />
              <DetailItem icon={Heart} label="Relationship Status" value={student.relationship_status} />
              <DetailItem icon={MapPin} label="State of Origin" value={student.state_of_origin} />
              <DetailItem icon={MapPin} label="LGA" value={student.lga} />
              <DetailItem icon={User} label="Post(s) Held" value={student.posts_held} />
              <DetailItem icon={Trophy} label="Best Level" value={student.best_level} />
              <DetailItem icon={ThumbsDown} label="Worst Level" value={student.worst_level} />
            </CardContent>
          </Card>

          {/* Center Image */}
          <div className="lg:col-span-4 flex justify-center order-first lg:order-none">
            <div className="relative w-full max-w-sm aspect-[3/4] rounded-xl overflow-hidden shadow-2xl border-4 border-card transform hover:scale-105 transition-transform duration-300">
              {student.image_src ? (
                <Image src={student.image_src} alt={student.name} layout="fill" objectFit="cover" unoptimized data-ai-hint="student profile" />
              ) : (
                <div className="w-full h-full bg-muted flex items-center justify-center">
                  <User className="w-24 h-24 text-muted-foreground" />
                </div>
              )}
            </div>
          </div>

          {/* Right Column */}
          <Card className="lg:col-span-4 shadow-lg rounded-xl">
            <CardContent className="p-6 divide-y divide-border/50">
              <DetailItem icon={BookOpen} label="Favourite Course" value={student.favourite_course} />
              <DetailItem icon={Mic} label="Favourite Lecturer" value={student.favourite_lecturer} />
              <DetailItem icon={Users} label="Favourite Coursemate(s)" value={student.favourite_coursemates} />
              <DetailItem icon={Edit3} label="Hobby(s)" value={student.hobbies} />
              <DetailItem icon={Briefcase} label="If not Computing, then what?" value={student.alternative_career} />
            </CardContent>
          </Card>
        </div>

        {/* Reflections and Download */}
        <Card className="mt-8 shadow-lg rounded-xl">
          <CardHeader>
            <CardTitle className="text-2xl font-headline text-primary">Reflections</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <DetailItem icon={MessageSquare} label="Your Class Rep Once Said:" value={`"${student.class_rep_quote}"`} />
            <DetailItem icon={MessageSquare} label="Parting Words:" value={`"${student.parting_words}"`} />
          </CardContent>
          {student.flyer_image_src && (
            <CardFooter className="bg-muted/50 p-6 flex justify-center">
              <Button onClick={handleDownloadFlyer} size="lg" className="w-full sm:w-auto font-headline bg-accent hover:bg-accent/90 text-accent-foreground" disabled={isDownloading}>
                {isDownloading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Downloading...
                  </>
                ) : (
                  <>
                    <Download className="mr-2 h-5 w-5" />
                    Download Clan Flyer
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
