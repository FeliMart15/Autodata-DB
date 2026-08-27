const express = require('express');
const router = express.Router();
const {
  upload,
  importarCSV,
  importarExcelAutos,
  importarExcelPrecios,
  importarExcelCompleto,
  importarExcelMinimos,
  descargarTemplateCompleto,
  listarBatches,
  obtenerBatch,
  procesarBatch,
  eliminarBatch
} = require('../controllers/importController');

// GET /api/import/template-completo - Descarga el excel base para los autos y equipamientos
router.get('/template-completo', descargarTemplateCompleto);

// POST /api/import/excel-completo - Sube la plantilla maestra con los datos del equipamiento
router.post('/excel-completo', upload.single('file'), importarExcelCompleto);

// POST /api/import/excel-modelos - Subir Excel respetando IDs originales
router.post('/excel-modelos', upload.single('file'), importarExcelAutos);

// POST /api/import/excel-minimos - Sube SOLO datos mínimos (sin equipamiento) → estado minimos_aprobados
router.post('/excel-minimos', upload.single('file'), importarExcelMinimos);

// POST /api/import/excel-precios - Subir Excel con lista de precios tabulada
router.post('/excel-precios', upload.single('file'), importarExcelPrecios);

// POST /api/import/claudio - Upload e importar CSV
router.post('/claudio', upload.single('file'), importarCSV);

// GET /api/import/batches - Listar todos los batches
router.get('/batches', listarBatches);

// GET /api/import/batches/:batchId - Obtener detalles de un batch
router.get('/batches/:batchId', obtenerBatch);

// POST /api/import/batches/:batchId/process - Procesar batch a tablas de trabajo
router.post('/batches/:batchId/process', procesarBatch);

// DELETE /api/import/batches/:batchId - Eliminar batch
router.delete('/batches/:batchId', eliminarBatch);

module.exports = router;
