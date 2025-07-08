'use server';

import { db, isFirebaseConfigured } from '@/lib/firebase';
import { collection, addDoc, getDocs, query, orderBy, serverTimestamp } from 'firebase/firestore';

export interface Notification {
    id?: string;
    title: string;
    message: string;
    createdAt: Date;
}

// Mock data for when Firebase isn't configured
const mockNotifications: Notification[] = [
    { id: '1', title: 'Welcome to HireJacks!', message: 'We are excited to have you here. Start exploring jobs now!', createdAt: new Date() },
    { id: '2', title: 'Upcoming Career Fair', message: 'Join us for the virtual career fair next week. Top companies will be attending.', createdAt: new Date(Date.now() - 86400000) },
];

export async function addNotification(data: { title: string; message: string }): Promise<{ success: boolean; message: string; }> {
    if (!isFirebaseConfigured || !db) {
        console.warn("Firebase not configured. Mocking notification creation.");
        const newNotif = { ...data, id: `mock-${Date.now()}`, createdAt: new Date() };
        mockNotifications.unshift(newNotif);
        return { success: true, message: 'Notification sent successfully (mock)!' };
    }

    try {
        const notificationsCollection = collection(db, 'notifications');
        await addDoc(notificationsCollection, {
            ...data,
            createdAt: serverTimestamp(),
        });
        return { success: true, message: 'Notification sent successfully!' };
    } catch (error: any) {
        console.error("Error adding notification:", error);
        return { success: false, message: 'An unexpected error occurred while sending the notification.' };
    }
}

export async function getNotifications(): Promise<Notification[]> {
    if (!isFirebaseConfigured || !db) {
        console.warn("Firebase not configured. Returning mock notifications.");
        return mockNotifications;
    }

    try {
        const q = query(collection(db, 'notifications'), orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        const notifications = querySnapshot.docs.map(doc => {
            const data = doc.data();
            if (!data.createdAt) {
                return null;
            }
            return {
                id: doc.id,
                ...data,
                // Convert Firestore Timestamp to JS Date
                createdAt: data.createdAt.toDate(),
            } as Notification;
        }).filter(Boolean) as Notification[];

        return notifications;
    } catch (error) {
        console.error("Error fetching notifications:", error);
        return []; // Return empty on error to avoid breaking the UI
    }
}
