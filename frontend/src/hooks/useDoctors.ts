import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { doctorsAPI } from '@/services/api';
import { Doctor } from '@/types';
import { toast } from 'sonner';

export const useDoctors = (params?: { specialization?: string; search?: string }) => {
  return useQuery({
    queryKey: ['doctors', params],
    queryFn: async () => {
      try {
        const response = await doctorsAPI.getAll(params);
        return response.data as Doctor[];
      } catch (error: any) {
        // If API is not available, return empty array instead of crashing
        if (error.code === 'ERR_NETWORK' || error.code === 'ECONNREFUSED') {
          console.warn('API not available, returning empty doctors list');
          return [] as Doctor[];
        }
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: false, // Don't retry on network errors
    refetchOnWindowFocus: false,
  });
};

export const useDoctor = (id: string | undefined) => {
  return useQuery({
    queryKey: ['doctor', id],
    queryFn: async () => {
      if (!id) throw new Error('Doctor ID is required');
      try {
        const response = await doctorsAPI.getById(id);
        return response.data as Doctor;
      } catch (error: any) {
        if (error.code === 'ERR_NETWORK' || error.code === 'ECONNREFUSED') {
          console.warn('API not available');
          throw new Error('Doctor information unavailable');
        }
        throw error;
      }
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    retry: false,
    refetchOnWindowFocus: false,
  });
};

export const useDoctorAvailability = (id: string | undefined, date: string) => {
  return useQuery({
    queryKey: ['doctor-availability', id, date],
    queryFn: async () => {
      if (!id) throw new Error('Doctor ID is required');
      try {
        const response = await doctorsAPI.getAvailability(id, date);
        return response.data as { slots: string[] };
      } catch (error: any) {
        if (error.code === 'ERR_NETWORK' || error.code === 'ECONNREFUSED') {
          console.warn('API not available, returning empty slots');
          return { slots: [] };
        }
        throw error;
      }
    },
    enabled: !!id && !!date,
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: false,
    refetchOnWindowFocus: false,
  });
};

export const useUpdateAvailability = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { slots: string[] }) => {
      const response = await doctorsAPI.updateAvailability(data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['doctor-availability'] });
      toast.success('Availability updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update availability');
    },
  });
};

