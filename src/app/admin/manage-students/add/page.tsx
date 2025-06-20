
"use client";

import { useRouter } from 'next/navigation';
import { useAppContext } from '@/contexts/AppContext';
import StudentForm from '@/components/StudentForm';
import AdminHeader from '@/components/AdminHeader';
import { useToast } from "@/hooks/use-toast";
import type { Student } from '@/types'; // Import Student type

export default function AddStudentPage() {
  const router = useRouter();
  const { addStudent } = useAppContext();
  const { toast } = useToast();

  // Explicitly type the data argument according to StudentForm's expectation
  const handleAddStudent = (data: Omit<Student, 'id'>) => {
    addStudent(data);
    toast({
      title: "Student Added",
      description: `${data.name} has been successfully added.`,
    });
    router.push('/admin/manage-students');
  };

  return (
    <div className="min-h-screen bg-muted/30">
      <AdminHeader />
      <main className="container mx-auto p-4 md:p-8">
        <StudentForm onSubmit={handleAddStudent} />
      </main>
    </div>
  );
}
