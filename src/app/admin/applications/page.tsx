
import { getApplications } from "@/services/applicationService";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from 'date-fns';

export default async function AdminApplicationsPage() {
    const applications = await getApplications();

    return (
        <div className="space-y-6">
            <div>
                <h1 className="font-headline text-3xl font-bold">Job Applications</h1>
                <p className="text-muted-foreground">
                    Here's a list of all submitted job applications.
                </p>
            </div>
             <Card>
                <CardHeader>
                    <CardTitle>Received Applications</CardTitle>
                    <CardDescription>
                        {applications.length > 0
                            ? `A total of ${applications.length} application(s) found.`
                            : "No applications have been submitted yet."}
                    </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Student Name</TableHead>
                                <TableHead>Job Title</TableHead>
                                <TableHead>Company</TableHead>
                                <TableHead className="text-right">Date Applied</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {applications.map((app) => (
                                <TableRow key={app.id}>
                                    <TableCell className="font-medium">{app.studentName}</TableCell>
                                    <TableCell>{app.jobTitle}</TableCell>
                                    <TableCell>{app.companyName}</TableCell>
                                    <TableCell className="text-right whitespace-nowrap">
                                        {format(app.appliedAt, 'PPP')}
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
