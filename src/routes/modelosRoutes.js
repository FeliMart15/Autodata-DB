const express = require('express');
const router = express.Router();
const modelosController = require('../controllers/modelosController');

// Rutas de consulta
router.get('/', modelosController.getAll);
router.get('/estados', modelosController.getEstados);
router.get('/codigo/:codigoAutodata', modelosController.getByCodigoAutodata);
router.get('/:id', modelosController.getById);

// Rutas de modificación
router.post('/', modelosController.create);
router.put('/:id', modelosController.update);
router.delete('/:id', modelosController.delete);

// Workflow endpoints - NUEVO SISTEMA
router.post('/:id/cambiar-estado', modelosController.cambiarEstado);
router.post('/:id/validar-datos-minimos', modelosController.validarDatosMinimos);

// Workflow endpoints antiguos (mantener por compatibilidad)
router.post('/:id/mark-minimos', modelosController.markMinimos);
router.post('/:id/send-review', modelosController.sendReview);
router.post('/:id/approve', modelosController.approve);

module.exports = router;
