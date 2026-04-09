// ventasController.js
// Controlador para gestión de ventas mensuales

const db = require('../config/db-simple');
const logger = require('../config/logger');

/**
 * Obtener ventas por familia y periodo
 */
const obtenerVentasPorFamilia = async (req, res) => {
    try {
        const { familiaId, periodo } = req.query;

        if (!familiaId || !periodo) {
            return res.status(400).json({
                success: false,
                message: 'Faltan parámetros requeridos: familiaId, periodo'
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
                ISNULL(v.Cantidad, 0) AS Cantidad,
                v.VentaID,
                v.Periodo,
                v.FechaModificacion,
                COALESCE((SELECT TOP 1 Precio FROM PrecioModelo pm WHERE pm.ModeloID = m.ModeloID ORDER BY pm.FechaVigenciaDesde DESC, pm.PrecioID DESC), m.Precio0KMInicial, m.PrecioInicial, 0) AS PrecioActual,
                (SELECT TOP 1 FechaVigenciaDesde FROM PrecioModelo pm WHERE pm.ModeloID = m.ModeloID ORDER BY pm.FechaVigenciaDesde DESC, pm.PrecioID DESC) AS FechaPrecio
            FROM Modelo m
            INNER JOIN Marca ma ON m.MarcaID = ma.MarcaID
            INNER JOIN Familia f ON m.FamiliaID = f.FamiliaID
            LEFT JOIN Venta v ON m.ModeloID = v.ModeloID AND v.Periodo = @periodo
            WHERE m.FamiliaID = @familiaId 
                AND m.Activo = 1
            ORDER BY m.DescripcionModelo ASC
        `;

        const result = await db.query(query, { 
            familiaId, 
            periodo 
        });

        res.json({
            success: true,
            data: result || [],
            count: result?.length || 0
        });

    } catch (error) {
        logger.error('Error al obtener ventas por familia:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener ventas',
            error: error.message
        });
    }
};

/**
 * Obtener ventas del periodo anterior (para referencia)
 */
const obtenerVentasPeriodoAnterior = async (req, res) => {
    try {
        const { familiaId, periodo } = req.query;

        if (!familiaId || !periodo) {
            return res.status(400).json({
                success: false,
                message: 'Faltan parámetros requeridos: familiaId, periodo'
            });
        }

        // Calcular periodo anterior (mes anterior)
        const [año, mes] = periodo.split('-').map(Number);
        let periodoAnterior;
        
        if (mes === 1) {
            periodoAnterior = `${año - 1}-12`;
        } else {
            const mesAnterior = mes - 1;
            periodoAnterior = `${año}-${mesAnterior.toString().padStart(2, '0')}`;
        }

        const query = `
            SELECT 
                m.ModeloID,
                m.DescripcionModelo,
                ISNULL(v.Cantidad, 0) AS CantidadAnterior,
                v.Periodo AS PeriodoAnterior
            FROM Modelo m
            LEFT JOIN Venta v ON m.ModeloID = v.ModeloID AND v.Periodo = @periodoAnterior
            WHERE m.FamiliaID = @familiaId
                AND m.Activo = 1
            ORDER BY m.DescripcionModelo ASC
        `;

        const result = await db.query(query, { 
            familiaId, 
            periodoAnterior 
        });

        res.json({
            success: true,
            data: result || [],
            periodoAnterior
        });

    } catch (error) {
        logger.error('Error al obtener ventas periodo anterior:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener ventas del periodo anterior',
            error: error.message
        });
    }
};

/**
 * Crear o actualizar ventas en batch
 */
const crearVentasBatch = async (req, res) => {
    try {
        const { periodo, ventas } = req.body;
        const usuarioId = req.user.id;

        // Validaciones
        if (!periodo || !ventas || !Array.isArray(ventas) || ventas.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Datos inválidos. Se requiere periodo y array de ventas'
            });
        }

        // Validar formato periodo (YYYY-MM)
        const periodoRegex = /^\d{4}-(0[1-9]|1[0-2])$/;
        if (!periodoRegex.test(periodo)) {
            return res.status(400).json({
                success: false,
                message: 'Formato de periodo inválido. Use YYYY-MM'
            });
        }

        // Extraer año y mes
        const [anio, mes] = periodo.split('-').map(Number);

        // Filtrar solo ventas con cantidad > 0
        const ventasFiltradas = ventas
            .filter(v => v.cantidad > 0)
            .map(v => ({
                modeloId: v.modeloId,
                cantidad: v.cantidad
            }));

        if (ventasFiltradas.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No hay ventas con cantidad mayor a 0'
            });
        }

        // Insertar o actualizar cada venta
        let affectedRows = 0;
        
        for (const venta of ventasFiltradas) {
            const query = `
                MERGE Venta AS target
                USING (SELECT @modeloId AS ModeloID, @periodo AS Periodo) AS source
                ON target.ModeloID = source.ModeloID AND target.Periodo = source.Periodo
                WHEN MATCHED THEN
                    UPDATE SET 
                        Cantidad = @cantidad,
                        ModificadoPorID = @usuarioId,
                        FechaModificacion = GETDATE()
                WHEN NOT MATCHED THEN
                    INSERT (ModeloID, Cantidad, Periodo, Anio, Mes, CreadoPorID, FechaCreacion)
                    VALUES (@modeloId, @cantidad, @periodo, @anio, @mes, @usuarioId, GETDATE());
            `;
            
            await db.query(query, {
                modeloId: venta.modeloId,
                cantidad: venta.cantidad,
                periodo,
                anio,
                mes,
                usuarioId
            });
            
            affectedRows++;
        }

        logger.info(`Ventas guardadas - Usuario: ${req.user.username}, Periodo: ${periodo}, Cantidad: ${affectedRows}`);

        res.json({
            success: true,
            message: `Se guardaron ${affectedRows} ventas correctamente`,
            affectedRows,
            periodo
        });

    } catch (error) {
        logger.error('Error al crear ventas batch:', error);
        res.status(500).json({
            success: false,
            message: 'Error al guardar ventas',
            error: error.message
        });
    }
};

/**
 * Obtener resumen de ventas por periodo
 */
const obtenerResumenVentas = async (req, res) => {
    try {
        const { periodo } = req.query;

        if (!periodo) {
            return res.status(400).json({
                success: false,
                message: 'Falta parámetro requerido: periodo'
            });
        }

        const query = `
            SELECT 
                Marca,
                Familia,
                CantidadModelos,
                TotalVentas
            FROM vw_ResumenVentasPorFamilia
            WHERE Periodo = @periodo
            ORDER BY Marca, Familia
        `;

        const result = await db.query(query, { periodo });

        res.json({
            success: true,
            data: result || [],
            periodo
        });

    } catch (error) {
        logger.error('Error al obtener resumen de ventas:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener resumen de ventas',
            error: error.message
        });
    }
};

/**
 * Obtener historial de ventas de un modelo
 */
const obtenerHistorialVentasModelo = async (req, res) => {
    try {
        const { modeloId } = req.params;
        const { limit = 12 } = req.query; // Por defecto últimos 12 meses

        const query = `
            SELECT TOP (@limit)
                VentaID,
                ModeloID,
                Cantidad,
                Periodo,
                Anio,
                Mes,
                FechaCreacion,
                FechaModificacion
            FROM Venta
            WHERE ModeloID = @modeloId
            ORDER BY Anio DESC, Mes DESC
        `;

        const result = await db.query(query, { 
            modeloId, 
            limit: parseInt(limit) 
        });

        res.json({
            success: true,
            data: result || [],
            count: result?.length || 0
        });

    } catch (error) {
        logger.error('Error al obtener historial de ventas:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener historial de ventas',
            error: error.message
        });
    }
};

module.exports = {
    obtenerVentasPorFamilia,
    obtenerVentasPeriodoAnterior,
    crearVentasBatch,
    obtenerResumenVentas,
    obtenerHistorialVentasModelo
};
