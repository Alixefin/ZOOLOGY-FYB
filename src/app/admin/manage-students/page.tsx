
"use client";

import Link from 'next/link';
import { useAppContext } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PlusCircle, Edit, Trash2, User } from 'lucide-react';
import AdminHeader from '@/components/AdminHeader';
import Image from 'next/image';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useToast } from '@/hooks/use-toast';

export default function ManageStudentsPage() {
  const { students, deleteStudent } = useAppContext();
  const { toast } = useToast();

  const handleDeleteStudent = (studentId: string) => {
    deleteStudent(studentId);
    toast({
      title: "Student Deleted",
      description: "The student profile has been removed.",
      variant: "destructive"
    });
  };

  return (
    <div className="min-h-screen bg-muted/30">
      <AdminHeader />
      <main className="container mx-auto p-4 md:p-8">
        <Card className="shadow-lg rounded-xl">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-3xl font-headline text-primary">Manage FYB Students</CardTitle>
              <CardDescription className="font-body">
                View, add, edit, or delete student profiles.
              </CardDescription>
            </div>
            <Button asChild className="font-headline bg-primary hover:bg-primary/90">
              <Link href="/admin/manage-students/add">
                <PlusCircle className="mr-2 h-5 w-5" /> Add New Student
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {students.length === 0 ? (
              <p className="text-center text-muted-foreground py-8 font-body">No students added yet. Click "Add New Student" to begin.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[80px]">Image</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Nickname</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {students.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell>
                        <div className="w-12 h-12 rounded-full overflow-hidden bg-muted flex items-center justify-center">
                          {student.imageSrc ? (
                            <Image src={student.imageSrc} alt={student.name} width={48} height={48} className="object-cover" unoptimized />
                          ) : (
                            <User className="w-6 h-6 text-muted-foreground" />
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium font-body">{student.name}</TableCell>
                      <TableCell className="font-body">{student.nickname || 'N/A'}</TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button variant="outline" size="icon" asChild>
                          <Link href={`/admin/manage-students/edit/${student.id}`}>
                            <Edit className="h-4 w-4" />
                            <span className="sr-only">Edit Student</span>
                          </Link>
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="icon">
                              <Trash2 className="h-4 w-4" />
                              <span className="sr-only">Delete Student</span>
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete {student.name}'s profile.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeleteStudent(student.id)}>
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
