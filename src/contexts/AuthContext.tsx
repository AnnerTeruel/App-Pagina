
'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, AuthContextType } from '@/types';
import { authService } from '@/services/auth.service';
import { storage } from '@/lib/storage';
import { toast } from 'sonner';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const currentUser = storage.getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
    }
    setIsLoading(false);
  }, []);

  const register = async (email: string, password: string, name: string): Promise<boolean> => {
    try {
      const existingUser = await authService.getUserByEmail(email);
      
      if (existingUser) {
        toast.error('El correo electrónico ya está registrado');
        return false;
      }

      const newUser = await authService.register({
        email,
        password,
        name,
        role: 'customer',
        isAdmin: false,
      });
      
      const userWithoutPassword = { ...newUser, password: '' };
      setUser(userWithoutPassword);
      storage.setCurrentUser(userWithoutPassword); // Keep session in local storage for persistence
      
      toast.success('Registro exitoso');
      return true;
    } catch (error) {
      console.error(error);
      toast.error('Error al registrar usuario');
      return false;
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const foundUser = await authService.login(email, password);

      if (!foundUser) {
        toast.error('Credenciales incorrectas');
        return false;
      }

      const userWithoutPassword = { ...foundUser, password: '' };
      setUser(userWithoutPassword);
      storage.setCurrentUser(userWithoutPassword); // Keep session in local storage for persistence
      
      toast.success('Inicio de sesión exitoso');
      return true;
    } catch (error) {
      console.error(error);
      toast.error('Error al iniciar sesión');
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    storage.setCurrentUser(null);
    toast.success('Sesión cerrada');
  };

  if (isLoading) {
    return null;
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        register,
        logout,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin',
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
}
