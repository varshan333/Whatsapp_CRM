'use client';

import React, { createContext, useContext, ReactNode, useState } from 'react';

export type UserRole = 'Admin' | 'Agent';

interface AuthContextType {
  role: UserRole;
  userName: string;
  isAdmin: boolean;
  isAgent: boolean;
  setRole: (role: UserRole) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
  initialRole?: UserRole;
}

/**
 * AuthProvider - Frontend-only role management system
 * 
 * This is a mocked implementation that can be easily replaced with
 * backend/JWT-based authentication later.
 * 
 * Features:
 * - Client-side role state management
 * - Dynamic role switching without page reload
 * - Switch between Admin and Agent roles instantly
 * 
 * Usage with different initial roles:
 * <AuthProvider initialRole="Admin">...</AuthProvider>
 * <AuthProvider initialRole="Agent">...</AuthProvider>
 */
export function AuthProvider({ children, initialRole = 'Admin' }: AuthProviderProps) {
  const [role, setRole] = useState<UserRole>(initialRole);
  
  return (
    <AuthContext.Provider
      value={{
        role,
        userName: role === 'Admin' ? 'Admin User' : 'Agent User',
        isAdmin: role === 'Admin',
        isAgent: role === 'Agent',
        setRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

/**
 * useAuth - Hook to access role and auth information
 * 
 * @example
 * const { role, isAdmin, setRole } = useAuth();
 * setRole('Agent'); // Switch to Agent role
 */
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

