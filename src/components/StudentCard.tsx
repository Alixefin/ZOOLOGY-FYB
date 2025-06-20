
"use client";

import Image from 'next/image';
import Link from 'next/link';
import type { Student } from '@/types';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { ArrowRight } from 'lucide-react';

interface StudentCardProps {
  student: Student;
}

export default function StudentCard({ student }: StudentCardProps) {
  return (
    <Link href={`/fyb-students/${student.id}`} passHref legacyBehavior>
      <a className="block group">
        <Card className="overflow-hidden h-full flex flex-col hover:shadow-xl transition-shadow duration-300 rounded-lg">
          <div className="relative w-full aspect-[3/4] bg-muted">
            {student.imageSrc ? (
              <Image
                src={student.imageSrc}
                alt={student.name}
                layout="fill"
                objectFit="cover"
                unoptimized
                className="group-hover:scale-105 transition-transform duration-300"
                data-ai-hint="student portrait"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-200">
                <span className="text-muted-foreground">No Image</span>
              </div>
            )}
          </div>
          <CardContent className="p-4 flex-grow">
            <h3 className="text-lg font-headline font-semibold text-primary group-hover:text-accent transition-colors">
              {student.name}
            </h3>
            {student.nickname && student.nickname.toLowerCase() !== 'non' && (
              <p className="text-sm text-muted-foreground">{student.nickname}</p>
            )}
          </CardContent>
          <CardFooter className="p-4 bg-secondary/30">
             <div className="text-sm text-primary group-hover:text-accent transition-colors flex items-center">
                View Profile <ArrowRight className="ml-2 h-4 w-4 transform group-hover:translate-x-1 transition-transform"/>
             </div>
          </CardFooter>
        </Card>
      </a>
    </Link>
  );
}
