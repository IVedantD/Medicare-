import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { appointmentsAPI } from '@/services/api';
import { Appointment } from '@/types';
import { toast } from 'sonner';

export const useMyAppointments = (params?: { status?: string }) => {
  return useQuery({
    queryKey: ['appointments', 'my', params],
    queryFn: async () => {
      try {
        const response = await appointmentsAPI.getMyAppointments(params);
        return response.data as Appointment[];
      } catch (error: any) {
        if (error.code === 'ERR_NETWORK' || error.code === 'ECONNREFUSED') {
          console.warn('API not available, returning empty appointments list');
          return [] as Appointment[];
        }
        throw error;
      }
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: false,
    refetchOnWindowFocus: false,
  });
};

export const useDoctorAppointments = (params?: { status?: string; date?: string }) => {
  return useQuery({
    queryKey: ['appointments', 'doctor', params],
    queryFn: async () => {
      try {
        const response = await appointmentsAPI.getDoctorAppointments(params);
        return response.data as Appointment[];
      } catch (error: any) {
        if (error.code === 'ERR_NETWORK' || error.code === 'ECONNREFUSED') {
          console.warn('API not available, returning empty appointments list');
          return [] as Appointment[];
        }
        throw error;
      }
    },
    staleTime: 2 * 60 * 1000,
    retry: false,
    refetchOnWindowFocus: false,
  });
};

export const useAppointment = (id: string | undefined) => {
  return useQuery({
    queryKey: ['appointment', id],
    queryFn: async () => {
      if (!id) throw new Error('Appointment ID is required');
      const response = await appointmentsAPI.getById(id);
      return response.data as Appointment;
    },
    enabled: !!id,
    staleTime: 2 * 60 * 1000,
    retry: 1,
  });
};

export const useCreateAppointment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      doctorId: string;
      date: string;
      time: string;
      reason: string;
    }) => {
      console.log('[useCreateAppointment] Creating appointment:', data);
      const response = await appointmentsAPI.create(data);
      console.log('[useCreateAppointment] Success:', response.data);
      // Handle both response formats
      return (response.data?.appointment || response.data) as Appointment;
    },
    onSuccess: () => {
      console.log('[useCreateAppointment] Appointment created successfully');
      // Invalidate queries without awaiting
      queryClient.invalidateQueries({ queryKey: ['appointments'] }).catch(() => {});
      queryClient.invalidateQueries({ queryKey: ['my-appointments'] }).catch(() => {});
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to book appointment';
      console.error('[useCreateAppointment] Error details:', {
        message: errorMessage,
        status: error.response?.status,
        data: error.response?.data
      });
    },
  });
};

export const useUpdateAppointmentStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      status,
    }: {
      id: string;
      status: 'approved' | 'rejected' | 'completed' | 'cancelled';
    }) => {
      const response = await appointmentsAPI.updateStatus(id, status);
      return response.data as Appointment;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      toast.success('Appointment status updated');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update appointment');
    },
  });
};

export const useCancelAppointment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await appointmentsAPI.cancel(id);
      return response.data as Appointment;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      toast.success('Appointment cancelled');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to cancel appointment');
    },
  });
};

export const useAddPrescription = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      prescription,
    }: {
      id: string;
      prescription: {
        diagnosis: string;
        medications: string[];
        notes: string;
      };
    }) => {
      const response = await appointmentsAPI.addPrescription(id, prescription);
      return response.data as Appointment;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      toast.success('Prescription added successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to add prescription');
    },
  });
};

export const useRescheduleAppointment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      date,
      time,
    }: {
      id: string;
      date: string;
      time: string;
    }) => {
      const response = await appointmentsAPI.reschedule(id, { date, time });
      return response.data as Appointment;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      toast.success('Appointment rescheduled successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to reschedule appointment');
    },
  });
};

export const useAllAppointments = (params?: {
  status?: string;
  doctorId?: string;
  date?: string;
  startDate?: string;
  endDate?: string;
}) => {
  return useQuery({
    queryKey: ['appointments', 'admin', 'all', params],
    queryFn: async () => {
      try {
        const response = await appointmentsAPI.getAllAppointments(params);
        return response.data.appointments as Appointment[];
      } catch (error: any) {
        if (error.code === 'ERR_NETWORK' || error.code === 'ECONNREFUSED') {
          console.warn('API not available, returning empty appointments list');
          return [] as Appointment[];
        }
        throw error;
      }
    },
    staleTime: 2 * 60 * 1000,
    retry: false,
    refetchOnWindowFocus: false,
  });
};

