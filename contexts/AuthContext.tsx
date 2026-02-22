import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { auth, db } from '@/lib/firebase';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  fetchSignInMethodsForEmail,
  signOut,
  User as FirebaseUser,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult
} from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  increment
} from 'firebase/firestore';

export type UserRole = 'citizen' | 'cleaner' | 'admin';

interface AuthState {
  hasSeenWelcome: boolean;
  isLoggedIn: boolean;
  userRole: UserRole | null;
  userName: string;
  userEmail: string;
  userCredits: number;
  isLoading: boolean;
  uid: string | null;
}

interface AuthContextValue extends AuthState {
  setHasSeenWelcome: () => Promise<void>;
  login: (email: string, password: string, role?: UserRole, name?: string) => Promise<UserRole>;
  loginWithGoogle: (role: UserRole) => Promise<void>;
  logout: () => Promise<void>;
  addCredits: (amount: number) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);
const PENDING_GOOGLE_ROLE_KEY = 'pendingGoogleRole';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    hasSeenWelcome: false,
    isLoggedIn: false,
    userRole: null,
    userName: '',
    userEmail: '',
    userCredits: 0,
    isLoading: true,
    uid: null,
  });

  useEffect(() => {
    // Check if we just returned from a Google redirect
    getRedirectResult(auth).then(async (result) => {
      if (result) {
        const firebaseUser = result.user;
        const pendingRole = (await AsyncStorage.getItem(PENDING_GOOGLE_ROLE_KEY)) as UserRole | null;
        const resolvedRole: UserRole = pendingRole === 'admin' || pendingRole === 'cleaner' || pendingRole === 'citizen' ? pendingRole : 'citizen';

        const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
        if (!userDoc.exists()) {
          // Initialize Firestore document for new Google user
          await setDoc(doc(db, 'users', firebaseUser.uid), {
            name: firebaseUser.displayName || 'Google User',
            role: resolvedRole,
            email: firebaseUser.email,
            credits: 150,
            createdAt: new Date().toISOString()
          });
        } else {
          const userData = userDoc.data();
          if (!userData.role && resolvedRole) {
            await updateDoc(doc(db, 'users', firebaseUser.uid), {
              role: resolvedRole,
            });
          }
        }

        await AsyncStorage.removeItem(PENDING_GOOGLE_ROLE_KEY);
      }
    }).catch((error) => {
      console.error("Redirect login error:", error);
    });

    // Listen for auth state changes
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      const welcome = await AsyncStorage.getItem('hasSeenWelcome');

      if (firebaseUser) {
        // User is signed in, fetch additional data from Firestore
        try {
          const userRef = doc(db, 'users', firebaseUser.uid);
          const userDoc = await getDoc(userRef);
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setState({
              hasSeenWelcome: welcome === 'true',
              isLoggedIn: true,
              userRole: userData.role as UserRole,
              userName: userData.name || '',
              userEmail: firebaseUser.email || '',
              userCredits: userData.credits || 0,
              isLoading: false,
              uid: firebaseUser.uid,
            });
          } else {
            const fallbackRole: UserRole = 'citizen';
            const fallbackName = firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User';

            await setDoc(userRef, {
              name: fallbackName,
              role: fallbackRole,
              email: firebaseUser.email || '',
              credits: 150,
              createdAt: new Date().toISOString(),
            });

            setState({
              hasSeenWelcome: welcome === 'true',
              isLoggedIn: true,
              userRole: fallbackRole,
              userName: fallbackName,
              userEmail: firebaseUser.email || '',
              userCredits: 150,
              isLoading: false,
              uid: firebaseUser.uid,
            });
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
          setState(prev => ({ ...prev, isLoading: false }));
        }
      } else {
        // User is signed out
        setState({
          hasSeenWelcome: welcome === 'true',
          isLoggedIn: false,
          userRole: null,
          userName: '',
          userEmail: '',
          userCredits: 0,
          isLoading: false,
          uid: null,
        });
      }
    });

    return () => unsubscribe();
  }, []);

  const setHasSeenWelcome = async () => {
    await AsyncStorage.setItem('hasSeenWelcome', 'true');
    setState(prev => ({ ...prev, hasSeenWelcome: true }));
  };

  const login = async (email: string, password: string, role?: UserRole, name?: string): Promise<UserRole> => {
    try {
      let firebaseUser: FirebaseUser;

      try {
        const result = await signInWithEmailAndPassword(auth, email, password);
        firebaseUser = result.user;

        const existingUserDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
        if (existingUserDoc.exists()) {
          const userData = existingUserDoc.data();
          return (userData.role as UserRole) || 'citizen';
        }

        const resolvedRole: UserRole = role || 'citizen';
        const resolvedName = name || firebaseUser.displayName || email.split('@')[0] || 'User';

        await setDoc(doc(db, 'users', firebaseUser.uid), {
          name: resolvedName,
          role: resolvedRole,
          email,
          credits: 150,
          createdAt: new Date().toISOString()
        });

        return resolvedRole;
      } catch (signInError: any) {
        const signInErrorCode = signInError?.code as string | undefined;

        if (signInError.code === 'auth/invalid-email') {
          throw new Error('Please enter a valid email address.');
        }

        if (signInError.code === 'auth/too-many-requests') {
          throw new Error('Too many attempts. Please wait a moment and try again.');
        }

        if (signInError.code === 'auth/operation-not-allowed') {
          throw new Error('Email/password login is not enabled in Firebase project settings.');
        }

        if (
          signInErrorCode === 'auth/user-not-found' ||
          signInErrorCode === 'auth/invalid-credential' ||
          signInErrorCode === 'auth/invalid-login-credentials' ||
          signInErrorCode === 'auth/wrong-password'
        ) {
          const methods = await fetchSignInMethodsForEmail(auth, email).catch(() => [] as string[]);

          if (methods.includes('google.com')) {
            throw new Error('This account uses Google sign-in. Please use "Sign in with Google".');
          }

          throw new Error('Invalid email or password.');
        }

        throw signInError;
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const loginWithGoogle = async (role: UserRole) => {
    try {
      const provider = new GoogleAuthProvider();

      if (Platform.OS === 'web') {
        try {
          const result = await signInWithPopup(auth, provider);
          const firebaseUser = result.user;
          const userRef = doc(db, 'users', firebaseUser.uid);
          const userDoc = await getDoc(userRef);

          if (!userDoc.exists()) {
            await setDoc(userRef, {
              name: firebaseUser.displayName || 'Google User',
              role,
              email: firebaseUser.email || '',
              credits: 150,
              createdAt: new Date().toISOString(),
            });
          }

          await AsyncStorage.removeItem(PENDING_GOOGLE_ROLE_KEY);
          return;
        } catch (popupError: any) {
          const code = popupError?.code as string | undefined;
          if (code && code !== 'auth/popup-blocked' && code !== 'auth/popup-closed-by-user' && code !== 'auth/cancelled-popup-request') {
            throw popupError;
          }
        }
      }

      await AsyncStorage.setItem(PENDING_GOOGLE_ROLE_KEY, role);
      await signInWithRedirect(auth, provider);
    } catch (error) {
      console.error('Google login error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const addCredits = async (amount: number) => {
    if (!state.uid) return;
    try {
      await updateDoc(doc(db, 'users', state.uid), {
        credits: increment(amount)
      });
      setState(prev => ({ ...prev, userCredits: prev.userCredits + amount }));
    } catch (error) {
      console.error('Error adding credits:', error);
    }
  };

  const value = useMemo(() => ({
    ...state,
    setHasSeenWelcome,
    login,
    loginWithGoogle,
    logout,
    addCredits,
  }), [state]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
