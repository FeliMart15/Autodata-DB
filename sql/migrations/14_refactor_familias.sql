-- =============================================
-- Script: Refactorizar concepto de Familias
-- Descripción: Crea tabla Familia como entidad separada y migra datos
-- Fecha: 1 de Febrero, 2026
-- =============================================
-- 
-- CONCEPTO CORRECTO DE FAMILIAS:
-- Marca -> Familia -> Modelos
-- Ejemplo:
--   Audi -> Q3 -> Audi Q3 Confortline 1.8, Audi Q3 Full 1.8, Audi Q3 1.8 Turbo
--   Audi -> A1 -> Audi A1 1.4 TFSI, Audi A1 Sportback 1.4
--   Audi -> TT -> Audi TT Coupe 2.0, Audi TT Roadster 2.0
-- 
-- =============================================

USE Autodata;
GO

PRINT '==============================================';
PRINT 'REFACTOR: SISTEMA DE FAMILIAS';
PRINT '==============================================';
PRINT '';

-- =============================================
-- Paso 1: Crear tabla Familia
-- =============================================

IF OBJECT_ID('Familia', 'U') IS NOT NULL
BEGIN
    PRINT 'Eliminando tabla Familia existente...';
    
    -- Primero eliminar FK en Modelo si existe
    IF EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_Modelo_Familia')
    BEGIN
        ALTER TABLE Modelo DROP CONSTRAINT FK_Modelo_Familia;
    END
    
    DROP TABLE Familia;
END
GO

CREATE TABLE Familia (
    FamiliaID INT IDENTITY(1,1) PRIMARY KEY,
    MarcaID INT NOT NULL,
    Nombre NVARCHAR(100) NOT NULL,                 -- Ej: Q3, A1, Corolla, Yaris
    Descripcion NVARCHAR(500) NULL,                 -- Descripción opcional
    Activo BIT NOT NULL DEFAULT 1,
    
    -- Auditoría
    FechaCreacion DATETIME2 NOT NULL DEFAULT GETDATE(),
    FechaModificacion DATETIME2 NULL,
    
    -- Foreign Keys
    CONSTRAINT FK_Familia_Marca FOREIGN KEY (MarcaID) 
        REFERENCES Marca(MarcaID) ON DELETE CASCADE,
    
    -- Constraints
    CONSTRAINT UQ_Familia_Marca_Nombre UNIQUE (MarcaID, Nombre),
    
    -- Índices para performance
    INDEX IX_Familia_MarcaID (MarcaID),
    INDEX IX_Familia_Nombre (Nombre),
    INDEX IX_Familia_Activo (Activo)
);
GO

PRINT 'Tabla Familia creada';
PRINT '';

-- =============================================
-- Paso 2: Modificar tabla Modelo
-- =============================================

PRINT 'Modificando tabla Modelo...';

-- Agregar nueva columna FamiliaID (nullable temporalmente)
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Modelo') AND name = 'FamiliaID')
BEGIN
    ALTER TABLE Modelo ADD FamiliaID INT NULL;
    PRINT '  - Columna FamiliaID agregada';
END
ELSE
BEGIN
    PRINT '  - Columna FamiliaID ya existe';
END

-- La columna Familia ya existe, se usará para migrar datos
PRINT '';

-- =============================================
-- Paso 3: Migrar datos - Extraer familias únicas
-- =============================================

PRINT 'Migrando datos existentes...';
PRINT '  1. Extrayendo familias únicas por marca...';

-- Insertar familias únicas desde los modelos existentes
INSERT INTO Familia (MarcaID, Nombre, FechaCreacion)
SELECT DISTINCT 
    m.MarcaID,
    LTRIM(RTRIM(m.Familia)) as Nombre,
    GETDATE()
FROM Modelo m
WHERE m.Familia IS NOT NULL 
  AND LTRIM(RTRIM(m.Familia)) <> ''
  AND NOT EXISTS (
      SELECT 1 FROM Familia f 
      WHERE f.MarcaID = m.MarcaID 
        AND f.Nombre = LTRIM(RTRIM(m.Familia))
  )
ORDER BY m.MarcaID, Nombre;

DECLARE @familiasCreadas INT = @@ROWCOUNT;
PRINT '  - ' + CAST(@familiasCreadas AS NVARCHAR) + ' familias creadas';
PRINT '';

-- =============================================
-- Paso 4: Actualizar FamiliaID en Modelo
-- =============================================

PRINT '  2. Vinculando modelos con sus familias...';

UPDATE m
SET m.FamiliaID = f.FamiliaID
FROM Modelo m
INNER JOIN Familia f ON f.MarcaID = m.MarcaID 
    AND f.Nombre = LTRIM(RTRIM(m.Familia))
WHERE m.Familia IS NOT NULL;

DECLARE @modelosActualizados INT = @@ROWCOUNT;
PRINT '  - ' + CAST(@modelosActualizados AS NVARCHAR) + ' modelos vinculados a familias';
PRINT '';

-- =============================================
-- Paso 5: Agregar FK y hacer FamiliaID obligatorio
-- =============================================

PRINT '  3. Aplicando constraints...';

-- Agregar Foreign Key
IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_Modelo_Familia')
BEGIN
    ALTER TABLE Modelo ADD CONSTRAINT FK_Modelo_Familia 
        FOREIGN KEY (FamiliaID) REFERENCES Familia(FamiliaID);
    PRINT '  - Foreign Key FK_Modelo_Familia creada';
END

-- Nota: FamiliaID se queda nullable porque puede haber modelos sin familia asignada
-- En producción, se debería hacer NOT NULL después de limpiar datos

PRINT '';

-- =============================================
-- Paso 6: Crear índice en Modelo.FamiliaID
-- =============================================

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Modelo_FamiliaID')
BEGIN
    CREATE INDEX IX_Modelo_FamiliaID ON Modelo(FamiliaID);
    PRINT 'Índice IX_Modelo_FamiliaID creado';
END

PRINT '';

-- =============================================
-- Paso 7: Actualizar vistas existentes
-- =============================================

PRINT 'Actualizando vistas...';

-- Actualizar vw_ModeloDetalle
IF OBJECT_ID('vw_ModeloDetalle', 'V') IS NOT NULL
    DROP VIEW vw_ModeloDetalle;
GO

CREATE VIEW vw_ModeloDetalle AS
SELECT 
    m.ModeloID,
    m.CodigoAutodata,
    m.CodigoModelo,
    m.DescripcionModelo,
    m.MarcaID,
    ma.Descripcion as Marca,
    m.FamiliaID,
    f.Nombre as FamiliaNombre,
    m.Familia as FamiliaTexto,
    m.Anio,
    m.Tipo,
    m.CC as Cilindrada,
    m.HP as Potencia,
    m.CombustibleCodigo as Combustible,
    m.Caja as Transmision,
    m.Traccion,
    m.Tipo2 as TipoCarroceria,
    m.Puertas,
    m.Pasajeros as Plazas,
    m.observaciones as Observaciones,
    m.Estado as EstadoFlujo,
    m.Activo,
    m.FechaCreacion,
    m.FechaModificacion,
    m.ModificadoPorID
FROM Modelo m
LEFT JOIN Marca ma ON m.MarcaID = ma.MarcaID
LEFT JOIN Familia f ON m.FamiliaID = f.FamiliaID;
GO

PRINT '  - Vista vw_ModeloDetalle actualizada';

-- Actualizar vw_ResumenVentasPorFamilia
IF OBJECT_ID('vw_ResumenVentasPorFamilia', 'V') IS NOT NULL
    DROP VIEW vw_ResumenVentasPorFamilia;
GO

CREATE VIEW vw_ResumenVentasPorFamilia AS
SELECT 
    ma.MarcaID,
    ma.Marca,
    f.FamiliaID,
    f.Nombre as Familia,
    v.Año,
    v.Mes,
    v.Periodo,
    SUM(v.Cantidad) as TotalVentas,
    COUNT(DISTINCT v.ModeloID) as CantidadModelos
FROM Venta v
INNER JOIN Modelo m ON v.ModeloID = m.ModeloID
INNER JOIN Marca ma ON m.MarcaID = ma.MarcaID
LEFT JOIN Familia f ON m.FamiliaID = f.FamiliaID
GROUP BY ma.MarcaID, ma.Marca, f.FamiliaID, f.Nombre, v.Año, v.Mes, v.Periodo;
GO

PRINT '  - Vista vw_ResumenVentasPorFamilia actualizada';

-- Actualizar vw_ResumenEmpadronamientosPorDepartamento
IF OBJECT_ID('vw_ResumenEmpadronamientosPorDepartamento', 'V') IS NOT NULL
    DROP VIEW vw_ResumenEmpadronamientosPorDepartamento;
GO

CREATE VIEW vw_ResumenEmpadronamientosPorDepartamento AS
SELECT 
    d.DepartamentoID,
    d.Nombre as Departamento,
    d.Codigo as CodigoDepartamento,
    ma.MarcaID,
    ma.Marca,
    f.FamiliaID,
    f.Nombre as Familia,
    e.Año,
    e.Mes,
    e.Periodo,
    SUM(e.Cantidad) as TotalEmpadronamientos,
    COUNT(DISTINCT e.ModeloID) as CantidadModelos
FROM Empadronamiento e
INNER JOIN Modelo m ON e.ModeloID = m.ModeloID
INNER JOIN Marca ma ON m.MarcaID = ma.MarcaID
LEFT JOIN Familia f ON m.FamiliaID = f.FamiliaID
INNER JOIN Departamento d ON e.DepartamentoID = d.DepartamentoID
GROUP BY d.DepartamentoID, d.Nombre, d.Codigo, ma.MarcaID, ma.Marca, f.FamiliaID, f.Nombre, e.Año, e.Mes, e.Periodo;
GO

PRINT '  - Vista vw_ResumenEmpadronamientosPorDepartamento actualizada';
PRINT '';

-- =============================================
-- Paso 8: Estadísticas finales
-- =============================================

PRINT '==============================================';
PRINT 'ESTADISTICAS FINALES';
PRINT '==============================================';

DECLARE @totalFamilias INT, @totalModelos INT, @modelosSinFamilia INT;

SELECT @totalFamilias = COUNT(*) FROM Familia WHERE Activo = 1;
SELECT @totalModelos = COUNT(*) FROM Modelo WHERE Activo = 1;
SELECT @modelosSinFamilia = COUNT(*) FROM Modelo WHERE FamiliaID IS NULL AND Activo = 1;

PRINT 'Total de familias: ' + CAST(@totalFamilias AS NVARCHAR);
PRINT 'Total de modelos activos: ' + CAST(@totalModelos AS NVARCHAR);
PRINT 'Modelos sin familia asignada: ' + CAST(@modelosSinFamilia AS NVARCHAR);
PRINT '';

-- Mostrar familias por marca
PRINT 'Familias por marca:';
SELECT 
    ma.MarcaID,
    ma.Descripcion as Marca,
    COUNT(f.FamiliaID) as CantidadFamilias,
    STRING_AGG(f.Nombre, ', ') as Familias
FROM Marca ma
LEFT JOIN Familia f ON ma.MarcaID = f.MarcaID AND f.Activo = 1
GROUP BY ma.MarcaID, ma.Descripcion
ORDER BY ma.Descripcion;

PRINT '';
PRINT '==============================================';
PRINT 'REFACTOR DE FAMILIAS COMPLETADO';
PRINT '==============================================';
PRINT '';
PRINT 'SIGUIENTE PASO:';
PRINT '  - Actualizar controladores backend para usar FamiliaID';
PRINT '  - Agregar endpoints para gestión de familias (GET /api/familias, etc)';
PRINT '  - Actualizar frontend para selector de familias por marca';
PRINT '  - Revisar modelos sin familia y asignarles una';
PRINT '';
