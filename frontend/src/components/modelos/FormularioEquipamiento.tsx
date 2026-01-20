import { useState, useEffect } from 'react';
import { EquipamientoModelo } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@components/ui/Card';
import { Button } from '@components/ui/Button';
import { LoadingSpinner } from '@components/ui/LoadingSpinner';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface FormularioEquipamientoProps {
  equipamiento: Partial<EquipamientoModelo>;
  onSave: (data: Partial<EquipamientoModelo>) => Promise<void>;
  onCancel?: () => void;
  readonly?: boolean;
}

export const FormularioEquipamiento: React.FC<FormularioEquipamientoProps> = ({
  equipamiento,
  onSave,
  onCancel,
  readonly = false
}) => {
  const [formData, setFormData] = useState<Partial<EquipamientoModelo>>(equipamiento);
  const [isSaving, setIsSaving] = useState(false);
  const [seccionesAbiertas, setSeccionesAbiertas] = useState<Record<string, boolean>>({
    dimensiones: true,
    mecanica: false,
    consumo: false,
    garantia: false,
    electrico: false,
    confort: false,
    seguridad: false,
    multimedia: false,
    asientos: false,
    ajustesAsientos: false,
    techo: false,
    sensores: false,
    iluminacion: false,
    maletero: false,
    carga: false,
    seguridadAvanzada: false,
    otros: false
  });

  useEffect(() => {
    setFormData(equipamiento);
  }, [equipamiento]);

  const handleChange = (field: keyof EquipamientoModelo, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleSeccion = (seccion: string) => {
    setSeccionesAbiertas(prev => ({ ...prev, [seccion]: !prev[seccion] }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (readonly) return;

    setIsSaving(true);
    try {
      await onSave(formData);
    } finally {
      setIsSaving(false);
    }
  };

  const renderCheckbox = (field: string, label: string) => (
    <div className="flex items-center">
      <input
        type="checkbox"
        id={field}
        checked={(formData as any)[field] as boolean || false}
        onChange={(e) => handleChange(field as any, e.target.checked)}
        disabled={readonly}
        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
      />
      <label htmlFor={field} className="ml-2 text-sm text-gray-700">
        {label}
      </label>
    </div>
  );

  const renderInput = (field: string, label: string, type: string = 'text', placeholder?: string) => (
    <div>
      <label htmlFor={field} className="block text-sm font-medium mb-1">
        {label}
      </label>
      <input
        type={type}
        id={field}
        value={(formData as any)[field] as string | number || ''}
        onChange={(e) => handleChange(field as any, type === 'number' ? parseFloat(e.target.value) || undefined : e.target.value)}
        disabled={readonly}
        placeholder={placeholder}
        className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 text-sm"
      />
    </div>
  );

  const renderSeccion = (titulo: string, seccionKey: string, contenido: React.ReactNode) => (
    <div className="border rounded-lg overflow-hidden">
      <button
        type="button"
        onClick={() => toggleSeccion(seccionKey)}
        className="w-full px-4 py-3 bg-gray-50 hover:bg-gray-100 flex items-center justify-between transition-colors"
      >
        <h3 className="text-lg font-semibold">{titulo}</h3>
        {seccionesAbiertas[seccionKey] ? (
          <ChevronUp className="h-5 w-5 text-gray-500" />
        ) : (
          <ChevronDown className="h-5 w-5 text-gray-500" />
        )}
      </button>
      {seccionesAbiertas[seccionKey] && (
        <div className="p-4 bg-white">
          {contenido}
        </div>
      )}
    </div>
  );

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>Equipamiento del Vehículo</CardTitle>
          <p className="text-sm text-gray-600 mt-1">
            Complete la información de equipamiento del modelo. Los campos están organizados por categorías.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* DIMENSIONES Y CAPACIDADES */}
          {renderSeccion('Dimensiones y Capacidades', 'dimensiones', (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {renderInput('Largo', 'Largo (mm)', 'number', '4500')}
              {renderInput('Ancho', 'Ancho (mm)', 'number', '1800')}
              {renderInput('Alto', 'Alto (mm)', 'number', '1500')}
              {renderInput('Distancia_entre_ejes', 'Distancia entre ejes (mm)', 'number', '2700')}
              {renderInput('Despeje', 'Despeje (mm)', 'number', '150')}
              {renderInput('Peso_en_vacio', 'Peso en vacío (kg)', 'number', '1400')}
              {renderInput('Capacidad_tanque', 'Capacidad tanque (L)', 'number', '55')}
              {renderInput('Numero_plazas', 'Número de plazas', 'number', '5')}
              {renderInput('Numero_puertas', 'Número de puertas', 'number', '4')}
              {renderInput('Neumaticos_delanteros', 'Neumáticos delanteros', 'text', '205/55 R16')}
              {renderInput('Neumaticos_traseros', 'Neumáticos traseros', 'text', '205/55 R16')}
              {renderInput('Radio_giro', 'Radio de giro (m)', 'number', '5.2')}
              {renderInput('Capacidad_remolque', 'Capacidad remolque (kg)', 'number', '1000')}
              {renderInput('Peso_maximo_remolque_sin_frenos', 'Peso máx. remolque sin frenos (kg)', 'number', '750')}
              {renderInput('Peso_maximo_remolque_con_frenos', 'Peso máx. remolque con frenos (kg)', 'number', '1500')}
            </div>
          ))}

          {/* MECÁNICA */}
          {renderSeccion('Mecánica', 'mecanica', (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {renderInput('Torque', 'Torque (Nm)', 'number', '250')}
              {renderInput('RPM_torque_maximo', 'RPM torque máximo', 'number', '1800')}
              {renderInput('RPM_potencia_maxima', 'RPM potencia máxima', 'number', '5500')}
              {renderInput('Aceleracion_0_100', 'Aceleración 0-100 km/h (s)', 'number', '9.5')}
              {renderInput('Velocidad_maxima', 'Velocidad máxima (km/h)', 'number', '190')}
              {renderInput('Relacion_compresion', 'Relación de compresión', 'text', '10.5:1')}
              {renderInput('Diametro_cilindros', 'Diámetro cilindros (mm)', 'number', '82')}
              {renderInput('Recorrido_pistones', 'Recorrido pistones (mm)', 'number', '75')}
              {renderInput('Numero_marchas', 'Número de marchas', 'number', '6')}
            </div>
          ))}

          {/* CONSUMO */}
          {renderSeccion('Consumo y Emisiones', 'consumo', (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {renderInput('Consumo_ciudad', 'Consumo ciudad (L/100km)', 'number', '8.5')}
              {renderInput('Consumo_carretera', 'Consumo carretera (L/100km)', 'number', '5.8')}
              {renderInput('Consumo_combinado', 'Consumo combinado (L/100km)', 'number', '6.9')}
              {renderInput('Emisiones_CO2', 'Emisiones CO2 (g/km)', 'number', '140')}
            </div>
          ))}

          {/* GARANTÍA */}
          {renderSeccion('Garantía', 'garantia', (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {renderInput('Garantia_general_anos', 'Garantía general (años)', 'number', '3')}
              {renderInput('Garantia_general_km', 'Garantía general (km)', 'number', '100000')}
              {renderInput('Garantia_pintura_anos', 'Garantía pintura (años)', 'number', '3')}
              {renderInput('Garantia_anticorrosion_anos', 'Garantía anticorrosión (años)', 'number', '10')}
            </div>
          ))}

          {/* VEHÍCULO ELÉCTRICO */}
          {renderSeccion('Vehículo Eléctrico / Híbrido', 'electrico', (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {renderInput('Capacidad_bateria', 'Capacidad batería (kWh)', 'number', '60')}
                {renderInput('Autonomia_electrica', 'Autonomía eléctrica (km)', 'number', '400')}
                {renderInput('Tiempo_carga_rapida', 'Tiempo carga rápida (min)', 'number', '30')}
                {renderInput('Tiempo_carga_lenta', 'Tiempo carga lenta (h)', 'number', '8')}
                {renderInput('Potencia_motor_electrico', 'Potencia motor eléctrico (kW)', 'number', '150')}
                {renderInput('Torque_motor_electrico', 'Torque motor eléctrico (Nm)', 'number', '300')}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {renderCheckbox('Puerto_carga_AC', 'Puerto de carga AC')}
                {renderCheckbox('Puerto_carga_DC', 'Puerto de carga DC')}
                {renderCheckbox('Carga_bidireccional', 'Carga bidireccional (V2L/V2H)')}
                {renderCheckbox('Precondicionamiento_bateria', 'Preacondicionamiento de batería')}
                {renderCheckbox('Bomba_calor', 'Bomba de calor')}
                {renderCheckbox('Modo_conduccion_electrico', 'Modo conducción 100% eléctrico')}
              </div>
            </div>
          ))}

          {/* CONFORT */}
          {renderSeccion('Confort', 'confort', (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {renderCheckbox('Aire_acondicionado', 'Aire acondicionado')}
              {renderCheckbox('Climatizador_automatico', 'Climatizador automático')}
              {renderCheckbox('Climatizador_bizona', 'Climatizador bizona')}
              {renderCheckbox('Climatizador_trizona', 'Climatizador trizona')}
              {renderCheckbox('Filtro_aire_cabina', 'Filtro de aire de cabina')}
              {renderCheckbox('Control_crucero', 'Control de crucero')}
              {renderCheckbox('Control_crucero_adaptativo', 'Control crucero adaptativo')}
              {renderCheckbox('Limitador_velocidad', 'Limitador de velocidad')}
              {renderCheckbox('Volante_cuero', 'Volante en cuero')}
              {renderCheckbox('Volante_multifuncion', 'Volante multifunción')}
              {renderCheckbox('Volante_regulable_altura', 'Volante regulable en altura')}
              {renderCheckbox('Volante_regulable_profundidad', 'Volante regulable en profundidad')}
              {renderCheckbox('Volante_calefaccionado', 'Volante calefaccionado')}
              {renderCheckbox('Levas_cambio_volante', 'Levas de cambio en volante')}
              {renderCheckbox('Espejos_electricos', 'Espejos eléctricos')}
            </div>
          ))}

          {/* SEGURIDAD */}
          {renderSeccion('Seguridad', 'seguridad', (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {renderCheckbox('ABS', 'ABS (Frenos antibloqueo)')}
              {renderCheckbox('EBD', 'EBD (Distribución electrónica frenado)')}
              {renderCheckbox('ESP', 'ESP (Control estabilidad)')}
              {renderCheckbox('Control_traccion', 'Control de tracción')}
              {renderCheckbox('Asistente_arranque_pendiente', 'Asistente arranque en pendiente')}
              {renderCheckbox('Airbag_conductor', 'Airbag conductor')}
              {renderCheckbox('Airbag_pasajero', 'Airbag pasajero')}
              {renderCheckbox('Airbags_laterales_delanteros', 'Airbags laterales delanteros')}
              {renderCheckbox('Airbags_laterales_traseros', 'Airbags laterales traseros')}
              {renderCheckbox('Airbags_cortina', 'Airbags de cortina')}
              {renderCheckbox('Airbag_rodilla_conductor', 'Airbag de rodilla conductor')}
              {renderCheckbox('ISOFIX', 'Anclajes ISOFIX')}
              {renderCheckbox('Cinturones_tres_puntos', 'Cinturones de 3 puntos todas las plazas')}
              {renderCheckbox('Pretensores_cinturones', 'Pretensores de cinturones')}
              {renderCheckbox('Alarma', 'Alarma')}
              {renderCheckbox('Inmovilizador', 'Inmovilizador electrónico')}
            </div>
          ))}

          {/* MULTIMEDIA */}
          {renderSeccion('Multimedia y Conectividad', 'multimedia', (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {renderInput('Pantalla_tactil_pulgadas', 'Pantalla táctil (pulgadas)', 'number', '8')}
                {renderInput('Sistema_sonido_marca', 'Sistema de sonido (marca)', 'text', 'JBL')}
                {renderInput('Sistema_sonido_parlantes', 'Cantidad de parlantes', 'number', '6')}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {renderCheckbox('Radio_AM_FM', 'Radio AM/FM')}
                {renderCheckbox('Bluetooth', 'Bluetooth')}
                {renderCheckbox('USB', 'Puerto USB')}
                {renderCheckbox('Apple_CarPlay', 'Apple CarPlay')}
                {renderCheckbox('Android_Auto', 'Android Auto')}
                {renderCheckbox('Cargador_inalambrico', 'Cargador inalámbrico')}
                {renderCheckbox('Sistema_navegacion', 'Sistema de navegación')}
                {renderCheckbox('Computadora_abordo', 'Computadora de a bordo')}
                {renderCheckbox('Wifi_integrado', 'WiFi integrado')}
                {renderCheckbox('Comando_voz', 'Comando de voz')}
                {renderCheckbox('Pantallas_traseras', 'Pantallas traseras entretenimiento')}
                {renderCheckbox('Entrada_auxiliar', 'Entrada auxiliar 3.5mm')}
                {renderCheckbox('Tomas_12V', 'Tomas 12V')}
              </div>
            </div>
          ))}

          {/* ASIENTOS */}
          {renderSeccion('Asientos', 'asientos', (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {renderCheckbox('Asientos_cuero', 'Asientos en cuero')}
              {renderCheckbox('Asientos_tela', 'Asientos en tela')}
              {renderCheckbox('Asientos_vinilo', 'Asientos en vinilo')}
              {renderCheckbox('Asiento_conductor_electrico', 'Asiento conductor eléctrico')}
              {renderCheckbox('Asiento_pasajero_electrico', 'Asiento pasajero eléctrico')}
              {renderCheckbox('Memoria_asiento_conductor', 'Memoria asiento conductor')}
              {renderCheckbox('Calefaccion_asientos_delanteros', 'Calefacción asientos delanteros')}
              {renderCheckbox('Calefaccion_asientos_traseros', 'Calefacción asientos traseros')}
              {renderCheckbox('Ventilacion_asientos', 'Ventilación asientos')}
              {renderCheckbox('Asientos_traseros_abatibles', 'Asientos traseros abatibles')}
            </div>
          ))}

          {/* AJUSTES DE ASIENTOS */}
          {renderSeccion('Ajustes de Asientos', 'ajustesAsientos', (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {renderInput('Ajuste_asiento_conductor', 'Ajustes asiento conductor', 'text', 'Ej: 8 vías')}
              {renderInput('Ajuste_asiento_pasajero', 'Ajustes asiento pasajero', 'text', 'Ej: 4 vías')}
              {renderInput('Ajuste_lumbar_conductor', 'Ajuste lumbar conductor', 'text', 'Ej: 2 vías')}
              {renderInput('Ajuste_lumbar_pasajero', 'Ajuste lumbar pasajero', 'text', 'Ej: 2 vías')}
              {renderInput('Reposacabezas_traseros', 'Reposacabezas traseros', 'text', 'Ej: 3')}
              {renderInput('Apoyabrazos_central_delantero', 'Apoyabrazos central delantero', 'text')}
              {renderInput('Apoyabrazos_central_trasero', 'Apoyabrazos central trasero', 'text')}
              {renderInput('Bolsillos_respaldos', 'Bolsillos en respaldos', 'text')}
            </div>
          ))}

          {/* TECHO */}
          {renderSeccion('Techo y Exteriores', 'techo', (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {renderCheckbox('Techo_solar', 'Techo solar')}
                {renderCheckbox('Techo_panoramico', 'Techo panorámico')}
                {renderCheckbox('Quemacocos', 'Quemacocos eléctrico')}
                {renderCheckbox('Barras_techo', 'Barras de techo')}
                {renderCheckbox('Molduras_laterales', 'Molduras laterales')}
                {renderCheckbox('Espejos_color_carroceria', 'Espejos color carrocería')}
                {renderCheckbox('Manijas_color_carroceria', 'Manijas color carrocería')}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {renderInput('Color_techo', 'Color de techo', 'text', 'Negro / Color carrocería')}
                {renderInput('Tipo_parrilla', 'Tipo de parrilla', 'text', 'Cromada / Black Piano')}
                {renderInput('Acabado_exterior', 'Acabado exterior', 'text', 'Cromado / Black Piano')}
              </div>
            </div>
          ))}

          {/* SENSORES Y CÁMARAS */}
          {renderSeccion('Sensores y Cámaras', 'sensores', (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {renderCheckbox('Sensores_estacionamiento_delanteros', 'Sensores estacionamiento delanteros')}
              {renderCheckbox('Sensores_estacionamiento_traseros', 'Sensores estacionamiento traseros')}
              {renderCheckbox('Camara_retroceso', 'Cámara de retroceso')}
              {renderCheckbox('Camara_360', 'Cámara 360°')}
              {renderCheckbox('Sensor_lluvia', 'Sensor de lluvia')}
              {renderCheckbox('Sensor_crepuscular', 'Sensor crepuscular (luces automáticas)')}
            </div>
          ))}

          {/* ILUMINACIÓN */}
          {renderSeccion('Iluminación', 'iluminacion', (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {renderCheckbox('Faros_halogenos', 'Faros halógenos')}
              {renderCheckbox('Faros_LED', 'Faros LED')}
              {renderCheckbox('Faros_xenon', 'Faros de xenón')}
              {renderCheckbox('Faros_automaticos', 'Faros automáticos')}
              {renderCheckbox('Luces_diurnas_LED', 'Luces diurnas LED')}
              {renderCheckbox('Faros_antiniebla', 'Faros antiniebla')}
              {renderCheckbox('Luces_adaptativas', 'Luces adaptativas')}
              {renderCheckbox('Luces_ambiente_interior', 'Luces de ambiente interior')}
              {renderCheckbox('Iluminacion_entrada', 'Iluminación de entrada')}
              {renderCheckbox('Faros_altura_regulable', 'Faros regulables en altura')}
              {renderCheckbox('Lavafaros', 'Lavafaros')}
            </div>
          ))}

          {/* MALETERO */}
          {renderSeccion('Maletero', 'maletero', (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {renderInput('Volumen_maletero', 'Volumen maletero (L)', 'number', '450')}
                {renderInput('Volumen_maletero_max', 'Volumen máximo (asientos abatidos) (L)', 'number', '1200')}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {renderCheckbox('Apertura_maletero_electrica', 'Apertura eléctrica maletero')}
                {renderCheckbox('Maletero_manos_libres', 'Apertura maletero manos libres')}
                {renderCheckbox('Cierre_suave_maletero', 'Cierre suave maletero')}
                {renderCheckbox('Cubierta_maletero', 'Cubierta de maletero')}
                {renderCheckbox('Ganchos_maletero', 'Ganchos de maletero')}
                {renderCheckbox('Red_maletero', 'Red de maletero')}
                {renderCheckbox('Iluminacion_maletero', 'Iluminación de maletero')}
              </div>
            </div>
          ))}

          {/* CAPACIDAD DE CARGA */}
          {renderSeccion('Capacidad de Carga (Pick-ups/Comerciales)', 'carga', (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {renderInput('Capacidad_carga_kg', 'Capacidad de carga (kg)', 'number', '1000')}
              {renderInput('Largo_platon', 'Largo del platón (m)', 'number', '2.0')}
              {renderInput('Ancho_platon', 'Ancho del platón (m)', 'number', '1.5')}
              {renderInput('Alto_platon', 'Alto del platón (m)', 'number', '0.5')}
            </div>
          ))}

          {/* SEGURIDAD AVANZADA */}
          {renderSeccion('Seguridad Avanzada (ADAS)', 'seguridadAvanzada', (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {renderCheckbox('Frenado_emergencia_autonomo', 'Frenado emergencia autónomo (AEB)')}
              {renderCheckbox('Alerta_colision_frontal', 'Alerta colisión frontal')}
              {renderCheckbox('Alerta_cambio_carril', 'Alerta cambio de carril (LDW)')}
              {renderCheckbox('Asistente_mantenimiento_carril', 'Asistente mantenimiento carril (LKA)')}
              {renderCheckbox('Monitoreo_punto_ciego', 'Monitoreo punto ciego (BSM)')}
              {renderCheckbox('Alerta_trafico_cruzado', 'Alerta tráfico cruzado trasero')}
            </div>
          ))}

          {/* OTROS EQUIPAMIENTOS */}
          {renderSeccion('Otros Equipamientos', 'otros', (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {renderCheckbox('Llave_inteligente', 'Llave inteligente')}
                {renderCheckbox('Encendido_sin_llave', 'Encendido sin llave (botón Start/Stop)')}
                {renderCheckbox('Acceso_sin_llave', 'Acceso sin llave')}
                {renderCheckbox('Cierre_centralizado', 'Cierre centralizado')}
                {renderCheckbox('Cierre_automatico_velocidad', 'Cierre automático por velocidad')}
                {renderCheckbox('Elevavidrios_electricos_delanteros', 'Elevavidrios eléctricos delanteros')}
                {renderCheckbox('Elevavidrios_electricos_traseros', 'Elevavidrios eléctricos traseros')}
                {renderCheckbox('Elevavidrios_una_pulsacion', 'Elevavidrios de una pulsación')}
                {renderCheckbox('Vidrios_polarizados', 'Vidrios polarizados')}
                {renderCheckbox('Vidrios_traseros_privados', 'Vidrios traseros privados')}
                {renderCheckbox('Desempaniador_luneta', 'Desempañador de luneta')}
                {renderCheckbox('Limpiaparabrisas_variable', 'Limpiaparabrisas intermitencia variable')}
                {renderCheckbox('Limpiaparabrisas_trasero', 'Limpiaparabrisas trasero')}
                {renderCheckbox('Espejos_abatibles_electricamente', 'Espejos abatibles eléctricamente')}
                {renderCheckbox('Espejo_retrovisor_electrocromico', 'Espejo retrovisor electrocrómico')}
                {renderCheckbox('Freno_estacionamiento_electrico', 'Freno de estacionamiento eléctrico')}
                {renderCheckbox('Asistente_estacionamiento', 'Asistente de estacionamiento')}
                {renderCheckbox('Estacionamiento_automatico', 'Estacionamiento automático')}
                {renderCheckbox('Head_up_display', 'Head-up display (HUD)')}
                {renderCheckbox('Tapizado_techo', 'Tapizado de techo')}
                {renderCheckbox('Alfombrillas', 'Alfombrillas')}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {renderInput('Rines_tamano', 'Tamaño de rines (pulgadas)', 'number', '17')}
                {renderInput('Rines_material', 'Material de rines', 'text', 'Aleación / Acero')}
                {renderInput('Llanta_repuesto', 'Llanta de repuesto', 'text', 'Tamaño completo / Temporal / Kit')}
                {renderInput('Kit_herramientas', 'Kit de herramientas', 'text', 'Gato / Llave cruz')}
                {renderInput('Triangulos_seguridad', 'Triángulos de seguridad', 'text', '2')}
                {renderInput('Botiquin', 'Botiquín de primeros auxilios', 'text', 'Incluido')}
                {renderInput('Extintor', 'Extintor', 'text', 'Incluido')}
              </div>
            </div>
          ))}

          {/* Botones de acción */}
          {!readonly && (
            <div className="flex gap-3 justify-end pt-4 border-t">
              {onCancel && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={onCancel}
                  disabled={isSaving}
                >
                  Cancelar
                </Button>
              )}
              <Button
                type="submit"
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" />
                    Guardando...
                  </>
                ) : (
                  'Guardar Equipamiento'
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </form>
  );
};
