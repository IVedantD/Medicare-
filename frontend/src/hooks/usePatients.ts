import { useQuery } from '@tanstack/react-query';
import { patientsAPI } from '@/services/api';
import { User, MedicalRecord } from '@/types';

export const usePatients = (params?: { search?: string }) => {
  return useQuery({
    queryKey: ['patients', params],
    queryFn: async () => {
      try {
        const response = await patientsAPI.getAll(params);
        return response.data as User[];
      } catch (error: any) {
        if (error.code === 'ERR_NETWORK' || error.code === 'ECONNREFUSED') {
          console.warn('API not available, returning empty patients list');
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

export const usePatient = (id: string | undefined) => {
  return useQuery({
    queryKey: ['patient', id],
    queryFn: async () => {
      if (!id) throw new Error('Patient ID is required');
      const response = await patientsAPI.getById(id);
      return response.data as User;
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
};

export const usePatientMedicalHistory = (id: string | undefined) => {
  return useQuery({
    queryKey: ['patient-history', id],
    queryFn: async () => {
      if (!id) throw new Error('Patient ID is required');
      const response = await patientsAPI.getMedicalHistory(id);
      return response.data as MedicalRecord[];
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
};

