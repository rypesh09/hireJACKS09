import { db, isFirebaseConfigured } from '@/lib/firebase';
import { collection, getDocs, addDoc, query, getCountFromServer } from 'firebase/firestore';

export interface NewsItem {
    id?: string;
    title: string;
    category: string;
    description: string;
    imageUrl: string;
    aiHint: string;
}

const initialNewsItems: Omit<NewsItem, 'id'>[] = [
  {
    title: "The Future of Remote Work: Trends for 2025",
    category: "Career Advice",
    description: "Explore the evolving landscape of remote work and how to position yourself for success in a distributed workforce.",
    imageUrl: "https://placehold.co/600x400.png",
    aiHint: "remote work"
  },
  {
    title: "Networking in the Digital Age: A Guide for Students",
    category: "Networking",
    description: "Learn effective strategies for building your professional network online, from LinkedIn to virtual events.",
    imageUrl: "https://placehold.co/600x400.png",
    aiHint: "networking conference"
  },
  {
    title: "Top 10 In-Demand Tech Skills for New Grads",
    category: "Tech",
    description: "Discover the most sought-after technical skills in the job market today and how you can learn them.",
    imageUrl: "https://placehold.co/600x400.png",
    aiHint: "coding programming"
  },
   {
    title: "Mastering the Behavioral Interview",
    category: "Interviewing",
    description: "Get expert tips on how to ace behavioral interview questions using the STAR method.",
    imageUrl: "https://placehold.co/600x400.png",
    aiHint: "job interview"
  },
   {
    title: "Building a Standout Portfolio",
    category: "Career Advice",
    description: "A strong portfolio can make all the difference. Learn what to include and how to present your work.",
    imageUrl: "https://placehold.co/600x400.png",
    aiHint: "design portfolio"
  },
   {
    title: "Salary Negotiation for Your First Job",
    category: "Salary",
    description: "Don't leave money on the table. Here's how to approach salary negotiations with confidence.",
    imageUrl: "https://placehold.co/600x400.png",
    aiHint: "negotiation business"
  },
];

const mockNews = initialNewsItems.map((n, i) => ({ ...n, id: `mock-news-${i}` }));

async function seedNews() {
    if (!db) return;

    const newsCollection = collection(db, 'news');
    try {
        const snapshot = await getCountFromServer(query(newsCollection));
        if (snapshot.data().count === 0) {
            console.log('No news found, seeding initial data...');
            for (const item of initialNewsItems) {
                await addDoc(newsCollection, item);
            }
        }
    } catch(e) {
        console.error("Error seeding news", e);
         if (process.env.NODE_ENV === 'development') {
             console.log("Please check your Firebase configuration in .env and ensure Firestore is enabled in your project.");
        }
        throw e;
    }
}

export async function getNewsItems(): Promise<NewsItem[]> {
    if (!isFirebaseConfigured) {
        console.warn("Firebase not configured. Returning mock data for news. Please update your Firebase configuration.");
        return mockNews;
    }

    try {
        await seedNews();
        const newsCollection = collection(db!, 'news');
        const newsSnapshot = await getDocs(newsCollection);
        const newsList = newsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as NewsItem));
        return newsList;
    } catch (e) {
        console.error("Error getting news items from Firebase. Returning mock data.");
        return mockNews;
    }
}
