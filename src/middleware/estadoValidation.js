/**
 * Middleware de validación de estados y transiciones
 * Sistema de flujo de 3 fases: Datos Carga → Datos Mínimos → Equipamiento
 */

// Definición de estados del sistema
const ESTADOS = {
  // Fase 1: Importación/Creación
  IMPORTADO: 'importado',
  CREADO: 'creado',
  
  // Fase 2: Datos Mínimos
  DATOS_MINIMOS: 'datos_minimos',
  REVISION_MINIMOS: 'revision_minimos',
  CORREGIR_MINIMOS: 'corregir_minimos',
  MINIMOS_APROBADOS: 'minimos_aprobados',
  
  // Fase 3: Equipamiento
  EQUIPAMIENTO_CARGADO: 'equipamiento_cargado',
  REVISION_EQUIPAMIENTO: 'revision_equipamiento',
  CORREGIR_EQUIPAMIENTO: 'corregir_equipamiento',
  
  // Estado Final
  DEFINITIVO: 'definitivo'
};

// Campos obligatorios para Datos Mínimos (15 campos - Combustible se carga en datos de carga)
const CAMPOS_DATOS_MINIMOS = [
  'SegmentacionAutodata',  // Segmento
  'Modelo1',
  'Tipo2_Carroceria',
  'OrigenCodigo',  // Origen
  'Cilindros',
  'Valvulas',
  'CC',  // Cilindrada
  'HP',
  'TipoCajaAut',
  'Puertas',
  'Asientos',
  'TipoMotor',
  'TipoVehiculoElectrico',
  'Importador',
  'PrecioInicial'
];

// Transiciones de estado permitidas
const TRANSICIONES_PERMITIDAS = {
  [ESTADOS.IMPORTADO]: [ESTADOS.REVISION_MINIMOS],
  [ESTADOS.CREADO]: [ESTADOS.REVISION_MINIMOS],
  [ESTADOS.REVISION_MINIMOS]: [ESTADOS.MINIMOS_APROBADOS, ESTADOS.CORREGIR_MINIMOS],
  [ESTADOS.CORREGIR_MINIMOS]: [ESTADOS.REVISION_MINIMOS],
  [ESTADOS.MINIMOS_APROBADOS]: [ESTADOS.REVISION_EQUIPAMIENTO],
  [ESTADOS.REVISION_EQUIPAMIENTO]: [ESTADOS.DEFINITIVO, ESTADOS.CORREGIR_EQUIPAMIENTO],
  [ESTADOS.CORREGIR_EQUIPAMIENTO]: [ESTADOS.REVISION_EQUIPAMIENTO],
  [ESTADOS.DEFINITIVO]: [] // No se puede cambiar desde definitivo
};

/**
 * Valida que los campos de datos mínimos estén completos
 * @param {Object} modelo - Objeto con datos del modelo
 * @returns {Object} - { valido: boolean, camposFaltantes: array }
 */
function validarDatosMinimos(modelo) {
  const camposFaltantes = [];
  
  // Campos que pueden ser opcionales (pueden ser null/undefined)
  const camposOpcionales = ['TipoVehiculoElectrico', 'Importador', 'PrecioInicial'];
  
  CAMPOS_DATOS_MINIMOS.forEach(campo => {
    const valor = modelo[campo];
    
    // Si el campo es opcional, solo validar si no es null/undefined
    if (camposOpcionales.includes(campo)) {
      return; // Saltar validación para campos opcionales
    }
    
    // Para campos obligatorios:
    // - String: no puede ser vacío
    // - Number: puede ser 0 (es válido)
    if (valor === null || valor === undefined || 
        (typeof valor === 'string' && valor.trim() === '')) {
      camposFaltantes.push(campo);
    }
  });
  
  return {
    valido: camposFaltantes.length === 0,
    camposFaltantes
  };
}

/**
 * Valida si una transición de estado es permitida
 * @param {string} estadoActual - Estado actual del modelo
 * @param {string} estadoNuevo - Estado al que se quiere transicionar
 * @returns {Object} - { valido: boolean, mensaje: string }
 */
function validarTransicionEstado(estadoActual, estadoNuevo) {
  // Verificar que ambos estados existen
  if (!Object.values(ESTADOS).includes(estadoActual)) {
    return {
      valido: false,
      mensaje: `Estado actual inválido: ${estadoActual}`
    };
  }
  
  if (!Object.values(ESTADOS).includes(estadoNuevo)) {
    return {
      valido: false,
      mensaje: `Estado nuevo inválido: ${estadoNuevo}`
    };
  }
  
  // Verificar si la transición está permitida
  const transicionesPermitidas = TRANSICIONES_PERMITIDAS[estadoActual] || [];
  
  if (!transicionesPermitidas.includes(estadoNuevo)) {
    return {
      valido: false,
      mensaje: `Transición no permitida de '${estadoActual}' a '${estadoNuevo}'`
    };
  }
  
  return {
    valido: true,
    mensaje: 'Transición válida'
  };
}

/**
 * Valida los requisitos antes de cambiar a un estado específico
 * @param {Object} modelo - Objeto completo del modelo
 * @param {string} estadoNuevo - Estado al que se quiere transicionar
 * @returns {Object} - { valido: boolean, mensaje: string, detalles: any }
 */
function validarRequisitosEstado(modelo, estadoNuevo) {
  switch (estadoNuevo) {
    case ESTADOS.DATOS_MINIMOS:
      // No hay requisitos específicos, solo debe tener datos básicos
      return {
        valido: true,
        mensaje: 'Puede pasar a datos_minimos'
      };
    
    case ESTADOS.REVISION_MINIMOS:
      // Debe tener todos los campos de datos mínimos completos
      const validacionMinimos = validarDatosMinimos(modelo);
      if (!validacionMinimos.valido) {
        return {
          valido: false,
          mensaje: `Faltan campos obligatorios de Datos Mínimos: ${validacionMinimos.camposFaltantes.join(', ')}`,
          detalles: validacionMinimos.camposFaltantes
        };
      }
      return {
        valido: true,
        mensaje: 'Datos mínimos completos, puede enviar a revisión'
      };
    
    case ESTADOS.MINIMOS_APROBADOS:
      // Solo el revisor puede aprobar
      return {
        valido: true,
        mensaje: 'Datos mínimos aprobados'
      };
    
    case ESTADOS.CORREGIR_MINIMOS:
      // Requiere observaciones
      if (!modelo.ObservacionesRevision) {
        return {
          valido: false,
          mensaje: 'Se requieren observaciones para rechazar'
        };
      }
      return {
        valido: true,
        mensaje: 'Enviado a corrección con observaciones'
      };
    
    case ESTADOS.EQUIPAMIENTO_CARGADO:
      // Debe tener datos mínimos aprobados
      // No validamos campos de equipamiento porque se van cargando progresivamente
      return {
        valido: true,
        mensaje: 'Puede cargar equipamiento'
      };
    
    case ESTADOS.REVISION_EQUIPAMIENTO:
      // Idealmente debería tener al menos algunos campos de equipamiento
      // Pero lo dejamos flexible
      return {
        valido: true,
        mensaje: 'Equipamiento enviado a revisión'
      };
    
    case ESTADOS.CORREGIR_EQUIPAMIENTO:
      // Requiere observaciones
      if (!modelo.ObservacionesRevision) {
        return {
          valido: false,
          mensaje: 'Se requieren observaciones para rechazar'
        };
      }
      return {
        valido: true,
        mensaje: 'Enviado a corrección de equipamiento'
      };
    
    case ESTADOS.DEFINITIVO:
      // Estado final, todo debe estar aprobado
      return {
        valido: true,
        mensaje: 'Modelo aprobado y marcado como definitivo'
      };
    
    default:
      return {
        valido: false,
        mensaje: `Estado desconocido: ${estadoNuevo}`
      };
  }
}

/**
 * Obtiene el nombre legible de un estado
 * @param {string} estado - Código del estado
 * @returns {string} - Nombre legible
 */
function obtenerNombreEstado(estado) {
  const nombres = {
    [ESTADOS.IMPORTADO]: 'Importado',
    [ESTADOS.CREADO]: 'Creado',
    [ESTADOS.DATOS_MINIMOS]: 'Datos Mínimos',
    [ESTADOS.REVISION_MINIMOS]: 'En Revisión de Datos Mínimos',
    [ESTADOS.CORREGIR_MINIMOS]: 'Corregir Datos Mínimos',
    [ESTADOS.MINIMOS_APROBADOS]: 'Datos Mínimos Aprobados',
    [ESTADOS.EQUIPAMIENTO_CARGADO]: 'Equipamiento Cargado',
    [ESTADOS.REVISION_EQUIPAMIENTO]: 'En Revisión de Equipamiento',
    [ESTADOS.CORREGIR_EQUIPAMIENTO]: 'Corregir Equipamiento',
    [ESTADOS.DEFINITIVO]: 'Definitivo'
  };
  
  return nombres[estado] || estado;
}

/**
 * Determina si un estado permite edición
 * @param {string} estado - Código del estado
 * @returns {Object} - { permiteEdicion: boolean, campos: string }
 */
function permiteEdicion(estado) {
  switch (estado) {
    case ESTADOS.IMPORTADO:
    case ESTADOS.CREADO:
    case ESTADOS.DATOS_MINIMOS:
    case ESTADOS.CORREGIR_MINIMOS:
      return {
        permiteEdicion: true,
        campos: 'datos_minimos'
      };
    
    case ESTADOS.MINIMOS_APROBADOS:
    case ESTADOS.EQUIPAMIENTO_CARGADO:
    case ESTADOS.CORREGIR_EQUIPAMIENTO:
      return {
        permiteEdicion: true,
        campos: 'equipamiento'
      };
    
    case ESTADOS.REVISION_MINIMOS:
    case ESTADOS.REVISION_EQUIPAMIENTO:
      return {
        permiteEdicion: false,
        campos: 'ninguno',
        mensaje: 'El modelo está en revisión'
      };
    
    case ESTADOS.DEFINITIVO:
      return {
        permiteEdicion: false,
        campos: 'ninguno',
        mensaje: 'El modelo está definitivo y no puede modificarse'
      };
    
    default:
      return {
        permiteEdicion: false,
        campos: 'ninguno'
      };
  }
}

module.exports = {
  ESTADOS,
  CAMPOS_DATOS_MINIMOS,
  TRANSICIONES_PERMITIDAS,
  validarDatosMinimos,
  validarTransicionEstado,
  validarRequisitosEstado,
  obtenerNombreEstado,
  permiteEdicion
};
