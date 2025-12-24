import { useQuery } from '@tanstack/react-query';
import { dashboardAPI } from '@/services/api';
import { toast } from 'sonner';

/**
 * Hook to fetch patient dashboard data
 */
export const usePatientDashboard = () => {
  return useQuery({
    queryKey: ['patient', 'dashboard'],
    queryFn: async () => {
      const response = await dashboardAPI.getPatientDashboard();
      return response.data;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: 1,
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to load dashboard');
    },
  });
};

/**
 * Hook to fetch doctor dashboard data
 */
export const useDoctorDashboard = () => {
  return useQuery({
    queryKey: ['doctor', 'dashboard'],
    queryFn: async () => {
      const response = await dashboardAPI.getDoctorDashboard();
      return response.data;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: 1,
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to load dashboard');
    },
  });
};

/**
 * Hook to fetch admin dashboard data
 */
export const useAdminDashboard = () => {
  return useQuery({
    queryKey: ['admin', 'dashboard'],
    queryFn: async () => {
      const response = await dashboardAPI.getAdminDashboard();
      return response.data;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: 1,
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to load dashboard');
    },
  });
};

