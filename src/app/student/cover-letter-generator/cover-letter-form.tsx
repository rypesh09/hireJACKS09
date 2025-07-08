'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FileSignature, ClipboardCopy, Check, Loader2 } from 'lucide-react';
import { coverLetterGenerator, CoverLetterGeneratorInput } from '@/ai/flows/cover-letter-generator';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { getUserProfile } from '@/services/userService';
import { Skeleton } from '@/components/ui/skeleton';

const formSchema = z.object({
  jobTitle: z.string().min(2, { message: 'Job title must be at least 2 characters.' }),
  companyName: z.string().optional(),
  resumeText: z.string().min(100, {
    message: 'Resume text must be at least 100 characters.',
  }),
});

export function CoverLetterGeneratorForm() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [generatedCoverLetter, setGeneratedCoverLetter] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const [isProfileLoading, setIsProfileLoading] = useState(true);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      jobTitle: '',
      companyName: '',
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
    setGeneratedCoverLetter('');
    try {
      const input: CoverLetterGeneratorInput = { ...values };
      const result = await coverLetterGenerator(input);
      setGeneratedCoverLetter(result.generatedCoverLetter);
    } catch (error) {
      console.error('Error generating cover letter:', error);
      toast({
        title: "Error",
        description: "Failed to generate cover letter. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }
  
  const handleCopy = () => {
    navigator.clipboard.writeText(generatedCoverLetter);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
     toast({
        title: "Copied!",
        description: "Cover letter copied to clipboard.",
      });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-1">
             <Card>
               <CardHeader>
                 <CardTitle>Job Details</CardTitle>
               </CardHeader>
               <CardContent className="space-y-4">
                 <FormField
                   control={form.control}
                   name="jobTitle"
                   render={({ field }) => (
                     <FormItem>
                       <FormLabel>Job Title</FormLabel>
                       <FormControl>
                         <Input placeholder="e.g., Software Engineer" {...field} />
                       </FormControl>
                       <FormMessage />
                     </FormItem>
                   )}
                 />
                 <FormField
                   control={form.control}
                   name="companyName"
                   render={({ field }) => (
                     <FormItem>
                       <FormLabel>Company Name (Optional)</FormLabel>
                       <FormControl>
                         <Input placeholder="e.g., Google" {...field} />
                       </FormControl>
                       <FormMessage />
                     </FormItem>
                   )}
                 />
               </CardContent>
             </Card>
          </div>
          <div className="lg:col-span-2">
             <Tabs defaultValue="editor" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="editor">Your Resume</TabsTrigger>
                <TabsTrigger value="result" disabled={!generatedCoverLetter && !isLoading}>
                  AI Generated Letter
                </TabsTrigger>
              </TabsList>
              <TabsContent value="editor">
                <Card>
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
              </TabsContent>
              <TabsContent value="result">
                <Card className="min-h-[468px]">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Generated Cover Letter</CardTitle>
                    <Button variant="ghost" size="icon" onClick={handleCopy} disabled={!generatedCoverLetter}>
                      {isCopied ? <Check className="h-4 w-4 text-green-500" /> : <ClipboardCopy className="h-4 w-4" />}
                    </Button>
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <div className="flex h-[300px] items-center justify-center">
                        <div className="flex flex-col items-center gap-2">
                          <Loader2 className="h-8 w-8 animate-spin text-primary" />
                          <p className="text-muted-foreground">Crafting your cover letter...</p>
                        </div>
                      </div>
                    ) : (
                      <pre className="whitespace-pre-wrap rounded-md bg-muted p-4 font-sans text-sm">
                        {generatedCoverLetter || "Your generated cover letter will appear here."}
                      </pre>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        <div className="flex justify-end">
          <Button type="submit" disabled={isLoading || isProfileLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <FileSignature className="mr-2 h-4 w-4" />
                Generate Cover Letter
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
