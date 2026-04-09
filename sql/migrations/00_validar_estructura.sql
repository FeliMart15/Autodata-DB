-- =================================================================
-- SCRIPT SQL: Validación de estructura de base de datos
-- Base de datos: Autodata
-- Descripción: Valida que todas las tablas y columnas existan
-- =================================================================

USE Autodata;
GO

PRINT '=================================================================';
PRINT 'VALIDACIÓN DE ESTRUCTURA DE BASE DE DATOS - AUTODATA';
PRINT '=================================================================';
PRINT '';

-- 1. Validar que la base de datos existe
IF DB_ID('Autodata') IS NOT NULL
    PRINT '✓ Base de datos Autodata encontrada';
ELSE
BEGIN
    PRINT '✗ Base de datos Autodata NO encontrada';
    PRINT 'Debes crear la base de datos primero';
END
GO

-- 2. Listar todas las tablas principales
PRINT '';
PRINT 'Tablas encontradas:';
PRINT '-------------------';
SELECT 
    TABLE_SCHEMA,
    TABLE_NAME,
    TABLE_TYPE
FROM INFORMATION_SCHEMA.TABLES
WHERE TABLE_TYPE = 'BASE TABLE'
ORDER BY TABLE_NAME;
GO

-- 3. Validar existencia de tablas críticas
PRINT '';
PRINT 'Validación de tablas críticas:';
PRINT '-------------------------------';

DECLARE @TablasCriticas TABLE (NombreTabla NVARCHAR(100));
INSERT INTO @TablasCriticas VALUES 
    ('Marca'),
    ('Modelo'),
    ('ModeloEstado'),
    ('VersionModelo'),
    ('EquipamientoModelo'),
    ('PrecioModelo'),
    ('PrecioVersion');

DECLARE @Tabla NVARCHAR(100);
DECLARE tabla_cursor CURSOR FOR SELECT NombreTabla FROM @TablasCriticas;

OPEN tabla_cursor;
FETCH NEXT FROM tabla_cursor INTO @Tabla;

WHILE @@FETCH_STATUS = 0
BEGIN
    IF OBJECT_ID('dbo.' + @Tabla, 'U') IS NOT NULL
        PRINT '✓ Tabla ' + @Tabla + ' existe';
    ELSE
        PRINT '✗ Tabla ' + @Tabla + ' NO existe';
    
    FETCH NEXT FROM tabla_cursor INTO @Tabla;
END

CLOSE tabla_cursor;
DEALLOCATE tabla_cursor;
GO

-- 4. Contar registros en tablas principales
PRINT '';
PRINT 'Cantidad de registros por tabla:';
PRINT '---------------------------------';

IF OBJECT_ID('dbo.Marca', 'U') IS NOT NULL
BEGIN
    DECLARE @CountMarcas INT;
    SELECT @CountMarcas = COUNT(*) FROM dbo.Marca;
    PRINT 'Marca: ' + CAST(@CountMarcas AS NVARCHAR(10)) + ' registros';
END

IF OBJECT_ID('dbo.Modelo', 'U') IS NOT NULL
BEGIN
    DECLARE @CountModelos INT;
    SELECT @CountModelos = COUNT(*) FROM dbo.Modelo;
    PRINT 'Modelo: ' + CAST(@CountModelos AS NVARCHAR(10)) + ' registros';
END

IF OBJECT_ID('dbo.ModeloEstado', 'U') IS NOT NULL
BEGIN
    DECLARE @CountEstados INT;
    SELECT @CountEstados = COUNT(*) FROM dbo.ModeloEstado;
    PRINT 'ModeloEstado: ' + CAST(@CountEstados AS NVARCHAR(10)) + ' registros';
END

IF OBJECT_ID('dbo.VersionModelo', 'U') IS NOT NULL
BEGIN
    DECLARE @CountVersiones INT;
    SELECT @CountVersiones = COUNT(*) FROM dbo.VersionModelo;
    PRINT 'VersionModelo: ' + CAST(@CountVersiones AS NVARCHAR(10)) + ' registros';
END

IF OBJECT_ID('dbo.PrecioModelo', 'U') IS NOT NULL
BEGIN
    DECLARE @CountPrecios INT;
    SELECT @CountPrecios = COUNT(*) FROM dbo.PrecioModelo;
    PRINT 'PrecioModelo: ' + CAST(@CountPrecios AS NVARCHAR(10)) + ' registros';
END
GO

-- 5. Validar Foreign Keys críticas
PRINT '';
PRINT 'Validación de Foreign Keys:';
PRINT '----------------------------';

SELECT 
    fk.name AS ForeignKey,
    OBJECT_NAME(fk.parent_object_id) AS TablaOrigen,
    OBJECT_NAME(fk.referenced_object_id) AS TablaReferencia
FROM sys.foreign_keys fk
WHERE OBJECT_NAME(fk.parent_object_id) IN ('Modelo', 'VersionModelo', 'PrecioModelo', 'PrecioVersion', 'EquipamientoModelo')
ORDER BY TablaOrigen;
GO

-- 6. Listar columnas de tablas principales con sus tipos
PRINT '';
PRINT 'Estructura de tabla Modelo:';
PRINT '----------------------------';
SELECT 
    COLUMN_NAME,
    DATA_TYPE,
    CHARACTER_MAXIMUM_LENGTH,
    IS_NULLABLE
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'Modelo'
ORDER BY ORDINAL_POSITION;
GO

PRINT '';
PRINT '=================================================================';
PRINT 'FIN DE VALIDACIÓN';
PRINT '=================================================================';
