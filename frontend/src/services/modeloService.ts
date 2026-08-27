import apiClient from './api';
import {
  Modelo,
  CreateModeloRequest,
  UpdateModeloRequest,
  ModeloFilters,
  PaginatedResponse,
  CambiarEstadoRequest,
  ModeloHistorial,
} from '@/types/index';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

interface ApiPaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export const modeloService = {
  getAll: async (filters?: ModeloFilters): Promise<PaginatedResponse<Modelo>> => {
    const response = await apiClient.get<ApiPaginatedResponse<Modelo>>('/modelos', { params: filters });
    return {
      data: response.data.data,
      pagination: {
        page: response.data.pagination.page,
        limit: response.data.pagination.limit,
        total: response.data.pagination.total,
        totalPages: response.data.pagination.pages
      }
    };
  },

  getById: async (id: number): Promise<Modelo> => {
    const response = await apiClient.get<ApiResponse<Modelo>>(`/modelos/${id}`);
    return response.data.data;
  },

  create: async (data: CreateModeloRequest): Promise<Modelo> => {
    const response = await apiClient.post<ApiResponse<Modelo>>('/modelos', data);
    return response.data.data;
  },

  update: async (id: number, data: UpdateModeloRequest): Promise<Modelo> => {
    const response = await apiClient.put<ApiResponse<Modelo>>(`/modelos/${id}`, data);
    return response.data.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/modelos/${id}`);
  },

  deletePermanente: async (id: number): Promise<{ message: string; deletedId: number }> => {
    const response = await apiClient.delete<ApiResponse<{ message: string; deletedId: number }>>(`/modelos/${id}/permanente`);
    return response.data as unknown as { message: string; deletedId: number };
  },

  cambiarEstado: async (id: number, data: CambiarEstadoRequest): Promise<Modelo> => {
    const response = await apiClient.post<ApiResponse<Modelo>>(`/modelos/${id}/estado`, data);
    return response.data.data;
  },

  getHistorial: async (id: number): Promise<ModeloHistorial[]> => {
    const response = await apiClient.get<ApiResponse<ModeloHistorial[]>>(`/modelos/${id}/historial`);
    return response.data.data;
  },

  getByEstado: async (estado: string): Promise<Modelo[]> => {
    const response = await apiClient.get<ApiResponse<Modelo[]>>(`/modelos/estado/${estado}`);
    return response.data.data;
  },
};
