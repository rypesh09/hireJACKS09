import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { getJobs } from "@/services/jobService";
import { AddJobDialog } from "./add-job-dialog";
import { EditJobDialog } from "./edit-job-dialog";
import { DeleteJobDialog } from "./delete-job-dialog";

export default async function AdminJobsPage() {
    const jobs = await getJobs();
    
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="font-headline text-3xl font-bold">Manage Jobs</h1>
                    <p className="text-muted-foreground">
                        Here's a list of all job postings.
                    </p>
                </div>
                <AddJobDialog />
            </div>
             <Card>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Job Title</TableHead>
                                <TableHead className="whitespace-nowrap">Company</TableHead>
                                <TableHead className="whitespace-nowrap">Status</TableHead>
                                <TableHead className="whitespace-nowrap">Applications</TableHead>
                                <TableHead className="whitespace-nowrap text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {jobs.map((job) => (
                                <TableRow key={job.id}>
                                    <TableCell className="font-medium">{job.title}</TableCell>
                                    <TableCell className="whitespace-nowrap">{job.company}</TableCell>
                                    <TableCell className="whitespace-nowrap">
                                        <Badge variant={job.status === "Active" ? "default" : "secondary"}>
                                            {job.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="whitespace-nowrap">{job.applications}</TableCell>
                                    <TableCell className="whitespace-nowrap text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <EditJobDialog job={job} />
                                            <DeleteJobDialog jobId={job.id!} jobTitle={job.title} />
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}
