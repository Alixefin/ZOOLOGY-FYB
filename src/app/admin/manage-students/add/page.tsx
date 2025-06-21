
"use client";

import { useRouter } from 'next/navigation';
import { useAppContext } from '@/contexts/AppContext';
import StudentForm from '@/components/StudentForm';
import AdminHeader from '@/components/AdminHeader';
import { useToast } from "@/hooks/use-toast";
import type { Student } from '@/types'; // Import Student type
import { useState } from 'react';

export default function AddStudentPage() {
  const router = useRouter();
  const { addStudent } = useAppContext();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Explicitly type the data argument according to StudentForm's expectation
  const handleAddStudent = async (data: Omit<Student, 'id'>) => {
    setIsSubmitting(true);
    try {
      await addStudent(data);
      toast({
        title: "Student Added",
        description: `${data.name} has been successfully added.`,
      });
      router.push('/admin/manage-students');
    } catch (error: any) {
      toast({
        title: "Failed to Add Student",
        description: error?.message || "An unknown error occurred. Please check your Supabase connection.",
        variant: "destructive",
      });
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-muted/30">
      <AdminHeader />
      <main className="container mx-auto p-4 md:p-8">
        <StudentForm onSubmit={handleAddStudent} isSubmitting={isSubmitting} />
      </main>
    </div>
  );
}
