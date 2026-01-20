-- =============================================
-- Script: Fixes y Utilidades Consolidadas
-- Descripción: Consolidación de scripts de corrección y verificación
-- Fecha: 20 de Enero, 2026
-- =============================================

USE Autodata;
GO

PRINT '====================================';
PRINT 'SCRIPTS DE CORRECCIÓN CONSOLIDADOS';
PRINT '====================================';
PRINT '';

-- =============================================
-- 1. VERIFICACIÓN DE COLUMNAS DE AUDITORÍA
-- =============================================
PRINT '1. Verificando columnas de auditoría...';

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Modelo') AND name = 'FechaModificacion')
BEGIN
    PRINT '  - Agregando columna FechaModificacion...';
    ALTER TABLE Modelo ADD FechaModificacion DATETIME2 NULL;
    PRINT '  ✓ Columna FechaModificacion agregada';
END
ELSE
    PRINT '  ✓ FechaModificacion ya existe';

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Modelo') AND name = 'ModificadoPorID')
BEGIN
    PRINT '  - Agregando columna ModificadoPorID...';
    ALTER TABLE Modelo ADD ModificadoPorID INT NULL;
    PRINT '  ✓ Columna ModificadoPorID agregada';
END
ELSE
    PRINT '  ✓ ModificadoPorID ya existe';

-- =============================================
-- 2. CONFIGURACIÓN DE TABLAS DE ESTADO
-- =============================================
PRINT '';
PRINT '2. Configurando tablas de estado...';

-- Renombrar tabla de catálogo si existe
IF EXISTS (
    SELECT * FROM sys.tables WHERE name = 'ModeloEstado' AND type = 'U'
    AND EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('ModeloEstado') AND name = 'NombreEstado')
    AND NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('ModeloEstado') AND name = 'ModeloID')
)
BEGIN
    PRINT '  - Renombrando catálogo de estados...';
    EXEC sp_rename 'ModeloEstado', 'EstadoCatalogo';
    PRINT '  ✓ Tabla renombrada a EstadoCatalogo';
END

-- Crear tabla ModeloEstado para historial
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'ModeloEstado')
BEGIN
    PRINT '  - Creando tabla ModeloEstado para historial...';
    
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
    
    PRINT '  ✓ Tabla ModeloEstado creada';
END
ELSE
    PRINT '  ✓ ModeloEstado ya existe';

-- =============================================
-- 3. VERIFICACIÓN DE ESTRUCTURA COMPLETA
-- =============================================
PRINT '';
PRINT '3. Verificando estructura de tablas...';
PRINT '';

SELECT 
    TABLE_NAME as 'Tabla',
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = t.TABLE_NAME) as 'Columnas',
    CASE 
        WHEN TABLE_NAME IN ('Usuario', 'Marca', 'Modelo', 'ModeloEstado', 'EquipamientoModelo', 'VersionModelo', 'PrecioModelo', 'PrecioVersion') 
        THEN 'Principal'
        WHEN TABLE_NAME LIKE '%Historial%' THEN 'Auditoría'
        WHEN TABLE_NAME LIKE 'Ventas%' THEN 'Ventas'
        ELSE 'Otro'
    END as 'Categoría'
FROM INFORMATION_SCHEMA.TABLES t
WHERE TABLE_TYPE = 'BASE TABLE'
ORDER BY Categoría, TABLE_NAME;

PRINT '';
PRINT '====================================';
PRINT 'CORRECCIONES COMPLETADAS';
PRINT '====================================';
