import { useState, useEffect, createContext, useContext, ReactNode } from 'react';

interface User {
  _id: string;
  githubId: string;
  username: string;
  displayName: string;
  email?: string;
  avatar?: string;
  profileUrl?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: () => void;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_URL = 'http://localhost:3000';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = async () => {
    try {
      const res = await fetch(`${API_URL}/auth/status`, {
        credentials: 'include',
      });
      
      if (!res.ok) {
        throw new Error('Auth check failed');
      }
      
      const data = await res.json();
      if (data.authenticated && data.user) {
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
    
    // Listen for storage events (for cross-tab auth sync)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'auth-change') {
        checkAuth();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const login = async () => {
    console.log('Login button clicked');
    
    // Check if we're in Electron
    const isElectron = Boolean((window as any).process?.versions?.electron);
    const electronAPI = (window as any).electronAPI;
    const shellExternal = (window as any).electron?.shell?.openExternal;
    console.log('electronAPI:', electronAPI);
    console.log('electronAPI keys:', electronAPI ? Object.keys(electronAPI) : 'undefined');
    console.log('electronAPI.openExternal:', electronAPI?.openExternal);
    console.log('typeof electronAPI.openExternal:', typeof electronAPI?.openExternal);
    
    const openExternalFn = isElectron && typeof electronAPI?.openExternal === 'function'
      ? electronAPI.openExternal.bind(electronAPI)
      : isElectron && typeof shellExternal === 'function'
        ? shellExternal
        : null;

    if (openExternalFn) {
      console.log('Opening GitHub OAuth in external browser...');
      try {
        const url = `${API_URL}/auth/github`;
        console.log('About to call openExternal with:', url);
        await openExternalFn(url);
        console.log('External browser opened successfully');
        
        // Start polling for authentication
        console.log('Starting authentication polling...');
        const checkInterval = setInterval(async () => {
          try {
            const res = await fetch(`${API_URL}/auth/status`, {
              credentials: 'include',
            });
            const data = await res.json();
            console.log('Auth status check:', data);
            
            if (data.authenticated && data.user) {
              console.log('Authentication successful!', data.user);
              setUser(data.user);
              setLoading(false);
              clearInterval(checkInterval);
            }
          } catch (error) {
            console.error('Polling auth check failed:', error);
          }
        }, 2000);
        
        // Stop polling after 5 minutes
        setTimeout(() => {
          console.log('Stopping authentication polling after timeout');
          clearInterval(checkInterval);
        }, 300000);
      } catch (error) {
        console.error('Failed to open external browser:', error);
        console.log('Falling back to in-window redirect...');
        window.location.href = `${API_URL}/auth/github`;
      }
    } else {
      console.log('Not in Electron, redirecting in same window...');
      // For web browser, redirect directly
      window.location.href = `${API_URL}/auth/github`;
    }
  };

  const logout = async () => {
    try {
      await fetch(`${API_URL}/auth/logout`, {
        credentials: 'include',
      });
      setUser(null);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
