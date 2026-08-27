﻿﻿﻿﻿﻿IF (1 = FULLTEXTSERVICEPROPERTY('IsFullTextInstalled'))
begin
EXEC [Autodata].[dbo].[sp_fulltext_database] @action = 'enable'
end
GO
USE [Autodata]
GO
SET QUOTED_IDENTIFIER ON
GO
SET QUOTED_IDENTIFIER OFF
GO



/****** Object:  Table [dbo].[AuditoriaAcceso]    Script Date: 24/4/2026 13:46:04 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[AuditoriaAcceso](
	[AuditoriaID] [int] IDENTITY(1,1) NOT NULL,
	[UsuarioID] [int] NULL,
	[Username] [nvarchar](50) NOT NULL,
	[Accion] [nvarchar](50) NOT NULL,
	[FechaHora] [datetime2](7) NOT NULL,
	[IpAddress] [nvarchar](50) NULL,
	[UserAgent] [nvarchar](500) NULL,
	[Exitoso] [bit] NOT NULL,
	[MensajeError] [nvarchar](500) NULL,
	[Metadata] [nvarchar](max) NULL,
PRIMARY KEY CLUSTERED 
(
	[AuditoriaID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  View [dbo].[vw_LoginsFallidos]    Script Date: 24/4/2026 13:46:04 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER OFF
GO

CREATE VIEW [dbo].[vw_LoginsFallidos] AS
SELECT 
    Username,
    IpAddress,
    COUNT(*) as Intentos,
    MAX(FechaHora) as UltimoIntento,
    MIN(FechaHora) as PrimerIntento
FROM AuditoriaAcceso
WHERE Accion = 'login_fallido'
  AND FechaHora >= DATEADD(HOUR, -24, GETDATE())
GROUP BY Username, IpAddress
HAVING COUNT(*) >= 3;
GO
/****** Object:  Table [dbo].[Marca]    Script Date: 24/4/2026 13:46:04 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Marca](
	[MarcaID] [int] IDENTITY(1,1) NOT NULL,
	[CodigoMarca] [nvarchar](50) NOT NULL,
	[Descripcion] [nvarchar](200) NOT NULL,
	[ShortName] [nvarchar](100) NULL,
	[Origen] [nvarchar](100) NULL,
	[CodigoOrigen] [nvarchar](50) NULL,
	[FechaCreacion] [datetime] NULL,
PRIMARY KEY CLUSTERED 
(
	[MarcaID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Modelo]    Script Date: 24/4/2026 13:46:04 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Modelo](
	[ModeloID] [int] IDENTITY(1,1) NOT NULL,
	[MarcaID] [int] NOT NULL,
	[CodigoModelo] [nvarchar](50) NULL,
	[DescripcionModelo] [nvarchar](200) NULL,
	[CategoriaCodigo] [nvarchar](50) NULL,
	[CombustibleCodigo] [nvarchar](50) NULL,
	[OrigenCodigo] [nvarchar](50) NULL,
	[ShortName] [nvarchar](100) NULL,
	[Precio0KMInicial] [decimal](18, 2) NULL,
	[Familia] [nvarchar](200) NULL,
	[Anio] [int] NULL,
	[Tipo] [nvarchar](100) NULL,
	[Tipo2] [nvarchar](100) NULL,
	[CC] [int] NULL,
	[HP] [int] NULL,
	[Traccion] [nvarchar](50) NULL,
	[Caja] [nvarchar](100) NULL,
	[TipoCaja] [nvarchar](100) NULL,
	[Turbo] [bit] NULL,
	[Puertas] [int] NULL,
	[Pasajeros] [int] NULL,
	[TipoVehiculo] [nvarchar](50) NULL,
	[SegmentacionAutodata] [nvarchar](100) NULL,
	[SegmentacionGM] [nvarchar](100) NULL,
	[SegmentacionAudi] [nvarchar](100) NULL,
	[SegmentacionSBI] [nvarchar](100) NULL,
	[SegmentacionCitroen] [nvarchar](100) NULL,
	[Importador] [nvarchar](200) NULL,
	[Estado] [nvarchar](50) NULL,
	[FechaCreacion] [datetime] NULL,
	[EstadoID] [int] NULL,
	[Activo] [bit] NOT NULL,
	[observaciones] [nvarchar](max) NULL,
	[CodigoAutodata] [char](8) NULL,
	[UltimoComentario] [nvarchar](max) NULL,
	[Modelo1] [nvarchar](200) NULL,
	[Carroceria] [nvarchar](100) NULL,
	[Cilindros] [int] NULL,
	[Valvulas] [int] NULL,
	[TipoCajaAut] [nvarchar](100) NULL,
	[Asientos] [int] NULL,
	[TipoMotor] [nvarchar](100) NULL,
	[TipoVehiculoElectrico] [nvarchar](100) NULL,
	[PrecioInicial] [decimal](18, 2) NULL,
	[ObservacionesRevision] [nvarchar](max) NULL,
	[FechaModificacion] [datetime2](7) NULL,
	[ModificadoPorID] [int] NULL,
	[FamiliaID] [int] NULL,
PRIMARY KEY CLUSTERED 
(
	[ModeloID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[PrecioModelo]    Script Date: 24/4/2026 13:46:04 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[PrecioModelo](
	[PrecioID] [int] IDENTITY(1,1) NOT NULL,
	[ModeloID] [int] NOT NULL,
	[Precio] [decimal](18, 2) NOT NULL,
	[Moneda] [nvarchar](10) NULL,
	[FechaVigenciaDesde] [date] NOT NULL,
	[FechaVigenciaHasta] [date] NULL,
	[Fuente] [nvarchar](200) NULL,
	[FechaCarga] [datetime] NULL,
PRIMARY KEY CLUSTERED 
(
	[PrecioID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[ModeloEstado]    Script Date: 24/4/2026 13:46:04 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[ModeloEstado](
	[ModeloEstadoID] [int] IDENTITY(1,1) NOT NULL,
	[ModeloID] [int] NOT NULL,
	[EstadoAnterior] [nvarchar](50) NULL,
	[EstadoNuevo] [nvarchar](50) NOT NULL,
	[UsuarioID] [int] NULL,
	[Observaciones] [nvarchar](max) NULL,
	[FechaCambio] [datetime2](7) NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[ModeloEstadoID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  View [dbo].[v_ModeloDetalle]    Script Date: 24/4/2026 13:46:04 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE   VIEW [dbo].[v_ModeloDetalle] AS
SELECT  
    m.MarcaID,
    m.CodigoMarca,
    m.Descripcion AS NombreMarca,

    mo.ModeloID,
    mo.CodigoModelo,
    mo.DescripcionModelo AS NombreModelo,
    mo.ShortName,
    mo.CategoriaCodigo,
    mo.CombustibleCodigo,
    mo.OrigenCodigo,

    est.EstadoID,
    est.NombreEstado AS Estado,

    p.Precio,
    p.Moneda,
    p.FechaVigenciaDesde,
    p.FechaVigenciaHasta,
    p.Fuente

FROM dbo.Modelo mo
INNER JOIN dbo.Marca m
    ON mo.MarcaID = m.MarcaID

LEFT JOIN dbo.ModeloEstado est
    ON mo.EstadoID = est.EstadoID     -- ← CORRECTO

LEFT JOIN dbo.PrecioModelo p
    ON p.ModeloID = mo.ModeloID;      -- ← PRECIO POR MODELO
GO
/****** Object:  Table [dbo].[Departamento]    Script Date: 24/4/2026 13:46:04 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Departamento](
	[DepartamentoID] [int] IDENTITY(1,1) NOT NULL,
	[Codigo] [nvarchar](10) NOT NULL,
	[Nombre] [nvarchar](100) NOT NULL,
	[Pais] [nvarchar](100) NOT NULL,
	[Activo] [bit] NOT NULL,
	[FechaCreacion] [datetime2](7) NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[DepartamentoID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY],
UNIQUE NONCLUSTERED 
(
	[Codigo] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY],
UNIQUE NONCLUSTERED 
(
	[Nombre] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Empadronamiento]    Script Date: 24/4/2026 13:46:04 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Empadronamiento](
	[EmpadronamientoID] [int] IDENTITY(1,1) NOT NULL,
	[ModeloID] [int] NOT NULL,
	[DepartamentoID] [int] NOT NULL,
	[Cantidad] [int] NOT NULL,
	[Periodo] [nvarchar](7) NOT NULL,
	[Anio] [int] NOT NULL,
	[Mes] [int] NOT NULL,
	[CreadoPorID] [int] NOT NULL,
	[FechaCreacion] [datetime2](7) NOT NULL,
	[ModificadoPorID] [int] NULL,
	[FechaModificacion] [datetime2](7) NULL,
PRIMARY KEY CLUSTERED 
(
	[EmpadronamientoID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY],
 CONSTRAINT [UQ_Empadronamiento_Modelo_Dpto_Periodo] UNIQUE NONCLUSTERED 
(
	[ModeloID] ASC,
	[DepartamentoID] ASC,
	[Periodo] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[EquipamientoModelo]    Script Date: 24/4/2026 13:46:04 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[EquipamientoModelo](
	[EquipamientoID] [int] IDENTITY(1,1) NOT NULL,
	[ModeloID] [int] NOT NULL,
	[Largo] [int] NULL,
	[Ancho] [int] NULL,
	[Altura] [int] NULL,
	[DistanciaEjes] [int] NULL,
	[PesoOrdenMarcha] [int] NULL,
	[KgPorHP] [decimal](10, 2) NULL,
	[Neumaticos] [nvarchar](100) NULL,
	[LlantasAleacion] [bit] NULL,
	[DiametroLlantas] [decimal](4, 1) NULL,
	[TPMS] [bit] NULL,
	[KitInflableAntiPinchazo] [bit] NULL,
	[RuedaAuxHomogenea] [nvarchar](50) NULL,
	[Cilindros] [int] NULL,
	[Valvulas] [int] NULL,
	[Inyeccion] [nvarchar](50) NULL,
	[Traccion] [nvarchar](50) NULL,
	[Suspension] [nvarchar](200) NULL,
	[Caja] [nvarchar](50) NULL,
	[MarchasVelocidades] [nvarchar](50) NULL,
	[Turbo] [bit] NULL,
	[NumeroPuertas] [int] NULL,
	[Aceite] [nvarchar](100) NULL,
	[Norma] [nvarchar](100) NULL,
	[StartStop] [bit] NULL,
	[CO2_g_km] [decimal](10, 2) NULL,
	[ConsumoRuta] [decimal](10, 2) NULL,
	[ConsumoUrbano] [decimal](10, 2) NULL,
	[ConsumoMixto] [decimal](10, 2) NULL,
	[GarantiaAnios] [int] NULL,
	[GarantiaKm] [int] NULL,
	[GarantiasDiferenciales] [nvarchar](max) NULL,
	[TipoVehiculoElectrico] [nvarchar](100) NULL,
	[EPedal] [nvarchar](150) NULL,
	[CapacidadTanqueHidrogeno] [nvarchar](50) NULL,
	[AutonomiaMaxRange] [nvarchar](50) NULL,
	[CicloNorma] [nvarchar](100) NULL,
	[PotenciaMotor] [nvarchar](50) NULL,
	[CapacidadOperativaBateria] [nvarchar](50) NULL,
	[ParMotorTorque] [int] NULL,
	[PotenciaCargaMax] [nvarchar](50) NULL,
	[TiposConectores] [nvarchar](200) NULL,
	[GarantiaCapBat] [nvarchar](200) NULL,
	[TecnologiaBat] [nvarchar](200) NULL,
	[OtrosDatos] [nvarchar](max) NULL,
	[TiempoCarga] [nvarchar](200) NULL,
	[CodigoFichaTecnica] [nvarchar](100) NULL,
	[SistemaClimatizacion] [nvarchar](100) NULL,
	[Direccion] [nvarchar](100) NULL,
	[TipoBloqueo] [nvarchar](100) NULL,
	[KeylessSmartKey] [bit] NULL,
	[LevantaVidrios] [nvarchar](50) NULL,
	[EspejosElectricos] [bit] NULL,
	[EspejoInteriorElectrocromado] [bit] NULL,
	[EspejosAbatiblesElectricamente] [bit] NULL,
	[Tapizado] [nvarchar](100) NULL,
	[VolanteRevestidoCuero] [bit] NULL,
	[TablerDigital] [bit] NULL,
	[Computadora] [bit] NULL,
	[GPS] [bit] NULL,
	[VelocidadCrucero] [nvarchar](150) NULL,
	[Inmovilizador] [bit] NULL,
	[Alarma] [bit] NULL,
	[ABAG] [nvarchar](150) NULL,
	[SRI] [bit] NULL,
	[ABS] [bit] NULL,
	[EBD_EBV_REF] [bit] NULL,
	[DiscosFrenos] [nvarchar](100) NULL,
	[FrenoEstacionamientoElectrico] [bit] NULL,
	[ESP_ControlEstabilidad] [bit] NULL,
	[ControlTraccion] [bit] NULL,
	[AsistFrenadoDetectorDistancia] [bit] NULL,
	[AsistPendiente] [bit] NULL,
	[DetectorCambioFila] [bit] NULL,
	[DetectorPuntoCiego] [bit] NULL,
	[TrafficSignRecognition] [bit] NULL,
	[DriverAttentionControl] [bit] NULL,
	[DetectorLluvia] [bit] NULL,
	[GripControl] [bit] NULL,
	[LimitadorVelocidad] [bit] NULL,
	[AsistDescensoHDC] [bit] NULL,
	[PaddleShift] [bit] NULL,
	[ComandoAudioVolante] [bit] NULL,
	[CD] [bit] NULL,
	[MP3] [bit] NULL,
	[USB] [bit] NULL,
	[Bluetooth] [bit] NULL,
	[DVD] [bit] NULL,
	[MirrorScreen] [bit] NULL,
	[SistemaMultimedia] [nvarchar](200) NULL,
	[PantallaMultimediaPulgadas] [decimal](4, 1) NULL,
	[PantallaTactil] [bit] NULL,
	[CargadorSmartphoneInduccion] [bit] NULL,
	[KitHiFi] [nvarchar](100) NULL,
	[Radio] [bit] NULL,
	[NumeroAsientos] [int] NULL,
	[AsientoElectricoCalefMasaje] [bit] NULL,
	[AsientosRango2y3] [nvarchar](100) NULL,
	[Asiento2Mas1] [bit] NULL,
	[ButacaElectrica] [bit] NULL,
	[AsientoVentilado] [bit] NULL,
	[AsientosMasajeador] [int] NULL,
	[ApoyabrazosDelantero] [bit] NULL,
	[ApoyabrazosCentralTrasero] [bit] NULL,
	[SoporteMusloDelantero] [bit] NULL,
	[AsientoTraseroAjusteElectrico] [bit] NULL,
	[TerceraFilaAsientosElectricos] [bit] NULL,
	[TipoAlturaAsientoDelantero] [nvarchar](100) NULL,
	[SeatAdjustmentMemoryDriver] [bit] NULL,
	[SeatAdjustmentMemoryCoDriver] [bit] NULL,
	[LumbarAdjustmentFrontDriver] [bit] NULL,
	[LumbarAdjustmentFrontCoDriver] [bit] NULL,
	[SeatHeatingRear] [bit] NULL,
	[Techo] [nvarchar](100) NULL,
	[TechoBiTono] [bit] NULL,
	[BarrasTecho] [bit] NULL,
	[NumeroTechosQueSeAbren] [int] NULL,
	[SensorEstacionamiento] [nvarchar](100) NULL,
	[Camara] [nvarchar](100) NULL,
	[SistemaAutomaticoEstacionamiento] [bit] NULL,
	[FarosNeblina] [bit] NULL,
	[FarosDireccionales] [bit] NULL,
	[FarosFullLED] [bit] NULL,
	[FarosHalogenosDRL_LED] [bit] NULL,
	[FarosXenonLimpiadores] [bit] NULL,
	[PackVisibilidad] [bit] NULL,
	[PasoLucesCruzRutaAutomatica] [bit] NULL,
	[VisionNocturna] [bit] NULL,
	[FarosMatrix] [bit] NULL,
	[LucesTraserasLED] [bit] NULL,
	[LucesTraserasOLED] [bit] NULL,
	[MaleteraAperturaElectrica] [nvarchar](150) NULL,
	[CapacidadBaul] [int] NULL,
	[CapacidadTanqueCombustible] [int] NULL,
	[ProtectorCaja] [bit] NULL,
	[ParticionCabina] [bit] NULL,
	[NumPuertasLaterales] [int] NULL,
	[PuertaLateralElectrica] [bit] NULL,
	[CargaUtil_kg] [int] NULL,
	[VolumenUtil_m3] [decimal](10, 2) NULL,
	[TipoAlturaUL] [nvarchar](100) NULL,
	[CapacidadCargaCamiones] [nvarchar](200) NULL,
	[AlertaTraficoCruzadoTrasero] [bit] NULL,
	[AlertaTraficoCruzadoFrontal] [bit] NULL,
	[FrenadoMulticolision] [bit] NULL,
	[HeadUpDisplay] [bit] NULL,
	[CityStop] [bit] NULL,
	[FrenoPeatones] [bit] NULL,
	[BloqueDiferencialTerreno] [nvarchar](100) NULL,
	[DesempaniadorElectrico] [bit] NULL,
	[IluminacionAmbiental] [bit] NULL,
	[LimpiaLavaParabrisasTrasero] [bit] NULL,
	[BlackWheelFrame] [bit] NULL,
	[VolanteMultifuncion] [bit] NULL,
	[TablerDigital3D] [bit] NULL,
	[AceleracionBEV_0a100] [decimal](5, 2) NULL,
	[AccelerationICE] [decimal](5, 2) NULL,
	[CargaElectricaWireless] [bit] NULL,
	[CargaElectricaInduccion] [bit] NULL,
	[CableElectricoTipo3Incluido] [bit] NULL,
	[ChassisDriveSelect] [bit] NULL,
	[ChassisSportSuspension] [bit] NULL,
	[DireccionCuatroRuedas] [bit] NULL,
	[LucesLaser] [bit] NULL,
	[DashboardDisplayConfigurable] [bit] NULL,
	[WirelessSmartphoneIntegration] [bit] NULL,
	[MobilePhoneAntenna] [bit] NULL,
	[DeflectorViento] [bit] NULL,
	[AsientosDeportivos] [bit] NULL,
	[CreadoPorID] [int] NULL,
	[FechaCreacion] [datetime2](7) NOT NULL,
	[ModificadoPorID] [int] NULL,
	[FechaModificacion] [datetime2](7) NULL,
	[TIPO2Carrocera] [nvarchar](100) NULL,
	[ORIGEN] [nvarchar](100) NULL,
	[COMBUSTIBLE] [nvarchar](100) NULL,
	[DistEjes] [decimal](10, 2) NULL,
	[Pesoenordendemarcha] [decimal](10, 2) NULL,
	[kghp] [nvarchar](100) NULL,
	[Neumticos] [decimal](10, 2) NULL,
	[Llantasdealeacin] [bit] NULL,
	[Dimetrollantas] [int] NULL,
	[TPMSMonitoreopresindeneumticos] [bit] NULL,
	[Ruedaauxhomogeneo] [nvarchar](50) NULL,
	[Vlvulas] [int] NULL,
	[HPCV] [decimal](10, 2) NULL,
	[Iny] [nvarchar](100) NULL,
	[Traccin] [nvarchar](100) NULL,
	[Suspensin] [nvarchar](100) NULL,
	[Ndepuertas] [int] NULL,
	[Consumorutal100km] [decimal](10, 2) NULL,
	[Consumourbanol100km] [decimal](10, 2) NULL,
	[Consumomixtol100km] [decimal](10, 2) NULL,
	[Garantaenaos] [int] NULL,
	[GarantaenKm] [int] NULL,
	[Garantasdiferenciales] [bit] NULL,
	[TipodeVehiculoElectricoHibrido] [nvarchar](100) NULL,
	[CapTanqueHidrgeno] [bit] NULL,
	[AutonomaMaxRangeenkilometros] [int] NULL,
	[PotenciamotorKW] [decimal](10, 2) NULL,
	[CapoperativabatBatterycapacityKwh] [decimal](10, 2) NULL,
	[PardelMotortorqueNm] [int] NULL,
	[PotenciadecargaPotMxKWenCA] [decimal](10, 2) NULL,
	[Tiposdeconectores] [nvarchar](100) NULL,
	[GarantacapBat] [decimal](10, 2) NULL,
	[TecnologaBatmateriales] [nvarchar](100) NULL,
	[Sistemadeclimatizacin] [nvarchar](100) NULL,
	[Direccin] [nvarchar](100) NULL,
	[Tipodebloqueo] [nvarchar](100) NULL,
	[KeylessoSmartkey] [bit] NULL,
	[Espejoselct] [bit] NULL,
	[VolanterevestidoenCuero] [bit] NULL,
	[Tablerodigital] [bit] NULL,
	[Velcrucero] [nvarchar](150) NULL,
	[Inmobilizador] [bit] NULL,
	[SRISistemaderetencininfantil] [nvarchar](100) NULL,
	[EBDEBVREFDistribucinelectdefrenada] [bit] NULL,
	[FrenoEstacionamentoElectricoEPB] [bit] NULL,
	[Controltraccin] [bit] NULL,
	[Detcambiodefila] [bit] NULL,
	[Detpuntociego] [bit] NULL,
	[Comandoaudioenvolante] [bit] NULL,
	[MirrorScreenSmartphoneDisplay] [bit] NULL,
	[SistMultimedia] [nvarchar](100) NULL,
	[PantMultimedia] [decimal](10, 2) NULL,
	[CargadorSmartphoneconinduccin] [bit] NULL,
	[KitHiFiBoseJBLFocal] [bit] NULL,
	[Nmerodeasientos] [int] NULL,
	[AsientoelectCalefMasaje] [nvarchar](150) NULL,
	[asiento21] [bit] NULL,
	[ButElectr] [decimal](10, 2) NULL,
	[Barrasdetecho] [bit] NULL,
	[Cmara] [nvarchar](100) NULL,
	[Sistautomticodeestacionamento] [bit] NULL,
	[Farosdeneblina] [bit] NULL,
	[FaroshalgenosDRLLEDDiurnas] [bit] NULL,
	[FarosxenonLimpadores] [bit] NULL,
	[PackVisibilidadEncendidoautofaros] [bit] NULL,
	[PasodelucesCruzrutaautomtica] [bit] NULL,
	[Visinnocturna] [bit] NULL,
	[Maleteraaperturaelctrica] [nvarchar](100) NULL,
	[CapBal] [int] NULL,
	[CapTanquecombustible] [int] NULL,
	[Particindecabina] [nvarchar](100) NULL,
	[NPuertasLat] [nvarchar](100) NULL,
	[PuertalatElctrica] [nvarchar](100) NULL,
	[CargatilKg] [decimal](10, 2) NULL,
	[Volumentilm3] [decimal](10, 2) NULL,
	[limitadordevelocidad] [bit] NULL,
	[Alertadetrficocruzadotrasero] [bit] NULL,
	[Alertadetrficocruzadofrontal] [bit] NULL,
	[Frenadomulticolisin] [bit] NULL,
	[Apoyabrazodelantero] [bit] NULL,
	[Bloqueodiferencialporterreno] [bit] NULL,
	[Nmerodetechosqueseabren] [int] NULL,
	[Asientosconmasajeadornmero] [int] NULL,
	[AutonomadelmotorelctricoBEVyPHEV] [int] NULL,
	[Frenodepeatones] [bit] NULL,
	[Desempaadorelctrico] [bit] NULL,
	[Iluminacinambiental] [bit] NULL,
	[Limpialavaparabrisastraseroelct] [bit] NULL,
	[Apoyabrazocentraldeasientotrasero] [bit] NULL,
	[Soporteparamuslodelantero] [bit] NULL,
	[Asientotraseroconajusteelctrico] [bit] NULL,
	[C_3raFiladeasientoselctricos] [bit] NULL,
	[Volantemultifuncin] [bit] NULL,
	[Tablerodigital3D] [bit] NULL,
	[Cargaelectricaporwireless] [bit] NULL,
	[Cargaelectricaporinduccion] [bit] NULL,
	[Direccionenlascuatroruedas] [bit] NULL,
	[LucestrasOLED] [bit] NULL,
	[Deflectordeviento] [bit] NULL,
	[LumbarLumbaradjustmentfrontDriver] [bit] NULL,
	[LumbarLumbaradjustmentfrontCoDriver] [bit] NULL,
	[Precioafechadecarga] [int] NULL,
PRIMARY KEY CLUSTERED 
(
	[EquipamientoID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY],
UNIQUE NONCLUSTERED 
(
	[ModeloID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
SET QUOTED_IDENTIFIER ON
GO
/****** Object:  Table [dbo].[EstadoCatalogo]    Script Date: 24/4/2026 13:46:04 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[EstadoCatalogo](
	[EstadoID] [int] IDENTITY(1,1) NOT NULL,
	[NombreEstado] [nvarchar](100) NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[EstadoID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Familia]    Script Date: 24/4/2026 13:46:04 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Familia](
	[FamiliaID] [int] IDENTITY(1,1) NOT NULL,
	[MarcaID] [int] NOT NULL,
	[Nombre] [nvarchar](100) NOT NULL,
	[Descripcion] [nvarchar](500) NULL,
	[Activo] [bit] NOT NULL,
	[FechaCreacion] [datetime2](7) NOT NULL,
	[FechaModificacion] [datetime2](7) NULL,
PRIMARY KEY CLUSTERED 
(
	[FamiliaID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY],
 CONSTRAINT [UQ_Familia_Marca_Nombre] UNIQUE NONCLUSTERED 
(
	[MarcaID] ASC,
	[Nombre] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[ModeloHistorial]    Script Date: 24/4/2026 13:46:04 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[ModeloHistorial](
	[HistorialID] [int] IDENTITY(1,1) NOT NULL,
	[ModeloID] [int] NOT NULL,
	[Campo] [nvarchar](200) NOT NULL,
	[ValorAnterior] [nvarchar](max) NULL,
	[ValorNuevo] [nvarchar](max) NULL,
	[FechaCambio] [datetime] NULL,
	[Usuario] [nvarchar](200) NULL,
PRIMARY KEY CLUSTERED 
(
	[HistorialID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[PrecioVersion]    Script Date: 24/4/2026 13:46:04 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[PrecioVersion](
	[PrecioID] [int] IDENTITY(1,1) NOT NULL,
	[VersionID] [int] NOT NULL,
	[Precio] [decimal](18, 2) NOT NULL,
	[Moneda] [nvarchar](20) NOT NULL,
	[FechaVigenciaDesde] [date] NULL,
	[FechaVigenciaHasta] [date] NULL,
	[Fuente] [nvarchar](400) NULL,
	[FechaCarga] [datetime] NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[PrecioID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[RefreshToken]    Script Date: 24/4/2026 13:46:04 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[RefreshToken](
	[RefreshTokenID] [int] IDENTITY(1,1) NOT NULL,
	[UsuarioID] [int] NOT NULL,
	[Token] [nvarchar](500) NOT NULL,
	[ExpiresAt] [datetime2](7) NOT NULL,
	[CreatedAt] [datetime2](7) NOT NULL,
	[RevokedAt] [datetime2](7) NULL,
	[IsRevoked] [bit] NOT NULL,
	[ReplacedByToken] [nvarchar](500) NULL,
	[DeviceInfo] [nvarchar](500) NULL,
	[IpAddress] [nvarchar](50) NULL,
PRIMARY KEY CLUSTERED 
(
	[RefreshTokenID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY],
UNIQUE NONCLUSTERED 
(
	[Token] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Usuario]    Script Date: 24/4/2026 13:46:04 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Usuario](
	[UsuarioID] [int] IDENTITY(1,1) NOT NULL,
	[Username] [nvarchar](50) NOT NULL,
	[Password] [nvarchar](255) NOT NULL,
	[Nombre] [nvarchar](100) NOT NULL,
	[Email] [nvarchar](100) NOT NULL,
	[Rol] [nvarchar](50) NOT NULL,
	[Activo] [bit] NOT NULL,
	[FechaCreacion] [datetime2](7) NOT NULL,
	[FechaUltimoAcceso] [datetime2](7) NULL,
PRIMARY KEY CLUSTERED 
(
	[UsuarioID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY],
UNIQUE NONCLUSTERED 
(
	[Username] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY],
UNIQUE NONCLUSTERED 
(
	[Email] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Venta]    Script Date: 24/4/2026 13:46:04 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Venta](
	[VentaID] [int] IDENTITY(1,1) NOT NULL,
	[ModeloID] [int] NOT NULL,
	[Cantidad] [int] NOT NULL,
	[Periodo] [nvarchar](7) NOT NULL,
	[Anio] [int] NOT NULL,
	[Mes] [int] NOT NULL,
	[CreadoPorID] [int] NOT NULL,
	[FechaCreacion] [datetime2](7) NOT NULL,
	[ModificadoPorID] [int] NULL,
	[FechaModificacion] [datetime2](7) NULL,
PRIMARY KEY CLUSTERED 
(
	[VentaID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY],
 CONSTRAINT [UQ_Venta_Modelo_Periodo] UNIQUE NONCLUSTERED 
(
	[ModeloID] ASC,
	[Periodo] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[VentasModelo]    Script Date: 24/4/2026 13:46:04 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[VentasModelo](
	[VentaID] [int] IDENTITY(1,1) NOT NULL,
	[ModeloID] [int] NOT NULL,
	[Anio] [int] NOT NULL,
	[Mes] [int] NOT NULL,
	[UnidadesVendidas] [int] NOT NULL,
	[Fuente] [nvarchar](200) NULL,
	[FechaCarga] [datetime] NULL,
PRIMARY KEY CLUSTERED 
(
	[VentaID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[VersionEstado]    Script Date: 24/4/2026 13:46:04 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[VersionEstado](
	[EstadoID] [int] IDENTITY(1,1) NOT NULL,
	[NombreEstado] [nvarchar](200) NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[EstadoID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[VersionModelo]    Script Date: 24/4/2026 13:46:04 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[VersionModelo](
	[VersionID] [int] IDENTITY(1,1) NOT NULL,
	[ModeloID] [int] NOT NULL,
	[CodigoVersion] [nvarchar](100) NOT NULL,
	[Descripcion] [nvarchar](200) NOT NULL,
	[Equipamiento] [nvarchar](400) NULL,
	[OrigenCodigo] [nvarchar](100) NULL,
	[FechaCarga] [datetime] NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[VersionID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [IX_AuditoriaAcceso_Accion]    Script Date: 24/4/2026 13:46:04 ******/
CREATE NONCLUSTERED INDEX [IX_AuditoriaAcceso_Accion] ON [dbo].[AuditoriaAcceso]
(
	[Accion] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Object:  Index [IX_AuditoriaAcceso_Exitoso]    Script Date: 24/4/2026 13:46:04 ******/
CREATE NONCLUSTERED INDEX [IX_AuditoriaAcceso_Exitoso] ON [dbo].[AuditoriaAcceso]
(
	[Exitoso] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Object:  Index [IX_AuditoriaAcceso_FechaHora]    Script Date: 24/4/2026 13:46:04 ******/
CREATE NONCLUSTERED INDEX [IX_AuditoriaAcceso_FechaHora] ON [dbo].[AuditoriaAcceso]
(
	[FechaHora] DESC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [IX_AuditoriaAcceso_IpAddress]    Script Date: 24/4/2026 13:46:04 ******/
CREATE NONCLUSTERED INDEX [IX_AuditoriaAcceso_IpAddress] ON [dbo].[AuditoriaAcceso]
(
	[IpAddress] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [IX_AuditoriaAcceso_Username]    Script Date: 24/4/2026 13:46:04 ******/
CREATE NONCLUSTERED INDEX [IX_AuditoriaAcceso_Username] ON [dbo].[AuditoriaAcceso]
(
	[Username] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Object:  Index [IX_AuditoriaAcceso_Usuario]    Script Date: 24/4/2026 13:46:04 ******/
CREATE NONCLUSTERED INDEX [IX_AuditoriaAcceso_Usuario] ON [dbo].[AuditoriaAcceso]
(
	[UsuarioID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Object:  Index [IX_Departamento_Activo]    Script Date: 24/4/2026 13:46:04 ******/
CREATE NONCLUSTERED INDEX [IX_Departamento_Activo] ON [dbo].[Departamento]
(
	[Activo] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [IX_Departamento_Codigo]    Script Date: 24/4/2026 13:46:04 ******/
CREATE NONCLUSTERED INDEX [IX_Departamento_Codigo] ON [dbo].[Departamento]
(
	[Codigo] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [IX_Departamento_Nombre]    Script Date: 24/4/2026 13:46:04 ******/
CREATE NONCLUSTERED INDEX [IX_Departamento_Nombre] ON [dbo].[Departamento]
(
	[Nombre] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Object:  Index [IX_Empadronamiento_ModeloID]    Script Date: 24/4/2026 13:46:04 ******/
CREATE NONCLUSTERED INDEX [IX_Empadronamiento_ModeloID] ON [dbo].[Empadronamiento]
(
	[ModeloID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Object:  Index [IX_EquipamientoModelo_FechaCreacion]    Script Date: 24/4/2026 13:46:04 ******/
CREATE NONCLUSTERED INDEX [IX_EquipamientoModelo_FechaCreacion] ON [dbo].[EquipamientoModelo]
(
	[FechaCreacion] DESC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Object:  Index [IX_EquipamientoModelo_ModeloID]    Script Date: 24/4/2026 13:46:04 ******/
CREATE NONCLUSTERED INDEX [IX_EquipamientoModelo_ModeloID] ON [dbo].[EquipamientoModelo]
(
	[ModeloID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Object:  Index [IX_Familia_Activo]    Script Date: 24/4/2026 13:46:04 ******/
CREATE NONCLUSTERED INDEX [IX_Familia_Activo] ON [dbo].[Familia]
(
	[Activo] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Object:  Index [IX_Familia_MarcaID]    Script Date: 24/4/2026 13:46:04 ******/
CREATE NONCLUSTERED INDEX [IX_Familia_MarcaID] ON [dbo].[Familia]
(
	[MarcaID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [IX_Familia_Nombre]    Script Date: 24/4/2026 13:46:04 ******/
CREATE NONCLUSTERED INDEX [IX_Familia_Nombre] ON [dbo].[Familia]
(
	[Nombre] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Object:  Index [IX_Modelo_FamiliaID]    Script Date: 24/4/2026 13:46:04 ******/
CREATE NONCLUSTERED INDEX [IX_Modelo_FamiliaID] ON [dbo].[Modelo]
(
	[FamiliaID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Object:  Index [IX_ModeloEstado_FechaCambio]    Script Date: 24/4/2026 13:46:04 ******/
CREATE NONCLUSTERED INDEX [IX_ModeloEstado_FechaCambio] ON [dbo].[ModeloEstado]
(
	[FechaCambio] DESC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Object:  Index [IX_ModeloEstado_ModeloID]    Script Date: 24/4/2026 13:46:04 ******/
CREATE NONCLUSTERED INDEX [IX_ModeloEstado_ModeloID] ON [dbo].[ModeloEstado]
(
	[ModeloID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Object:  Index [IX_RefreshToken_ExpiresAt]    Script Date: 24/4/2026 13:46:04 ******/
CREATE NONCLUSTERED INDEX [IX_RefreshToken_ExpiresAt] ON [dbo].[RefreshToken]
(
	[ExpiresAt] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Object:  Index [IX_RefreshToken_IsRevoked]    Script Date: 24/4/2026 13:46:04 ******/
CREATE NONCLUSTERED INDEX [IX_RefreshToken_IsRevoked] ON [dbo].[RefreshToken]
(
	[IsRevoked] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [IX_RefreshToken_Token]    Script Date: 24/4/2026 13:46:04 ******/
CREATE NONCLUSTERED INDEX [IX_RefreshToken_Token] ON [dbo].[RefreshToken]
(
	[Token] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Object:  Index [IX_RefreshToken_Usuario]    Script Date: 24/4/2026 13:46:04 ******/
CREATE NONCLUSTERED INDEX [IX_RefreshToken_Usuario] ON [dbo].[RefreshToken]
(
	[UsuarioID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [IX_Usuario_Email]    Script Date: 24/4/2026 13:46:04 ******/
CREATE NONCLUSTERED INDEX [IX_Usuario_Email] ON [dbo].[Usuario]
(
	[Email] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [IX_Usuario_Rol]    Script Date: 24/4/2026 13:46:04 ******/
CREATE NONCLUSTERED INDEX [IX_Usuario_Rol] ON [dbo].[Usuario]
(
	[Rol] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [IX_Usuario_Username]    Script Date: 24/4/2026 13:46:04 ******/
CREATE NONCLUSTERED INDEX [IX_Usuario_Username] ON [dbo].[Usuario]
(
	[Username] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Object:  Index [IX_Venta_ModeloID]    Script Date: 24/4/2026 13:46:04 ******/
CREATE NONCLUSTERED INDEX [IX_Venta_ModeloID] ON [dbo].[Venta]
(
	[ModeloID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [IX_Venta_Periodo]    Script Date: 24/4/2026 13:46:04 ******/
CREATE NONCLUSTERED INDEX [IX_Venta_Periodo] ON [dbo].[Venta]
(
	[Periodo] DESC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Object:  Index [IX_Claudio_Modelos_Batch]    Script Date: 24/4/2026 13:46:04 ******/

SET ANSI_PADDING ON
GO
/****** Object:  Index [IX_Claudio_Modelos_Status]    Script Date: 24/4/2026 13:46:04 ******/

/****** Object:  Index [IX_Claudio_Modelos_Timestamp]    Script Date: 24/4/2026 13:46:04 ******/

ALTER TABLE [dbo].[AuditoriaAcceso] ADD  DEFAULT (getdate()) FOR [FechaHora]
GO
ALTER TABLE [dbo].[Departamento] ADD  DEFAULT ('Uruguay') FOR [Pais]
GO
ALTER TABLE [dbo].[Departamento] ADD  DEFAULT ((1)) FOR [Activo]
GO
ALTER TABLE [dbo].[Departamento] ADD  DEFAULT (getdate()) FOR [FechaCreacion]
GO
ALTER TABLE [dbo].[Empadronamiento] ADD  DEFAULT ((0)) FOR [Cantidad]
GO
ALTER TABLE [dbo].[Empadronamiento] ADD  DEFAULT (getdate()) FOR [FechaCreacion]
GO
ALTER TABLE [dbo].[EquipamientoModelo] ADD  DEFAULT (getdate()) FOR [FechaCreacion]
GO
ALTER TABLE [dbo].[Familia] ADD  DEFAULT ((1)) FOR [Activo]
GO
ALTER TABLE [dbo].[Familia] ADD  DEFAULT (getdate()) FOR [FechaCreacion]
GO
ALTER TABLE [dbo].[Marca] ADD  DEFAULT (getdate()) FOR [FechaCreacion]
GO
ALTER TABLE [dbo].[Modelo] ADD  DEFAULT ('Importado') FOR [Estado]
GO
ALTER TABLE [dbo].[Modelo] ADD  DEFAULT (getdate()) FOR [FechaCreacion]
GO
ALTER TABLE [dbo].[Modelo] ADD  DEFAULT ((1)) FOR [Activo]
GO
ALTER TABLE [dbo].[ModeloEstado] ADD  DEFAULT (getdate()) FOR [FechaCambio]
GO
ALTER TABLE [dbo].[ModeloHistorial] ADD  DEFAULT (getdate()) FOR [FechaCambio]
GO
ALTER TABLE [dbo].[PrecioModelo] ADD  DEFAULT ('USD') FOR [Moneda]
GO
ALTER TABLE [dbo].[PrecioModelo] ADD  DEFAULT (getdate()) FOR [FechaCarga]
GO
ALTER TABLE [dbo].[PrecioVersion] ADD  DEFAULT (getdate()) FOR [FechaCarga]
GO
ALTER TABLE [dbo].[RefreshToken] ADD  DEFAULT (getdate()) FOR [CreatedAt]
GO
ALTER TABLE [dbo].[RefreshToken] ADD  DEFAULT ((0)) FOR [IsRevoked]
GO
ALTER TABLE [dbo].[Usuario] ADD  DEFAULT ((1)) FOR [Activo]
GO
ALTER TABLE [dbo].[Usuario] ADD  DEFAULT (getdate()) FOR [FechaCreacion]
GO
ALTER TABLE [dbo].[Venta] ADD  DEFAULT ((0)) FOR [Cantidad]
GO
ALTER TABLE [dbo].[Venta] ADD  DEFAULT (getdate()) FOR [FechaCreacion]
GO
ALTER TABLE [dbo].[VentasModelo] ADD  DEFAULT (getdate()) FOR [FechaCarga]
GO
ALTER TABLE [dbo].[VersionModelo] ADD  DEFAULT (getdate()) FOR [FechaCarga]
GO



ALTER TABLE [dbo].[AuditoriaAcceso]  WITH CHECK ADD  CONSTRAINT [FK_AuditoriaAcceso_Usuario] FOREIGN KEY([UsuarioID])
REFERENCES [dbo].[Usuario] ([UsuarioID])
ON DELETE SET NULL
GO
ALTER TABLE [dbo].[AuditoriaAcceso] CHECK CONSTRAINT [FK_AuditoriaAcceso_Usuario]
GO
ALTER TABLE [dbo].[Empadronamiento]  WITH CHECK ADD  CONSTRAINT [FK_Empadronamiento_CreadoPor] FOREIGN KEY([CreadoPorID])
REFERENCES [dbo].[Usuario] ([UsuarioID])
GO
ALTER TABLE [dbo].[Empadronamiento] CHECK CONSTRAINT [FK_Empadronamiento_CreadoPor]
GO
ALTER TABLE [dbo].[Empadronamiento]  WITH CHECK ADD  CONSTRAINT [FK_Empadronamiento_Departamento] FOREIGN KEY([DepartamentoID])
REFERENCES [dbo].[Departamento] ([DepartamentoID])
GO
ALTER TABLE [dbo].[Empadronamiento] CHECK CONSTRAINT [FK_Empadronamiento_Departamento]
GO
ALTER TABLE [dbo].[Empadronamiento]  WITH CHECK ADD  CONSTRAINT [FK_Empadronamiento_Modelo] FOREIGN KEY([ModeloID])
REFERENCES [dbo].[Modelo] ([ModeloID])
ON DELETE CASCADE
GO
ALTER TABLE [dbo].[Empadronamiento] CHECK CONSTRAINT [FK_Empadronamiento_Modelo]
GO
ALTER TABLE [dbo].[Empadronamiento]  WITH CHECK ADD  CONSTRAINT [FK_Empadronamiento_ModificadoPor] FOREIGN KEY([ModificadoPorID])
REFERENCES [dbo].[Usuario] ([UsuarioID])
GO
ALTER TABLE [dbo].[Empadronamiento] CHECK CONSTRAINT [FK_Empadronamiento_ModificadoPor]
GO
ALTER TABLE [dbo].[EquipamientoModelo]  WITH CHECK ADD  CONSTRAINT [FK_EquipamientoModelo_CreadoPor] FOREIGN KEY([CreadoPorID])
REFERENCES [dbo].[Usuario] ([UsuarioID])
GO
ALTER TABLE [dbo].[EquipamientoModelo] CHECK CONSTRAINT [FK_EquipamientoModelo_CreadoPor]
GO
ALTER TABLE [dbo].[EquipamientoModelo]  WITH CHECK ADD  CONSTRAINT [FK_EquipamientoModelo_Modelo] FOREIGN KEY([ModeloID])
REFERENCES [dbo].[Modelo] ([ModeloID])
ON DELETE CASCADE
GO
ALTER TABLE [dbo].[EquipamientoModelo] CHECK CONSTRAINT [FK_EquipamientoModelo_Modelo]
GO
ALTER TABLE [dbo].[EquipamientoModelo]  WITH CHECK ADD  CONSTRAINT [FK_EquipamientoModelo_ModificadoPor] FOREIGN KEY([ModificadoPorID])
REFERENCES [dbo].[Usuario] ([UsuarioID])
GO
ALTER TABLE [dbo].[EquipamientoModelo] CHECK CONSTRAINT [FK_EquipamientoModelo_ModificadoPor]
GO
ALTER TABLE [dbo].[Familia]  WITH CHECK ADD  CONSTRAINT [FK_Familia_Marca] FOREIGN KEY([MarcaID])
REFERENCES [dbo].[Marca] ([MarcaID])
ON DELETE CASCADE
GO
ALTER TABLE [dbo].[Familia] CHECK CONSTRAINT [FK_Familia_Marca]
GO
ALTER TABLE [dbo].[Modelo]  WITH CHECK ADD FOREIGN KEY([EstadoID])
REFERENCES [dbo].[EstadoCatalogo] ([EstadoID])
GO
ALTER TABLE [dbo].[Modelo]  WITH CHECK ADD FOREIGN KEY([MarcaID])
REFERENCES [dbo].[Marca] ([MarcaID])
GO
ALTER TABLE [dbo].[Modelo]  WITH CHECK ADD  CONSTRAINT [FK_Modelo_Familia] FOREIGN KEY([FamiliaID])
REFERENCES [dbo].[Familia] ([FamiliaID])
GO
ALTER TABLE [dbo].[Modelo] CHECK CONSTRAINT [FK_Modelo_Familia]
GO
ALTER TABLE [dbo].[ModeloEstado]  WITH CHECK ADD  CONSTRAINT [FK_ModeloEstado_Modelo] FOREIGN KEY([ModeloID])
REFERENCES [dbo].[Modelo] ([ModeloID])
GO
ALTER TABLE [dbo].[ModeloEstado] CHECK CONSTRAINT [FK_ModeloEstado_Modelo]
GO
ALTER TABLE [dbo].[ModeloHistorial]  WITH CHECK ADD FOREIGN KEY([ModeloID])
REFERENCES [dbo].[Modelo] ([ModeloID])
GO
ALTER TABLE [dbo].[PrecioModelo]  WITH CHECK ADD FOREIGN KEY([ModeloID])
REFERENCES [dbo].[Modelo] ([ModeloID])
GO
ALTER TABLE [dbo].[PrecioVersion]  WITH CHECK ADD  CONSTRAINT [FK_PrecioVersion_Version] FOREIGN KEY([VersionID])
REFERENCES [dbo].[VersionModelo] ([VersionID])
GO
ALTER TABLE [dbo].[PrecioVersion] CHECK CONSTRAINT [FK_PrecioVersion_Version]
GO
ALTER TABLE [dbo].[RefreshToken]  WITH CHECK ADD  CONSTRAINT [FK_RefreshToken_Usuario] FOREIGN KEY([UsuarioID])
REFERENCES [dbo].[Usuario] ([UsuarioID])
ON DELETE CASCADE
GO
ALTER TABLE [dbo].[RefreshToken] CHECK CONSTRAINT [FK_RefreshToken_Usuario]
GO
ALTER TABLE [dbo].[Venta]  WITH CHECK ADD  CONSTRAINT [FK_Venta_CreadoPor] FOREIGN KEY([CreadoPorID])
REFERENCES [dbo].[Usuario] ([UsuarioID])
GO
ALTER TABLE [dbo].[Venta] CHECK CONSTRAINT [FK_Venta_CreadoPor]
GO
ALTER TABLE [dbo].[Venta]  WITH CHECK ADD  CONSTRAINT [FK_Venta_Modelo] FOREIGN KEY([ModeloID])
REFERENCES [dbo].[Modelo] ([ModeloID])
ON DELETE CASCADE
GO
ALTER TABLE [dbo].[Venta] CHECK CONSTRAINT [FK_Venta_Modelo]
GO
ALTER TABLE [dbo].[Venta]  WITH CHECK ADD  CONSTRAINT [FK_Venta_ModificadoPor] FOREIGN KEY([ModificadoPorID])
REFERENCES [dbo].[Usuario] ([UsuarioID])
GO
ALTER TABLE [dbo].[Venta] CHECK CONSTRAINT [FK_Venta_ModificadoPor]
GO
ALTER TABLE [dbo].[VentasModelo]  WITH CHECK ADD FOREIGN KEY([ModeloID])
REFERENCES [dbo].[Modelo] ([ModeloID])
GO
ALTER TABLE [dbo].[VersionModelo]  WITH CHECK ADD  CONSTRAINT [FK_VersionModelo_Modelo] FOREIGN KEY([ModeloID])
REFERENCES [dbo].[Modelo] ([ModeloID])
GO
ALTER TABLE [dbo].[VersionModelo] CHECK CONSTRAINT [FK_VersionModelo_Modelo]
GO
ALTER TABLE [dbo].[AuditoriaAcceso]  WITH CHECK ADD  CONSTRAINT [CK_AuditoriaAcceso_Accion] CHECK  (([Accion]='cambio_password' OR [Accion]='token_revocado' OR [Accion]='token_expirado' OR [Accion]='refresh_token' OR [Accion]='logout' OR [Accion]='login_fallido' OR [Accion]='login_exitoso'))
GO
ALTER TABLE [dbo].[AuditoriaAcceso] CHECK CONSTRAINT [CK_AuditoriaAcceso_Accion]
GO
ALTER TABLE [dbo].[Empadronamiento]  WITH CHECK ADD CHECK  (([Mes]>=(1) AND [Mes]<=(12)))
GO
ALTER TABLE [dbo].[Empadronamiento]  WITH CHECK ADD  CONSTRAINT [CK_Empadronamiento_Cantidad] CHECK  (([Cantidad]>=(0)))
GO
ALTER TABLE [dbo].[Empadronamiento] CHECK CONSTRAINT [CK_Empadronamiento_Cantidad]
GO
ALTER TABLE [dbo].[Usuario]  WITH CHECK ADD  CONSTRAINT [CK_Usuario_Rol] CHECK  (([Rol]='entrada_datos' OR [Rol]='revision' OR [Rol]='aprobacion' OR [Rol]='admin'))
GO
ALTER TABLE [dbo].[Usuario] CHECK CONSTRAINT [CK_Usuario_Rol]
GO
ALTER TABLE [dbo].[Venta]  WITH CHECK ADD CHECK  (([Mes]>=(1) AND [Mes]<=(12)))
GO
ALTER TABLE [dbo].[Venta]  WITH CHECK ADD  CONSTRAINT [CK_Venta_Cantidad] CHECK  (([Cantidad]>=(0)))
GO
ALTER TABLE [dbo].[Venta] CHECK CONSTRAINT [CK_Venta_Cantidad]
GO
/****** Object:  StoredProcedure [dbo].[sp_LimpiarTokensExpirados]    Script Date: 24/4/2026 13:46:04 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER OFF
GO

CREATE PROCEDURE [dbo].[sp_LimpiarTokensExpirados]
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @Eliminados INT;
    
    DELETE FROM RefreshToken
    WHERE ExpiresAt < GETDATE() 
       OR IsRevoked = 1;
    
    SET @Eliminados = @@ROWCOUNT;
    
    PRINT 'Tokens expirados/revocados eliminados: ' + CAST(@Eliminados AS NVARCHAR(10));
    
    RETURN @Eliminados;
END
GO
/****** Object:  StoredProcedure [dbo].[sp_ObtenerHistorialAccesos]    Script Date: 24/4/2026 13:46:04 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER OFF
GO

CREATE PROCEDURE [dbo].[sp_ObtenerHistorialAccesos]
    @Username NVARCHAR(50),
    @Dias INT = 30,
    @Top INT = 100
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT TOP (@Top)
        AuditoriaID,
        UsuarioID,
        Username,
        Accion,
        FechaHora,
        IpAddress,
        UserAgent,
        Exitoso,
        MensajeError
    FROM AuditoriaAcceso
    WHERE Username = @Username
      AND FechaHora >= DATEADD(DAY, -@Dias, GETDATE())
    ORDER BY FechaHora DESC;
END
GO
/****** Object:  StoredProcedure [dbo].[sp_RegistrarAcceso]    Script Date: 24/4/2026 13:46:04 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER OFF
GO

CREATE PROCEDURE [dbo].[sp_RegistrarAcceso]
    @UsuarioID INT = NULL,
    @Username NVARCHAR(50),
    @Accion NVARCHAR(50),
    @Exitoso BIT,
    @IpAddress NVARCHAR(50) = NULL,
    @UserAgent NVARCHAR(500) = NULL,
    @MensajeError NVARCHAR(500) = NULL,
    @Metadata NVARCHAR(MAX) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    INSERT INTO AuditoriaAcceso (
        UsuarioID, Username, Accion, Exitoso, 
        IpAddress, UserAgent, MensajeError, Metadata
    )
    VALUES (
        @UsuarioID, @Username, @Accion, @Exitoso,
        @IpAddress, @UserAgent, @MensajeError, @Metadata
    );
END
GO
