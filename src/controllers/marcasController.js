const db = require('../config/db-simple');
const logger = require('../config/logger');
const xlsx = require('xlsx');
const { obtenerProximoCodigoMarca, formatToCodigo4, existeCodigoMarca } = require('../utils/codigoAutodata');

// GET /api/marcas - Listar todas las marcas
exports.getAll = async (req, res) => {
  try {
    const { search, activo } = req.query;
    
    let whereClause = '';
    if (activo !== undefined) {
      whereClause = `Activo = ${activo === 'true' ? 1 : 0}`;
    }
    if (search) {
      const searchCondition = `Descripcion LIKE N'%${search}%' OR Origen LIKE N'%${search}%'`;
      whereClause = whereClause ? `${whereClause} AND (${searchCondition})` : searchCondition;
    }
    
    const marcas = await db.selectFields(
      'Marca',
      'MarcaID, CodigoMarca, Descripcion AS Marca, Origen AS PaisOrigen, FechaCreacion',
      whereClause,
      'Descripcion'
    );
    
    res.json({
      success: true,
      data: marcas,
      count: marcas.length
    });
  } catch (error) {
    logger.error('Error al obtener marcas:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener marcas',
      error: error.message
    });
  }
};

// GET /api/marcas/:id - Obtener una marca por ID
exports.getById = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Obtener marca
    const marca = await db.findById('Marca', 'MarcaID', id);
    
    if (!marca) {
      return res.status(404).json({
        success: false,
        message: 'Marca no encontrada'
      });
    }
    
    // Obtener cantidad de modelos de esta marca
    const modelosCount = await db.queryRaw(
      `SELECT COUNT(*) as count FROM Modelo WHERE MarcaID = ${id}`
    );
    
    marca.totalModelos = modelosCount[0]?.count || 0;
    
    res.json({
      success: true,
      data: marca
    });
  } catch (error) {
    logger.error('Error al obtener marca:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener marca',
      error: error.message
    });
  }
};

// POST /api/marcas - Crear nueva marca
exports.create = async (req, res) => {
  try {
    const { marca, paisOrigen, codigoMarca } = req.body;
    
    logger.info(`Intentando crear/actualizar marca: ${marca}, paisOrigen: ${paisOrigen}, CodigoMarca: ${codigoMarca}`);
    
    // Validaciones
    if (!marca || !marca.trim()) {
      return res.status(400).json({
        success: false,
        message: 'El nombre de la marca es requerido'
      });
    }

    if (!codigoMarca || !codigoMarca.trim()) {
      return res.status(400).json({
        success: false,
        message: 'El MARCOD (Código de Marca) es requerido'
      });
    }
    
    // Normalizar CodigoMarca y obtener ID
    const normCod = codigoMarca.trim().padStart(4, '0');
    const marcaIdInt = parseInt(normCod, 10);

    if (isNaN(marcaIdInt)) {
      return res.status(400).json({
        success: false,
        message: 'El MARCOD debe ser un valor numérico válido'
      });
    }
    
    // Verificar si ya existe
    const existente = await db.queryRaw(
      `SELECT MarcaID, Descripcion FROM Marca WHERE MarcaID = ${marcaIdInt} OR CodigoMarca = '${normCod}'`
    );
    
    let resultMarcaId;
    
    if (existente.length > 0) {
      // Upsert: Actualizar marca existente
      resultMarcaId = existente[0].MarcaID;
      await db.queryRaw(`
        UPDATE Marca 
        SET Descripcion = N'${marca.trim()}', 
            Origen = ${paisOrigen && paisOrigen.trim() ? `N'${paisOrigen.trim()}'` : 'NULL'}
        WHERE MarcaID = ${resultMarcaId}
      `);
      logger.info(`Marca existente actualizada (ID: ${resultMarcaId})`);
    } else {
      // Marca.MarcaID no tiene IDENTITY: se inserta el ID explícito directo, sin IDENTITY_INSERT.
      await db.queryRaw(`
        INSERT INTO Marca (MarcaID, CodigoMarca, Descripcion, Origen)
        VALUES (${marcaIdInt}, '${normCod}', N'${marca.trim()}', ${paisOrigen && paisOrigen.trim() ? `N'${paisOrigen.trim()}'` : 'NULL'});
      `);
      resultMarcaId = marcaIdInt;
      logger.info(`Marca creada con explícito ID: ${resultMarcaId} y CodigoMarca: ${normCod}`);
    }

    // Obtener la marca creada/actualizada
    const nuevaMarca = await db.queryRaw(
      `SELECT MarcaID, CodigoMarca, Descripcion AS Marca, Origen AS PaisOrigen, FechaCreacion
       FROM Marca WHERE MarcaID = ${resultMarcaId}`
    );
    
    res.status(201).json({
      success: true,
      message: existente.length > 0 ? 'Marca actualizada exitosamente' : 'Marca creada exitosamente',
      data: nuevaMarca[0]
    });
  } catch (error) {
    logger.error('Error al crear/actualizar marca:', error);
    res.status(500).json({
      success: false,
      message: 'Error al procesar la marca',
      error: error.message
    });
  }
};

// PUT /api/marcas/:id - Actualizar marca
exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const { marca, paisOrigen, logoURL, activo } = req.body;
    
    // Verificar si existe
    const existente = await db.findById('Marca', 'MarcaID', id);
    if (!existente) {
      return res.status(404).json({
        success: false,
        message: 'Marca no encontrada'
      });
    }
    
    // Verificar nombre duplicado (si se está cambiando)
    if (marca && marca !== existente.Descripcion) {
      const duplicado = await db.queryRaw(
        `SELECT MarcaID FROM Marca WHERE Descripcion = N'${marca}' AND MarcaID != ${id}`
      );
      
      if (duplicado.length > 0) {
        return res.status(409).json({
          success: false,
          message: 'Ya existe otra marca con ese nombre'
        });
      }
    }
    
    // Construir query de actualización
    const updates = [];
    if (marca !== undefined) updates.push(`Descripcion = N'${marca}'`);
    if (paisOrigen !== undefined) updates.push(`Origen = ${paisOrigen ? `N'${paisOrigen}'` : 'NULL'}`);
    
    const query = `
      UPDATE Marca 
      SET ${updates.join(', ')}
      OUTPUT INSERTED.*
      WHERE MarcaID = ${id}
    `;
    
    const result = await db.queryRaw(query);
    
    res.json({
      success: true,
      message: 'Marca actualizada exitosamente',
      data: result[0]
    });
  } catch (error) {
    logger.error('Error al actualizar marca:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar marca',
      error: error.message
    });
  }
};

// DELETE /api/marcas/:id - Eliminar marca (soft delete)
exports.delete = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Verificar si existe
    const marca = await db.findById('Marca', 'MarcaID', id);
    if (!marca) {
      return res.status(404).json({
        success: false,
        message: 'Marca no encontrada'
      });
    }
    
    // Verificar si tiene modelos asociados
    const modelos = await db.queryRaw(
      `SELECT COUNT(*) as count FROM Modelo WHERE MarcaID = ${id}`
    );
    
    if (modelos[0].count > 0) {
      return res.status(400).json({
        success: false,
        message: `No se puede eliminar la marca porque tiene ${modelos[0].count} modelo(s) asociado(s)`
      });
    }
    
    // Soft delete: marcar como inactiva
    const query = `
      UPDATE Marca 
      SET Activo = 0, FechaModificacion = GETDATE()
      WHERE MarcaID = ${id}
    `;
    
    await db.queryRaw(query);
    
    res.json({
      success: true,
      message: 'Marca desactivada exitosamente'
    });
  } catch (error) {
    logger.error('Error al eliminar marca:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar marca',
      error: error.message
    });
  }
};

exports.importarExcel = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No se subi� ning�n archivo' });
    }

    const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(sheet);

    let procesadas = 0;
    let omitidas = 0;
    let errores = [];

    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      const marcod = row['MARCOD']?.toString().trim();
      const mardsc = row['MARDSC']?.toString().trim();
      const origen = row['ORIGEN']?.toString().trim();

      if (!marcod || !mardsc || !origen) {
        omitidas++;
        errores.push(`Fila ${i + 2}: Faltan datos (MARCOD, MARDSC u ORIGEN).`);
        continue;
      }

      const marcaIdInt = parseInt(marcod, 10);
      if (isNaN(marcaIdInt)) {
        omitidas++;
        errores.push(`Fila ${i + 2}: MARCOD '${marcod}' no es un número válido.`);
        continue;
      }

      // Check if it already exists (por ID o por código)
      const existente = await db.queryRaw(`SELECT MarcaID FROM Marca WHERE MarcaID = ${marcaIdInt} OR CodigoMarca = '${marcod}'`);
      if (existente.length > 0) {
        omitidas++;
        continue; // Ya existe, se saltea sin error
      }

      // Check if name already exists
      const nombreExistente = await db.queryRaw(`SELECT MarcaID FROM Marca WHERE Descripcion = '${mardsc.replace(/'/g, "''")}'`);
      if (nombreExistente.length > 0) {
        omitidas++;
        errores.push(`Fila ${i + 2}: El nombre de marca '${mardsc}' ya existe.`);
        continue;
      }
      
      // Marca.MarcaID no tiene IDENTITY: se inserta el ID explícito directo, sin IDENTITY_INSERT.
      await db.queryRaw(
        `INSERT INTO Marca (MarcaID, CodigoMarca, Descripcion, Origen) VALUES (${marcaIdInt}, '${marcod}', N'${mardsc.replace(/'/g, "''")}', N'${(origen || '').replace(/'/g, "''")}')`
      );
      procesadas++;
    }

    res.json({
      success: true,
      message: 'Proceso de importación finalizado',
      data: {
        procesadas,
        omitidas,
        errores
      }
    });

  } catch (error) {
    logger.error('Error al importar marcas:', error);
    res.status(500).json({ success: false, message: 'Error en la importación', error: error.message });
  }
};
