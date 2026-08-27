import React, { useState, useEffect, useRef } from 'react';
import { EquipamientoModelo } from '@/types';
import { Card, CardContent, CardTitle } from '@components/ui/Card';
import { ChevronDown, ChevronUp, Save } from 'lucide-react';
import { Button } from '@components/ui/Button';
import { labelEquip } from '@components/equipamiento/equipamientoLabels';
import { EQUIP_TEXT_OPTIONS, EQUIP_NUMERIC_LIMITS, UPPERCASE_EQUIP_FIELDS, maskNumericInput } from '@components/equipamiento/equipamientoFieldConfig';

interface FormularioEquipamientoProps {
  equipamiento: Partial<EquipamientoModelo>;
  onSave?: (data: Partial<EquipamientoModelo>) => Promise<void>;
  onCancel?: () => void;
  onSendRevision?: (data: Partial<EquipamientoModelo>) => Promise<void>;
  onChange?: (data: Partial<EquipamientoModelo>) => void;
  readonly?: boolean;
  /** HP del modelo (Datos Mínimos), para autocalcular kg/hp = PesoOrdenMarcha / HP */
  modeloHP?: number | null;
}

type EquipColMeta = { column: string; type: string };

const NUMERIC_TYPES = new Set(['int', 'bigint', 'smallint', 'tinyint', 'decimal', 'numeric', 'float', 'real', 'money']);

// Categorías → columnas. Cubre las 164 columnas de equipamiento en orden lógico.
// Cualquier columna del esquema que no esté acá cae en "Otros" (a prueba de columnas futuras).
const CATEGORIAS: { titulo: string; columnas: string[] }[] = [
  { titulo: 'Dimensiones y peso', columnas: ['Largo', 'Ancho', 'Altura', 'DistanciaEjes', 'PesoOrdenMarcha', 'KgPorHP'] },
  { titulo: 'Ruedas', columnas: ['Neumaticos', 'LlantasAleacion', 'DiametroLlantas', 'TPMS', 'KitInflableAntiPinchazo', 'RuedaAuxHomogenea'] },
  { titulo: 'Motor y transmisión', columnas: ['Inyeccion', 'Traccion', 'Suspension', 'Caja', 'MarchasVelocidades', 'Turbo', 'Aceite', 'Norma', 'StartStop'] },
  { titulo: 'Consumo y emisiones', columnas: ['CO2_g_km', 'ConsumoRuta', 'ConsumoUrbano', 'ConsumoMixto'] },
  { titulo: 'Garantía', columnas: ['GarantiaAnios', 'GarantiaKm', 'GarantiasDiferenciales'] },
  { titulo: 'Eléctrico / Híbrido', columnas: ['TipoVehiculoElectrico', 'EPedal', 'CapacidadTanqueHidrogeno', 'AutonomiaMaxRange', 'AutonomiaMotorElectricoBEVPHEV', 'CicloNorma', 'PotenciaMotor', 'CapacidadOperativaBateria', 'ParMotorTorque', 'PotenciaCargaMax', 'TiposConectores', 'GarantiaCapBat', 'TecnologiaBat', 'TiempoCarga', 'CodigoFichaTecnica'] },
  { titulo: 'Confort', columnas: ['SistemaClimatizacion', 'Direccion', 'TipoBloqueo', 'KeylessSmartKey', 'LevantaVidrios', 'EspejosElectricos', 'EspejoInteriorElectrocromado', 'EspejosAbatiblesElectricamente', 'Tapizado', 'VolanteRevestidoCuero', 'TablerDigital', 'Computadora', 'GPS', 'VelocidadCrucero', 'Inmovilizador', 'Alarma', 'ABAG', 'SRI'] },
  { titulo: 'Seguridad', columnas: ['ABS', 'EBD_EBV_REF', 'DiscosFrenos', 'FrenoEstacionamientoElectrico', 'ESP_ControlEstabilidad', 'ControlTraccion', 'AsistFrenadoDetectorDistancia', 'AsistPendiente', 'DetectorCambioFila', 'DetectorPuntoCiego', 'TrafficSignRecognition', 'DriverAttentionControl', 'DetectorLluvia', 'GripControl', 'LimitadorVelocidad', 'AsistDescensoHDC', 'PaddleShift'] },
  { titulo: 'Multimedia', columnas: ['ComandoAudioVolante', 'CD', 'MP3', 'USB', 'Bluetooth', 'DVD', 'MirrorScreen', 'SistemaMultimedia', 'PantallaMultimediaPulgadas', 'PantallaTactil', 'CargadorSmartphoneInduccion', 'KitHiFi', 'Radio'] },
  { titulo: 'Asientos', columnas: ['AsientoElectricoCalefMasaje', 'AsientosRango2y3', 'Asiento2Mas1', 'ButacaElectrica', 'AsientoVentilado', 'AsientosMasajeador', 'ApoyabrazosDelantero', 'ApoyabrazosCentralTrasero', 'SoporteMusloDelantero', 'AsientoTraseroAjusteElectrico', 'TerceraFilaAsientosElectricos', 'TipoAlturaAsientoDelantero', 'SeatAdjustmentMemoryDriver', 'SeatAdjustmentMemoryCoDriver', 'LumbarAdjustmentFrontDriver', 'LumbarAdjustmentFrontCoDriver', 'SeatHeatingRear'] },
  { titulo: 'Techo', columnas: ['Techo', 'TechoBiTono', 'BarrasTecho', 'NumeroTechosQueSeAbren'] },
  { titulo: 'Estacionamiento y cámaras', columnas: ['SensorEstacionamiento', 'Camara', 'SistemaAutomaticoEstacionamiento'] },
  { titulo: 'Faros y luces', columnas: ['FarosNeblina', 'FarosDireccionales', 'FarosFullLED', 'FarosHalogenosDRL_LED', 'FarosXenonLimpiadores', 'PackVisibilidad', 'PasoLucesCruzRutaAutomatica', 'VisionNocturna', 'FarosMatrix', 'LucesTraserasLED', 'LucesTraserasOLED'] },
  { titulo: 'Maletero y utilidad', columnas: ['MaleteraAperturaElectrica', 'CapacidadBaul', 'CapacidadTanqueCombustible', 'ProtectorCaja', 'ParticionCabina', 'NumPuertasLaterales', 'PuertaLateralElectrica', 'CargaUtil_kg', 'VolumenUtil_m3', 'TipoAlturaUL', 'CapacidadCargaCamiones'] },
  { titulo: 'ADAS', columnas: ['AlertaTraficoCruzadoTrasero', 'AlertaTraficoCruzadoFrontal', 'FrenadoMulticolision', 'HeadUpDisplay', 'CityStop', 'FrenoPeatones', 'BloqueDiferencialTerreno', 'DesempaniadorElectrico', 'IluminacionAmbiental', 'LimpiaLavaParabrisasTrasero', 'BlackWheelFrame', 'VolanteMultifuncion', 'TablerDigital3D'] },
  { titulo: 'Performance EV', columnas: ['AceleracionBEV_0a100', 'AccelerationICE', 'CargaElectricaWireless', 'CargaElectricaInduccion', 'CableElectricoTipo3Incluido'] },
  { titulo: 'Chasis', columnas: ['ChassisDriveSelect', 'ChassisSportSuspension', 'DireccionCuatroRuedas', 'LucesLaser', 'DashboardDisplayConfigurable', 'WirelessSmartphoneIntegration', 'MobilePhoneAntenna', 'DeflectorViento', 'AsientosDeportivos'] }
];

export const FormularioEquipamiento: React.FC<FormularioEquipamientoProps> = ({
  equipamiento,
  onSave,
  onCancel,
  onSendRevision,
  onChange,
  readonly = false,
  modeloHP
}) => {
  const [formData, setFormData] = useState<Partial<EquipamientoModelo>>(equipamiento || {});
  // Si el usuario edita kg/hp a mano, dejamos de recalcularlo automáticamente
  // hasta que vuelva a quedar vacío.
  const kgPorHpManualRef = useRef(false);

  useEffect(() => {
    setFormData(equipamiento || {});
    kgPorHpManualRef.current = false;
  }, [equipamiento]);

  // kg/hp = Peso en orden de marcha / HP. Se recalcula solo mientras el usuario
  // no lo haya tocado a mano (o lo haya dejado vacío de nuevo).
  useEffect(() => {
    if (readonly || kgPorHpManualRef.current) return;
    const peso = (formData as any).PesoOrdenMarcha;
    if (peso == null || peso === '' || !modeloHP) return;
    const calculado = Number(peso) / Number(modeloHP);
    if (!isFinite(calculado)) return;
    const redondeado = Math.round(calculado * 100) / 100;
    if ((formData as any).KgPorHP !== redondeado) {
      setFormData(prev => {
        const next = { ...prev, KgPorHP: redondeado } as any;
        if (onChange) onChange(next);
        return next;
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [(formData as any).PesoOrdenMarcha, modeloHP, readonly]);

  // Mapa columna -> tipo SQL, provisto por el backend en __schema.
  const schemaCols: EquipColMeta[] = ((equipamiento as any)?.__schema as EquipColMeta[]) || [];
  const tipoPorColumna = new Map(schemaCols.map(c => [c.column, c.type]));

  // Columnas del esquema que no están en ninguna categoría conocida → "Otros".
  const categorizadas = new Set(CATEGORIAS.flatMap(c => c.columnas));
  const otras = schemaCols.map(c => c.column).filter(c => !categorizadas.has(c));
  const secciones = otras.length > 0
    ? [...CATEGORIAS, { titulo: 'Otros', columnas: otras }]
    : CATEGORIAS;

  const [abiertas, setAbiertas] = useState<Record<string, boolean>>({ [CATEGORIAS[0].titulo]: true });

  const toggle = (titulo: string) => setAbiertas(prev => ({ ...prev, [titulo]: !prev[titulo] }));

  const handleChange = (field: string, value: any) => {
    if (field === 'KgPorHP') {
      // El usuario tomó control manual; si lo vacía, el auto-cálculo vuelve a activarse.
      kgPorHpManualRef.current = value != null && value !== '';
    }
    const newData = { ...formData, [field]: value };
    setFormData(newData);
    if (onChange) onChange(newData);
  };

  const handleAction = async (action: 'save' | 'revision') => {
    // No enviamos __schema (metadato del front) al backend.
    const { __schema, ...payload } = formData as any;
    for (const { column, type } of schemaCols) {
      if (type === 'bit') {
        // Todo campo checkbox que no quedó marcado se persiste como "No" (false), no como "—".
        const v = payload[column];
        payload[column] = (v === true || v === 1 || v === '1' || v === 'Si');
      } else if (EQUIP_NUMERIC_LIMITS[column] != null && typeof payload[column] === 'string') {
        // Los campos numéricos con máscara se editan como texto; acá se convierten a número real.
        const n = parseFloat(payload[column]);
        payload[column] = payload[column] === '' || isNaN(n) ? undefined : n;
      }
    }
    if (action === 'save' && onSave) await onSave(payload);
    if (action === 'revision' && onSendRevision) await onSendRevision(payload);
  };

  const renderCampo = (col: string) => {
    const tipo = tipoPorColumna.get(col);
    if (!tipo) return null; // la columna no existe en la DB → no se renderiza
    const val = (formData as any)[col];
    const esBit = tipo === 'bit';
    const esNum = NUMERIC_TYPES.has(tipo);
    const limit = EQUIP_NUMERIC_LIMITS[col];
    const opciones = EQUIP_TEXT_OPTIONS[col];
    const inputClass = "w-full h-10 px-3 rounded-md border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50";

    return (
      <div key={col} className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-foreground leading-tight break-words">{labelEquip(col)}</label>
        {esBit ? (
          <label className="flex items-center gap-2 h-10">
            <input
              type="checkbox"
              disabled={readonly}
              checked={val === true || val === 1 || val === '1' || val === 'Si'}
              onChange={(e) => handleChange(col, e.target.checked)}
              className="w-4 h-4 rounded border-input text-primary"
            />
            <span className="text-sm text-muted-foreground">{(val === true || val === 1 || val === '1' || val === 'Si') ? 'Sí' : 'No'}</span>
          </label>
        ) : esNum && limit ? (
          <>
            <input
              type="text"
              inputMode="decimal"
              disabled={readonly}
              list={limit.suggestions ? `dl-${col}` : undefined}
              value={(val ?? '') as any}
              onChange={(e) => {
                const masked = maskNumericInput(e.target.value, limit);
                handleChange(col, masked === '' ? undefined : masked);
              }}
              className={inputClass}
            />
            {limit.suggestions && (
              <datalist id={`dl-${col}`}>
                {limit.suggestions.map(o => <option key={o} value={o} />)}
              </datalist>
            )}
          </>
        ) : esNum ? (
          <input
            type="number"
            disabled={readonly}
            value={(val ?? '') as any}
            onChange={(e) => handleChange(col, e.target.value === '' ? undefined : parseFloat(e.target.value))}
            className={inputClass}
          />
        ) : opciones ? (
          <>
            <input
              type="text"
              list={`dl-${col}`}
              disabled={readonly}
              value={(val ?? '') as any}
              onChange={(e) => handleChange(col, e.target.value === '' ? undefined : e.target.value)}
              className={inputClass}
            />
            <datalist id={`dl-${col}`}>
              {opciones.map(o => <option key={o} value={o} />)}
            </datalist>
          </>
        ) : (
          <input
            type="text"
            disabled={readonly}
            value={(val ?? '') as any}
            onChange={(e) => {
              const v = e.target.value;
              handleChange(col, v === '' ? undefined : (UPPERCASE_EQUIP_FIELDS.has(col) ? v.toUpperCase() : v));
            }}
            className={inputClass}
          />
        )}
      </div>
    );
  };

  return (
    <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); if (onSendRevision) handleAction('revision'); }}>
      {schemaCols.length === 0 && (
        <p className="text-sm text-amber-600">No se pudo cargar el esquema de equipamiento. Reintentá recargar el modelo.</p>
      )}

      {secciones.map(({ titulo, columnas }) => {
        const visibles = columnas.filter(c => tipoPorColumna.has(c));
        if (visibles.length === 0) return null;
        const abierta = !!abiertas[titulo];
        return (
          <Card key={titulo} className="border shadow-sm">
            <div
              className="flex items-center justify-between p-4 cursor-pointer bg-muted/50"
              onClick={() => toggle(titulo)}
            >
              <CardTitle className="text-base">{titulo} ({visibles.length})</CardTitle>
              {abierta ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
            </div>
            <div className={abierta ? 'block' : 'hidden'}>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {visibles.map(renderCampo)}
                </div>
              </CardContent>
            </div>
          </Card>
        );
      })}

      {!readonly && (
        <div className="flex justify-end gap-3 pt-6 border-t mt-8">
          <Button type="button" variant="outline" onClick={onCancel || (() => window.history.back())}>
            Cancelar
          </Button>
          {onSave && (
            <Button type="button" variant="secondary" onClick={() => handleAction('save')}>
              <Save className="h-4 w-4 mr-2" />
              Guardar Progreso
            </Button>
          )}
          {onSendRevision && (
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">
              <Save className="h-4 w-4 mr-2" />
              Enviar a Revisión
            </Button>
          )}
        </div>
      )}
    </form>
  );
};
