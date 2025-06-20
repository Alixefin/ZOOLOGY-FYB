
"use client";

import { useState, useMemo } from 'react';
import { useAppContext } from '@/contexts/AppContext';
import StudentCard from '@/components/StudentCard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, Search } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function FybStudentsPage() {
  const { students } = useAppContext();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredStudents = useMemo(() => {
    if (!searchTerm) return students;
    return students.filter(student =>
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (student.nickname && student.nickname.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [students, searchTerm]);

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <header className="mb-8">
        <div className="container mx-auto max-w-6xl">
          <Button variant="outline" asChild className="mb-4">
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
            </Link>
          </Button>
          <h1 className="text-4xl font-headline text-primary mb-2">Meet Our Final Year Brethren</h1>
          <p className="text-lg text-muted-foreground font-body">Browse through the profiles of our amazing final year students.</p>
        </div>
      </header>

      <main className="container mx-auto max-w-6xl">
        <div className="mb-8 p-6 bg-card rounded-lg shadow-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search for a student by name or nickname..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 py-3 text-lg"
              aria-label="Search students"
            />
          </div>
        </div>

        {filteredStudents.length > 0 ? (
          <ScrollArea className="h-[calc(100vh-20rem)]"> {/* Adjust height as needed */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredStudents.map(student => (
                <StudentCard key={student.id} student={student} />
              ))}
            </div>
          </ScrollArea>
        ) : (
          <div className="text-center py-12">
            <p className="text-xl text-muted-foreground font-body">
              {searchTerm ? "No students found matching your search." : "No students available at the moment."}
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
