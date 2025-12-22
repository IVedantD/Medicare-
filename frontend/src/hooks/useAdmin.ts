import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminAPI } from '@/services/api';
import { DashboardStats, User } from '@/types';
import { toast } from 'sonner';

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
      toast.success('User deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete user');
    },
  });
};

