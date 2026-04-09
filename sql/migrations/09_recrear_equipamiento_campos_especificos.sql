-- =============================================
-- Script: Recrear Tabla EquipamientoModelo - Campos Específicos
-- Descripción: Crea tabla con campos específicos de equipamiento
-- Fecha: 21 de Enero, 2026
-- =============================================

USE Autodata;
GO

PRINT '====================================';
PRINT 'RECREANDO TABLA EQUIPAMIENTOMODELO';
PRINT 'Con campos específicos solicitados';
PRINT '====================================';
PRINT '';
GO

-- =============================================
-- PASO 1: Respaldar datos existentes
-- =============================================

PRINT 'PASO 1: Respaldando datos existentes...';
PRINT '';

IF OBJECT_ID('EquipamientoModelo_Backup_20260121', 'U') IS NOT NULL
BEGIN
    DROP TABLE EquipamientoModelo_Backup_20260121;
    PRINT '  - Backup anterior eliminado';
END

IF OBJECT_ID('EquipamientoModelo', 'U') IS NOT NULL
BEGIN
    SELECT * INTO EquipamientoModelo_Backup_20260121 FROM EquipamientoModelo;
    
    DECLARE @BackupCount INT;
    SELECT @BackupCount = COUNT(*) FROM EquipamientoModelo_Backup_20260121;
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
    -- DIMENSIONES Y DATOS FÍSICOS
    -- =========================================
    Largo INT NULL,
    Ancho INT NULL,
    Altura INT NULL,
    DistanciaEjes INT NULL,
    PesoOrdenMarcha INT NULL,
    KgPorHP DECIMAL(10,2) NULL,
    
    -- =========================================
    -- NEUMÁTICOS Y RUEDAS
    -- =========================================
    Neumaticos NVARCHAR(100) NULL,
    LlantasAleacion BIT NULL,
    DiametroLlantas DECIMAL(4,1) NULL,
    TPMS BIT NULL,  -- Monitoreo presión de neumáticos
    KitInflableAntiPinchazo BIT NULL,
    RuedaAuxHomogenea BIT NULL,
    
    -- =========================================
    -- MOTOR Y MECÁNICA
    -- =========================================
    Cilindros INT NULL,
    Valvulas INT NULL,
    Inyeccion NVARCHAR(50) NULL,
    Traccion NVARCHAR(50) NULL,
    Suspension NVARCHAR(200) NULL,
    Caja NVARCHAR(50) NULL,
    MarchasVelocidades NVARCHAR(50) NULL,
    Turbo BIT NULL,
    NumeroPuertas INT NULL,
    Aceite NVARCHAR(100) NULL,
    Norma NVARCHAR(100) NULL,
    
    -- =========================================
    -- CONSUMO Y EMISIONES
    -- =========================================
    CO2_g_km DECIMAL(10,2) NULL,
    ConsumoRuta DECIMAL(10,2) NULL,
    ConsumoUrbano DECIMAL(10,2) NULL,
    ConsumoMixto DECIMAL(10,2) NULL,
    
    -- =========================================
    -- GARANTÍA
    -- =========================================
    GarantiaAnios INT NULL,
    GarantiaKm INT NULL,
    GarantiasDiferenciales NVARCHAR(MAX) NULL,
    
    -- =========================================
    -- VEHÍCULOS ELÉCTRICOS/HÍBRIDOS
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
    TiempoCarga NVARCHAR(200) NULL,
    AutonomiaMotorElectrico INT NULL,  -- Para BEV y PHEV
    
    -- =========================================
    -- OTROS DATOS TÉCNICOS
    -- =========================================
    CodigoFichaTecnica NVARCHAR(100) NULL,
    
    -- =========================================
    -- CONFORT E INTERIOR
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
    -- SEGURIDAD
    -- =========================================
    Alarma BIT NULL,
    ABAG BIT NULL,
    SRI BIT NULL,  -- Sistema de retención infantil
    ABS BIT NULL,
    EBD_EBV_REF BIT NULL,  -- Distribución electrónica de frenada
    DiscosFrenos NVARCHAR(100) NULL,
    FrenoEstacionamientoElectrico BIT NULL,  -- EPB
    ESP_ControlEstabilidad BIT NULL,  -- ESC
    ControlTraccion BIT NULL,  -- TCS
    AsistenciaFrenadoDetectorDistancia BIT NULL,
    AsistenciaPendiente BIT NULL,
    DetectorCambioFila BIT NULL,
    DetectorPuntoCiego BIT NULL,
    TrafficSignRecognition BIT NULL,
    DriverAttentionControl BIT NULL,
    DetectorLluvia BIT NULL,
    GripControl BIT NULL,
    
    -- =========================================
    -- MULTIMEDIA Y TECNOLOGÍA
    -- =========================================
    ComandoAudioVolante BIT NULL,
    CD BIT NULL,
    MP3 BIT NULL,
    USB BIT NULL,
    Bluetooth BIT NULL,
    DVD BIT NULL,
    MirrorScreen BIT NULL,  -- Smartphone Display
    SistemaMultimedia NVARCHAR(200) NULL,
    PantallaMultimediaPulgadas DECIMAL(4,1) NULL,
    PantallaTactil BIT NULL,
    CargadorSmartphoneInduccion BIT NULL,
    KitHiFi NVARCHAR(100) NULL,  -- Bose/JBL/Focal
    Radio BIT NULL,
    
    -- =========================================
    -- ASIENTOS
    -- =========================================
    NumeroAsientos INT NULL,
    AsientoElectricoCalefMasaje BIT NULL,
    AsientosRango2y3 NVARCHAR(100) NULL,
    Asiento2Mas1 BIT NULL,
    ButacaElectrica BIT NULL,
    AsientoVentilado BIT NULL,
    AsientosMasajeador INT NULL,  -- Número
    ApoyabrazosDelantero BIT NULL,
    ApoyabrazosCentralTrasero BIT NULL,
    SoporteMusloDelantero BIT NULL,
    AsientoTraseroAjusteElectrico BIT NULL,
    TerceraFilaAsientosElectricos BIT NULL,
    TipoAlturaAsientoDelantero NVARCHAR(100) NULL,
    SeatAdjustmentMemoryDriver BIT NULL,
    SeatAdjustmentMemoryCoDriver BIT NULL,
    LumbarAdjustmentFrontDriver BIT NULL,
    LumbarAdjustmentFrontCoDriver BIT NULL,
    SeatHeatingRear BIT NULL,
    AsientosDeportivos BIT NULL,
    
    -- =========================================
    -- TECHO
    -- =========================================
    Techo NVARCHAR(100) NULL,
    TechoBiTono BIT NULL,
    BarrasTecho BIT NULL,
    NumeroTechosQueSeAbren INT NULL,
    
    -- =========================================
    -- SENSORES Y ASISTENCIA
    -- =========================================
    SensorEstacionamiento NVARCHAR(100) NULL,
    Camara NVARCHAR(100) NULL,
    SistemaAutomaticoEstacionamiento BIT NULL,
    
    -- =========================================
    -- ILUMINACIÓN
    -- =========================================
    FarosNeblina BIT NULL,
    FarosDireccionales BIT NULL,
    FarosFullLED BIT NULL,
    FarosHalogenosDRL_LED BIT NULL,
    FarosXenonLimpiadores BIT NULL,
    PackVisibilidad BIT NULL,  -- Encendido auto faros
    PasoLucesCruzRutaAutomatica BIT NULL,
    VisionNocturna BIT NULL,
    FarosMatrix BIT NULL,
    LucesTraserasLED BIT NULL,
    LucesTraserasOLED BIT NULL,
    LucesLaser BIT NULL,
    
    -- =========================================
    -- MALETERO Y CARGA
    -- =========================================
    MaleteraAperturaElectrica BIT NULL,
    CapacidadBaul INT NULL,
    CapacidadTanqueCombustible INT NULL,
    ProtectorCaja BIT NULL,
    ParticionCabina BIT NULL,
    NumPuertasLaterales INT NULL,
    PuertaLateralElectrica BIT NULL,
    CargaUtil_kg INT NULL,
    VolumenUtil_m3 DECIMAL(10,2) NULL,
    TipoAlturaUL NVARCHAR(100) NULL,
    CapacidadCargaCamiones NVARCHAR(200) NULL,
    
    -- =========================================
    -- CARACTERÍSTICAS ADICIONALES
    -- =========================================
    StartStop BIT NULL,
    LimitadorVelocidad BIT NULL,
    AlertaTraficoCruzadoTrasero BIT NULL,
    AlertaTraficoCruzadoFrontal BIT NULL,
    FrenadoMulticolision BIT NULL,
    HeadUpDisplay BIT NULL,
    AsistenciaDescenso BIT NULL,  -- HDC
    PaddleShift BIT NULL,
    BloqueDiferencialTerreno NVARCHAR(100) NULL,
    CityStop BIT NULL,
    FrenoPeatones BIT NULL,
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
    DashboardDisplayConfigurable BIT NULL,
    WirelessSmartphoneIntegration BIT NULL,
    MobilePhoneAntenna BIT NULL,
    DeflectorViento BIT NULL,
    
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

PRINT '====================================';
PRINT '✓ TABLA EQUIPAMIENTOMODELO RECREADA';
PRINT '====================================';
PRINT '';
PRINT 'Campos específicos del equipamiento cargados correctamente';
PRINT '';
GO
