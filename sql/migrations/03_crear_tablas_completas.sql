-- =============================================
-- Script: Creación de Tablas Completas - Sistema Autodata
-- Descripción: Crea todas las tablas necesarias para el sistema
-- Fecha: 10 de Diciembre, 2025
-- =============================================

USE Autodata;
GO

-- =============================================
-- TABLA: Usuario
-- Descripción: Gestión de usuarios del sistema
-- =============================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Usuario')
BEGIN
    CREATE TABLE Usuario (
        UsuarioID INT IDENTITY(1,1) PRIMARY KEY,
        Username NVARCHAR(50) NOT NULL UNIQUE,
        Password NVARCHAR(255) NOT NULL, -- Hash bcrypt
        Nombre NVARCHAR(100) NOT NULL,
        Email NVARCHAR(100) NOT NULL UNIQUE,
        Rol NVARCHAR(20) NOT NULL CHECK (Rol IN ('entrada_datos', 'revision', 'aprobacion', 'admin')),
        Activo BIT NOT NULL DEFAULT 1,
        FechaCreacion DATETIME2 NOT NULL DEFAULT GETDATE(),
        FechaModificacion DATETIME2 NOT NULL DEFAULT GETDATE(),
        CONSTRAINT CK_Usuario_Email CHECK (Email LIKE '%@%')
    );
    
    PRINT 'Tabla Usuario creada exitosamente';
END
ELSE
    PRINT 'Tabla Usuario ya existe';
GO

-- =============================================
-- TABLA: Marca
-- Descripción: Catálogo de marcas automotrices
-- =============================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Marca')
BEGIN
    CREATE TABLE Marca (
        MarcaID INT IDENTITY(1,1) PRIMARY KEY,
        Marca NVARCHAR(100) NOT NULL UNIQUE,
        PaisOrigen NVARCHAR(100),
        LogoURL NVARCHAR(500),
        Activo BIT NOT NULL DEFAULT 1,
        FechaCreacion DATETIME2 NOT NULL DEFAULT GETDATE(),
        FechaModificacion DATETIME2 NOT NULL DEFAULT GETDATE()
    );
    
    CREATE NONCLUSTERED INDEX IX_Marca_Activo ON Marca(Activo);
    
    PRINT 'Tabla Marca creada exitosamente';
END
ELSE
    PRINT 'Tabla Marca ya existe';
GO

-- =============================================
-- TABLA: Modelo
-- Descripción: Modelos de vehículos con datos técnicos
-- =============================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Modelo')
BEGIN
    CREATE TABLE Modelo (
        ModeloID INT IDENTITY(1,1) PRIMARY KEY,
        MarcaID INT NOT NULL,
        Modelo NVARCHAR(200) NOT NULL,
        
        -- Datos Mínimos
        Familia NVARCHAR(100),
        Origen NVARCHAR(100),
        Combustible NVARCHAR(50),
        Año INT,
        Tipo NVARCHAR(50),
        Tipo2 NVARCHAR(50),
        TipoVehiculo NVARCHAR(50),
        Segmento NVARCHAR(50),
        Categoria NVARCHAR(50),
        Importador NVARCHAR(100),
        
        -- Especificaciones Técnicas
        CC INT,
        HP INT,
        Turbo BIT DEFAULT 0,
        Traccion NVARCHAR(50),
        Caja NVARCHAR(50),
        TipoCaja NVARCHAR(50),
        
        -- Capacidades
        Puertas INT,
        Pasajeros INT,
        
        -- Control de Flujo
        Estado NVARCHAR(50) NOT NULL DEFAULT 'importado' 
            CHECK (Estado IN ('importado', 'datos_minimos', 'equipamiento_cargado', 
                              'en_revision', 'para_corregir', 'en_aprobacion', 
                              'aprobado', 'definitivo')),
        EtapaFlujo INT NOT NULL DEFAULT 1 CHECK (EtapaFlujo BETWEEN 1 AND 4),
        ResponsableActualID INT,
        
        -- Auditoría
        CreadoPorID INT NOT NULL,
        FechaCreacion DATETIME2 NOT NULL DEFAULT GETDATE(),
        ModificadoPorID INT,
        FechaModificacion DATETIME2,
        Activo BIT NOT NULL DEFAULT 1,
        
        -- Foreign Keys
        CONSTRAINT FK_Modelo_Marca FOREIGN KEY (MarcaID) REFERENCES Marca(MarcaID),
        CONSTRAINT FK_Modelo_ResponsableActual FOREIGN KEY (ResponsableActualID) REFERENCES Usuario(UsuarioID),
        CONSTRAINT FK_Modelo_CreadoPor FOREIGN KEY (CreadoPorID) REFERENCES Usuario(UsuarioID),
        CONSTRAINT FK_Modelo_ModificadoPor FOREIGN KEY (ModificadoPorID) REFERENCES Usuario(UsuarioID),
        
        -- Constraints
        CONSTRAINT CK_Modelo_Año CHECK (Año >= 1900 AND Año <= YEAR(GETDATE()) + 2),
        CONSTRAINT CK_Modelo_CC CHECK (CC IS NULL OR CC > 0),
        CONSTRAINT CK_Modelo_HP CHECK (HP IS NULL OR HP > 0),
        CONSTRAINT CK_Modelo_Puertas CHECK (Puertas IS NULL OR Puertas BETWEEN 2 AND 6),
        CONSTRAINT CK_Modelo_Pasajeros CHECK (Pasajeros IS NULL OR Pasajeros BETWEEN 1 AND 12)
    );
    
    -- Índices para performance
    CREATE NONCLUSTERED INDEX IX_Modelo_MarcaID ON Modelo(MarcaID);
    CREATE NONCLUSTERED INDEX IX_Modelo_Estado ON Modelo(Estado);
    CREATE NONCLUSTERED INDEX IX_Modelo_Año ON Modelo(Año);
    CREATE NONCLUSTERED INDEX IX_Modelo_ResponsableActual ON Modelo(ResponsableActualID);
    CREATE NONCLUSTERED INDEX IX_Modelo_FechaCreacion ON Modelo(FechaCreacion DESC);
    
    PRINT 'Tabla Modelo creada exitosamente';
END
ELSE
    PRINT 'Tabla Modelo ya existe';
GO

-- =============================================
-- TABLA: ModeloEstado
-- Descripción: Tracking de cambios de estado
-- =============================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'ModeloEstado')
BEGIN
    CREATE TABLE ModeloEstado (
        ModeloEstadoID INT IDENTITY(1,1) PRIMARY KEY,
        ModeloID INT NOT NULL,
        EstadoAnterior NVARCHAR(50),
        EstadoNuevo NVARCHAR(50) NOT NULL,
        UsuarioID INT NOT NULL,
        Observaciones NVARCHAR(MAX),
        FechaCambio DATETIME2 NOT NULL DEFAULT GETDATE(),
        
        CONSTRAINT FK_ModeloEstado_Modelo FOREIGN KEY (ModeloID) REFERENCES Modelo(ModeloID),
        CONSTRAINT FK_ModeloEstado_Usuario FOREIGN KEY (UsuarioID) REFERENCES Usuario(UsuarioID)
    );
    
    CREATE NONCLUSTERED INDEX IX_ModeloEstado_ModeloID ON ModeloEstado(ModeloID);
    CREATE NONCLUSTERED INDEX IX_ModeloEstado_FechaCambio ON ModeloEstado(FechaCambio DESC);
    
    PRINT 'Tabla ModeloEstado creada exitosamente';
END
ELSE
    PRINT 'Tabla ModeloEstado ya existe';
GO

-- =============================================
-- TABLA: ModeloHistorial
-- Descripción: Auditoría completa de cambios
-- =============================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'ModeloHistorial')
BEGIN
    CREATE TABLE ModeloHistorial (
        HistorialID INT IDENTITY(1,1) PRIMARY KEY,
        ModeloID INT NOT NULL,
        UsuarioID INT NOT NULL,
        Campo NVARCHAR(100) NOT NULL,
        ValorAnterior NVARCHAR(MAX),
        ValorNuevo NVARCHAR(MAX),
        Accion NVARCHAR(20) NOT NULL CHECK (Accion IN ('crear', 'editar', 'eliminar')),
        Observaciones NVARCHAR(MAX),
        FechaModificacion DATETIME2 NOT NULL DEFAULT GETDATE(),
        
        CONSTRAINT FK_ModeloHistorial_Modelo FOREIGN KEY (ModeloID) REFERENCES Modelo(ModeloID),
        CONSTRAINT FK_ModeloHistorial_Usuario FOREIGN KEY (UsuarioID) REFERENCES Usuario(UsuarioID)
    );
    
    CREATE NONCLUSTERED INDEX IX_ModeloHistorial_ModeloID ON ModeloHistorial(ModeloID);
    CREATE NONCLUSTERED INDEX IX_ModeloHistorial_UsuarioID ON ModeloHistorial(UsuarioID);
    CREATE NONCLUSTERED INDEX IX_ModeloHistorial_FechaModificacion ON ModeloHistorial(FechaModificacion DESC);
    CREATE NONCLUSTERED INDEX IX_ModeloHistorial_Campo ON ModeloHistorial(Campo);
    
    PRINT 'Tabla ModeloHistorial creada exitosamente';
END
ELSE
    PRINT 'Tabla ModeloHistorial ya existe';
GO

-- =============================================
-- TABLA: EquipamientoModelo
-- Descripción: Equipamiento completo del vehículo
-- =============================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'EquipamientoModelo')
BEGIN
    CREATE TABLE EquipamientoModelo (
        EquipamientoID INT IDENTITY(1,1) PRIMARY KEY,
        ModeloID INT NOT NULL UNIQUE,
        
        -- SEGURIDAD (14 campos)
        ABS BIT DEFAULT 0,
        EBD BIT DEFAULT 0,
        ESP BIT DEFAULT 0,
        ControlTraccion BIT DEFAULT 0,
        AsistenteArranquePendiente BIT DEFAULT 0,
        AirbagFrontal BIT DEFAULT 0,
        AirbagLateral BIT DEFAULT 0,
        AirbagCortina BIT DEFAULT 0,
        AirbagRodilla BIT DEFAULT 0,
        AirbagsTotal INT,
        ISOFIX BIT DEFAULT 0,
        CamaraRetroceso BIT DEFAULT 0,
        SensoresEstacionamiento INT,
        ControlEstabilidad BIT DEFAULT 0,
        
        -- CONFORT (19 campos)
        AireAcondicionado BIT DEFAULT 0,
        AireAcondicionadoAutomatico BIT DEFAULT 0,
        ClimatizadorBizona BIT DEFAULT 0,
        ClimatizadorTrizona BIT DEFAULT 0,
        CalefaccionAsientos BIT DEFAULT 0,
        VentilacionAsientos BIT DEFAULT 0,
        AsientosElectricos BIT DEFAULT 0,
        AsientoConductorElectrico BIT DEFAULT 0,
        MemoriaAsientos BIT DEFAULT 0,
        AsientosCuero BIT DEFAULT 0,
        VolanteMultifuncion BIT DEFAULT 0,
        VolanteRegulableAltura BIT DEFAULT 0,
        VolanteRegulableProfundidad BIT DEFAULT 0,
        VolanteCuero BIT DEFAULT 0,
        VolanteCalefaccionado BIT DEFAULT 0,
        CristalesTocados BIT DEFAULT 0,
        EspejosElectricos BIT DEFAULT 0,
        EspejosCalefaccionados BIT DEFAULT 0,
        EspejosRebatiblesElectricos BIT DEFAULT 0,
        
        -- MULTIMEDIA (9 campos)
        PantallaMultimedia BIT DEFAULT 0,
        TamanoPantalla DECIMAL(4,1),
        Bluetooth BIT DEFAULT 0,
        USB BIT DEFAULT 0,
        AppleCarPlay BIT DEFAULT 0,
        AndroidAuto BIT DEFAULT 0,
        SistemaNavegacion BIT DEFAULT 0,
        SistemaAudio NVARCHAR(100),
        Parlantes INT,
        
        -- EXTERIOR (8 campos)
        LlantasAleacion BIT DEFAULT 0,
        TamañoLlantas DECIMAL(4,1),
        FarosLED BIT DEFAULT 0,
        FarosXenon BIT DEFAULT 0,
        FarosAntiniebla BIT DEFAULT 0,
        LucesAutomatic BIT DEFAULT 0,
        TechoSolar BIT DEFAULT 0,
        BarrasPortaequipaje BIT DEFAULT 0,
        
        -- MOTOR Y PERFORMANCE (12 campos)
        ModoConduccion BIT DEFAULT 0,
        ModoEco BIT DEFAULT 0,
        ModoSport BIT DEFAULT 0,
        StartStop BIT DEFAULT 0,
        ControlCrucero BIT DEFAULT 0,
        ControlCruceroAdaptativo BIT DEFAULT 0,
        PaletasVolante BIT DEFAULT 0,
        SuspensionDeportiva BIT DEFAULT 0,
        SuspensionRegulable BIT DEFAULT 0,
        DiferencialLimitado BIT DEFAULT 0,
        AsistenteDescenso BIT DEFAULT 0,
        Turbo BIT DEFAULT 0,
        
        -- DIMENSIONES Y CAPACIDADES (7 campos)
        Largo INT,
        Ancho INT,
        Alto INT,
        Distancia_Entre_Ejes INT,
        Peso INT,
        CapacidadBaul INT,
        CapacidadTanque INT,
        
        -- Auditoría
        CreadoPorID INT NOT NULL,
        FechaCreacion DATETIME2 NOT NULL DEFAULT GETDATE(),
        ModificadoPorID INT,
        FechaModificacion DATETIME2,
        
        CONSTRAINT FK_EquipamientoModelo_Modelo FOREIGN KEY (ModeloID) REFERENCES Modelo(ModeloID),
        CONSTRAINT FK_EquipamientoModelo_CreadoPor FOREIGN KEY (CreadoPorID) REFERENCES Usuario(UsuarioID),
        CONSTRAINT FK_EquipamientoModelo_ModificadoPor FOREIGN KEY (ModificadoPorID) REFERENCES Usuario(UsuarioID)
    );
    
    CREATE NONCLUSTERED INDEX IX_EquipamientoModelo_ModeloID ON EquipamientoModelo(ModeloID);
    
    PRINT 'Tabla EquipamientoModelo creada exitosamente';
END
ELSE
    PRINT 'Tabla EquipamientoModelo ya existe';
GO

-- =============================================
-- TABLA: VersionModelo
-- Descripción: Versiones/Variantes de un modelo
-- =============================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'VersionModelo')
BEGIN
    CREATE TABLE VersionModelo (
        VersionID INT IDENTITY(1,1) PRIMARY KEY,
        ModeloID INT NOT NULL,
        NombreVersion NVARCHAR(200) NOT NULL,
        Descripcion NVARCHAR(MAX),
        Motor NVARCHAR(100),
        Potencia INT,
        Transmision NVARCHAR(50),
        Activo BIT NOT NULL DEFAULT 1,
        FechaCreacion DATETIME2 NOT NULL DEFAULT GETDATE(),
        FechaModificacion DATETIME2,
        
        CONSTRAINT FK_VersionModelo_Modelo FOREIGN KEY (ModeloID) REFERENCES Modelo(ModeloID)
    );
    
    CREATE NONCLUSTERED INDEX IX_VersionModelo_ModeloID ON VersionModelo(ModeloID);
    
    PRINT 'Tabla VersionModelo creada exitosamente';
END
ELSE
    PRINT 'Tabla VersionModelo ya existe';
GO

-- =============================================
-- TABLA: PrecioModelo
-- Descripción: Historial de precios por modelo
-- =============================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'PrecioModelo')
BEGIN
    CREATE TABLE PrecioModelo (
        PrecioModeloID INT IDENTITY(1,1) PRIMARY KEY,
        ModeloID INT NOT NULL,
        Precio DECIMAL(18,2) NOT NULL,
        Moneda NVARCHAR(10) NOT NULL DEFAULT 'USD',
        VigenciaDesde DATE NOT NULL,
        VigenciaHasta DATE,
        Observaciones NVARCHAR(MAX),
        RegistradoPorID INT NOT NULL,
        FechaRegistro DATETIME2 NOT NULL DEFAULT GETDATE(),
        
        CONSTRAINT FK_PrecioModelo_Modelo FOREIGN KEY (ModeloID) REFERENCES Modelo(ModeloID),
        CONSTRAINT FK_PrecioModelo_RegistradoPor FOREIGN KEY (RegistradoPorID) REFERENCES Usuario(UsuarioID),
        CONSTRAINT CK_PrecioModelo_Precio CHECK (Precio > 0),
        CONSTRAINT CK_PrecioModelo_Fechas CHECK (VigenciaHasta IS NULL OR VigenciaHasta >= VigenciaDesde)
    );
    
    CREATE NONCLUSTERED INDEX IX_PrecioModelo_ModeloID ON PrecioModelo(ModeloID);
    CREATE NONCLUSTERED INDEX IX_PrecioModelo_VigenciaDesde ON PrecioModelo(VigenciaDesde DESC);
    
    PRINT 'Tabla PrecioModelo creada exitosamente';
END
ELSE
    PRINT 'Tabla PrecioModelo ya existe';
GO

-- =============================================
-- TABLA: PrecioVersion
-- Descripción: Historial de precios por versión
-- =============================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'PrecioVersion')
BEGIN
    CREATE TABLE PrecioVersion (
        PrecioVersionID INT IDENTITY(1,1) PRIMARY KEY,
        VersionID INT NOT NULL,
        Precio DECIMAL(18,2) NOT NULL,
        Moneda NVARCHAR(10) NOT NULL DEFAULT 'USD',
        VigenciaDesde DATE NOT NULL,
        VigenciaHasta DATE,
        Observaciones NVARCHAR(MAX),
        RegistradoPorID INT NOT NULL,
        FechaRegistro DATETIME2 NOT NULL DEFAULT GETDATE(),
        
        CONSTRAINT FK_PrecioVersion_Version FOREIGN KEY (VersionID) REFERENCES VersionModelo(VersionID),
        CONSTRAINT FK_PrecioVersion_RegistradoPor FOREIGN KEY (RegistradoPorID) REFERENCES Usuario(UsuarioID),
        CONSTRAINT CK_PrecioVersion_Precio CHECK (Precio > 0),
        CONSTRAINT CK_PrecioVersion_Fechas CHECK (VigenciaHasta IS NULL OR VigenciaHasta >= VigenciaDesde)
    );
    
    CREATE NONCLUSTERED INDEX IX_PrecioVersion_VersionID ON PrecioVersion(VersionID);
    CREATE NONCLUSTERED INDEX IX_PrecioVersion_VigenciaDesde ON PrecioVersion(VigenciaDesde DESC);
    
    PRINT 'Tabla PrecioVersion creada exitosamente';
END
ELSE
    PRINT 'Tabla PrecioVersion ya existe';
GO

-- =============================================
-- TABLA: VentasModelo
-- Descripción: Ventas mensuales por modelo
-- =============================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'VentasModelo')
BEGIN
    CREATE TABLE VentasModelo (
        VentasID INT IDENTITY(1,1) PRIMARY KEY,
        ModeloID INT NOT NULL,
        Periodo INT NOT NULL, -- Formato YYYYMM (ej: 202312)
        Cantidad INT NOT NULL,
        RegistradoPorID INT NOT NULL,
        FechaRegistro DATETIME2 NOT NULL DEFAULT GETDATE(),
        FechaModificacion DATETIME2,
        
        CONSTRAINT FK_VentasModelo_Modelo FOREIGN KEY (ModeloID) REFERENCES Modelo(ModeloID),
        CONSTRAINT FK_VentasModelo_RegistradoPor FOREIGN KEY (RegistradoPorID) REFERENCES Usuario(UsuarioID),
        CONSTRAINT CK_VentasModelo_Cantidad CHECK (Cantidad >= 0),
        CONSTRAINT CK_VentasModelo_Periodo CHECK (Periodo >= 190001 AND Periodo <= 999912),
        CONSTRAINT UQ_VentasModelo_ModeloPeriodo UNIQUE (ModeloID, Periodo)
    );
    
    CREATE NONCLUSTERED INDEX IX_VentasModelo_ModeloID ON VentasModelo(ModeloID);
    CREATE NONCLUSTERED INDEX IX_VentasModelo_Periodo ON VentasModelo(Periodo DESC);
    
    PRINT 'Tabla VentasModelo creada exitosamente';
END
ELSE
    PRINT 'Tabla VentasModelo ya existe';
GO

-- =============================================
-- VISTA: Modelo con Detalles Completos
-- Descripción: Vista consolidada de modelos
-- =============================================
IF EXISTS (SELECT * FROM sys.views WHERE name = 'vw_ModeloDetalle')
    DROP VIEW vw_ModeloDetalle;
GO

CREATE VIEW vw_ModeloDetalle AS
SELECT 
    m.ModeloID,
    m.Modelo,
    ma.Marca,
    ma.MarcaID,
    m.Familia,
    m.Origen,
    m.Combustible,
    m.Año,
    m.Tipo,
    m.CC,
    m.HP,
    m.Traccion,
    m.Caja,
    m.Estado,
    m.EtapaFlujo,
    u.Nombre AS ResponsableActual,
    u.Rol AS RolResponsable,
    uc.Nombre AS CreadoPor,
    m.FechaCreacion,
    um.Nombre AS ModificadoPor,
    m.FechaModificacion,
    m.Activo
FROM Modelo m
INNER JOIN Marca ma ON m.MarcaID = ma.MarcaID
LEFT JOIN Usuario u ON m.ResponsableActualID = u.UsuarioID
LEFT JOIN Usuario uc ON m.CreadoPorID = uc.UsuarioID
LEFT JOIN Usuario um ON m.ModificadoPorID = um.UsuarioID;
GO

PRINT 'Vista vw_ModeloDetalle creada exitosamente';
GO

-- =============================================
-- SCRIPT COMPLETADO
-- =============================================
PRINT '';
PRINT '==============================================';
PRINT 'Script de creación de tablas completado';
PRINT 'Base de datos: Autodata';
PRINT 'Fecha: ' + CONVERT(VARCHAR, GETDATE(), 120);
PRINT '==============================================';
PRINT '';
PRINT 'Tablas creadas:';
PRINT '  1. Usuario';
PRINT '  2. Marca';
PRINT '  3. Modelo';
PRINT '  4. ModeloEstado';
PRINT '  5. ModeloHistorial';
PRINT '  6. EquipamientoModelo';
PRINT '  7. VersionModelo';
PRINT '  8. PrecioModelo';
PRINT '  9. PrecioVersion';
PRINT ' 10. VentasModelo';
PRINT '';
PRINT 'Vistas creadas:';
PRINT '  - vw_ModeloDetalle';
PRINT '';
PRINT 'Siguiente paso: Ejecutar 04_seed_usuario_admin.sql';
PRINT '==============================================';
GO
