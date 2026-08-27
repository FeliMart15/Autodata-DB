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
  CodigoMarca?: string;
  CodigoAutodata?: string;
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
  [key: string]: any;
  EquipamientoID?: number;
  ModeloID?: number;
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
  Traccion?: string;
  Suspension?: string;
  Caja?: string;
  MarchasVelocidades?: string;
  Turbo?: boolean;
  NumeroPuertas?: number;
  Aceite?: string;
  Norma?: string;
  StartStop?: boolean;
  CO2_g_km?: number;
  ConsumoRuta?: number;
  ConsumoUrbano?: number;
  ConsumoMixto?: number;
  GarantiaAnios?: number;
  GarantiaKm?: number;
  GarantiasDiferenciales?: string;
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
  OtrosDatos?: string;
  TiempoCarga?: string;
  CodigoFichaTecnica?: string;
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
  GripControl?: boolean;
  LimitadorVelocidad?: boolean;
  AsistDescensoHDC?: boolean;
  PaddleShift?: boolean;
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
  NumeroAsientos?: number;
  AsientoElectricoCalefMasaje?: string;
  AsientosRango2y3?: string;
  Asiento2Mas1?: boolean;
  ButacaElectrica?: string;
  AsientoVentilado?: boolean;
  AsientosMasajeador?: number;
  ApoyabrazosDelantero?: boolean;
  ApoyabrazosCentralTrasero?: boolean;
  SoporteMusloDelantero?: boolean;
  AsientoTraseroAjusteElectrico?: boolean;
  TerceraFilaAsientosElectricos?: boolean;
  TipoAlturaAsientoDelantero?: string;
  SeatAdjustmentMemoryDriver?: boolean;
  SeatAdjustmentMemoryCoDriver?: boolean;
  LumbarAdjustmentFrontDriver?: boolean;
  LumbarAdjustmentFrontCoDriver?: boolean;
  SeatHeatingRear?: boolean;
  Techo?: string;
  TechoBiTono?: boolean;
  BarrasTecho?: boolean;
  NumeroTechosQueSeAbren?: number;
  SensorEstacionamiento?: string;
  Camara?: string;
  SistemaAutomaticoEstacionamiento?: boolean;
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
  MaleteraAperturaElectrica?: boolean;
  CapacidadBaul?: number;
  CapacidadTanqueCombustible?: number;
  ProtectorCaja?: boolean;
  ParticionCabina?: boolean;
  NumPuertasLaterales?: number;
  PuertaLateralElectrica?: boolean;
  CargaUtil_kg?: number;
  VolumenUtil_m3?: number;
  TipoAlturaUL?: string;
  CapacidadCargaCamiones?: string;
  AlertaTraficoCruzadoTrasero?: boolean;
  AlertaTraficoCruzadoFrontal?: boolean;
  FrenadoMulticolision?: boolean;
  HeadUpDisplay?: boolean;
  CityStop?: boolean;
  FrenoPeatones?: boolean;
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
  CreadoPorID?: number;
  FechaCreacion?: string;
  ModificadoPorID?: number;
  FechaModificacion?: string;
  TIPO2Carrocera?: string;
  ORIGEN?: string;
  COMBUSTIBLE?: string;
  DistEjes?: number;
  Pesoenordendemarcha?: number;
  kghp?: string;
  Neumticos?: number;
  Llantasdealeacin?: boolean;
  Dimetrollantas?: number;
  TPMSMonitoreopresindeneumticos?: boolean;
  Ruedaauxhomogeneo?: boolean;
  Vlvulas?: number;
  HPCV?: number;
  Iny?: string;
  Traccin?: string;
  Suspensin?: string;
  Ndepuertas?: number;
  Consumorutal100km?: number;
  Consumourbanol100km?: number;
  Consumomixtol100km?: number;
  Garantaenaos?: number;
  GarantaenKm?: number;
  Garantasdiferenciales?: boolean;
  TipodeVehiculoElectricoHibrido?: string;
  CapTanqueHidrgeno?: boolean;
  AutonomaMaxRangeenkilometros?: number;
  PotenciamotorKW?: number;
  CapoperativabatBatterycapacityKwh?: number;
  PardelMotortorqueNm?: number;
  PotenciadecargaPotMxKWenCA?: number;
  Tiposdeconectores?: string;
  GarantacapBat?: number;
  TecnologaBatmateriales?: string;
  Sistemadeclimatizacin?: string;
  Direccin?: string;
  Tipodebloqueo?: string;
  KeylessoSmartkey?: boolean;
  Espejoselct?: boolean;
  VolanterevestidoenCuero?: boolean;
  Tablerodigital?: boolean;
  Velcrucero?: boolean;
  Inmobilizador?: boolean;
  SRISistemaderetencininfantil?: string;
  EBDEBVREFDistribucinelectdefrenada?: boolean;
  FrenoEstacionamentoElectricoEPB?: boolean;
  Controltraccin?: boolean;
  Detcambiodefila?: boolean;
  Detpuntociego?: boolean;
  Comandoaudioenvolante?: boolean;
  MirrorScreenSmartphoneDisplay?: boolean;
  SistMultimedia?: string;
  PantMultimedia?: number;
  CargadorSmartphoneconinduccin?: boolean;
  KitHiFiBoseJBLFocal?: boolean;
  Nmerodeasientos?: number;
  AsientoelectCalefMasaje?: boolean;
  asiento21?: boolean;
  ButElectr?: number;
  Barrasdetecho?: boolean;
  Cmara?: string;
  Sistautomticodeestacionamento?: boolean;
  Farosdeneblina?: boolean;
  FaroshalgenosDRLLEDDiurnas?: boolean;
  FarosxenonLimpadores?: boolean;
  PackVisibilidadEncendidoautofaros?: boolean;
  PasodelucesCruzrutaautomtica?: boolean;
  Visinnocturna?: boolean;
  Maleteraaperturaelctrica?: string;
  CapBal?: number;
  CapTanquecombustible?: number;
  Particindecabina?: string;
  NPuertasLat?: string;
  PuertalatElctrica?: string;
  CargatilKg?: number;
  Volumentilm3?: number;
  limitadordevelocidad?: boolean;
  Alertadetrficocruzadotrasero?: boolean;
  Alertadetrficocruzadofrontal?: boolean;
  Frenadomulticolisin?: boolean;
  Apoyabrazodelantero?: boolean;
  Bloqueodiferencialporterreno?: boolean;
  Nmerodetechosqueseabren?: number;
  Asientosconmasajeadornmero?: number;
  AutonomadelmotorelctricoBEVyPHEV?: number;
  Frenodepeatones?: boolean;
  Desempaadorelctrico?: boolean;
  Iluminacinambiental?: boolean;
  Limpialavaparabrisastraseroelct?: boolean;
  Apoyabrazocentraldeasientotrasero?: boolean;
  Soporteparamuslodelantero?: boolean;
  Asientotraseroconajusteelctrico?: boolean;
  C_3raFiladeasientoselctricos?: boolean;
  Volantemultifuncin?: boolean;
  Tablerodigital3D?: boolean;
  Cargaelectricaporwireless?: boolean;
  Cargaelectricaporinduccion?: boolean;
  Direccionenlascuatroruedas?: boolean;
  LucestrasOLED?: boolean;
  Deflectordeviento?: boolean;
  LumbarLumbaradjustmentfrontDriver?: boolean;
  LumbarLumbaradjustmentfrontCoDriver?: boolean;
  Precioafechadecarga?: number;
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
