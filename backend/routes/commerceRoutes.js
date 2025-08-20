const express = require('express');
const router = express.Router();
const {
  obtenerDashboard,
  obtenerAnalisisSales,
  gestionarProductos,
  gestionarPedidos,
  actualizarEstadoPedido,
  obtenerEstadisticasIngresos
} = require('../controllers/commerceController');
const { protect, authorize } = require('../middlewares/auth');

// @route   GET /api/commerce/dashboard
// @desc    Obtener dashboard del comerciante
// @access  Private (Comerciante)
router.get('/dashboard', protect, authorize('comerciante'), obtenerDashboard);

// @route   GET /api/commerce/sales
// @desc    Obtener análisis de ventas del comerciante
// @access  Private (Comerciante)
router.get('/sales', protect, authorize('comerciante'), obtenerAnalisisSales);

// @route   GET /api/commerce/products
// @desc    Gestionar productos del comerciante
// @access  Private (Comerciante)
router.get('/products', protect, authorize('comerciante'), gestionarProductos);

// @route   GET /api/commerce/orders
// @desc    Gestionar pedidos del comerciante
// @access  Private (Comerciante)
router.get('/orders', protect, authorize('comerciante'), gestionarPedidos);

// @route   PUT /api/commerce/orders/:id/status
// @desc    Actualizar estado de pedido
// @access  Private (Comerciante)
router.put('/orders/:id/status', protect, authorize('comerciante'), actualizarEstadoPedido);

// @route   GET /api/commerce/earnings
// @desc    Obtener estadísticas de ingresos
// @access  Private (Comerciante)
router.get('/earnings', protect, authorize('comerciante'), obtenerEstadisticasIngresos);

module.exports = router; 