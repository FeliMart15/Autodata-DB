const db = require('../config/db-simple');
const logger = require('../config/logger');
const { generarCodigoAutodata, obtenerProximoCodigoModelo, formatToCodigo4 } = require('../utils/codigoAutodata');
const {
  ESTADOS,
  validarDatosMinimos,
  validarTransicionEstado,
  validarRequisitosEstado,
  obtenerNombreEstado,
  permiteEdicion
} = require('../middleware/estadoValidation');

// GET /api/modelos - Listar modelos con filtros y paginación
exports.getAll = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 50, 
      estado, 
      marcaId, 
      anio,
      tipo,
      search 
    } = req.query;
    
    const offset = (page - 1) * limit;
    
    // Construir WHERE clause
    let whereConditions = ['m.Activo = 1'];
    if (estado) {
      if (Array.isArray(estado)) {
        const estadoList = estado.map(e => `N'${e}'`).join(', ');
        whereConditions.push(`m.Estado IN (${estadoList})`);
      } else {
        const estadosStr = estado.split(',').map(e => `N'${e.trim()}'`).join(', ');
        whereConditions.push(`m.Estado IN (${estadosStr})`);
      }
    }
    if (marcaId) whereConditions.push(`m.MarcaID = ${marcaId}`);
    if (anio) whereConditions.push(`m.Anio = ${anio}`);
    if (tipo) whereConditions.push(`m.Tipo = N'${tipo}'`);
    if (search) {
      whereConditions.push(`(m.DescripcionModelo LIKE N'%${search}%' OR m.Familia LIKE N'%${search}%' OR mar.Descripcion LIKE N'%${search}%')`);
    }
    
    const whereClause = whereConditions.join(' AND ');
    
    // Query para contar total
    const countQuery = `
      SELECT COUNT(*) as total
      FROM Modelo m
      LEFT JOIN Marca mar ON m.MarcaID = mar.MarcaID
      WHERE ${whereClause}
    `;
    
    const countResult = await db.queryRaw(countQuery);
    const total = countResult[0].total;
    
    // Query con paginación
    const query = `
      SELECT 
        m.ModeloID,
        m.MarcaID,
        m.CodigoModelo,
        m.CodigoAutodata,
        m.DescripcionModelo,
        m.DescripcionModelo AS Modelo,
        m.Familia,
        m.Anio,
        m.Tipo,
        m.CombustibleCodigo AS Combustible,
        m.Estado,
          m.ObservacionesRevision,
          m.FechaCreacion,
        mar.Descripcion AS MarcaNombre,
        mar.CodigoMarca
      FROM Modelo m
      LEFT JOIN Marca mar ON m.MarcaID = mar.MarcaID
      WHERE ${whereClause}
      ORDER BY m.FechaModificacion DESC, m.FechaCreacion DESC
      OFFSET ${offset} ROWS
      FETCH NEXT ${limit} ROWS ONLY
    `;
    
    const modelos = await db.queryRaw(query);
    
    res.json({
      success: true,
      data: modelos,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    logger.error('Error al obtener modelos:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener modelos',
      error: error.message
    });
  }
};

// GET /api/modelos/:id - Obtener modelo por ID con todos los detalles
exports.getById = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Query completa con JOINs
    const query = `
      SELECT 
        m.*,
        mar.Descripcion AS MarcaNombre
      FROM Modelo m
      LEFT JOIN Marca mar ON m.MarcaID = mar.MarcaID
      WHERE m.ModeloID = ${id} AND m.Activo = 1
    `;
    
    const resultado = await db.queryRaw(query);
    const modelo = resultado[0];

    if (!modelo) {
      return res.status(404).json({
        success: false,
        message: 'Modelo no encontrado'
      });
    }

    // Obtener equipamiento
    const equipamientoQuery = `
      SELECT * FROM EquipamientoModelo WHERE ModeloID = ${id}
    `;
    const equipamiento = await db.queryRaw(equipamientoQuery);
    modelo.equipamiento = equipamiento[0] || null;

    // Obtener versiones
    const versionesQuery = `
      SELECT * FROM VersionModelo WHERE ModeloID = ${id} ORDER BY CodigoVersion
    `;
    const versiones = await db.queryRaw(versionesQuery);
    modelo.versiones = versiones;

    // Obtener precios
    const preciosQuery = `
      SELECT * FROM PrecioModelo WHERE ModeloID = ${id} ORDER BY FechaVigenciaDesde DESC
    `;
    const precios = await db.queryRaw(preciosQuery);
    modelo.precios = precios;
    
    // Obtener historial
    const historialQuery = `
      SELECT 
        mh.*
      FROM ModeloHistorial mh
      WHERE mh.ModeloID = ${id}
      ORDER BY mh.FechaCambio DESC
    `;
    const historial = await db.queryRaw(historialQuery);
    modelo.historial = historial;

    res.json({
      success: true,
      data: modelo
    });
  } catch (error) {
    logger.error('Error al obtener modelo:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener modelo',
      error: error.message
    });
  }
};

// POST /api/modelos - Crear nuevo modelo
exports.create = async (req, res) => {
  try {
    const { 
      marcaId, 
      codigoModelo,
      modelo, 
      precioInicial,
      familia,
      origen,
      combustible,
      anio,
      tipo,
      tipo2,
      cc,
      hp,
      traccion,
      caja,
      tipo_caja,
      turbo,
      puertas,
      pasajeros,
      tipo_vehiculo,
      segmento,
      categoria,
      importador
    } = req.body;
    const userId = req.user?.id || 1; // TODO: Obtener del token JWT
    
    // Validar campos requeridos
    if (!marcaId || !codigoModelo || !modelo) {
      return res.status(400).json({
        success: false,
        message: 'Marca, CodigoModelo y Modelo son requeridos'
      });
    }
    
    // Verificar que la marca existe y obtener su CodigoMarca
    const marcaExiste = await db.queryRaw(`SELECT MarcaID, CodigoMarca FROM Marca WHERE MarcaID = ${marcaId}`);
    if (marcaExiste.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Marca no encontrada'
      });
    }
    
    const codigoMarca = marcaExiste[0].CodigoMarca;
    
    // Generar CodigoAutodata uniendo el de la marca y el del modelo enviado manualmente
    const modeloCod = String(codigoModelo).trim().padStart(4, '0');
    const codigoAutodata = generarCodigoAutodata(codigoMarca, modeloCod);
    
    // Validar si el codigo de modelo ya existe para esta marca
    const modeloExistente = await db.queryRaw(`SELECT ModeloID FROM Modelo WHERE CodigoAutodata = '${codigoAutodata}' OR (MarcaID = ${marcaId} AND CodigoModelo = '${modeloCod}')`);
    if (modeloExistente.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Ya existe un modelo con este Código para esta Marca'
      });
    }
    
    logger.info(`Guardando modelo - CodigoMarca: ${codigoMarca}, CodigoModelo: ${modeloCod}, CodigoAutodata: ${codigoAutodata}`);
    
    // Construir query dinámicamente con todos los campos
    const campos = ['MarcaID', 'CodigoModelo', 'CodigoAutodata', 'DescripcionModelo', 'Estado', 'Activo'];
    const valores = [marcaId, `'${modeloCod}'`, `'${codigoAutodata}'`, `N'${modelo.replace(/'/g, "''")}'`, `'creado'`, '1'];
    
    if (precioInicial) { campos.push('PrecioInicial'); valores.push(precioInicial); }
    if (familia) { campos.push('Familia'); valores.push(`N'${familia.replace(/'/g, "''")}'`); }
    if (origen) { campos.push('OrigenCodigo'); valores.push(`N'${origen.replace(/'/g, "''")}'`); }
    if (combustible) { campos.push('CombustibleCodigo'); valores.push(`N'${combustible.replace(/'/g, "''")}'`); }
    if (anio) { campos.push('Anio'); valores.push(anio); }
    if (tipo) { campos.push('Tipo'); valores.push(`N'${tipo.replace(/'/g, "''")}'`); }
    if (tipo2) { campos.push('Tipo2'); valores.push(`N'${tipo2.replace(/'/g, "''")}'`); }
    if (cc) { campos.push('CC'); valores.push(cc); }
    if (hp) { campos.push('HP'); valores.push(hp); }
    if (traccion) { campos.push('Traccion'); valores.push(`N'${traccion.replace(/'/g, "''")}'`); }
    if (caja) { campos.push('Caja'); valores.push(`N'${caja.replace(/'/g, "''")}'`); }
    if (tipo_caja) { campos.push('TipoCaja'); valores.push(`N'${tipo_caja.replace(/'/g, "''")}'`); }
    if (turbo !== undefined) { campos.push('Turbo'); valores.push(turbo ? '1' : '0'); }
    if (puertas) { campos.push('Puertas'); valores.push(puertas); }
    if (pasajeros) { campos.push('Pasajeros'); valores.push(pasajeros); }
    if (tipo_vehiculo) { campos.push('TipoVehiculo'); valores.push(`N'${tipo_vehiculo.replace(/'/g, "''")}'`); }
    if (segmento) { campos.push('SegmentacionAutodata'); valores.push(`N'${segmento.replace(/'/g, "''")}'`); }
    if (categoria) { campos.push('CategoriaCodigo'); valores.push(`N'${categoria.replace(/'/g, "''")}'`); }
    if (importador) { campos.push('Importador'); valores.push(`N'${importador.replace(/'/g, "''")}'`); }
    
    // Insertar modelo
    const insertQuery = `
      INSERT INTO Modelo (${campos.join(', ')})
      VALUES (${valores.join(', ')});
    `;
    
    await db.queryRaw(insertQuery);
    
    // Obtener el ID del modelo recién creado usando MAX (más confiable que SCOPE_IDENTITY en este contexto)
    const idQuery = `
      SELECT TOP 1 ModeloID 
      FROM Modelo 
      WHERE MarcaID = ${marcaId} AND DescripcionModelo = N'${modelo}'
      ORDER BY FechaCreacion DESC
    `;
    const idResult = await db.queryRaw(idQuery);
    const modeloId = idResult[0]?.ModeloID;
    
    // Registrar en historial solo si tenemos el ID
    if (modeloId) {
      const historialQuery = `
        INSERT INTO ModeloHistorial (ModeloID, Campo, ValorAnterior, ValorNuevo, Usuario)
        VALUES (${modeloId}, 'Estado', NULL, 'creado', 'Sistema')
      `;
      await db.queryRaw(historialQuery);

      // Generar registro en la tabla de precio si se envió el precioInicial
      if (precioInicial && !isNaN(precioInicial)) {
        const precioQuery = `
          INSERT INTO PrecioModelo (ModeloID, Precio, Moneda, VigenciaDesde, Observaciones, RegistradoPorID)
          VALUES (${modeloId}, ${parseFloat(precioInicial)}, 'USD', GETDATE(), 'Precio inicial cargado manualmente', ${userId})
        `;
        await db.queryRaw(precioQuery);
      }
    }
    
    // Obtener el modelo creado
    const modeloQuery = `
      SELECT 
        m.ModeloID,
        m.MarcaID,
        m.CodigoModelo,
        m.CodigoAutodata,
        m.DescripcionModelo AS Modelo,
        m.Familia,
        m.Anio,
        m.Tipo,
        m.CombustibleCodigo AS Combustible,
        m.Estado,
          m.ObservacionesRevision,
          m.FechaCreacion,
        mar.Descripcion AS MarcaNombre,
        mar.CodigoMarca
      FROM Modelo m
      LEFT JOIN Marca mar ON m.MarcaID = mar.MarcaID
      WHERE m.ModeloID = ${modeloId}
    `;
    const nuevoModelo = await db.queryRaw(modeloQuery);
    
    logger.info(`Modelo creado: ${modelo} (ID: ${modeloId}, CodigoAutodata: ${codigoAutodata})`);

    res.status(201).json({
      success: true,
      message: 'Modelo creado exitosamente',
      data: nuevoModelo[0]
    });
  } catch (error) {
    logger.error('Error al crear modelo:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear modelo',
      error: error.message
    });
  }
};

// PUT /api/modelos/:id - Actualizar modelo
exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id || 1; // TODO: Obtener del token JWT
    const datosActualizacion = req.body;
    
    // Verificar si existe
    const verificarQuery = `SELECT * FROM Modelo WHERE ModeloID = ${id} AND Activo = 1`;
    const modeloExistente = await db.queryRaw(verificarQuery);
    
    if (modeloExistente.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Modelo no encontrado'
      });
    }
    
    // Construir SET clause dinámicamente
    const setClauses = [];
    // Campos permitidos según estructura de 19 campos:
    // 5 obligatorios: MarcaID, Familia, Modelo, Combustible, CategoriaVehiculo
    // 14 datos mínimos: SegmentacionAutodata, Carroceria, OrigenCodigo, Cilindros, Valvulas, CC, HP, TipoCajaAut, Puertas, Asientos, TipoMotor, TipoVehiculoElectrico, Importador, PrecioInicial
    const camposPermitidos = [
      // 5 Campos Obligatorios
      'MarcaID', 'DescripcionModelo', 'Familia', 'CombustibleCodigo', 'CategoriaVehiculo',
      // 14 Datos Mínimos
      'SegmentacionAutodata', 'Carroceria', 'OrigenCodigo', 'Cilindros', 'Valvulas', 'CC', 'HP',
      'TipoCajaAut', 'Puertas', 'Asientos', 'TipoMotor', 'TipoVehiculoElectrico', 'Importador', 'PrecioInicial',
      // Campos de Control
      'Estado', 'UltimoComentario'
    ];
    
    // Mapeo de nombres de campos del frontend a la base de datos
    const fieldMapping = {
      'id_marca': 'MarcaID',
      'modelo': 'DescripcionModelo',
      'familia': 'Familia',
      'origen': 'OrigenCodigo',
      'combustible': 'CombustibleCodigo',
      'año': 'Anio',
      'anio': 'Anio',
      'tipo': 'Tipo',
      'tipo2': 'Tipo2',
      'tipo_vehiculo': 'TipoVehiculo',
      'segmento': 'SegmentacionAutodata',
      'categoria': 'CategoriaCodigo',
      'importador': 'Importador',
      'cc': 'CC',
      'hp': 'HP',
      'turbo': 'Turbo',
      'traccion': 'Traccion',
      'caja': 'Caja',
      'tipo_caja': 'TipoCaja',
      'puertas': 'Puertas',
      'pasajeros': 'Pasajeros',
      'estado': 'Estado',
      'observaciones': 'observaciones'
    };
    
    for (let campo in datosActualizacion) {
      const dbCampo = fieldMapping[campo] || campo;
      if (camposPermitidos.includes(dbCampo)) {
        const valor = datosActualizacion[campo];
        if (valor === null || valor === undefined) {
          setClauses.push(`${dbCampo} = NULL`);
        } else if (typeof valor === 'string') {
          setClauses.push(`${dbCampo} = N'${valor.replace(/'/g, "''")}'`);
        } else if (typeof valor === 'boolean') {
          setClauses.push(`${dbCampo} = ${valor ? 1 : 0}`);
        } else {
          setClauses.push(`${dbCampo} = ${valor}`);
        }
      }
    }
    
    if (setClauses.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No hay datos para actualizar'
      });
    }
    
    // Ejecutar actualización
    const updateQuery = `
      UPDATE Modelo 
      SET ${setClauses.join(', ')}
      WHERE ModeloID = ${id}
    `;
    await db.queryRaw(updateQuery);
    
    // Obtener modelo actualizado
    const modeloQuery = `
      SELECT m.*, mar.Descripcion AS MarcaNombre
      FROM Modelo m
      LEFT JOIN Marca mar ON m.MarcaID = mar.MarcaID
      WHERE m.ModeloID = ${id}
    `;
    const modeloActualizado = await db.queryRaw(modeloQuery);
    
    logger.info(`Modelo actualizado: ID ${id}`);

    res.json({
      success: true,
      message: 'Modelo actualizado exitosamente',
      data: modeloActualizado[0]
    });
  } catch (error) {
    logger.error('Error al actualizar modelo:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar modelo',
      error: error.message
    });
  }
};

// DELETE /api/modelos/:id - Eliminar modelo (soft delete)
exports.delete = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id || 1;
    
    // Verificar si existe
    const verificarQuery = `SELECT * FROM Modelo WHERE ModeloID = ${id} AND Activo = 1`;
    const modelo = await db.queryRaw(verificarQuery);
    
    if (modelo.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Modelo no encontrado'
      });
    }

    // Soft delete
    const deleteQuery = `
      UPDATE Modelo 
      SET Activo = 0
      WHERE ModeloID = ${id}
    `;
    await db.queryRaw(deleteQuery);
    
    // Registrar en historial
    const historialQuery = `
      INSERT INTO ModeloHistorial (ModeloID, Campo, ValorAnterior, ValorNuevo, Usuario)
      VALUES (${id}, 'Activo', '1', '0', 'Sistema')
    `;
    await db.queryRaw(historialQuery);
    
    logger.info(`Modelo eliminado: ID ${id}`);

    res.json({
      success: true,
      message: 'Modelo eliminado exitosamente'
    });
  } catch (error) {
    logger.error('Error al eliminar modelo:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar modelo',
      error: error.message
    });
  }
};

// Validar campos mínimos requeridos
const validarCamposMinimos = (modelo) => {
  const camposRequeridos = [
    'Familia', 'OrigenCodigo', 'CombustibleCodigo', 
    'Anio', 'Tipo', 'CC', 'HP'
  ];
  
  const faltantes = camposRequeridos.filter(campo => !modelo[campo]);
  return {
    valido: faltantes.length === 0,
    faltantes
  };
};

// POST /api/modelos/:id/mark-minimos - Marcar modelo como MINIMOS
exports.markMinimos = async (req, res) => {
  try {
    const { id } = req.params;
    const modelo = await db.findById('Modelo', 'ModeloID', id);

    if (!modelo) {
      return res.status(404).json({
        success: false,
        message: 'Modelo no encontrado'
      });
    }

    const validacion = validarCamposMinimos(modelo);
    
    if (!validacion.valido) {
      return res.status(400).json({
        success: false,
        message: 'Faltan campos mínimos requeridos',
        camposFaltantes: validacion.faltantes
      });
    }

    const actualizado = await db.update('Modelo', 'ModeloID', id, {
      Estado: 'MINIMOS'
    });

    res.json({
      success: true,
      message: 'Modelo marcado como MINIMOS',
      data: actualizado
    });
  } catch (error) {
    logger.error('Error al marcar modelo como MINIMOS:', error);
    res.status(500).json({
      success: false,
      message: 'Error al marcar modelo',
      error: error.message
    });
  }
};

// POST /api/modelos/:id/send-review - Enviar a revisión
exports.sendReview = async (req, res) => {
  try {
    const { id } = req.params;
    const modelo = await db.update('Modelo', 'ModeloID', id, {
      Estado: 'PARA_CORREGIR'
    });

    if (!modelo) {
      return res.status(404).json({
        success: false,
        message: 'Modelo no encontrado'
      });
    }

    res.json({
      success: true,
      message: 'Modelo enviado a revisión',
      data: modelo
    });
  } catch (error) {
    logger.error('Error al enviar modelo a revisión:', error);
    res.status(500).json({
      success: false,
      message: 'Error al enviar modelo',
      error: error.message
    });
  }
};

// POST /api/modelos/:id/approve - Aprobar y publicar modelo
exports.approve = async (req, res) => {
  try {
    const { id } = req.params;
    
    // TODO: Aquí ejecutar el procedimiento almacenado o lógica para mover a definitivos
    const modelo = await db.update('Modelo', 'ModeloID', id, {
      Estado: 'APROBADO'
    });

    res.json({
      success: true,
      message: 'Modelo aprobado y publicado exitosamente',
      data: modelo
    });
  } catch (error) {
    logger.error('Error al aprobar modelo:', error);
    res.status(500).json({
      success: false,
      message: 'Error al aprobar modelo',
      error: error.message
    });
  }
};

// GET /api/modelos/codigo/:codigoAutodata - Buscar modelo por CodigoAutodata
exports.getByCodigoAutodata = async (req, res) => {
  try {
    const { codigoAutodata } = req.params;
    
    // Validar formato
    if (!codigoAutodata || codigoAutodata.length !== 8 || !/^\d{8}$/.test(codigoAutodata)) {
      return res.status(400).json({
        success: false,
        message: 'CodigoAutodata debe ser un número de 8 dígitos'
      });
    }
    
    // Buscar modelo
    const query = `
      SELECT 
        m.*,
        mar.Descripcion AS MarcaNombre,
        mar.CodigoMarca
      FROM Modelo m
      LEFT JOIN Marca mar ON m.MarcaID = mar.MarcaID
      WHERE m.CodigoAutodata = '${codigoAutodata}' AND m.Activo = 1
    `;
    
    const resultado = await db.queryRaw(query);
    
    if (resultado.length === 0) {
      return res.status(404).json({
        success: false,
        message: `No se encontró modelo con CodigoAutodata ${codigoAutodata}`
      });
    }
    
    const modelo = resultado[0];
    
    // Obtener versiones
    const versionesQuery = `
      SELECT * FROM VersionModelo WHERE ModeloID = ${modelo.ModeloID}
    `;
    const versiones = await db.queryRaw(versionesQuery);
    modelo.versiones = versiones;
    
    // Obtener precios
    const preciosQuery = `
      SELECT * FROM PrecioModelo WHERE ModeloID = ${modelo.ModeloID} ORDER BY FechaVigenciaDesde DESC
    `;
    const precios = await db.queryRaw(preciosQuery);
    modelo.precios = precios;

    res.json({
      success: true,
      data: modelo
    });
  } catch (error) {
    logger.error('Error al buscar modelo por CodigoAutodata:', error);
    res.status(500).json({
      success: false,
      message: 'Error al buscar modelo',
      error: error.message
    });
  }
};

// POST /api/modelos/:id/cambiar-estado - Cambiar estado del modelo con validaciones
exports.cambiarEstado = async (req, res) => {
  try {
    const { id } = req.params;
    const { nuevoEstado, observaciones, usuarioID } = req.body;
    
    // Validar parámetros
    if (!nuevoEstado) {
      return res.status(400).json({
        success: false,
        message: 'El campo nuevoEstado es obligatorio'
      });
    }
    
    // Obtener modelo actual
    const queryModelo = `
      SELECT * FROM Modelo WHERE ModeloID = ${id} AND Activo = 1
    `;
    const resultadoModelo = await db.queryRaw(queryModelo);
    
    if (resultadoModelo.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Modelo no encontrado'
      });
    }
    
    const modelo = resultadoModelo[0];
    const estadoActual = modelo.Estado;
    
    // Validar transición
    const validacionTransicion = validarTransicionEstado(estadoActual, nuevoEstado);
    if (!validacionTransicion.valido) {
      return res.status(400).json({
        success: false,
        message: validacionTransicion.mensaje
      });
    }
    
    // Validar requisitos del nuevo estado
    const datosCombinados = { ...modelo, ObservacionesRevision: observaciones };
    const validacionRequisitos = validarRequisitosEstado(datosCombinados, nuevoEstado);
    if (!validacionRequisitos.valido) {
      return res.status(400).json({
        success: false,
        message: validacionRequisitos.mensaje,
        detalles: validacionRequisitos.detalles
      });
    }
    
    // Actualizar estado del modelo
    const queryUpdate = `
      UPDATE Modelo 
      SET Estado = N'${nuevoEstado}',
          ObservacionesRevision = ${observaciones ? `N'${observaciones.replace(/'/g, "''")}'` : 'NULL'},
          FechaModificacion = GETDATE(),
          ModificadoPorID = ${usuarioID || 'NULL'}
      WHERE ModeloID = ${id}
    `;
    
    await db.queryRaw(queryUpdate);
    
    // Registrar cambio en historial de estados
    const queryHistorialEstado = `
      INSERT INTO ModeloEstado (ModeloID, EstadoAnterior, EstadoNuevo, UsuarioID, Observaciones, FechaCambio)
      VALUES (
        ${id}, 
        N'${estadoActual}', 
        N'${nuevoEstado}', 
        ${usuarioID || 'NULL'}, 
        ${observaciones ? `N'${observaciones.replace(/'/g, "''")}'` : 'NULL'},
        GETDATE()
      )
    `;
    
    await db.queryRaw(queryHistorialEstado);
    
    logger.info(`Estado de modelo ${id} cambiado de '${estadoActual}' a '${nuevoEstado}'`);
    
    res.json({
      success: true,
      message: `Estado actualizado: ${obtenerNombreEstado(estadoActual)} → ${obtenerNombreEstado(nuevoEstado)}`,
      data: {
        modeloID: id,
        estadoAnterior: estadoActual,
        estadoNuevo: nuevoEstado,
        observaciones: observaciones || null
      }
    });
  } catch (error) {
    logger.error('Error al cambiar estado del modelo:', error);
    res.status(500).json({
      success: false,
      message: 'Error al cambiar estado del modelo',
      error: error.message
    });
  }
};

// POST /api/modelos/:id/validar-datos-minimos - Validar si datos mínimos están completos
exports.validarDatosMinimos = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Obtener modelo
    const queryModelo = `
      SELECT * FROM Modelo WHERE ModeloID = ${id} AND Activo = 1
    `;
    const resultadoModelo = await db.queryRaw(queryModelo);
    
    if (resultadoModelo.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Modelo no encontrado'
      });
    }
    
    const modelo = resultadoModelo[0];
    const validacion = validarDatosMinimos(modelo);
    
    res.json({
      success: true,
      data: {
        modeloID: id,
        datosCompletos: validacion.valido,
        camposFaltantes: validacion.camposFaltantes,
        mensaje: validacion.valido 
          ? 'Todos los campos de datos mínimos están completos'
          : `Faltan ${validacion.camposFaltantes.length} campos obligatorios`
      }
    });
  } catch (error) {
    logger.error('Error al validar datos mínimos:', error);
    res.status(500).json({
      success: false,
      message: 'Error al validar datos mínimos',
      error: error.message
    });
  }
};

// GET /api/modelos/estados - Obtener listado de estados disponibles
exports.getEstados = async (req, res) => {
  try {
    const estadosInfo = Object.entries(ESTADOS).map(([key, value]) => ({
      codigo: value,
      nombre: obtenerNombreEstado(value),
      edicion: permiteEdicion(value)
    }));
    
    res.json({
      success: true,
      data: estadosInfo
    });
  } catch (error) {
    logger.error('Error al obtener estados:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener estados',
      error: error.message
    });
  }
};
