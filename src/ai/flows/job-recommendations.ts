// src/ai/flows/job-recommendations.ts
'use server';

/**
 * @fileOverview A job recommendation AI agent.
 *
 * - jobRecommendations - A function that handles the job recommendation process.
 * - JobRecommendationsInput - The input type for the jobRecommendations function.
 * - JobRecommendationsOutput - The return type for the jobRecommendations function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const JobRecommendationsInputSchema = z.object({
  resumeText: z.string().describe('The text content of the student\'s resume.'),
  pastHistory: z.string().optional().describe('The student\'s past job search history, if available.'),
});
export type JobRecommendationsInput = z.infer<typeof JobRecommendationsInputSchema>;

const JobRecommendationsOutputSchema = z.object({
  jobTitles: z.array(z.string()).describe('An array of recommended job titles based on the resume and past history.'),
  reasoning: z.string().describe('Explanation of why these jobs were recommended based on skills and experience.'),
});
export type JobRecommendationsOutput = z.infer<typeof JobRecommendationsOutputSchema>;

export async function jobRecommendations(input: JobRecommendationsInput): Promise<JobRecommendationsOutput> {
  return jobRecommendationsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'jobRecommendationsPrompt',
  input: {schema: JobRecommendationsInputSchema},
  output: {schema: JobRecommendationsOutputSchema},
  prompt: `You are an AI job recommendation agent. Based on the provided resume and past job search history, recommend relevant job titles.

Resume:
{{resumeText}}

Past Job Search History:
{{pastHistory}}

Consider the skills and experience outlined in the resume. Explain why each job title is a good fit for the candidate.

Return the recommendations as a JSON object with jobTitles and reasoning fields.
`,
});

const jobRecommendationsFlow = ai.defineFlow(
  {
    name: 'jobRecommendationsFlow',
    inputSchema: JobRecommendationsInputSchema,
    outputSchema: JobRecommendationsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
