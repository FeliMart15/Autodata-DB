const multer = require('multer');
const { parse } = require('csv-parse/sync');
const db = require('../config/db-simple');
const logger = require('../config/logger');
const { asegurarEquipamientoVacio } = require('../utils/modeloHelper');

const xlsx = require('xlsx');

// Normalization Helpers
const normalizeKey = (key) => key.trim().toLowerCase().replace(/[\s_.-]+/g, '');
const toBool = (val) => {
  if (val === null || val === undefined || val === '') return null;
  const str = String(val).trim().toLowerCase();
  if (['1', 'si', 'sí', 'true', 'x', 'yes', 'y'].includes(str)) return true;
  if (['0', 'no', 'false', 'n'].includes(str)) return false;
  return null;
};
const toNum = (val, type) => {
  if (val === null || val === undefined || val === '') return null;
  const parsed = type === 'int' ? parseInt(val, 10) : parseFloat(String(val).replace(/[^0-9.-]+/g, ''));
  return isNaN(parsed) ? null : parsed;
};

// Helper to execute parameterized queries and log SQL+params on error for easier debugging
const execWithDebug = async (sqlText, params = []) => {
  // Build processedQuery the same way db.queryWithParams does so we can log the final SQL
  try {
    let processedQuery = sqlText;
    // Replace in descending order (@p176 before @p17) to avoid accidental substring replacement (e.g. @p1 inside @p10)
    for (let index = params.length - 1; index >= 0; index--) {
      const param = params[index];
      const placeholder = `@p${index}`;
      let value;
      if (param === null || param === undefined) {
        value = 'NULL';
      } else if (typeof param === 'string') {
        value = `N'${param.replace(/'/g, "''")}'`;
      } else if (typeof param === 'number') {
        value = Number.isFinite(param) ? param.toString() : 'NULL';
      } else if (typeof param === 'boolean') {
        value = param ? '1' : '0';
      } else if (param instanceof Date) {
        value = `'${param.toISOString()}'`;
      } else {
        value = `N'${JSON.stringify(param).replace(/'/g, "''")}'`;
      }
      processedQuery = processedQuery.replace(new RegExp(placeholder, 'g'), value);
    }

    // Log the expanded SQL at debug level
    logger.debug('Executing SQL', { processedQuery, params });

    // Execute the processed query
    return await db.queryRaw(processedQuery);
  } catch (err) {
    try {
      logger.error('SQL execution error', { sqlTemplate: sqlText, params, message: err.message, stack: err.stack });
    } catch (logErr) {
      console.error('Failed to log SQL error', logErr);
    }
    throw err;
  }
};

// Configuration de multer para archivos en memoria
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB máximo
  },
  fileFilter: (req, file, cb) => {
    const isCsv = file.mimetype === 'text/csv' || file.originalname.endsWith('.csv');
    const isExcel = file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || file.originalname.endsWith('.xlsx');
    
    if (isCsv || isExcel) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten archivos CSV o Excel (.xlsx)'), false);
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
          // Marca.MarcaID no tiene IDENTITY: hay que asignar el ID manualmente.
          // Usamos MAX(MarcaID)+1 para no colisionar con los IDs del import Excel (MARCOD).
          const nextIdResult = await db.queryRaw('SELECT ISNULL(MAX(MarcaID), 0) + 1 AS NextID FROM Marca');
          const nextMarcaId = nextIdResult[0].NextID;
          const nuevaMarca = await db.insert('Marca', {
            MarcaID: nextMarcaId,
            CodigoMarca: reg.marca.substring(0, 10).toUpperCase(),
            Descripcion: reg.marca,
            ShortName: reg.marca,
            Origen: reg.origen || null
          });
          marcaId = nuevaMarca.MarcaID;
          logger.info(`Nueva marca creada: ${reg.marca} (ID: ${marcaId})`);
        } else {
          marcaId = marca[0].MarcaID;
        }

        // 2. Crear/actualizar modelo
        // Build modeloData mapping minimal fields from the staged row.
        // Estado se guarda como texto ('importado') — EstadoID no se usa porque
        // EstadoCatalogo es una tabla de referencia que no se seedea ni se consume en el flujo real.
        const modeloData = {
          MarcaID: marcaId,
          CodigoModelo: `${reg.marca.substring(0, 3).toUpperCase()}-${String(reg.modelo || '').substring(0, 10).toUpperCase()}`,
          DescripcionModelo: reg.modelo,
          Familia: reg.familia || reg.modelo,
          OrigenCodigo: reg.origen || reg.Origen || null,
          CombustibleCodigo: reg.combustible || reg.Combustible || null,
          Anio: reg.anio ? parseInt(reg.anio) : null,
          Tipo: reg.tipo || reg.Tipo || null,
          CategoriaCodigo: reg.categoria || reg.Categoria || null,
          SegmentacionAutodata: reg.segmento || reg.Segmento || null,
          CC: reg.cc ? parseInt(String(reg.cc).replace(',', '.')) : (reg.CC ? parseInt(String(reg.CC).replace(',', '.')) : null),
          HP: reg.hp ? parseFloat(String(reg.hp).replace(',', '.')) : (reg.HP ? parseFloat(String(reg.HP).replace(',', '.')) : null),
          Traccion: reg.traccion || reg.Traccion || null,
          Caja: reg.caja || reg.Caja || null,
          Turbo: (String(reg.turbo || reg.Turbo || '').toLowerCase() === 'si' || String(reg.turbo || reg.Turbo || '') === '1'),
          Puertas: reg.puertas ? parseInt(reg.puertas) : (reg.Puertas ? parseInt(reg.Puertas) : null),
          Pasajeros: reg.pasajeros ? parseInt(reg.pasajeros) : (reg.Pasajeros ? parseInt(reg.Pasajeros) : null),
          Importador: reg.importador || reg.Importador || null,
          CodigoAutodata: reg.codigoautodata || reg.CodigoAutodata || null,
          // NOTA: 'Origen' no existe como columna en Modelo. El origen va en OrigenCodigo (arriba).
          Estado: 'importado'
        };

        // Ensure CodigoAutodata does not exceed DB length: try to query COLUMN property length if possible
        try {
          if (modeloData.CodigoAutodata) {
            const col = await db.queryRaw("SELECT CHARACTER_MAXIMUM_LENGTH as len FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Modelo' AND COLUMN_NAME = 'CodigoAutodata'");
            const maxLen = col && col[0] && col[0].len ? parseInt(col[0].len) : null;
            if (maxLen && String(modeloData.CodigoAutodata).length > maxLen) {
              logger.warn('CodigoAutodata demasiado largo, truncando', { value: modeloData.CodigoAutodata, maxLen });
              modeloData.CodigoAutodata = String(modeloData.CodigoAutodata).substring(0, maxLen);
            }
          }
          } catch (e) {
            logger.warn('No se pudo verificar longitud de CodigoAutodata', e.message);
          }

        const nuevoModelo = await db.insert('Modelo', modeloData);
        const modeloId = nuevoModelo.ModeloID;

        // Unificación: todo modelo arranca con su fila 1:1 de equipamiento (vacía)
        await asegurarEquipamientoVacio(modeloId);

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

/**
 * POST /api/import/excel-modelos
 * Importa modelos desde un Excel validando y manteniendo IDs (MARCOD, MARMODCOD, FAMCOD)
 */
const importarExcelAutos = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No se proporcionó archivo excel' });
    const xlsx = require('xlsx');
    const rows = xlsx.utils.sheet_to_json(xlsx.read(req.file.buffer, { type: 'buffer' }).Sheets[xlsx.read(req.file.buffer, { type: 'buffer' }).SheetNames[0]], { header: 1 });
    if (rows.length < 2) return res.status(400).json({ success: false, message: 'Archivo vacío' });
    const getIdx = (name) => rows[0].findIndex(h => h === name);
    const cols = { marcod: getIdx('MARCOD'), mardsc: getIdx('MARDSC'), marmodcod: getIdx('MARMODCOD'), marmoddsc: getIdx('MARMODDSC'), famdsc: getIdx('FAMDSC'), combdsc: getIdx('COMBDSC'), catdsc: getIdx('CATDSC'), maevalor: getIdx('MAEVALOR') };
    if (cols.marcod === -1 || cols.mardsc === -1 || cols.marmodcod === -1 || cols.marmoddsc === -1) return res.status(400).json({ success: false, message: 'Faltan columnas requeridas' });

    const modelosArray = [];
    for (let i = 1; i < rows.length; i++) {
      const r = rows[i];
      if (!r || r.length === 0 || r[cols.marcod] == null) continue;
      const codMarcaDigits = String(r[cols.marcod]).replace(/\D+/g, '').trim();
      const codModeloDigits = String(r[cols.marmodcod]).replace(/\D+/g, '').trim();
      if (!codMarcaDigits || !codModeloDigits) continue;
      modelosArray.push({ codMarca: codMarcaDigits.padStart(4, '0').slice(-4), marcaDesc: r[cols.mardsc] ? String(r[cols.mardsc]).trim() : '', codModelo: codModeloDigits.padStart(4, '0').slice(-4), modeloDesc: r[cols.marmoddsc] ? String(r[cols.marmoddsc]).trim() : '', familiaDesc: cols.famdsc !== -1 && r[cols.famdsc] ? String(r[cols.famdsc]).trim() : null, combustible: cols.combdsc !== -1 && r[cols.combdsc] ? String(r[cols.combdsc]).trim() : null, categoria: cols.catdsc !== -1 && r[cols.catdsc] ? String(r[cols.catdsc]).trim() : null, precio: cols.maevalor !== -1 && r[cols.maevalor] ? parseFloat(r[cols.maevalor]) : null });
    }

    const usuarioId = req.user ? req.user.UsuarioID || req.user.id || 1 : 1;
    let creados = { marcas: 0, modelos: 0, familias: 0 };
    const marcaIdMap = new Map();
    const familiaIdMap = new Map();
    for (const mod of modelosArray) {
      if (!marcaIdMap.has(mod.codMarca)) {
         const marcaIdInt = parseInt(mod.codMarca, 10);
         if (Number.isNaN(marcaIdInt)) continue;

         // Buscar por MarcaID exacto o por CodigoMarca
         let dbMarca = await db.queryWithParams('SELECT MarcaID FROM Marca WHERE MarcaID = @p0 OR CodigoMarca = @p1', [marcaIdInt, mod.codMarca]);
         if (dbMarca.length === 0) {
           try {
             // INSERT directo con ID explícito (la tabla ya NO tiene IDENTITY, controlamos el valor)
             const marcaDescSafe = mod.marcaDesc.replace(/'/g, "''");
             await db.queryRaw(
               `INSERT INTO Marca (MarcaID, Descripcion, CodigoMarca) VALUES (${marcaIdInt}, N'${marcaDescSafe}', '${mod.codMarca}')`
             );
             marcaIdMap.set(mod.codMarca, marcaIdInt);
             creados.marcas++;
           } catch(err) {
             const checkMarca = await db.queryWithParams('SELECT MarcaID FROM Marca WHERE MarcaID = @p0 OR CodigoMarca = @p1', [marcaIdInt, mod.codMarca]);
             if (checkMarca.length > 0) {
               marcaIdMap.set(mod.codMarca, checkMarca[0].MarcaID);
             } else {
               logger.warn(`No se pudo insertar marca ID=${marcaIdInt} (${mod.marcaDesc}): ${err.message}. Se omite.`);
             }
           }
         } else { marcaIdMap.set(mod.codMarca, dbMarca[0].MarcaID); }
      }
      const dbMarcaId = marcaIdMap.get(mod.codMarca);
      if (!dbMarcaId) continue;

      // Resolver FamiliaID: buscar o crear el registro en tabla Familia
      let familiaId = null;
      if (mod.familiaDesc) {
        const familiaKey = `${dbMarcaId}|${mod.familiaDesc.toLowerCase()}`;
        if (familiaIdMap.has(familiaKey)) {
          familiaId = familiaIdMap.get(familiaKey);
        } else {
          try {
            const famExists = await db.queryWithParams(
              `SELECT TOP 1 FamiliaID FROM Familia WHERE MarcaID = @p0 AND LTRIM(RTRIM(Nombre)) COLLATE Latin1_General_CI_AI = LTRIM(RTRIM(@p1)) COLLATE Latin1_General_CI_AI`,
              [dbMarcaId, mod.familiaDesc]
            );
            if (famExists.length > 0) {
              familiaId = famExists[0].FamiliaID;
            } else {
              const famInsert = await db.queryWithParams(
                `INSERT INTO Familia (MarcaID, Nombre, Activo, FechaCreacion) OUTPUT INSERTED.FamiliaID VALUES (@p0, @p1, 1, GETDATE())`,
                [dbMarcaId, mod.familiaDesc]
              );
              if (famInsert && famInsert.length > 0) {
                familiaId = famInsert[0].FamiliaID;
                creados.familias++;
              }
            }
            if (familiaId) familiaIdMap.set(familiaKey, familiaId);
          } catch(famErr) {
            logger.warn(`Error resolviendo familia "${mod.familiaDesc}" para MarcaID=${dbMarcaId}: ${famErr.message}`);
          }
        }
      }

      const codigoAutodata = `${mod.codMarca}${mod.codModelo}`;
      const modExists = await db.queryWithParams(`SELECT ModeloID FROM Modelo WHERE CodigoAutodata = @p0 OR (MarcaID = @p1 AND CodigoModelo = @p2)`, [codigoAutodata, dbMarcaId, mod.codModelo]);
      // Si el modelo ya existe, saltear completamente (no duplicar ni precio)
      if (modExists.length > 0) continue;

      const insertMod = await db.queryWithParams(`INSERT INTO Modelo (MarcaID, CodigoModelo, CodigoAutodata, DescripcionModelo, Familia, FamiliaID, CombustibleCodigo, CategoriaCodigo, Estado, Activo, ModificadoPorID, PrecioInicial) OUTPUT INSERTED.ModeloID VALUES (@p0, @p1, @p2, @p3, @p4, @p5, @p6, @p7, 'importado', 1, @p8, @p9)`, [dbMarcaId, mod.codModelo, codigoAutodata, mod.modeloDesc, mod.familiaDesc, familiaId, mod.combustible, mod.categoria, usuarioId, mod.precio]);
      if (insertMod && insertMod.length > 0) {
        const modeloIdDb = insertMod[0].ModeloID;
        await db.queryWithParams(`INSERT INTO ModeloHistorial (ModeloID, Campo, ValorAnterior, ValorNuevo, Usuario) VALUES (@p0, 'Estado', NULL, 'importado', 'Sistema')`, [modeloIdDb]);
        creados.modelos++;
        if (mod.precio != null && !isNaN(mod.precio)) {
          await db.queryWithParams(`INSERT INTO PrecioModelo (ModeloID, Precio, Moneda, FechaVigenciaDesde, Fuente, FechaCarga) VALUES (@p0, @p1, 'USD', GETDATE(), 'Precio importado Excel', GETDATE())`, [modeloIdDb, mod.precio]);
        }
        // Unificación: todo modelo importado arranca con su fila 1:1 de equipamiento (vacía)
        await asegurarEquipamientoVacio(modeloIdDb);
      }
    }
    return res.json({ success: true, message: 'Importación completada', data: { creados } });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error al importar:' + error.message });
  }
};

const importarExcelPrecios = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'Archivo no proporcionado.' });

    const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

    const creados = { precios: 0, ignorados: 0 };
    const usuarioId = req.user?.id || 1; // Ajusta si el auth token manda distinto el id

    for (const row of data) {
      const codigoAutodata = row['CODIGO CONCATENADO']?.toString().trim();
      let ultimoPrecio = row['ULTIMO PRECIO'];

      if (!codigoAutodata) continue;
      
      // Limpiar precio (puede venir como ' USD 25.000', o '#N/A')
      if (typeof ultimoPrecio === 'string') {
        ultimoPrecio = parseFloat(ultimoPrecio.replace(/[^\d.-]/g, ''));
      }
      
      if (!ultimoPrecio || isNaN(ultimoPrecio)) {
        creados.ignorados++;
        continue;
      }

      // Buscar modelo por codigo concatenado
      const modExists = await db.queryWithParams(`SELECT ModeloID FROM Modelo WHERE CodigoAutodata = @p0`, [codigoAutodata]);
      if (modExists.length > 0) {
        const modeloIdDb = modExists[0].ModeloID;

        // Validar si ese precio ya es el actual, o insertar uno nuevo
        // Para simplificar, inserta uno nuevo siempre que actualizamos
        await db.queryWithParams(
          `INSERT INTO PrecioModelo (ModeloID, Precio, Moneda, FechaVigenciaDesde, Fuente, FechaCarga) VALUES (@p0, @p1, 'USD', GETDATE(), 'Actualización por Excel Tabulado', GETDATE())`,
          [modeloIdDb, ultimoPrecio]
        );

        // Opcional: Actualizar el PrecioInicial del modelo
        await db.queryWithParams(`UPDATE Modelo SET PrecioInicial = @p0 WHERE ModeloID = @p1`, [ultimoPrecio, modeloIdDb]);

        creados.precios++;
        } else {
          creados.ignorados++;
        }
      }

    return res.status(200).json({ success: true, message: 'Precios importados con éxito', creados });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error al importar precios: ' + error.message });
  }
};



const descargarTemplateCompleto = async (req, res) => {
  try {
    const fs = require('fs');
    const path = require('path');
    const filePath = path.join(__dirname, '../../data/Plantilla Maestra.xlsx');
    
    if (fs.existsSync(filePath)) {
      return res.download(filePath, 'Plantilla_Maestra.xlsx');
    } else {
      return res.status(404).json({ success: false, message: 'La plantilla no existe en el servidor.' });
    }
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error al descargar plantilla: ' + error.message });
  }
};

const importarExcelCompleto = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'Archivo no proporcionado.' });

    const xlsx = require('xlsx');
    const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    // Row 1 has numeric column codes; row 2 has the actual column headers → skip row 1
    const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName], { defval: null, range: 1 });
    // Parse as raw array of arrays to allow positional access (e.g. col 188 = TIPO)
    const dataRaw = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName], { header: 1, defval: null });
    // dataRaw[0] = row 1 (numeric codes), dataRaw[1] = row 2 (headers), dataRaw[2+] = data rows
    let rawRowIndex = 0;

    const creados = { modelos: 0, familias: 0, equipamiento_inserts: 0, equipamiento_updates: 0, precios: 0, omitidos_marca: 0 };

    // Discover Equipment columns & types dynamically
    const colsInfoQuery = await db.queryRaw("SELECT COLUMN_NAME as name, DATA_TYPE as type FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'EquipamientoModelo' AND COLUMN_NAME NOT IN ('EquipamientoID', 'ModeloID')");
    
    // Map DB columns to normalized keys for row matching
    const dbEquipCols = colsInfoQuery.map(c => ({
      dbName: c.name, 
      normKey: normalizeKey(c.name),
      isNumeric: ['int', 'decimal', 'numeric', 'float', 'real'].includes(c.type.toLowerCase()),
      isBit: c.type.toLowerCase() === 'bit'
    }));

    const marcaIdMap = new Map();
    const familiaIdMap = new Map();

    for (const row of data) {
      // Normalize row keys for alias mapping
      const normRow = {};
      for (const key in row) {
        if (key !== '__rawRow') normRow[normalizeKey(key)] = row[key];
      }

      // Acceso posicional por índice de columna (dataRaw[0]=fila1, dataRaw[1]=headers, dataRaw[2+]=datos)
      const rawRow = dataRaw[rawRowIndex + 2] || [];
      rawRowIndex++;

      // Alias: Excel puede tener "Tablero Digital" (normKey "tablerodigital") que va a la columna DB Tablerodigital,
      // pero el export lee TablerDigital. Si el Excel usó la variante larga, copiamos al normKey correcto.
      if (normRow['tablerodigital'] !== undefined && normRow['tablerdigital'] === undefined) {
        normRow['tablerdigital'] = normRow['tablerodigital'];
      }
      if (normRow['tablerodigital3d'] !== undefined && normRow['tablerdigital3d'] === undefined) {
        normRow['tablerdigital3d'] = normRow['tablerodigital3d'];
      }
      // Alias: el header legacy "C_3raFiladeasientoselctricos" del template mapea a la columna limpia TerceraFilaAsientosElectricos.
      if (normRow['c3rafiladeasientoselctricos'] !== undefined && normRow['tercerafilaasientoselectricos'] === undefined) {
        normRow['tercerafilaasientoselectricos'] = normRow['c3rafiladeasientoselctricos'];
      }
      // Alias: header legacy "AutonomadelmotorelctricoBEVyPHEV" → columna limpia AutonomiaMotorElectricoBEVPHEV (dato propio, NO duplica AutonomiaMaxRange).
      if (normRow['autonomadelmotorelctricobevyphev'] !== undefined && normRow['autonomiamotorelectricobevphev'] === undefined) {
        normRow['autonomiamotorelectricobevphev'] = normRow['autonomadelmotorelctricobevyphev'];
      }

      // Aliases para las columnas duplicadas al final del Excel (índices 180-183) cuyos nombres abreviados
      // no coinciden con los nombres reales de la DB. Solo se aplican si la columna correcta aún no tiene valor.
      // [114] C_3raFiladeasientoselctricos  → DB: TerceraFilaAsientosElectricos
      if (normRow['c3rafiladeasientoselctricos'] !== undefined && normRow['tercerafilaasientoselectricos'] === undefined)
        normRow['tercerafilaasientoselectricos'] = normRow['c3rafiladeasientoselctricos'];
      // [180] Bloqueodiferencialporterreno  → DB: BloqueDiferencialTerreno
      if (normRow['bloqueodiferencialporterreno'] !== undefined && normRow['bloquediferencialterreno'] === undefined)
        normRow['bloquediferencialterreno'] = normRow['bloqueodiferencialporterreno'];
      // [181] Asientosconmasajeadornmero    → DB: AsientosMasajeador
      if (normRow['asientosconmasajeadornmero'] !== undefined && normRow['asientosmasajeador'] === undefined)
        normRow['asientosmasajeador'] = normRow['asientosconmasajeadornmero'];
      // [182] AutonomadelmotorelctricoBEVyPHEV → ya mapeado arriba a su columna propia
      //       AutonomiaMotorElectricoBEVPHEV (NO se mapea a AutonomiaMaxRange: son datos distintos).
      // [183] Apoyabrazocentraldeasientotrasero → DB: ApoyabrazosCentralTrasero
      if (normRow['apoyabrazocentraldeasientotrasero'] !== undefined && normRow['apoyabrazoscentraltrasero'] === undefined)
        normRow['apoyabrazoscentraltrasero'] = normRow['apoyabrazocentraldeasientotrasero'];

      const codMarcaRaw = normRow['codigomarca'] || normRow['codmarca'] || row['Codigo_Marca'] || row['Codigo Marca'] || '';
      const codMarcaDigits = String(codMarcaRaw).replace(/\D+/g, '').trim();
      if (!codMarcaDigits) continue;
      const codMarca = codMarcaDigits.padStart(4, '0').slice(-4);
      const marcaDesc = String(normRow['marca'] || row['Marca'] || '').trim();

      const codModeloRaw = normRow['codigomodelo'] || normRow['codmodelo'] || row['Codigo_Modelo'] || row['Codigo Modelo'] || '';
      const codModeloDigits = String(codModeloRaw).replace(/\D+/g, '').trim();
      if (!codModeloDigits) continue;
      const codModelo = codModeloDigits.padStart(4, '0').slice(-4);
      const modeloDesc = String(normRow['descripcionmodelo'] || row['Descripcion_Modelo'] || '').trim();  
      const familiaDesc = normRow['familia'] ? String(normRow['familia']).trim() : null;
      
      let precioVal = normRow['preciousd'] || row['Precio_USD'];
      let precioNum = toNum(precioVal, 'decimal');

      let codigoAutodata = String(normRow['codconcatenado'] || normRow['codigoconcatenado'] || row['CODIGO CONCATENADO'] || '').trim();
      if (!codigoAutodata) codigoAutodata = `${codMarca}${codModelo}`;
      if (codigoAutodata.length > 8) codigoAutodata = codigoAutodata.substring(0, 8); // truncate to preserve schema

      // 1. Marca lookup only: no crear/editar marcas desde import maestro
      if (!marcaIdMap.has(codMarca)) {
        const marcaIdInt = parseInt(codMarca, 10);
        if (Number.isNaN(marcaIdInt)) continue;
        // Buscar por CodigoMarca exacto O por el número sin ceros al frente (ej: "0170" → "170")
        const codMarcaSinCeros = String(marcaIdInt);
        let marcaExists = await execWithDebug(
          `SELECT TOP 1 MarcaID FROM Marca WHERE CodigoMarca = @p0 OR CodigoMarca = @p1`,
          [codMarca, codMarcaSinCeros]
        );

        if (marcaExists.length === 0 && marcaDesc) {
          // Búsqueda por nombre: acepta coincidencia exacta o que el nombre en DB
          // empiece con el nombre del Excel (ej: Excel="BYD", DB="BYD AUTO")
          marcaExists = await execWithDebug(
            `SELECT TOP 1 MarcaID FROM Marca WHERE LTRIM(RTRIM(Descripcion)) COLLATE Latin1_General_CI_AI = LTRIM(RTRIM(@p0)) COLLATE Latin1_General_CI_AI
             OR LTRIM(RTRIM(Descripcion)) COLLATE Latin1_General_CI_AI LIKE LTRIM(RTRIM(@p0)) + ' %' COLLATE Latin1_General_CI_AI`,
            [marcaDesc, marcaDesc]
          );
        }

        if (marcaExists.length === 0) {
          creados.omitidos_marca++;
          continue;
        } else {
          marcaIdMap.set(codMarca, marcaExists[0].MarcaID);
        }
      }
      const dbMarcaId = marcaIdMap.get(codMarca);
      if (!dbMarcaId) continue;

      // 1.1 Resolver FamiliaID para que aparezca en selectores de ventas/empadronamientos
      let familiaId = null;
      if (familiaDesc) {
        const familiaKey = `${dbMarcaId}|${familiaDesc.toLowerCase()}`;
        if (familiaIdMap.has(familiaKey)) {
          familiaId = familiaIdMap.get(familiaKey);
        } else {
          const famExists = await execWithDebug(
            `SELECT TOP 1 FamiliaID FROM Familia WHERE MarcaID = @p0 AND LTRIM(RTRIM(Nombre)) COLLATE Latin1_General_CI_AI = LTRIM(RTRIM(@p1)) COLLATE Latin1_General_CI_AI`,
            [dbMarcaId, familiaDesc]
          );

          if (famExists.length > 0) {
            familiaId = famExists[0].FamiliaID;
          } else {
            const famInsert = await execWithDebug(
              `INSERT INTO Familia (MarcaID, Nombre, Activo, FechaCreacion) OUTPUT INSERTED.FamiliaID VALUES (@p0, @p1, 1, GETDATE())`,
              [dbMarcaId, familiaDesc]
            );
            if (famInsert.length > 0) {
              familiaId = famInsert[0].FamiliaID;
              creados.familias++;
            }
          }

          if (familiaId) familiaIdMap.set(familiaKey, familiaId);
        }
      }

      // 2. Modelo Upsert
      const modExists = await execWithDebug(`SELECT ModeloID FROM Modelo WHERE CodigoAutodata = @p0 OR (MarcaID = @p1 AND CodigoModelo = @p2)`, [codigoAutodata, dbMarcaId, codModelo]);
      let modeloIdDb = null;

      // Extract basic minimum data from the row
      const anioNum = toNum(normRow['año'] || normRow['anio'], 'int');
      // Col 7 "Categoria" in Excel = SegmentacionAutodata in DB (e.g. "SUV y CROSSOVER")
      const segmentoDesc = String(normRow['categoria'] || '').trim() || null;
      // Col 188 "Tipo" (pos 187 base-0) → Modelo.Tipo; store literally so the form shows exactly what's in the Excel
      const tipoRaw = String(rawRow[187] != null ? rawRow[187] : (normRow['tipo'] || '')).trim();
      const tipoDesc = tipoRaw || null;
      // carroceria comes from the TIPO2Carrocera column, NOT from "Tipo" which is automóvil/comercial
      const carroceriaDesc = String(normRow['tipo2carrocera'] || normRow['carrocería'] || normRow['carroceria'] || '').trim() || null;
      const origenDesc = String(normRow['origen'] || '').trim() || null;
      const importadorDesc = String(normRow['importador'] || '').trim() || null;
      const tipoMotorDesc = String(normRow['tipomotor'] || '').trim() || null;
      const vehiculoElectricoDesc = String(normRow['tipodevehículoelectrico/híbrido'] || normRow['tipovehiculoelectrico/hibrido'] || normRow['tipovehiculoelectrico'] || '').trim() || null;
      // Bug fix: "Caja" col (index 26) = Automática/Manual → Modelo.TipoCajaAut (Bug 1)
      // "Tipo Caja Automática" col (index 186) goes to EquipamientoModelo.Caja (handled below)
      const tipoCajaDesc = String(normRow['caja'] || '').trim() || null;
      const cilinCcNum = toNum(normRow['cc'], 'int');
      const potenciaHpNum = toNum(normRow['hpcv'] || normRow['hp'] || normRow['potencia'], 'int');
      const cilindrosNum = toNum(normRow['cilindros'], 'int');
      const valvulasNum = toNum(normRow['valvulas'] || normRow['válvulas'] || normRow['vlvulas'], 'int');
      const puertasNum = toNum(normRow['numeropuertas'] || normRow['puertas'] || normRow['ndepuertas'], 'int');
      const asientosNum = toNum(normRow['numeroasientos'] || normRow['asientos'] || normRow['nmerodeasientos'], 'int');
      const combDesc = String(normRow['combustible'] || '').trim() || null;

      const precioIniNum = precioNum; // initial load maps to base price as well

      // Si el modelo ya existe, saltearlo completamente — NO sobreescribir
      if (modExists.length > 0) {
        creados.omitidos = (creados.omitidos || 0) + 1;
        continue;
      }

      const insertRes = await execWithDebug(`
          INSERT INTO Modelo (
            MarcaID, DescripcionModelo, CodigoModelo, CodigoAutodata, Familia,
            FamiliaID,
            Anio, SegmentacionAutodata, Carroceria, OrigenCodigo, Importador,
            TipoMotor, TipoVehiculoElectrico, TipoCajaAut, CC, HP,
            Cilindros, Valvulas, Puertas, Asientos, PrecioInicial, CombustibleCodigo,
            Tipo,
            Estado, Activo
          ) OUTPUT INSERTED.ModeloID VALUES (
            @p0, @p1, @p2, @p3, @p4,
            @p5,
            @p6, @p7, @p8, @p9, @p10,
            @p11, @p12, @p13, @p14, @p15,
            @p16, @p17, @p18, @p19, @p20, @p21,
            @p22,
            'definitivo', 1
          )`,
          [
            dbMarcaId, modeloDesc, codModelo, codigoAutodata, familiaDesc,
            familiaId,
            anioNum, segmentoDesc, carroceriaDesc, origenDesc, importadorDesc,
            tipoMotorDesc, vehiculoElectricoDesc, tipoCajaDesc, cilinCcNum, potenciaHpNum,
            cilindrosNum, valvulasNum, puertasNum, asientosNum, precioIniNum, combDesc,
            tipoDesc
          ]
        );
      modeloIdDb = insertRes[0].ModeloID;
      creados.modelos++;
      await execWithDebug(`INSERT INTO ModeloHistorial (ModeloID, Campo, ValorAnterior, ValorNuevo, Usuario) VALUES (@p0, 'Estado', NULL, 'definitivo', 'ImportacionMasiva')`, [modeloIdDb]);

      if (!modeloIdDb) continue;

      // 3. Insert PrecioModelo
      if (precioNum !== null) {
        await execWithDebug(`
          INSERT INTO PrecioModelo (ModeloID, Precio, Moneda, FechaVigenciaDesde, Fuente, FechaCarga)
          VALUES (@p0, @p1, 'USD', GETDATE(), 'Plantilla Maestra', GETDATE())
        `, [modeloIdDb, precioNum]);
        creados.precios++;
      }

      // 4. EquipamientoModelo Upsert (dynamic payloads by DB column types)
      // "Tipo Caja Automática" (col 186) is the detailed gearbox description → EquipamientoModelo.Caja
      // "Caja" (col 26) is Automática/Manual for Modelo.TipoCajaAut only — exclude it from equipment
      const tipoCajaAutoVal = normRow['tipocajaautomática']; // 'á' = U+00E1
      if (tipoCajaAutoVal !== undefined) {
        normRow['caja'] = tipoCajaAutoVal;
      } else {
        delete normRow['caja'];
      }

      const equipPayload = { ModeloID: modeloIdDb };
      for (const col of dbEquipCols) {
        let val = normRow[col.normKey];
        if (val !== undefined && val !== null && val !== '') {
          if (col.isBit) val = toBool(val);
          else if (col.isNumeric) val = toNum(val, 'decimal');
          equipPayload[col.dbName] = val;
        }
      }

      const eqExists = await execWithDebug(`SELECT EquipamientoID FROM EquipamientoModelo WHERE ModeloID = @p0`, [modeloIdDb]);
      
      const payloadKeys = Object.keys(equipPayload).filter(k => k !== 'ModeloID');
      if (payloadKeys.length > 0) {
        try {
          if (eqExists.length === 0) {
            const keysStr = ['ModeloID', 'FechaCreacion', ...payloadKeys].join(', ');
            const valsIdx = ['@p0', 'GETDATE()', ...payloadKeys.map((_, i) => `@p${i + 1}`)].join(', ');
            const params = [modeloIdDb, ...payloadKeys.map(k => equipPayload[k])];
            await execWithDebug(`INSERT INTO EquipamientoModelo (${keysStr}) VALUES (${valsIdx})`, params);
            creados.equipamiento_inserts++;
          } else {
            const updateStr = payloadKeys.map((k, i) => `${k} = @p${i + 1}`).join(', ');
            const params = [modeloIdDb, ...payloadKeys.map(k => equipPayload[k])];
            await execWithDebug(`UPDATE EquipamientoModelo SET ${updateStr} WHERE ModeloID = @p0`, params);
            creados.equipamiento_updates++;
          }
        } catch (equipErr) {
          // Si falla el equipamiento de un modelo (ej: overflow de tipo numérico),
          // logueamos el error y continuamos con el siguiente modelo sin abortar la importación.
          logger.warn(`Error cargando equipamiento para ModeloID=${modeloIdDb}: ${equipErr.message}`);
          creados.equipamiento_errors = (creados.equipamiento_errors || 0) + 1;
        }
      }

      // Unificación: si el modelo no recibió payload de equipamiento, igual queda
      // con su fila 1:1 vacía para mantener la misma estructura que el resto.
      await asegurarEquipamientoVacio(modeloIdDb);
    }

    return res.status(200).json({
      success: true,
      message: 'Archivo procesado con éxito',
      data: { creados }
    });
  } catch (error) {
    logger.error('Error procesando plantilla:', error);
    return res.status(500).json({ success: false, message: 'Error en la importación: ' + error.message });
  }
};

// POST /api/import/excel-minimos
// Importa SOLO datos mínimos (sin equipamiento). Acepta el mismo formato de la
// Plantilla Maestra (ignora las columnas de equipamiento). Los modelos quedan en
// estado 'minimos_aprobados' (listos para cargar equipamiento). Upsert: si el
// modelo ya existe, rellena/actualiza sus datos mínimos SIN tocar equipamiento ni precio.
const importarExcelMinimos = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'Archivo no proporcionado.' });

    const xlsx = require('xlsx');
    const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const dataRaw = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName], { header: 1, defval: null });

    // Detectar el formato del encabezado:
    //  - Plantilla Maestra completa: fila 1 = códigos numéricos, fila 2 = nombres → headers en índice 1.
    //  - Plantilla de mínimos: fila 1 = nombres directamente → headers en índice 0.
    const primeraFila = (dataRaw[0] || []).filter(c => c !== null && String(c).trim() !== '');
    const esFilaDeCodigos = primeraFila.length > 0 && primeraFila.every(c => /^\d+$/.test(String(c).trim()));
    const headerRange = esFilaDeCodigos ? 1 : 0;
    const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName], { defval: null, range: headerRange });
    let rawRowIndex = 0;

    const resultado = { creados: 0, preservados: 0, familias: 0, omitidos_marca: 0, errores: 0 };
    const marcaIdMap = new Map();
    const familiaIdMap = new Map();

    for (const row of data) {
      try {
        const normRow = {};
        for (const key in row) {
          if (key !== '__rawRow') normRow[normalizeKey(key)] = row[key];
        }
        const rawRow = dataRaw[rawRowIndex + headerRange + 1] || [];
        rawRowIndex++;

        const codMarcaRaw = normRow['codigomarca'] || normRow['codmarca'] || row['Codigo_Marca'] || row['Codigo Marca'] || '';
        const codMarcaDigits = String(codMarcaRaw).replace(/\D+/g, '').trim();
        if (!codMarcaDigits) continue;
        const codMarca = codMarcaDigits.padStart(4, '0').slice(-4);
        const marcaDesc = String(normRow['marca'] || row['Marca'] || '').trim();

        const codModeloRaw = normRow['codigomodelo'] || normRow['codmodelo'] || row['Codigo_Modelo'] || row['Codigo Modelo'] || '';
        const codModeloDigits = String(codModeloRaw).replace(/\D+/g, '').trim();
        if (!codModeloDigits) continue;
        const codModelo = codModeloDigits.padStart(4, '0').slice(-4);
        const modeloDesc = String(normRow['descripcionmodelo'] || row['Descripcion_Modelo'] || '').trim();
        const familiaDesc = normRow['familia'] ? String(normRow['familia']).trim() : null;

        let codigoAutodata = String(normRow['codconcatenado'] || normRow['codigoconcatenado'] || row['CODIGO CONCATENADO'] || '').trim();
        if (!codigoAutodata) codigoAutodata = `${codMarca}${codModelo}`;
        if (codigoAutodata.length > 8) codigoAutodata = codigoAutodata.substring(0, 8);

        // 1. Marca: solo lookup (no se crean marcas desde el import de mínimos)
        if (!marcaIdMap.has(codMarca)) {
          const marcaIdInt = parseInt(codMarca, 10);
          if (Number.isNaN(marcaIdInt)) continue;
          const codMarcaSinCeros = String(marcaIdInt);
          let marcaExists = await execWithDebug(
            `SELECT TOP 1 MarcaID FROM Marca WHERE CodigoMarca = @p0 OR CodigoMarca = @p1`,
            [codMarca, codMarcaSinCeros]
          );
          if (marcaExists.length === 0 && marcaDesc) {
            marcaExists = await execWithDebug(
              `SELECT TOP 1 MarcaID FROM Marca WHERE LTRIM(RTRIM(Descripcion)) COLLATE Latin1_General_CI_AI = LTRIM(RTRIM(@p0)) COLLATE Latin1_General_CI_AI
               OR LTRIM(RTRIM(Descripcion)) COLLATE Latin1_General_CI_AI LIKE LTRIM(RTRIM(@p0)) + ' %' COLLATE Latin1_General_CI_AI`,
              [marcaDesc, marcaDesc]
            );
          }
          if (marcaExists.length === 0) { resultado.omitidos_marca++; continue; }
          marcaIdMap.set(codMarca, marcaExists[0].MarcaID);
        }
        const dbMarcaId = marcaIdMap.get(codMarca);
        if (!dbMarcaId) continue;

        // 1.1 Familia (resolver/crear para selectores de ventas/empadronamientos)
        let familiaId = null;
        if (familiaDesc) {
          const familiaKey = `${dbMarcaId}|${familiaDesc.toLowerCase()}`;
          if (familiaIdMap.has(familiaKey)) {
            familiaId = familiaIdMap.get(familiaKey);
          } else {
            const famExists = await execWithDebug(
              `SELECT TOP 1 FamiliaID FROM Familia WHERE MarcaID = @p0 AND LTRIM(RTRIM(Nombre)) COLLATE Latin1_General_CI_AI = LTRIM(RTRIM(@p1)) COLLATE Latin1_General_CI_AI`,
              [dbMarcaId, familiaDesc]
            );
            if (famExists.length > 0) familiaId = famExists[0].FamiliaID;
            else {
              const famInsert = await execWithDebug(
                `INSERT INTO Familia (MarcaID, Nombre, Activo, FechaCreacion) OUTPUT INSERTED.FamiliaID VALUES (@p0, @p1, 1, GETDATE())`,
                [dbMarcaId, familiaDesc]
              );
              if (famInsert.length > 0) { familiaId = famInsert[0].FamiliaID; resultado.familias++; }
            }
            if (familiaId) familiaIdMap.set(familiaKey, familiaId);
          }
        }

        // Datos mínimos (mismo parseo que la Plantilla Maestra)
        const anioNum = toNum(normRow['año'] || normRow['anio'], 'int');
        const segmentoDesc = String(normRow['categoria'] || '').trim() || null;
        const tipoRaw = String(rawRow[187] != null ? rawRow[187] : (normRow['tipo'] || '')).trim();
        const tipoDesc = tipoRaw || null;
        const carroceriaDesc = String(normRow['tipo2carrocera'] || normRow['carrocería'] || normRow['carroceria'] || '').trim() || null;
        const origenDesc = String(normRow['origen'] || '').trim() || null;
        const importadorDesc = String(normRow['importador'] || '').trim() || null;
        const tipoMotorDesc = String(normRow['tipomotor'] || '').trim() || null;
        const vehiculoElectricoDesc = String(normRow['tipodevehículoelectrico/híbrido'] || normRow['tipovehiculoelectrico/hibrido'] || normRow['tipovehiculoelectrico'] || '').trim() || null;
        const tipoCajaDesc = String(normRow['caja'] || '').trim() || null;
        const cilinCcNum = toNum(normRow['cc'], 'int');
        const potenciaHpNum = toNum(normRow['hpcv'] || normRow['hp'] || normRow['potencia'], 'int');
        const cilindrosNum = toNum(normRow['cilindros'], 'int');
        const valvulasNum = toNum(normRow['valvulas'] || normRow['válvulas'] || normRow['vlvulas'], 'int');
        const puertasNum = toNum(normRow['numeropuertas'] || normRow['puertas'] || normRow['ndepuertas'], 'int');
        const asientosNum = toNum(normRow['numeroasientos'] || normRow['asientos'] || normRow['nmerodeasientos'], 'int');
        const combDesc = String(normRow['combustible'] || '').trim() || null;
        const precioNum = toNum(normRow['preciousd'] || row['Precio_USD'], 'decimal');

        const modExists = await execWithDebug(
          `SELECT ModeloID FROM Modelo WHERE CodigoAutodata = @p0 OR (MarcaID = @p1 AND CodigoModelo = @p2)`,
          [codigoAutodata, dbMarcaId, codModelo]
        );

        if (modExists.length > 0) {
          // El import de mínimos NO pisa modelos existentes (ni en 'minimos_aprobados' ni en
          // 'definitivo' ni en ningún otro estado): solo crea los que aún no existen.
          // Los existentes se dejan intactos.
          resultado.preservados = (resultado.preservados || 0) + 1;
          continue;
        }

        {
          // Nuevo: crear con datos mínimos + precio + fila de equipamiento vacía.
          const insertRes = await execWithDebug(`
            INSERT INTO Modelo (
              MarcaID, DescripcionModelo, CodigoModelo, CodigoAutodata, Familia, FamiliaID,
              Anio, SegmentacionAutodata, Carroceria, OrigenCodigo, Importador,
              TipoMotor, TipoVehiculoElectrico, TipoCajaAut, CC, HP,
              Cilindros, Valvulas, Puertas, Asientos, PrecioInicial, CombustibleCodigo, Tipo,
              Estado, Activo
            ) OUTPUT INSERTED.ModeloID VALUES (
              @p0, @p1, @p2, @p3, @p4, @p5,
              @p6, @p7, @p8, @p9, @p10,
              @p11, @p12, @p13, @p14, @p15,
              @p16, @p17, @p18, @p19, @p20, @p21, @p22,
              'minimos_aprobados', 1
            )`,
            [dbMarcaId, modeloDesc, codModelo, codigoAutodata, familiaDesc, familiaId, anioNum, segmentoDesc, carroceriaDesc, origenDesc, importadorDesc, tipoMotorDesc, vehiculoElectricoDesc, tipoCajaDesc, cilinCcNum, potenciaHpNum, cilindrosNum, valvulasNum, puertasNum, asientosNum, precioNum, combDesc, tipoDesc]
          );
          const modeloIdDb = insertRes[0].ModeloID;
          await execWithDebug(`INSERT INTO ModeloHistorial (ModeloID, Campo, ValorAnterior, ValorNuevo, Usuario) VALUES (@p0, 'Estado', NULL, 'minimos_aprobados', 'ImportMinimos')`, [modeloIdDb]);
          if (precioNum !== null) {
            await execWithDebug(`INSERT INTO PrecioModelo (ModeloID, Precio, Moneda, FechaVigenciaDesde, Fuente, FechaCarga) VALUES (@p0, @p1, 'USD', GETDATE(), 'Import Minimos', GETDATE())`, [modeloIdDb, precioNum]);
          }
          await asegurarEquipamientoVacio(modeloIdDb);
          resultado.creados++;
        }
      } catch (rowErr) {
        logger.warn(`Error import mínimos en una fila: ${rowErr.message}`);
        resultado.errores++;
      }
    }

    return res.status(200).json({ success: true, message: 'Importación de datos mínimos completada', data: { resultado } });
  } catch (error) {
    logger.error('Error procesando import de mínimos:', error);
    return res.status(500).json({ success: false, message: 'Error en la importación de mínimos: ' + error.message });
  }
};

module.exports = {
  upload,
  importarExcelAutos,
  importarExcelPrecios,
  importarCSV,
  importarExcelCompleto,
  importarExcelMinimos,
  descargarTemplateCompleto,
  listarBatches,
  obtenerBatch,
  procesarBatch,
  eliminarBatch
};



