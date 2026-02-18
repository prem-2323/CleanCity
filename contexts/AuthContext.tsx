import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type UserRole = 'citizen' | 'cleaner' | 'admin';

interface AuthState {
  hasSeenWelcome: boolean;
  isLoggedIn: boolean;
  userRole: UserRole | null;
  userName: string;
  userCredits: number;
  isLoading: boolean;
}

interface AuthContextValue extends AuthState {
  setHasSeenWelcome: () => Promise<void>;
  login: (role: UserRole, name: string) => Promise<void>;
  logout: () => Promise<void>;
  addCredits: (amount: number) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    hasSeenWelcome: false,
    isLoggedIn: false,
    userRole: null,
    userName: '',
    userCredits: 0,
    isLoading: true,
  });

  useEffect(() => {
    loadState();
  }, []);

  const loadState = async () => {
    try {
      const [welcome, loggedIn, role, name, credits] = await Promise.all([
        AsyncStorage.getItem('hasSeenWelcome'),
        AsyncStorage.getItem('isLoggedIn'),
        AsyncStorage.getItem('userRole'),
        AsyncStorage.getItem('userName'),
        AsyncStorage.getItem('userCredits'),
      ]);
      setState({
        hasSeenWelcome: welcome === 'true',
        isLoggedIn: loggedIn === 'true',
        userRole: (role as UserRole) || null,
        userName: name || '',
        userCredits: credits ? parseInt(credits, 10) : 0,
        isLoading: false,
      });
    } catch {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const setHasSeenWelcome = async () => {
    await AsyncStorage.setItem('hasSeenWelcome', 'true');
    setState(prev => ({ ...prev, hasSeenWelcome: true }));
  };

  const login = async (role: UserRole, name: string) => {
    await Promise.all([
      AsyncStorage.setItem('isLoggedIn', 'true'),
      AsyncStorage.setItem('userRole', role),
      AsyncStorage.setItem('userName', name),
      AsyncStorage.setItem('userCredits', '150'),
    ]);
    setState(prev => ({
      ...prev,
      isLoggedIn: true,
      userRole: role,
      userName: name,
      userCredits: 150,
    }));
  };

  const logout = async () => {
    await Promise.all([
      AsyncStorage.removeItem('isLoggedIn'),
      AsyncStorage.removeItem('userRole'),
      AsyncStorage.removeItem('userName'),
      AsyncStorage.removeItem('userCredits'),
    ]);
    setState(prev => ({
      ...prev,
      isLoggedIn: false,
      userRole: null,
      userName: '',
      userCredits: 0,
    }));
  };

  const addCredits = async (amount: number) => {
    const newCredits = state.userCredits + amount;
    await AsyncStorage.setItem('userCredits', newCredits.toString());
    setState(prev => ({ ...prev, userCredits: newCredits }));
  };

  const value = useMemo(() => ({
    ...state,
    setHasSeenWelcome,
    login,
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
