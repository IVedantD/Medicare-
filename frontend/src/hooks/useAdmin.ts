import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminAPI } from '@/services/api';
import { DashboardStats, User } from '@/types';
import { toast } from 'sonner';

// ----- Stats -----
export const useDashboardStats = () => {
  return useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: async () => {
      try {
        const response = await adminAPI.getDashboardStats();
        // Handle different response formats
        if (response.data.success !== undefined && response.data.data) {
          return response.data.data as DashboardStats;
        }
        return response.data as DashboardStats;
      } catch (error: any) {
        // If it's a network error or API unavailable, return empty stats
        if (error.code === 'ERR_NETWORK' || error.code === 'ECONNREFUSED' || !error.response) {
          console.warn('API not available, returning empty stats');
          return {} as DashboardStats;
        }
        // If it's a 401 (unauthorized), don't throw - let the interceptor handle it
        // But return empty stats so the page doesn't crash
        if (error.response?.status === 401) {
          console.warn('Unauthorized access to admin stats');
          return {} as DashboardStats;
        }
        throw error;
      }
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: false,
    refetchOnWindowFocus: false,
  });
};

export const useAllUsers = (params?: { role?: string; search?: string }) => {
  return useQuery({
    queryKey: ['admin', 'users', params],
    queryFn: async () => {
      try {
        const response = await adminAPI.getAllUsers(params);
        // Handle different response formats
        if (Array.isArray(response.data)) {
          return response.data as User[];
        }
        if (response.data.data && Array.isArray(response.data.data)) {
          return response.data.data as User[];
        }
        return [] as User[];
      } catch (error: any) {
        // If it's a network error or API unavailable, return empty array
        if (error.code === 'ERR_NETWORK' || error.code === 'ECONNREFUSED' || !error.response) {
          console.warn('API not available, returning empty users list');
          return [] as User[];
        }
        // If it's a 401 (unauthorized), don't throw - let the interceptor handle it
        // But return empty array so the page doesn't crash
        if (error.response?.status === 401) {
          console.warn('Unauthorized access to users list');
          return [] as User[];
        }
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000,
    retry: false,
    refetchOnWindowFocus: false,
  });
};

// ----- Doctors moderation -----
export const useAdminDoctors = (params?: { status?: 'pending' | 'approved' | 'blocked'; search?: string; page?: number; limit?: number }) => {
  return useQuery({
    queryKey: ['admin', 'doctors', params],
    queryFn: async () => {
      const response = await adminAPI.getDoctors(params);
      // Handle paginated response
      if (response.data.data && Array.isArray(response.data.data)) {
        return {
          doctors: response.data.data,
          pagination: response.data.pagination
        };
      }
      // Handle legacy response format
      return {
        doctors: response.data.doctors || response.data || [],
        pagination: null
      };
    },
    staleTime: 2 * 60 * 1000,
    retry: false,
  });
};

export const useApproveDoctor = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await adminAPI.approveDoctor(id);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'doctors'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] });
      toast.success('Doctor approved');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to approve doctor');
    },
  });
};

export const useRejectDoctor = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await adminAPI.rejectDoctor(id);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'doctors'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] });
      toast.success('Doctor rejected');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to reject doctor');
    },
  });
};

export const useBlockDoctor = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await adminAPI.blockDoctor(id);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'doctors'] });
      toast.success('Doctor blocked');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to block doctor');
    },
  });
};

export const useUnblockDoctor = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await adminAPI.unblockDoctor(id);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'doctors'] });
      toast.success('Doctor unblocked');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to unblock doctor');
    },
  });
};

// ----- Patients moderation -----
export const useAdminPatients = (params?: { search?: string; page?: number; limit?: number }) => {
  return useQuery({
    queryKey: ['admin', 'patients', params],
    queryFn: async () => {
      const response = await adminAPI.getPatients(params);
      // Handle paginated response
      if (response.data.data && Array.isArray(response.data.data)) {
        return {
          patients: response.data.data,
          pagination: response.data.pagination
        };
      }
      // Handle legacy response format
      return {
        patients: response.data.patients || response.data || [],
        pagination: null
      };
    },
    staleTime: 2 * 60 * 1000,
    retry: false,
  });
};

export const useBlockPatient = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await adminAPI.blockPatient(id);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'patients'] });
      toast.success('Patient blocked');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to block patient');
    },
  });
};

export const useUnblockPatient = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await adminAPI.unblockPatient(id);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'patients'] });
      toast.success('Patient unblocked');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to unblock patient');
    },
  });
};

// ----- Admin appointments (read-only) -----
export const useAdminAppointments = (params?: {
  status?: string;
  doctorId?: string;
  patientId?: string;
  date?: string;
  startDate?: string;
  endDate?: string;
}) => {
  return useQuery({
    queryKey: ['admin', 'appointments', params],
    queryFn: async () => {
      const response = await adminAPI.getAdminAppointments(params);
      return response.data.appointments || [];
    },
    staleTime: 2 * 60 * 1000,
    retry: false,
  });
};

export const useUpdateUserStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      status,
    }: {
      id: string;
      status: 'active' | 'suspended';
    }) => {
      const response = await adminAPI.updateUserStatus(id, status);
      return response.data as User;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      toast.success('User status updated');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update user status');
    },
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await adminAPI.deleteUser(id);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] });
      toast.success('User deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete user');
    },
  });
};

// ----- Audit Logs -----
export const useAuditLogs = (params?: {
  page?: number;
  limit?: number;
  adminId?: string;
  action?: string;
  targetType?: string;
  startDate?: string;
  endDate?: string;
}) => {
  return useQuery({
    queryKey: ['admin', 'audit-logs', params],
    queryFn: async () => {
      const response = await adminAPI.getAuditLogs(params);
      return {
        logs: response.data.data || [],
        pagination: response.data.pagination
      };
    },
    staleTime: 1 * 60 * 1000, // 1 minute
    retry: false,
  });
};

