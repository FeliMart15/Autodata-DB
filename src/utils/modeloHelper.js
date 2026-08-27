const db = require('../config/db-simple');
const logger = require('../config/logger');

/**
 * Garantiza que un modelo tenga su registro 1:1 en EquipamientoModelo.
 * Se llama desde TODOS los caminos de creación (manual, import simple,
 * plantilla maestra, CSV) para que todo auto quede con la misma estructura:
 * aunque el equipamiento venga vacío, la fila existe y queda lista para cargar.
 *
 * Idempotente: si ya existe equipamiento para el modelo, no hace nada.
 *
 * @param {number} modeloId
 * @returns {Promise<boolean>} true si creó la fila, false si ya existía
 */
async function asegurarEquipamientoVacio(modeloId) {
  if (!modeloId) return false;
  try {
    const existe = await db.queryWithParams(
      'SELECT TOP 1 EquipamientoID FROM EquipamientoModelo WHERE ModeloID = @p0',
      [modeloId]
    );
    if (existe && existe.length > 0) return false;

    await db.queryWithParams(
      'INSERT INTO EquipamientoModelo (ModeloID, FechaCreacion) VALUES (@p0, GETDATE())',
      [modeloId]
    );
    return true;
  } catch (err) {
    // No abortamos la creación del modelo si falla el equipamiento vacío;
    // solo lo registramos para diagnóstico.
    logger.warn(`No se pudo crear equipamiento vacío para ModeloID=${modeloId}: ${err.message}`);
    return false;
  }
}

module.exports = {
  asegurarEquipamientoVacio
};
