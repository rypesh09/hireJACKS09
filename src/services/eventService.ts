import { db, isFirebaseConfigured } from '@/lib/firebase';
import { collection, getDocs, addDoc, query, getCountFromServer } from 'firebase/firestore';

export interface UpcomingEvent {
    id?: string;
    title: string;
    date: string;
    type: 'Fair' | 'Workshop' | 'Session';
}

const initialEvents: Omit<UpcomingEvent, 'id'>[] = [
  { title: 'Virtual Career Fair', date: 'October 25, 2024', type: 'Fair' },
  { title: 'Resume Workshop', date: 'November 2, 2024', type: 'Workshop' },
  { title: 'Interview Prep Session', date: 'November 10, 2024', type: 'Session' },
];

const mockEvents = initialEvents.map((e, i) => ({ ...e, id: `mock-event-${i}` }));

async function seedEvents() {
    if (!db) return;

    const eventsCollection = collection(db, 'events');
    try {
        const snapshot = await getCountFromServer(query(eventsCollection));
        if (snapshot.data().count === 0) {
            console.log('No events found, seeding initial data...');
            for (const event of initialEvents) {
                await addDoc(eventsCollection, event);
            }
        }
    } catch (error) {
        console.error("Error seeding events: ", error);
        if (process.env.NODE_ENV === 'development') {
             console.log("Please check your Firebase configuration in .env and ensure Firestore is enabled in your project.");
        }
        throw error;
    }
}

export async function getUpcomingEvents(): Promise<UpcomingEvent[]> {
    if (!isFirebaseConfigured) {
        console.warn("Firebase not configured. Returning mock data for events. Please update your Firebase configuration.");
        return mockEvents;
    }

    try {
        await seedEvents();
        const eventsCollection = collection(db!, 'events');
        const eventsSnapshot = await getDocs(eventsCollection);
        const eventsList = eventsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as UpcomingEvent));
        return eventsList;
    } catch (error) {
        console.error("Error fetching events from Firebase. Returning mock data.");
        return mockEvents;
    }
}
