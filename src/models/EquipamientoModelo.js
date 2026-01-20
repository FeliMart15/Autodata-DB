const { Model } = require('objection');

class EquipamientoModelo extends Model {
  static get tableName() {
    return 'EquipamientoModelo';
  }

  static get idColumn() {
    return 'EquipamientoID';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['ModeloID'],
      properties: {
        EquipamientoID: { type: 'integer' },
        ModeloID: { type: 'integer' },
        
        // DIMENSIONES Y DATOS TÉCNICOS (15 campos)
        Largo: { type: 'integer' },
        Ancho: { type: 'integer' },
        Altura: { type: 'integer' },
        DistanciaEjes: { type: 'integer' },
        PesoOrdenMarcha: { type: 'integer' },
        KgPorHP: { type: 'number' },
        Neumaticos: { type: 'string', maxLength: 100 },
        LlantasAleacion: { type: 'boolean' },
        DiametroLlantas: { type: 'number' },
        TPMS: { type: 'boolean' },
        KitInflableAntiPinchazo: { type: 'boolean' },
        RuedaAuxHomogenea: { type: 'boolean' },
        Cilindros: { type: 'integer' },
        Valvulas: { type: 'integer' },
        Inyeccion: { type: 'string', maxLength: 50 },
        
        // MECÁNICA (9 campos)
        Traccion: { type: 'string', maxLength: 50 },
        Suspension: { type: 'string', maxLength: 200 },
        Caja: { type: 'string', maxLength: 50 },
        MarchasVelocidades: { type: 'string', maxLength: 50 },
        Turbo: { type: 'boolean' },
        NumeroPuertas: { type: 'integer' },
        Aceite: { type: 'string', maxLength: 100 },
        Norma: { type: 'string', maxLength: 100 },
        StartStop: { type: 'boolean' },
        
        // CONSUMO Y EMISIONES (4 campos)
        CO2_g_km: { type: 'number' },
        ConsumoRuta: { type: 'number' },
        ConsumoUrbano: { type: 'number' },
        ConsumoMixto: { type: 'number' },
        
        // GARANTÍA (3 campos)
        GarantiaAnios: { type: 'integer' },
        GarantiaKm: { type: 'integer' },
        GarantiasDiferenciales: { type: 'string' },
        
        // VEHÍCULOS ELÉCTRICOS/HÍBRIDOS (12 campos)
        TipoVehiculoElectrico: { type: 'string', maxLength: 100 },
        EPedal: { type: 'boolean' },
        CapacidadTanqueHidrogeno: { type: 'number' },
        AutonomiaMaxRange: { type: 'integer' },
        CicloNorma: { type: 'string', maxLength: 100 },
        PotenciaMotor: { type: 'integer' },
        CapacidadOperativaBateria: { type: 'number' },
        ParMotorTorque: { type: 'integer' },
        PotenciaCargaMax: { type: 'number' },
        TiposConectores: { type: 'string', maxLength: 200 },
        GarantiaCapBat: { type: 'string', maxLength: 200 },
        TecnologiaBat: { type: 'string', maxLength: 200 },
        
        // OTROS DATOS (3 campos)
        OtrosDatos: { type: 'string' },
        TiempoCarga: { type: 'string', maxLength: 200 },
        CodigoFichaTecnica: { type: 'string', maxLength: 100 },
        
        // CONFORT E INTERIOR (15 campos)
        SistemaClimatizacion: { type: 'string', maxLength: 100 },
        Direccion: { type: 'string', maxLength: 100 },
        TipoBloqueo: { type: 'string', maxLength: 100 },
        KeylessSmartKey: { type: 'boolean' },
        LevantaVidrios: { type: 'string', maxLength: 50 },
        EspejosElectricos: { type: 'boolean' },
        EspejoInteriorElectrocromado: { type: 'boolean' },
        EspejosAbatiblesElectricamente: { type: 'boolean' },
        Tapizado: { type: 'string', maxLength: 100 },
        VolanteRevestidoCuero: { type: 'boolean' },
        TablerDigital: { type: 'boolean' },
        Computadora: { type: 'boolean' },
        GPS: { type: 'boolean' },
        VelocidadCrucero: { type: 'boolean' },
        Inmovilizador: { type: 'boolean' },
        
        // SEGURIDAD (16 campos)
        Alarma: { type: 'boolean' },
        ABAG: { type: 'boolean' },
        SRI: { type: 'boolean' },
        ABS: { type: 'boolean' },
        EBD_EBV_REF: { type: 'boolean' },
        DiscosFrenos: { type: 'string', maxLength: 100 },
        FrenoEstacionamientoElectrico: { type: 'boolean' },
        ESP_ControlEstabilidad: { type: 'boolean' },
        ControlTraccion: { type: 'boolean' },
        AsistFrenadoDetectorDistancia: { type: 'boolean' },
        AsistPendiente: { type: 'boolean' },
        DetectorCambioFila: { type: 'boolean' },
        DetectorPuntoCiego: { type: 'boolean' },
        TrafficSignRecognition: { type: 'boolean' },
        DriverAttentionControl: { type: 'boolean' },
        DetectorLluvia: { type: 'boolean' },
        
        // CONTROL Y ASISTENCIA (4 campos)
        GripControl: { type: 'boolean' },
        LimitadorVelocidad: { type: 'boolean' },
        AsistDescensoHDC: { type: 'boolean' },
        PaddleShift: { type: 'boolean' },
        
        // MULTIMEDIA (13 campos)
        ComandoAudioVolante: { type: 'boolean' },
        CD: { type: 'boolean' },
        MP3: { type: 'boolean' },
        USB: { type: 'boolean' },
        Bluetooth: { type: 'boolean' },
        DVD: { type: 'boolean' },
        MirrorScreen: { type: 'boolean' },
        SistemaMultimedia: { type: 'string', maxLength: 200 },
        PantallaMultimediaPulgadas: { type: 'number' },
        PantallaTactil: { type: 'boolean' },
        CargadorSmartphoneInduccion: { type: 'boolean' },
        KitHiFi: { type: 'string', maxLength: 100 },
        Radio: { type: 'boolean' },
        
        // ASIENTOS (10 campos)
        NumeroAsientos: { type: 'integer' },
        AsientoElectricoCalefMasaje: { type: 'boolean' },
        AsientosRango2y3: { type: 'string', maxLength: 100 },
        Asiento2Mas1: { type: 'boolean' },
        ButacaElectrica: { type: 'boolean' },
        AsientoVentilado: { type: 'boolean' },
        AsientosMasajeador: { type: 'integer' },
        ApoyabrazosDelantero: { type: 'boolean' },
        ApoyabrazosCentralTrasero: { type: 'boolean' },
        SoporteMusloDelantero: { type: 'boolean' },
        
        // AJUSTES DE ASIENTOS (8 campos)
        AsientoTraseroAjusteElectrico: { type: 'boolean' },
        TerceraFilaAsientosElectricos: { type: 'boolean' },
        TipoAlturaAsientoDelantero: { type: 'string', maxLength: 100 },
        SeatAdjustmentMemoryDriver: { type: 'boolean' },
        SeatAdjustmentMemoryCoDriver: { type: 'boolean' },
        LumbarAdjustmentFrontDriver: { type: 'boolean' },
        LumbarAdjustmentFrontCoDriver: { type: 'boolean' },
        SeatHeatingRear: { type: 'boolean' },
        
        // TECHO (4 campos)
        Techo: { type: 'string', maxLength: 100 },
        TechoBiTono: { type: 'boolean' },
        BarrasTecho: { type: 'boolean' },
        NumeroTechosQueSeAbren: { type: 'integer' },
        
        // SENSORES Y CÁMARAS (3 campos)
        SensorEstacionamiento: { type: 'string', maxLength: 100 },
        Camara: { type: 'string', maxLength: 100 },
        SistemaAutomaticoEstacionamiento: { type: 'boolean' },
        
        // ILUMINACIÓN (11 campos)
        FarosNeblina: { type: 'boolean' },
        FarosDireccionales: { type: 'boolean' },
        FarosFullLED: { type: 'boolean' },
        FarosHalogenosDRL_LED: { type: 'boolean' },
        FarosXenonLimpiadores: { type: 'boolean' },
        PackVisibilidad: { type: 'boolean' },
        PasoLucesCruzRutaAutomatica: { type: 'boolean' },
        VisionNocturna: { type: 'boolean' },
        FarosMatrix: { type: 'boolean' },
        LucesTraserasLED: { type: 'boolean' },
        LucesTraserasOLED: { type: 'boolean' },
        
        // MALETERO Y CARGA (7 campos)
        MaleteraAperturaElectrica: { type: 'boolean' },
        CapacidadBaul: { type: 'integer' },
        CapacidadTanqueCombustible: { type: 'integer' },
        ProtectorCaja: { type: 'boolean' },
        ParticionCabina: { type: 'boolean' },
        NumPuertasLaterales: { type: 'integer' },
        PuertaLateralElectrica: { type: 'boolean' },
        
        // CARGA (4 campos)
        CargaUtil_kg: { type: 'integer' },
        VolumenUtil_m3: { type: 'number' },
        TipoAlturaUL: { type: 'string', maxLength: 100 },
        CapacidadCargaCamiones: { type: 'string', maxLength: 200 },
        
        // SEGURIDAD AVANZADA (6 campos)
        AlertaTraficoCruzadoTrasero: { type: 'boolean' },
        AlertaTraficoCruzadoFrontal: { type: 'boolean' },
        FrenadoMulticolision: { type: 'boolean' },
        HeadUpDisplay: { type: 'boolean' },
        CityStop: { type: 'boolean' },
        FrenoPeatones: { type: 'boolean' },
        
        // OTROS EQUIPAMIENTO (21 campos)
        BloqueDiferencialTerreno: { type: 'string', maxLength: 100 },
        DesempaniadorElectrico: { type: 'boolean' },
        IluminacionAmbiental: { type: 'boolean' },
        LimpiaLavaParabrisasTrasero: { type: 'boolean' },
        BlackWheelFrame: { type: 'boolean' },
        VolanteMultifuncion: { type: 'boolean' },
        TablerDigital3D: { type: 'boolean' },
        AceleracionBEV_0a100: { type: 'number' },
        AccelerationICE: { type: 'number' },
        CargaElectricaWireless: { type: 'boolean' },
        CargaElectricaInduccion: { type: 'boolean' },
        CableElectricoTipo3Incluido: { type: 'boolean' },
        ChassisDriveSelect: { type: 'boolean' },
        ChassisSportSuspension: { type: 'boolean' },
        DireccionCuatroRuedas: { type: 'boolean' },
        LucesLaser: { type: 'boolean' },
        DashboardDisplayConfigurable: { type: 'boolean' },
        WirelessSmartphoneIntegration: { type: 'boolean' },
        MobilePhoneAntenna: { type: 'boolean' },
        DeflectorViento: { type: 'boolean' },
        AsientosDeportivos: { type: 'boolean' },
        
        // Auditoría
        CreadoPorID: { type: 'integer' },
        FechaCreacion: { type: 'string', format: 'date-time' },
        ModificadoPorID: { type: 'integer' },
        FechaModificacion: { type: 'string', format: 'date-time' }
      }
    };
  }

  static get relationMappings() {
    const Modelo = require('./Modelo');
    
    return {
      modelo: {
        relation: Model.BelongsToOneRelation,
        modelClass: Modelo,
        join: {
          from: 'EquipamientoModelo.ModeloID',
          to: 'Modelo.ModeloID'
        }
      }
    };
  }

  $beforeInsert() {
    this.FechaCreacion = new Date().toISOString();
  }

  $beforeUpdate() {
    this.FechaModificacion = new Date().toISOString();
  }
}

module.exports = EquipamientoModelo;
