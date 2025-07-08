
'use client';

import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { 
  onAuthStateChanged, 
  User as AuthUser, 
  signOut as firebaseSignOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile
} from 'firebase/auth';
import { auth, isFirebaseConfigured } from '@/lib/firebase';
import { getOrCreateUser, User } from '@/services/userService';

const createMockUser = (email: string, displayName: string): AuthUser => ({
  uid: `mock_${Date.now()}`,
  email,
  displayName,
  emailVerified: true,
  isAnonymous: false,
  photoURL: `https://placehold.co/40x40.png?text=${displayName.charAt(0)}`,
  providerData: [],
  providerId: 'password',
  tenantId: null,
  refreshToken: '',
  delete: async () => {},
  getIdToken: async () => 'mock-token',
  getIdTokenResult: async () => ({ token: 'mock-token' } as any),
  reload: async () => {},
  toJSON: () => ({ uid: 'mock-uid', email, displayName }),
});

export type UserRole = 'admin' | 'student';

export type SignUpData = {
  email: string;
  password: string;
  displayName: string;
  address?: string;
  cgpa?: string;
  experience?: string;
  companyName?: string;
  designation?: string;
};

interface AuthContextType {
  user: AuthUser | null;
  role: UserRole | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (data: SignUpData) => Promise<UserRole | null>;
  signOut: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isFirebaseConfigured || !auth) {
      console.warn("Firebase not configured. Authentication is running in mock mode. Use 'admin@example.com' or any other email to sign in.");
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
      if (authUser) {
        setUser(authUser);
        try {
          const appUser: User = await getOrCreateUser(authUser);
          setRole(appUser.role);
        } catch (error) {
            console.error("Error fetching user data:", error);
            await firebaseSignOut(auth);
            setUser(null);
            setRole(null);
        } finally {
            setLoading(false);
        }
      } else {
        setUser(null);
        setRole(null);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const signIn = async (email: string, password: string): Promise<void> => {
    setLoading(true);
    if (!isFirebaseConfigured || !auth) {
        const mockUserRole = email === 'admin@example.com' ? 'admin' : 'student';
        const mockUser = createMockUser(email, mockUserRole === 'admin' ? 'Mock Admin' : 'Mock Student');
        setUser(mockUser);
        setRole(mockUserRole);
        setLoading(false);
        return;
    }
    
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // onAuthStateChanged will handle setting the user, role, and loading state.
    } catch (error: any) {
      setLoading(false); 
      throw new Error(error.code === 'auth/invalid-credential' ? 'Invalid email or password.' : 'Failed to sign in.');
    }
  };

  const signUp = async (data: SignUpData): Promise<UserRole | null> => {
     setLoading(true);
     if (!isFirebaseConfigured || !auth) {
        const mockUserRole = data.companyName ? 'admin' : 'student';
        const mockUser = createMockUser(data.email, data.displayName);
        setUser(mockUser);
        setRole(mockUserRole); 
        setLoading(false);
        return mockUserRole;
    }
    
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
      await updateProfile(userCredential.user, { displayName: data.displayName });
      
      const { email, password, ...extraData } = data;
      const appUser = await getOrCreateUser(userCredential.user, extraData);
      
      // The onAuthStateChanged listener will handle setting the user, role, and loading state.
      // We manually reload to ensure the listener gets the latest data.
      await userCredential.user.reload();
      
      return appUser.role;
    } catch(error: any) {
       setLoading(false); 
       throw new Error(error.code === 'auth/email-already-in-use' ? 'This email is already registered.' : 'Failed to sign up.');
    }
  }

  const signOut = async () => {
    if (!isFirebaseConfigured || !auth) {
        setUser(null);
        setRole(null);
        return;
    }
    
    try {
      await firebaseSignOut(auth);
      // onAuthStateChanged will handle setting user and role to null and loading state.
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };

  const value = {
    user,
    role,
    loading,
    signIn,
    signUp,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
