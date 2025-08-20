const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth');
const { obtenerAnalyticsComerciante, generarDatosPrueba } = require('../controllers/analyticsController');

// Todas las rutas requieren autenticación
router.use(protect);

// Obtener analytics del comerciante
router.get('/merchant', obtenerAnalyticsComerciante);

// Generar datos de prueba (temporal)
router.post('/generate-test-data', generarDatosPrueba);

module.exports = router; 