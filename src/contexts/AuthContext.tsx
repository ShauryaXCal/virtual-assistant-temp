import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { getDoctorByEmail } from '../lib/database';

export interface User {
  id: string;
  email: string;
  fullName: string;
  npiId: string;
  specialty: string;
  location?: string;
  role?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (fullName: string, email: string, password: string, npiId: string, specialty: string, location: string, role: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DUMMY_PASSWORD = 'password123';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function validateSavedUser() {
      const savedUser = localStorage.getItem('user');
      if (savedUser) {
        try {
          const userData = JSON.parse(savedUser);
          const doctor = await getDoctorByEmail(userData.email);

          if (doctor && doctor.id === userData.id) {
            setUser(userData);
          } else {
            localStorage.removeItem('user');
          }
        } catch (error) {
          localStorage.removeItem('user');
        }
      }
      setIsLoading(false);
    }

    validateSavedUser();
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));

    if (password !== DUMMY_PASSWORD) {
      setIsLoading(false);
      throw new Error('Invalid email or password');
    }

    const doctor = await getDoctorByEmail(email);
    if (!doctor) {
      setIsLoading(false);
      throw new Error('Invalid email or password');
    }

    const userData: User = {
      id: doctor.id,
      email: doctor.email,
      fullName: doctor.full_name,
      npiId: doctor.npi_id,
      specialty: doctor.specialty,
    };

    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    setIsLoading(false);
  };

  const signup = async (
    fullName: string,
    email: string,
    password: string,
    npiId: string,
    specialty: string,
    location: string,
    role: string
  ): Promise<void> => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));

    const existingDoctor = await getDoctorByEmail(email);
    if (existingDoctor) {
      setIsLoading(false);
      throw new Error('Email already exists');
    }

    setIsLoading(false);
    throw new Error('Signup is not available in this demo. Please use an existing account.');
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, isLoading }}>
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
