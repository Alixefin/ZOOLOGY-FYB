
"use client";

import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import type { Student } from '@/types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import FileUpload from '@/components/FileUpload';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Save, Loader2 } from 'lucide-react';

const studentFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  nickname: z.string().optional(),
  birthday: z.string().regex(/^\d{2}\/\d{2}\/\d{4}$/, "Birthday must be in MM/DD/YYYY format."),
  relationship_status: z.string().min(1, "Relationship status is required."),
  state_of_origin: z.string().min(1, "State of origin is required."),
  lga: z.string().min(1, "LGA is required."),
  favourite_course: z.string().min(1, "Favourite course is required."),
  favourite_lecturer: z.string().min(1, "Favourite lecturer is required."),
  favourite_coursemates: z.string().transform(val => val.split(',').map(s => s.trim()).filter(Boolean)),
  hobbies: z.string().transform(val => val.split(',').map(s => s.trim()).filter(Boolean)),
  posts_held: z.string().min(1, "Posts held is required."),
  best_level: z.string().min(1, "Best level is required."),
  worst_level: z.string().min(1, "Worst level is required."),
  class_rep_quote: z.string().min(1, "Class rep quote is required."),
  parting_words: z.string().min(1, "Parting words are required."),
  alternative_career: z.string().min(1, "This field is required."),
  image_src: z.string().nullable().optional(),
  flyer_image_src: z.string().nullable().optional(),
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
      name: student?.name || '',
      nickname: student?.nickname || '',
      birthday: student?.birthday || '',
      relationship_status: student?.relationship_status || '',
      state_of_origin: student?.state_of_origin || '',
      lga: student?.lga || '',
      favourite_course: student?.favourite_course || '',
      favourite_lecturer: student?.favourite_lecturer || '',
      favourite_coursemates: (student?.favourite_coursemates || []).join(', '),
      hobbies: (student?.hobbies || []).join(', '),
      posts_held: student?.posts_held || '',
      best_level: student?.best_level || '',
      worst_level: student?.worst_level || '',
      class_rep_quote: student?.class_rep_quote || '',
      parting_words: student?.parting_words || '',
      alternative_career: student?.alternative_career || '',
      image_src: student?.image_src || null,
      flyer_image_src: student?.flyer_image_src || null,
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
                name="birthday"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Birthday (MM/DD/YYYY)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., 12/25/2000" {...field} disabled={isSubmitting} />
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
                name="state_of_origin"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>State of Origin</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Kogi State" {...field} disabled={isSubmitting} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="lga"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>LGA</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Lokoja" {...field} disabled={isSubmitting} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="favourite_course"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Favourite Course</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., ZOO 301" {...field} disabled={isSubmitting} />
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
                name="favourite_coursemates"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Favourite Coursemate(s) (comma-separated)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Alice, Bob, Charlie" {...field} disabled={isSubmitting} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="hobbies"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Hobby(s) (comma-separated)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Reading, Hiking, Coding" {...field} disabled={isSubmitting} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="posts_held"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Post(s) Held</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Class Rep, Non" {...field} disabled={isSubmitting} />
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
            </div>

            <FormField
              control={form.control}
              name="class_rep_quote"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Your Class Rep Once Said</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Enter the quote..." {...field} disabled={isSubmitting} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="parting_words"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Parting Words</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Enter parting words..." {...field} disabled={isSubmitting} />
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
                    <FormLabel>If not Zoology, then what?</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Professional Coder" {...field} disabled={isSubmitting} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t">
               <FormField
                control={form.control}
                name="image_src"
                render={({ field }) => (
                  <FormItem>
                    <FileUpload
                      label="Student Profile Image"
                      currentImagePreview={field.value}
                      onFileSelect={(dataUrl) => field.onChange(dataUrl)}
                      disabled={isSubmitting}
                    />
                     <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="flyer_image_src"
                render={({ field }) => (
                  <FormItem>
                     <FileUpload
                        label="Student FYB Flyer Image"
                        currentImagePreview={field.value}
                        onFileSelect={(dataUrl) => field.onChange(dataUrl)}
                        disabled={isSubmitting}
                      />
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
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
