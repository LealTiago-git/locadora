import { useState, useEffect } from 'react';

export interface AuthState {
  isAuthenticated: boolean;
  adminId: number | null;
  username: string | null;
}

const STORAGE_KEY = 'auth_state';

export const useAuth = () => {
  const [auth, setAuth] = useState<AuthState>({
    isAuthenticated: false,
    adminId: null,
    username: null
  });
  const [isLoading, setIsLoading] = useState(true);

  // Carregar autenticação do localStorage ao montar
  useEffect(() => {
    const storedAuth = localStorage.getItem(STORAGE_KEY);
    if (storedAuth) {
      try {
        setAuth(JSON.parse(storedAuth));
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
    setIsLoading(false);
  }, []);

  const login = (adminId: number, username: string) => {
    const newAuthState: AuthState = {
      isAuthenticated: true,
      adminId,
      username
    };
    setAuth(newAuthState);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newAuthState));
  };

  const logout = () => {
    const newAuthState: AuthState = {
      isAuthenticated: false,
      adminId: null,
      username: null
    };
    setAuth(newAuthState);
    localStorage.removeItem(STORAGE_KEY);
  };

  return {
    auth,
    isLoading,
    login,
    logout
  };
};
