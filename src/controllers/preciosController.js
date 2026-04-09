const db = require('../config/db-simple');
const logger = require('../config/logger');

// GET /api/precios/modelo/:modeloId - Obtener precios de un modelo
exports.getPreciosByModelo = async (req, res) => {
  try {
    const { modeloId } = req.params;
    
    const precios = await db.queryRaw(`
      SELECT 
        p.PrecioID,
        p.ModeloID,
        p.Precio,
        p.Moneda,
        p.FechaVigenciaDesde,
        p.FechaVigenciaHasta,
        p.Fuente,
        p.FechaCarga,
        m.DescripcionModelo,
        m.CodigoAutodata,
        ma.Descripcion AS MarcaNombre
      FROM PrecioModelo p
      INNER JOIN Modelo m ON p.ModeloID = m.ModeloID
      LEFT JOIN Marca ma ON m.MarcaID = ma.MarcaID
      WHERE p.ModeloID = ${modeloId}
      ORDER BY p.FechaVigenciaDesde DESC, p.PrecioID DESC
    `);
    
    res.json({
      success: true,
      data: precios
    });
  } catch (error) {
    logger.error('Error al obtener precios del modelo:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener precios del modelo',
      error: error.message
    });
  }
};

// GET /api/precios/modelo/:modeloId/actual - Obtener precio actual de un modelo
exports.getPrecioActual = async (req, res) => {
  try {
    const { modeloId } = req.params;
    const today = new Date().toISOString().split('T')[0];
    
    const precio = await db.queryRaw(`
      SELECT TOP 1
        p.PrecioID,
        p.ModeloID,
        p.Precio,
        p.Moneda,
        p.FechaVigenciaDesde,
        p.FechaVigenciaHasta,
        p.Fuente,
        p.FechaCarga,
        m.DescripcionModelo,
        m.CodigoAutodata,
        ma.Descripcion AS MarcaNombre
      FROM PrecioModelo p
      INNER JOIN Modelo m ON p.ModeloID = m.ModeloID
      LEFT JOIN Marca ma ON m.MarcaID = ma.MarcaID
      WHERE p.ModeloID = ${modeloId}
        AND p.FechaVigenciaDesde <= '${today}'
        AND (p.FechaVigenciaHasta IS NULL OR p.FechaVigenciaHasta >= '${today}')
      ORDER BY p.FechaVigenciaDesde DESC, p.PrecioID DESC
    `);
    
    if (precio.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No se encontró precio vigente para este modelo'
      });
    }
    
    res.json({
      success: true,
      data: precio[0]
    });
  } catch (error) {
    logger.error('Error al obtener precio actual:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener precio actual',
      error: error.message
    });
  }
};

// POST /api/precios/modelo - Crear nuevo precio para un modelo
exports.createPrecio = async (req, res) => {
  try {
    const { modeloId, precio, moneda = 'USD', fechaVigenciaDesde, fuente = 'Manual' } = req.body;
    
    // Validaciones
    if (!modeloId || !precio || !fechaVigenciaDesde) {
      return res.status(400).json({
        success: false,
        message: 'ModeloID, Precio y FechaVigenciaDesde son requeridos'
      });
    }
    
    // Verificar que el modelo existe
    const modeloExiste = await db.queryRaw(`SELECT ModeloID FROM Modelo WHERE ModeloID = ${modeloId}`);
    if (modeloExiste.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Modelo no encontrado'
      });
    }
    
    // Cerrar precio anterior si existe (establecer FechaVigenciaHasta)
    const precioAnterior = await db.queryRaw(`
      SELECT TOP 1 PrecioID
      FROM PrecioModelo
      WHERE ModeloID = ${modeloId}
        AND FechaVigenciaHasta IS NULL
      ORDER BY FechaVigenciaDesde DESC, PrecioID DESC
    `);
    
    if (precioAnterior.length > 0) {
      // Calcular fecha de cierre (un día antes de la nueva vigencia)
      const fechaCierre = new Date(fechaVigenciaDesde);
      fechaCierre.setDate(fechaCierre.getDate() - 1);
      const fechaCierreStr = fechaCierre.toISOString().split('T')[0];
      
      await db.queryRaw(`
        UPDATE PrecioModelo
        SET FechaVigenciaHasta = '${fechaCierreStr}'
        WHERE PrecioID = ${precioAnterior[0].PrecioID}
      `);
    }
    
    // Insertar nuevo precio
    const fechaCargaStr = new Date().toISOString().split('T')[0];
    const precioData = {
      ModeloID: modeloId,
      Precio: precio,
      Moneda: moneda,
      FechaVigenciaDesde: fechaVigenciaDesde,
      Fuente: fuente,
      FechaCarga: fechaCargaStr
    };
    
    const precioInsertado = await db.insert('PrecioModelo', precioData);
    const precioId = precioInsertado.PrecioID;
    
    // Obtener el precio creado
    const nuevoPrecio = await db.queryRaw(`
      SELECT 
        p.*,
        m.DescripcionModelo,
        m.CodigoAutodata,
        ma.Descripcion AS MarcaNombre
      FROM PrecioModelo p
      INNER JOIN Modelo m ON p.ModeloID = m.ModeloID
      LEFT JOIN Marca ma ON m.MarcaID = ma.MarcaID
      WHERE p.PrecioID = ${precioId}
    `);
    
    logger.info(`Precio creado para modelo ${modeloId}: ${precio} ${moneda}`);
    
    res.status(201).json({
      success: true,
      message: 'Precio creado exitosamente',
      data: nuevoPrecio[0]
    });
  } catch (error) {
    logger.error('Error al crear precio:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear precio',
      error: error.message
    });
  }
};

// PUT /api/precios/:precioId - Actualizar precio
exports.updatePrecio = async (req, res) => {
  try {
    const { precioId } = req.params;
    const { precio, moneda, fechaVigenciaDesde, fechaVigenciaHasta, fuente } = req.body;
    
    // Verificar que el precio existe
    const precioExiste = await db.queryRaw(`SELECT PrecioID FROM PrecioModelo WHERE PrecioID = ${precioId}`);
    if (precioExiste.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Precio no encontrado'
      });
    }
    
    // Construir datos de actualización
    const updateData = {};
    if (precio !== undefined) updateData.Precio = precio;
    if (moneda !== undefined) updateData.Moneda = moneda;
    if (fechaVigenciaDesde !== undefined) updateData.FechaVigenciaDesde = fechaVigenciaDesde;
    if (fechaVigenciaHasta !== undefined) updateData.FechaVigenciaHasta = fechaVigenciaHasta;
    if (fuente !== undefined) updateData.Fuente = fuente;
    
    await db.update('PrecioModelo', 'PrecioID', precioId, updateData);
    
    // Obtener precio actualizado
    const precioActualizado = await db.queryRaw(`
      SELECT 
        p.*,
        m.DescripcionModelo,
        m.CodigoAutodata,
        ma.Descripcion AS MarcaNombre
      FROM PrecioModelo p
      INNER JOIN Modelo m ON p.ModeloID = m.ModeloID
      LEFT JOIN Marca ma ON m.MarcaID = ma.MarcaID
      WHERE p.PrecioID = ${precioId}
    `);
    
    logger.info(`Precio ${precioId} actualizado`);
    
    res.json({
      success: true,
      message: 'Precio actualizado exitosamente',
      data: precioActualizado[0]
    });
  } catch (error) {
    logger.error('Error al actualizar precio:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar precio',
      error: error.message
    });
  }
};

// DELETE /api/precios/:precioId - Eliminar precio
exports.deletePrecio = async (req, res) => {
  try {
    const { precioId } = req.params;
    
    // Verificar que el precio existe
    const precioExiste = await db.queryRaw(`SELECT PrecioID FROM PrecioModelo WHERE PrecioID = ${precioId}`);
    if (precioExiste.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Precio no encontrado'
      });
    }
    
    await db.queryRaw(`DELETE FROM PrecioModelo WHERE PrecioID = ${precioId}`);
    
    logger.info(`Precio ${precioId} eliminado`);
    
    res.json({
      success: true,
      message: 'Precio eliminado exitosamente'
    });
  } catch (error) {
    logger.error('Error al eliminar precio:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar precio',
      error: error.message
    });
  }
};
