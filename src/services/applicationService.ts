
'use server';

import { db, isFirebaseConfigured } from '@/lib/firebase';
import { collection, getDocs, addDoc, doc, runTransaction, query, orderBy } from 'firebase/firestore';
import type { User } from './userService';
import type { Job } from './jobService';

export interface Application {
    id?: string;
    studentId: string;
    studentName: string;
    jobId: string;
    jobTitle: string;
    companyName: string;
    appliedAt: Date;
}

// This is a server action that can be called from client components.
export async function applyForJob(jobId: string, userId: string): Promise<{ success: boolean; message: string }> {
    if (!isFirebaseConfigured || !db) {
        return { success: false, message: 'Application failed: Firebase not configured.' };
    }

    try {
        await runTransaction(db, async (transaction) => {
            const userRef = doc(db, 'users', userId);
            const jobRef = doc(db, 'jobs', jobId);
            const applicationsCollectionRef = collection(db, 'applications');

            const [userDoc, jobDoc] = await Promise.all([
                transaction.get(userRef),
                transaction.get(jobRef)
            ]);

            if (!userDoc.exists()) {
                throw new Error("User not found.");
            }
            if (!jobDoc.exists()) {
                throw new Error("Job not found.");
            }

            const userData = userDoc.data() as User;
            const jobData = jobDoc.data() as Job;

            if (userData.appliedJobIds?.includes(jobId)) {
                throw new Error("You have already applied for this job.");
            }

            // 1. Create a new application document
            const newApplication: Omit<Application, 'id'> = {
                studentId: userId,
                studentName: userData.displayName || 'Unknown Student',
                jobId: jobId,
                jobTitle: jobData.title,
                companyName: jobData.company,
                appliedAt: new Date(),
            };
            transaction.set(doc(applicationsCollectionRef), newApplication);

            // 2. Update the job's application count
            transaction.update(jobRef, { applications: (jobData.applications || 0) + 1 });

            // 3. Update the user's applied jobs list
            const appliedJobIds = [...(userData.appliedJobIds || []), jobId];
            transaction.update(userRef, { appliedJobIds });
        });

        return { success: true, message: 'Application submitted successfully!' };
    } catch (error: any) {
        console.error("Error applying for job:", error);
        return { success: false, message: error.message || 'An unexpected error occurred.' };
    }
}


export async function getApplications(): Promise<Application[]> {
     if (!isFirebaseConfigured) {
        console.warn("Firebase not configured. Returning empty list for applications.");
        return [];
    }

    try {
        const q = query(collection(db!, 'applications'), orderBy('appliedAt', 'desc'));
        const querySnapshot = await getDocs(q);
        const applications = querySnapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                ...data,
                // Convert Firestore Timestamp to JS Date
                appliedAt: data.appliedAt.toDate(),
            } as Application;
        });
        return applications;
    } catch (error) {
        console.error("Error fetching applications:", error);
        return [];
    }
}
