-- =============================================
-- Script de Migración: Agregar columna Activo a Modelo
-- Fecha: 2025-12-11
-- =============================================

USE Autodata;
GO

-- Verificar si la columna ya existe
IF NOT EXISTS (
    SELECT * FROM sys.columns 
    WHERE object_id = OBJECT_ID('Modelo') 
    AND name = 'Activo'
)
BEGIN
    PRINT 'Agregando columna Activo a tabla Modelo...';
    
    ALTER TABLE Modelo
    ADD Activo BIT NOT NULL DEFAULT 1;
    
    PRINT 'Columna Activo agregada exitosamente';
END
ELSE
BEGIN
    PRINT 'La columna Activo ya existe en la tabla Modelo';
END
GO

-- Verificar el resultado
SELECT 
    COLUMN_NAME, 
    DATA_TYPE, 
    IS_NULLABLE, 
    COLUMN_DEFAULT
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'Modelo'
AND COLUMN_NAME = 'Activo';
GO
