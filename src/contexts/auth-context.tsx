// src/contexts/auth-context.tsx
'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

interface User {
  email: string;
  name: string;
  uid: string; // используется для идентификации пользователя и отправки писем
}

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  error: string | null;
  signUp: (email: string, password: string, name: string) => Promise<User>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  signInWithGoogle: (redirectPath?: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<React.PropsWithChildren<{}>> = ({
  children,
}) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Проверяем сессию при загрузке
  useEffect(() => {
    void (async function fetchSession() {
      try {
        const res = await fetch('/api/auth/me');
        const data = await res.json();
        if (data.ok && data.user) {
          setCurrentUser(data.user);
        }
      } catch (err) {
        console.error('Error fetching session:', err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const signUp = async (email: string, password: string, name: string) => {
    setError(null);
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name }),
    });
    const data = await res.json();
    if (!data.ok) {
      setError(data.error);
      throw new Error(data.error);
    }
    setCurrentUser(data.user);
    return data.user;
  };

  const signIn = async (email: string, password: string) => {
    setError(null);
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!data.ok) {
      setError(data.error);
      throw new Error(data.error);
    }
    setCurrentUser(data.user);
  };

  const signOut = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setCurrentUser(null);
  };

  const signInWithGoogle = (redirectPath = '/') => {
    window.location.href = `/api/auth/google?redirect=${encodeURIComponent(
      redirectPath,
    )}`;
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        loading,
        error,
        signUp,
        signIn,
        signOut,
        signInWithGoogle,
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};
