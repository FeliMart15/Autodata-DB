import { useState, useEffect } from 'react';
import { Modelo } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@components/ui/Card';

interface FormularioDatosMinimosProp {
  modelo: Modelo;
  onSave?: (data: Partial<Modelo>) => Promise<void>;
  onCancel?: () => void;
  readonly?: boolean;
  onChange?: (data: Partial<Modelo>) => void;
}

export const FormularioDatosMinimos: React.FC<FormularioDatosMinimosProp> = ({ 
  modelo,
  readonly = false,
  onChange
}) => {
  const [formData, setFormData] = useState<Partial<Modelo>>({
    SegmentacionAutodata: modelo.SegmentacionAutodata || '',
    Modelo1: modelo.Modelo1 || '',
    Tipo2_Carroceria: modelo.Tipo2_Carroceria || '',
    OrigenCodigo: modelo.OrigenCodigo || '',
    Cilindros: modelo.Cilindros || undefined,
    Valvulas: modelo.Valvulas || undefined,
    CC: modelo.CC || undefined,
    HP: modelo.HP || undefined,
    TipoCajaAut: modelo.TipoCajaAut || '',
    Puertas: modelo.Puertas || undefined,
    Asientos: modelo.Asientos || undefined,
    TipoMotor: modelo.TipoMotor || '',
    TipoVehiculoElectrico: modelo.TipoVehiculoElectrico || '',
    Importador: modelo.Importador || '',
    PrecioInicial: modelo.PrecioInicial || undefined
  });

  useEffect(() => {
    const newData = {
      SegmentacionAutodata: modelo.SegmentacionAutodata || '',
      Modelo1: modelo.Modelo1 || '',
      Tipo2_Carroceria: modelo.Tipo2_Carroceria || '',
      OrigenCodigo: modelo.OrigenCodigo || '',
      Cilindros: modelo.Cilindros || undefined,
      Valvulas: modelo.Valvulas || undefined,
      CC: modelo.CC || undefined,
      HP: modelo.HP || undefined,
      TipoCajaAut: modelo.TipoCajaAut || '',
      Puertas: modelo.Puertas || undefined,
      Asientos: modelo.Asientos || undefined,
      TipoMotor: modelo.TipoMotor || '',
      TipoVehiculoElectrico: modelo.TipoVehiculoElectrico || '',
      Importador: modelo.Importador || '',
      PrecioInicial: modelo.PrecioInicial || undefined
    };
    setFormData(newData);
    // Notificar al padre sobre los datos iniciales
    if (onChange) {
      onChange(newData);
    }
  }, [modelo]);

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
                <input
                  type="text"
                  value={formData.SegmentacionAutodata || ''}
                  onChange={(e) => handleChange('SegmentacionAutodata', e.target.value)}
                  className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                  required
                  disabled={readonly}
                  placeholder="Ej: C-Segment"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Modelo 1 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.Modelo1 || ''}
                  onChange={(e) => handleChange('Modelo1', e.target.value)}
                  className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                  required
                  disabled={readonly}
                  placeholder="Ej: Corolla XEI"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Tipo 2 - Carrocería <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.Tipo2_Carroceria || ''}
                  onChange={(e) => handleChange('Tipo2_Carroceria', e.target.value)}
                  className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                  required
                  disabled={readonly}
                >
                  <option value="">Seleccionar...</option>
                  <option value="Sedan">Sedán</option>
                  <option value="SUV">SUV</option>
                  <option value="Hatchback">Hatchback</option>
                  <option value="Pickup">Pick-up</option>
                  <option value="Coupe">Coupé</option>
                  <option value="Wagon">Wagon</option>
                  <option value="Convertible">Convertible</option>
                  <option value="Van">Van</option>
                  <option value="Minivan">Minivan</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Origen <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.OrigenCodigo || ''}
                  onChange={(e) => handleChange('OrigenCodigo', e.target.value)}
                  className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                  required
                  disabled={readonly}
                >
                  <option value="">Seleccionar...</option>
                  <option value="Japones">Japonés</option>
                  <option value="Americano">Americano</option>
                  <option value="Europeo">Europeo</option>
                  <option value="Coreano">Coreano</option>
                  <option value="Chino">Chino</option>
                  <option value="Otro">Otro</option>
                </select>
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
                  <option value="Aspirado">Aspirado</option>
                  <option value="Turbo">Turbo</option>
                  <option value="Supercharger">Supercharger</option>
                  <option value="Electrico">Eléctrico</option>
                  <option value="Hibrido">Híbrido</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Tipo de Vehículo Eléctrico
                </label>
                <input
                  type="text"
                  value={formData.TipoVehiculoElectrico || ''}
                  onChange={(e) => handleChange('TipoVehiculoElectrico', e.target.value)}
                  className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                  disabled={readonly}
                  placeholder="Ej: BEV, PHEV, HEV"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Cilindros <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={formData.Cilindros || ''}
                  onChange={(e) => handleChange('Cilindros', parseInt(e.target.value) || undefined)}
                  className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                  required
                  disabled={readonly}
                  min="0"
                  max="16"
                  placeholder="4"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Válvulas <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={formData.Valvulas || ''}
                  onChange={(e) => handleChange('Valvulas', parseInt(e.target.value) || undefined)}
                  className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                  required
                  disabled={readonly}
                  min="0"
                  max="64"
                  placeholder="16"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Cilindrada (CC) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={formData.CC || ''}
                  onChange={(e) => handleChange('CC', parseInt(e.target.value) || undefined)}
                  className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                  required
                  disabled={readonly}
                  min="0"
                  placeholder="1500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Potencia (HP) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={formData.HP || ''}
                  onChange={(e) => handleChange('HP', parseFloat(e.target.value) || undefined)}
                  className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                  required
                  disabled={readonly}
                  min="0"
                  step="0.1"
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
                  Tipo de Caja Aut. <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.TipoCajaAut || ''}
                  onChange={(e) => handleChange('TipoCajaAut', e.target.value)}
                  className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                  required
                  disabled={readonly}
                  placeholder="Ej: 6AT, CVT, 7DCT, Manual"
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
                  type="number"
                  value={formData.Puertas || ''}
                  onChange={(e) => handleChange('Puertas', parseInt(e.target.value) || undefined)}
                  className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                  required
                  disabled={readonly}
                  min="2"
                  max="6"
                  placeholder="4"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Asientos <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={formData.Asientos || ''}
                  onChange={(e) => handleChange('Asientos', parseInt(e.target.value) || undefined)}
                  className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                  required
                  disabled={readonly}
                  min="1"
                  max="50"
                  placeholder="5"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
