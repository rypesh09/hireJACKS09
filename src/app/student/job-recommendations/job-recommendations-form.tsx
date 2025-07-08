'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Lightbulb, Loader2, Sparkles } from 'lucide-react';
import { jobRecommendations, JobRecommendationsInput, JobRecommendationsOutput } from '@/ai/flows/job-recommendations';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/hooks/use-auth';
import { getUserProfile } from '@/services/userService';
import { Skeleton } from '@/components/ui/skeleton';

const formSchema = z.object({
  resumeText: z.string().min(100, {
    message: 'Resume text must be at least 100 characters.',
  }),
  pastHistory: z.string().optional(),
});

export function JobRecommendationsForm() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<JobRecommendationsOutput | null>(null);
  const [isProfileLoading, setIsProfileLoading] = useState(true);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      resumeText: '',
      pastHistory: '',
    },
  });

  useEffect(() => {
    async function loadResume() {
      if (user) {
        setIsProfileLoading(true);
        try {
          const userProfile = await getUserProfile(user.uid);
          if (userProfile?.resumeText) {
            form.setValue('resumeText', userProfile.resumeText);
          }
        } catch (error) {
          console.error("Failed to load user resume", error);
          toast({
            title: "Warning",
            description: "Could not load your resume from your profile. Please paste it manually.",
            variant: "destructive",
          });
        } finally {
          setIsProfileLoading(false);
        }
      } else {
         setIsProfileLoading(false);
      }
    }
    loadResume();
  }, [user, form, toast]);


  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setRecommendations(null);
    try {
      const input: JobRecommendationsInput = { ...values };
      const result = await jobRecommendations(input);
      setRecommendations(result);
    } catch (error) {
      console.error('Error getting recommendations:', error);
      toast({
        title: "Error",
        description: "Failed to get recommendations. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-3">
      <div className="lg:col-span-1">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Your Information</CardTitle>
                <CardDescription>Provide your details for analysis.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="resumeText"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Resume Content</FormLabel>
                      <FormControl>
                        { isProfileLoading ? (
                          <div className="flex flex-col space-y-2 pt-2 min-h-[200px]">
                            <Skeleton className="h-4 w-3/4" />
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-full" />
                             <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-1/2" />
                          </div>
                        ) : (
                        <Textarea
                          placeholder="Paste your full resume here. We've pre-filled it from your profile if available."
                          className="min-h-[200px] resize-y"
                          {...field}
                        />
                        )}
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="pastHistory"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Past Job History (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., 'Software Engineer Intern', 'Data Analyst'" {...field} />
                      </FormControl>
                       <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
            <Button type="submit" disabled={isLoading || isProfileLoading} className="w-full">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Lightbulb className="mr-2 h-4 w-4" />
                  Get Recommendations
                </>
              )}
            </Button>
          </form>
        </Form>
      </div>
      <div className="lg:col-span-2">
        <Card className="min-h-full">
          <CardHeader>
            <CardTitle>AI-Powered Suggestions</CardTitle>
            <CardDescription>Here are the job roles we think are a great fit for you.</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading && (
              <div className="flex h-[300px] items-center justify-center">
                <div className="flex flex-col items-center gap-2">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <p className="text-muted-foreground">Finding your perfect match...</p>
                </div>
              </div>
            )}
            {!isLoading && !recommendations && (
                <div className="flex h-[300px] flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 text-center">
                    <Sparkles className="h-12 w-12 text-muted-foreground/50" />
                    <p className="mt-4 text-lg font-medium text-muted-foreground">Your recommended jobs will appear here.</p>
                    <p className="text-sm text-muted-foreground">Fill out the form to get started.</p>
                </div>
            )}
            {recommendations && (
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold">Recommended Job Titles</h3>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {recommendations.jobTitles.map((title) => (
                      <div key={title} className="rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
                        {title}
                      </div>
                    ))}
                  </div>
                </div>
                <Separator />
                <div>
                  <h3 className="font-semibold">Reasoning</h3>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{recommendations.reasoning}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
