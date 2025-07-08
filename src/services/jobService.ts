'use server';

import { db, isFirebaseConfigured } from '@/lib/firebase';
import { collection, getDocs, addDoc, query, getCountFromServer, doc, updateDoc, deleteDoc } from 'firebase/firestore';

export interface Job {
    id?: string;
    title: string;
    company: string;
    status: 'Active' | 'Paused' | 'Closed';
    applications: number;
    location: string;
    type: 'Full-time' | 'Part-time' | 'Internship';
}

const initialJobs: Omit<Job, 'id' | 'applications'>[] = [
    { title: "Frontend Developer", company: "Tech Solutions Inc.", location: "Remote", type: "Full-time", status: "Active" },
    { title: "UX/UI Designer", company: "Creative Minds LLC", location: "New York, NY", type: "Internship", status: "Active" },
    { title: "Data Analyst", company: "Analytics Corp", location: "San Francisco, CA", type: "Part-time", status: "Paused" },
    { title: "Backend Engineer", company: "ServerSide Systems", location: "Austin, TX", type: "Full-time", status: "Active" },
    { title: "Product Manager", company: "Innovate Co.", location: "Remote", type: "Full-time", status: "Closed" },
    { title: "Marketing Intern", company: "Growth Gurus", location: "Boston, MA", type: "Internship", status: 'Active' },
];

const mockJobs = initialJobs.map((j, i) => ({ ...j, id: `mock-job-${i}`, applications: Math.floor(Math.random() * 50) }));

async function seedJobs() {
    if (!db) return;

    const jobsCollection = collection(db, 'jobs');
    try {
        const snapshot = await getCountFromServer(query(jobsCollection));
        if (snapshot.data().count === 0) {
            console.log('No jobs found, seeding initial data...');
            for (const job of initialJobs) {
                await addDoc(jobsCollection, { ...job, applications: Math.floor(Math.random() * 50) });
            }
        }
    } catch (error) {
        console.error("Error seeding jobs: ", error);
         if (process.env.NODE_ENV === 'development') {
             console.log("Please check your Firebase configuration in .env and ensure Firestore is enabled in your project.");
        }
        throw error;
    }
}

export async function getJobs(): Promise<Job[]> {
    if (!isFirebaseConfigured) {
        console.warn("Firebase not configured. Returning mock data for jobs. Please update your Firebase configuration.");
        return mockJobs;
    }
    try {
        await seedJobs();
        const jobsCollection = collection(db!, 'jobs');
        const jobsSnapshot = await getDocs(jobsCollection);
        const jobsList = jobsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Job));
        return jobsList;
    } catch (error) {
        console.error("Error fetching jobs from Firebase. Returning mock data.");
        throw error;
    }
}

export async function addJob(jobData: Omit<Job, 'id' | 'applications'>): Promise<{ success: boolean; message: string; }> {
    if (!isFirebaseConfigured || !db) {
        console.warn("Firebase not configured. Mocking job creation.");
        return { success: true, message: 'Job added successfully (mock)!' };
    }

    try {
        const jobsCollection = collection(db, 'jobs');
        await addDoc(jobsCollection, {
            ...jobData,
            applications: 0,
        });
        return { success: true, message: 'Job added successfully!' };
    } catch (error: any) {
        console.error("Error adding job:", error);
        return { success: false, message: 'An unexpected error occurred while adding the job.' };
    }
}

export async function updateJob(jobId: string, jobData: Partial<Omit<Job, 'id' | 'applications'>>): Promise<{ success: boolean; message: string; }> {
    if (!isFirebaseConfigured || !db) {
        console.warn("Firebase not configured. Mocking job update.");
        return { success: true, message: 'Job updated successfully (mock)!' };
    }

    try {
        const jobRef = doc(db, 'jobs', jobId);
        await updateDoc(jobRef, jobData);
        return { success: true, message: 'Job updated successfully!' };
    } catch (error: any) {
        console.error("Error updating job:", error);
        return { success: false, message: 'An unexpected error occurred while updating the job.' };
    }
}

export async function deleteJob(jobId: string): Promise<{ success: boolean; message: string; }> {
    if (!isFirebaseConfigured || !db) {
        console.warn("Firebase not configured. Mocking job deletion.");
        return { success: true, message: 'Job deleted successfully (mock)!' };
    }

    try {
        const jobRef = doc(db, 'jobs', jobId);
        await deleteDoc(jobRef);
        return { success: true, message: 'Job deleted successfully!' };
    } catch (error: any) {
        console.error("Error deleting job:", error);
        return { success: false, message: 'An unexpected error occurred while deleting the job.' };
    }
}
