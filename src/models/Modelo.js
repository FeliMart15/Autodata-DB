const { Model } = require('objection');

class Modelo extends Model {
  static get tableName() {
    return 'Modelo';
  }

  static get idColumn() {
    return 'ModeloID';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['MarcaID', 'CodigoModelo', 'DescripcionModelo'],
      properties: {
        ModeloID: { type: 'integer' },
        MarcaID: { type: 'integer' },
        CodigoModelo: { type: 'string', maxLength: 100 },
        CodigoAutodata: { type: 'string', maxLength: 8 },
        DescripcionModelo: { type: 'string', maxLength: 300 },
        
        // Datos de Carga (del CSV)
        CategoriaCodigo: { type: 'string', maxLength: 50 },
        CombustibleCodigo: { type: 'string', maxLength: 50 },
        OrigenCodigo: { type: 'string', maxLength: 50 },
        Familia: { type: 'string', maxLength: 100 },
        
        // Datos Mínimos (16 campos obligatorios)
        Segmento: { type: 'string', maxLength: 100 },
        Modelo1: { type: 'string', maxLength: 200 },
        Tipo2_Carroceria: { type: 'string', maxLength: 100 },
        Origen: { type: 'string', maxLength: 100 },
        Combustible: { type: 'string', maxLength: 50 },
        Cilindros: { type: 'integer' },
        Valvulas: { type: 'integer' },
        CC: { type: 'integer' },  // Cilindrada
        HP: { type: 'integer' },
        TipoCajaAut: { type: 'string', maxLength: 100 },
        Puertas: { type: 'integer' },
        Asientos: { type: 'integer' },
        TipoMotor: { type: 'string', maxLength: 100 },
        TipoVehiculoElectrico: { type: 'string', maxLength: 100 },
        Importador: { type: 'string', maxLength: 200 },
        PrecioInicial: { type: 'number' },
        
        // Otros campos
        ShortName: { type: 'string', maxLength: 100 },
        Precio0KMInicial: { type: 'number' },
        Anio: { type: 'integer' },
        Tipo: { type: 'string', maxLength: 100 },
        Tipo2: { type: 'string', maxLength: 100 },
        Traccion: { type: 'string', maxLength: 50 },
        Caja: { type: 'string', maxLength: 50 },
        TipoCaja: { type: 'string', maxLength: 50 },
        Turbo: { type: 'boolean' },
        Pasajeros: { type: 'integer' },
        TipoVehiculo: { type: 'string', maxLength: 100 },
        
        // Segmentaciones
        SegmentacionAutodata: { type: 'string', maxLength: 50 },
        SegmentacionGM: { type: 'string', maxLength: 50 },
        SegmentacionAudi: { type: 'string', maxLength: 50 },
        SegmentacionSBI: { type: 'string', maxLength: 50 },
        SegmentacionCitroen: { type: 'string', maxLength: 50 },
        
        // Control de Flujo
        Estado: { type: 'string', maxLength: 50 },
        EstadoID: { type: 'integer' },
        ObservacionesRevision: { type: 'string' },
        
        // Auditoría
        CreadoPorID: { type: 'integer' },
        FechaCreacion: { type: 'string', format: 'date-time' },
        ModificadoPorID: { type: 'integer' },
        FechaModificacion: { type: 'string', format: 'date-time' },
        Activo: { type: 'boolean' }
      }
    };
  }

  static get relationMappings() {
    const Marca = require('./Marca');
    const ModeloEstado = require('./ModeloEstado');
    const VersionModelo = require('./VersionModelo');
    const EquipamientoModelo = require('./EquipamientoModelo');
    const PrecioModelo = require('./PrecioModelo');
    
    return {
      marca: {
        relation: Model.BelongsToOneRelation,
        modelClass: Marca,
        join: {
          from: 'Modelo.MarcaID',
          to: 'Marca.MarcaID'
        }
      },
      estado: {
        relation: Model.BelongsToOneRelation,
        modelClass: ModeloEstado,
        join: {
          from: 'Modelo.EstadoID',
          to: 'ModeloEstado.EstadoID'
        }
      },
      versiones: {
        relation: Model.HasManyRelation,
        modelClass: VersionModelo,
        join: {
          from: 'Modelo.ModeloID',
          to: 'VersionModelo.ModeloID'
        }
      },
      equipamiento: {
        relation: Model.HasOneRelation,
        modelClass: EquipamientoModelo,
        join: {
          from: 'Modelo.ModeloID',
          to: 'EquipamientoModelo.ModeloID'
        }
      },
      precios: {
        relation: Model.HasManyRelation,
        modelClass: PrecioModelo,
        join: {
          from: 'Modelo.ModeloID',
          to: 'PrecioModelo.ModeloID'
        }
      }
    };
  }

  $beforeInsert() {
    this.FechaCreacion = new Date().toISOString();
  }
}

module.exports = Modelo;
