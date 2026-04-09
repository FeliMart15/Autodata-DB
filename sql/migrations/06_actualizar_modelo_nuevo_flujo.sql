-- =============================================
-- Script: Actualización Tabla Modelo - Nuevo Flujo
-- Descripción: Agrega campos para datos mínimos y actualiza estados
-- Fecha: 17 de Enero, 2026
-- =============================================

USE Autodata;
GO

PRINT '====================================';
PRINT 'ACTUALIZANDO TABLA MODELO';
PRINT 'Nuevo flujo de estados con 3 fases';
PRINT '====================================';
PRINT '';
GO

-- =============================================
-- PASO 1: Agregar columnas nuevas para Datos Mínimos
-- =============================================

PRINT 'PASO 1: Agregando columnas de Datos Mínimos...';
PRINT '';

-- Modelo1 (nombre del modelo)
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Modelo') AND name = 'Modelo1')
BEGIN
    ALTER TABLE Modelo ADD Modelo1 NVARCHAR(200) NULL;
    PRINT '  ✓ Columna Modelo1 agregada';
END
ELSE
    PRINT '  - Columna Modelo1 ya existe';

-- Tipo2_Carroceria
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Modelo') AND name = 'Tipo2_Carroceria')
BEGIN
    ALTER TABLE Modelo ADD Tipo2_Carroceria NVARCHAR(100) NULL;
    PRINT '  ✓ Columna Tipo2_Carroceria agregada';
END
ELSE
    PRINT '  - Columna Tipo2_Carroceria ya existe';

-- Cilindros
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Modelo') AND name = 'Cilindros')
BEGIN
    ALTER TABLE Modelo ADD Cilindros INT NULL;
    PRINT '  ✓ Columna Cilindros agregada';
END
ELSE
    PRINT '  - Columna Cilindros ya existe';

-- Valvulas
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Modelo') AND name = 'Valvulas')
BEGIN
    ALTER TABLE Modelo ADD Valvulas INT NULL;
    PRINT '  ✓ Columna Valvulas agregada';
END
ELSE
    PRINT '  - Columna Valvulas ya existe';

-- TipoCajaAut
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Modelo') AND name = 'TipoCajaAut')
BEGIN
    ALTER TABLE Modelo ADD TipoCajaAut NVARCHAR(100) NULL;
    PRINT '  ✓ Columna TipoCajaAut agregada';
END
ELSE
    PRINT '  - Columna TipoCajaAut ya existe';

-- Asientos (diferente de Pasajeros)
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Modelo') AND name = 'Asientos')
BEGIN
    ALTER TABLE Modelo ADD Asientos INT NULL;
    PRINT '  ✓ Columna Asientos agregada';
END
ELSE
    PRINT '  - Columna Asientos ya existe';

-- TipoMotor
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Modelo') AND name = 'TipoMotor')
BEGIN
    ALTER TABLE Modelo ADD TipoMotor NVARCHAR(100) NULL;
    PRINT '  ✓ Columna TipoMotor agregada';
END
ELSE
    PRINT '  - Columna TipoMotor ya existe';

-- TipoVehiculoElectrico
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Modelo') AND name = 'TipoVehiculoElectrico')
BEGIN
    ALTER TABLE Modelo ADD TipoVehiculoElectrico NVARCHAR(100) NULL;
    PRINT '  ✓ Columna TipoVehiculoElectrico agregada';
END
ELSE
    PRINT '  - Columna TipoVehiculoElectrico ya existe';

-- PrecioInicial
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Modelo') AND name = 'PrecioInicial')
BEGIN
    ALTER TABLE Modelo ADD PrecioInicial DECIMAL(18,2) NULL;
    PRINT '  ✓ Columna PrecioInicial agregada';
END
ELSE
    PRINT '  - Columna PrecioInicial ya existe';

PRINT '';
PRINT 'Columnas de Datos Mínimos completadas.';
PRINT '';

-- =============================================
-- PASO 2: Actualizar constraint de Estado
-- =============================================

PRINT 'PASO 2: Actualizando estados permitidos...';
PRINT '';

-- Eliminar constraint antiguo
IF EXISTS (SELECT * FROM sys.check_constraints WHERE name = 'CK_Modelo_Estado')
BEGIN
    ALTER TABLE Modelo DROP CONSTRAINT CK_Modelo_Estado;
    PRINT '  ✓ Constraint antiguo eliminado';
END

-- Crear nuevo constraint con todos los estados
ALTER TABLE Modelo ADD CONSTRAINT CK_Modelo_Estado 
CHECK (Estado IN (
    'importado', 
    'creado',
    'datos_minimos', 
    'revision_minimos',
    'corregir_minimos',
    'minimos_aprobados',
    'equipamiento_cargado',
    'revision_equipamiento',
    'corregir_equipamiento',
    'definitivo'
));
GO

PRINT '  ✓ Constraint de Estado actualizado con 10 estados';
PRINT '';

-- =============================================
-- PASO 3: Migrar estados existentes
-- =============================================

PRINT 'PASO 3: Migrando estados existentes al nuevo sistema...';
PRINT '';

-- Contar estados antes de migración
PRINT '  Estados ANTES de migración:';
SELECT Estado, COUNT(*) as Cantidad
FROM Modelo
GROUP BY Estado
ORDER BY Estado;
PRINT '';

-- Migrar estados antiguos a nuevos
UPDATE Modelo 
SET Estado = 'importado' 
WHERE Estado IN ('IMPORTADO', 'importado')
   OR Estado IS NULL;

UPDATE Modelo 
SET Estado = 'datos_minimos' 
WHERE Estado IN ('MINIMOS', 'REQUISITOS_MINIMOS', 'requisitos_minimos');

UPDATE Modelo 
SET Estado = 'corregir_minimos' 
WHERE Estado IN ('PARA_CORREGIR', 'para_corregir');

UPDATE Modelo 
SET Estado = 'revision_minimos' 
WHERE Estado IN ('EN_REVISION', 'en_revision');

UPDATE Modelo 
SET Estado = 'definitivo' 
WHERE Estado IN ('APROBADO', 'aprobado', 'DEFINITIVO', 'PUBLICADO');

UPDATE Modelo 
SET Estado = 'equipamiento_cargado' 
WHERE Estado IN ('EQUIPAMIENTO_CARGADO', 'equipamiento_cargado');

UPDATE Modelo 
SET Estado = 'revision_equipamiento' 
WHERE Estado IN ('EN_APROBACION', 'en_aprobacion');

PRINT '  ✓ Estados migrados correctamente';
PRINT '';

-- Mostrar estados después de migración
PRINT '  Estados DESPUÉS de migración:';
SELECT Estado, COUNT(*) as Cantidad
FROM Modelo
GROUP BY Estado
ORDER BY Estado;
PRINT '';

-- =============================================
-- PASO 4: Agregar columna para observaciones de revisión
-- =============================================

PRINT 'PASO 4: Agregando columna de observaciones...';
PRINT '';

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Modelo') AND name = 'ObservacionesRevision')
BEGIN
    ALTER TABLE Modelo ADD ObservacionesRevision NVARCHAR(MAX) NULL;
    PRINT '  ✓ Columna ObservacionesRevision agregada';
END
ELSE
    PRINT '  - Columna ObservacionesRevision ya existe';

PRINT '';

-- =============================================
-- PASO 5: Verificar estructura final
-- =============================================

PRINT 'PASO 5: Verificando estructura final...';
PRINT '';

PRINT '  Campos de Datos Mínimos en tabla Modelo:';
SELECT 
    COLUMN_NAME,
    DATA_TYPE,
    CHARACTER_MAXIMUM_LENGTH,
    IS_NULLABLE
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'Modelo'
  AND COLUMN_NAME IN (
    'Segmento', 'Modelo1', 'Tipo2_Carroceria', 'Origen', 
    'Combustible', 'Cilindros', 'Valvulas', 'CC', 'HP', 
    'TipoCajaAut', 'Puertas', 'Asientos', 'TipoMotor', 
    'TipoVehiculoElectrico', 'Importador', 'PrecioInicial'
  )
ORDER BY COLUMN_NAME;

PRINT '';
PRINT '====================================';
PRINT '✓ ACTUALIZACIÓN COMPLETADA';
PRINT '====================================';
PRINT '';
PRINT 'Resumen:';
PRINT '  - 9 columnas nuevas agregadas';
PRINT '  - 10 estados configurados';
PRINT '  - Datos existentes migrados';
PRINT '  - Sistema listo para nuevo flujo';
PRINT '';
GO
