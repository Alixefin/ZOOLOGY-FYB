
'use server';
/**
 * @fileOverview An AI flow to generate a humorous roast for a student.
 *
 * - roastStudent - A function that generates a roast based on student profile data.
 * - RoastStudentInput - The input type for the roastStudent function.
 * - RoastStudentOutput - The return type for the roastStudent function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import type { Student } from '@/types';

// We only need a subset of the student data for the roast.
const RoastStudentInputSchema = z.object({
  name: z.string(),
  nickname: z.string().optional(),
  best_level: z.string(),
  worst_level: z.string(),
  favourite_lecturer: z.string(),
  relationship_status: z.string(),
  alternative_career: z.string(),
  best_experience: z.string(),
  worst_experience: z.string(),
  will_miss: z.string(),
});
export type RoastStudentInput = z.infer<typeof RoastStudentInputSchema>;

const RoastStudentOutputSchema = z.object({
  roast: z.string().describe('A short, witty, and humorous roast of the student. It should be light-hearted and funny, not mean-spirited. Should be 1-3 sentences.'),
});
export type RoastStudentOutput = z.infer<typeof RoastStudentOutputSchema>;

export async function roastStudent(input: Student): Promise<RoastStudentOutput> {
  // Map the full Student object to the schema the flow expects
  const flowInput: RoastStudentInput = {
    name: input.name,
    nickname: input.nickname,
    best_level: input.best_level,
    worst_level: input.worst_level,
    favourite_lecturer: input.favourite_lecturer,
    relationship_status: input.relationship_status,
    alternative_career: input.alternative_career,
    best_experience: input.best_experience,
    worst_experience: input.worst_experience,
    will_miss: input.will_miss,
  };
  return roastStudentFlow(flowInput);
}

const prompt = ai.definePrompt({
  name: 'roastStudentPrompt',
  input: { schema: RoastStudentInputSchema },
  output: { schema: RoastStudentOutputSchema },
  prompt: `You are a witty AI comedian known for your clever and light-hearted roasts. Your task is to roast a student based on their profile. The roast should be funny and clever, but not genuinely mean or insulting. It's for a fun yearbook-style feature.

Keep the roast to 1-3 sentences.

Here is the student's profile:
- Name: {{{name}}}
- Nickname: {{{nickname}}}
- Best Level: {{{best_level}}}
- Worst Level: {{{worst_level}}}
- Favourite Lecturer: {{{favourite_lecturer}}}
- Relationship Status: {{{relationship_status}}}
- If not Computing, they'd be a: {{{alternative_career}}}
- Best Experience: {{{best_experience}}}
- Worst Experience: {{{worst_experience}}}
- Will miss: {{{will_miss}}}

Generate a roast based on these details. Focus on the most interesting or contradictory parts. For example, if their best level was their final year, you could joke about them finally figuring things out. If their alternative career is very different from computing, that's a good target.
`,
});

const roastStudentFlow = ai.defineFlow(
  {
    name: 'roastStudentFlow',
    inputSchema: RoastStudentInputSchema,
    outputSchema: RoastStudentOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
