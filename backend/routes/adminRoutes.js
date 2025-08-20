const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { protect, authorize } = require('../middlewares/auth');

// @route   GET /api/admin/dashboard-stats
// @desc    Get admin dashboard stats
// @access  Private (Admin only)
router.get('/dashboard-stats', protect, authorize('administrador'), adminController.obtenerEstadisticasDashboard);

// @route   GET /api/admin/stats
// @desc    Get admin dashboard stats (legacy)
// @access  Private (Admin only)
router.get('/stats', protect, authorize('administrador'), adminController.obtenerEstadisticas);

// === GESTIÓN DE USUARIOS ===
// @route   GET /api/admin/users
// @desc    Get all users
// @access  Private (Admin only)
router.get('/users', protect, authorize('administrador'), adminController.obtenerTodosUsuarios);

// @route   PUT /api/admin/users/:id
// @desc    Update user info
// @access  Private (Admin only)
router.put('/users/:id', protect, authorize('administrador'), adminController.actualizarUsuario);

// @route   PATCH /api/admin/users/:id/status
// @desc    Toggle user status (active/inactive)
// @access  Private (Admin only)
router.patch('/users/:id/status', protect, authorize('administrador'), adminController.alternarEstadoUsuario);

// === GESTIÓN DE PRODUCTOS ===
// @route   GET /api/admin/products
// @desc    Get all products (admin view)
// @access  Private (Admin only)
router.get('/products', protect, authorize('administrador'), adminController.obtenerTodosProductos);

// @route   PATCH /api/admin/products/:id/status
// @desc    Approve/reject product
// @access  Private (Admin only)
router.patch('/products/:id/status', protect, authorize('administrador'), adminController.actualizarEstadoProducto);

// @route   PUT /api/admin/products/:id/approve
// @desc    Approve product
// @access  Private (Admin only)
router.put('/products/:id/approve', protect, authorize('administrador'), adminController.aprobarRechazarProducto);

// @route   PUT /api/admin/products/:id/reject
// @desc    Reject product
// @access  Private (Admin only)
router.put('/products/:id/reject', protect, authorize('administrador'), adminController.aprobarRechazarProducto);

// @route   DELETE /api/admin/products/:id
// @desc    Delete product
// @access  Private (Admin only)
router.delete('/products/:id', protect, authorize('administrador'), adminController.eliminarProducto);

// === GESTIÓN DE PEDIDOS ===
// @route   GET /api/admin/orders
// @desc    Get all orders (admin view)
// @access  Private (Admin only)
router.get('/orders', protect, authorize('administrador'), adminController.obtenerTodosPedidos);

// === REPORTES ===
// @route   GET /api/admin/reports/general
// @desc    Get general reports
// @access  Private (Admin only)
router.get('/reports/general', protect, authorize('administrador'), adminController.obtenerReporteVentas);

module.exports = router; 