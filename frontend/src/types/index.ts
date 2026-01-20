// Estado de los modelos en el flujo de trabajo - NUEVO SISTEMA
export enum ModeloEstado {
  // Fase 1: Importación/Creación
  IMPORTADO = 'importado',
  CREADO = 'creado',
  
  // Fase 2: Datos Mínimos
  DATOS_MINIMOS = 'datos_minimos',
  REVISION_MINIMOS = 'revision_minimos',
  CORREGIR_MINIMOS = 'corregir_minimos',
  MINIMOS_APROBADOS = 'minimos_aprobados',
  
  // Fase 3: Equipamiento
  EQUIPAMIENTO_CARGADO = 'equipamiento_cargado',
  REVISION_EQUIPAMIENTO = 'revision_equipamiento',
  CORREGIR_EQUIPAMIENTO = 'corregir_equipamiento',
  
  // Estado Final
  DEFINITIVO = 'definitivo',
  
  // Estados antiguos (mantener por compatibilidad)
  REQUISITOS_MINIMOS = 'requisitos_minimos',
  EN_REVISION = 'en_revision',
  PARA_CORREGIR = 'para_corregir',
  EN_APROBACION = 'en_aprobacion',
  EQUIPAMIENTO_CARGADO_OLD = 'equipamiento_cargado',
}

// Etapas del flujo
export enum EtapaFlujo {
  IMPORTACION = 1,
  DATOS_MINIMOS = 2,
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
  MarcaID?: number;       // Backend uses PascalCase
  CodigoMarca?: string;   // 4 dígitos
  Descripcion?: string;   // Backend field
}

// Modelo (entidad principal) - Backend response uses PascalCase matching DB columns
export interface Modelo {
  ModeloID: number;
  MarcaID: number;
  CodigoModelo?: string;         // 4 dígitos
  CodigoAutodata?: string;       // 8 dígitos (CodigoMarca + CodigoModelo)
  CodigoMarca?: string;          // 4 dígitos (from JOIN with Marca)
  DescripcionModelo?: string;
  Modelo?: string; // Alias for DescripcionModelo
  
  // Datos de Carga (del CSV)
  Familia?: string;
  OrigenCodigo?: string;
  CombustibleCodigo?: string;
  CategoriaCodigo?: string;
  
  // Datos Mínimos (16 campos obligatorios)
  Segmento?: string;
  Modelo1?: string;              // Nombre del modelo
  Tipo2_Carroceria?: string;
  Origen?: string;
  Combustible?: string;
  Cilindros?: number;
  Valvulas?: number;
  CC?: number;                   // Cilindrada
  HP?: number;
  TipoCajaAut?: string;
  Puertas?: number;
  Asientos?: number;
  TipoMotor?: string;
  TipoVehiculoElectrico?: string;
  Importador?: string;
  PrecioInicial?: number;
  
  // Otros campos técnicos
  ShortName?: string;
  Precio0KMInicial?: number;
  Anio?: number;
  Tipo?: string;
  Tipo2?: string;
  Traccion?: string;
  Caja?: string;
  TipoCaja?: string;
  Turbo?: boolean;
  Pasajeros?: number;
  TipoVehiculo?: string;
  
  // Segmentaciones
  SegmentacionAutodata?: string;
  SegmentacionGM?: string;
  SegmentacionAudi?: string;
  SegmentacionSBI?: string;
  SegmentacionCitroen?: string;
  
  // Control de Flujo
  Estado: string;
  EstadoID?: number;
  ObservacionesRevision?: string;
  UltimoComentario?: string; // Alias de ObservacionesRevision
  
  // Auditoría
  CreadoPorID?: number;
  FechaCreacion: string;
  ModificadoPorID?: number;
  FechaModificacion?: string;
  Activo: boolean;
  
  // Relaciones
  MarcaNombre?: string; // From join
  marca?: Marca;
  equipamiento?: EquipamientoModelo;
  versiones?: VersionModelo[];
  
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

// Equipamiento del modelo - 150+ campos
export interface EquipamientoModelo {
  EquipamientoID: number;
  ModeloID: number;
  
  // DIMENSIONES Y DATOS TÉCNICOS (15 campos)
  Largo?: number;
  Ancho?: number;
  Altura?: number;
  DistanciaEjes?: number;
  PesoOrdenMarcha?: number;
  KgPorHP?: number;
  Neumaticos?: string;
  LlantasAleacion?: boolean;
  DiametroLlantas?: number;
  TPMS?: boolean;
  KitInflableAntiPinchazo?: boolean;
  RuedaAuxHomogenea?: boolean;
  Cilindros?: number;
  Valvulas?: number;
  Inyeccion?: string;
  
  // MECÁNICA (9 campos)
  Traccion?: string;
  Suspension?: string;
  Caja?: string;
  MarchasVelocidades?: string;
  Turbo?: boolean;
  NumeroPuertas?: number;
  Aceite?: string;
  Norma?: string;
  StartStop?: boolean;
  
  // CONSUMO Y EMISIONES (4 campos)
  CO2_g_km?: number;
  ConsumoRuta?: number;
  ConsumoUrbano?: number;
  ConsumoMixto?: number;
  
  // GARANTÍA (3 campos)
  GarantiaAnios?: number;
  GarantiaKm?: number;
  GarantiasDiferenciales?: string;
  
  // VEHÍCULOS ELÉCTRICOS/HÍBRIDOS (12 campos)
  TipoVehiculoElectrico?: string;
  EPedal?: boolean;
  CapacidadTanqueHidrogeno?: number;
  AutonomiaMaxRange?: number;
  CicloNorma?: string;
  PotenciaMotor?: number;
  CapacidadOperativaBateria?: number;
  ParMotorTorque?: number;
  PotenciaCargaMax?: number;
  TiposConectores?: string;
  GarantiaCapBat?: string;
  TecnologiaBat?: string;
  
  // OTROS DATOS (3 campos)
  OtrosDatos?: string;
  TiempoCarga?: string;
  CodigoFichaTecnica?: string;
  
  // CONFORT E INTERIOR (15 campos)
  SistemaClimatizacion?: string;
  Direccion?: string;
  TipoBloqueo?: string;
  KeylessSmartKey?: boolean;
  LevantaVidrios?: string;
  EspejosElectricos?: boolean;
  EspejoInteriorElectrocromado?: boolean;
  EspejosAbatiblesElectricamente?: boolean;
  Tapizado?: string;
  VolanteRevestidoCuero?: boolean;
  TablerDigital?: boolean;
  Computadora?: boolean;
  GPS?: boolean;
  VelocidadCrucero?: boolean;
  Inmovilizador?: boolean;
  
  // SEGURIDAD (16 campos)
  Alarma?: boolean;
  ABAG?: boolean;
  SRI?: boolean;
  ABS?: boolean;
  EBD_EBV_REF?: boolean;
  DiscosFrenos?: string;
  FrenoEstacionamientoElectrico?: boolean;
  ESP_ControlEstabilidad?: boolean;
  ControlTraccion?: boolean;
  AsistFrenadoDetectorDistancia?: boolean;
  AsistPendiente?: boolean;
  DetectorCambioFila?: boolean;
  DetectorPuntoCiego?: boolean;
  TrafficSignRecognition?: boolean;
  DriverAttentionControl?: boolean;
  DetectorLluvia?: boolean;
  
  // CONTROL Y ASISTENCIA (4 campos)
  GripControl?: boolean;
  LimitadorVelocidad?: boolean;
  AsistDescensoHDC?: boolean;
  PaddleShift?: boolean;
  
  // MULTIMEDIA (13 campos)
  ComandoAudioVolante?: boolean;
  CD?: boolean;
  MP3?: boolean;
  USB?: boolean;
  Bluetooth?: boolean;
  DVD?: boolean;
  MirrorScreen?: boolean;
  SistemaMultimedia?: string;
  PantallaMultimediaPulgadas?: number;
  PantallaTactil?: boolean;
  CargadorSmartphoneInduccion?: boolean;
  KitHiFi?: string;
  Radio?: boolean;
  
  // ASIENTOS (10 campos)
  NumeroAsientos?: number;
  AsientoElectricoCalefMasaje?: boolean;
  AsientosRango2y3?: string;
  Asiento2Mas1?: boolean;
  ButacaElectrica?: boolean;
  AsientoVentilado?: boolean;
  AsientosMasajeador?: number;
  ApoyabrazosDelantero?: boolean;
  ApoyabrazosCentralTrasero?: boolean;
  SoporteMusloDelantero?: boolean;
  
  // AJUSTES DE ASIENTOS (8 campos)
  AsientoTraseroAjusteElectrico?: boolean;
  TerceraFilaAsientosElectricos?: boolean;
  TipoAlturaAsientoDelantero?: string;
  SeatAdjustmentMemoryDriver?: boolean;
  SeatAdjustmentMemoryCoDriver?: boolean;
  LumbarAdjustmentFrontDriver?: boolean;
  LumbarAdjustmentFrontCoDriver?: boolean;
  SeatHeatingRear?: boolean;
  
  // TECHO (4 campos)
  Techo?: string;
  TechoBiTono?: boolean;
  BarrasTecho?: boolean;
  NumeroTechosQueSeAbren?: number;
  
  // SENSORES Y CÁMARAS (3 campos)
  SensorEstacionamiento?: string;
  Camara?: string;
  SistemaAutomaticoEstacionamiento?: boolean;
  
  // ILUMINACIÓN (11 campos)
  FarosNeblina?: boolean;
  FarosDireccionales?: boolean;
  FarosFullLED?: boolean;
  FarosHalogenosDRL_LED?: boolean;
  FarosXenonLimpiadores?: boolean;
  PackVisibilidad?: boolean;
  PasoLucesCruzRutaAutomatica?: boolean;
  VisionNocturna?: boolean;
  FarosMatrix?: boolean;
  LucesTraserasLED?: boolean;
  LucesTraserasOLED?: boolean;
  
  // MALETERO Y CARGA (7 campos)
  MaleteraAperturaElectrica?: boolean;
  CapacidadBaul?: number;
  CapacidadTanqueCombustible?: number;
  ProtectorCaja?: boolean;
  ParticionCabina?: boolean;
  NumPuertasLaterales?: number;
  PuertaLateralElectrica?: boolean;
  
  // CARGA (4 campos)
  CargaUtil_kg?: number;
  VolumenUtil_m3?: number;
  TipoAlturaUL?: string;
  CapacidadCargaCamiones?: string;
  
  // SEGURIDAD AVANZADA (6 campos)
  AlertaTraficoCruzadoTrasero?: boolean;
  AlertaTraficoCruzadoFrontal?: boolean;
  FrenadoMulticolision?: boolean;
  HeadUpDisplay?: boolean;
  CityStop?: boolean;
  FrenoPeatones?: boolean;
  
  // OTROS EQUIPAMIENTO (21 campos)
  BloqueDiferencialTerreno?: string;
  DesempaniadorElectrico?: boolean;
  IluminacionAmbiental?: boolean;
  LimpiaLavaParabrisasTrasero?: boolean;
  BlackWheelFrame?: boolean;
  VolanteMultifuncion?: boolean;
  TablerDigital3D?: boolean;
  AceleracionBEV_0a100?: number;
  AccelerationICE?: number;
  CargaElectricaWireless?: boolean;
  CargaElectricaInduccion?: boolean;
  CableElectricoTipo3Incluido?: boolean;
  ChassisDriveSelect?: boolean;
  ChassisSportSuspension?: boolean;
  DireccionCuatroRuedas?: boolean;
  LucesLaser?: boolean;
  DashboardDisplayConfigurable?: boolean;
  WirelessSmartphoneIntegration?: boolean;
  MobilePhoneAntenna?: boolean;
  DeflectorViento?: boolean;
  AsientosDeportivos?: boolean;
  
  // Auditoría
  CreadoPorID?: number;
  FechaCreacion?: string;
  ModificadoPorID?: number;
  FechaModificacion?: string;
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
  modelo: string;
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
