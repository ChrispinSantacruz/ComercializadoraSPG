const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { protect } = require('../middlewares/auth');
const { subirAvatar, subirBanner } = require('../middlewares/upload');

// @route   GET /api/users/profile
// @desc    Get user profile
// @access  Private
router.get('/profile', protect, userController.obtenerPerfilCompleto);

// @route   PUT /api/users/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', protect, subirAvatar, userController.actualizarPerfil);

// @route   GET /api/users/favorites
// @desc    Get user favorites
// @access  Private
router.get('/favorites', protect, userController.obtenerFavoritos);

// @route   POST /api/users/favorites/:productId
// @desc    Add to favorites
// @access  Private
router.post('/favorites/:productId', protect, userController.agregarAFavoritos);

// @route   DELETE /api/users/favorites/:productId
// @desc    Remove from favorites
// @access  Private
router.delete('/favorites/:productId', protect, userController.quitarDeFavoritos);

// @route   GET /api/users/favorites/:productId
// @desc    Check if product is favorite
// @access  Private
router.get('/favorites/:productId', protect, userController.verificarFavorito);

// @route   GET /api/users/orders
// @desc    Get user orders history
// @access  Private
router.get('/orders', protect, userController.obtenerHistorialPedidos);

// @route   GET /api/users/payment-methods
// @desc    Get payment methods
// @access  Private
router.get('/payment-methods', protect, userController.obtenerMetodosPago);

// @route   POST /api/users/payment-methods
// @desc    Add payment method
// @access  Private
router.post('/payment-methods', protect, userController.agregarMetodoPago);

// @route   DELETE /api/users/payment-methods/:id
// @desc    Delete payment method
// @access  Private
router.delete('/payment-methods/:id', protect, userController.eliminarMetodoPago);

// @route   PUT /api/users/notification-settings
// @desc    Update notification settings
// @access  Private
router.put('/notification-settings', protect, userController.actualizarConfiguracionNotificaciones);

// @route   POST /api/users/avatar
// @desc    Upload user avatar
// @access  Private
router.post('/avatar', protect, subirAvatar, userController.subirAvatar);

// @route   POST /api/users/banner
// @desc    Upload merchant banner
// @access  Private
router.post('/banner', protect, subirBanner, userController.subirBanner);

// @route   DELETE /api/users/account
// @desc    Delete user account
// @access  Private
router.delete('/account', protect, userController.eliminarCuenta);

module.exports = router; 