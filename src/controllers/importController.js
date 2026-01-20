const multer = require('multer');
const { parse } = require('csv-parse/sync');
const db = require('../config/db-simple');
const logger = require('../config/logger');

// Configuración de multer para archivos en memoria
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB máximo
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten archivos CSV'), false);
    }
  }
});

/**
 * POST /api/import/claudio
 * Importa un archivo CSV de Claudio a la tabla staging
 */
const importarCSV = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No se proporcionó ningún archivo'
      });
    }

    // Generar batch ID único para este lote
    const batchId = require('crypto').randomUUID();
    logger.info(`Iniciando importación CSV - Batch: ${batchId}`);

    // Parsear CSV
    const csvContent = req.file.buffer.toString('utf-8');
    
    let records;
    try {
      records = parse(csvContent, {
        columns: true, // Primera fila como headers
        skip_empty_lines: true,
        trim: true,
        bom: true, // Manejar BOM de UTF-8
        relaxColumnCount: true, // Permitir filas con diferente cantidad de columnas
        cast: false // No hacer casting automático, dejar todo como string
      });
    } catch (parseError) {
      logger.error('Error parseando CSV:', parseError);
      return res.status(400).json({
        success: false,
        message: 'Error al parsear el archivo CSV',
        error: parseError.message
      });
    }

    if (!records || records.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'El archivo CSV está vacío o no tiene datos válidos'
      });
    }

    logger.info(`CSV parseado exitosamente - ${records.length} registros encontrados`);

    // Insertar registros en staging
    let insertedCount = 0;
    let errorCount = 0;
    const errors = [];

    for (let i = 0; i < records.length; i++) {
      const record = records[i];
      
      try {
        // Preparar datos para inserción (mapeo flexible de columnas)
        const rowData = {
          load_batch_id: batchId,
          load_status: 'PENDING',
          raw_line: JSON.stringify(record),
          
          // Mapear columnas del CSV (nombres flexibles)
          marca: record.marca || record.Marca || record.MARCA || null,
          modelo: record.modelo || record.Modelo || record.MODELO || null,
          anio: record.anio || record.año || record.Año || record.Anio || null,
          version: record.version || record.Version || record.VERSION || null,
          combustible: record.combustible || record.Combustible || null,
          tipo: record.tipo || record.Tipo || record.tipo_vehiculo || null,
          origen: record.origen || record.Origen || null,
          categoria: record.categoria || record.Categoria || null,
          segmento: record.segmento || record.Segmento || null,
          cc: record.cc || record.CC || record.cilindrada || null,
          hp: record.hp || record.HP || record.potencia || null,
          traccion: record.traccion || record.Traccion || record.tracción || null,
          caja: record.caja || record.Caja || record.transmision || null,
          turbo: record.turbo || record.Turbo || null,
          puertas: record.puertas || record.Puertas || null,
          pasajeros: record.pasajeros || record.Pasajeros || null,
          precio: record.precio || record.Precio || null,
          moneda: record.moneda || record.Moneda || 'USD',
          
          // Equipamiento (opcional)
          airbag_conductor: record.airbag_conductor || null,
          airbag_acompanante: record.airbag_acompanante || null,
          airbags_laterales: record.airbags_laterales || null,
          airbags_cortina: record.airbags_cortina || null,
          abs: record.abs || record.ABS || null,
          control_estabilidad: record.control_estabilidad || record.esp || null,
          control_traccion: record.control_traccion || null,
          climatizador: record.climatizador || record.clima || null,
          aire_acondicionado: record.aire_acondicionado || record.ac || null,
          camara_retroceso: record.camara_retroceso || null,
          sensores_estacionamiento: record.sensores_estacionamiento || null,
          bluetooth: record.bluetooth || null,
          usb: record.usb || null,
          pantalla_tactil: record.pantalla_tactil || null,
          gps: record.gps || null,
          llantas_aleacion: record.llantas_aleacion || null,
          techo_panoramico: record.techo_panoramico || null,
          asientos_cuero: record.asientos_cuero || null,
          asientos_electricos: record.asientos_electricos || null
        };

        await db.insert('stg.Claudio_Modelos', rowData);
        insertedCount++;
      } catch (insertError) {
        errorCount++;
        errors.push({
          row: i + 2, // +2 porque es 0-indexed y hay header
          data: record,
          error: insertError.message
        });
        logger.error(`Error insertando fila ${i + 2}:`, insertError);
        
        // Si hay muchos errores, abortar
        if (errorCount > 100) {
          logger.error('Demasiados errores, abortando importación');
          break;
        }
      }
    }

    logger.info(`Importación completada - Insertados: ${insertedCount}, Errores: ${errorCount}`);

    res.json({
      success: true,
      message: 'Importación completada',
      data: {
        batchId,
        totalRows: records.length,
        inserted: insertedCount,
        errors: errorCount,
        errorDetails: errors.length > 0 ? errors.slice(0, 10) : [] // Solo primeros 10 errores
      }
    });

  } catch (error) {
    logger.error('Error en importación CSV:', error);
    res.status(500).json({
      success: false,
      message: 'Error al importar archivo CSV',
      error: error.message
    });
  }
};

/**
 * GET /api/import/batches
 * Lista todos los batches de importación
 */
const listarBatches = async (req, res) => {
  try {
    const query = `
      SELECT 
        load_batch_id,
        MIN(load_timestamp) as fecha_importacion,
        COUNT(*) as total_registros,
        SUM(CASE WHEN load_status = 'PENDING' THEN 1 ELSE 0 END) as pendientes,
        SUM(CASE WHEN load_status = 'PROCESSED' THEN 1 ELSE 0 END) as procesados,
        SUM(CASE WHEN load_status = 'ERROR' THEN 1 ELSE 0 END) as errores
      FROM stg.Claudio_Modelos
      GROUP BY load_batch_id
      ORDER BY MIN(load_timestamp) DESC
    `;

    const batches = await db.queryRaw(query);

    res.json({
      success: true,
      data: batches
    });
  } catch (error) {
    logger.error('Error listando batches:', error);
    res.status(500).json({
      success: false,
      message: 'Error al listar batches',
      error: error.message
    });
  }
};

/**
 * GET /api/import/batches/:batchId
 * Obtiene detalles de un batch específico
 */
const obtenerBatch = async (req, res) => {
  try {
    const { batchId } = req.params;

    const registros = await db.queryWithParams(
      'SELECT * FROM stg.Claudio_Modelos WHERE load_batch_id = @p0 ORDER BY load_id',
      [batchId]
    );

    if (!registros || registros.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Batch no encontrado'
      });
    }

    res.json({
      success: true,
      data: {
        batchId,
        registros
      }
    });
  } catch (error) {
    logger.error('Error obteniendo batch:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener batch',
      error: error.message
    });
  }
};

/**
 * POST /api/import/batches/:batchId/process
 * Procesa un batch y lo mueve a las tablas de trabajo (Marca, Modelo, etc)
 */
const procesarBatch = async (req, res) => {
  try {
    const { batchId } = req.params;

    // Obtener registros pendientes del batch
    const registros = await db.queryWithParams(
      'SELECT * FROM stg.Claudio_Modelos WHERE load_batch_id = @p0 AND load_status = @p1',
      [batchId, 'PENDING']
    );

    if (!registros || registros.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No hay registros pendientes en este batch'
      });
    }

    let procesados = 0;
    let errores = 0;
    const erroresDetalle = [];

    for (const reg of registros) {
      try {
        // 1. Verificar/crear marca
        let marca = await db.queryWithParams(
          'SELECT MarcaID FROM Marca WHERE LOWER(Descripcion) = LOWER(@p0)',
          [reg.marca]
        );

        let marcaId;
        if (!marca || marca.length === 0) {
          // Crear nueva marca
          const nuevaMarca = await db.insert('Marca', {
            CodigoMarca: reg.marca.substring(0, 10).toUpperCase(),
            Descripcion: reg.marca,
            ShortName: reg.marca,
            Origen: reg.origen
          });
          marcaId = nuevaMarca.MarcaID;
          logger.info(`Nueva marca creada: ${reg.marca} (ID: ${marcaId})`);
        } else {
          marcaId = marca[0].MarcaID;
        }

        // 2. Crear/actualizar modelo
        const modeloData = {
          MarcaID: marcaId,
          CodigoModelo: `${reg.marca.substring(0, 3).toUpperCase()}-${reg.modelo.substring(0, 10).toUpperCase()}`,
          DescripcionModelo: reg.modelo,
          Familia: reg.modelo,
          OrigenCodigo: reg.origen,
          CombustibleCodigo: reg.combustible,
          Anio: reg.anio ? parseInt(reg.anio) : null,
          Tipo: reg.tipo,
          CategoriaCodigo: reg.categoria,
          SegmentacionAutodata: reg.segmento,
          CC: reg.cc ? parseInt(reg.cc) : null,
          HP: reg.hp ? parseFloat(reg.hp) : null,
          Traccion: reg.traccion,
          Caja: reg.caja,
          Turbo: reg.turbo === 'Si' || reg.turbo === '1' || reg.turbo === 'true',
          Puertas: reg.puertas ? parseInt(reg.puertas) : null,
          Pasajeros: reg.pasajeros ? parseInt(reg.pasajeros) : null,
          Estado: 'importado',
          EstadoID: 1 // IMPORTADO
        };

        const nuevoModelo = await db.insert('Modelo', modeloData);
        const modeloId = nuevoModelo.ModeloID;

        // 3. Crear versión si hay datos
        if (reg.version) {
          await db.insert('VersionModelo', {
            ModeloID: modeloId,
            CodigoVersion: reg.version.substring(0, 50),
            Descripcion: reg.version,
            OrigenCodigo: reg.origen
          });
        }

        // 4. Agregar precio si existe
        if (reg.precio) {
          await db.insert('PrecioModelo', {
            ModeloID: modeloId,
            Precio: parseFloat(reg.precio),
            Moneda: reg.moneda || 'USD',
            FechaVigenciaDesde: new Date(),
            Fuente: 'Claudio CSV Import'
          });
        }

        // Marcar como procesado
        await db.update('stg.Claudio_Modelos', 'load_id', reg.load_id, {
          load_status: 'PROCESSED'
        });

        procesados++;

      } catch (error) {
        errores++;
        erroresDetalle.push({
          load_id: reg.load_id,
          marca: reg.marca,
          modelo: reg.modelo,
          error: error.message
        });

        // Marcar como error
        await db.update('stg.Claudio_Modelos', 'load_id', reg.load_id, {
          load_status: 'ERROR',
          load_error_message: error.message
        });

        logger.error(`Error procesando registro ${reg.load_id}:`, error);
      }
    }

    res.json({
      success: true,
      message: 'Procesamiento completado',
      data: {
        batchId,
        total: registros.length,
        procesados,
        errores,
        erroresDetalle: erroresDetalle.slice(0, 10)
      }
    });

  } catch (error) {
    logger.error('Error procesando batch:', error);
    res.status(500).json({
      success: false,
      message: 'Error al procesar batch',
      error: error.message
    });
  }
};

/**
 * DELETE /api/import/batches/:batchId
 * Elimina un batch de staging
 */
const eliminarBatch = async (req, res) => {
  try {
    const { batchId } = req.params;

    await db.queryWithParams(
      'DELETE FROM stg.Claudio_Modelos WHERE load_batch_id = @p0',
      [batchId]
    );

    res.json({
      success: true,
      message: 'Batch eliminado exitosamente'
    });
  } catch (error) {
    logger.error('Error eliminando batch:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar batch',
      error: error.message
    });
  }
};

module.exports = {
  upload, // Export multer middleware
  importarCSV,
  listarBatches,
  obtenerBatch,
  procesarBatch,
  eliminarBatch
};
