import Link from 'next/link';
import { ArrowRight, Briefcase, Calendar, FileText } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { getJobs } from '@/services/jobService';
import { getUpcomingEvents } from '@/services/eventService';

export default async function StudentDashboard() {
  const recommendedJobs = (await getJobs()).slice(0, 3);
  const upcomingEvents = await getUpcomingEvents();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-headline text-3xl font-bold">Welcome back, Student!</h1>
        <p className="text-muted-foreground">Here's your career snapshot.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="lg:col-span-2 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
          <CardHeader>
            <CardTitle>Recommended Jobs</CardTitle>
            <CardDescription>Based on your profile and interests.</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-4">
              {recommendedJobs.map((job) => (
                <li key={job.id} className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="rounded-lg bg-muted p-3">
                      <Briefcase className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold">{job.title}</p>
                      <p className="text-sm text-muted-foreground">{job.company}</p>
                    </div>
                  </div>
                  <Badge variant={job.type === 'Internship' ? 'secondary' : 'outline'}>{job.type}</Badge>
                </li>
              ))}
            </ul>
            <Button asChild variant="link" className="mt-4 px-0">
              <Link href="/student/jobs">
                View all jobs <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
        
        <Card className="transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
          <CardHeader>
            <CardTitle>Resume Health</CardTitle>
            <CardDescription>Keep your resume updated for better matches.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Profile Completeness</span>
              <span className="text-sm font-bold text-primary">75%</span>
            </div>
            <Progress value={75} aria-label="75% complete" />
            <Button asChild className="w-full">
              <Link href="/student/resume-builder">
                <FileText className="mr-2 h-4 w-4" />
                Improve with AI
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card className="transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
        <CardHeader>
          <CardTitle>Upcoming Events</CardTitle>
          <CardDescription>Don't miss these career-building opportunities.</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="divide-y">
            {upcomingEvents.map((event) => (
              <li key={event.id} className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0">
                <div className="flex items-center gap-4">
                  <div className="rounded-lg bg-muted p-3">
                    <Calendar className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold">{event.title}</p>
                    <p className="text-sm text-muted-foreground">{event.date}</p>
                  </div>
                </div>
                <Badge variant="default" className="bg-accent hover:bg-accent/90">{event.type}</Badge>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
