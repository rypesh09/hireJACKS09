'use server';

import { db, isFirebaseConfigured } from '@/lib/firebase';
import { collection, getDocs, addDoc, query, getCountFromServer, doc, updateDoc } from 'firebase/firestore';

export interface Company {
    id?: string;
    name: string;
    jobsPosted: number;
    industry: string;
}

const initialCompanies: Omit<Company, 'id'>[] = [
    { name: "Tech Solutions Inc.", jobsPosted: 5, industry: "Technology" },
    { name: "Creative Minds LLC", jobsPosted: 2, industry: "Design" },
    { name: "Analytics Corp", jobsPosted: 3, industry: "Data Science" },
    { name: "ServerSide Systems", jobsPosted: 8, industry: "Software" },
    { name: "Innovate Co.", jobsPosted: 1, industry: "Product" },
];

const mockCompanies = initialCompanies.map((c, i) => ({ ...c, id: `mock-company-${i}` }));

async function seedCompanies() {
    if (!db) return;

    const companiesCollection = collection(db, 'companies');
    try {
        const snapshot = await getCountFromServer(query(companiesCollection));
        if (snapshot.data().count === 0) {
            console.log('No companies found, seeding initial data...');
            for (const company of initialCompanies) {
                await addDoc(companiesCollection, company);
            }
        }
    } catch (error) {
        console.error("Error seeding companies: ", error);
        if (process.env.NODE_ENV === 'development') {
             console.log("Please check your Firebase configuration in .env and ensure Firestore is enabled in your project.");
        }
        throw error; // Propagate error to be caught in getCompanies
    }
}

export async function getCompanies(): Promise<Company[]> {
    if (!isFirebaseConfigured) {
        console.warn("Firebase not configured. Returning mock data for companies. Please update your Firebase configuration.");
        return mockCompanies;
    }
    
    try {
        await seedCompanies();
        const companiesCollection = collection(db!, 'companies');
        const companiesSnapshot = await getDocs(companiesCollection);
        const companiesList = companiesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Company));
        return companiesList;
    } catch (error) {
         console.error("Error fetching companies from Firebase.");
         throw error;
    }
}


export async function addCompany(companyData: Omit<Company, 'id' | 'jobsPosted'>): Promise<{ success: boolean; message: string; }> {
    if (!isFirebaseConfigured || !db) {
        console.warn("Firebase not configured. Mocking company creation.");
        return { success: true, message: 'Company added successfully (mock)!' };
    }

    try {
        const companiesCollection = collection(db, 'companies');
        await addDoc(companiesCollection, {
            ...companyData,
            jobsPosted: 0,
        });
        return { success: true, message: 'Company added successfully!' };
    } catch (error: any) {
        console.error("Error adding company:", error);
        return { success: false, message: 'An unexpected error occurred while adding the company.' };
    }
}

export async function updateCompany(companyId: string, companyData: Partial<Omit<Company, 'id' | 'jobsPosted'>>): Promise<{ success: boolean; message: string; }> {
    if (!isFirebaseConfigured || !db) {
        console.warn("Firebase not configured. Mocking company update.");
        return { success: true, message: 'Company updated successfully (mock)!' };
    }

    try {
        const companyRef = doc(db, 'companies', companyId);
        await updateDoc(companyRef, companyData);
        return { success: true, message: 'Company updated successfully!' };
    } catch (error: any) {
        console.error("Error updating company:", error);
        return { success: false, message: 'An unexpected error occurred while updating the company.' };
    }
}
