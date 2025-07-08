import Image from 'next/image';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getNewsItems } from '@/services/newsService';
import { getNotifications, type Notification } from '@/services/notificationService';
import { Bell } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Separator } from '@/components/ui/separator';

export const dynamic = 'force-dynamic';

function NotificationCard({ notification }: { notification: Notification }) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-start gap-4 space-y-0">
                <div className="pt-1">
                    <Bell className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                    <CardTitle className="text-lg">{notification.title}</CardTitle>
                    <CardDescription>
                        {formatDistanceToNow(notification.createdAt, { addSuffix: true })}
                    </CardDescription>
                </div>
            </CardHeader>
            <CardContent>
                <p className="text-sm text-muted-foreground">{notification.message}</p>
            </CardContent>
        </Card>
    );
}


export default async function NewsAndNotificationsPage() {
    const newsItems = await getNewsItems();
    const notifications = await getNotifications();

    return (
        <div className="space-y-8">
            <div>
                <h1 className="font-headline text-3xl font-bold">Notifications</h1>
                <p className="text-muted-foreground">Important updates and alerts from the admin team.</p>
            </div>
            <div className="space-y-4">
                {notifications.length > 0 ? (
                    notifications.map((notification) => (
                        <NotificationCard key={notification.id} notification={notification} />
                    ))
                ) : (
                    <p className="text-muted-foreground">No new notifications.</p>
                )}
            </div>

            <Separator />

            <div>
                <h1 className="font-headline text-3xl font-bold">News & Career Insights</h1>
                <p className="text-muted-foreground">Stay informed with the latest industry news and career advice.</p>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {newsItems.map((item) => (
                    <Card key={item.id} className="flex flex-col overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                        <div className="relative h-48 w-full">
                            <Image 
                                src={item.imageUrl} 
                                alt={item.title} 
                                fill={true}
                                style={{objectFit: 'cover'}}
                                data-ai-hint={item.aiHint}
                            />
                        </div>
                        <CardHeader>
                            <Badge className="w-fit">{item.category}</Badge>
                            <CardTitle className="pt-2">{item.title}</CardTitle>
                        </CardHeader>
                        <CardContent className="flex-grow">
                            <CardDescription>{item.description}</CardDescription>
                        </CardContent>
                        <CardFooter>
                            <Button variant="link" className="px-0">Read More</Button>
                        </CardFooter>
                    </Card>
                ))}
            </div>
        </div>
    );
}
