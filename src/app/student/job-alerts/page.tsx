import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";

export default function JobAlertsPage() {
    return (
        <div className="space-y-6">
             <div>
                <h1 className="font-headline text-3xl font-bold">Configure Job Alerts</h1>
                <p className="text-muted-foreground">
                    Stay on top of new opportunities. Get notified for jobs that match your criteria.
                </p>
            </div>
            
            <Card>
                <CardHeader>
                    <CardTitle>Keyword Alerts</CardTitle>
                    <CardDescription>Get notified when jobs with these keywords are posted.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Input placeholder="e.g., 'React Developer', 'UX Design', 'Product Management'" />
                    <Button>Add Keyword</Button>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Notification Settings</CardTitle>
                    <CardDescription>Choose how and when you want to be notified.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div>
                        <Label className="font-semibold">Notification Frequency</Label>
                        <RadioGroup defaultValue="daily" className="mt-2">
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="instant" id="instant" />
                                <Label htmlFor="instant">Instant</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="daily" id="daily" />
                                <Label htmlFor="daily">Daily Digest</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="weekly" id="weekly" />
                                <Label htmlFor="weekly">Weekly Summary</Label>
                            </div>
                        </RadioGroup>
                    </div>

                    <Separator />

                    <div>
                        <Label className="font-semibold">Notification Method</Label>
                         <div className="mt-2 space-y-2">
                            <div className="flex items-center space-x-2">
                                <Checkbox id="email" defaultChecked />
                                <Label htmlFor="email">Email</Label>
                            </div>
                             <div className="flex items-center space-x-2">
                                <Checkbox id="in-app" />
                                <Label htmlFor="in-app">In-app Notification</Label>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="flex justify-end">
                <Button>Save Preferences</Button>
            </div>
        </div>
    )
}
