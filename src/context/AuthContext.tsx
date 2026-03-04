import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth } from '../lib/firebase';
import { onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth';

interface AuthContextType {
  user: any;
  profile: any;
  loading: boolean;
  isBlocked: boolean;
  isAdmin: boolean;
  isOwner: boolean;
  isSuperOwner: boolean;
  signIn: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isBlocked, setIsBlocked] = useState(false);

  const isAdmin = profile?.role === 'admin' || profile?.role === 'owner' || profile?.is_super_owner;
  const isOwner = profile?.role === 'owner' || profile?.is_super_owner;
  const isSuperOwner = profile?.is_super_owner;

  useEffect(() => {
    if (!auth) {
      // If Firebase is not configured, check if we have a mock user in localStorage
      const mockUser = localStorage.getItem('mockUser');
      if (mockUser) {
        const parsedUser = JSON.parse(mockUser);
        setUser(parsedUser);
        setProfile({
          id: parsedUser.uid,
          email: parsedUser.email,
          role: 'admin',
          is_super_owner: true
        });
      }
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      // Mock profile for now, since we removed Supabase
      if (currentUser) {
        setProfile({
          id: currentUser.uid,
          email: currentUser.email,
          role: 'user'
        });
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signIn = async (email: string) => {
    if (!auth) {
      const mockUser = { uid: 'mock-user-123', email };
      localStorage.setItem('mockUser', JSON.stringify(mockUser));
      setUser(mockUser);
      setProfile({
        id: mockUser.uid,
        email: mockUser.email,
        role: 'admin',
        is_super_owner: true
      });
    }
  };

  const signOut = async () => {
    if (auth) {
      await firebaseSignOut(auth);
    } else {
      localStorage.removeItem('mockUser');
      setUser(null);
      setProfile(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, isBlocked, isAdmin, isOwner, isSuperOwner, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
