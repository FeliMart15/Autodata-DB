// ventas.types.ts
// Tipos TypeScript para módulo de ventas y empadronamientos

export interface Departamento {
  DepartamentoID: number;
  Codigo: string;
  Nombre: string;
  Pais: string;
  Activo: boolean;
  FechaCreacion: string;
}

export interface Venta {
  VentaID?: number;
  ModeloID: number;
  DescripcionModelo: string;
  Familia: string;
  MarcaID: number;
  Marca: string;
  Cantidad: number;
  Periodo: string;
  FechaModificacion?: string;
  PrecioActual?: number;
  FechaPrecio?: string;
}

export interface VentaBatch {
  modeloId: number;
  cantidad: number;
}

export interface VentaBatchRequest {
  periodo: string;
  ventas: VentaBatch[];
}

export interface Empadronamiento {
  EmpadronamientoID?: number;
  ModeloID: number;
  DescripcionModelo: string;
  Familia: string;
  MarcaID: number;
  Marca: string;
  DepartamentoID: number;
  Departamento?: string;
  CodigoDepartamento?: string;
  Cantidad: number;
  Periodo: string;
  FechaModificacion?: string;
  PrecioActual?: number;
  FechaPrecio?: string;
}

export interface EmpadronamientoBatch {
  modeloId: number;
  cantidad: number;
}

export interface EmpadronamientoBatchRequest {
  periodo: string;
  departamentoId: number;
  empadronamientos: EmpadronamientoBatch[];
}

export interface ResumenVentas {
  Marca: string;
  Familia: string;
  CantidadModelos: number;
  TotalVentas: number;
}

export interface ResumenEmpadronamientos {
  Departamento: string;
  CodigoDepartamento: string;
  Marca: string;
  Familia: string;
  CantidadModelos: number;
  TotalEmpadronamientos: number;
}

export interface HistorialVenta {
  VentaID: number;
  ModeloID: number;
  Cantidad: number;
  Periodo: string;
  Anio: number;
  Mes: number;
  FechaCreacion: string;
  FechaModificacion?: string;
}

export interface HistorialEmpadronamiento {
  EmpadronamientoID: number;
  ModeloID: number;
  DepartamentoID: number;
  Cantidad: number;
  Periodo: string;
  Anio: number;
  Mes: number;
  FechaCreacion: string;
  FechaModificacion?: string;
}

// Respuestas API
export interface DepartamentosResponse {
  success: boolean;
  data: Departamento[];
  count: number;
}

export interface VentasResponse {
  success: boolean;
  data: Venta[];
  count: number;
}

export interface VentasPeriodoAnteriorResponse {
  success: boolean;
  data: Array<{
    ModeloID: number;
    DescripcionModelo: string;
    CantidadAnterior: number;
    PeriodoAnterior: string;
  }>;
  periodoAnterior: string;
}

export interface EmpadronamientosResponse {
  success: boolean;
  data: Empadronamiento[];
  count: number;
}

export interface EmpadronamientosPeriodoAnteriorResponse {
  success: boolean;
  data: Array<{
    ModeloID: number;
    DescripcionModelo: string;
    CantidadAnterior: number;
    PeriodoAnterior: string;
  }>;
  periodoAnterior: string;
}

export interface BatchSaveResponse {
  success: boolean;
  message: string;
  affectedRows: number;
  periodo: string;
  departamentoId?: number;
}

export interface ResumenVentasResponse {
  success: boolean;
  data: ResumenVentas[];
  periodo: string;
}

export interface ResumenEmpadronamientosResponse {
  success: boolean;
  data: ResumenEmpadronamientos[];
  periodo: string;
}

export interface HistorialVentasResponse {
  success: boolean;
  data: HistorialVenta[];
  count: number;
}

export interface HistorialEmpadronamientosResponse {
  success: boolean;
  data: HistorialEmpadronamiento[];
  count: number;
}
