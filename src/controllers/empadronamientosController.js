// empadronamientosController.js
// Controlador para gestión de empadronamientos mensuales por departamento

const db = require('../config/db-simple');
const logger = require('../config/logger');

/**
 * Obtener empadronamientos por familia, departamento y periodo
 */
const obtenerEmpadronamientosPorFamilia = async (req, res) => {
    try {
        const { familiaId, departamentoId, periodo } = req.query;

        if (!familiaId || !departamentoId || !periodo) {
            return res.status(400).json({
                success: false,
                message: 'Faltan parámetros requeridos: familiaId, departamentoId, periodo'
            });
        }

        const query = `
            SELECT 
                m.ModeloID,
                m.DescripcionModelo,
                m.FamiliaID,
                f.Nombre as Familia,
                m.MarcaID,
                ma.Descripcion as Marca,
                ISNULL(e.Cantidad, 0) AS Cantidad,
                e.EmpadronamientoID,
                e.Periodo,
                e.DepartamentoID,
                e.FechaModificacion,
                COALESCE((SELECT TOP 1 Precio FROM PrecioModelo pm WHERE pm.ModeloID = m.ModeloID ORDER BY pm.FechaVigenciaDesde DESC, pm.PrecioID DESC), m.Precio0KMInicial, m.PrecioInicial, 0) AS PrecioActual,
                (SELECT TOP 1 FechaVigenciaDesde FROM PrecioModelo pm WHERE pm.ModeloID = m.ModeloID ORDER BY pm.FechaVigenciaDesde DESC, pm.PrecioID DESC) AS FechaPrecio
            FROM Modelo m
            INNER JOIN Marca ma ON m.MarcaID = ma.MarcaID
            INNER JOIN Familia f ON m.FamiliaID = f.FamiliaID
            LEFT JOIN Empadronamiento e ON m.ModeloID = e.ModeloID 
                AND e.DepartamentoID = @departamentoId 
                AND e.Periodo = @periodo
            WHERE m.FamiliaID = @familiaId
                AND m.Activo = 1
            ORDER BY m.DescripcionModelo ASC
        `;

        const result = await db.query(query, { 
            familiaId, 
            departamentoId,
            periodo 
        });

        res.json({
            success: true,
            data: result || [],
            count: result?.length || 0
        });

    } catch (error) {
        logger.error('Error al obtener empadronamientos por familia:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener empadronamientos',
            error: error.message
        });
    }
};

/**
 * Obtener empadronamientos del periodo anterior
 */
const obtenerEmpadronamientosPeriodoAnterior = async (req, res) => {
    try {
        const { familiaId, departamentoId, periodo } = req.query;

        if (!familiaId || !departamentoId || !periodo) {
            return res.status(400).json({
                success: false,
                message: 'Faltan parámetros requeridos'
            });
        }

        // Calcular periodo anterior
        const [anio, mes] = periodo.split('-').map(Number);
        let periodoAnterior;
        
        if (mes === 1) {
            periodoAnterior = `${anio - 1}-12`;
        } else {
            const mesAnterior = mes - 1;
            periodoAnterior = `${anio}-${mesAnterior.toString().padStart(2, '0')}`;
        }

        const query = `
            SELECT 
                m.ModeloID,
                m.DescripcionModelo,
                ISNULL(e.Cantidad, 0) AS CantidadAnterior,
                e.Periodo AS PeriodoAnterior
            FROM Modelo m
            LEFT JOIN Empadronamiento e ON m.ModeloID = e.ModeloID 
                AND e.DepartamentoID = @departamentoId
                AND e.Periodo = @periodoAnterior
            WHERE m.FamiliaID = @familiaId
                AND m.Activo = 1
            ORDER BY m.DescripcionModelo ASC
        `;

        const result = await db.query(query, { 
            familiaId, 
            departamentoId,
            periodoAnterior 
        });

        res.json({
            success: true,
            data: result || [],
            periodoAnterior
        });

    } catch (error) {
        logger.error('Error al obtener empadronamientos periodo anterior:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener empadronamientos del periodo anterior',
            error: error.message
        });
    }
};

/**
 * Crear o actualizar empadronamientos en batch
 */
const crearEmpadronamientosBatch = async (req, res) => {
    try {
        const { periodo, departamentoId, empadronamientos } = req.body;
        const usuarioId = req.user.id;

        // Validaciones
        if (!periodo || !departamentoId || !empadronamientos || !Array.isArray(empadronamientos) || empadronamientos.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Datos inválidos. Se requiere periodo, departamentoId y array de empadronamientos'
            });
        }

        // Validar formato periodo
        const periodoRegex = /^\d{4}-(0[1-9]|1[0-2])$/;
        if (!periodoRegex.test(periodo)) {
            return res.status(400).json({
                success: false,
                message: 'Formato de periodo inválido. Use YYYY-MM'
            });
        }

        // Extraer anio y mes
        const [anio, mes] = periodo.split('-').map(Number);

        // Filtrar solo empadronamientos con cantidad > 0
        const empadronamientosFiltrados = empadronamientos
            .filter(e => e.cantidad > 0)
            .map(e => ({
                modeloId: e.modeloId,
                cantidad: e.cantidad
            }));

        if (empadronamientosFiltrados.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No hay empadronamientos con cantidad mayor a 0'
            });
        }

        // Insertar o actualizar cada empadronamiento
        let affectedRows = 0;
        
        for (const empadronamiento of empadronamientosFiltrados) {
            const query = `
                MERGE Empadronamiento AS target
                USING (SELECT @modeloId AS ModeloID, @departamentoId AS DepartamentoID, @periodo AS Periodo) AS source
                ON target.ModeloID = source.ModeloID 
                    AND target.DepartamentoID = source.DepartamentoID 
                    AND target.Periodo = source.Periodo
                WHEN MATCHED THEN
                    UPDATE SET 
                        Cantidad = @cantidad,
                        ModificadoPorID = @usuarioId,
                        FechaModificacion = GETDATE()
                WHEN NOT MATCHED THEN
                    INSERT (ModeloID, DepartamentoID, Cantidad, Periodo, Anio, Mes, CreadoPorID, FechaCreacion)
                    VALUES (@modeloId, @departamentoId, @cantidad, @periodo, @anio, @mes, @usuarioId, GETDATE());
            `;
            
            await db.query(query, {
                modeloId: empadronamiento.modeloId,
                departamentoId,
                cantidad: empadronamiento.cantidad,
                periodo,
                anio,
                mes,
                usuarioId
            });
            
            affectedRows++;
        }

        logger.info(`Empadronamientos guardados - Usuario: ${req.user.username}, Periodo: ${periodo}, Depto: ${departamentoId}, Cantidad: ${affectedRows}`);

        res.json({
            success: true,
            message: `Se guardaron ${affectedRows} empadronamientos correctamente`,
            affectedRows,
            periodo,
            departamentoId
        });

    } catch (error) {
        logger.error('Error al crear empadronamientos batch:', error);
        res.status(500).json({
            success: false,
            message: 'Error al guardar empadronamientos',
            error: error.message
        });
    }
};

/**
 * Obtener resumen de empadronamientos por departamento y periodo
 */
const obtenerResumenEmpadronamientos = async (req, res) => {
    try {
        const { periodo, departamentoId } = req.query;

        if (!periodo) {
            return res.status(400).json({
                success: false,
                message: 'Falta parámetro requerido: periodo'
            });
        }

        let query;
        let params;

        if (departamentoId) {
            // Resumen por departamento específico
            query = `
                SELECT 
                    Departamento,
                    CodigoDepartamento,
                    Marca,
                    Familia,
                    CantidadModelos,
                    TotalEmpadronamientos
                FROM vw_ResumenEmpadronamientosPorDepartamento
                WHERE Periodo = @periodo AND DepartamentoID = @departamentoId
                ORDER BY Marca, Familia
            `;
            params = { periodo, departamentoId };
        } else {
            // Resumen todos los departamentos
            query = `
                SELECT 
                    Departamento,
                    CodigoDepartamento,
                    Marca,
                    Familia,
                    CantidadModelos,
                    TotalEmpadronamientos
                FROM vw_ResumenEmpadronamientosPorDepartamento
                WHERE Periodo = @periodo
                ORDER BY Departamento, Marca, Familia
            `;
            params = { periodo };
        }

        const result = await db.query(query, params);

        res.json({
            success: true,
            data: result || [],
            periodo
        });

    } catch (error) {
        logger.error('Error al obtener resumen de empadronamientos:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener resumen de empadronamientos',
            error: error.message
        });
    }
};

/**
 * Obtener historial de empadronamientos de un modelo en un departamento
 */
const obtenerHistorialEmpadronamientosModelo = async (req, res) => {
    try {
        const { modeloId, departamentoId } = req.params;
        const { limit = 12 } = req.query;

        const query = `
            SELECT TOP (@limit)
                EmpadronamientoID,
                ModeloID,
                DepartamentoID,
                Cantidad,
                Periodo,
                Anio,
                Mes,
                FechaCreacion,
                FechaModificacion
            FROM Empadronamiento
            WHERE ModeloID = @modeloId AND DepartamentoID = @departamentoId
            ORDER BY Anio DESC, Mes DESC
        `;

        const result = await db.query(query, { 
            modeloId, 
            departamentoId,
            limit: parseInt(limit) 
        });

        res.json({
            success: true,
            data: result || [],
            count: result?.length || 0
        });

    } catch (error) {
        logger.error('Error al obtener historial de empadronamientos:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener historial de empadronamientos',
            error: error.message
        });
    }
};

module.exports = {
    obtenerEmpadronamientosPorFamilia,
    obtenerEmpadronamientosPeriodoAnterior,
    crearEmpadronamientosBatch,
    obtenerResumenEmpadronamientos,
    obtenerHistorialEmpadronamientosModelo
};
