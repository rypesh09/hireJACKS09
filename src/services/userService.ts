
import { db, isFirebaseConfigured } from '@/lib/firebase';
import { doc, getDoc, setDoc, collection, getCountFromServer, query, updateDoc } from 'firebase/firestore';
import type { User as AuthUser } from 'firebase/auth';

export interface User {
    uid: string;
    email: string;
    displayName: string | null;
    photoURL: string | null;
    role: 'admin' | 'student';
    // Common
    phoneNumber?: string;
    // Student specific
    address?: string;
    cgpa?: string;
    experience?: string;
    resumeText?: string;
    appliedJobIds?: string[];
    // Admin specific
    companyName?: string;
    designation?: string;
}

/**
 * Retrieves a user document from Firestore, creating it if it doesn't exist.
 * The first user to sign up is assigned the 'admin' role; all subsequent users are 'students'.
 * This is a simple mechanism for bootstrapping the application. For a production app,
 * you would want a more robust role management system.
 * @param user - The Firebase Auth user object.
 * @param extraData - Optional additional data to store for the new user.
 * @returns A promise that resolves to the user's data.
 */
export async function getOrCreateUser(user: AuthUser, extraData: Partial<User> = {}): Promise<User> {
    if (!isFirebaseConfigured || !db) {
        console.warn("Firebase not configured. Using mock user data.");
        const role = extraData.companyName ? 'admin' : 'student';
        return {
            uid: user.uid,
            email: user.email || 'student@example.com',
            displayName: user.displayName || 'Mock User',
            photoURL: user.photoURL,
            role,
            appliedJobIds: [],
            ...extraData,
        };
    }

    const userRef = doc(db, 'users', user.uid);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
        return userSnap.data() as User;
    } else {
        const usersCollection = collection(db, 'users');
        const allUsersSnap = await getCountFromServer(query(usersCollection));
        const isFirstUser = allUsersSnap.data().count === 0;

        const newUser: User = {
            uid: user.uid,
            email: user.email!,
            displayName: user.displayName,
            photoURL: user.photoURL,
            role: isFirstUser ? 'admin' : 'student',
            appliedJobIds: [],
            ...extraData
        };
        await setDoc(userRef, newUser);
        return newUser;
    }
}

/**
 * Retrieves a user's profile from Firestore.
 * @param uid - The user's unique ID.
 * @returns A promise that resolves to the user's data, or null if not found.
 */
export async function getUserProfile(uid: string): Promise<User | null> {
     if (!isFirebaseConfigured || !db) {
        console.warn("Firebase not configured. Cannot get user profile.");
        return null;
    }
    const userRef = doc(db, 'users', uid);
    const userSnap = await getDoc(userRef);
    return userSnap.exists() ? (userSnap.data() as User) : null;
}


/**
 * Updates a user's profile in Firestore.
 * @param uid - The user's unique ID.
 * @param data - The partial user data to update.
 * @returns A promise that resolves when the update is complete.
 */
export async function updateUserProfile(uid: string, data: Partial<User>): Promise<void> {
     if (!isFirebaseConfigured || !db) {
        throw new Error("Firebase not configured. Cannot update user profile.");
    }
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, data);
}
