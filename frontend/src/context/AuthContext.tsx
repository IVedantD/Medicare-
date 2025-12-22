import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authAPI } from '@/services/api';
import { User, UserRole, RegisterData } from '@/types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  updateUser: (data: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock users for demo
const mockUsers: (User & { password: string })[] = [
  {
    id: '1',
    email: 'patient@demo.com',
    password: 'password123',
    name: 'John Patient',
    role: 'patient',
    phone: '+1 234 567 8900',
  },
  {
    id: '2',
    email: 'doctor@demo.com',
    password: 'password123',
    name: 'Dr. Sarah Wilson',
    role: 'doctor',
    specialization: 'Cardiology',
    department: 'Heart Center',
    verified: true,
    phone: '+1 234 567 8901',
  },
  {
    id: '3',
    email: 'admin@demo.com',
    password: 'password123',
    name: 'Admin User',
    role: 'admin',
    phone: '+1 234 567 8902',
  },
];

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for stored auth on mount
    const storedToken = localStorage.getItem('clinic_token');
    const storedUser = localStorage.getItem('clinic_user');
    
    if (storedToken && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        // Ensure user has id field (convert _id to id if needed)
        if (parsedUser._id && !parsedUser.id) {
          parsedUser.id = parsedUser._id.toString();
          delete parsedUser._id;
        }
        setToken(storedToken);
        setUser(parsedUser);
      } catch (error) {
        console.error('Error parsing stored user:', error);
        // Clear invalid data
        localStorage.removeItem('clinic_token');
        localStorage.removeItem('clinic_user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    setIsLoading(true);
    
    try {
      // Try API call first, fallback to mock if API fails
      const response = await authAPI.login(email, password);
      
      // Handle different response formats
      let apiToken: string;
      let apiUser: any;
      
      if (response.data.token && response.data.user) {
        // Standard format: { token, user }
        apiToken = response.data.token;
        apiUser = response.data.user;
      } else if (response.data.success && response.data.token && response.data.user) {
        // Format with success flag: { success, token, user }
        apiToken = response.data.token;
        apiUser = response.data.user;
      } else {
        // Fallback: use entire response.data as user if token is at root
        apiToken = response.data.token || `api_token_${Date.now()}`;
        apiUser = response.data.user || response.data;
      }
      
      // Ensure user has required fields and convert _id to id
      if (apiUser._id && !apiUser.id) {
        apiUser.id = apiUser._id.toString();
        delete apiUser._id; // Remove _id to avoid confusion
      }
      if (!apiUser.id) {
        // If still no id, try to use the id from response
        apiUser.id = apiUser.id || apiUser._id?.toString() || String(Date.now());
      }
      if (!apiUser.role) {
        throw new Error('Invalid user data from server');
      }
      
      setUser(apiUser);
      setToken(apiToken);
      localStorage.setItem('clinic_token', apiToken);
      localStorage.setItem('clinic_user', JSON.stringify(apiUser));
    } catch (apiError: any) {
      // Check if it's a network error, API unavailable, or user not found (401)
      const isNetworkError = apiError.code === 'ERR_NETWORK' || apiError.code === 'ECONNREFUSED' || !apiError.response;
      const isUserNotFound = apiError.response?.status === 401 && 
        (apiError.response?.data?.message?.toLowerCase().includes('invalid') || 
         apiError.response?.data?.message?.toLowerCase().includes('not found'));
      
      // Use mock fallback if API is unavailable OR if user doesn't exist in database
      if (isNetworkError || isUserNotFound) {
        // Fallback to mock authentication for development
        const reason = isNetworkError ? 'API unavailable' : 'User not found in database';
        console.warn(`${reason}, using mock authentication:`, apiError.message);
        
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const foundUser = mockUsers.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
        
        if (!foundUser) {
          setIsLoading(false);
          throw new Error('Invalid email or password');
        }

        const { password: _, ...userWithoutPassword } = foundUser;
        const mockToken = `mock_jwt_token_${Date.now()}`;
        
        setUser(userWithoutPassword);
        setToken(mockToken);
        localStorage.setItem('clinic_token', mockToken);
        localStorage.setItem('clinic_user', JSON.stringify(userWithoutPassword));
      } else {
        // Real API error (other than user not found) - don't use mock, throw the error
        setIsLoading(false);
        const errorMessage = apiError.response?.data?.message || apiError.message || 'Login failed';
        throw new Error(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: RegisterData): Promise<void> => {
    setIsLoading(true);
    
    try {
      // Try API call first, fallback to mock if API fails
      const response = await authAPI.register(data);
      const { token: apiToken, user: apiUser } = response.data;
      
      setUser(apiUser);
      setToken(apiToken);
      localStorage.setItem('clinic_token', apiToken);
      localStorage.setItem('clinic_user', JSON.stringify(apiUser));
    } catch (apiError: any) {
      // Fallback to mock registration for development
      console.warn('API registration failed, using mock registration:', apiError.message);
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Check if email exists
      if (mockUsers.some(u => u.email === data.email)) {
        setIsLoading(false);
        throw new Error('Email already registered');
      }

      const newUser: User = {
        id: `${Date.now()}`,
        email: data.email,
        name: data.name,
        role: data.role,
        phone: data.phone,
        specialization: data.specialization,
        verified: data.role === 'doctor' ? false : undefined,
      };

      const mockToken = `mock_jwt_token_${Date.now()}`;
      
      setUser(newUser);
      setToken(mockToken);
      localStorage.setItem('clinic_token', mockToken);
      localStorage.setItem('clinic_user', JSON.stringify(newUser));
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('clinic_token');
    localStorage.removeItem('clinic_user');
  };

  const updateUser = (data: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...data };
      setUser(updatedUser);
      localStorage.setItem('clinic_user', JSON.stringify(updatedUser));
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
