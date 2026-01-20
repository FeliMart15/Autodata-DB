-- =============================================
-- Script: Verificar y agregar columna FechaModificacion
-- Descripción: Asegura que la tabla Modelo tenga FechaModificacion
-- Fecha: 20 de Enero, 2026
-- =============================================

USE Autodata;
GO

PRINT '====================================';
PRINT 'VERIFICANDO COLUMNAS DE AUDITORÍA';
PRINT '====================================';
PRINT '';

-- Verificar si existe FechaModificacion
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Modelo') AND name = 'FechaModificacion')
BEGIN
    PRINT '  ✗ Columna FechaModificacion NO existe - Agregando...';
    ALTER TABLE Modelo ADD FechaModificacion DATETIME2 NULL;
    PRINT '  ✓ Columna FechaModificacion agregada';
END
ELSE
BEGIN
    PRINT '  ✓ Columna FechaModificacion ya existe';
END

-- Verificar si existe ModificadoPorID
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Modelo') AND name = 'ModificadoPorID')
BEGIN
    PRINT '  ✗ Columna ModificadoPorID NO existe - Agregando...';
    ALTER TABLE Modelo ADD ModificadoPorID INT NULL;
    PRINT '  ✓ Columna ModificadoPorID agregada';
END
ELSE
BEGIN
    PRINT '  ✓ Columna ModificadoPorID ya existe';
END

PRINT '';
PRINT 'Verificando estructura de tabla Modelo:';
SELECT 
    COLUMN_NAME,
    DATA_TYPE,
    IS_NULLABLE
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'Modelo'
  AND COLUMN_NAME IN ('FechaCreacion', 'FechaModificacion', 'CreadoPorID', 'ModificadoPorID')
ORDER BY COLUMN_NAME;

PRINT '';
PRINT '====================================';
PRINT '✓ VERIFICACIÓN COMPLETADA';
PRINT '====================================';
GO
