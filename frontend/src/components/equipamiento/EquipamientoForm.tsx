import {  useEffect, useState  } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@components/ui/Card';
import { Checkbox } from '@components/ui/Checkbox';
import { Button } from '@components/ui/Button';
import { Input } from '@components/ui/Input';
import { Alert } from '@components/ui/Alert';
import { LoadingSpinner } from '@components/ui/LoadingSpinner';
import { equipamientoService } from '@services/equipamientoService';
import { EquipamientoModelo } from '@/types/index';
import { Save, CheckSquare, Square } from 'lucide-react';
import { useToast } from '@context/ToastContext';

interface EquipamientoFormProps {
  modeloId: number;
  onUpdate: () => void;
  readOnly?: boolean;
}

interface EquipamientoCategory {
  title: string;
  fields: Array<{
    key: keyof EquipamientoModelo;
    label: string;
    type?: 'boolean' | 'number' | 'text';
  }>;
}

const EQUIPAMIENTO_CATEGORIES: EquipamientoCategory[] = [
  {
    title: 'Seguridad',
    fields: [
      { key: 'airbag_conductor', label: 'Airbag Conductor' },
      { key: 'airbag_acompanante', label: 'Airbag Acompañante' },
      { key: 'airbag_lateral', label: 'Airbag Lateral' },
      { key: 'airbag_cortina', label: 'Airbag de Cortina' },
      { key: 'abs', label: 'ABS' },
      { key: 'esp', label: 'ESP' },
      { key: 'control_traccion', label: 'Control de Tracción' },
      { key: 'asistente_arranque', label: 'Asistente de Arranque' },
      { key: 'camara_retroceso', label: 'Cámara de Retroceso' },
      { key: 'sensores_estacionamiento', label: 'Sensores de Estacionamiento' },
      { key: 'freno_automatico_emergencia', label: 'Freno Automático de Emergencia' },
      { key: 'alerta_cambio_carril', label: 'Alerta de Cambio de Carril' },
      { key: 'control_punto_ciego', label: 'Control de Punto Ciego' },
      { key: 'isofix', label: 'ISOFIX' },
    ],
  },
  {
    title: 'Confort',
    fields: [
      { key: 'aire_acondicionado', label: 'Aire Acondicionado' },
      { key: 'climatizador', label: 'Climatizador' },
      { key: 'climatizador_bizona', label: 'Climatizador Bizona' },
      { key: 'asientos_cuero', label: 'Asientos de Cuero' },
      { key: 'asientos_calefaccionados', label: 'Asientos Calefaccionados' },
      { key: 'asientos_ventilados', label: 'Asientos Ventilados' },
      { key: 'asiento_conductor_electrico', label: 'Asiento Conductor Eléctrico' },
      { key: 'volante_regulable_altura', label: 'Volante Regulable en Altura' },
      { key: 'volante_regulable_profundidad', label: 'Volante Regulable en Profundidad' },
      { key: 'volante_calefaccionado', label: 'Volante Calefaccionado' },
      { key: 'espejos_electricos', label: 'Espejos Eléctricos' },
      { key: 'espejos_calefaccionados', label: 'Espejos Calefaccionados' },
      { key: 'espejos_rebatibles', label: 'Espejos Rebatibles' },
      { key: 'vidrios_electricos', label: 'Vidrios Eléctricos' },
      { key: 'vidrios_electricos_4', label: 'Vidrios Eléctricos 4 Puertas' },
      { key: 'cierre_centralizado', label: 'Cierre Centralizado' },
      { key: 'alarma', label: 'Alarma' },
      { key: 'sensor_lluvia', label: 'Sensor de Lluvia' },
      { key: 'sensor_crepuscular', label: 'Sensor Crepuscular' },
    ],
  },
  {
    title: 'Multimedia',
    fields: [
      { key: 'pantalla_tactil', label: 'Pantalla Táctil' },
      { key: 'tamaño_pantalla', label: 'Tamaño de Pantalla (pulgadas)', type: 'number' },
      { key: 'apple_carplay', label: 'Apple CarPlay' },
      { key: 'android_auto', label: 'Android Auto' },
      { key: 'bluetooth', label: 'Bluetooth' },
      { key: 'usb', label: 'USB' },
      { key: 'navegador_gps', label: 'Navegador GPS' },
      { key: 'sistema_sonido_premium', label: 'Sistema de Sonido Premium' },
      { key: 'cantidad_parlantes', label: 'Cantidad de Parlantes', type: 'number' },
    ],
  },
  {
    title: 'Exterior',
    fields: [
      { key: 'faros_led', label: 'Faros LED' },
      { key: 'faros_xenon', label: 'Faros Xenón' },
      { key: 'luces_diurnas', label: 'Luces Diurnas' },
      { key: 'techo_solar', label: 'Techo Solar' },
      { key: 'techo_panoramico', label: 'Techo Panorámico' },
      { key: 'barras_techo', label: 'Barras de Techo' },
      { key: 'llantas_aleacion', label: 'Llantas de Aleación' },
      { key: 'tamaño_llantas', label: 'Tamaño de Llantas (pulgadas)', type: 'number' },
    ],
  },
  {
    title: 'Motor y Performance',
    fields: [
      { key: 'motor_tipo', label: 'Tipo de Motor', type: 'text' },
      { key: 'turbo', label: 'Turbo' },
      { key: 'cilindros', label: 'Cilindros', type: 'number' },
      { key: 'valvulas', label: 'Válvulas', type: 'number' },
      { key: 'potencia_maxima', label: 'Potencia Máxima (HP)', type: 'number' },
      { key: 'torque_maximo', label: 'Torque Máximo (Nm)', type: 'number' },
      { key: 'aceleracion_0_100', label: 'Aceleración 0-100 km/h (seg)', type: 'number' },
      { key: 'velocidad_maxima', label: 'Velocidad Máxima (km/h)', type: 'number' },
      { key: 'consumo_ciudad', label: 'Consumo Ciudad (l/100km)', type: 'number' },
      { key: 'consumo_ruta', label: 'Consumo Ruta (l/100km)', type: 'number' },
      { key: 'consumo_combinado', label: 'Consumo Combinado (l/100km)', type: 'number' },
      { key: 'capacidad_tanque', label: 'Capacidad Tanque (litros)', type: 'number' },
    ],
  },
  {
    title: 'Dimensiones',
    fields: [
      { key: 'largo', label: 'Largo (mm)', type: 'number' },
      { key: 'ancho', label: 'Ancho (mm)', type: 'number' },
      { key: 'alto', label: 'Alto (mm)', type: 'number' },
      { key: 'distancia_entre_ejes', label: 'Distancia entre Ejes (mm)', type: 'number' },
      { key: 'capacidad_baul', label: 'Capacidad de Baúl (litros)', type: 'number' },
      { key: 'peso_vacio', label: 'Peso en Vacío (kg)', type: 'number' },
      { key: 'capacidad_carga', label: 'Capacidad de Carga (kg)', type: 'number' },
    ],
  },
];

export function EquipamientoForm({ modeloId, onUpdate, readOnly = false }: EquipamientoFormProps) {
  const [equipamiento, setEquipamiento] = useState<Partial<EquipamientoModelo>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const { addToast } = useToast();

  useEffect(() => {
    loadEquipamiento();
  }, [modeloId]);

  const loadEquipamiento = async () => {
    try {
      const data = await equipamientoService.getByModeloId(modeloId);
      if (data) {
        setEquipamiento(data);
      }
    } catch (error) {
      console.error('Error loading equipamiento:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (key: keyof EquipamientoModelo, value: any) => {
    setEquipamiento((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      if (equipamiento.id_equipamiento) {
        await equipamientoService.update(modeloId, equipamiento);
      } else {
        await equipamientoService.create({ ...equipamiento, id_modelo: modeloId });
      }
      addToast('Equipamiento guardado correctamente', 'success');
      onUpdate();
      loadEquipamiento();
    } catch (error: any) {
      addToast(error.response?.data?.message || 'Error al guardar equipamiento', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleCategory = (category: EquipamientoCategory, selectAll: boolean) => {
    const updates: Partial<EquipamientoModelo> = {};
    category.fields.forEach((field) => {
      if (field.type !== 'number' && field.type !== 'text') {
        updates[field.key] = selectAll ? 1 : 0;
      }
    });
    setEquipamiento((prev) => ({ ...prev, ...updates }));
  };

  const filteredCategories = searchTerm
    ? EQUIPAMIENTO_CATEGORIES.map((category) => ({
        ...category,
        fields: category.fields.filter((field) =>
          field.label.toLowerCase().includes(searchTerm.toLowerCase())
        ),
      })).filter((category) => category.fields.length > 0)
    : EQUIPAMIENTO_CATEGORIES;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" text="Cargando equipamiento..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <Input
          placeholder="Buscar equipamiento..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-md"
        />
        {!readOnly && (
          <Button onClick={handleSave} isLoading={isSaving}>
            <Save className="h-4 w-4 mr-2" />
            Guardar
          </Button>
        )}
      </div>

      {filteredCategories.map((category) => (
        <Card key={category.title}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>{category.title}</CardTitle>
              {!readOnly && (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleToggleCategory(category, true)}
                  >
                    <CheckSquare className="h-4 w-4 mr-2" />
                    Marcar Todos
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleToggleCategory(category, false)}
                  >
                    <Square className="h-4 w-4 mr-2" />
                    Desmarcar Todos
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {category.fields.map((field) => {
                if (field.type === 'number' || field.type === 'text') {
                  return (
                    <Input
                      key={field.key}
                      type={field.type}
                      label={field.label}
                      value={(equipamiento[field.key] as any) || ''}
                      onChange={(e) =>
                        handleChange(
                          field.key,
                          field.type === 'number' && e.target.value
                            ? Number(e.target.value)
                            : e.target.value
                        )
                      }
                      disabled={readOnly}
                    />
                  );
                }

                return (
                  <Checkbox
                    key={field.key}
                    label={field.label}
                    checked={!!(equipamiento[field.key] as boolean)}
                    onCheckedChange={(checked) => handleChange(field.key, checked)}
                    disabled={readOnly}
                  />
                );
              })}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
