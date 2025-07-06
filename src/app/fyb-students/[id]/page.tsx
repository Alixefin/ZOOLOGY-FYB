
"use client";

import { usePathname, useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAppContext } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, User, Heart, Mic, Trophy, ThumbsDown, Briefcase, Smile, Frown, Send } from 'lucide-react';

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
  const { students } = useAppContext();
  
  const segments = pathname.split('/');
  const studentId = segments[segments.length - 1];

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20 p-4 sm:p-8">
      <header className="container mx-auto max-w-7xl mb-6">
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Clan
        </Button>
      </header>

      <main className="container mx-auto max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* Left Column */}
          <div className="lg:col-span-1 space-y-8">
            <Card className="shadow-lg rounded-xl">
              <CardContent className="p-6 divide-y divide-border/50">
                 <DetailItem icon={Trophy} label="Best Level" value={student.best_level} />
                 <DetailItem icon={ThumbsDown} label="Worst Level" value={student.worst_level} />
                 <DetailItem icon={Mic} label="Favourite Lecturer" value={student.favourite_lecturer} />
              </CardContent>
            </Card>
             <Card className="shadow-lg rounded-xl">
              <CardContent className="p-6 divide-y divide-border/50">
                 <DetailItem icon={Heart} label="Relationship Status" value={student.relationship_status} />
                 <DetailItem icon={Briefcase} label="If not Computing, then what?" value={student.alternative_career} />
              </CardContent>
            </Card>
          </div>

          {/* Center Column (Image) */}
          <div className="lg:col-span-1 flex flex-col items-center space-y-4">
             <div className="relative w-full aspect-square rounded-lg overflow-hidden shadow-2xl border-4 border-card">
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
          
          {/* Right Column */}
          <div className="lg:col-span-1 space-y-8">
            <Card className="shadow-lg rounded-xl">
              <CardContent className="p-6 divide-y divide-border/50">
                <DetailItem icon={Smile} label="Best Experience in FUL" value={student.best_experience} />
                <DetailItem icon={Frown} label="Worst Experience in FUL" value={student.worst_experience} />
                <DetailItem icon={Send} label="What will you miss after FUL?" value={student.will_miss} />
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
