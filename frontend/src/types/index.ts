// Shared types for the application

export type UserRole = 'patient' | 'doctor' | 'admin';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
  phone?: string;
  whatsappNotificationsEnabled?: boolean;
  specialization?: string;
  department?: string;
  verified?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Doctor {
  id: string;
  name: string;
  email: string;
  specialization: string;
  department?: string;
  rating?: number;
  experience?: string;
  bio?: string;
  available?: boolean;
  verified?: boolean;
  avatar?: string;
  phone?: string;
}

export interface Appointment {
  id: string;
  patientId: string;
  patientName?: string;
  doctorId: string;
  doctorName?: string;
  date: string;
  time: string;
  reason?: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed' | 'cancelled';
  createdAt?: string;
  updatedAt?: string;
  prescription?: {
    diagnosis: string;
    medications: string[];
    notes: string;
  };
}

export interface MedicalRecord {
  id: string;
  patientId: string;
  appointmentId?: string;
  diagnosis: string;
  prescription: string[];
  notes: string;
  createdAt: string;
  doctorName?: string;
}

export interface AvailabilitySlot {
  date: string;
  slots: string[];
}

export interface DashboardStats {
  totalPatients?: number;
  totalDoctors?: number;
  appointmentsToday?: number;
  pendingAppointments?: number;
  completedAppointments?: number;
  revenue?: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  role: UserRole;
  phone?: string;
  whatsappNotificationsEnabled?: boolean;
  specialization?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    pincode?: string;
  };
}

export interface LoginData {
  email: string;
  password: string;
}

export interface ApiError {
  message: string;
  status?: number;
  errors?: Record<string, string[]>;
}

