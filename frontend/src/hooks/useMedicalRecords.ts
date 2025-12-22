import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { medicalRecordsAPI } from '@/services/api';
import { MedicalRecord } from '@/types';
import { toast } from 'sonner';

export const useMyMedicalRecords = () => {
  return useQuery({
    queryKey: ['medical-records', 'my'],
    queryFn: async () => {
      try {
        const response = await medicalRecordsAPI.getMyRecords();
        return response.data as MedicalRecord[];
      } catch (error: any) {
        if (error.code === 'ERR_NETWORK' || error.code === 'ECONNREFUSED') {
          console.warn('API not available, returning empty medical records list');
          return [] as MedicalRecord[];
        }
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000,
    retry: false,
    refetchOnWindowFocus: false,
  });
};

export const usePatientMedicalRecords = (patientId: string | undefined) => {
  return useQuery({
    queryKey: ['medical-records', 'patient', patientId],
    queryFn: async () => {
      if (!patientId) throw new Error('Patient ID is required');
      const response = await medicalRecordsAPI.getPatientRecords(patientId);
      return response.data as MedicalRecord[];
    },
    enabled: !!patientId,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
};

export const useCreateMedicalRecord = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      patientId: string;
      appointmentId: string;
      diagnosis: string;
      prescription: string[];
      notes: string;
    }) => {
      const response = await medicalRecordsAPI.create(data);
      return response.data as MedicalRecord;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['medical-records'] });
      toast.success('Medical record created successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create medical record');
    },
  });
};

