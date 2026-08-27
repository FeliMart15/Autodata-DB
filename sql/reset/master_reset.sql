-- ============================================================
-- AUTODATA — MASTER RESET SCRIPT
-- Borra y recrea toda la base de datos desde cero.
-- Ejecutar en SSMS contra la instancia correcta.
--
-- Incluye:
--   1. Drop de todos los objetos (orden correcto respetando FKs)
--   2. Schema completo actualizado (con todas las correcciones)
--   3. Seed: Usuarios + Departamentos de Uruguay
--
-- ADVERTENCIA: Borra TODOS los datos. No ejecutar en produccion
-- sin un backup previo.
-- ============================================================

USE Autodata;
GO

PRINT '============================================================';
PRINT 'AUTODATA — MASTER RESET';
PRINT '============================================================';
PRINT '';

-- ============================================================
-- PASO 1: DESHABILITAR FK CONSTRAINTS
-- ============================================================
EXEC sp_MSforeachtable 'ALTER TABLE ? NOCHECK CONSTRAINT all';
PRINT 'FK constraints deshabilitados.';
GO

-- ============================================================
-- PASO 2: DROP — Views primero, luego tablas por dependencia
-- ============================================================

-- Views
IF OBJECT_ID('dbo.VistaModeloDetalle',                   'V') IS NOT NULL DROP VIEW dbo.VistaModeloDetalle;
IF OBJECT_ID('dbo.v_ModeloDetalle',                      'V') IS NOT NULL DROP VIEW dbo.v_ModeloDetalle;
IF OBJECT_ID('dbo.vw_LoginsFallidos',                    'V') IS NOT NULL DROP VIEW dbo.vw_LoginsFallidos;
IF OBJECT_ID('dbo.vw_ResumenEmpadronamientosPorDepartamento', 'V') IS NOT NULL DROP VIEW dbo.vw_ResumenEmpadronamientosPorDepartamento;
GO

-- Tablas hoja (sin dependientes)
IF OBJECT_ID('stg.Claudio_Modelos',     'U') IS NOT NULL DROP TABLE stg.Claudio_Modelos;
IF OBJECT_ID('dbo.AuditoriaAcceso',     'U') IS NOT NULL DROP TABLE dbo.AuditoriaAcceso;
IF OBJECT_ID('dbo.Empadronamiento',     'U') IS NOT NULL DROP TABLE dbo.Empadronamiento;
IF OBJECT_ID('dbo.VentasModelo',        'U') IS NOT NULL DROP TABLE dbo.VentasModelo;
IF OBJECT_ID('dbo.Venta',               'U') IS NOT NULL DROP TABLE dbo.Venta;
IF OBJECT_ID('dbo.EquipamientoModelo',  'U') IS NOT NULL DROP TABLE dbo.EquipamientoModelo;
IF OBJECT_ID('dbo.ModeloHistorial',     'U') IS NOT NULL DROP TABLE dbo.ModeloHistorial;
IF OBJECT_ID('dbo.ModeloEstado',        'U') IS NOT NULL DROP TABLE dbo.ModeloEstado;
IF OBJECT_ID('dbo.PrecioVersion',       'U') IS NOT NULL DROP TABLE dbo.PrecioVersion;
IF OBJECT_ID('dbo.VersionModelo',       'U') IS NOT NULL DROP TABLE dbo.VersionModelo;
IF OBJECT_ID('dbo.PrecioModelo',        'U') IS NOT NULL DROP TABLE dbo.PrecioModelo;
IF OBJECT_ID('dbo.Modelo',              'U') IS NOT NULL DROP TABLE dbo.Modelo;
IF OBJECT_ID('dbo.Familia',             'U') IS NOT NULL DROP TABLE dbo.Familia;
IF OBJECT_ID('dbo.Marca',               'U') IS NOT NULL DROP TABLE dbo.Marca;
IF OBJECT_ID('dbo.Departamento',        'U') IS NOT NULL DROP TABLE dbo.Departamento;
IF OBJECT_ID('dbo.RefreshToken',        'U') IS NOT NULL DROP TABLE dbo.RefreshToken;
IF OBJECT_ID('dbo.Usuario',             'U') IS NOT NULL DROP TABLE dbo.Usuario;
IF OBJECT_ID('dbo.EstadoCatalogo',      'U') IS NOT NULL DROP TABLE dbo.EstadoCatalogo;
IF OBJECT_ID('dbo.VersionEstado',       'U') IS NOT NULL DROP TABLE dbo.VersionEstado;
-- Stored procs
IF OBJECT_ID('dbo.sp_LimpiarTokensExpirados', 'P') IS NOT NULL DROP PROCEDURE dbo.sp_LimpiarTokensExpirados;
IF OBJECT_ID('dbo.sp_ObtenerHistorialAccesos', 'P') IS NOT NULL DROP PROCEDURE dbo.sp_ObtenerHistorialAccesos;
IF OBJECT_ID('dbo.sp_RegistrarAcceso',         'P') IS NOT NULL DROP PROCEDURE dbo.sp_RegistrarAcceso;
GO

PRINT 'Todos los objetos eliminados.';
PRINT '';

-- ============================================================
-- PASO 3: CREAR SCHEMAS
-- ============================================================

IF NOT EXISTS (SELECT 1 FROM sys.schemas WHERE name = 'stg')
    EXEC('CREATE SCHEMA stg');
GO

-- ============================================================
-- PASO 4: TABLAS PRINCIPALES
-- ============================================================

-- ---------------------------
-- AuditoriaAcceso
-- ---------------------------
CREATE TABLE [dbo].[AuditoriaAcceso] (
    [AuditoriaID]   INT            IDENTITY(1,1) NOT NULL,
    [UsuarioID]     INT            NULL,
    [Username]      NVARCHAR(50)   NOT NULL,
    [Accion]        NVARCHAR(50)   NOT NULL,
    [FechaHora]     DATETIME2(7)   NOT NULL DEFAULT GETDATE(),
    [IpAddress]     NVARCHAR(50)   NULL,
    [UserAgent]     NVARCHAR(500)  NULL,
    [Exitoso]       BIT            NOT NULL,
    [MensajeError]  NVARCHAR(500)  NULL,
    [Metadata]      NVARCHAR(MAX)  NULL,
    CONSTRAINT PK_AuditoriaAcceso PRIMARY KEY CLUSTERED ([AuditoriaID] ASC),
    CONSTRAINT CK_AuditoriaAcceso_Accion CHECK ([Accion] IN (
        'login_exitoso','login_fallido','logout','refresh_token',
        'token_expirado','token_revocado','cambio_password'))
);
GO

-- ---------------------------
-- Usuario
-- ---------------------------
CREATE TABLE [dbo].[Usuario] (
    [UsuarioID]          INT           IDENTITY(1,1) NOT NULL,
    [Username]           NVARCHAR(50)  NOT NULL,
    [Password]           NVARCHAR(255) NOT NULL,
    [Nombre]             NVARCHAR(100) NOT NULL,
    [Email]              NVARCHAR(100) NOT NULL,
    [Rol]                NVARCHAR(50)  NOT NULL,
    [Activo]             BIT           NOT NULL DEFAULT 1,
    [FechaCreacion]      DATETIME2(7)  NOT NULL DEFAULT GETDATE(),
    [FechaUltimoAcceso]  DATETIME2(7)  NULL,
    CONSTRAINT PK_Usuario PRIMARY KEY CLUSTERED ([UsuarioID] ASC),
    CONSTRAINT UQ_Usuario_Username UNIQUE ([Username]),
    CONSTRAINT UQ_Usuario_Email    UNIQUE ([Email]),
    CONSTRAINT CK_Usuario_Rol CHECK ([Rol] IN ('admin','aprobacion','revision','entrada_datos'))
);
GO

-- ---------------------------
-- RefreshToken
-- ---------------------------
CREATE TABLE [dbo].[RefreshToken] (
    [RefreshTokenID]     INT            IDENTITY(1,1) NOT NULL,
    [UsuarioID]          INT            NOT NULL,
    [Token]              NVARCHAR(500)  NOT NULL,
    [ExpiresAt]          DATETIME2(7)   NOT NULL,
    [CreatedAt]          DATETIME2(7)   NOT NULL DEFAULT GETDATE(),
    [RevokedAt]          DATETIME2(7)   NULL,
    [IsRevoked]          BIT            NOT NULL DEFAULT 0,
    [ReplacedByToken]    NVARCHAR(500)  NULL,
    [DeviceInfo]         NVARCHAR(500)  NULL,
    [IpAddress]          NVARCHAR(50)   NULL,
    CONSTRAINT PK_RefreshToken PRIMARY KEY CLUSTERED ([RefreshTokenID] ASC),
    CONSTRAINT UQ_RefreshToken_Token UNIQUE ([Token]),
    CONSTRAINT FK_RefreshToken_Usuario FOREIGN KEY ([UsuarioID]) REFERENCES [dbo].[Usuario]([UsuarioID]) ON DELETE CASCADE
);
GO

-- ---------------------------
-- Departamento
-- ---------------------------
CREATE TABLE [dbo].[Departamento] (
    [DepartamentoID]  INT           IDENTITY(1,1) NOT NULL,
    [Codigo]          NVARCHAR(10)  NOT NULL,
    [Nombre]          NVARCHAR(100) NOT NULL,
    [Pais]            NVARCHAR(100) NOT NULL DEFAULT 'Uruguay',
    [Activo]          BIT           NOT NULL DEFAULT 1,
    [FechaCreacion]   DATETIME2(7)  NOT NULL DEFAULT GETDATE(),
    CONSTRAINT PK_Departamento PRIMARY KEY CLUSTERED ([DepartamentoID] ASC),
    CONSTRAINT UQ_Departamento_Codigo  UNIQUE ([Codigo]),
    CONSTRAINT UQ_Departamento_Nombre  UNIQUE ([Nombre])
);
GO

-- ---------------------------
-- Marca  (SIN IDENTITY — importarExcelAutos inserta IDs explícitos)
-- ---------------------------
CREATE TABLE [dbo].[Marca] (
    [MarcaID]        INT           NOT NULL,   -- NO IDENTITY: los imports controlan el valor
    [CodigoMarca]    NVARCHAR(50)  NOT NULL,
    [Descripcion]    NVARCHAR(200) NOT NULL,
    [ShortName]      NVARCHAR(100) NULL,
    [Origen]         NVARCHAR(100) NULL,
    [CodigoOrigen]   NVARCHAR(50)  NULL,
    [FechaCreacion]  DATETIME      NULL DEFAULT GETDATE(),
    CONSTRAINT PK_Marca PRIMARY KEY CLUSTERED ([MarcaID] ASC)
);
GO

-- ---------------------------
-- EstadoCatalogo  (referencia — no se usa actualmente por el flujo real)
-- ---------------------------
CREATE TABLE [dbo].[EstadoCatalogo] (
    [EstadoID]      INT            IDENTITY(1,1) NOT NULL,
    [NombreEstado]  NVARCHAR(100)  NOT NULL,
    CONSTRAINT PK_EstadoCatalogo PRIMARY KEY CLUSTERED ([EstadoID] ASC)
);
GO

-- ---------------------------
-- Familia
-- ---------------------------
CREATE TABLE [dbo].[Familia] (
    [FamiliaID]         INT           IDENTITY(1,1) NOT NULL,
    [MarcaID]           INT           NOT NULL,
    [Nombre]            NVARCHAR(100) NOT NULL,
    [Descripcion]       NVARCHAR(500) NULL,
    [Activo]            BIT           NOT NULL DEFAULT 1,
    [FechaCreacion]     DATETIME2(7)  NOT NULL DEFAULT GETDATE(),
    [FechaModificacion] DATETIME2(7)  NULL,
    CONSTRAINT PK_Familia PRIMARY KEY CLUSTERED ([FamiliaID] ASC),
    CONSTRAINT UQ_Familia_Marca_Nombre UNIQUE ([MarcaID], [Nombre]),
    CONSTRAINT FK_Familia_Marca FOREIGN KEY ([MarcaID]) REFERENCES [dbo].[Marca]([MarcaID]) ON DELETE CASCADE
);
GO

-- ---------------------------
-- Modelo
-- ---------------------------
CREATE TABLE [dbo].[Modelo] (
    [ModeloID]               INT             IDENTITY(1,1) NOT NULL,
    [MarcaID]                INT             NOT NULL,
    [CodigoModelo]           NVARCHAR(50)    NULL,
    [DescripcionModelo]      NVARCHAR(200)   NULL,
    [CategoriaCodigo]        NVARCHAR(50)    NULL,
    [CombustibleCodigo]      NVARCHAR(50)    NULL,
    [OrigenCodigo]           NVARCHAR(50)    NULL,
    [ShortName]              NVARCHAR(100)   NULL,
    [Precio0KMInicial]       DECIMAL(18,2)   NULL,
    [Familia]                NVARCHAR(200)   NULL,
    [FamiliaID]              INT             NULL,
    [Anio]                   INT             NULL,
    [Tipo]                   NVARCHAR(100)   NULL,
    [Tipo2]                  NVARCHAR(100)   NULL,
    [CC]                     INT             NULL,
    [HP]                     INT             NULL,
    [Traccion]               NVARCHAR(50)    NULL,
    [Caja]                   NVARCHAR(100)   NULL,
    [TipoCaja]               NVARCHAR(100)   NULL,
    [TipoCajaAut]            NVARCHAR(100)   NULL,
    [Turbo]                  BIT             NULL,
    [Puertas]                INT             NULL,
    [Pasajeros]              INT             NULL,
    [Asientos]               INT             NULL,
    [TipoVehiculo]           NVARCHAR(50)    NULL,
    [TipoMotor]              NVARCHAR(100)   NULL,
    [TipoVehiculoElectrico]  NVARCHAR(100)   NULL,
    [Carroceria]             NVARCHAR(100)   NULL,
    [Cilindros]              INT             NULL,
    [Valvulas]               INT             NULL,
    [SegmentacionAutodata]   NVARCHAR(100)   NULL,
    [SegmentacionGM]         NVARCHAR(100)   NULL,
    [SegmentacionAudi]       NVARCHAR(100)   NULL,
    [SegmentacionSBI]        NVARCHAR(100)   NULL,
    [SegmentacionCitroen]    NVARCHAR(100)   NULL,
    [Importador]             NVARCHAR(200)   NULL,
    [CodigoAutodata]         CHAR(8)         NULL,
    [Estado]                 NVARCHAR(50)    NULL DEFAULT 'importado',
    [EstadoID]               INT             NULL,
    [Activo]                 BIT             NOT NULL DEFAULT 1,
    [observaciones]          NVARCHAR(MAX)   NULL,
    [ObservacionesRevision]  NVARCHAR(MAX)   NULL,
    [UltimoComentario]       NVARCHAR(MAX)   NULL,
    [Modelo1]                NVARCHAR(200)   NULL,
    [PrecioInicial]          DECIMAL(18,2)   NULL,
    [FechaCreacion]          DATETIME        NULL DEFAULT GETDATE(),
    [FechaModificacion]      DATETIME2(7)    NULL,
    [ModificadoPorID]        INT             NULL,
    CONSTRAINT PK_Modelo PRIMARY KEY CLUSTERED ([ModeloID] ASC),
    CONSTRAINT FK_Modelo_Marca    FOREIGN KEY ([MarcaID])   REFERENCES [dbo].[Marca]([MarcaID]),
    CONSTRAINT FK_Modelo_Familia  FOREIGN KEY ([FamiliaID]) REFERENCES [dbo].[Familia]([FamiliaID]),
    CONSTRAINT FK_Modelo_Estado   FOREIGN KEY ([EstadoID])  REFERENCES [dbo].[EstadoCatalogo]([EstadoID])
);
GO

-- ---------------------------
-- ModeloHistorial
-- ---------------------------
CREATE TABLE [dbo].[ModeloHistorial] (
    [HistorialID]   INT           IDENTITY(1,1) NOT NULL,
    [ModeloID]      INT           NOT NULL,
    [Campo]         NVARCHAR(200) NOT NULL,
    [ValorAnterior] NVARCHAR(MAX) NULL,
    [ValorNuevo]    NVARCHAR(MAX) NULL,
    [FechaCambio]   DATETIME      NULL DEFAULT GETDATE(),
    [Usuario]       NVARCHAR(200) NULL,
    CONSTRAINT PK_ModeloHistorial PRIMARY KEY CLUSTERED ([HistorialID] ASC),
    CONSTRAINT FK_ModeloHistorial_Modelo FOREIGN KEY ([ModeloID]) REFERENCES [dbo].[Modelo]([ModeloID])
);
GO

-- ---------------------------
-- ModeloEstado  (log de transiciones de estado)
-- ---------------------------
CREATE TABLE [dbo].[ModeloEstado] (
    [ModeloEstadoID]  INT           IDENTITY(1,1) NOT NULL,
    [ModeloID]        INT           NOT NULL,
    [EstadoAnterior]  NVARCHAR(50)  NULL,
    [EstadoNuevo]     NVARCHAR(50)  NOT NULL,
    [UsuarioID]       INT           NULL,
    [Observaciones]   NVARCHAR(MAX) NULL,
    [FechaCambio]     DATETIME2(7)  NOT NULL DEFAULT GETDATE(),
    CONSTRAINT PK_ModeloEstado PRIMARY KEY CLUSTERED ([ModeloEstadoID] ASC),
    CONSTRAINT FK_ModeloEstado_Modelo FOREIGN KEY ([ModeloID]) REFERENCES [dbo].[Modelo]([ModeloID])
);
GO

-- ---------------------------
-- PrecioModelo
-- ---------------------------
CREATE TABLE [dbo].[PrecioModelo] (
    [PrecioID]            INT           IDENTITY(1,1) NOT NULL,
    [ModeloID]            INT           NOT NULL,
    [Precio]              DECIMAL(18,2) NOT NULL,
    [Moneda]              NVARCHAR(10)  NULL DEFAULT 'USD',
    [FechaVigenciaDesde]  DATE          NOT NULL,
    [FechaVigenciaHasta]  DATE          NULL,
    [Fuente]              NVARCHAR(200) NULL,
    [FechaCarga]          DATETIME      NULL DEFAULT GETDATE(),
    CONSTRAINT PK_PrecioModelo PRIMARY KEY CLUSTERED ([PrecioID] ASC),
    CONSTRAINT FK_PrecioModelo_Modelo FOREIGN KEY ([ModeloID]) REFERENCES [dbo].[Modelo]([ModeloID])
);
GO

-- ---------------------------
-- VersionModelo
-- ---------------------------
CREATE TABLE [dbo].[VersionModelo] (
    [VersionID]      INT           IDENTITY(1,1) NOT NULL,
    [ModeloID]       INT           NOT NULL,
    [CodigoVersion]  NVARCHAR(100) NOT NULL,
    [Descripcion]    NVARCHAR(200) NOT NULL,
    [Equipamiento]   NVARCHAR(400) NULL,
    [OrigenCodigo]   NVARCHAR(100) NULL,
    [FechaCarga]     DATETIME      NOT NULL DEFAULT GETDATE(),
    CONSTRAINT PK_VersionModelo PRIMARY KEY CLUSTERED ([VersionID] ASC),
    CONSTRAINT FK_VersionModelo_Modelo FOREIGN KEY ([ModeloID]) REFERENCES [dbo].[Modelo]([ModeloID])
);
GO

-- ---------------------------
-- VersionEstado
-- ---------------------------
CREATE TABLE [dbo].[VersionEstado] (
    [EstadoID]      INT           IDENTITY(1,1) NOT NULL,
    [NombreEstado]  NVARCHAR(200) NOT NULL,
    CONSTRAINT PK_VersionEstado PRIMARY KEY CLUSTERED ([EstadoID] ASC)
);
GO

-- ---------------------------
-- PrecioVersion
-- ---------------------------
CREATE TABLE [dbo].[PrecioVersion] (
    [PrecioID]            INT           IDENTITY(1,1) NOT NULL,
    [VersionID]           INT           NOT NULL,
    [Precio]              DECIMAL(18,2) NOT NULL,
    [Moneda]              NVARCHAR(20)  NOT NULL,
    [FechaVigenciaDesde]  DATE          NULL,
    [FechaVigenciaHasta]  DATE          NULL,
    [Fuente]              NVARCHAR(400) NULL,
    [FechaCarga]          DATETIME      NOT NULL DEFAULT GETDATE(),
    CONSTRAINT PK_PrecioVersion PRIMARY KEY CLUSTERED ([PrecioID] ASC),
    CONSTRAINT FK_PrecioVersion_Version FOREIGN KEY ([VersionID]) REFERENCES [dbo].[VersionModelo]([VersionID])
);
GO

-- ---------------------------
-- EquipamientoModelo
-- NOTA: TablerDigital = INT (no bit); ButacaElectrica = NVARCHAR(20) (no bit)
-- ---------------------------
CREATE TABLE [dbo].[EquipamientoModelo] (
    [EquipamientoID]                         INT             IDENTITY(1,1) NOT NULL,
    [ModeloID]                               INT             NOT NULL,
    -- Dimensiones y peso
    [Largo]                                  INT             NULL,
    [Ancho]                                  INT             NULL,
    [Altura]                                 INT             NULL,
    [DistanciaEjes]                          INT             NULL,
    [PesoOrdenMarcha]                        INT             NULL,
    [KgPorHP]                                DECIMAL(10,2)   NULL,
    -- Ruedas
    [Neumaticos]                             NVARCHAR(100)   NULL,
    [LlantasAleacion]                        BIT             NULL,
    [DiametroLlantas]                        DECIMAL(4,1)    NULL,
    [TPMS]                                   BIT             NULL,
    [KitInflableAntiPinchazo]                BIT             NULL,
    [RuedaAuxHomogenea]                      NVARCHAR(50)    NULL,
    -- Motor / transmision  (Cilindros y Valvulas viven en Modelo: fuente de verdad unica)
    [Inyeccion]                              NVARCHAR(50)    NULL,
    [Traccion]                               NVARCHAR(50)    NULL,
    [Suspension]                             NVARCHAR(200)   NULL,
    [Caja]                                   NVARCHAR(50)    NULL,
    [MarchasVelocidades]                     NVARCHAR(50)    NULL,
    [Turbo]                                  BIT             NULL,
    -- NumeroPuertas vive en Modelo.Puertas (fuente de verdad unica)
    [Aceite]                                 NVARCHAR(100)   NULL,
    [Norma]                                  NVARCHAR(100)   NULL,
    [StartStop]                              BIT             NULL,
    -- Consumo / emisiones
    [CO2_g_km]                               DECIMAL(10,2)   NULL,
    [ConsumoRuta]                            DECIMAL(10,2)   NULL,
    [ConsumoUrbano]                          DECIMAL(10,2)   NULL,
    [ConsumoMixto]                           DECIMAL(10,2)   NULL,
    -- Garantia
    [GarantiaAnios]                          INT             NULL,
    [GarantiaKm]                             INT             NULL,
    [GarantiasDiferenciales]                 NVARCHAR(MAX)   NULL,
    -- Electrico / hibrido
    [TipoVehiculoElectrico]                  NVARCHAR(100)   NULL,
    [EPedal]                                 NVARCHAR(150)   NULL,
    [CapacidadTanqueHidrogeno]               NVARCHAR(50)    NULL,
    [AutonomiaMaxRange]                      NVARCHAR(50)    NULL,
    [AutonomiaMotorElectricoBEVPHEV]         INT             NULL,   -- autonomía del motor eléctrico (BEV/PHEV); dato propio distinto de AutonomiaMaxRange
    [CicloNorma]                             NVARCHAR(100)   NULL,
    [PotenciaMotor]                          NVARCHAR(50)    NULL,
    [CapacidadOperativaBateria]              NVARCHAR(50)    NULL,
    [ParMotorTorque]                         INT             NULL,
    [PotenciaCargaMax]                       NVARCHAR(50)    NULL,
    [TiposConectores]                        NVARCHAR(200)   NULL,
    [GarantiaCapBat]                         NVARCHAR(200)   NULL,
    [TecnologiaBat]                          NVARCHAR(200)   NULL,
    -- OtrosDatos (blob JSON) eliminado: se usan columnas estructuradas unicamente
    [TiempoCarga]                            NVARCHAR(200)   NULL,
    [CodigoFichaTecnica]                     NVARCHAR(100)   NULL,
    -- Confort / habitaculo
    [SistemaClimatizacion]                   NVARCHAR(100)   NULL,
    [Direccion]                              NVARCHAR(100)   NULL,
    [TipoBloqueo]                            NVARCHAR(100)   NULL,
    [KeylessSmartKey]                        BIT             NULL,
    [LevantaVidrios]                         NVARCHAR(50)    NULL,
    [EspejosElectricos]                      BIT             NULL,
    [EspejoInteriorElectrocromado]           BIT             NULL,
    [EspejosAbatiblesElectricamente]         BIT             NULL,
    [Tapizado]                               NVARCHAR(100)   NULL,
    [VolanteRevestidoCuero]                  BIT             NULL,
    [TablerDigital]                          INT             NULL,   -- INT: admite 0 para eléctricos
    [Computadora]                            BIT             NULL,
    [GPS]                                    BIT             NULL,
    [VelocidadCrucero]                       NVARCHAR(150)   NULL,
    [Inmovilizador]                          BIT             NULL,
    [Alarma]                                 BIT             NULL,
    [ABAG]                                   NVARCHAR(150)   NULL,
    [SRI]                                    BIT             NULL,
    -- Seguridad activa
    [ABS]                                    BIT             NULL,
    [EBD_EBV_REF]                            BIT             NULL,
    [DiscosFrenos]                           NVARCHAR(100)   NULL,
    [FrenoEstacionamientoElectrico]          BIT             NULL,
    [ESP_ControlEstabilidad]                 BIT             NULL,
    [ControlTraccion]                        BIT             NULL,
    [AsistFrenadoDetectorDistancia]          BIT             NULL,
    [AsistPendiente]                         BIT             NULL,
    [DetectorCambioFila]                     BIT             NULL,
    [DetectorPuntoCiego]                     BIT             NULL,
    [TrafficSignRecognition]                 BIT             NULL,
    [DriverAttentionControl]                 BIT             NULL,
    [DetectorLluvia]                         BIT             NULL,
    [GripControl]                            BIT             NULL,
    [LimitadorVelocidad]                     BIT             NULL,
    [AsistDescensoHDC]                       BIT             NULL,
    [PaddleShift]                            BIT             NULL,
    -- Multimedia
    [ComandoAudioVolante]                    BIT             NULL,
    [CD]                                     BIT             NULL,
    [MP3]                                    BIT             NULL,
    [USB]                                    BIT             NULL,
    [Bluetooth]                              BIT             NULL,
    [DVD]                                    BIT             NULL,
    [MirrorScreen]                           BIT             NULL,
    [SistemaMultimedia]                      NVARCHAR(200)   NULL,
    [PantallaMultimediaPulgadas]             DECIMAL(4,1)    NULL,
    [PantallaTactil]                         BIT             NULL,
    [CargadorSmartphoneInduccion]            BIT             NULL,
    [KitHiFi]                                NVARCHAR(100)   NULL,
    [Radio]                                  BIT             NULL,
    -- Asientos  (NumeroAsientos vive en Modelo.Asientos: fuente de verdad unica)
    [AsientoElectricoCalefMasaje]            NVARCHAR(20)    NULL,   -- NVARCHAR: admite "Si", "No", "Elect. + Calef", "Calef"
    [AsientosRango2y3]                       NVARCHAR(100)   NULL,
    [Asiento2Mas1]                           BIT             NULL,
    [ButacaElectrica]                        NVARCHAR(20)    NULL,   -- NVARCHAR: admite "Si", "No", "2"
    [AsientoVentilado]                       BIT             NULL,
    [AsientosMasajeador]                     INT             NULL,
    [ApoyabrazosDelantero]                   BIT             NULL,
    [ApoyabrazosCentralTrasero]              BIT             NULL,
    [SoporteMusloDelantero]                  BIT             NULL,
    [AsientoTraseroAjusteElectrico]          BIT             NULL,
    [TerceraFilaAsientosElectricos]          BIT             NULL,
    [TipoAlturaAsientoDelantero]             NVARCHAR(100)   NULL,
    [SeatAdjustmentMemoryDriver]             BIT             NULL,
    [SeatAdjustmentMemoryCoDriver]           BIT             NULL,
    [LumbarAdjustmentFrontDriver]            BIT             NULL,
    [LumbarAdjustmentFrontCoDriver]          BIT             NULL,
    [SeatHeatingRear]                        BIT             NULL,
    -- Techo
    [Techo]                                  NVARCHAR(100)   NULL,
    [TechoBiTono]                            BIT             NULL,
    [BarrasTecho]                            BIT             NULL,
    [NumeroTechosQueSeAbren]                 INT             NULL,
    -- Estacionamiento / camaras
    [SensorEstacionamiento]                  NVARCHAR(100)   NULL,
    [Camara]                                 NVARCHAR(100)   NULL,
    [SistemaAutomaticoEstacionamiento]       BIT             NULL,
    -- Faros / luces
    [FarosNeblina]                           BIT             NULL,
    [FarosDireccionales]                     BIT             NULL,
    [FarosFullLED]                           BIT             NULL,
    [FarosHalogenosDRL_LED]                  BIT             NULL,
    [FarosXenonLimpiadores]                  BIT             NULL,
    [PackVisibilidad]                        BIT             NULL,
    [PasoLucesCruzRutaAutomatica]            BIT             NULL,
    [VisionNocturna]                         BIT             NULL,
    [FarosMatrix]                            BIT             NULL,
    [LucesTraserasLED]                       BIT             NULL,
    [LucesTraserasOLED]                      BIT             NULL,
    -- Maletero / utilidad
    [MaleteraAperturaElectrica]              NVARCHAR(150)   NULL,
    [CapacidadBaul]                          INT             NULL,
    [CapacidadTanqueCombustible]             INT             NULL,
    [ProtectorCaja]                          BIT             NULL,
    [ParticionCabina]                        BIT             NULL,
    [NumPuertasLaterales]                    INT             NULL,
    [PuertaLateralElectrica]                 BIT             NULL,
    [CargaUtil_kg]                           INT             NULL,
    [VolumenUtil_m3]                         DECIMAL(10,2)   NULL,
    [TipoAlturaUL]                           NVARCHAR(100)   NULL,
    [CapacidadCargaCamiones]                 NVARCHAR(200)   NULL,
    -- ADAS avanzado
    [AlertaTraficoCruzadoTrasero]            BIT             NULL,
    [AlertaTraficoCruzadoFrontal]            BIT             NULL,
    [FrenadoMulticolision]                   BIT             NULL,
    [HeadUpDisplay]                          BIT             NULL,
    [CityStop]                               BIT             NULL,
    [FrenoPeatones]                          BIT             NULL,
    [BloqueDiferencialTerreno]               NVARCHAR(100)   NULL,
    [DesempaniadorElectrico]                 BIT             NULL,
    [IluminacionAmbiental]                   BIT             NULL,
    [LimpiaLavaParabrisasTrasero]            BIT             NULL,
    [BlackWheelFrame]                        BIT             NULL,
    [VolanteMultifuncion]                    BIT             NULL,
    [TablerDigital3D]                        BIT             NULL,
    -- Performance EV
    [AceleracionBEV_0a100]                   DECIMAL(5,2)    NULL,
    [AccelerationICE]                        DECIMAL(5,2)    NULL,
    [CargaElectricaWireless]                 BIT             NULL,
    [CargaElectricaInduccion]                BIT             NULL,
    [CableElectricoTipo3Incluido]            BIT             NULL,
    -- Chasis
    [ChassisDriveSelect]                     BIT             NULL,
    [ChassisSportSuspension]                 BIT             NULL,
    [DireccionCuatroRuedas]                  BIT             NULL,
    [LucesLaser]                             BIT             NULL,
    [DashboardDisplayConfigurable]           BIT             NULL,
    [WirelessSmartphoneIntegration]          BIT             NULL,
    [MobilePhoneAntenna]                     BIT             NULL,
    [DeflectorViento]                        BIT             NULL,
    [AsientosDeportivos]                     BIT             NULL,
    -- Auditoria
    [CreadoPorID]        INT          NULL,
    [FechaCreacion]      DATETIME2(7) NOT NULL DEFAULT GETDATE(),
    [ModificadoPorID]    INT          NULL,
    [FechaModificacion]  DATETIME2(7) NULL,
    CONSTRAINT PK_EquipamientoModelo PRIMARY KEY CLUSTERED ([EquipamientoID] ASC),
    CONSTRAINT UQ_EquipamientoModelo_Modelo UNIQUE ([ModeloID]),
    CONSTRAINT FK_EquipamientoModelo_Modelo      FOREIGN KEY ([ModeloID])      REFERENCES [dbo].[Modelo]([ModeloID]) ON DELETE CASCADE,
    CONSTRAINT FK_EquipamientoModelo_CreadoPor   FOREIGN KEY ([CreadoPorID])   REFERENCES [dbo].[Usuario]([UsuarioID]),
    CONSTRAINT FK_EquipamientoModelo_ModificadoPor FOREIGN KEY ([ModificadoPorID]) REFERENCES [dbo].[Usuario]([UsuarioID])
);
GO

-- ---------------------------
-- Venta
-- ---------------------------
CREATE TABLE [dbo].[Venta] (
    [VentaID]            INT          IDENTITY(1,1) NOT NULL,
    [ModeloID]           INT          NOT NULL,
    [Cantidad]           INT          NOT NULL DEFAULT 0,
    [Periodo]            NVARCHAR(7)  NOT NULL,
    [Anio]               INT          NOT NULL,
    [Mes]                INT          NOT NULL,
    -- Precio congelado al momento de crear el registro (NO se actualiza si el precio del modelo cambia después)
    [PrecioUnitario]     DECIMAL(18,2) NULL,
    [CreadoPorID]        INT          NOT NULL,
    [FechaCreacion]      DATETIME2(7) NOT NULL DEFAULT GETDATE(),
    [ModificadoPorID]    INT          NULL,
    [FechaModificacion]  DATETIME2(7) NULL,
    CONSTRAINT PK_Venta PRIMARY KEY CLUSTERED ([VentaID] ASC),
    CONSTRAINT UQ_Venta_Modelo_Periodo UNIQUE ([ModeloID], [Periodo]),
    CONSTRAINT CK_Venta_Cantidad CHECK ([Cantidad] >= 0),
    CONSTRAINT CK_Venta_Mes      CHECK ([Mes] >= 1 AND [Mes] <= 12),
    CONSTRAINT FK_Venta_Modelo        FOREIGN KEY ([ModeloID])      REFERENCES [dbo].[Modelo]([ModeloID]) ON DELETE CASCADE,
    CONSTRAINT FK_Venta_CreadoPor     FOREIGN KEY ([CreadoPorID])   REFERENCES [dbo].[Usuario]([UsuarioID]),
    CONSTRAINT FK_Venta_ModificadoPor FOREIGN KEY ([ModificadoPorID]) REFERENCES [dbo].[Usuario]([UsuarioID])
);
GO

-- ---------------------------
-- VentasModelo  (tabla legacy de ventas históricas por fuente)
-- ---------------------------
CREATE TABLE [dbo].[VentasModelo] (
    [VentaID]          INT          IDENTITY(1,1) NOT NULL,
    [ModeloID]         INT          NOT NULL,
    [Anio]             INT          NOT NULL,
    [Mes]              INT          NOT NULL,
    [UnidadesVendidas] INT          NOT NULL,
    [Fuente]           NVARCHAR(200) NULL,
    [FechaCarga]       DATETIME     NULL DEFAULT GETDATE(),
    CONSTRAINT PK_VentasModelo PRIMARY KEY CLUSTERED ([VentaID] ASC),
    CONSTRAINT FK_VentasModelo_Modelo FOREIGN KEY ([ModeloID]) REFERENCES [dbo].[Modelo]([ModeloID])
);
GO

-- ---------------------------
-- Empadronamiento
-- ---------------------------
CREATE TABLE [dbo].[Empadronamiento] (
    [EmpadronamientoID]  INT          IDENTITY(1,1) NOT NULL,
    [ModeloID]           INT          NOT NULL,
    [DepartamentoID]     INT          NOT NULL,
    [Cantidad]           INT          NOT NULL DEFAULT 0,
    [Periodo]            NVARCHAR(7)  NOT NULL,
    [Anio]               INT          NOT NULL,
    [Mes]                INT          NOT NULL,
    -- Precio congelado al momento de crear el registro (NO se actualiza si el precio del modelo cambia después)
    [PrecioUnitario]     DECIMAL(18,2) NULL,
    [CreadoPorID]        INT          NOT NULL,
    [FechaCreacion]      DATETIME2(7) NOT NULL DEFAULT GETDATE(),
    [ModificadoPorID]    INT          NULL,
    [FechaModificacion]  DATETIME2(7) NULL,
    CONSTRAINT PK_Empadronamiento PRIMARY KEY CLUSTERED ([EmpadronamientoID] ASC),
    CONSTRAINT UQ_Empadronamiento_Modelo_Dpto_Periodo UNIQUE ([ModeloID], [DepartamentoID], [Periodo]),
    CONSTRAINT CK_Empadronamiento_Cantidad CHECK ([Cantidad] >= 0),
    CONSTRAINT CK_Empadronamiento_Mes      CHECK ([Mes] >= 1 AND [Mes] <= 12),
    CONSTRAINT FK_Empadronamiento_Modelo        FOREIGN KEY ([ModeloID])      REFERENCES [dbo].[Modelo]([ModeloID]) ON DELETE CASCADE,
    CONSTRAINT FK_Empadronamiento_Departamento  FOREIGN KEY ([DepartamentoID]) REFERENCES [dbo].[Departamento]([DepartamentoID]),
    CONSTRAINT FK_Empadronamiento_CreadoPor     FOREIGN KEY ([CreadoPorID])   REFERENCES [dbo].[Usuario]([UsuarioID]),
    CONSTRAINT FK_Empadronamiento_ModificadoPor FOREIGN KEY ([ModificadoPorID]) REFERENCES [dbo].[Usuario]([UsuarioID])
);
GO

-- ---------------------------
-- stg.Claudio_Modelos  (staging para import CSV)
-- ---------------------------
CREATE TABLE [stg].[Claudio_Modelos] (
    [load_id]               INT            IDENTITY(1,1) PRIMARY KEY,
    [load_batch_id]         UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID(),
    [load_timestamp]        DATETIME2      NOT NULL DEFAULT GETDATE(),
    [load_status]           VARCHAR(50)    DEFAULT 'PENDING',
    [load_error_message]    NVARCHAR(MAX)  NULL,
    [raw_line]              NVARCHAR(MAX)  NULL,
    [marca]                 NVARCHAR(100)  NULL,
    [modelo]                NVARCHAR(200)  NULL,
    [anio]                  NVARCHAR(10)   NULL,
    [version]               NVARCHAR(500)  NULL,
    [combustible]           NVARCHAR(50)   NULL,
    [tipo]                  NVARCHAR(50)   NULL,
    [origen]                NVARCHAR(100)  NULL,
    [categoria]             NVARCHAR(100)  NULL,
    [segmento]              NVARCHAR(100)  NULL,
    [cc]                    NVARCHAR(20)   NULL,
    [hp]                    NVARCHAR(20)   NULL,
    [traccion]              NVARCHAR(50)   NULL,
    [caja]                  NVARCHAR(100)  NULL,
    [turbo]                 NVARCHAR(10)   NULL,
    [puertas]               NVARCHAR(10)   NULL,
    [pasajeros]             NVARCHAR(10)   NULL,
    [precio]                NVARCHAR(50)   NULL,
    [moneda]                NVARCHAR(10)   NULL,
    [airbag_conductor]      NVARCHAR(10)   NULL,
    [airbag_acompanante]    NVARCHAR(10)   NULL,
    [airbags_laterales]     NVARCHAR(10)   NULL,
    [airbags_cortina]       NVARCHAR(10)   NULL,
    [abs]                   NVARCHAR(10)   NULL,
    [control_estabilidad]   NVARCHAR(10)   NULL,
    [control_traccion]      NVARCHAR(10)   NULL,
    [climatizador]          NVARCHAR(10)   NULL,
    [aire_acondicionado]    NVARCHAR(10)   NULL,
    [camara_retroceso]      NVARCHAR(10)   NULL,
    [sensores_estacionamiento] NVARCHAR(10) NULL,
    [bluetooth]             NVARCHAR(10)   NULL,
    [usb]                   NVARCHAR(10)   NULL,
    [pantalla_tactil]       NVARCHAR(10)   NULL,
    [gps]                   NVARCHAR(10)   NULL,
    [llantas_aleacion]      NVARCHAR(10)   NULL,
    [techo_panoramico]      NVARCHAR(10)   NULL,
    [asientos_cuero]        NVARCHAR(10)   NULL,
    [asientos_electricos]   NVARCHAR(10)   NULL
);
CREATE NONCLUSTERED INDEX IX_Staging_Batch  ON stg.Claudio_Modelos(load_batch_id);
CREATE NONCLUSTERED INDEX IX_Staging_Status ON stg.Claudio_Modelos(load_status);
GO

-- FK diferida: AuditoriaAcceso.UsuarioID → Usuario (se agrega aquí porque
-- AuditoriaAcceso se crea antes que Usuario para respetar el orden del script)
ALTER TABLE [dbo].[AuditoriaAcceso]
    ADD CONSTRAINT FK_AuditoriaAcceso_Usuario
    FOREIGN KEY ([UsuarioID]) REFERENCES [dbo].[Usuario]([UsuarioID])
    ON DELETE SET NULL;
GO

PRINT 'Todas las tablas creadas correctamente.';
PRINT '';

-- ============================================================
-- PASO 5: INDICES ADICIONALES
-- ============================================================
CREATE NONCLUSTERED INDEX IX_AuditoriaAcceso_Username   ON dbo.AuditoriaAcceso(Username);
CREATE NONCLUSTERED INDEX IX_AuditoriaAcceso_FechaHora  ON dbo.AuditoriaAcceso(FechaHora DESC);
CREATE NONCLUSTERED INDEX IX_AuditoriaAcceso_Accion     ON dbo.AuditoriaAcceso(Accion);
CREATE NONCLUSTERED INDEX IX_AuditoriaAcceso_IpAddress  ON dbo.AuditoriaAcceso(IpAddress);
CREATE NONCLUSTERED INDEX IX_AuditoriaAcceso_Usuario    ON dbo.AuditoriaAcceso(UsuarioID);
CREATE NONCLUSTERED INDEX IX_Departamento_Codigo        ON dbo.Departamento(Codigo);
CREATE NONCLUSTERED INDEX IX_Departamento_Nombre        ON dbo.Departamento(Nombre);
CREATE NONCLUSTERED INDEX IX_Departamento_Activo        ON dbo.Departamento(Activo);
CREATE NONCLUSTERED INDEX IX_Familia_MarcaID            ON dbo.Familia(MarcaID);
CREATE NONCLUSTERED INDEX IX_Familia_Nombre             ON dbo.Familia(Nombre);
CREATE NONCLUSTERED INDEX IX_Familia_Activo             ON dbo.Familia(Activo);
CREATE NONCLUSTERED INDEX IX_Modelo_FamiliaID           ON dbo.Modelo(FamiliaID);
CREATE NONCLUSTERED INDEX IX_ModeloEstado_ModeloID      ON dbo.ModeloEstado(ModeloID);
CREATE NONCLUSTERED INDEX IX_ModeloEstado_FechaCambio   ON dbo.ModeloEstado(FechaCambio DESC);
CREATE NONCLUSTERED INDEX IX_EquipamientoModelo_ModeloID ON dbo.EquipamientoModelo(ModeloID);
CREATE NONCLUSTERED INDEX IX_EquipamientoModelo_FechaCreacion ON dbo.EquipamientoModelo(FechaCreacion DESC);
CREATE NONCLUSTERED INDEX IX_PrecioModelo_ModeloID      ON dbo.PrecioModelo(ModeloID);
CREATE NONCLUSTERED INDEX IX_Venta_ModeloID             ON dbo.Venta(ModeloID);
CREATE NONCLUSTERED INDEX IX_Venta_Periodo              ON dbo.Venta(Periodo DESC);
CREATE NONCLUSTERED INDEX IX_Empadronamiento_ModeloID   ON dbo.Empadronamiento(ModeloID);
CREATE NONCLUSTERED INDEX IX_RefreshToken_Token         ON dbo.RefreshToken(Token);
CREATE NONCLUSTERED INDEX IX_RefreshToken_ExpiresAt     ON dbo.RefreshToken(ExpiresAt);
CREATE NONCLUSTERED INDEX IX_RefreshToken_IsRevoked     ON dbo.RefreshToken(IsRevoked);
CREATE NONCLUSTERED INDEX IX_RefreshToken_Usuario       ON dbo.RefreshToken(UsuarioID);
CREATE NONCLUSTERED INDEX IX_Usuario_Username           ON dbo.Usuario(Username);
CREATE NONCLUSTERED INDEX IX_Usuario_Email              ON dbo.Usuario(Email);
CREATE NONCLUSTERED INDEX IX_Usuario_Rol                ON dbo.Usuario(Rol);
GO

PRINT 'Índices creados.';
PRINT '';
GO

-- ============================================================
-- PASO 6: VIEWS
-- ============================================================

-- Login fallidos (seguridad)
CREATE VIEW [dbo].[vw_LoginsFallidos] AS
SELECT
    Username,
    IpAddress,
    COUNT(*) AS Intentos,
    MAX(FechaHora) AS UltimoIntento,
    MIN(FechaHora) AS PrimerIntento
FROM AuditoriaAcceso
WHERE Accion = 'login_fallido'
  AND FechaHora >= DATEADD(HOUR, -24, GETDATE())
GROUP BY Username, IpAddress
HAVING COUNT(*) >= 3;
GO

-- Resumen de empadronamientos por departamento (usado por empadronamientosController)
CREATE VIEW [dbo].[vw_ResumenEmpadronamientosPorDepartamento] AS
SELECT
    d.DepartamentoID,
    d.Nombre      AS Departamento,
    d.Codigo      AS CodigoDepartamento,
    ma.Descripcion AS Marca,
    f.Nombre       AS Familia,
    e.Periodo,
    COUNT(DISTINCT m.ModeloID)  AS CantidadModelos,
    SUM(e.Cantidad)             AS TotalEmpadronamientos
FROM Empadronamiento e
INNER JOIN Modelo       m  ON e.ModeloID       = m.ModeloID
INNER JOIN Marca        ma ON m.MarcaID        = ma.MarcaID
INNER JOIN Familia      f  ON m.FamiliaID      = f.FamiliaID
INNER JOIN Departamento d  ON e.DepartamentoID = d.DepartamentoID
GROUP BY
    d.DepartamentoID, d.Nombre, d.Codigo,
    ma.Descripcion, f.Nombre, e.Periodo;
GO

-- Vista detalle de modelo (para reportes / exports)
-- NOTA: No incluye columnas de EquipamientoModelo para evitar duplicados de ModeloID.
--       Los datos de equipamiento se obtienen directamente de EquipamientoModelo si se precisan.
CREATE VIEW [dbo].[VistaModeloDetalle] AS
SELECT
    m.ModeloID,
    m.MarcaID,
    mar.Descripcion       AS Marca,
    mar.CodigoMarca       AS MARCOD,
    m.CodigoModelo        AS MARMODCOD,
    m.CodigoAutodata,
    m.DescripcionModelo   AS Modelo,
    m.Familia,
    m.FamiliaID,
    m.Activo,
    m.Anio,
    m.PrecioInicial       AS PrecioBase,
    m.OrigenCodigo        AS Origen,
    m.Importador,
    m.Carroceria,
    m.SegmentacionAutodata AS Segmento,
    m.TipoMotor,
    m.TipoVehiculoElectrico,
    m.TipoCajaAut,
    m.CC                  AS Cilindrada,
    m.HP                  AS Potencia,
    m.Cilindros,
    m.Valvulas,
    m.Puertas,
    m.Asientos,
    m.CombustibleCodigo   AS Combustible,
    m.Tipo,
    m.Estado,
    m.FechaCreacion,
    m.FechaModificacion,
    (SELECT TOP 1 Precio FROM PrecioModelo p
     WHERE p.ModeloID = m.ModeloID
     ORDER BY p.FechaVigenciaDesde DESC, p.FechaCarga DESC) AS PrecioActual
FROM Modelo m
INNER JOIN Marca mar ON m.MarcaID = mar.MarcaID;
GO

PRINT 'Vistas creadas.';
PRINT '';
GO

-- ============================================================
-- PASO 7: STORED PROCEDURES
-- ============================================================
CREATE PROCEDURE [dbo].[sp_LimpiarTokensExpirados]
AS
BEGIN
    SET NOCOUNT ON;
    DECLARE @Eliminados INT;
    DELETE FROM RefreshToken WHERE ExpiresAt < GETDATE() OR IsRevoked = 1;
    SET @Eliminados = @@ROWCOUNT;
    PRINT 'Tokens eliminados: ' + CAST(@Eliminados AS NVARCHAR(10));
    RETURN @Eliminados;
END
GO

CREATE PROCEDURE [dbo].[sp_RegistrarAcceso]
    @UsuarioID   INT           = NULL,
    @Username    NVARCHAR(50),
    @Accion      NVARCHAR(50),
    @Exitoso     BIT,
    @IpAddress   NVARCHAR(50)  = NULL,
    @UserAgent   NVARCHAR(500) = NULL,
    @MensajeError NVARCHAR(500)= NULL,
    @Metadata    NVARCHAR(MAX) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    INSERT INTO AuditoriaAcceso (UsuarioID, Username, Accion, Exitoso, IpAddress, UserAgent, MensajeError, Metadata)
    VALUES (@UsuarioID, @Username, @Accion, @Exitoso, @IpAddress, @UserAgent, @MensajeError, @Metadata);
END
GO

CREATE PROCEDURE [dbo].[sp_ObtenerHistorialAccesos]
    @Username NVARCHAR(50),
    @Dias INT = 30,
    @Top  INT = 100
AS
BEGIN
    SET NOCOUNT ON;
    SELECT TOP (@Top)
        AuditoriaID, UsuarioID, Username, Accion,
        FechaHora, IpAddress, UserAgent, Exitoso, MensajeError
    FROM AuditoriaAcceso
    WHERE Username = @Username
      AND FechaHora >= DATEADD(DAY, -@Dias, GETDATE())
    ORDER BY FechaHora DESC;
END
GO

PRINT 'Stored procedures creados.';
PRINT '';

-- ============================================================
-- PASO 8: SEED — Departamentos de Uruguay
-- ============================================================
INSERT INTO [dbo].[Departamento] (Codigo, Nombre, Pais, Activo) VALUES
('MVD',  'Montevideo',       'Uruguay', 1),
('CA',   'Canelones',        'Uruguay', 1),
('MA',   'Maldonado',        'Uruguay', 1),
('RO',   'Rocha',            'Uruguay', 1),
('TR',   'Treinta y Tres',   'Uruguay', 1),
('CE',   'Cerro Largo',      'Uruguay', 1),
('RV',   'Rivera',           'Uruguay', 1),
('AR',   'Artigas',          'Uruguay', 1),
('SA',   'Salto',            'Uruguay', 1),
('PA',   'Paysandú',         'Uruguay', 1),
('RN',   'Río Negro',        'Uruguay', 1),
('SO',   'Soriano',          'Uruguay', 1),
('CO',   'Colonia',          'Uruguay', 1),
('SJ',   'San José',         'Uruguay', 1),
('FD',   'Florida',          'Uruguay', 1),
('FS',   'Flores',           'Uruguay', 1),
('DU',   'Durazno',          'Uruguay', 1),
('TA',   'Tacuarembó',       'Uruguay', 1),
('LA',   'Lavalleja',        'Uruguay', 1);
GO

PRINT '19 departamentos insertados.';

-- ============================================================
-- PASO 9: SEED — Usuarios
--   admin         → admin123
--   santiago      → admin123
--   claudio       → autodata2024
--   yanina        → autodata2024
--   noel          → autodata2024
-- ============================================================
INSERT INTO [dbo].[Usuario] (Username, Password, Nombre, Email, Rol) VALUES
('admin',
 '$2b$10$fvHMD46BQnY3ExE9iRU5GO7.YX.eYse9gyd/b2CFXfmHDYWgNIEb.',
 N'Administrador',
 'admin@autodata.com',
 'admin');

INSERT INTO [dbo].[Usuario] (Username, Password, Nombre, Email, Rol) VALUES
('santiago.martinez',
 '$2b$10$mIZhE5uyA9H47HmGgmlPJ.6Ns7aPVZh.Woe8tr13RZa.8NCoouz86',
 N'Santiago Martínez',
 'santiago.martinez@autodata.com',
 'admin');

INSERT INTO [dbo].[Usuario] (Username, Password, Nombre, Email, Rol) VALUES
('claudio.bustillo',
 '$2b$10$pdcRM2eBvZN9iIXwx5fHReT91lG0yJVyl8EO5wrPmd.Xd3c1LrP7C',
 N'Claudio Bustillo',
 'claudio.bustillo@autodata.com',
 'aprobacion');

INSERT INTO [dbo].[Usuario] (Username, Password, Nombre, Email, Rol) VALUES
('yanina.dotti',
 '$2b$10$hHMhqKhStTrofsfX6tl4r.dOokbcwB/KJDfDwlew9N7VQWHz2t1Hq',
 N'Yanina Dotti',
 'yanina.dotti@autodata.com',
 'revision');

INSERT INTO [dbo].[Usuario] (Username, Password, Nombre, Email, Rol) VALUES
('noel.capurro',
 '$2b$10$KATuDy2Zi.MhUt9gvn.1nO69yqayvmdzyuRnKrpCeUlz3KVHPfFua',
 N'Noel Capurro',
 'noel.capurro@autodata.com',
 'entrada_datos');
GO

PRINT '5 usuarios insertados.';

-- ============================================================
-- PASO 10: VERIFICACION FINAL
-- ============================================================
SELECT
    t.TABLE_SCHEMA + '.' + t.TABLE_NAME AS [Tabla],
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS c
     WHERE c.TABLE_SCHEMA = t.TABLE_SCHEMA AND c.TABLE_NAME = t.TABLE_NAME) AS [Columnas]
FROM INFORMATION_SCHEMA.TABLES t
WHERE t.TABLE_TYPE = 'BASE TABLE'
ORDER BY t.TABLE_SCHEMA, t.TABLE_NAME;

SELECT 'Departamentos' AS [Tabla], COUNT(*) AS [Registros] FROM Departamento
UNION ALL
SELECT 'Usuarios',                  COUNT(*) FROM Usuario
UNION ALL
SELECT 'Marcas',                    COUNT(*) FROM Marca
UNION ALL
SELECT 'Familias',                  COUNT(*) FROM Familia
UNION ALL
SELECT 'Modelos',                   COUNT(*) FROM Modelo;
GO

PRINT '';
PRINT '============================================================';
PRINT 'RESET COMPLETADO.';
PRINT 'Contraseñas:';
PRINT '  admin / santiago.martinez  →  admin123';
PRINT '  claudio / yanina / noel    →  autodata2024';
PRINT '';
PRINT 'Próximos pasos:';
PRINT '  1. Importar Marcas via /api/import/excel-modelos (Excel MARCOD/MARMODCOD)';
PRINT '  2. Importar Modelos via /api/import/excel-completo (Plantilla Maestra)';
PRINT '  3. O importar ambos en un solo paso con la Plantilla Maestra completa.';
PRINT '============================================================';
GO
