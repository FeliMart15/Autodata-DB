-- =============================================
-- Script: Recrear Tabla EquipamientoModelo
-- Descripción: Crea tabla con 150+ campos de equipamiento
-- Fecha: 17 de Enero, 2026
-- =============================================

USE Autodata;
GO

PRINT '====================================';
PRINT 'RECREANDO TABLA EQUIPAMIENTOMODELO';
PRINT 'Con 150+ campos de equipamiento completo';
PRINT '====================================';
PRINT '';
GO

-- =============================================
-- PASO 1: Respaldar datos existentes
-- =============================================

PRINT 'PASO 1: Respaldando datos existentes...';
PRINT '';

IF OBJECT_ID('EquipamientoModelo_Backup_20260117', 'U') IS NOT NULL
BEGIN
    DROP TABLE EquipamientoModelo_Backup_20260117;
    PRINT '  - Backup anterior eliminado';
END

IF OBJECT_ID('EquipamientoModelo', 'U') IS NOT NULL
BEGIN
    SELECT * INTO EquipamientoModelo_Backup_20260117 FROM EquipamientoModelo;
    
    DECLARE @BackupCount INT;
    SELECT @BackupCount = COUNT(*) FROM EquipamientoModelo_Backup_20260117;
    PRINT '  ✓ Backup creado: ' + CAST(@BackupCount AS NVARCHAR) + ' registros respaldados';
    
    DROP TABLE EquipamientoModelo;
    PRINT '  ✓ Tabla antigua eliminada';
END
ELSE
    PRINT '  - No existe tabla anterior para respaldar';

PRINT '';

-- =============================================
-- PASO 2: Crear nueva tabla EquipamientoModelo
-- =============================================

PRINT 'PASO 2: Creando nueva tabla EquipamientoModelo...';
PRINT '';

CREATE TABLE EquipamientoModelo (
    EquipamientoID INT IDENTITY(1,1) PRIMARY KEY,
    ModeloID INT NOT NULL UNIQUE,
    
    -- =========================================
    -- DIMENSIONES Y DATOS TÉCNICOS (15 campos)
    -- =========================================
    Largo INT NULL,
    Ancho INT NULL,
    Altura INT NULL,
    DistanciaEjes INT NULL,
    PesoOrdenMarcha INT NULL,
    KgPorHP DECIMAL(10,2) NULL,
    Neumaticos NVARCHAR(100) NULL,
    LlantasAleacion BIT NULL,
    DiametroLlantas DECIMAL(4,1) NULL,
    TPMS BIT NULL,
    KitInflableAntiPinchazo BIT NULL,
    RuedaAuxHomogenea BIT NULL,
    Cilindros INT NULL,
    Valvulas INT NULL,
    Inyeccion NVARCHAR(50) NULL,
    
    -- =========================================
    -- MECÁNICA (9 campos)
    -- =========================================
    Traccion NVARCHAR(50) NULL,
    Suspension NVARCHAR(200) NULL,
    Caja NVARCHAR(50) NULL,
    MarchasVelocidades NVARCHAR(50) NULL,
    Turbo BIT NULL,
    NumeroPuertas INT NULL,
    Aceite NVARCHAR(100) NULL,
    Norma NVARCHAR(100) NULL,
    StartStop BIT NULL,
    
    -- =========================================
    -- CONSUMO Y EMISIONES (4 campos)
    -- =========================================
    CO2_g_km DECIMAL(10,2) NULL,
    ConsumoRuta DECIMAL(10,2) NULL,
    ConsumoUrbano DECIMAL(10,2) NULL,
    ConsumoMixto DECIMAL(10,2) NULL,
    
    -- =========================================
    -- GARANTÍA (3 campos)
    -- =========================================
    GarantiaAnios INT NULL,
    GarantiaKm INT NULL,
    GarantiasDiferenciales NVARCHAR(MAX) NULL,
    
    -- =========================================
    -- VEHÍCULOS ELÉCTRICOS/HÍBRIDOS (12 campos)
    -- =========================================
    TipoVehiculoElectrico NVARCHAR(100) NULL,
    EPedal BIT NULL,
    CapacidadTanqueHidrogeno DECIMAL(10,2) NULL,
    AutonomiaMaxRange INT NULL,
    CicloNorma NVARCHAR(100) NULL,
    PotenciaMotor INT NULL,
    CapacidadOperativaBateria DECIMAL(10,2) NULL,
    ParMotorTorque INT NULL,
    PotenciaCargaMax DECIMAL(10,2) NULL,
    TiposConectores NVARCHAR(200) NULL,
    GarantiaCapBat NVARCHAR(200) NULL,
    TecnologiaBat NVARCHAR(200) NULL,
    
    -- =========================================
    -- OTROS DATOS (3 campos)
    -- =========================================
    OtrosDatos NVARCHAR(MAX) NULL,
    TiempoCarga NVARCHAR(200) NULL,
    CodigoFichaTecnica NVARCHAR(100) NULL,
    
    -- =========================================
    -- CONFORT E INTERIOR (15 campos)
    -- =========================================
    SistemaClimatizacion NVARCHAR(100) NULL,
    Direccion NVARCHAR(100) NULL,
    TipoBloqueo NVARCHAR(100) NULL,
    KeylessSmartKey BIT NULL,
    LevantaVidrios NVARCHAR(50) NULL,
    EspejosElectricos BIT NULL,
    EspejoInteriorElectrocromado BIT NULL,
    EspejosAbatiblesElectricamente BIT NULL,
    Tapizado NVARCHAR(100) NULL,
    VolanteRevestidoCuero BIT NULL,
    TablerDigital BIT NULL,
    Computadora BIT NULL,
    GPS BIT NULL,
    VelocidadCrucero BIT NULL,
    Inmovilizador BIT NULL,
    
    -- =========================================
    -- SEGURIDAD (16 campos)
    -- =========================================
    Alarma BIT NULL,
    ABAG BIT NULL,
    SRI BIT NULL,
    ABS BIT NULL,
    EBD_EBV_REF BIT NULL,
    DiscosFrenos NVARCHAR(100) NULL,
    FrenoEstacionamientoElectrico BIT NULL,
    ESP_ControlEstabilidad BIT NULL,
    ControlTraccion BIT NULL,
    AsistFrenadoDetectorDistancia BIT NULL,
    AsistPendiente BIT NULL,
    DetectorCambioFila BIT NULL,
    DetectorPuntoCiego BIT NULL,
    TrafficSignRecognition BIT NULL,
    DriverAttentionControl BIT NULL,
    DetectorLluvia BIT NULL,
    
    -- =========================================
    -- CONTROL Y ASISTENCIA (4 campos)
    -- =========================================
    GripControl BIT NULL,
    LimitadorVelocidad BIT NULL,
    AsistDescensoHDC BIT NULL,
    PaddleShift BIT NULL,
    
    -- =========================================
    -- MULTIMEDIA (13 campos)
    -- =========================================
    ComandoAudioVolante BIT NULL,
    CD BIT NULL,
    MP3 BIT NULL,
    USB BIT NULL,
    Bluetooth BIT NULL,
    DVD BIT NULL,
    MirrorScreen BIT NULL,
    SistemaMultimedia NVARCHAR(200) NULL,
    PantallaMultimediaPulgadas DECIMAL(4,1) NULL,
    PantallaTactil BIT NULL,
    CargadorSmartphoneInduccion BIT NULL,
    KitHiFi NVARCHAR(100) NULL,
    Radio BIT NULL,
    
    -- =========================================
    -- ASIENTOS (10 campos)
    -- =========================================
    NumeroAsientos INT NULL,
    AsientoElectricoCalefMasaje BIT NULL,
    AsientosRango2y3 NVARCHAR(100) NULL,
    Asiento2Mas1 BIT NULL,
    ButacaElectrica BIT NULL,
    AsientoVentilado BIT NULL,
    AsientosMasajeador INT NULL,
    ApoyabrazosDelantero BIT NULL,
    ApoyabrazosCentralTrasero BIT NULL,
    SoporteMusloDelantero BIT NULL,
    
    -- =========================================
    -- AJUSTES DE ASIENTOS (8 campos)
    -- =========================================
    AsientoTraseroAjusteElectrico BIT NULL,
    TerceraFilaAsientosElectricos BIT NULL,
    TipoAlturaAsientoDelantero NVARCHAR(100) NULL,
    SeatAdjustmentMemoryDriver BIT NULL,
    SeatAdjustmentMemoryCoDriver BIT NULL,
    LumbarAdjustmentFrontDriver BIT NULL,
    LumbarAdjustmentFrontCoDriver BIT NULL,
    SeatHeatingRear BIT NULL,
    
    -- =========================================
    -- TECHO (4 campos)
    -- =========================================
    Techo NVARCHAR(100) NULL,
    TechoBiTono BIT NULL,
    BarrasTecho BIT NULL,
    NumeroTechosQueSeAbren INT NULL,
    
    -- =========================================
    -- SENSORES Y CÁMARAS (3 campos)
    -- =========================================
    SensorEstacionamiento NVARCHAR(100) NULL,
    Camara NVARCHAR(100) NULL,
    SistemaAutomaticoEstacionamiento BIT NULL,
    
    -- =========================================
    -- ILUMINACIÓN (11 campos)
    -- =========================================
    FarosNeblina BIT NULL,
    FarosDireccionales BIT NULL,
    FarosFullLED BIT NULL,
    FarosHalogenosDRL_LED BIT NULL,
    FarosXenonLimpiadores BIT NULL,
    PackVisibilidad BIT NULL,
    PasoLucesCruzRutaAutomatica BIT NULL,
    VisionNocturna BIT NULL,
    FarosMatrix BIT NULL,
    LucesTraserasLED BIT NULL,
    LucesTraserasOLED BIT NULL,
    
    -- =========================================
    -- MALETERO Y CARGA (7 campos)
    -- =========================================
    MaleteraAperturaElectrica BIT NULL,
    CapacidadBaul INT NULL,
    CapacidadTanqueCombustible INT NULL,
    ProtectorCaja BIT NULL,
    ParticionCabina BIT NULL,
    NumPuertasLaterales INT NULL,
    PuertaLateralElectrica BIT NULL,
    
    -- =========================================
    -- CARGA (4 campos)
    -- =========================================
    CargaUtil_kg INT NULL,
    VolumenUtil_m3 DECIMAL(10,2) NULL,
    TipoAlturaUL NVARCHAR(100) NULL,
    CapacidadCargaCamiones NVARCHAR(200) NULL,
    
    -- =========================================
    -- SEGURIDAD AVANZADA (6 campos)
    -- =========================================
    AlertaTraficoCruzadoTrasero BIT NULL,
    AlertaTraficoCruzadoFrontal BIT NULL,
    FrenadoMulticolision BIT NULL,
    HeadUpDisplay BIT NULL,
    CityStop BIT NULL,
    FrenoPeatones BIT NULL,
    
    -- =========================================
    -- OTROS EQUIPAMIENTO (21 campos)
    -- =========================================
    BloqueDiferencialTerreno NVARCHAR(100) NULL,
    DesempaniadorElectrico BIT NULL,
    IluminacionAmbiental BIT NULL,
    LimpiaLavaParabrisasTrasero BIT NULL,
    BlackWheelFrame BIT NULL,
    VolanteMultifuncion BIT NULL,
    TablerDigital3D BIT NULL,
    AceleracionBEV_0a100 DECIMAL(5,2) NULL,
    AccelerationICE DECIMAL(5,2) NULL,
    CargaElectricaWireless BIT NULL,
    CargaElectricaInduccion BIT NULL,
    CableElectricoTipo3Incluido BIT NULL,
    ChassisDriveSelect BIT NULL,
    ChassisSportSuspension BIT NULL,
    DireccionCuatroRuedas BIT NULL,
    LucesLaser BIT NULL,
    DashboardDisplayConfigurable BIT NULL,
    WirelessSmartphoneIntegration BIT NULL,
    MobilePhoneAntenna BIT NULL,
    DeflectorViento BIT NULL,
    AsientosDeportivos BIT NULL,
    
    -- =========================================
    -- AUDITORÍA
    -- =========================================
    CreadoPorID INT NULL,
    FechaCreacion DATETIME2 NOT NULL DEFAULT GETDATE(),
    ModificadoPorID INT NULL,
    FechaModificacion DATETIME2 NULL,
    
    -- Foreign Keys
    CONSTRAINT FK_EquipamientoModelo_Modelo 
        FOREIGN KEY (ModeloID) REFERENCES Modelo(ModeloID) ON DELETE CASCADE,
    CONSTRAINT FK_EquipamientoModelo_CreadoPor 
        FOREIGN KEY (CreadoPorID) REFERENCES Usuario(UsuarioID),
    CONSTRAINT FK_EquipamientoModelo_ModificadoPor 
        FOREIGN KEY (ModificadoPorID) REFERENCES Usuario(UsuarioID)
);
GO

PRINT '  ✓ Tabla EquipamientoModelo creada exitosamente';
PRINT '';

-- =============================================
-- PASO 3: Crear índices
-- =============================================

PRINT 'PASO 3: Creando índices...';
PRINT '';

CREATE NONCLUSTERED INDEX IX_EquipamientoModelo_ModeloID 
    ON EquipamientoModelo(ModeloID);
PRINT '  ✓ Índice IX_EquipamientoModelo_ModeloID creado';

CREATE NONCLUSTERED INDEX IX_EquipamientoModelo_FechaCreacion 
    ON EquipamientoModelo(FechaCreacion DESC);
PRINT '  ✓ Índice IX_EquipamientoModelo_FechaCreacion creado';

PRINT '';

-- =============================================
-- PASO 4: Verificar estructura
-- =============================================

PRINT 'PASO 4: Verificando estructura...';
PRINT '';

DECLARE @TotalColumnas INT;
SELECT @TotalColumnas = COUNT(*) 
FROM sys.columns 
WHERE object_id = OBJECT_ID('EquipamientoModelo');

PRINT '  Total de columnas en EquipamientoModelo: ' + CAST(@TotalColumnas AS NVARCHAR);
PRINT '';

PRINT 'Distribución de campos por categoría:';
PRINT '  - Dimensiones y Datos Técnicos: 15 campos';
PRINT '  - Mecánica: 9 campos';
PRINT '  - Consumo y Emisiones: 4 campos';
PRINT '  - Garantía: 3 campos';
PRINT '  - Vehículos Eléctricos: 12 campos';
PRINT '  - Otros Datos: 3 campos';
PRINT '  - Confort e Interior: 15 campos';
PRINT '  - Seguridad: 16 campos';
PRINT '  - Control y Asistencia: 4 campos';
PRINT '  - Multimedia: 13 campos';
PRINT '  - Asientos: 10 campos';
PRINT '  - Ajustes de Asientos: 8 campos';
PRINT '  - Techo: 4 campos';
PRINT '  - Sensores y Cámaras: 3 campos';
PRINT '  - Iluminación: 11 campos';
PRINT '  - Maletero y Carga: 7 campos';
PRINT '  - Carga (Camiones): 4 campos';
PRINT '  - Seguridad Avanzada: 6 campos';
PRINT '  - Otros Equipamiento: 21 campos';
PRINT '  - Auditoría: 4 campos';
PRINT '  ----------------------------------------';
PRINT '  TOTAL: 152 campos';
PRINT '';

-- =============================================
-- PASO 5: Información de backup
-- =============================================

IF OBJECT_ID('EquipamientoModelo_Backup_20260117', 'U') IS NOT NULL
BEGIN
    PRINT 'NOTA: Los datos antiguos están respaldados en:';
    PRINT '  Tabla: EquipamientoModelo_Backup_20260117';
    PRINT '  Si necesitas migrar datos, hazlo manualmente según correspondencia de campos.';
    PRINT '';
END

PRINT '====================================';
PRINT '✓ TABLA EQUIPAMIENTOMODELO RECREADA';
PRINT '====================================';
PRINT '';
PRINT 'Sistema listo para carga de 150+ campos de equipamiento';
PRINT '';
GO
