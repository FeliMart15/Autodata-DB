const xl = require('xlsx');
const multer = require('multer');
const { parse: parseCsv } = require('csv-parse/sync');
const db = require('../config/db-simple');
const logger = require('../config/logger');

const CARONE_MISSING = '.';

const caroneStorage = multer.memoryStorage();
exports.uploadCarone = multer({
  storage: caroneStorage,
  limits: { fileSize: 10 * 1024 * 1024 }
});

exports.exportarVentasExcel = async (req, res) => {
  try {
    const { anio, mes } = req.query;

    if (!anio || !mes) {
      return res.status(400).json({ success: false, message: 'Año y mes son requeridos' });
    }

    const query = `
      SELECT
        m.CodigoAutodata AS [CODIGO CONCATENADO],
        v.Anio AS [AÑO],
        v.Mes AS [MES],
        -- Generar fecha aproximada como string DD/MM/YY
        RIGHT('0' + CAST(v.Mes AS VARCHAR(2)), 2) + '/01/' + RIGHT(CAST(v.Anio AS VARCHAR(4)), 2) AS [FECHA],
        v.Cantidad AS [VENTAS],
        -- Precio congelado al momento de cargar la venta. Fallback a PrecioInicial actual
        -- solo para registros viejos anteriores a este cambio (PrecioUnitario = NULL).
        ISNULL(v.PrecioUnitario, ISNULL(m.PrecioInicial, 0)) AS [PRECIO],
        (v.Cantidad * ISNULL(v.PrecioUnitario, ISNULL(m.PrecioInicial, 0))) AS [USD],
        ISNULL(m.Tipo, m.CategoriaCodigo) AS [TIPO],
        ISNULL(m.SegmentacionAutodata, '') AS [SEGMENTO]
      FROM Venta v
      JOIN Modelo m ON v.ModeloID = m.ModeloID
      WHERE v.Anio = @p0 AND v.Mes = @p1
    `;

    const ventas = await db.queryWithParams(query, [anio, mes]);

    if (!ventas || ventas.length === 0) {
      return res.status(404).json({ success: false, message: 'No se encontraron ventas para el periodo especificado' });
    }

    const wb = xl.utils.book_new();
    const ws = xl.utils.json_to_sheet(ventas);
    xl.utils.book_append_sheet(wb, ws, 'Ventas');

    const buffer = xl.write(wb, { type: 'buffer', bookType: 'xlsx' });

    res.setHeader('Content-Disposition', `attachment; filename=Ventas_${anio}_${mes}.xlsx`);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.status(200).send(buffer);

  } catch (error) {
    logger.error('Error exportando ventas:', error);
    res.status(500).json({ success: false, message: 'Error interno exportando datos', error: error.message });
  }
};

exports.exportarEmpadronamientosExcel = async (req, res) => {
  try {
    const { anio, mes } = req.query;

    if (!anio || !mes) {
      return res.status(400).json({ success: false, message: 'Año y mes son requeridos' });
    }

    const query = `
      SELECT 
        m.CodigoAutodata AS [CODIGO MODELO],
        e.Mes AS [Mes],
        -- En el Excel del usuario la FECHA es un serial date de Excel o string, enviaremos en formato fecha
        RIGHT('0' + CAST(e.Mes AS VARCHAR(2)), 2) + '/01/' + RIGHT(CAST(e.Anio AS VARCHAR(4)), 2) AS [FECHA],
        UPPER(ISNULL(d.Nombre, '')) AS [Departamento],
        e.Cantidad AS [CANTIDAD]
      FROM Empadronamiento e
      JOIN Modelo m ON e.ModeloID = m.ModeloID
      JOIN Departamento d ON e.DepartamentoID = d.DepartamentoID
      WHERE e.Anio = @p0 AND e.Mes = @p1
    `;

    const empadronamientos = await db.queryWithParams(query, [anio, mes]);

    if (!empadronamientos || empadronamientos.length === 0) {
      return res.status(404).json({ success: false, message: 'No se encontraron empadronamientos para el periodo especificado' });
    }

    const wb = xl.utils.book_new();
    const ws = xl.utils.json_to_sheet(empadronamientos);
    xl.utils.book_append_sheet(wb, ws, 'Empadronamiento');

    const buffer = xl.write(wb, { type: 'buffer', bookType: 'xlsx' });

    res.setHeader('Content-Disposition', `attachment; filename=Empadronamientos_${anio}_${mes}.xlsx`);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.status(200).send(buffer);

  } catch (error) {
    logger.error('Error exportando empadronamientos:', error);
    res.status(500).json({ success: false, message: 'Error interno exportando datos', error: error.message });
  }
};

exports.exportarPlantillaMaestra = async (req, res) => {
  try {
    const query = `
      SELECT
        mo.CodigoAutodata        AS [CODCONCATENADO],
        ma.Descripcion           AS [Marca],
        ma.CodigoMarca           AS [Codigo_Marca],
        mo.CodigoModelo          AS [Codigo_Modelo],
        mo.DescripcionModelo     AS [Descripcion_Modelo],
        mo.Familia               AS [Familia],
        mo.CombustibleCodigo     AS [Combustible],
        mo.SegmentacionAutodata  AS [Categoria],
        mo.PrecioInicial         AS [Precio_USD],
        e.[Largo],
        e.[Ancho],
        e.[Altura],
        e.[DistanciaEjes],
        e.[PesoOrdenMarcha],
        e.[KgPorHP],
        e.[Neumaticos],
        e.[LlantasAleacion],
        e.[DiametroLlantas],
        e.[TPMS],
        e.[KitInflableAntiPinchazo],
        e.[RuedaAuxHomogenea],
        mo.Cilindros             AS [Cilindros],
        mo.Valvulas              AS [Valvulas],
        e.[Inyeccion],
        e.[Traccion],
        e.[Suspension],
        mo.TipoCajaAut           AS [Caja],
        e.[MarchasVelocidades],
        e.[Turbo],
        mo.Puertas               AS [NumeroPuertas],
        e.[Aceite],
        e.[Norma],
        e.[StartStop],
        e.[CO2_g_km],
        e.[ConsumoRuta],
        e.[ConsumoUrbano],
        e.[ConsumoMixto],
        e.[GarantiaAnios],
        e.[GarantiaKm],
        e.[GarantiasDiferenciales],
        e.[TipoVehiculoElectrico],
        e.[EPedal],
        e.[CapacidadTanqueHidrogeno],
        e.[AutonomiaMaxRange],
        e.[CicloNorma],
        e.[PotenciaMotor],
        e.[CapacidadOperativaBateria],
        e.[ParMotorTorque],
        e.[PotenciaCargaMax],
        e.[TiposConectores],
        e.[GarantiaCapBat],
        e.[TecnologiaBat],
        e.[TiempoCarga],
        e.[CodigoFichaTecnica],
        e.[SistemaClimatizacion],
        e.[Direccion],
        e.[TipoBloqueo],
        e.[KeylessSmartKey],
        e.[LevantaVidrios],
        e.[EspejosElectricos],
        e.[EspejoInteriorElectrocromado],
        e.[EspejosAbatiblesElectricamente],
        e.[Tapizado],
        e.[VolanteRevestidoCuero],
        e.[TablerDigital],
        e.[Computadora],
        e.[GPS],
        e.[VelocidadCrucero],
        e.[Inmovilizador],
        e.[Alarma],
        e.[ABAG],
        e.[SRI],
        e.[ABS],
        e.[EBD_EBV_REF],
        e.[DiscosFrenos],
        e.[FrenoEstacionamientoElectrico],
        e.[ESP_ControlEstabilidad],
        e.[ControlTraccion],
        e.[AsistFrenadoDetectorDistancia],
        e.[AsistPendiente],
        e.[DetectorCambioFila],
        e.[DetectorPuntoCiego],
        e.[TrafficSignRecognition],
        e.[DriverAttentionControl],
        e.[DetectorLluvia],
        e.[GripControl],
        e.[LimitadorVelocidad],
        e.[AsistDescensoHDC],
        e.[PaddleShift],
        e.[ComandoAudioVolante],
        e.[CD],
        e.[MP3],
        e.[USB],
        e.[Bluetooth],
        e.[DVD],
        e.[MirrorScreen],
        e.[SistemaMultimedia],
        e.[PantallaMultimediaPulgadas],
        e.[PantallaTactil],
        e.[CargadorSmartphoneInduccion],
        e.[KitHiFi],
        e.[Radio],
        mo.Asientos              AS [NumeroAsientos],
        e.[AsientoElectricoCalefMasaje],
        e.[AsientosRango2y3],
        e.[Asiento2Mas1],
        e.[ButacaElectrica],
        e.[AsientoVentilado],
        e.[AsientosMasajeador],
        e.[ApoyabrazosDelantero],
        e.[ApoyabrazosCentralTrasero],
        e.[SoporteMusloDelantero],
        e.[AsientoTraseroAjusteElectrico],
        e.[TerceraFilaAsientosElectricos] AS [C_3raFiladeasientoselctricos],
        e.[TipoAlturaAsientoDelantero],
        e.[SeatAdjustmentMemoryDriver],
        e.[SeatAdjustmentMemoryCoDriver],
        e.[LumbarAdjustmentFrontDriver],
        e.[LumbarAdjustmentFrontCoDriver],
        e.[SeatHeatingRear],
        e.[Techo],
        e.[TechoBiTono],
        e.[BarrasTecho],
        e.[NumeroTechosQueSeAbren],
        e.[SensorEstacionamiento],
        e.[Camara],
        e.[SistemaAutomaticoEstacionamiento],
        e.[FarosNeblina],
        e.[FarosDireccionales],
        e.[FarosFullLED],
        e.[FarosHalogenosDRL_LED],
        e.[FarosXenonLimpiadores],
        e.[PackVisibilidad],
        e.[PasoLucesCruzRutaAutomatica],
        e.[VisionNocturna],
        e.[FarosMatrix],
        e.[LucesTraserasLED],
        e.[LucesTraserasOLED],
        e.[MaleteraAperturaElectrica],
        e.[CapacidadBaul],
        e.[CapacidadTanqueCombustible],
        e.[ProtectorCaja],
        e.[ParticionCabina],
        e.[NumPuertasLaterales],
        e.[PuertaLateralElectrica],
        e.[CargaUtil_kg],
        e.[VolumenUtil_m3],
        e.[TipoAlturaUL],
        e.[CapacidadCargaCamiones],
        e.[AlertaTraficoCruzadoTrasero],
        e.[AlertaTraficoCruzadoFrontal],
        e.[FrenadoMulticolision],
        e.[HeadUpDisplay],
        e.[CityStop],
        e.[FrenoPeatones],
        e.[BloqueDiferencialTerreno],
        e.[DesempaniadorElectrico],
        e.[IluminacionAmbiental],
        e.[LimpiaLavaParabrisasTrasero],
        e.[BlackWheelFrame],
        e.[VolanteMultifuncion],
        e.[TablerDigital3D],
        e.[AceleracionBEV_0a100],
        e.[AccelerationICE],
        e.[CargaElectricaWireless],
        e.[CargaElectricaInduccion],
        e.[CableElectricoTipo3Incluido],
        e.[ChassisDriveSelect],
        e.[ChassisSportSuspension],
        e.[DireccionCuatroRuedas],
        e.[LucesLaser],
        e.[DashboardDisplayConfigurable],
        e.[WirelessSmartphoneIntegration],
        e.[MobilePhoneAntenna],
        e.[DeflectorViento],
        e.[AsientosDeportivos],
        mo.Carroceria            AS [TIPO2Carrocera],
        mo.OrigenCodigo          AS [ORIGEN],
        mo.HP                    AS [HPCV],
        e.[AutonomiaMotorElectricoBEVPHEV] AS [AutonomadelmotorelctricoBEVyPHEV],
        mo.CC                    AS [CC],
        mo.TipoMotor             AS [Tipo Motor],
        e.[Caja]                 AS [Tipo Caja Automática],
        mo.Tipo                  AS [Tipo],
        mo.Importador            AS [Importador]
      FROM Modelo mo
      INNER JOIN Marca ma ON mo.MarcaID = ma.MarcaID
      LEFT JOIN EquipamientoModelo e ON mo.ModeloID = e.ModeloID
      WHERE mo.Activo = 1
      ORDER BY ma.Descripcion, mo.DescripcionModelo
    `;

    const datos = await db.queryRaw(query);

    if (!datos || datos.length === 0) {
      return res.status(404).json({ success: false, message: 'No se encontraron modelos para exportar' });
    }

    const formattedData = datos.map(row => {
      const formatted = {};
      for (const [key, val] of Object.entries(row)) {
        if (val === true) formatted[key] = 'Si';
        else if (val === false) formatted[key] = 'No';
        else formatted[key] = val;
      }
      return formatted;
    });

    const wb = xl.utils.book_new();
    const ws = xl.utils.json_to_sheet(formattedData);
    xl.utils.book_append_sheet(wb, ws, 'Plantilla_Datos');

    const buffer = xl.write(wb, { type: 'buffer', bookType: 'xlsx' });

    res.setHeader('Content-Disposition', `attachment; filename=Autodata_Plantilla_Maestra.xlsx`);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.status(200).send(buffer);

  } catch (error) {
    logger.error('Error exportando plantilla maestra:', error);
    res.status(500).json({ success: false, message: 'Error interno exportando datos', error: error.message });
  }
};

// ============================================================
// Export CarOne: genera, para TODOS los modelos en estado "definitivo",
// una fila en el formato exacto que espera el sistema de Carone.
// MARCOD/MARMODCOD salen directo de Marca.CodigoMarca / Modelo.CodigoModelo
// (confirmado que coinciden con el esquema de códigos de Carone).
// No requiere ningún archivo: es un export de un clic, igual que los demás.
// SHORTNAME.csv es opcional y solo sirve para completar la columna SHORT NAME
// (dato que no tenemos en nuestra base).
// Reimplementación de completar_carone.py / carone_gui_tk.py (ver
// C:\Users\Administrador\Desktop\Autodata\CarOne) para el resto de las
// transformaciones de campo.
// ============================================================

const CARONE_TIPO_MAP = {
  PUP: 'PICKUP', DC: 'PICKUP', HATCH: 'HATCH', SEDAN: 'SEDAN', RURAL: 'RURAL',
  MINIBUS: 'MINIBUS', FURGON: 'FURGON', COUPE: 'COUPE', SUV: 'SUV',
  CROSSOVER: 'CROSSOVER', MONOVOLUMEN: 'MONOVOLUMEN', CAMION: 'CAMION',
  CAMIONETA: 'CAMIONETA', VAN: 'VAN', CONVERTIBLE: 'CONVERTIBLE', DEPORTIVO: 'DEPORTIVO'
};

const stripAccents = (s) => String(s || '')
  .toUpperCase()
  .replace(/Á/g, 'A').replace(/É/g, 'E').replace(/Í/g, 'I').replace(/Ó/g, 'O').replace(/Ú/g, 'U');

const pad4 = (v) => String(v ?? '').trim().padStart(4, '0');
const codAutodataDe = (marcod, marmodcod) => pad4(marcod) + pad4(marmodcod);

// NULL, "N/A" o "S/D" (venga como venga) -> "." ; cualquier otro valor -> texto tal cual
const caroneValor = (v) => {
  if (v === null || v === undefined) return CARONE_MISSING;
  const s = String(v).trim();
  if (s === '' || s.toUpperCase() === 'N/A' || s.toUpperCase() === 'S/D') return CARONE_MISSING;
  return s;
};

// Booleano/texto -> "SI"/"NO"/"." (replica transformar_bool de completar_carone.py:
// cualquier valor no vacío distinto de "No" cuenta como SI)
const caroneSiNo = (v) => {
  if (v === true) return 'SI';
  if (v === false) return 'NO';
  if (v === null || v === undefined) return CARONE_MISSING;
  const s = String(v).trim();
  if (s === '') return CARONE_MISSING;
  return s.toUpperCase() === 'NO' ? 'NO' : 'SI';
};

// Lee un archivo subido (xlsx/xls o csv) y devuelve array de objetos {columna: valor}.
// Para CSV: detecta ; vs , y prueba utf-8 antes que latin1 (evita mojibake de acentos).
function leerArchivoTabular(file) {
  const nombre = (file.originalname || '').toLowerCase();
  if (nombre.endsWith('.xlsx') || nombre.endsWith('.xls')) {
    const wb = xl.read(file.buffer, { type: 'buffer' });
    const sheet = wb.Sheets[wb.SheetNames[0]];
    return xl.utils.sheet_to_json(sheet, { defval: '', raw: false });
  }

  let texto = file.buffer.toString('utf-8');
  if (texto.includes('\uFFFD')) {
    texto = file.buffer.toString('latin1');
  }
  const primeraLinea = texto.split(/\r?\n/)[0] || '';
  const delimiter = primeraLinea.includes(';') ? ';' : ',';

  return parseCsv(texto, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
    bom: true,
    relax_column_count: true,
    delimiter
  });
}

// POST /api/export/carone - Genera el Excel en formato Carone para TODOS los
// modelos en estado 'definitivo'. No requiere ningún archivo.
// Opcionalmente acepta "shortname" (CSV con MARCOD, MARMODCOD, "MODELO SHORT
// NAME") para completar esa columna; sin él, SHORT NAME queda en ".".
exports.exportarCarone = async (req, res) => {
  try {
    const shortFile = req.files?.shortname?.[0];

    const shortMap = new Map();
    if (shortFile) {
      const shortRows = leerArchivoTabular(shortFile);
      for (const r of shortRows) {
        const codigo = codAutodataDe(r.MARCOD, r.MARMODCOD);
        const short = String(r['MODELO SHORT NAME'] || '').trim();
        if (short) shortMap.set(codigo, short);
      }
    }

    const modeloRows = await db.queryRaw(`
      SELECT
        mo.CodigoAutodata AS CodAutodata,
        ma.CodigoMarca AS MarcodOut,
        mo.CodigoModelo AS MarmodcodOut,
        ma.Descripcion AS MarcaDescripcion,
        mo.Carroceria, mo.CombustibleCodigo, mo.HP, mo.CC, mo.TipoCajaAut,
        mo.Puertas, mo.Asientos,
        e.Traccion, e.MarchasVelocidades, e.ABAG, e.SRI, e.ABS,
        e.DetectorCambioFila, e.AlertaTraficoCruzadoTrasero, e.AlertaTraficoCruzadoFrontal,
        e.FrenadoMulticolision, e.VelocidadCrucero,
        e.PesoOrdenMarcha, e.Largo, e.Ancho, e.Altura,
        e.CapacidadBaul, e.CapacidadTanqueCombustible, e.DiametroLlantas, e.Tapizado,
        e.Camara, e.SensorEstacionamiento, e.Techo, e.DiscosFrenos, e.ControlTraccion,
        e.MirrorScreen,
        e.AutonomiaMaxRange, e.CapacidadOperativaBateria, e.PotenciaMotor, e.TiposConectores
      FROM Modelo mo
      JOIN Marca ma ON mo.MarcaID = ma.MarcaID
      LEFT JOIN EquipamientoModelo e ON mo.ModeloID = e.ModeloID
      WHERE mo.Estado = 'definitivo'
      ORDER BY ma.Descripcion, mo.DescripcionModelo
    `);

    if (modeloRows.length === 0) {
      return res.status(404).json({ success: false, message: 'No hay modelos en estado definitivo para exportar' });
    }

    const filasSalida = modeloRows.map((m) => {
      const codigo = m.CodAutodata;
      const shortName = shortMap.get(codigo) || CARONE_MISSING;

      const tipo = CARONE_TIPO_MAP[stripAccents(m.Carroceria)] || CARONE_MISSING;

      const adas = (
        [m.DetectorCambioFila, m.AlertaTraficoCruzadoTrasero, m.AlertaTraficoCruzadoFrontal, m.FrenadoMulticolision].some(v => v === true)
        || String(m.VelocidadCrucero || '').trim().toLowerCase() === 'adaptativo'
      ) ? 'SI' : 'NO';

      const discosRaw = String(m.DiscosFrenos ?? '').trim();
      const discos = discosRaw === '4' ? 'DISCO' : discosRaw === '2' ? 'DISCO + TAMBOR' : CARONE_MISSING;

      const medidas = (m.Ancho && m.Largo && m.Altura)
        ? `${m.Ancho}X${m.Largo}X${m.Altura}`
        : CARONE_MISSING;

      return {
        MARCOD: m.MarcodOut,
        MARMODCOD: m.MarmodcodOut,
        MAEANIO: '9999',
        CODIGOCLIENTE: '429',
        'SHORT NAME': shortName,
        TIPO: tipo,
        COMBUSTIBLE: caroneValor(m.CombustibleCodigo),
        POTENCIA: caroneValor(m.HP),
        CC: caroneValor(m.CC),
        TRANSMISION: caroneValor(String(m.TipoCajaAut || '').toUpperCase()),
        TRACCION: caroneValor(m.Traccion),
        PASAJEROS: caroneValor(m.Asientos),
        PUERTAS: caroneValor(m.Puertas),
        VELOCIDADES: caroneValor(m.MarchasVelocidades),
        AIRBAG: caroneValor(m.ABAG),
        ISOFIX: caroneSiNo(m.SRI),
        ABS: caroneSiNo(m.ABS),
        ADAS: adas,
        PESO: caroneValor(m.PesoOrdenMarcha),
        MEDIDAS: medidas,
        BAUL: caroneValor(m.CapacidadBaul),
        'CAP TANQUE': caroneValor(m.CapacidadTanqueCombustible),
        RUEDA: caroneValor(m.DiametroLlantas),
        TAPIZADO: caroneValor(String(m.Tapizado || '').toUpperCase()),
        CAMARA: caroneSiNo(m.Camara),
        SENSOR: caroneSiNo(m.SensorEstacionamiento),
        SUNROOF: caroneSiNo(m.Techo),
        'DISCOS FRENOS': discos,
        'CONTROL TRACCION': caroneSiNo(m.ControlTraccion),
        'ANDROID Y APPLE': caroneSiNo(m.MirrorScreen),
        'MARCA CORTA': caroneValor(m.MarcaDescripcion),
        AUTONOMIA: caroneValor(m.AutonomiaMaxRange),
        CAPACIDAD: caroneValor(m.CapacidadOperativaBateria),
        'POTENCIA KW': caroneValor(m.PotenciaMotor),
        'TIPO DE CONECTOR': caroneValor(m.TiposConectores)
      };
    });

    const wb = xl.utils.book_new();
    xl.utils.book_append_sheet(wb, xl.utils.json_to_sheet(filasSalida), 'CARONE_ACTUALIZADO');

    const buffer = xl.write(wb, { type: 'buffer', bookType: 'xlsx' });
    const ts = new Date().toISOString().replace(/[-:]/g, '').replace('T', '_').slice(0, 13);

    logger.info(`Export Carone generado: ${filasSalida.length} modelos definitivos, por usuario ${req.user?.username}`);

    res.setHeader('Content-Disposition', `attachment; filename=CARONE_${ts}.xlsx`);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.status(200).send(buffer);

  } catch (error) {
    logger.error('Error generando export Carone:', error);
    res.status(500).json({ success: false, message: 'Error interno generando export Carone', error: error.message });
  }
};
