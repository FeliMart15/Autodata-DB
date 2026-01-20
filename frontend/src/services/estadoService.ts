import api from './api';
import { ModeloEstado } from '@/types';

export interface CambiarEstadoRequest {
  nuevoEstado: ModeloEstado;
  observaciones?: string;
  usuarioID?: number;
}

export interface CambiarEstadoResponse {
  success: boolean;
  message: string;
  data: {
    modeloID: number;
    estadoAnterior: string;
    estadoNuevo: string;
    observaciones: string | null;
  };
}

export interface ValidarDatosMinimosResponse {
  success: boolean;
  data: {
    modeloID: number;
    datosCompletos: boolean;
    camposFaltantes: string[];
    mensaje: string;
  };
}

export interface EstadoInfo {
  codigo: string;
  nombre: string;
  edicion: {
    permiteEdicion: boolean;
    campos: string;
    mensaje?: string;
  };
}

const estadoService = {
  /**
   * Cambia el estado de un modelo con validaciones
   */
  cambiarEstado: async (
    modeloID: number,
    request: CambiarEstadoRequest
  ): Promise<CambiarEstadoResponse> => {
    const response = await api.post(`/modelos/${modeloID}/cambiar-estado`, request);
    return response.data;
  },

  /**
   * Valida si los datos mínimos de un modelo están completos
   */
  validarDatosMinimos: async (modeloID: number): Promise<ValidarDatosMinimosResponse> => {
    const response = await api.post(`/modelos/${modeloID}/validar-datos-minimos`);
    return response.data;
  },

  /**
   * Obtiene la lista de estados disponibles con información
   */
  getEstados: async (): Promise<EstadoInfo[]> => {
    const response = await api.get('/modelos/estados');
    return response.data.data;
  },

  /**
   * Helper: Obtiene el label legible de un estado
   */
  getEstadoLabel: (estado: string): string => {
    const labels: Record<string, string> = {
      [ModeloEstado.IMPORTADO]: 'Importado',
      [ModeloEstado.CREADO]: 'Creado',
      [ModeloEstado.DATOS_MINIMOS]: 'Datos Mínimos',
      [ModeloEstado.REVISION_MINIMOS]: 'En Revisión de Mínimos',
      [ModeloEstado.CORREGIR_MINIMOS]: 'Corregir Mínimos',
      [ModeloEstado.MINIMOS_APROBADOS]: 'Mínimos Aprobados',
      [ModeloEstado.EQUIPAMIENTO_CARGADO]: 'Equipamiento Cargado',
      [ModeloEstado.REVISION_EQUIPAMIENTO]: 'En Revisión de Equipamiento',
      [ModeloEstado.CORREGIR_EQUIPAMIENTO]: 'Corregir Equipamiento',
      [ModeloEstado.DEFINITIVO]: 'Definitivo',
    };
    return labels[estado] || estado;
  },

  /**
   * Helper: Obtiene el color del badge para un estado
   */
  getEstadoBadgeColor: (estado: string): string => {
    switch (estado) {
      case ModeloEstado.IMPORTADO:
      case ModeloEstado.CREADO:
        return 'bg-gray-100 text-gray-800';
      
      case ModeloEstado.DATOS_MINIMOS:
        return 'bg-blue-100 text-blue-800';
      
      case ModeloEstado.REVISION_MINIMOS:
        return 'bg-purple-100 text-purple-800';
      
      case ModeloEstado.CORREGIR_MINIMOS:
      case ModeloEstado.CORREGIR_EQUIPAMIENTO:
        return 'bg-red-100 text-red-800';
      
      case ModeloEstado.MINIMOS_APROBADOS:
        return 'bg-green-100 text-green-800';
      
      case ModeloEstado.EQUIPAMIENTO_CARGADO:
        return 'bg-cyan-100 text-cyan-800';
      
      case ModeloEstado.REVISION_EQUIPAMIENTO:
        return 'bg-indigo-100 text-indigo-800';
      
      case ModeloEstado.DEFINITIVO:
        return 'bg-emerald-100 text-emerald-800';
      
      default:
        return 'bg-gray-100 text-gray-800';
    }
  },

  /**
   * Helper: Determina si un estado permite edición
   */
  permiteEdicion: (estado: string): { permiteEdicion: boolean; campos: string } => {
    const estadosEditablesDatosMinimos = [
      ModeloEstado.IMPORTADO,
      ModeloEstado.CREADO,
      ModeloEstado.DATOS_MINIMOS,
      ModeloEstado.CORREGIR_MINIMOS,
    ];

    const estadosEditablesEquipamiento = [
      ModeloEstado.MINIMOS_APROBADOS,
      ModeloEstado.EQUIPAMIENTO_CARGADO,
      ModeloEstado.CORREGIR_EQUIPAMIENTO,
    ];

    if (estadosEditablesDatosMinimos.includes(estado as ModeloEstado)) {
      return { permiteEdicion: true, campos: 'datos_minimos' };
    }

    if (estadosEditablesEquipamiento.includes(estado as ModeloEstado)) {
      return { permiteEdicion: true, campos: 'equipamiento' };
    }

    return { permiteEdicion: false, campos: 'ninguno' };
  },
};

export default estadoService;
