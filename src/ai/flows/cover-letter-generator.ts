'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating cover letters.
 *
 * - coverLetterGenerator - A flow that takes a job title and resume and generates a cover letter.
 * - CoverLetterGeneratorInput - The input type for the coverLetterGenerator function.
 * - CoverLetterGeneratorOutput - The output type for the coverLetterGenerator function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CoverLetterGeneratorInputSchema = z.object({
  jobTitle: z.string().describe('The job title the user is applying for.'),
  resumeText: z
    .string()
    .describe('The text content of the resume to be used for generating the cover letter.'),
  companyName: z.string().optional().describe('The name of the company the user is applying to.'),
});
export type CoverLetterGeneratorInput = z.infer<typeof CoverLetterGeneratorInputSchema>;

const CoverLetterGeneratorOutputSchema = z.object({
  generatedCoverLetter: z
    .string()
    .describe('The generated cover letter draft.'),
});
export type CoverLetterGeneratorOutput = z.infer<typeof CoverLetterGeneratorOutputSchema>;

export async function coverLetterGenerator(input: CoverLetterGeneratorInput): Promise<CoverLetterGeneratorOutput> {
  return coverLetterGeneratorFlow(input);
}

const prompt = ai.definePrompt({
  name: 'coverLetterGeneratorPrompt',
  input: {schema: CoverLetterGeneratorInputSchema},
  output: {schema: CoverLetterGeneratorOutputSchema},
  prompt: `You are an AI career coach specializing in writing compelling cover letters.
A student is applying for the position of {{{jobTitle}}}{{#if companyName}} at {{{companyName}}}{{/if}}.

Using the provided resume, write a professional and engaging cover letter. The cover letter should:
1.  Be addressed to a generic hiring manager.
2.  Clearly state the position being applied for.
3.  Highlight 2-3 key skills and experiences from the resume that are most relevant to the {{{jobTitle}}} role.
4.  Express enthusiasm for the opportunity.
5.  Maintain a professional and confident tone.
6.  Be concise and well-structured.

Resume to use as a reference:
{{{resumeText}}}
`,
});

const coverLetterGeneratorFlow = ai.defineFlow(
  {
    name: 'coverLetterGeneratorFlow',
    inputSchema: CoverLetterGeneratorInputSchema,
    outputSchema: CoverLetterGeneratorOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
