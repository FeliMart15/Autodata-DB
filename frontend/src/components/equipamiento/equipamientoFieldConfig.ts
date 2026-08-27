// Configuración de campos derivada de CONFIGURACION VEHICULOS.xlsx (revisada y confirmada
// campo por campo con el usuario). Define qué campos de texto sugieren opciones (pero siempre
// aceptan texto libre) y qué límites de dígitos/decimales aplican a los campos numéricos.

// --- Equipamiento: campos de texto con opciones sugeridas (input libre + datalist) ---
export const EQUIP_TEXT_OPTIONS: Record<string, string[]> = {
  RuedaAuxHomogenea: ['Si', 'No', 'No tiene'],
  Inyeccion: ['Directa', 'Common Rail', 'Electrónica', 'Multipunto'],
  Traccion: ['4x2', '4x4'],
  Suspension: ['McPherson /Multilink', 'Independiente', 'Independiente/barra de torsión', 'McPherson/barra estabilizadora', 'Neumática', 'Dejar opción para escribir otras diferentes'],
  Caja: ['DCT', 'DHT', 'CVT', 'e-CVT', 'Convertidor de par', 'AMT', 'Dejar opción para escribir otras diferentes'],
  CicloNorma: ['NEDC', 'WLTP', 'Dejar opción para escribir otras diferentes'],
  TiposConectores: ['Tipo 2', 'CCS2', 'Dejar opción para escribir otras diferentes'],
  TecnologiaBat: ['Ion litio', 'LFP (litio-ferro-fosfato)', 'NCM (níquel-cobalto-manganeso)', 'Plomo', 'Gel'],
  SistemaClimatizacion: ['No', 'Aire acondicionado', 'Aire acondicionado con salida trasera', 'Climatizador', 'Climatizador con salida trasera', 'Climatizador bi zona', 'Climatizador bi zona con salida trasera', 'Climatizador tri zona'],
  Direccion: ['Dirección Asistida', 'Dirección electroasistida'],
  TipoBloqueo: ['Bloqueo central', 'Bloqueo a distancia', 'Bloqueo con Smartphone', 'No'],
  LevantaVidrios: ['Manual', 'Eléctricos x 2', 'Eléctricos x 4', 'Eléctricos x 3'],
  Tapizado: ['Textil', 'Cuero', 'Simil cuero (CUIR)', 'Mixto (tela y  simil cuero)', 'Mixto (tela y  cuero)', 'Alcantara'],
  VelocidadCrucero: ['Si', 'No', 'Adaptativo'],
  ABAG: ['2', '4', '6', '7', '8', '10', '12', 'No'],
  SRI: ['No', 'ISOFIX', 'LATCH', 'ISOFIX Y TOP TETHER', 'ISOFIX Y LATCH'],
  DiscosFrenos: ['2', '4'],
  SistemaMultimedia: ['Composition Media', 'Full Link', 'Media Nav', 'Media Sistem', 'Mirror Link', 'Touch Infotainment', 'Nissan door-to-door', 'R-Link Evolution'],
  AsientoElectricoCalefMasaje: ['Si', 'No', 'Elect. + Calef', 'Calef'],
  Techo: ['Techo Panorámico', 'Techo corredizo manual', 'Techo corredizo eléctrico', 'Lona plegable', 'Rígido / Lona plegable', 'No'],
  SensorEstacionamiento: ['Trasero', 'Trasero y delantero', 'No'],
  Camara: ['Trasera', 'Trasera y delantera', 'Trasera y lateral', '360°', 'No', '540°'],
  MaleteraAperturaElectrica: ['Motorizada', 'Foot-control', 'No'],
};

// --- Equipamiento: límites numéricos (solo columnas realmente numéricas en la base).
// maxDigits = cantidad máxima de dígitos ENTEROS (undefined = sin límite declarado en el Excel).
// decimals = decimales que admite la columna (0 = entero).
export interface NumericLimit { maxDigits?: number; decimals: number; suggestions?: string[]; }

export const EQUIP_NUMERIC_LIMITS: Record<string, NumericLimit> = {
  Largo: { maxDigits: 4, decimals: 0 },
  Ancho: { maxDigits: 4, decimals: 0 },
  Altura: { maxDigits: 4, decimals: 0 },
  DistanciaEjes: { maxDigits: 4, decimals: 0 },
  PesoOrdenMarcha: { maxDigits: 4, decimals: 0 },
  DiametroLlantas: { maxDigits: 2, decimals: 1 },
  CO2_g_km: { decimals: 2 },
  ConsumoRuta: { decimals: 2 },
  ConsumoUrbano: { decimals: 2 },
  ConsumoMixto: { decimals: 2 },
  GarantiaAnios: { decimals: 0 },
  GarantiaKm: { decimals: 0 },
  ParMotorTorque: { decimals: 0 },
  PantallaMultimediaPulgadas: { decimals: 1 },
  CapacidadBaul: { decimals: 0 },
  CapacidadTanqueCombustible: { decimals: 0 },
  CargaUtil_kg: { decimals: 0 },
  VolumenUtil_m3: { decimals: 2 },
  NumeroTechosQueSeAbren: { decimals: 0 },
  AsientosMasajeador: { decimals: 0 },
  AutonomiaMotorElectricoBEVPHEV: { decimals: 0 },
  AceleracionBEV_0a100: { decimals: 2 },
  AccelerationICE: { decimals: 2 },
  NumPuertasLaterales: { decimals: 0, suggestions: ['1', '2'] },
};

// --- Datos Mínimos (tabla Modelo): mismos tratamientos, distinto formulario ---
export const MODELO_TEXT_OPTIONS: Record<string, string[]> = {
  Carroceria: ['BOX', 'Cab. Extendida', 'Cabrio', 'CAMION', 'Chasis Cab.', 'City Car', 'Coupé', 'DC', 'FURGON', 'Hatch', 'Minibus', 'Omnibus', 'PUP', 'Rural', 'Sedán', 'SUV'],
};

export const MODELO_NUMERIC_LIMITS: Record<string, NumericLimit> = {
  CC: { maxDigits: 4, decimals: 0 },
  HP: { maxDigits: 4, decimals: 0 },
  Cilindros: { maxDigits: 2, decimals: 0 },
  Valvulas: { maxDigits: 2, decimals: 0 },
  Puertas: { decimals: 0 },
  Asientos: { decimals: 0 },
};

// Campos de texto que se fuerzan a mayúsculas al escribir (Origen ya lo tenía; Norma se suma).
export const UPPERCASE_EQUIP_FIELDS = new Set(['Norma']);

/**
 * Trunca un valor numérico en vivo mientras se escribe, en vez de rechazar al guardar.
 * Ej: maxDigits=4 y el usuario escribe "44444" -> se queda en "4444".
 * Deja pasar un "." final mientras se tipea para no trabar la edición de decimales.
 */
export function maskNumericInput(raw: string, limit: NumericLimit): string {
  let cleaned = raw.replace(/[^0-9.]/g, '');
  const firstDot = cleaned.indexOf('.');
  if (firstDot !== -1) {
    cleaned = cleaned.slice(0, firstDot + 1) + cleaned.slice(firstDot + 1).replace(/\./g, '');
  }
  if (limit.decimals === 0) {
    cleaned = cleaned.replace('.', '');
  }
  const [intPartRaw, decPart] = cleaned.split('.');
  const intPart = limit.maxDigits ? intPartRaw.slice(0, limit.maxDigits) : intPartRaw;
  if (decPart !== undefined) {
    return `${intPart}.${decPart.slice(0, limit.decimals)}`;
  }
  return intPart;
}
