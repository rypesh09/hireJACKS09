
'use client';

import { useState, useEffect } from 'react';
import { Briefcase, Loader2, MapPin } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { type Job } from '@/services/jobService';
import { getUserProfile, type User } from '@/services/userService';
import { useAuth } from '@/hooks/use-auth';
import { applyForJob } from '@/services/applicationService';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';


export default function AllJobsPage() {
    const [jobs, setJobs] = useState<Job[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [userProfile, setUserProfile] = useState<User | null>(null);
    const [isApplying, setIsApplying] = useState<Record<string, boolean>>({});

    const { user } = useAuth();
    const { toast } = useToast();

    useEffect(() => {
        async function fetchJobsAndProfile() {
            setIsLoading(true);
            try {
                const response = await fetch('/api/jobs');
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const fetchedJobs: Job[] = await response.json();
                setJobs(fetchedJobs);

                if (user) {
                    const profile = await getUserProfile(user.uid);
                    setUserProfile(profile);
                }
            } catch (error) {
                toast({
                    title: 'Error',
                    description: 'Could not fetch job listings.',
                    variant: 'destructive'
                });
            } finally {
                setIsLoading(false);
            }
        }
        fetchJobsAndProfile();
    }, [user, toast]);

    const handleApply = async (jobId: string) => {
        if (!user) {
            toast({ title: 'Please log in to apply.', variant: 'destructive' });
            return;
        }

        setIsApplying(prev => ({ ...prev, [jobId]: true }));

        const result = await applyForJob(jobId, user.uid);

        if (result.success) {
            toast({ title: 'Success!', description: result.message });
            // Refresh profile to get updated applied jobs list
            const profile = await getUserProfile(user.uid);
            setUserProfile(profile);
        } else {
            toast({ title: 'Application Failed', description: result.message, variant: 'destructive' });
        }

        setIsApplying(prev => ({ ...prev, [jobId]: false }));
    };

    const JobGrid = () => {
        if (isLoading) {
            return (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {Array.from({ length: 6 }).map((_, index) => (
                        <Card key={index}>
                            <CardHeader>
                                <Skeleton className="h-6 w-3/4" />
                                <Skeleton className="h-4 w-1/2" />
                            </CardHeader>
                            <CardContent>
                                <Skeleton className="h-4 w-1/3" />
                            </CardContent>
                            <CardFooter>
                                <Skeleton className="h-10 w-full" />
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            );
        }

        return (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {jobs.map((job) => {
                    const hasApplied = userProfile?.appliedJobIds?.includes(job.id!);
                    const isButtonApplying = isApplying[job.id!];

                    return (
                        <Card key={job.id} className="transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                            <CardHeader>
                                <div className="flex items-start justify-between">
                                    <div className="space-y-1">
                                        <CardTitle>{job.title}</CardTitle>
                                        <CardDescription>{job.company}</CardDescription>
                                    </div>
                                    <Badge variant={job.type === 'Internship' ? 'secondary' : 'outline'}>{job.type}</Badge>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center text-sm text-muted-foreground">
                                    <MapPin className="mr-2 h-4 w-4" />
                                    {job.location}
                                </div>
                            </CardContent>
                            <CardFooter>
                                <Button
                                    className="w-full"
                                    disabled={hasApplied || isButtonApplying}
                                    onClick={() => handleApply(job.id!)}
                                >
                                    {isButtonApplying ? (
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    ) : (
                                        <Briefcase className="mr-2 h-4 w-4" />
                                    )}
                                    {hasApplied ? 'Applied' : 'Apply Now'}
                                </Button>
                            </CardFooter>
                        </Card>
                    );
                })}
            </div>
        );
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="font-headline text-3xl font-bold">Find Your Next Opportunity</h1>
                <p className="text-muted-foreground">Browse through all available job postings.</p>
            </div>
            
            <Card>
                <CardContent className="p-4">
                    <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
                        <Input placeholder="Search by title, company..." />
                        <Select>
                            <SelectTrigger>
                                <SelectValue placeholder="Location" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="remote">Remote</SelectItem>
                                <SelectItem value="ny">New York, NY</SelectItem>
                                <SelectItem value="sf">San Francisco, CA</SelectItem>
                                <SelectItem value="tx">Austin, TX</SelectItem>
                                <SelectItem value="ma">Boston, MA</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select>
                            <SelectTrigger>
                                <SelectValue placeholder="Job Type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="full-time">Full-time</SelectItem>
                                <SelectItem value="part-time">Part-time</SelectItem>
                                <SelectItem value="internship">Internship</SelectItem>
                            </SelectContent>
                        </Select>
                        <Button>Search</Button>
                    </div>
                </CardContent>
            </Card>

            <JobGrid />
        </div>
    );
}
