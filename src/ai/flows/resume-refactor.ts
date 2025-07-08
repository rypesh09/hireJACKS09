'use server';

/**
 * @fileOverview This file defines a Genkit flow for refactoring resumes.
 *
 * - resumeRefactorFlow - A flow that takes a resume as input and reformats it.
 * - ResumeRefactorInput - The input type for the resumeRefactor function.
 * - ResumeRefactorOutput - The output type for the resumeRefactor function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ResumeRefactorInputSchema = z.object({
  resumeText: z
    .string()
    .describe('The text content of the resume to be reformatted.'),
});
export type ResumeRefactorInput = z.infer<typeof ResumeRefactorInputSchema>;

const ResumeRefactorOutputSchema = z.object({
  reformattedResume: z
    .string()
    .describe('The reformatted resume in a professional, industry-standard template.'),
});
export type ResumeRefactorOutput = z.infer<typeof ResumeRefactorOutputSchema>;

export async function resumeRefactor(input: ResumeRefactorInput): Promise<ResumeRefactorOutput> {
  return resumeRefactorFlow(input);
}

const prompt = ai.definePrompt({
  name: 'resumeRefactorPrompt',
  input: {schema: ResumeRefactorInputSchema},
  output: {schema: ResumeRefactorOutputSchema},
  prompt: `You are an AI resume expert. Please reformat the following resume into a professional, industry-standard template.

Resume:
{{{resumeText}}}

Ensure that the reformatted resume is well-structured, easy to read, and highlights the candidate's key skills and experiences.  Pay particular attention to formatting and proper grammar.`,
});

const resumeRefactorFlow = ai.defineFlow(
  {
    name: 'resumeRefactorFlow',
    inputSchema: ResumeRefactorInputSchema,
    outputSchema: ResumeRefactorOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
