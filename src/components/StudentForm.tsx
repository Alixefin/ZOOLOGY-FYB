
"use client";

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import type { Student } from '@/types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Save, Loader2 } from 'lucide-react';

const studentFormSchema = z.object({
  id: z.string().min(1, "Student ID is required."),
  name: z.string().min(2, "Name must be at least 2 characters."),
  nickname: z.string().optional(),
  best_level: z.string().min(1, "Best level is required."),
  worst_level: z.string().min(1, "Worst level is required."),
  favourite_lecturer: z.string().min(1, "Favourite lecturer is required."),
  relationship_status: z.string().min(1, "Relationship status is required."),
  alternative_career: z.string().min(1, "This field is required."),
  best_experience: z.string().min(1, "Best experience is required."),
  worst_experience: z.string().min(1, "Worst experience is required."),
  will_miss: z.string().min(1, "This field is required."),
  image_src: z.string().url("Please enter a valid image URL.").nullable().optional(),
});

type StudentFormData = z.infer<typeof studentFormSchema>;

interface StudentFormProps {
  student?: Student | null; // For editing
  onSubmit: (data: StudentFormData) => void;
  isEditing?: boolean;
  isSubmitting?: boolean;
}

export default function StudentForm({ student, onSubmit, isEditing = false, isSubmitting = false }: StudentFormProps) {
  const form = useForm<StudentFormData>({
    resolver: zodResolver(studentFormSchema),
    defaultValues: {
      id: student?.id || '',
      name: student?.name || '',
      nickname: student?.nickname || '',
      best_level: student?.best_level || '',
      worst_level: student?.worst_level || '',
      favourite_lecturer: student?.favourite_lecturer || '',
      relationship_status: student?.relationship_status || '',
      alternative_career: student?.alternative_career || '',
      best_experience: student?.best_experience || '',
      worst_experience: student?.worst_experience || '',
      will_miss: student?.will_miss || '',
      image_src: student?.image_src || '',
    },
  });

  const handleSubmit = (data: StudentFormData) => {
    onSubmit(data);
  };

  return (
    <Card className="shadow-lg rounded-xl">
      <CardHeader>
        <CardTitle className="text-3xl font-headline text-primary">
          {isEditing ? 'Edit Student Profile' : 'Add New Student'}
        </CardTitle>
        <CardDescription className="font-body">
          {isEditing ? 'Update the details for this student.' : 'Fill in the details for the new student.'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Student ID</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., C/UG/17/1234" {...field} disabled={isEditing || isSubmitting} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., John Doe" {...field} disabled={isSubmitting} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="nickname"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nickname (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Johnny" {...field} disabled={isSubmitting} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="best_level"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Best Level</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., 300 Level" {...field} disabled={isSubmitting} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="worst_level"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Worst Level</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., 100 Level" {...field} disabled={isSubmitting} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="favourite_lecturer"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Favourite Lecturer</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Dr. Smith" {...field} disabled={isSubmitting} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="relationship_status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Relationship Status</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Single" {...field} disabled={isSubmitting} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="alternative_career"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>If not Computing, then what?</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Professional Artist" {...field} disabled={isSubmitting} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="best_experience"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Best Experience in FUL</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Describe your best experience..." {...field} disabled={isSubmitting} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="worst_experience"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Worst Experience in FUL</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Describe your worst experience..." {...field} disabled={isSubmitting} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="will_miss"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>What will you miss after FUL?</FormLabel>
                  <FormControl>
                    <Textarea placeholder="What will you miss the most..." {...field} disabled={isSubmitting} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
                control={form.control}
                name="image_src"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Image Link</FormLabel>
                    <FormControl>
                      <Input placeholder="https://example.com/image.png" {...field} value={field.value ?? ''} disabled={isSubmitting} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            
            <div className="flex justify-end pt-6">
              <Button type="submit" size="lg" className="font-headline bg-primary hover:bg-primary/90" disabled={isSubmitting}>
                {isSubmitting ? (
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                ) : (
                  <Save className="mr-2 h-5 w-5" />
                )}
                {isSubmitting ? (isEditing ? 'Saving...' : 'Adding...') : (isEditing ? 'Save Changes' : 'Add Student')}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
