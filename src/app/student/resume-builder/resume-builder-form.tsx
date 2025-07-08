
'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Wand2, ClipboardCopy, Check, Loader2 } from 'lucide-react';
import { resumeRefactor, ResumeRefactorInput } from '@/ai/flows/resume-refactor';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { getUserProfile } from '@/services/userService';
import { Skeleton } from '@/components/ui/skeleton';


const formSchema = z.object({
  resumeText: z.string().min(100, { message: "Resume text must be at least 100 characters." }),
});

export function ResumeBuilderForm() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [reformattedResume, setReformattedResume] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const [isProfileLoading, setIsProfileLoading] = useState(true);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      resumeText: '',
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
    setReformattedResume('');
    try {
      const input: ResumeRefactorInput = { resumeText: values.resumeText };
      const result = await resumeRefactor(input);
      setReformattedResume(result.reformattedResume);
    } catch (error) {
      console.error('Error refactoring resume:', error);
      toast({
        title: "Error",
        description: "Failed to refactor resume. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }
  
  const handleCopy = () => {
    navigator.clipboard.writeText(reformattedResume);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
     toast({
        title: "Copied!",
        description: "Reformatted resume copied to clipboard.",
      });
  };

  const isSubmitDisabled = isLoading || isProfileLoading;


  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
            <Card>
                <CardHeader>
                    <CardTitle>Your Current Resume</CardTitle>
                    <CardDescription>Paste your resume content to be refactored.</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    <FormField
                        control={form.control}
                        name="resumeText"
                        render={({ field }) => (
                            <FormItem>
                            <FormControl>
                                { isProfileLoading ? (
                                    <div className="flex flex-col space-y-2 p-4 min-h-[400px]">
                                        <Skeleton className="h-4 w-3/4" />
                                        <Skeleton className="h-4 w-full" />
                                        <Skeleton className="h-4 w-full" />
                                        <Skeleton className="h-4 w-1/2" />
                                    </div>
                                ) : (
                                <Textarea
                                    placeholder="Paste your resume content here. We've pre-filled it from your profile if available."
                                    className="min-h-[400px] resize-y rounded-t-lg border-0 focus-visible:ring-0"
                                    {...field}
                                />
                                )}
                            </FormControl>
                            <FormMessage className="p-4" />
                            </FormItem>
                        )}
                    />
                </CardContent>
            </Card>

            <Card className="flex flex-col">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>AI Refactored Resume</CardTitle>
                <Button variant="ghost" size="icon" onClick={handleCopy} disabled={!reformattedResume}>
                  {isCopied ? <Check className="h-4 w-4 text-green-500" /> : <ClipboardCopy className="h-4 w-4" />}
                </Button>
              </CardHeader>
              <CardContent className="flex-grow">
                {isLoading ? (
                  <div className="flex h-full min-h-[300px] items-center justify-center">
                    <div className="flex flex-col items-center gap-2">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      <p className="text-muted-foreground">AI is working its magic...</p>
                    </div>
                  </div>
                ) : (
                  <pre className="whitespace-pre-wrap rounded-md bg-muted p-4 font-sans text-sm h-full">
                    {reformattedResume || "Your refactored resume will appear here. Paste your current resume and click 'Refactor with AI' to get started."}
                  </pre>
                )}
              </CardContent>
            </Card>
        </div>

        <div className="flex justify-end">
          <Button type="submit" disabled={isSubmitDisabled}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Refactoring...
              </>
            ) : (
              <>
                <Wand2 className="mr-2 h-4 w-4" />
                Refactor with AI
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}

