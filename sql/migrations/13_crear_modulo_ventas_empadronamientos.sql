-- =============================================
-- Script: Módulo de Ventas y Empadronamientos
-- Descripción: Crea tablas, vistas y procedimientos para gestión de ventas
-- Fecha: 1 de Febrero, 2026
-- =============================================

USE Autodata;
GO

PRINT '==============================================';
PRINT 'MÓDULO DE VENTAS Y EMPADRONAMIENTOS';
PRINT '==============================================';
PRINT '';

-- =============================================
-- Tabla: Departamento
-- Descripción: Catálogo de departamentos de Uruguay
-- =============================================

IF OBJECT_ID('Departamento', 'U') IS NOT NULL
BEGIN
    PRINT 'Eliminando tabla Departamento existente...';
    DROP TABLE Departamento;
END
GO

CREATE TABLE Departamento (
    DepartamentoID INT IDENTITY(1,1) PRIMARY KEY,
    Codigo NVARCHAR(10) NOT NULL UNIQUE,
    Nombre NVARCHAR(100) NOT NULL UNIQUE,
    Pais NVARCHAR(100) NOT NULL DEFAULT 'Uruguay',
    Activo BIT NOT NULL DEFAULT 1,
    FechaCreacion DATETIME2 NOT NULL DEFAULT GETDATE(),
    
    INDEX IX_Departamento_Codigo (Codigo),
    INDEX IX_Departamento_Nombre (Nombre),
    INDEX IX_Departamento_Activo (Activo)
);
GO

PRINT '✅ Tabla Departamento creada';
PRINT '';

-- =============================================
-- Tabla: Venta
-- Descripción: Registro de ventas mensuales por modelo
-- =============================================

IF OBJECT_ID('Venta', 'U') IS NOT NULL
BEGIN
    PRINT 'Eliminando tabla Venta existente...';
    DROP TABLE Venta;
END
GO

CREATE TABLE Venta (
    VentaID INT IDENTITY(1,1) PRIMARY KEY,
    ModeloID INT NOT NULL,
    Cantidad INT NOT NULL DEFAULT 0,
    Periodo NVARCHAR(7) NOT NULL,              -- Formato: YYYY-MM (2026-01)
    Año INT NOT NULL,                          -- 2026
    Mes INT NOT NULL CHECK (Mes BETWEEN 1 AND 12), -- 1-12
    
    -- Auditoría
    CreadoPorID INT NOT NULL,
    FechaCreacion DATETIME2 NOT NULL DEFAULT GETDATE(),
    ModificadoPorID INT NULL,
    FechaModificacion DATETIME2 NULL,
    
    -- Foreign Keys
    CONSTRAINT FK_Venta_Modelo FOREIGN KEY (ModeloID) 
        REFERENCES Modelo(ModeloID) ON DELETE CASCADE,
    CONSTRAINT FK_Venta_CreadoPor FOREIGN KEY (CreadoPorID) 
        REFERENCES Usuario(UsuarioID),
    CONSTRAINT FK_Venta_ModificadoPor FOREIGN KEY (ModificadoPorID) 
        REFERENCES Usuario(UsuarioID),
    
    -- Constraints
    CONSTRAINT CK_Venta_Cantidad CHECK (Cantidad >= 0),
    CONSTRAINT UQ_Venta_Modelo_Periodo UNIQUE (ModeloID, Periodo),
    
    -- Índices para performance
    INDEX IX_Venta_ModeloID (ModeloID),
    INDEX IX_Venta_Periodo (Periodo DESC),
    INDEX IX_Venta_Año_Mes (Año DESC, Mes DESC),
    INDEX IX_Venta_FechaCreacion (FechaCreacion DESC),
    INDEX IX_Venta_Compuesto (ModeloID, Periodo, Cantidad)
);
GO

PRINT '✅ Tabla Venta creada';
PRINT '';

-- =============================================
-- Tabla: Empadronamiento
-- Descripción: Registro de empadronamientos mensuales por modelo y departamento
-- =============================================

IF OBJECT_ID('Empadronamiento', 'U') IS NOT NULL
BEGIN
    PRINT 'Eliminando tabla Empadronamiento existente...';
    DROP TABLE Empadronamiento;
END
GO

CREATE TABLE Empadronamiento (
    EmpadronamientoID INT IDENTITY(1,1) PRIMARY KEY,
    ModeloID INT NOT NULL,
    DepartamentoID INT NOT NULL,
    Cantidad INT NOT NULL DEFAULT 0,
    Periodo NVARCHAR(7) NOT NULL,              -- Formato: YYYY-MM (2026-01)
    Año INT NOT NULL,                          -- 2026
    Mes INT NOT NULL CHECK (Mes BETWEEN 1 AND 12), -- 1-12
    
    -- Auditoría
    CreadoPorID INT NOT NULL,
    FechaCreacion DATETIME2 NOT NULL DEFAULT GETDATE(),
    ModificadoPorID INT NULL,
    FechaModificacion DATETIME2 NULL,
    
    -- Foreign Keys
    CONSTRAINT FK_Empadronamiento_Modelo FOREIGN KEY (ModeloID) 
        REFERENCES Modelo(ModeloID) ON DELETE CASCADE,
    CONSTRAINT FK_Empadronamiento_Departamento FOREIGN KEY (DepartamentoID) 
        REFERENCES Departamento(DepartamentoID),
    CONSTRAINT FK_Empadronamiento_CreadoPor FOREIGN KEY (CreadoPorID) 
        REFERENCES Usuario(UsuarioID),
    CONSTRAINT FK_Empadronamiento_ModificadoPor FOREIGN KEY (ModificadoPorID) 
        REFERENCES Usuario(UsuarioID),
    
    -- Constraints
    CONSTRAINT CK_Empadronamiento_Cantidad CHECK (Cantidad >= 0),
    CONSTRAINT UQ_Empadronamiento_Modelo_Periodo_Depto 
        UNIQUE (ModeloID, DepartamentoID, Periodo),
    
    -- Índices para performance
    INDEX IX_Empadronamiento_ModeloID (ModeloID),
    INDEX IX_Empadronamiento_DepartamentoID (DepartamentoID),
    INDEX IX_Empadronamiento_Periodo (Periodo DESC),
    INDEX IX_Empadronamiento_Año_Mes (Año DESC, Mes DESC),
    INDEX IX_Empadronamiento_FechaCreacion (FechaCreacion DESC),
    INDEX IX_Empadronamiento_Compuesto (ModeloID, DepartamentoID, Periodo, Cantidad)
);
GO

PRINT '✅ Tabla Empadronamiento creada';
PRINT '';

-- =============================================
-- SEED: Departamentos de Uruguay
-- =============================================

PRINT 'Insertando departamentos de Uruguay...';

INSERT INTO Departamento (Codigo, Nombre, Pais) VALUES
('URU-01', 'Montevideo', 'Uruguay'),
('URU-02', 'Canelones', 'Uruguay'),
('URU-03', 'Maldonado', 'Uruguay'),
('URU-04', 'Rocha', 'Uruguay'),
('URU-05', 'Colonia', 'Uruguay'),
('URU-06', 'San José', 'Uruguay'),
('URU-07', 'Flores', 'Uruguay'),
('URU-08', 'Florida', 'Uruguay'),
('URU-09', 'Lavalleja', 'Uruguay'),
('URU-10', 'Treinta y Tres', 'Uruguay'),
('URU-11', 'Cerro Largo', 'Uruguay'),
('URU-12', 'Rivera', 'Uruguay'),
('URU-13', 'Artigas', 'Uruguay'),
('URU-14', 'Salto', 'Uruguay'),
('URU-15', 'Paysandú', 'Uruguay'),
('URU-16', 'Río Negro', 'Uruguay'),
('URU-17', 'Soriano', 'Uruguay'),
('URU-18', 'Durazno', 'Uruguay'),
('URU-19', 'Tacuarembó', 'Uruguay');

PRINT '✅ ' + CAST(@@ROWCOUNT AS NVARCHAR(10)) + ' departamentos insertados';
PRINT '';

-- =============================================
-- Vista: vw_VentasPorModelo
-- =============================================

IF OBJECT_ID('vw_VentasPorModelo', 'V') IS NOT NULL
    DROP VIEW vw_VentasPorModelo;
GO

CREATE VIEW vw_VentasPorModelo AS
SELECT 
    v.VentaID,
    v.ModeloID,
    m.DescripcionModelo,
    m.Familia,
    m.MarcaID,
    ma.Marca,
    v.Cantidad,
    v.Periodo,
    v.Año,
    v.Mes,
    v.FechaCreacion,
    v.FechaModificacion,
    u.UsuarioID AS CreadoPorID,
    u.Username AS CargadoPor,
    u.Nombre AS CargadoPorNombre,
    um.Username AS ModificadoPor
FROM Venta v
INNER JOIN Modelo m ON v.ModeloID = m.ModeloID
INNER JOIN Marca ma ON m.MarcaID = ma.MarcaID
INNER JOIN Usuario u ON v.CreadoPorID = u.UsuarioID
LEFT JOIN Usuario um ON v.ModificadoPorID = um.UsuarioID
WHERE m.Activo = 1;
GO

PRINT '✅ Vista vw_VentasPorModelo creada';

-- =============================================
-- Vista: vw_EmpadronamientosPorModelo
-- =============================================

IF OBJECT_ID('vw_EmpadronamientosPorModelo', 'V') IS NOT NULL
    DROP VIEW vw_EmpadronamientosPorModelo;
GO

CREATE VIEW vw_EmpadronamientosPorModelo AS
SELECT 
    e.EmpadronamientoID,
    e.ModeloID,
    m.DescripcionModelo,
    m.Familia,
    m.MarcaID,
    ma.Marca,
    e.DepartamentoID,
    d.Nombre AS Departamento,
    d.Codigo AS CodigoDepartamento,
    e.Cantidad,
    e.Periodo,
    e.Año,
    e.Mes,
    e.FechaCreacion,
    e.FechaModificacion,
    u.UsuarioID AS CreadoPorID,
    u.Username AS CargadoPor,
    u.Nombre AS CargadoPorNombre,
    um.Username AS ModificadoPor
FROM Empadronamiento e
INNER JOIN Modelo m ON e.ModeloID = m.ModeloID
INNER JOIN Marca ma ON m.MarcaID = ma.MarcaID
INNER JOIN Departamento d ON e.DepartamentoID = d.DepartamentoID
INNER JOIN Usuario u ON e.CreadoPorID = u.UsuarioID
LEFT JOIN Usuario um ON e.ModificadoPorID = um.UsuarioID
WHERE m.Activo = 1 AND d.Activo = 1;
GO

PRINT '✅ Vista vw_EmpadronamientosPorModelo creada';

-- =============================================
-- Vista: vw_ResumenVentasPorFamilia
-- =============================================

IF OBJECT_ID('vw_ResumenVentasPorFamilia', 'V') IS NOT NULL
    DROP VIEW vw_ResumenVentasPorFamilia;
GO

CREATE VIEW vw_ResumenVentasPorFamilia AS
SELECT 
    ma.MarcaID,
    ma.Marca,
    m.Familia,
    v.Año,
    v.Mes,
    v.Periodo,
    COUNT(DISTINCT m.ModeloID) AS CantidadModelos,
    SUM(v.Cantidad) AS TotalVentas
FROM Venta v
INNER JOIN Modelo m ON v.ModeloID = m.ModeloID
INNER JOIN Marca ma ON m.MarcaID = ma.MarcaID
WHERE m.Activo = 1
GROUP BY ma.MarcaID, ma.Marca, m.Familia, v.Año, v.Mes, v.Periodo;
GO

PRINT '✅ Vista vw_ResumenVentasPorFamilia creada';

-- =============================================
-- Vista: vw_ResumenEmpadronamientosPorDepartamento
-- =============================================

IF OBJECT_ID('vw_ResumenEmpadronamientosPorDepartamento', 'V') IS NOT NULL
    DROP VIEW vw_ResumenEmpadronamientosPorDepartamento;
GO

CREATE VIEW vw_ResumenEmpadronamientosPorDepartamento AS
SELECT 
    d.DepartamentoID,
    d.Nombre AS Departamento,
    d.Codigo AS CodigoDepartamento,
    ma.MarcaID,
    ma.Marca,
    m.Familia,
    e.Año,
    e.Mes,
    e.Periodo,
    COUNT(DISTINCT m.ModeloID) AS CantidadModelos,
    SUM(e.Cantidad) AS TotalEmpadronamientos
FROM Empadronamiento e
INNER JOIN Modelo m ON e.ModeloID = m.ModeloID
INNER JOIN Marca ma ON m.MarcaID = ma.MarcaID
INNER JOIN Departamento d ON e.DepartamentoID = d.DepartamentoID
WHERE m.Activo = 1 AND d.Activo = 1
GROUP BY d.DepartamentoID, d.Nombre, d.Codigo, ma.MarcaID, ma.Marca, m.Familia, e.Año, e.Mes, e.Periodo;
GO

PRINT '✅ Vista vw_ResumenEmpadronamientosPorDepartamento creada';
PRINT '';

-- =============================================
-- Stored Procedure: sp_CrearVentasBatch
-- =============================================

IF OBJECT_ID('sp_CrearVentasBatch', 'P') IS NOT NULL
    DROP PROCEDURE sp_CrearVentasBatch;
GO

CREATE PROCEDURE sp_CrearVentasBatch
    @Periodo NVARCHAR(7),
    @Año INT,
    @Mes INT,
    @UsuarioID INT,
    @Ventas NVARCHAR(MAX) -- JSON: [{"modeloId": 1, "cantidad": 10}]
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        BEGIN TRANSACTION;
        
        -- Parsear JSON
        DECLARE @VentasTable TABLE (
            ModeloID INT,
            Cantidad INT
        );
        
        INSERT INTO @VentasTable (ModeloID, Cantidad)
        SELECT 
            JSON_VALUE(value, '$.modeloId'),
            JSON_VALUE(value, '$.cantidad')
        FROM OPENJSON(@Ventas);
        
        -- Insertar o actualizar ventas
        MERGE Venta AS target
        USING @VentasTable AS source
        ON target.ModeloID = source.ModeloID AND target.Periodo = @Periodo
        WHEN MATCHED THEN
            UPDATE SET 
                Cantidad = source.Cantidad,
                ModificadoPorID = @UsuarioID,
                FechaModificacion = GETDATE()
        WHEN NOT MATCHED THEN
            INSERT (ModeloID, Cantidad, Periodo, Año, Mes, CreadoPorID)
            VALUES (source.ModeloID, source.Cantidad, @Periodo, @Año, @Mes, @UsuarioID);
        
        COMMIT TRANSACTION;
        
        SELECT 
            'success' AS status,
            @@ROWCOUNT AS affectedRows,
            'Ventas guardadas exitosamente' AS message;
            
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;
            
        SELECT 
            'error' AS status,
            ERROR_MESSAGE() AS message;
    END CATCH
END
GO

PRINT '✅ Stored Procedure sp_CrearVentasBatch creado';

-- =============================================
-- Stored Procedure: sp_CrearEmpadronamientosBatch
-- =============================================

IF OBJECT_ID('sp_CrearEmpadronamientosBatch', 'P') IS NOT NULL
    DROP PROCEDURE sp_CrearEmpadronamientosBatch;
GO

CREATE PROCEDURE sp_CrearEmpadronamientosBatch
    @Periodo NVARCHAR(7),
    @Año INT,
    @Mes INT,
    @DepartamentoID INT,
    @UsuarioID INT,
    @Empadronamientos NVARCHAR(MAX) -- JSON: [{"modeloId": 1, "cantidad": 10}]
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        BEGIN TRANSACTION;
        
        -- Parsear JSON
        DECLARE @EmpadronamientosTable TABLE (
            ModeloID INT,
            Cantidad INT
        );
        
        INSERT INTO @EmpadronamientosTable (ModeloID, Cantidad)
        SELECT 
            JSON_VALUE(value, '$.modeloId'),
            JSON_VALUE(value, '$.cantidad')
        FROM OPENJSON(@Empadronamientos);
        
        -- Insertar o actualizar empadronamientos
        MERGE Empadronamiento AS target
        USING @EmpadronamientosTable AS source
        ON target.ModeloID = source.ModeloID 
           AND target.DepartamentoID = @DepartamentoID 
           AND target.Periodo = @Periodo
        WHEN MATCHED THEN
            UPDATE SET 
                Cantidad = source.Cantidad,
                ModificadoPorID = @UsuarioID,
                FechaModificacion = GETDATE()
        WHEN NOT MATCHED THEN
            INSERT (ModeloID, DepartamentoID, Cantidad, Periodo, Año, Mes, CreadoPorID)
            VALUES (source.ModeloID, @DepartamentoID, source.Cantidad, @Periodo, @Año, @Mes, @UsuarioID);
        
        COMMIT TRANSACTION;
        
        SELECT 
            'success' AS status,
            @@ROWCOUNT AS affectedRows,
            'Empadronamientos guardados exitosamente' AS message;
            
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;
            
        SELECT 
            'error' AS status,
            ERROR_MESSAGE() AS message;
    END CATCH
END
GO

PRINT '✅ Stored Procedure sp_CrearEmpadronamientosBatch creado';
PRINT '';

-- =============================================
-- RESUMEN
-- =============================================

PRINT '==============================================';
PRINT 'RESUMEN DE CREACIÓN';
PRINT '==============================================';
PRINT '';
PRINT 'Tablas creadas:';
PRINT '  ✓ Departamento (19 registros)';
PRINT '  ✓ Venta';
PRINT '  ✓ Empadronamiento';
PRINT '';
PRINT 'Vistas creadas:';
PRINT '  ✓ vw_VentasPorModelo';
PRINT '  ✓ vw_EmpadronamientosPorModelo';
PRINT '  ✓ vw_ResumenVentasPorFamilia';
PRINT '  ✓ vw_ResumenEmpadronamientosPorDepartamento';
PRINT '';
PRINT 'Stored Procedures creados:';
PRINT '  ✓ sp_CrearVentasBatch';
PRINT '  ✓ sp_CrearEmpadronamientosBatch';
PRINT '';
PRINT '==============================================';
PRINT '✅ MÓDULO DE VENTAS Y EMPADRONAMIENTOS CREADO';
PRINT '==============================================';
GO
