-- =============================================
-- Script: Reestructuración Tabla Modelo - 19 Campos
-- Descripción: Reestructura tabla Modelo con SOLO 19 campos
--              5 campos obligatorios + 14 datos mínimos
--              Elimina campo Modelo1 y otros campos innecesarios
--              Separa equipamiento a tabla dedicada
-- Fecha: 20 de Enero, 2026
-- =============================================

USE Autodata;
GO

PRINT '====================================';
PRINT 'REESTRUCTURANDO TABLA MODELO';
PRINT '19 campos totales:';
PRINT '  - 5 Obligatorios';
PRINT '  - 14 Datos Mínimos';
PRINT '====================================';
PRINT '';
GO

-- =============================================
-- PASO 1: Respaldar tabla actual
-- =============================================

PRINT 'PASO 1: Creando respaldo de tabla Modelo...';

IF OBJECT_ID('Modelo_Backup_20260120', 'U') IS NOT NULL
    DROP TABLE Modelo_Backup_20260120;
GO

SELECT * INTO Modelo_Backup_20260120 FROM Modelo;
PRINT '  ✓ Respaldo creado: Modelo_Backup_20260120';
PRINT '';
GO

-- =============================================
-- PASO 2: Eliminar columnas innecesarias
-- =============================================

PRINT 'PASO 2: Eliminando columnas innecesarias...';
PRINT '';

-- Eliminar Modelo1
IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Modelo') AND name = 'Modelo1')
BEGIN
    ALTER TABLE Modelo DROP COLUMN Modelo1;
    PRINT '  ✓ Columna Modelo1 eliminada';
END

-- Eliminar campos que no están en los 19 definidos
IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Modelo') AND name = 'Año')
BEGIN
    ALTER TABLE Modelo DROP COLUMN Año;
    PRINT '  ✓ Columna Año eliminada';
END

IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Modelo') AND name = 'Tipo')
BEGIN
    ALTER TABLE Modelo DROP COLUMN Tipo;
    PRINT '  ✓ Columna Tipo eliminada';
END

IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Modelo') AND name = 'Tipo2')
BEGIN
    ALTER TABLE Modelo DROP COLUMN Tipo2;
    PRINT '  ✓ Columna Tipo2 eliminada';
END

IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Modelo') AND name = 'TipoVehiculo')
BEGIN
    ALTER TABLE Modelo DROP COLUMN TipoVehiculo;
    PRINT '  ✓ Columna TipoVehiculo eliminada';
END

IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Modelo') AND name = 'Turbo')
BEGIN
    ALTER TABLE Modelo DROP COLUMN Turbo;
    PRINT '  ✓ Columna Turbo eliminada';
END

IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Modelo') AND name = 'Traccion')
BEGIN
    ALTER TABLE Modelo DROP COLUMN Traccion;
    PRINT '  ✓ Columna Traccion eliminada';
END

IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Modelo') AND name = 'Caja')
BEGIN
    ALTER TABLE Modelo DROP COLUMN Caja;
    PRINT '  ✓ Columna Caja eliminada';
END

IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Modelo') AND name = 'TipoCaja')
BEGIN
    ALTER TABLE Modelo DROP COLUMN TipoCaja;
    PRINT '  ✓ Columna TipoCaja eliminada';
END

IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Modelo') AND name = 'Pasajeros')
BEGIN
    ALTER TABLE Modelo DROP COLUMN Pasajeros;
    PRINT '  ✓ Columna Pasajeros eliminada';
END

PRINT '';
GO

-- =============================================
-- PASO 3: Renombrar columnas para consistencia
-- =============================================

PRINT 'PASO 3: Verificando y ajustando nombres de columnas...';
PRINT '';

-- Renombrar Origen a OrigenCodigo si aún existe como Origen
IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Modelo') AND name = 'Origen')
AND NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Modelo') AND name = 'OrigenCodigo')
BEGIN
    EXEC sp_rename 'Modelo.Origen', 'OrigenCodigo', 'COLUMN';
    PRINT '  ✓ Columna Origen renombrada a OrigenCodigo';
END

-- Renombrar SegmentacionAutodata si no existe
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Modelo') AND name = 'SegmentacionAutodata')
AND EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Modelo') AND name = 'Segmento')
BEGIN
    EXEC sp_rename 'Modelo.Segmento', 'SegmentacionAutodata', 'COLUMN';
    PRINT '  ✓ Columna Segmento renombrada a SegmentacionAutodata';
END

-- Renombrar Tipo2_Carroceria a Carroceria si existe
IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Modelo') AND name = 'Tipo2_Carroceria')
AND NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Modelo') AND name = 'Carroceria')
BEGIN
    EXEC sp_rename 'Modelo.Tipo2_Carroceria', 'Carroceria', 'COLUMN';
    PRINT '  ✓ Columna Tipo2_Carroceria renombrada a Carroceria';
END

-- Renombrar Categoria si no tiene formato correcto
IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Modelo') AND name = 'Categoria')
AND NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Modelo') AND name = 'CategoriaVehiculo')
BEGIN
    EXEC sp_rename 'Modelo.Categoria', 'CategoriaVehiculo', 'COLUMN';
    PRINT '  ✓ Columna Categoria renombrada a CategoriaVehiculo';
END

PRINT '';
GO

-- =============================================
-- PASO 4: Agregar columnas faltantes
-- =============================================

PRINT 'PASO 4: Agregando columnas faltantes (si no existen)...';
PRINT '';

-- Familia
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Modelo') AND name = 'Familia')
BEGIN
    ALTER TABLE Modelo ADD Familia NVARCHAR(100) NULL;
    PRINT '  ✓ Columna Familia agregada';
END

-- SegmentacionAutodata
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Modelo') AND name = 'SegmentacionAutodata')
BEGIN
    ALTER TABLE Modelo ADD SegmentacionAutodata NVARCHAR(100) NULL;
    PRINT '  ✓ Columna SegmentacionAutodata agregada';
END

-- Carroceria
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Modelo') AND name = 'Carroceria')
BEGIN
    ALTER TABLE Modelo ADD Carroceria NVARCHAR(100) NULL;
    PRINT '  ✓ Columna Carroceria agregada';
END

-- OrigenCodigo
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Modelo') AND name = 'OrigenCodigo')
BEGIN
    ALTER TABLE Modelo ADD OrigenCodigo NVARCHAR(100) NULL;
    PRINT '  ✓ Columna OrigenCodigo agregada';
END

-- Cilindros
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Modelo') AND name = 'Cilindros')
BEGIN
    ALTER TABLE Modelo ADD Cilindros INT NULL;
    PRINT '  ✓ Columna Cilindros agregada';
END

-- Valvulas
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Modelo') AND name = 'Valvulas')
BEGIN
    ALTER TABLE Modelo ADD Valvulas INT NULL;
    PRINT '  ✓ Columna Valvulas agregada';
END

-- CC (Cilindrada ya existe como CC en la tabla original)
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Modelo') AND name = 'CC')
BEGIN
    ALTER TABLE Modelo ADD CC INT NULL;
    PRINT '  ✓ Columna CC (Cilindrada) agregada';
END

-- HP (ya existe en tabla original)
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Modelo') AND name = 'HP')
BEGIN
    ALTER TABLE Modelo ADD HP INT NULL;
    PRINT '  ✓ Columna HP agregada';
END

-- TipoCajaAut
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Modelo') AND name = 'TipoCajaAut')
BEGIN
    ALTER TABLE Modelo ADD TipoCajaAut NVARCHAR(100) NULL;
    PRINT '  ✓ Columna TipoCajaAut agregada';
END

-- Puertas (ya existe en tabla original)
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Modelo') AND name = 'Puertas')
BEGIN
    ALTER TABLE Modelo ADD Puertas INT NULL;
    PRINT '  ✓ Columna Puertas agregada';
END

-- Asientos
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Modelo') AND name = 'Asientos')
BEGIN
    ALTER TABLE Modelo ADD Asientos INT NULL;
    PRINT '  ✓ Columna Asientos agregada';
END

-- TipoMotor
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Modelo') AND name = 'TipoMotor')
BEGIN
    ALTER TABLE Modelo ADD TipoMotor NVARCHAR(100) NULL;
    PRINT '  ✓ Columna TipoMotor agregada';
END

-- TipoVehiculoElectrico
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Modelo') AND name = 'TipoVehiculoElectrico')
BEGIN
    ALTER TABLE Modelo ADD TipoVehiculoElectrico NVARCHAR(100) NULL;
    PRINT '  ✓ Columna TipoVehiculoElectrico agregada';
END

-- Importador (ya existe en tabla original)
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Modelo') AND name = 'Importador')
BEGIN
    ALTER TABLE Modelo ADD Importador NVARCHAR(100) NULL;
    PRINT '  ✓ Columna Importador agregada';
END

-- PrecioInicial
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Modelo') AND name = 'PrecioInicial')
BEGIN
    ALTER TABLE Modelo ADD PrecioInicial DECIMAL(18,2) NULL;
    PRINT '  ✓ Columna PrecioInicial agregada';
END

-- CategoriaVehiculo
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Modelo') AND name = 'CategoriaVehiculo')
BEGIN
    ALTER TABLE Modelo ADD CategoriaVehiculo NVARCHAR(100) NULL;
    PRINT '  ✓ Columna CategoriaVehiculo agregada';
END

PRINT '';
GO

-- =============================================
-- PASO 5: Actualizar constraints
-- =============================================

PRINT 'PASO 5: Actualizando constraints...';
PRINT '';

-- Eliminar constraints antiguos
IF EXISTS (SELECT * FROM sys.check_constraints WHERE name = 'CK_Modelo_Año')
    ALTER TABLE Modelo DROP CONSTRAINT CK_Modelo_Año;

IF EXISTS (SELECT * FROM sys.check_constraints WHERE name = 'CK_Modelo_CC')
    ALTER TABLE Modelo DROP CONSTRAINT CK_Modelo_CC;

IF EXISTS (SELECT * FROM sys.check_constraints WHERE name = 'CK_Modelo_HP')
    ALTER TABLE Modelo DROP CONSTRAINT CK_Modelo_HP;

IF EXISTS (SELECT * FROM sys.check_constraints WHERE name = 'CK_Modelo_Puertas')
    ALTER TABLE Modelo DROP CONSTRAINT CK_Modelo_Puertas;

IF EXISTS (SELECT * FROM sys.check_constraints WHERE name = 'CK_Modelo_Pasajeros')
    ALTER TABLE Modelo DROP CONSTRAINT CK_Modelo_Pasajeros;

-- Agregar nuevos constraints
ALTER TABLE Modelo ADD CONSTRAINT CK_Modelo_CC_Nuevo CHECK (CC IS NULL OR (CC > 0 AND CC <= 10000));
ALTER TABLE Modelo ADD CONSTRAINT CK_Modelo_HP_Nuevo CHECK (HP IS NULL OR (HP > 0 AND HP <= 2000));
ALTER TABLE Modelo ADD CONSTRAINT CK_Modelo_Puertas_Nuevo CHECK (Puertas IS NULL OR Puertas BETWEEN 2 AND 6);
ALTER TABLE Modelo ADD CONSTRAINT CK_Modelo_Asientos_Nuevo CHECK (Asientos IS NULL OR Asientos BETWEEN 1 AND 12);
ALTER TABLE Modelo ADD CONSTRAINT CK_Modelo_Cilindros CHECK (Cilindros IS NULL OR Cilindros BETWEEN 1 AND 16);
ALTER TABLE Modelo ADD CONSTRAINT CK_Modelo_Valvulas CHECK (Valvulas IS NULL OR Valvulas BETWEEN 2 AND 48);

PRINT '  ✓ Constraints actualizados';
PRINT '';
GO

-- =============================================
-- PASO 6: Resumen de estructura final
-- =============================================

PRINT '';
PRINT '====================================';
PRINT 'RESUMEN DE ESTRUCTURA FINAL';
PRINT '====================================';
PRINT '';
PRINT 'CAMPOS OBLIGATORIOS (5):';
PRINT '  1. MarcaID (FK a Marca)';
PRINT '  2. Familia';
PRINT '  3. Modelo';
PRINT '  4. Combustible';
PRINT '  5. CategoriaVehiculo';
PRINT '';
PRINT 'DATOS MÍNIMOS (14):';
PRINT '  6. SegmentacionAutodata (Segmento)';
PRINT '  7. Carroceria';
PRINT '  8. OrigenCodigo (Origen)';
PRINT '  9. Cilindros';
PRINT ' 10. Valvulas';
PRINT ' 11. CC (Cilindrada)';
PRINT ' 12. HP';
PRINT ' 13. TipoCajaAut (Tipo de caja Aut)';
PRINT ' 14. Puertas';
PRINT ' 15. Asientos';
PRINT ' 16. TipoMotor';
PRINT ' 17. TipoVehiculoElectrico';
PRINT ' 18. Importador';
PRINT ' 19. PrecioInicial';
PRINT '';
PRINT 'CAMPOS DE CONTROL Y AUDITORÍA:';
PRINT '  - Estado, EtapaFlujo, ResponsableActualID';
PRINT '  - CreadoPorID, FechaCreacion, ModificadoPorID, FechaModificacion';
PRINT '  - Activo';
PRINT '';

-- Mostrar columnas actuales de la tabla
SELECT 
    COLUMN_NAME as 'Columna',
    DATA_TYPE as 'Tipo',
    CHARACTER_MAXIMUM_LENGTH as 'Longitud',
    IS_NULLABLE as 'Nullable'
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'Modelo'
ORDER BY ORDINAL_POSITION;

PRINT '';
PRINT '✓ Reestructuración completada exitosamente';
PRINT '';
GO
