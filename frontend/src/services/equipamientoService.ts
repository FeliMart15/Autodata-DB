import apiClient from './api';
import { EquipamientoModelo } from '@/types/index';

export const equipamientoService = {
  getByModeloId: async (idModelo: number): Promise<EquipamientoModelo | null> => {
    const response = await apiClient.get(`/equipamiento/modelo/${idModelo}`);
    return response.data?.data || response.data;
  },

  create: async (data: Partial<EquipamientoModelo>): Promise<EquipamientoModelo> => {
    const response = await apiClient.post<EquipamientoModelo>('/equipamiento', data);
    return response.data;
  },

  update: async (idModelo: number, data: Partial<EquipamientoModelo>): Promise<EquipamientoModelo> => {
    const response = await apiClient.put<EquipamientoModelo>(`/equipamiento/modelo/${idModelo}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/equipamiento/${id}`);
  },
};
