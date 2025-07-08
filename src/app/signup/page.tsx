
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, UserPlus, Building } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import type { SignUpData, UserRole } from '@/context/auth-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Logo } from '@/components/logo';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';

const studentSignupSchema = z.object({
  displayName: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
  address: z.string().optional(),
  cgpa: z.string().optional(),
  experience: z.string().optional(),
});

const adminSignupSchema = z.object({
  displayName: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
  companyName: z.string().min(2, { message: 'Company name is required.' }),
  designation: z.string().min(2, { message: 'Designation is required.' }),
});

type StudentSignupFormValues = z.infer<typeof studentSignupSchema>;
type AdminSignupFormValues = z.infer<typeof adminSignupSchema>;

export default function SignupPage() {
  const router = useRouter();
  const { signUp, user, role, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('student');

  const studentForm = useForm<StudentSignupFormValues>({
    resolver: zodResolver(studentSignupSchema),
    defaultValues: { displayName: '', email: '', password: '', address: '', cgpa: '', experience: '' },
  });

  const adminForm = useForm<AdminSignupFormValues>({
    resolver: zodResolver(adminSignupSchema),
    defaultValues: { displayName: '', email: '', password: '', companyName: '', designation: '' },
  });

  useEffect(() => {
    // This effect will handle redirecting users after a successful signup or if they are already logged in.
    if (!authLoading && user) {
      if (role === 'admin') {
        router.push('/admin/dashboard');
      } else {
        router.push('/student/dashboard');
      }
    }
  }, [user, role, authLoading, router]);

  async function onSubmit(data: SignUpData) {
    setIsLoading(true);
    let signedUpRole: UserRole | null = null;
    try {
      signedUpRole = await signUp(data);
      
      toast({
        title: 'Signup Successful!',
        description: "Welcome aboard! Redirecting to your dashboard...",
      });
      
      // Redirect based on the role returned from the signUp function
      if (signedUpRole === 'admin') {
        router.push('/admin/dashboard');
      } else {
        router.push('/student/dashboard');
      }

    } catch (error: any) {
      console.error('Signup failed:', error);
      toast({
        title: 'Signup Failed',
        description: error.message || 'An unexpected error occurred. Please try again.',
        variant: 'destructive',
      });
      setIsLoading(false);
    }
  }

  const StudentForm = (
    <Form {...studentForm}>
      <form onSubmit={studentForm.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={studentForm.control}
          name="displayName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full Name</FormLabel>
              <FormControl><Input placeholder="Your full name" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={studentForm.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl><Input type="email" placeholder="you@example.com" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={studentForm.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl><Input type="password" placeholder="••••••••" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={studentForm.control}
          name="cgpa"
          render={({ field }) => (
            <FormItem>
              <FormLabel>CGPA (Optional)</FormLabel>
              <FormControl><Input placeholder="e.g., 3.8 / 4.0" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={studentForm.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Address (Optional)</FormLabel>
              <FormControl><Textarea placeholder="Your address" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={studentForm.control}
          name="experience"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Field Experience / Skills (Optional)</FormLabel>
              <FormControl><Textarea placeholder="Briefly describe your field experience or skills" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isLoading} className="w-full">
          {isLoading ? <Loader2 className="animate-spin" /> : <><UserPlus className="mr-2" /> Create Student Account</>}
        </Button>
      </form>
    </Form>
  );

  const AdminForm = (
     <Form {...adminForm}>
      <form onSubmit={adminForm.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={adminForm.control}
          name="displayName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full Name</FormLabel>
              <FormControl><Input placeholder="Your full name" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={adminForm.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Work Email</FormLabel>
              <FormControl><Input type="email" placeholder="you@company.com" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
         <FormField
          control={adminForm.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl><Input type="password" placeholder="••••••••" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={adminForm.control}
          name="companyName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Company Name</FormLabel>
              <FormControl><Input placeholder="Your company's name" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={adminForm.control}
          name="designation"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Your Designation</FormLabel>
              <FormControl><Input placeholder="e.g., HR Manager" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isLoading} className="w-full">
          {isLoading ? <Loader2 className="animate-spin" /> : <><Building className="mr-2" /> Create Admin Account</>}
        </Button>
      </form>
    </Form>
  );
  
  if (authLoading || (!authLoading && user)) {
    return (
      <div className="flex min-h-screen w-full flex-col items-center justify-center bg-muted/40 p-4">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-muted/40 p-4">
      <div className="absolute top-6 left-6">
        <Logo />
      </div>
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="font-headline text-xl sm:text-2xl">Create an Account</CardTitle>
          <CardDescription>Get started with HireJacks today.</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="student">I'm a Student</TabsTrigger>
              <TabsTrigger value="admin">I'm an Admin</TabsTrigger>
            </TabsList>
            <TabsContent value="student" className="pt-4">
              {StudentForm}
            </TabsContent>
            <TabsContent value="admin" className="pt-4">
                <CardDescription className="text-center pb-4 text-xs">
                    For security, only the first registered user is made an admin. Subsequent admin signups will be created as students.
                </CardDescription>
              {AdminForm}
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter>
          <p className="w-full text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link href="/login" className="font-semibold text-primary hover:underline">
              Sign In
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
