import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getCompanies } from "@/services/companyService";
import { AddCompanyDialog } from "./add-company-dialog";
import { EditCompanyDialog } from "./edit-company-dialog";

export default async function AdminCompaniesPage() {
    const companies = await getCompanies();

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="font-headline text-3xl font-bold">Manage Companies</h1>
                    <p className="text-muted-foreground">
                        Add, edit, or remove company profiles.
                    </p>
                </div>
                <AddCompanyDialog />
            </div>
             <Card>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Company</TableHead>
                                <TableHead className="whitespace-nowrap">Industry</TableHead>
                                <TableHead className="whitespace-nowrap">Jobs Posted</TableHead>
                                <TableHead className="whitespace-nowrap text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {companies.map((company) => (
                                <TableRow key={company.id}>
                                    <TableCell className="font-medium">
                                        <div className="flex items-center gap-3 whitespace-nowrap">
                                            <Avatar>
                                                <AvatarImage src="https://placehold.co/40x40.png" alt={company.name} data-ai-hint="logo building" />
                                                <AvatarFallback>{company.name.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                            {company.name}
                                        </div>
                                    </TableCell>
                                    <TableCell className="whitespace-nowrap">{company.industry}</TableCell>
                                    <TableCell className="whitespace-nowrap">{company.jobsPosted}</TableCell>
                                    <TableCell className="whitespace-nowrap text-right">
                                        <EditCompanyDialog company={company} />
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
