-- =================================================================
-- SCRIPT SQL: Seed data para ModeloEstado
-- Base de datos: Autodata
-- Descripción: Inserta los estados del workflow si no existen
-- =================================================================

USE Autodata;
GO

PRINT 'Insertando estados del workflow...';

-- Verificar si la tabla existe
IF OBJECT_ID('dbo.ModeloEstado', 'U') IS NULL
BEGIN
    PRINT '✗ Tabla ModeloEstado no existe. Debes crearla primero.';
    PRINT 'Ejecuta el siguiente script:';
    PRINT '';
    PRINT 'CREATE TABLE dbo.ModeloEstado (';
    PRINT '    EstadoID INT IDENTITY(1,1) PRIMARY KEY,';
    PRINT '    NombreEstado NVARCHAR(100) NOT NULL UNIQUE';
    PRINT ');';
END
ELSE
BEGIN
    -- Insertar estados si no existen
    IF NOT EXISTS (SELECT 1 FROM dbo.ModeloEstado WHERE NombreEstado = 'IMPORTADO')
        INSERT INTO dbo.ModeloEstado (NombreEstado) VALUES ('IMPORTADO');
    
    IF NOT EXISTS (SELECT 1 FROM dbo.ModeloEstado WHERE NombreEstado = 'MINIMOS')
        INSERT INTO dbo.ModeloEstado (NombreEstado) VALUES ('MINIMOS');
    
    IF NOT EXISTS (SELECT 1 FROM dbo.ModeloEstado WHERE NombreEstado = 'PARA_CORREGIR')
        INSERT INTO dbo.ModeloEstado (NombreEstado) VALUES ('PARA_CORREGIR');
    
    IF NOT EXISTS (SELECT 1 FROM dbo.ModeloEstado WHERE NombreEstado = 'APROBADO')
        INSERT INTO dbo.ModeloEstado (NombreEstado) VALUES ('APROBADO');
    
    IF NOT EXISTS (SELECT 1 FROM dbo.ModeloEstado WHERE NombreEstado = 'PUBLICADO')
        INSERT INTO dbo.ModeloEstado (NombreEstado) VALUES ('PUBLICADO');
    
    IF NOT EXISTS (SELECT 1 FROM dbo.ModeloEstado WHERE NombreEstado = 'INACTIVO')
        INSERT INTO dbo.ModeloEstado (NombreEstado) VALUES ('INACTIVO');
    
    PRINT '✓ Estados insertados correctamente';
    PRINT '';
    
    -- Mostrar estados actuales
    SELECT EstadoID, NombreEstado 
    FROM dbo.ModeloEstado
    ORDER BY EstadoID;
END
GO
