-- =============================================
-- Script: Crear tabla de historial de estados
-- Descripción: Crea tabla para tracking de cambios de estado de modelos
-- Fecha: 20 de Enero, 2026
-- =============================================

USE Autodata;
GO

PRINT '====================================';
PRINT 'CONFIGURANDO TABLAS DE ESTADO';
PRINT '====================================';
PRINT '';

-- Verificar si existe la tabla de catálogo de estados
IF EXISTS (SELECT * FROM sys.tables WHERE name = 'ModeloEstado' AND type = 'U')
BEGIN
    -- Verificar si tiene solo columnas de catálogo (EstadoID, NombreEstado)
    IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('ModeloEstado') AND name = 'NombreEstado')
       AND NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('ModeloEstado') AND name = 'ModeloID')
    BEGIN
        PRINT '  Tabla ModeloEstado existente es un catálogo - renombrando...';
        
        -- Renombrar la tabla existente
        EXEC sp_rename 'ModeloEstado', 'EstadoCatalogo';
        PRINT '  ✓ Tabla renombrada a EstadoCatalogo';
    END
END

-- Crear tabla ModeloEstado para historial de cambios
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'ModeloEstado')
BEGIN
    PRINT '  Creando tabla ModeloEstado para historial...';
    
    CREATE TABLE ModeloEstado (
        ModeloEstadoID INT IDENTITY(1,1) PRIMARY KEY,
        ModeloID INT NOT NULL,
        EstadoAnterior NVARCHAR(50),
        EstadoNuevo NVARCHAR(50) NOT NULL,
        UsuarioID INT NULL,
        Observaciones NVARCHAR(MAX),
        FechaCambio DATETIME2 NOT NULL DEFAULT GETDATE(),
        
        CONSTRAINT FK_ModeloEstado_Modelo FOREIGN KEY (ModeloID) REFERENCES Modelo(ModeloID)
    );
    
    CREATE NONCLUSTERED INDEX IX_ModeloEstado_ModeloID ON ModeloEstado(ModeloID);
    CREATE NONCLUSTERED INDEX IX_ModeloEstado_FechaCambio ON ModeloEstado(FechaCambio DESC);
    
    PRINT '  ✓ Tabla ModeloEstado creada exitosamente';
END
ELSE
BEGIN
    PRINT '  ✓ Tabla ModeloEstado ya existe';
END

PRINT '';
PRINT 'Verificando estructura de ModeloEstado:';
SELECT 
    COLUMN_NAME,
    DATA_TYPE,
    IS_NULLABLE
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'ModeloEstado'
ORDER BY ORDINAL_POSITION;

PRINT '';
PRINT '====================================';
PRINT '✓ CONFIGURACIÓN COMPLETADA';
PRINT '====================================';
GO
