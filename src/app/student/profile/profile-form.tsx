
'use client';

import { useEffect, useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, Save, User } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { getUserProfile, updateUserProfile } from '@/services/userService';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { updateProfile as updateAuthProfile } from 'firebase/auth';

const profileFormSchema = z.object({
  displayName: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  email: z.string().email(),
  photoURL: z.string().optional(),
  phoneNumber: z.string().optional(),
  address: z.string().optional(),
  cgpa: z.string().optional(),
  experience: z.string().optional(),
  resumeText: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

export function ProfileForm() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isFormLoading, setIsFormLoading] = useState(true);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      displayName: '',
      email: '',
      photoURL: '',
      phoneNumber: '',
      address: '',
      cgpa: '',
      experience: '',
      resumeText: '',
    },
  });

  useEffect(() => {
    async function loadUserProfile() {
      if (user) {
        setIsFormLoading(true);
        try {
          const userProfile = await getUserProfile(user.uid);
          if (userProfile) {
            form.reset({
              displayName: userProfile.displayName || '',
              email: userProfile.email || '',
              photoURL: userProfile.photoURL || '',
              phoneNumber: userProfile.phoneNumber || '',
              address: userProfile.address || '',
              cgpa: userProfile.cgpa || '',
              experience: userProfile.experience || '',
              resumeText: userProfile.resumeText || '',
            });
            setImagePreview(userProfile.photoURL);
          }
        } catch (error) {
          console.error("Failed to load user profile", error);
          toast({
            title: "Error",
            description: "Could not load your profile.",
            variant: "destructive",
          });
        } finally {
          setIsFormLoading(false);
        }
      }
    }
    loadUserProfile();
  }, [user, form, toast]);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        form.setValue('photoURL', result);
        setImagePreview(result);
      };
      reader.readAsDataURL(file);
    }
  };


  async function onSubmit(data: ProfileFormValues) {
    if (!user) return;
    setIsLoading(true);
    try {
      // 1. Update Firebase Auth Profile
      // We only update photoURL if it's a new base64 image.
      const newPhotoURL = data.photoURL && data.photoURL.startsWith('data:image') ? data.photoURL : undefined;
      await updateAuthProfile(user, {
        displayName: data.displayName,
        ...(newPhotoURL && { photoURL: newPhotoURL }),
      });

      // 2. Update Firestore Document with all form data
      await updateUserProfile(user.uid, {
        ...data,
        photoURL: newPhotoURL || data.photoURL || user.photoURL,
      });

      // 3. Reload user to get fresh data from auth servers
      await user.reload(); 

      toast({
        title: "Success!",
        description: "Your profile has been updated.",
      });
    } catch (error) {
      console.error("Failed to update profile", error);
      toast({
        title: "Error",
        description: "Could not update your profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  if (isFormLoading) {
    return (
        <Card>
            <CardHeader>
                <Skeleton className="h-7 w-48" />
                <Skeleton className="h-4 w-64" />
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-10 w-full" />
                </div>
                 <div className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-10 w-full" />
                </div>
                 <div className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-10 w-full" />
                </div>
                 <div className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-24 w-full" />
                </div>
                 <Skeleton className="h-10 w-32" />
            </CardContent>
        </Card>
    )
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>This is how you'll appear on HireJacks.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
             <FormField
              control={form.control}
              name="photoURL"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Profile Picture</FormLabel>
                   <FormControl>
                    <div className="flex items-center gap-4">
                       <Avatar className="h-20 w-20">
                          <AvatarImage src={imagePreview ?? undefined} />
                          <AvatarFallback>
                            <User className="h-10 w-10" />
                          </AvatarFallback>
                        </Avatar>
                      <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()}>
                        Change Picture
                      </Button>
                      <Input 
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept="image/png, image/jpeg, image/gif"
                        onChange={handleImageChange}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="displayName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Your full name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="Your email address" {...field} disabled />
                  </FormControl>
                   <FormDescription>
                    Your email address cannot be changed.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phoneNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <Input placeholder="(123) 456-7890" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Your current address" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Academic & Professional Details</CardTitle>
            <CardDescription>This information helps us recommend better jobs for you.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
             <FormField
              control={form.control}
              name="cgpa"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Current CGPA</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., 3.8 / 4.0" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="experience"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Field Experience / Skills</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Briefly describe your field experience, skills, or projects."
                      className="min-h-[120px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="resumeText"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Resume / CV Content</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Paste your full resume here. You can use the AI Resume Builder to improve it later."
                      className="min-h-[200px]"
                      {...field}
                    />
                  </FormControl>
                   <FormDescription>
                    This will be used for AI features like the Resume Builder and Job Recommendations.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>
        
        <div className="flex justify-end">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Save Changes
          </Button>
        </div>
      </form>
    </Form>
  );
}
