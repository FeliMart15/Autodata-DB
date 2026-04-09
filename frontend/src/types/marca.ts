export interface Marca {
  MarcaID: number;
  CodigoMarca?: string;  // 4 dígitos
  Marca: string;
  PaisOrigen?: string;
  FechaCreacion: string;
  totalModelos?: number;
}

export interface CreateMarcaRequest {
  codigoMarca: string;
  marca: string;
  paisOrigen?: string;
}

export interface UpdateMarcaRequest extends CreateMarcaRequest {}

export interface MarcasResponse {
  success: boolean;
  data: Marca[];
  count: number;
}

export interface MarcaResponse {
  success: boolean;
  data: Marca;
}
