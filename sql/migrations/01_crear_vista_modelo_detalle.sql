-- =================================================================
-- SCRIPT SQL: Vista v_ModeloDetalle corregida
-- Base de datos: Autodata
-- Descripción: Vista con los nombres correctos de columnas
-- =================================================================

USE Autodata;
GO

-- Dropear la vista si existe
IF OBJECT_ID('dbo.v_ModeloDetalle','V') IS NOT NULL
BEGIN
    PRINT 'Eliminando vista existente v_ModeloDetalle...';
    DROP VIEW dbo.v_ModeloDetalle;
END
GO

-- Crear vista con nombres correctos
CREATE VIEW dbo.v_ModeloDetalle AS
SELECT
    -- Información de Marca
    m.MarcaID,
    m.CodigoMarca,
    m.Descripcion AS NombreMarca,
    m.ShortName AS MarcaShortName,
    m.Origen AS MarcaOrigen,
    
    -- Información de Modelo
    mo.ModeloID,
    mo.CodigoModelo,
    mo.DescripcionModelo AS NombreModelo,
    mo.ShortName AS ModeloShortName,
    mo.Familia,
    mo.Anio,
    mo.Tipo,
    mo.Tipo2,
    
    -- Especificaciones técnicas
    mo.CC,
    mo.HP,
    mo.Traccion,
    mo.Caja,
    mo.TipoCaja,
    mo.Turbo,
    mo.Puertas,
    mo.Pasajeros,
    
    -- Categorización
    mo.CategoriaCodigo,
    mo.CombustibleCodigo,
    mo.OrigenCodigo,
    mo.TipoVehiculo,
    mo.SegmentacionAutodata,
    mo.SegmentacionGM,
    mo.SegmentacionAudi,
    mo.SegmentacionSBI,
    mo.SegmentacionCitroen,
    
    -- Estado y comercial
    mo.EstadoID,
    est.NombreEstado AS Estado,
    mo.Importador,
    mo.Precio0KMInicial,
    
    -- Precio vigente (último precio sin fecha de fin)
    p.PrecioID,
    p.Precio AS PrecioVigente,
    p.Moneda,
    p.FechaVigenciaDesde,
    p.FechaVigenciaHasta,
    p.Fuente AS FuentePrecio,
    
    -- Fechas
    mo.FechaCreacion
FROM dbo.Modelo mo
INNER JOIN dbo.Marca m ON mo.MarcaID = m.MarcaID
LEFT JOIN dbo.ModeloEstado est ON mo.EstadoID = est.EstadoID
LEFT JOIN dbo.PrecioModelo p ON p.ModeloID = mo.ModeloID 
    AND (p.FechaVigenciaHasta IS NULL OR p.FechaVigenciaHasta >= CAST(GETDATE() AS DATE))
;
GO

PRINT '✓ Vista v_ModeloDetalle creada exitosamente';
GO

-- Probar la vista
SELECT TOP 10 
    MarcaID,
    NombreMarca,
    ModeloID,
    NombreModelo,
    Estado,
    PrecioVigente,
    Moneda
FROM dbo.v_ModeloDetalle
ORDER BY NombreMarca, NombreModelo;
GO
