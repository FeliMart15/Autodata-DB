const db = require('../config/db-simple');
const logger = require('../config/logger');

// GET /api/equipamiento/modelo/:modeloId - Obtener equipamiento por modelo
exports.getByModeloId = async (req, res) => {
  try {
    const { modeloId } = req.params;

    // Get all columns of the EquipamientoModelo table
    const columnsQuery = await db.queryRaw("SELECT COLUMN_NAME, DATA_TYPE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'EquipamientoModelo'");
    
    // Get actual data
    const query = `
      SELECT * FROM EquipamientoModelo
      WHERE ModeloID = ${modeloId}
    `;

    const equipamiento = await db.queryRaw(query);
    let dbData = equipamiento[0] || {};
    
    // Auto-fill an empty object with all schema columns mapping them to null/false so the frontend knows they exist even if empty
    let data = {};
    columnsQuery.forEach(col => {
      // Sin dato = null para TODO tipo (incluido bit): la vista lo muestra como "—" (no cargado),
      // en vez de "No". Así se distingue "no cargado" de un "No" explícito.
      data[col.COLUMN_NAME] = dbData[col.COLUMN_NAME] !== undefined ? dbData[col.COLUMN_NAME] : null;
    });

    // OtrosDatos (blob JSON) eliminado del esquema: se usan columnas estructuradas únicamente.

    // Exponemos el esquema (columna + tipo) para que el form pueda auto-generar
    // inputs de los campos no curados y garantizar paridad con el import.
    const schema = columnsQuery
      .filter(c => !['EquipamientoID','ModeloID','CreadoPorID','FechaCreacion','ModificadoPorID','FechaModificacion'].includes(c.COLUMN_NAME))
      .map(c => ({ column: c.COLUMN_NAME, type: c.DATA_TYPE }));

    res.json({
      success: true,
      data: data,
      schema: schema
    });
  } catch (error) {
    logger.error('Error al obtener equipamiento:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener equipamiento',
      error: error.message
    });
  }
};

// Funci\u00F3n de ayuda para obtener columnas
const getDBColumns = async () => {
    const cols = await db.queryRaw("SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME='EquipamientoModelo'");
    return cols.map(c => c.COLUMN_NAME);
};

// POST /api/equipamiento - Crear equipamiento para un modelo
exports.create = async (req, res) => {
  try {
    const { modeloId, ...equipamiento } = req.body;

    if (!modeloId) {
      return res.status(400).json({
        success: false,
        message: 'ModeloId es requerido'
      });
    }

    // Verificar si ya existe equipamiento para este modelo
    const existeQuery = `SELECT EquipamientoID FROM EquipamientoModelo WHERE ModeloID = ${modeloId}`;
    const existe = await db.queryRaw(existeQuery);

    if (existe.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Este modelo ya tiene equipamiento cargado'
      });
    }

    const dbCols = await getDBColumns();
    const columnasToInsert = ['ModeloID', 'FechaCreacion'];
    const valoresToInsert = [modeloId, 'GETDATE()'];

    // Insertar columnas que existan en la base de datos
    for (const key of Object.keys(equipamiento)) {
      if (dbCols.includes(key) && key !== 'ModeloID' && key !== 'EquipamientoID' && key !== 'FechaModificacion' && key !== 'FechaActualizacion' && key !== 'FechaCreacion') {
        columnasToInsert.push(key);
        const val = equipamiento[key];
        if (val === null || val === undefined) {
          valoresToInsert.push('NULL');
        } else if (typeof val === 'boolean') {
          valoresToInsert.push(val ? 1 : 0);
        } else if (typeof val === 'string') {
          valoresToInsert.push(`N'${val.replace(/'/g, "''")}'`);
        } else {
          valoresToInsert.push(val);
        }
      }
    }

    const insertQuery = `
      INSERT INTO EquipamientoModelo (${columnasToInsert.join(', ')})
      VALUES (${valoresToInsert.join(', ')});
    `;

    await db.queryRaw(insertQuery);

    const creado = await db.queryRaw(`SELECT * FROM EquipamientoModelo WHERE ModeloID = ${modeloId}`);
    res.status(201).json({
      success: true,
      message: 'Equipamiento creado exitosamente',
      data: creado[0]
    });
  } catch (error) {
    logger.error('Error al crear equipamiento:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear equipamiento',
      error: error.message
    });
  }
};

// PUT /api/equipamiento/modelo/:modeloId - Actualizar equipamiento
exports.update = async (req, res) => {
  try {
    const { modeloId } = req.params;
    const equipamiento = req.body;

    const existeQuery = `SELECT EquipamientoID FROM EquipamientoModelo WHERE ModeloID = ${modeloId}`;
    const existe = await db.queryRaw(existeQuery);

    if (existe.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No se encontr\u00F3 equipamiento para este modelo'
      });
    }

    const setClauses = [];
    const dbCols = await getDBColumns();

    // Tratamos de buscar la columna correcta de actualización segun version del SQL
    if (dbCols.includes('FechaModificacion')) {
        setClauses.push('FechaModificacion = GETDATE()');
    } else if (dbCols.includes('FechaActualizacion')) {
        setClauses.push('FechaActualizacion = GETDATE()');
    }

    // Actualizar columnas que existan en la base de datos de manera individual, excluyendo IDs para evitar conflictos
    for (const key of Object.keys(equipamiento)) {
      if (dbCols.includes(key) && key !== 'ModeloID' && key !== 'EquipamientoID' && key !== 'FechaModificacion' && key !== 'FechaActualizacion' && key !== 'FechaCreacion') {
        const val = equipamiento[key];
        if (val === null || val === undefined) {
          setClauses.push(`${key} = NULL`);
        } else if (typeof val === 'boolean') {
          setClauses.push(`${key} = ${val ? 1 : 0}`);
        } else if (typeof val === 'string') {
          setClauses.push(`${key} = N'${val.replace(/'/g, "''")}'`);
        } else {
          setClauses.push(`${key} = ${val}`);
        }
      }
    }

    if (setClauses.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No hay datos válidos para actualizar'
      });
    }

    const updateQuery = `
      UPDATE EquipamientoModelo
      SET ${setClauses.join(', ')}
      WHERE ModeloID = ${modeloId}
    `;

    await db.queryRaw(updateQuery);

    const actualizado = await db.queryRaw(`SELECT * FROM EquipamientoModelo WHERE ModeloID = ${modeloId}`);

    logger.info(`Equipamiento actualizado (v\u00eda JSON payload) para modelo ${modeloId}`);

    res.json({
      success: true,
      message: 'Equipamiento actualizado json exitosamente',
      data: actualizado[0]
    });
  } catch (error) {
    logger.error('Error al actualizar equipamiento:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar equipamiento',
      error: error.message
    });
  }
};

// DELETE /api/equipamiento/:id - Eliminar equipamiento
exports.delete = async (req, res) => {
  try {
    const { id } = req.params;
    const deleteQuery = `DELETE FROM EquipamientoModelo WHERE EquipamientoID = ${id}`;
    await db.queryRaw(deleteQuery);

    logger.info(`Equipamiento eliminado: ID ${id}`);

    res.json({
      success: true,
      message: 'Equipamiento eliminado exitosamente'
    });
  } catch (error) {
    logger.error('Error al eliminar equipamiento:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar equipamiento',
      error: error.message
    });
  }
};