import { useState, useEffect } from 'react';
import { Modelo } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@components/ui/Card';
import { MODELO_TEXT_OPTIONS, MODELO_NUMERIC_LIMITS, maskNumericInput } from '@components/equipamiento/equipamientoFieldConfig';

const normalizeTipo = (v?: string): string => {
  if (!v) return '';
  const l = v.toLowerCase().replace(/[^a-z]/g, '');
  if (l.startsWith('autom')) return 'Automóvil';
  if (l.startsWith('com')) return 'Comercial';
  return v;
};

interface FormularioDatosMinimosProp {
  modelo: Modelo;
  onSave?: (data: Partial<Modelo>) => Promise<void>;
  onCancel?: () => void;
  onSendRevision?: (data: Partial<Modelo>) => Promise<void>;
  readonly?: boolean;
  onChange?: (data: Partial<Modelo>) => void;
}

export const FormularioDatosMinimos: React.FC<FormularioDatosMinimosProp> = ({
  modelo,
  onSave,
  onCancel,
  onSendRevision,
  readonly = false,
  onChange
}) => {
  const [formData, setFormData] = useState<Partial<Modelo>>({
    SegmentacionAutodata: modelo.SegmentacionAutodata || '',
    Carroceria: modelo.Carroceria || '',
    OrigenCodigo: modelo.OrigenCodigo || '',
    CombustibleCodigo: modelo.CombustibleCodigo || '',
    Cilindros: modelo.Cilindros ?? undefined,
    Valvulas: modelo.Valvulas ?? undefined,
    CC: modelo.CC ?? undefined,
    HP: modelo.HP ?? undefined,
    TipoCajaAut: modelo.TipoCajaAut || '',
    Tipo: normalizeTipo(modelo.Tipo),
    Puertas: modelo.Puertas || undefined,
    Asientos: modelo.Asientos || undefined,
    TipoMotor: modelo.TipoMotor || '',
    TipoVehiculoElectrico: modelo.TipoVehiculoElectrico || '',
    Importador: modelo.Importador || '',
    PrecioInicial: modelo.PrecioInicial || undefined
  });

  // Campos obligatorios (según el backend)
  const camposObligatorios = [
    'SegmentacionAutodata', 'Carroceria', 'OrigenCodigo', 'Cilindros', 
    'Valvulas', 'CC', 'HP', 'TipoCajaAut', 'Puertas', 'Asientos', 'TipoMotor'
  ];

  // Calcular campos completos
  const camposCompletos = camposObligatorios.filter(campo => {
    const valor = formData[campo as keyof Modelo];
    return valor !== null && valor !== undefined && valor !== '';
  }).length;

  useEffect(() => {
    console.log('📝 FormularioDatosMinimos: Recargando datos del modelo ID:', modelo.ModeloID);
    console.log('📋 Datos del modelo recibidos:', {
      Carroceria: modelo.Carroceria,
      Cilindros: modelo.Cilindros,
      HP: modelo.HP,
      CC: modelo.CC,
      TipoMotor: modelo.TipoMotor,
      Puertas: modelo.Puertas
    });
    
    const newData = {
      SegmentacionAutodata: modelo.SegmentacionAutodata || '',
      Carroceria: modelo.Carroceria || '',
      OrigenCodigo: modelo.OrigenCodigo || '',
      CombustibleCodigo: modelo.CombustibleCodigo || '',
      Cilindros: modelo.Cilindros ?? undefined,
      Valvulas: modelo.Valvulas ?? undefined,
      CC: modelo.CC ?? undefined,
      HP: modelo.HP ?? undefined,
      TipoCajaAut: modelo.TipoCajaAut || '',
      Tipo: normalizeTipo(modelo.Tipo),
      Puertas: modelo.Puertas || undefined,
      Asientos: modelo.Asientos || undefined,
      TipoMotor: modelo.TipoMotor || '',
      TipoVehiculoElectrico: modelo.TipoVehiculoElectrico || '',
      Importador: modelo.Importador || '',
      PrecioInicial: modelo.PrecioInicial || undefined
    };
    
    console.log('✅ FormularioDatosMinimos: Datos procesados para el formulario:', newData);
    setFormData(newData);
    
    // Notificar al padre sobre los datos iniciales
    if (onChange) {
      onChange(newData);
    }
  }, [modelo.ModeloID, modelo.Carroceria, modelo.Cilindros, modelo.HP, modelo.Tipo]); // Depender de campos clave para detectar actualizaciones

  const handleChange = (field: keyof Modelo, value: string | number | undefined) => {
    const newData = { ...formData, [field]: value };
    setFormData(newData);
    // Notificar al padre sobre los cambios
    if (onChange) {
      onChange(newData);
    }
  };

  return (
    <div>
      {/* Indicador de progreso */}
      <div className="mb-4 p-3 bg-blue-50 border border-blue-200 dark:bg-blue-900/20 dark:border-blue-800/50 rounded-lg">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-blue-900 dark:text-blue-200">
            Progreso de Datos Mínimos
          </span>
          <span className="text-sm font-semibold text-blue-700 dark:text-blue-300">
            {camposCompletos} / {camposObligatorios.length} campos obligatorios
          </span>
        </div>
        <div className="w-full bg-blue-200 dark:bg-blue-950/50 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(camposCompletos / camposObligatorios.length) * 100}%` }}
          />
        </div>
        {camposCompletos < camposObligatorios.length ? (
          <p className="text-xs text-blue-700 dark:text-blue-300 mt-2">
            💾 Puedes guardar tu progreso con "Guardar Progreso" y continuar después. Para enviar a revisión necesitas completar los {camposObligatorios.length - camposCompletos} campos restantes.
          </p>
        ) : (
          <p className="text-xs text-green-700 dark:text-green-400 mt-2">
            ✅ Todos los campos obligatorios completados. Ya puedes enviar a revisión.
          </p>
        )}
      </div>

      <form onSubmit={(e) => { e.preventDefault(); if (onSendRevision) onSendRevision(formData); }}>
        <Card>
          <CardHeader>
            <CardTitle>Datos Mínimos del Modelo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
          {/* Sección: Información Básica */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">Información Básica</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Segmento <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.SegmentacionAutodata || ''}
                  onChange={(e) => handleChange('SegmentacionAutodata', e.target.value)}
                  className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                  required
                  disabled={readonly}
                >
                  <option value="">Seleccionar...</option>
                  <option value="ALTA GAMA, DEPORT. y CONVERT.">ALTA GAMA, DEPORT. y CONVERT.</option>
                  <option value="CHICOS">CHICOS</option>
                  <option value="GRANDES">GRANDES</option>
                  <option value="MEDIANOS">MEDIANOS</option>
                  <option value="MEDIANOS COMPACTOS">MEDIANOS COMPACTOS</option>
                  <option value="MONOVOLUMEN">MONOVOLUMEN</option>
                  <option value="P.UP / DC MEDIANOS y GRANDES">P.UP / DC MEDIANOS y GRANDES</option>
                  <option value="P.UP/ DC COMPACTOS">P.UP/ DC COMPACTOS</option>
                  <option value="P.UP/ DC LIVIANOS">P.UP/ DC LIVIANOS</option>
                  <option value="SUV y CROSSOVER">SUV y CROSSOVER</option>
                  <option value="UTILITARIOS COMPACTOS">UTILITARIOS COMPACTOS</option>
                  <option value="UTILITARIOS LIVIANOS">UTILITARIOS LIVIANOS</option>
                  <option value="UTILITARIOS MEDIANOS y GRANDES">UTILITARIOS MEDIANOS y GRANDES</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Carrocería <span className="text-red-500">*</span>
                </label>
                <input
                  list="carrocerias"
                  value={formData.Carroceria || ''}
                  onChange={(e) => handleChange('Carroceria', e.target.value)}
                  className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                  required
                  disabled={readonly}
                  placeholder="Seleccionar o escribir..."
                />
                <datalist id="carrocerias">
                  {MODELO_TEXT_OPTIONS.Carroceria.map(o => <option key={o} value={o} />)}
                </datalist>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Origen <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  maxLength={3}
                  pattern="^[a-zA-Z]{2,3}$"
                  title="2 o 3 letras (ej. URY, BR, MEX)"
                  value={formData.OrigenCodigo || ''}
                  onChange={(e) => handleChange('OrigenCodigo', e.target.value.replace(/[^A-Za-z]/g, '').toUpperCase().substring(0, 3))}
                  className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 uppercase"
                  required
                  disabled={readonly}
                  placeholder="Ej: JPN"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Importador
                </label>
                <input
                  type="text"
                  value={formData.Importador || ''}
                  onChange={(e) => handleChange('Importador', e.target.value)}
                  className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                  disabled={readonly}
                  placeholder="Ej: Inchcape Motors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Precio Inicial
                </label>
                <input
                  type="number"
                  value={formData.PrecioInicial || ''}
                  onChange={(e) => handleChange('PrecioInicial', parseFloat(e.target.value) || undefined)}
                  className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                  disabled={readonly}
                  min="0"
                  step="0.01"
                  placeholder="25000.00"
                />
              </div>
            </div>
          </div>

          {/* Sección: Especificaciones del Motor */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">Motor</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Tipo de Motor <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.TipoMotor || ''}
                  onChange={(e) => handleChange('TipoMotor', e.target.value)}
                  className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                  required
                  disabled={readonly}
                >
                  <option value="">Seleccionar...</option>
                  <option value="NAFTA">NAFTA</option>
                  <option value="DIESEL">DIESEL</option>
                  <option value="BEV">BEV</option>
                  <option value="HEV">HEV</option>
                  <option value="MHEV">MHEV</option>
                  <option value="PHEV">PHEV</option>
                  <option value="EREV">EREV</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Tipo de Vehículo Eléctrico / Híbrido
                </label>
                <select
                  value={formData.TipoVehiculoElectrico || ''}
                  onChange={(e) => handleChange('TipoVehiculoElectrico', e.target.value)}
                  className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                  disabled={readonly}
                >
                  <option value="">Seleccionar...</option>
                  <option value="BEV">BEV</option>
                  <option value="EREV">EREV</option>
                  <option value="HEV">HEV</option>
                  <option value="MHEV">MHEV</option>
                  <option value="PHEV">PHEV</option>
                  <option value="N/A">N/A</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Combustible
                </label>
                <input
                  list="combustibles"
                  value={formData.CombustibleCodigo || ''}
                  onChange={(e) => handleChange('CombustibleCodigo', e.target.value)}
                  className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                  disabled={readonly}
                  placeholder="Seleccionar o escribir..."
                />
                <datalist id="combustibles">
                  <option value="NAFTA" />
                  <option value="DIESEL" />
                  <option value="ELÉCTRICO" />
                  <option value="HÍBRIDO" />
                  <option value="GNC" />
                </datalist>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Cilindros <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={formData.Cilindros ?? ''}
                  onChange={(e) => {
                    const masked = maskNumericInput(e.target.value, MODELO_NUMERIC_LIMITS.Cilindros);
                    handleChange('Cilindros', masked === '' ? undefined : parseInt(masked, 10));
                  }}
                  className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                  required
                  disabled={readonly}
                  placeholder="4"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Válvulas <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={formData.Valvulas ?? ''}
                  onChange={(e) => {
                    const masked = maskNumericInput(e.target.value, MODELO_NUMERIC_LIMITS.Valvulas);
                    handleChange('Valvulas', masked === '' ? undefined : parseInt(masked, 10));
                  }}
                  className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                  required
                  disabled={readonly}
                  placeholder="16"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Cilindrada (CC) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={formData.CC ?? ''}
                  onChange={(e) => {
                    const masked = maskNumericInput(e.target.value, MODELO_NUMERIC_LIMITS.CC);
                    handleChange('CC', masked === '' ? undefined : parseInt(masked, 10));
                  }}
                  className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                  required
                  disabled={readonly}
                  placeholder="1500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Potencia (HP) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={formData.HP || ''}
                  onChange={(e) => {
                    const masked = maskNumericInput(e.target.value, MODELO_NUMERIC_LIMITS.HP);
                    handleChange('HP', masked === '' ? undefined : parseInt(masked, 10));
                  }}
                  className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                  required
                  disabled={readonly}
                  placeholder="150"
                />
              </div>
            </div>
          </div>

          {/* Sección: Transmisión */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">Transmisión</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Tipo de Caja <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.TipoCajaAut || ''}
                  onChange={(e) => handleChange('TipoCajaAut', e.target.value)}
                  className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                  required
                  disabled={readonly}
                >
                  <option value="">Seleccionar...</option>
                  <option value="Automática">Automática</option>
                  <option value="Manual">Manual</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Tipo
                </label>
                <input
                  type="text"
                  value={formData.Tipo || ''}
                  onChange={(e) => handleChange('Tipo', e.target.value)}
                  className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 bg-background text-foreground"
                  disabled={readonly}
                  placeholder="AUTOMOVIL / COMERCIAL"
                />
              </div>

            </div>
          </div>

          {/* Sección: Capacidad */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">Capacidad</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Puertas <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={formData.Puertas || ''}
                  onChange={(e) => {
                    const masked = maskNumericInput(e.target.value, MODELO_NUMERIC_LIMITS.Puertas);
                    handleChange('Puertas', masked === '' ? undefined : parseInt(masked, 10));
                  }}
                  className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                  required
                  disabled={readonly}
                  placeholder="4"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Asientos <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={formData.Asientos || ''}
                  onChange={(e) => {
                    const masked = maskNumericInput(e.target.value, MODELO_NUMERIC_LIMITS.Asientos);
                    handleChange('Asientos', masked === '' ? undefined : parseInt(masked, 10));
                  }}
                  className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                  required
                  disabled={readonly}
                  placeholder="5"
                />
              </div>
              <div className="flex gap-2 justify-end mt-6 border-t pt-4">
                {onSave && (
                  <button
                    type="button"
                    onClick={() => onSave(formData)}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                  >
                    Guardar Progreso
                  </button>
                )}
                {onSendRevision && (
                  <button
                    type="submit"
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Enviar a Revisión
                  </button>
                )}
                {onCancel && (
                  <button
                    type="button"
                    onClick={onCancel}
                    className="px-4 py-2 border border-border rounded-md hover:bg-muted transition-colors"
                  >
                    Cancelar
                  </button>
                )}
              </div>
            </div>
          </div>
        </CardContent>
        </Card>
      </form>
    </div>
  );
};
