import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from 'axios';

// Base API URL - MERN Backend Integration
// Set VITE_API_URL in .env file for production
// Default: http://localhost:5000/api (Express backend)
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 5000, // Reduced timeout for faster failure detection
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add JWT token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('clinic_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error) => {
    // Only redirect on 401 if we have a response (API is available)
    // AND it's not a network error (which means API is down)
    if (error.response?.status === 401 && !error.code) {
      // Token expired or invalid - logout user
      localStorage.removeItem('clinic_token');
      localStorage.removeItem('clinic_user');
      // Only redirect if we're not already on the login page
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    // For network errors (API unavailable) or connection errors, just reject without redirecting
    // This allows the app to work with mock data when backend is down
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (email: string, password: string) => 
    api.post('/auth/login', { email, password }),
  register: (data: {
    email: string;
    password: string;
    name: string;
    role: string;
    phone?: string;
    specialization?: string;
    address?: {
      street?: string;
      city?: string;
      state?: string;
      pincode?: string;
    };
  }) => api.post('/auth/register', data),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data: Partial<{
    name: string;
    phone: string;
    avatar: string;
  }>) => api.put('/auth/profile', data),
};

// Doctors API
export const doctorsAPI = {
  getAll: (params?: { specialization?: string; search?: string }) => 
    api.get('/doctors', { params }),
  getById: (id: string) => api.get(`/doctors/${id}`),
  getAvailability: (id: string, date: string) => 
    api.get(`/doctors/${id}/availability`, { params: { date } }),
  getCurrentAvailability: () => api.get('/doctors/availability/current'),
  updateAvailability: (data: { schedule: Record<string, string[]> }) => 
    api.put('/doctors/availability', data),
  getPendingApproval: () => api.get('/doctors/pending'),
  approve: (id: string) => api.put(`/doctors/${id}/approve`),
  reject: (id: string) => api.put(`/doctors/${id}/reject`),
};

// Appointments API
export const appointmentsAPI = {
  create: (data: {
    doctorId: string;
    date: string;
    time: string;
    reason: string;
  }) => api.post('/appointments', data),
  getMyAppointments: (params?: { status?: string }) => 
    api.get('/appointments/my', { params }),
  getDoctorAppointments: (params?: { status?: string; date?: string }) => 
    api.get('/appointments/doctor', { params }),
  getAllAppointments: (params?: { 
    status?: string; 
    doctorId?: string; 
    date?: string;
    startDate?: string;
    endDate?: string;
  }) => api.get('/appointments/admin/all', { params }),
  getById: (id: string) => api.get(`/appointments/${id}`),
  updateStatus: (id: string, status: 'approved' | 'rejected' | 'completed' | 'cancelled') => 
    api.put(`/appointments/${id}/status`, { status }),
  cancel: (id: string) => api.put(`/appointments/${id}/cancel`),
  reschedule: (id: string, data: { date: string; time: string }) => 
    api.put(`/appointments/${id}/reschedule`, data),
  addPrescription: (id: string, prescription: {
    diagnosis: string;
    medications: string[];
    notes: string;
  }) => api.put(`/appointments/${id}/prescription`, prescription),
};

// Patients API (for doctors/admin)
export const patientsAPI = {
  getAll: (params?: { search?: string }) => 
    api.get('/patients', { params }),
  getById: (id: string) => api.get(`/patients/${id}`),
  getMedicalHistory: (id: string) => api.get(`/patients/${id}/history`),
};

// Dashboard API - Role-based endpoints
export const dashboardAPI = {
  // Patient dashboard
  getPatientDashboard: () => api.get('/patient/dashboard'),
  
  // Doctor dashboard
  getDoctorDashboard: () => api.get('/doctor/dashboard'),
  
  // Admin dashboard
  getAdminDashboard: () => api.get('/admin/dashboard'),
};

// Admin API
export const adminAPI = {
  getDashboardStats: () => api.get('/admin/stats'),
  getAllUsers: (params?: { role?: string; search?: string }) => 
    api.get('/admin/users', { params }),
  updateUserStatus: (id: string, status: 'active' | 'suspended') => 
    api.put(`/admin/users/${id}/status`, { status }),
  deleteUser: (id: string) => api.delete(`/admin/users/${id}`),

  // Doctors moderation
  getDoctors: (params?: { status?: 'pending' | 'approved' | 'blocked'; search?: string; page?: number; limit?: number }) =>
    api.get('/admin/doctors', { params }),
  approveDoctor: (id: string) => api.put(`/admin/doctors/${id}/approve`),
  rejectDoctor: (id: string) => api.put(`/admin/doctors/${id}/reject`),
  blockDoctor: (id: string) => api.put(`/admin/doctors/${id}/block`),
  unblockDoctor: (id: string) => api.put(`/admin/doctors/${id}/unblock`),

  // Patients moderation
  getPatients: (params?: { search?: string; page?: number; limit?: number }) =>
    api.get('/admin/patients', { params }),
  blockPatient: (id: string) => api.put(`/admin/patients/${id}/block`),
  unblockPatient: (id: string) => api.put(`/admin/patients/${id}/unblock`),

  // Appointments monitoring (read-only)
  getAdminAppointments: (params?: {
    status?: string;
    doctorId?: string;
    patientId?: string;
    date?: string;
    startDate?: string;
    endDate?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) => api.get('/admin/appointments', { params }),

  // Audit Logs
  getAuditLogs: (params?: { page?: number; limit?: number; adminId?: string; action?: string; targetType?: string; startDate?: string; endDate?: string }) =>
    api.get('/admin/audit-logs', { params }),
};

// Medical Records API
export const medicalRecordsAPI = {
  getMyRecords: () => api.get('/medical-records/my'),
  getPatientRecords: (patientId: string) => 
    api.get(`/medical-records/patient/${patientId}`),
  create: (data: {
    patientId: string;
    appointmentId: string;
    diagnosis: string;
    prescription: string[];
    notes: string;
  }) => api.post('/medical-records', data),
};

export default api;
