import apiClient from './api';
import { DashboardStats } from '@/types/index';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  pagination?: {
    total: number;
  };
}

export const dashboardService = {
  getStats: async (): Promise<DashboardStats> => {
    try {
      // Obtener estadísticas desde el endpoint de modelos
      const response = await apiClient.get<ApiResponse<any[]>>('/modelos?page=1&limit=1');
      const total = response.data.pagination?.total || 0;
      
      // Por ahora retornamos estadísticas básicas
      // TODO: Crear endpoint específico de dashboard en el backend
      return {
        total_modelos: total,
        modelos_por_estado: {
          importado: 0,
          datos_minimos: 0,
          equipamiento_cargado: 0,
          en_revision: 0,
          para_corregir: 0,
          en_aprobacion: 0,
          aprobado: 0,
          definitivo: 0,
        },
        modelos_asignados: 0,
        modelos_pendientes: 0,
        ultimos_modelos: [],
        actividad_reciente: [],
      };
    } catch (error) {
      console.error('Error getting stats:', error);
      // Retornar valores por defecto en caso de error
      return {
        total_modelos: 0,
        modelos_por_estado: {
          importado: 0,
          datos_minimos: 0,
          equipamiento_cargado: 0,
          en_revision: 0,
          para_corregir: 0,
          en_aprobacion: 0,
          aprobado: 0,
          definitivo: 0,
        },
        modelos_asignados: 0,
        modelos_pendientes: 0,
        ultimos_modelos: [],
        actividad_reciente: [],
      };
    }
  },
};
