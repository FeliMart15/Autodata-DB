const fs = require('fs');
let txt = fs.readFileSync('src/types/index.ts', 'utf8');

const regex = /export interface Modelo \{[\s\S]*?marca\?\:\s*Marca;\n\}/;

const replacement = `export interface Modelo {
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
  Estado: string | ModeloEstado;
  EstadoID?: number;
  Activo?: boolean;
  FechaCreacion?: string;
  MarcaNombre?: string; // From join
  marca?: any;
  UltimoComentario?: string;
  ObservacionesRevision?: string;
  Etapa?: number;
  etapa?: number;
  estado?: string | ModeloEstado;
  CodigoAutodata?: string;
  id_modelo?: number;
}`;

txt = txt.replace(regex, replacement);
fs.writeFileSync('src/types/index.ts', txt);
console.log('done fixing type Modelo', txt.includes('TipoMotor'));
