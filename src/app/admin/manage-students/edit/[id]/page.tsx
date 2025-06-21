
"use client";

import { useParams, useRouter } from 'next/navigation';
import { useAppContext } from '@/contexts/AppContext';
import StudentForm from '@/components/StudentForm';
import AdminHeader from '@/components/AdminHeader';
import { useToast } from "@/hooks/use-toast";
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import type { Student } from '@/types'; // Import Student type
import { useState } from 'react';

export default function EditStudentPage() {
  const params = useParams();
  const router = useRouter();
  const { students, updateStudent } = useAppContext();
  const { toast } = useToast();
  const studentId = params.id as string;
  const [isSubmitting, setIsSubmitting] = useState(false);

  const student = students.find(s => s.id === studentId);

  // Explicitly type the data argument
  const handleEditStudent = async (data: Omit<Student, 'id'>) => {
    if (student) {
      setIsSubmitting(true);
      try {
        await updateStudent({ ...student, ...data });
        toast({
          title: "Student Updated",
          description: `${data.name}'s profile has been successfully updated.`,
        });
        router.push('/admin/manage-students');
      } catch (error: any) {
        toast({
          title: "Update Failed",
          description: error?.message || "An unknown error occurred. Please check your Supabase connection.",
          variant: "destructive",
        });
        setIsSubmitting(false);
      }
    }
  };

  if (!student) {
    return (
      <div className="min-h-screen bg-muted/30">
        <AdminHeader />
        <main className="container mx-auto p-8 text-center">
          <h1 className="text-2xl font-headline text-destructive mb-4">Student not found</h1>
          <Button onClick={() => router.push('/admin/manage-students')}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Student List
          </Button>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <AdminHeader />
      <main className="container mx-auto p-4 md:p-8">
        <StudentForm student={student} onSubmit={handleEditStudent} isEditing isSubmitting={isSubmitting} />
      </main>
    </div>
  );
}
