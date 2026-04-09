-- =============================================
-- Script: Renombrar Tipo2_Carroceria a Carroceria
-- Descripción: Migración para unificar el nombre de la columna
--              de carrocería en la tabla Modelo
-- Fecha: 23 de Enero, 2026
-- =============================================

USE Autodata;
GO

PRINT '====================================';
PRINT 'MIGRACIÓN: Renombrar Tipo2_Carroceria';
PRINT '====================================';
PRINT '';
GO

-- Verificar estado actual
PRINT 'Verificando estado actual de la columna...';
GO

IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Modelo') AND name = 'Tipo2_Carroceria')
BEGIN
    PRINT '  ✓ Columna Tipo2_Carroceria encontrada';
    
    -- Verificar si ya existe Carroceria
    IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Modelo') AND name = 'Carroceria')
    BEGIN
        PRINT '  ⚠ ADVERTENCIA: La columna Carroceria ya existe';
        PRINT '  ⚠ Se necesita consolidación manual';
        PRINT '';
        PRINT 'Ejecuta este query para ver los datos:';
        PRINT 'SELECT ModeloID, Tipo2_Carroceria, Carroceria FROM Modelo WHERE Tipo2_Carroceria IS NOT NULL OR Carroceria IS NOT NULL;';
    END
    ELSE
    BEGIN
        PRINT '  ✓ Columna Carroceria no existe, procediendo con el renombrado...';
        PRINT '';
        
        -- Renombrar la columna
        EXEC sp_rename 'Modelo.Tipo2_Carroceria', 'Carroceria', 'COLUMN';
        PRINT '  ✓ Columna Tipo2_Carroceria renombrada exitosamente a Carroceria';
        PRINT '';
        
        -- Verificar el cambio
        IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Modelo') AND name = 'Carroceria')
        AND NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Modelo') AND name = 'Tipo2_Carroceria')
        BEGIN
            PRINT '  ✓ Verificación exitosa: La columna ahora se llama Carroceria';
        END
        ELSE
        BEGIN
            PRINT '  ✗ ERROR: El renombrado no se completó correctamente';
        END
    END
END
ELSE
BEGIN
    -- Tipo2_Carroceria no existe, verificar si Carroceria existe
    IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Modelo') AND name = 'Carroceria')
    BEGIN
        PRINT '  ✓ La columna Carroceria ya existe';
        PRINT '  ℹ No se necesita migración';
    END
    ELSE
    BEGIN
        PRINT '  ✗ ERROR: Ni Tipo2_Carroceria ni Carroceria existen';
        PRINT '  ℹ Creando columna Carroceria...';
        PRINT '';
        
        ALTER TABLE Modelo ADD Carroceria NVARCHAR(100) NULL;
        PRINT '  ✓ Columna Carroceria creada';
    END
END
GO

PRINT '';
PRINT 'Estado final de columnas relacionadas con carrocería:';
PRINT '-----------------------------------------------------';
SELECT 
    COLUMN_NAME,
    DATA_TYPE,
    CHARACTER_MAXIMUM_LENGTH,
    IS_NULLABLE,
    COLUMN_DEFAULT
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'Modelo' 
AND COLUMN_NAME IN ('Tipo2_Carroceria', 'Carroceria', 'Tipo2', 'TipoCarroceria')
ORDER BY COLUMN_NAME;
GO

PRINT '';
PRINT '====================================';
PRINT 'MIGRACIÓN COMPLETADA';
PRINT '====================================';
GO
