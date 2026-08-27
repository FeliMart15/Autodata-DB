const express = require('express');
const router = express.Router();
const exportController = require('../controllers/exportController');

router.get('/ventas', exportController.exportarVentasExcel);
router.get('/empadronamientos', exportController.exportarEmpadronamientosExcel);
router.get('/plantilla', exportController.exportarPlantillaMaestra);
router.post(
  '/carone',
  exportController.uploadCarone.fields([{ name: 'carone', maxCount: 1 }, { name: 'shortname', maxCount: 1 }]),
  exportController.exportarCarone
);

module.exports = router;
