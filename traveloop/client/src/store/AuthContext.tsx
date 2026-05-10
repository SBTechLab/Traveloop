import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getMe } from '../api';

interface User {
  id: string;
  name: string;
  email: string;
  profilePhoto?: string;
  language: string;
  isAdmin: boolean;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string, user: User) => void;
  logout: () => void;
  updateUser: (user: User) => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('traveloop_token');
    if (storedToken) {
      setToken(storedToken);
      getMe()
        .then(res => setUser(res.data))
        .catch(() => { localStorage.removeItem('traveloop_token'); })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = (newToken: string, newUser: User) => {
    localStorage.setItem('traveloop_token', newToken);
    setToken(newToken);
    setUser(newUser);
  };

  const logout = () => {
    localStorage.removeItem('traveloop_token');
    setToken(null);
    setUser(null);
  };

  const updateUser = (updatedUser: User) => setUser(updatedUser);

  return (
    <AuthContext.Provider value={{ user, token, login, logout, updateUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
