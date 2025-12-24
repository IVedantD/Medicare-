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
        console.log('[useDoctors] API response:', response.data);
        // Handle both array and object with data property
        const doctors = Array.isArray(response.data) ? response.data : (response.data?.doctors || []);
        console.log(`[useDoctors] Found ${doctors.length} doctor(s)`);
        return doctors as Doctor[];
      } catch (error: any) {
        console.error('[useDoctors] Error fetching doctors:', error);
        // If API is not available, return empty array instead of crashing
        if (error.code === 'ERR_NETWORK' || error.code === 'ECONNREFUSED' || !error.response) {
          console.warn('[useDoctors] API not available, returning empty doctors list');
          return [] as Doctor[];
        }
        // If it's a 401 (unauthorized), still return empty array (might be auth issue)
        if (error.response?.status === 401) {
          console.warn('[useDoctors] Unauthorized access');
          return [] as Doctor[];
        }
        throw error;
      }
    },
    staleTime: 2 * 60 * 1000, // 2 minutes (reduced for better real-time updates)
    retry: 1, // Retry once on failure
    refetchOnWindowFocus: true, // Refetch when window regains focus
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

export const useCurrentAvailability = () => {
  return useQuery({
    queryKey: ['doctor-availability-current'],
    queryFn: async () => {
      try {
        const response = await doctorsAPI.getCurrentAvailability();
        return response.data.schedule as Record<string, string[]>;
      } catch (error: any) {
        console.error('[useCurrentAvailability] Error fetching availability:', error);
        return {} as Record<string, string[]>;
      }
    },
    staleTime: 5 * 60 * 1000,
    retry: false,
    refetchOnWindowFocus: false,
  });
};

export const useUpdateAvailability = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { schedule: Record<string, string[]> }) => {
      const response = await doctorsAPI.updateAvailability(data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['doctor-availability'] });
      queryClient.invalidateQueries({ queryKey: ['doctor-availability-current'] });
      toast.success('Availability updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update availability');
    },
  });
};

