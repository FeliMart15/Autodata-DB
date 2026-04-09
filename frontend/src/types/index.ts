// Estado de los modelos en el flujo de trabajo
export enum ModeloEstado {
  IMPORTADO = 'importado',
  CREADO = 'creado',
  DATOS_MINIMOS = 'datos_minimos',
  REVISION_MINIMOS = 'revision_minimos',
  CORREGIR_MINIMOS = 'corregir_minimos',
  MINIMOS_APROBADOS = 'minimos_aprobados',
  EQUIPAMIENTO_CARGADO = 'equipamiento_cargado',
  REVISION_EQUIPAMIENTO = 'revision_equipamiento',
  CORREGIR_EQUIPAMIENTO = 'corregir_equipamiento',
  DEFINITIVO = 'definitivo',
}

// Etapas del flujo
export enum EtapaFlujo {
  IMPORTACION = 1,
  CARGA_DATOS = 2,
  EQUIPAMIENTO = 3,
  REVISION = 4,
}

// Roles de usuario
export enum UserRole {
  ENTRADA_DATOS = 'entrada_datos',
  REVISION = 'revision',
  APROBACION = 'aprobacion',
  ADMIN = 'admin',
}

// Usuario autenticado
export interface User {
  id: number;
  username: string;
  nombre: string;
  email: string;
  rol: UserRole;
}

// Marca
export interface Marca {
  id_marca: number;
  marca: string;
  pais_origen?: string;
  logo_url?: string;
  activo: boolean;
  createdAt: string;
  updatedAt: string;
}

// Modelo (entidad principal) - Backend response uses PascalCase matching DB columns
export interface Modelo {
  ModeloID: number;
  MarcaID: number;
  CodigoModelo?: string;
  DescripcionModelo?: string;
  Modelo?: string; // Alias for DescripcionModelo
  Modelo1?: string;
  Familia?: string;
  OrigenCodigo?: string;
  CombustibleCodigo?: string;
  CategoriaCodigo?: string;
  ShortName?: string;
  Precio0KMInicial?: number;
  PrecioInicial?: number;
  Anio?: number;
  Tipo?: string;
  Tipo2?: string;
  CC?: number;
  HP?: number;
  Traccion?: string;
  Caja?: string;
  TipoCaja?: string;
  Turbo?: boolean;
  Puertas?: number;
  Pasajeros?: number;
  TipoVehiculo?: string;
  SegmentacionAutodata?: string;
  SegmentacionGM?: string;
  SegmentacionAudi?: string;
  SegmentacionSBI?: string;
  SegmentacionCitroen?: string;
  Carroceria?: string;
  Cilindros?: number | string;
  Valvulas?: number | string;
  TipoMotor?: string;
  TipoVehiculoElectrico?: string;
  TipoCajaAut?: string;
  Asientos?: number | string;
  Importador?: string;
  Estado: string;
  EstadoID?: number;
  Activo: boolean;
  FechaCreacion: string;
  MarcaNombre?: string; // From join
  marca?: Marca;
  // Alias for backwards compatibility
  id_modelo?: number;
  id_marca?: number;
  modelo?: string;
  familia?: string;
  origen?: string;
  combustible?: string;
  año?: number;
  tipo?: string;
  tipo2?: string;
  cc?: number;
  hp?: number;
  traccion?: string;
  caja?: string;
  tipo_caja?: string;
  turbo?: boolean;
  puertas?: number;
  pasajeros?: number;
  tipo_vehiculo?: string;
  segmento?: string;
  categoria?: string;
  importador?: string;
  estado?: ModeloEstado;
  etapa?: EtapaFlujo;
  responsable_actual_id?: number;
  responsable_actual?: string;
  json_importado?: string;
  observaciones?: string;
  ultima_modificacion?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Versión de modelo
export interface VersionModelo {
  id_version: number;
  id_modelo: number;
  nombre_version: string;
  año: number;
  precio_base?: number;
  codigo_interno?: string;
  activo: boolean;
  estado?: string;
  createdAt: string;
  updatedAt: string;
}

// Equipamiento del modelo
export interface EquipamientoModelo {
  id_equipamiento: number;
  id_modelo: number;
  
  // Seguridad
  airbag_conductor?: boolean;
  airbag_acompanante?: boolean;
  airbag_lateral?: boolean;
  airbag_cortina?: boolean;
  abs?: boolean;
  esp?: boolean;
  control_traccion?: boolean;
  asistente_arranque?: boolean;
  camara_retroceso?: boolean;
  sensores_estacionamiento?: boolean;
  freno_automatico_emergencia?: boolean;
  alerta_cambio_carril?: boolean;
  control_punto_ciego?: boolean;
  isofix?: boolean;
  
  // Confort
  aire_acondicionado?: boolean;
  climatizador?: boolean;
  climatizador_bizona?: boolean;
  asientos_cuero?: boolean;
  asientos_calefaccionados?: boolean;
  asientos_ventilados?: boolean;
  asiento_conductor_electrico?: boolean;
  volante_regulable_altura?: boolean;
  volante_regulable_profundidad?: boolean;
  volante_calefaccionado?: boolean;
  espejos_electricos?: boolean;
  espejos_calefaccionados?: boolean;
  espejos_rebatibles?: boolean;
  vidrios_electricos?: boolean;
  vidrios_electricos_4?: boolean;
  cierre_centralizado?: boolean;
  alarma?: boolean;
  sensor_lluvia?: boolean;
  sensor_crepuscular?: boolean;
  
  // Multimedia
  pantalla_tactil?: boolean;
  tamaño_pantalla?: number;
  apple_carplay?: boolean;
  android_auto?: boolean;
  bluetooth?: boolean;
  usb?: boolean;
  navegador_gps?: boolean;
  sistema_sonido_premium?: boolean;
  cantidad_parlantes?: number;
  
  // Exterior
  faros_led?: boolean;
  faros_xenon?: boolean;
  luces_diurnas?: boolean;
  techo_solar?: boolean;
  techo_panoramico?: boolean;
  barras_techo?: boolean;
  llantas_aleacion?: boolean;
  tamaño_llantas?: number;
  
  // Motor y performance
  motor_tipo?: string;
  turbo?: boolean;
  cilindros?: number;
  valvulas?: number;
  potencia_maxima?: number;
  torque_maximo?: number;
  aceleracion_0_100?: number;
  velocidad_maxima?: number;
  consumo_ciudad?: number;
  consumo_ruta?: number;
  consumo_combinado?: number;
  capacidad_tanque?: number;
  
  // Dimensiones
  largo?: number;
  ancho?: number;
  alto?: number;
  distancia_entre_ejes?: number;
  capacidad_baul?: number;
  peso_vacio?: number;
  capacidad_carga?: number;
  
  createdAt: string;
  updatedAt: string;
}

// Precio de modelo
export interface PrecioModelo {
  id_precio: number;
  id_modelo: number;
  precio: number;
  vigencia_desde: string;
  vigencia_hasta?: string;
  moneda: string;
  observaciones?: string;
  createdAt: string;
  updatedAt: string;
}

// Precio de versión
export interface PrecioVersion {
  id_precio_version: number;
  id_version: number;
  precio: number;
  vigencia_desde: string;
  vigencia_hasta?: string;
  moneda: string;
  observaciones?: string;
  createdAt: string;
  updatedAt: string;
}

// Ventas del modelo
export interface VentasModelo {
  id_venta: number;
  id_modelo: number;
  periodo: string;
  cantidad_vendida: number;
  monto_total?: number;
  observaciones?: string;
  createdAt: string;
  updatedAt: string;
}

// Historial de cambios
export interface ModeloHistorial {
  id_historial: number;
  id_modelo: number;
  campo_modificado: string;
  valor_anterior?: string;
  valor_nuevo?: string;
  usuario_id: number;
  usuario_nombre: string;
  fecha_modificacion: string;
  observaciones?: string;
}

// Estado del modelo para tracking
export interface ModeloEstadoInfo {
  id_estado: number;
  id_modelo: number;
  estado: ModeloEstado;
  etapa: EtapaFlujo;
  fecha_entrada: string;
  fecha_salida?: string;
  usuario_id: number;
  usuario_nombre: string;
  observaciones?: string;
}

// DTOs para API

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface CreateModeloRequest {
  id_marca: number;
  codigoModelo?: string;
  modelo: string;
  precioInicial?: number;
  familia?: string;
  origen?: string;
  combustible?: string;
  año?: number;
  tipo?: string;
  tipo2?: string;
  cc?: number;
  hp?: number;
  traccion?: string;
  caja?: string;
  tipo_caja?: string;
  turbo?: boolean;
  puertas?: number;
  pasajeros?: number;
  tipo_vehiculo?: string;
  segmento?: string;
  categoria?: string;
  importador?: string;
}

export interface UpdateModeloRequest extends Partial<CreateModeloRequest> {
  Estado?: string;
  Observaciones?: string;
}

export interface CambiarEstadoRequest {
  nuevo_estado: ModeloEstado;
  observaciones?: string;
}

export interface ImportFileData {
  marca: string;
  modelo: string;
  familia?: string;
  origen?: string;
  combustible?: string;
  año?: number | string;
  tipo?: string;
  tipo2?: string;
  cc?: number | string;
  hp?: number | string;
  traccion?: string;
  caja?: string;
  tipo_caja?: string;
  turbo?: boolean | string;
  puertas?: number | string;
  pasajeros?: number | string;
  tipo_vehiculo?: string;
  segmento?: string;
  categoria?: string;
  importador?: string;
}

export interface ImportValidationError {
  row: number;
  field: string;
  message: string;
  value?: any;
}

export interface ImportPreviewResult {
  valid: ImportFileData[];
  errors: ImportValidationError[];
  totalRows: number;
  validRows: number;
  errorRows: number;
}

// Filtros para búsqueda
export interface ModeloFilters {
  marcaId?: number;
  estado?: ModeloEstado;
  etapa?: EtapaFlujo;
  anio?: number;
  tipo?: string;
  combustible?: string;
  search?: string;
  responsable?: number;
  fecha_desde?: string;
  fecha_hasta?: string;
}

// Paginación
export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Dashboard stats
export interface DashboardStats {
  total_modelos: number;
  por_estado: Record<ModeloEstado, number>;
  por_etapa: Record<EtapaFlujo, number>;
  pendientes_usuario: number;
  modelos_recientes: Modelo[];
  actividad_reciente: ModeloHistorial[];
}
