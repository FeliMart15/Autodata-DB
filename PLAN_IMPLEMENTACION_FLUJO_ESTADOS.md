# 🚀 PLAN DE IMPLEMENTACIÓN - NUEVO FLUJO DE ESTADOS

**Fecha:** 17 de Enero, 2026  
**Objetivo:** Implementar sistema de flujo de estados con 3 fases (Datos Carga → Datos Mínimos → Equipamiento)

---

## 📊 RESUMEN EJECUTIVO

### Estados del Sistema (9 estados totales)

```
FASE 1: IMPORTACIÓN/CREACIÓN
├─ importado (CSV de Claudio)
└─ creado (Creado manualmente)

FASE 2: DATOS MÍNIMOS (16 campos obligatorios)
├─ datos_minimos (Usuario completó carga)
├─ revision_minimos (Enviado a revisión)
├─ corregir_minimos (Rechazado, debe corregir)
└─ minimos_aprobados (Aprobado, pasa a equipamiento)

FASE 3: EQUIPAMIENTO (140+ campos)
├─ equipamiento_cargado (Usuario completó equipamiento)
├─ revision_equipamiento (Enviado a revisión)
├─ corregir_equipamiento (Rechazado, debe corregir)
└─ definitivo (✅ APROBADO FINAL)
```

### Flujo de Transiciones

```
importado/creado 
    ↓ [Usuario carga 16 campos de datos mínimos]
datos_minimos 
    ↓ [Usuario envía a revisión]
revision_minimos 
    ↓ [Revisor decide]
    ├─→ minimos_aprobados (✅ Aprobado)
    └─→ corregir_minimos (❌ Rechazado) → datos_minimos (corregir)

minimos_aprobados 
    ↓ [Usuario carga 140+ campos de equipamiento]
equipamiento_cargado 
    ↓ [Usuario envía a revisión]
revision_equipamiento 
    ↓ [Revisor decide]
    ├─→ definitivo (✅ APROBADO FINAL)
    └─→ corregir_equipamiento (❌ Rechazado) → equipamiento_cargado (corregir)
```

### Restricciones Importantes

- ✅ Una vez aprobados los datos mínimos, NO se pueden editar (por ahora)
- ✅ Una vez en estado `definitivo`, NO se puede cambiar
- ✅ Los campos obligatorios deben estar completos para cambiar de fase
- ✅ Backend valida campos requeridos antes de permitir transiciones
- ✅ Sin restricciones de roles (por ahora)

---

## 📋 FASE 1: BASE DE DATOS

### 1.1 Campos por Fase

#### **DATOS DE CARGA (5 campos - vienen del CSV)**
```sql
-- Ya existen en tabla Modelo/Marca
MarcaID (FK → Marca.MarcaID)
CodigoMarca (desde tabla Marca)
Familia (NVARCHAR)
CodigoModelo (NVARCHAR)
CombustibleCodigo (NVARCHAR)
CategoriaCodigo (NVARCHAR)
```

#### **DATOS MÍNIMOS (16 campos OBLIGATORIOS)**
```sql
-- NUEVOS campos a agregar en tabla Modelo
Segmento NVARCHAR(100) NULL,
Modelo1 NVARCHAR(200) NULL,  -- Es el nombre del modelo
Tipo2_Carroceria NVARCHAR(100) NULL,
Origen NVARCHAR(100) NULL,
Combustible NVARCHAR(50) NULL,
Cilindros INT NULL,
Valvulas INT NULL,
Cilindrada INT NULL,  -- Ya existe como CC
HP INT NULL,  -- Ya existe
TipoCajaAut NVARCHAR(100) NULL,
Puertas INT NULL,  -- Ya existe
Asientos INT NULL,  -- Renombrar de Pasajeros
TipoMotor NVARCHAR(100) NULL,
TipoVehiculoElectrico NVARCHAR(100) NULL,
Importador NVARCHAR(200) NULL,  -- Ya existe
PrecioInicial DECIMAL(18,2) NULL
```

#### **DATOS DE EQUIPAMIENTO (140+ campos)**
```sql
-- Crear tabla EquipamientoModelo NUEVA con todos estos campos:

-- Dimensiones y Datos Técnicos (15 campos)
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

-- Mecánica (9 campos)
Traccion NVARCHAR(50) NULL,
Suspension NVARCHAR(200) NULL,
Caja NVARCHAR(50) NULL,
MarchasVelocidades NVARCHAR(50) NULL,
Turbo BIT NULL,
NumeroPuertas INT NULL,
Aceite NVARCHAR(100) NULL,
Norma NVARCHAR(100) NULL,
StartStop BIT NULL,

-- Consumo y Emisiones (4 campos)
CO2_g_km DECIMAL(10,2) NULL,
ConsumoRuta DECIMAL(10,2) NULL,
ConsumoUrbano DECIMAL(10,2) NULL,
ConsumoMixto DECIMAL(10,2) NULL,

-- Garantía (3 campos)
GarantiaAnios INT NULL,
GarantiaKm INT NULL,
GarantiasDiferenciales NVARCHAR(MAX) NULL,

-- Vehículos Eléctricos/Híbridos (11 campos)
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

-- Otros Datos (2 campos)
OtrosDatos NVARCHAR(MAX) NULL,
TiempoCarga NVARCHAR(200) NULL,
CodigoFichaTecnica NVARCHAR(100) NULL,

-- Confort y Interior (15 campos)
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

-- Seguridad (16 campos)
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

-- Control y Asistencia (4 campos)
GripControl BIT NULL,
LimitadorVelocidad BIT NULL,
AsistDescensoHDC BIT NULL,
PaddleShift BIT NULL,

-- Multimedia (13 campos)
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

-- Asientos (10 campos)
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

-- Ajustes de Asientos (6 campos)
AsientoTraseroAjusteElectrico BIT NULL,
TerceraFilaAsientosElectricos BIT NULL,
TipoAlturaAsientoDelantero NVARCHAR(100) NULL,
SeatAdjustmentMemoryDriver BIT NULL,
SeatAdjustmentMemoryCoDriver BIT NULL,
LumbarAdjustmentFrontDriver BIT NULL,
LumbarAdjustmentFrontCoDriver BIT NULL,
SeatHeatingRear BIT NULL,

-- Techo (4 campos)
Techo NVARCHAR(100) NULL,
TechoBiTono BIT NULL,
BarrasTecho BIT NULL,
NumeroTechosQueSeAbren INT NULL,

-- Sensores y Cámaras (3 campos)
SensorEstacionamiento NVARCHAR(100) NULL,
Camara NVARCHAR(100) NULL,
SistemaAutomaticoEstacionamiento BIT NULL,

-- Iluminación (11 campos)
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

-- Maletero y Carga (7 campos)
MaleteraAperturaElectrica BIT NULL,
CapacidadBaul INT NULL,
CapacidadTanqueCombustible INT NULL,
ProtectorCaja BIT NULL,
ParticionCabina BIT NULL,
NumPuertasLaterales INT NULL,
PuertaLateralElectrica BIT NULL,

-- Carga (camiones/utilitarios) (4 campos)
CargaUtil_kg INT NULL,
VolumenUtil_m3 DECIMAL(10,2) NULL,
TipoAlturaUL NVARCHAR(100) NULL,
CapacidadCargaCamiones NVARCHAR(200) NULL,

-- Seguridad Avanzada (5 campos)
AlertaTraficoCruzadoTrasero BIT NULL,
AlertaTraficoCruzadoFrontal BIT NULL,
FrenadoMulticolision BIT NULL,
HeadUpDisplay BIT NULL,
CityStop BIT NULL,
FrenoPeatones BIT NULL,

-- Otros Equipamiento (15 campos)
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
AutonomiaMotorElectrico INT NULL  -- BEV y PHEV
```

### 1.2 Script SQL - Modificación de Tabla Modelo

```sql
-- Archivo: sql/06_actualizar_modelo_nuevo_flujo.sql

USE Autodata;
GO

PRINT '====================================';
PRINT 'ACTUALIZANDO TABLA MODELO';
PRINT 'Nuevo flujo de estados';
PRINT '====================================';
GO

-- 1. Agregar columnas nuevas para Datos Mínimos
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Modelo') AND name = 'Modelo1')
BEGIN
    ALTER TABLE Modelo ADD Modelo1 NVARCHAR(200) NULL;
    PRINT '✓ Columna Modelo1 agregada';
END

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Modelo') AND name = 'Tipo2_Carroceria')
BEGIN
    ALTER TABLE Modelo ADD Tipo2_Carroceria NVARCHAR(100) NULL;
    PRINT '✓ Columna Tipo2_Carroceria agregada';
END

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Modelo') AND name = 'Cilindros')
BEGIN
    ALTER TABLE Modelo ADD Cilindros INT NULL;
    PRINT '✓ Columna Cilindros agregada';
END

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Modelo') AND name = 'Valvulas')
BEGIN
    ALTER TABLE Modelo ADD Valvulas INT NULL;
    PRINT '✓ Columna Valvulas agregada';
END

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Modelo') AND name = 'TipoCajaAut')
BEGIN
    ALTER TABLE Modelo ADD TipoCajaAut NVARCHAR(100) NULL;
    PRINT '✓ Columna TipoCajaAut agregada';
END

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Modelo') AND name = 'Asientos')
BEGIN
    ALTER TABLE Modelo ADD Asientos INT NULL;
    PRINT '✓ Columna Asientos agregada';
END

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Modelo') AND name = 'TipoMotor')
BEGIN
    ALTER TABLE Modelo ADD TipoMotor NVARCHAR(100) NULL;
    PRINT '✓ Columna TipoMotor agregada';
END

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Modelo') AND name = 'TipoVehiculoElectrico')
BEGIN
    ALTER TABLE Modelo ADD TipoVehiculoElectrico NVARCHAR(100) NULL;
    PRINT '✓ Columna TipoVehiculoElectrico agregada';
END

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Modelo') AND name = 'PrecioInicial')
BEGIN
    ALTER TABLE Modelo ADD PrecioInicial DECIMAL(18,2) NULL;
    PRINT '✓ Columna PrecioInicial agregada';
END

-- 2. Actualizar columna Estado con nuevos valores
ALTER TABLE Modelo DROP CONSTRAINT IF EXISTS CK_Modelo_Estado;
GO

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

PRINT '✓ Constraint de Estado actualizado con nuevos valores';

-- 3. Actualizar modelos existentes al nuevo sistema
UPDATE Modelo 
SET Estado = 'importado' 
WHERE Estado IN ('IMPORTADO', 'MINIMOS', 'PARA_CORREGIR')
  OR Estado IS NULL;
GO

PRINT '✓ Estados existentes actualizados';
PRINT '';
PRINT 'Resumen:';
SELECT Estado, COUNT(*) as Cantidad
FROM Modelo
GROUP BY Estado
ORDER BY Estado;
GO
```

### 1.3 Script SQL - Nueva Tabla EquipamientoModelo

```sql
-- Archivo: sql/07_recrear_equipamiento_modelo.sql

USE Autodata;
GO

PRINT '====================================';
PRINT 'RECREANDO TABLA EQUIPAMIENTOMODELO';
PRINT 'Con 140+ campos de equipamiento';
PRINT '====================================';
GO

-- Respaldar datos existentes (si existen)
IF OBJECT_ID('EquipamientoModelo_Backup', 'U') IS NOT NULL
    DROP TABLE EquipamientoModelo_Backup;
GO

IF OBJECT_ID('EquipamientoModelo', 'U') IS NOT NULL
BEGIN
    SELECT * INTO EquipamientoModelo_Backup FROM EquipamientoModelo;
    PRINT '✓ Backup de EquipamientoModelo creado';
    
    DROP TABLE EquipamientoModelo;
    PRINT '✓ Tabla EquipamientoModelo antigua eliminada';
END
GO

-- Crear nueva tabla con TODOS los campos
CREATE TABLE EquipamientoModelo (
    EquipamientoID INT IDENTITY(1,1) PRIMARY KEY,
    ModeloID INT NOT NULL UNIQUE,
    
    -- DIMENSIONES Y DATOS TÉCNICOS (15 campos)
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
    
    -- MECÁNICA (9 campos)
    Traccion NVARCHAR(50) NULL,
    Suspension NVARCHAR(200) NULL,
    Caja NVARCHAR(50) NULL,
    MarchasVelocidades NVARCHAR(50) NULL,
    Turbo BIT NULL,
    NumeroPuertas INT NULL,
    Aceite NVARCHAR(100) NULL,
    Norma NVARCHAR(100) NULL,
    StartStop BIT NULL,
    
    -- CONSUMO Y EMISIONES (4 campos)
    CO2_g_km DECIMAL(10,2) NULL,
    ConsumoRuta DECIMAL(10,2) NULL,
    ConsumoUrbano DECIMAL(10,2) NULL,
    ConsumoMixto DECIMAL(10,2) NULL,
    
    -- GARANTÍA (3 campos)
    GarantiaAnios INT NULL,
    GarantiaKm INT NULL,
    GarantiasDiferenciales NVARCHAR(MAX) NULL,
    
    -- VEHÍCULOS ELÉCTRICOS/HÍBRIDOS (12 campos)
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
    
    -- OTROS DATOS (3 campos)
    OtrosDatos NVARCHAR(MAX) NULL,
    TiempoCarga NVARCHAR(200) NULL,
    CodigoFichaTecnica NVARCHAR(100) NULL,
    
    -- CONFORT E INTERIOR (15 campos)
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
    
    -- SEGURIDAD (16 campos)
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
    
    -- CONTROL Y ASISTENCIA (4 campos)
    GripControl BIT NULL,
    LimitadorVelocidad BIT NULL,
    AsistDescensoHDC BIT NULL,
    PaddleShift BIT NULL,
    
    -- MULTIMEDIA (13 campos)
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
    
    -- ASIENTOS (10 campos)
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
    
    -- AJUSTES DE ASIENTOS (8 campos)
    AsientoTraseroAjusteElectrico BIT NULL,
    TerceraFilaAsientosElectricos BIT NULL,
    TipoAlturaAsientoDelantero NVARCHAR(100) NULL,
    SeatAdjustmentMemoryDriver BIT NULL,
    SeatAdjustmentMemoryCoDriver BIT NULL,
    LumbarAdjustmentFrontDriver BIT NULL,
    LumbarAdjustmentFrontCoDriver BIT NULL,
    SeatHeatingRear BIT NULL,
    
    -- TECHO (4 campos)
    Techo NVARCHAR(100) NULL,
    TechoBiTono BIT NULL,
    BarrasTecho BIT NULL,
    NumeroTechosQueSeAbren INT NULL,
    
    -- SENSORES Y CÁMARAS (3 campos)
    SensorEstacionamiento NVARCHAR(100) NULL,
    Camara NVARCHAR(100) NULL,
    SistemaAutomaticoEstacionamiento BIT NULL,
    
    -- ILUMINACIÓN (11 campos)
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
    
    -- MALETERO Y CARGA (7 campos)
    MaleteraAperturaElectrica BIT NULL,
    CapacidadBaul INT NULL,
    CapacidadTanqueCombustible INT NULL,
    ProtectorCaja BIT NULL,
    ParticionCabina BIT NULL,
    NumPuertasLaterales INT NULL,
    PuertaLateralElectrica BIT NULL,
    
    -- CARGA (4 campos)
    CargaUtil_kg INT NULL,
    VolumenUtil_m3 DECIMAL(10,2) NULL,
    TipoAlturaUL NVARCHAR(100) NULL,
    CapacidadCargaCamiones NVARCHAR(200) NULL,
    
    -- SEGURIDAD AVANZADA (6 campos)
    AlertaTraficoCruzadoTrasero BIT NULL,
    AlertaTraficoCruzadoFrontal BIT NULL,
    FrenadoMulticolision BIT NULL,
    HeadUpDisplay BIT NULL,
    CityStop BIT NULL,
    FrenoPeatones BIT NULL,
    
    -- OTROS EQUIPAMIENTO (21 campos)
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
    
    -- Auditoría
    CreadoPorID INT NULL,
    FechaCreacion DATETIME2 NOT NULL DEFAULT GETDATE(),
    ModificadoPorID INT NULL,
    FechaModificacion DATETIME2 NULL,
    
    CONSTRAINT FK_EquipamientoModelo_Modelo FOREIGN KEY (ModeloID) REFERENCES Modelo(ModeloID) ON DELETE CASCADE,
    CONSTRAINT FK_EquipamientoModelo_CreadoPor FOREIGN KEY (CreadoPorID) REFERENCES Usuario(UsuarioID),
    CONSTRAINT FK_EquipamientoModelo_ModificadoPor FOREIGN KEY (ModificadoPorID) REFERENCES Usuario(UsuarioID)
);
GO

CREATE NONCLUSTERED INDEX IX_EquipamientoModelo_ModeloID ON EquipamientoModelo(ModeloID);
GO

PRINT '✓ Tabla EquipamientoModelo recreada con 150+ campos';
PRINT '';
PRINT 'Total de columnas en EquipamientoModelo:';
SELECT COUNT(*) as TotalColumnas FROM sys.columns WHERE object_id = OBJECT_ID('EquipamientoModelo');
GO
```

---

## 📋 FASE 2: BACKEND

### 2.1 Actualizar Modelo.js

Agregar todos los campos nuevos al schema y mappings.

### 2.2 Recrear EquipamientoModelo.js

Crear modelo completamente nuevo con 140+ campos.

### 2.3 Crear validaciones de estados

**Archivo nuevo:** `src/middleware/estadoValidation.js`

```javascript
// Validar campos requeridos por estado
const CAMPOS_REQUERIDOS = {
  datos_minimos: [
    'Segmento', 'Modelo1', 'Tipo2_Carroceria', 'Origen', 
    'Combustible', 'Cilindros', 'Valvulas', 'CC', 'HP', 
    'TipoCajaAut', 'Puertas', 'Asientos', 'TipoMotor', 
    'TipoVehiculoElectrico', 'Importador', 'PrecioInicial'
  ]
};

function validarCamposMinimos(modelo) {
  const faltantes = [];
  CAMPOS_REQUERIDOS.datos_minimos.forEach(campo => {
    if (!modelo[campo]) faltantes.push(campo);
  });
  return faltantes;
}
```

### 2.4 Actualizar modelosController.js

- Agregar endpoint para cambio de estados
- Validar campos antes de transiciones
- Registrar cambios en ModeloHistorial

---

## 📋 FASE 3: FRONTEND

### 3.1 Actualizar types/index.ts

```typescript
export enum ModeloEstado {
  IMPORTADO = 'importado',
  CREADO = 'creado',
  DATOS_MINIMOS = 'datos_minimos',
  REVISION_MINIMOS = 'revision_minimos',
  CORREGIR_MINIMOS = 'corregir_minimos',
  MINIMOS_APROBADOS = 'minimos_aprobados',
  EQUIPAMIENTO_CARGADO = 'equipamiento_cargado',
  REVISION_EQUIPAMIENTO = 'revision_equipamiento',
  CORREGIR_EQUIPAMIENTO = 'corregir_equipamiento',
  DEFINITIVO = 'definitivo',
}

// Actualizar interface Modelo con todos los campos nuevos
```

### 3.2 Crear CargarDatosPage.tsx (Página unificada)

Con tabs/pestañas:
- Tab 1: Datos Mínimos (16 campos)
- Tab 2: Equipamiento (140+ campos)

### 3.3 Crear RevisarPage.tsx (Página unificada de revisión)

Con tabs/pestañas:
- Tab 1: Revisar Datos Mínimos
- Tab 2: Revisar Equipamiento

### 3.4 Actualizar Dashboard

Mostrar contador por estado y filtros.

---

## 📊 RESUMEN DE ARCHIVOS A CREAR/MODIFICAR

### SQL (2 archivos nuevos)
- ✅ `sql/06_actualizar_modelo_nuevo_flujo.sql`
- ✅ `sql/07_recrear_equipamiento_modelo.sql`

### Backend (5 archivos)
- 📝 `src/models/Modelo.js` (modificar)
- 📝 `src/models/EquipamientoModelo.js` (recrear completamente)
- ✨ `src/middleware/estadoValidation.js` (nuevo)
- 📝 `src/controllers/modelosController.js` (modificar)
- 📝 `src/routes/modelosRoutes.js` (agregar endpoints)

### Frontend (10+ archivos)
- 📝 `frontend/src/types/index.ts` (modificar)
- ✨ `frontend/src/pages/CargarDatosPage.tsx` (nuevo)
- ✨ `frontend/src/components/modelos/FormularioDatosMinimos.tsx` (nuevo)
- ✨ `frontend/src/components/equipamiento/FormularioEquipamiento.tsx` (nuevo - 140+ campos!)
- ✨ `frontend/src/pages/RevisarPage.tsx` (nuevo)
- 📝 `frontend/src/pages/DashboardPage.tsx` (modificar)
- 📝 `frontend/src/services/modeloService.ts` (agregar métodos)
- 📝 `frontend/src/App.tsx` (agregar rutas)

---

## ⏱️ ESTIMACIÓN DE TIEMPO

| Fase | Tarea | Tiempo Estimado |
|------|-------|-----------------|
| 1 | Scripts SQL | 2-3 horas |
| 2 | Backend (modelos + validaciones) | 4-5 horas |
| 3 | Frontend (tipos + formularios) | 8-10 horas |
| 4 | Páginas de carga y revisión | 6-8 horas |
| 5 | Dashboard y navegación | 2-3 horas |
| 6 | Pruebas y ajustes | 4-5 horas |
| **TOTAL** | | **26-34 horas** |

---

## 🚀 ORDEN DE IMPLEMENTACIÓN

1. ✅ Crear este documento de plan
2. ⏳ **Ejecutar scripts SQL** (Base de datos primero)
3. ⏳ Actualizar modelos backend
4. ⏳ Crear validaciones de estados
5. ⏳ Actualizar controladores backend
6. ⏳ Actualizar tipos TypeScript frontend
7. ⏳ Crear formulario de datos mínimos
8. ⏳ Crear formulario de equipamiento (masivo!)
9. ⏳ Crear páginas de carga y revisión
10. ⏳ Actualizar dashboard y navegación
11. ⏳ Pruebas completas del flujo

---

**¿APROBADO PARA CONTINUAR?** 

Si estás de acuerdo con este plan, procedo a implementar fase por fase. Si necesitas algún cambio o tienes dudas, dímelo ahora antes de empezar a codificar. 🎯
