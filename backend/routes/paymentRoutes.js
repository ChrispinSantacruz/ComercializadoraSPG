const express = require('express');
const router = express.Router();
const {
  obtenerBancosPSE,
  procesarPagoPSE,
  procesarPagoNequi,
  procesarPagoTarjeta,
  consultarEstadoTransaccion,
  webhookConfirmacionPago,
  obtenerMetodosPagoDisponibles
} = require('../controllers/paymentController');
const { protect, authorize } = require('../middlewares/auth');

// @route   GET /api/payments/methods
// @desc    Obtener métodos de pago disponibles
// @access  Public
router.get('/methods', obtenerMetodosPagoDisponibles);

// @route   GET /api/payments/pse/banks
// @desc    Obtener bancos disponibles para PSE
// @access  Public
router.get('/pse/banks', obtenerBancosPSE);

// @route   POST /api/payments/pse
// @desc    Procesar pago con PSE
// @access  Private
router.post('/pse', protect, procesarPagoPSE);

// @route   POST /api/payments/nequi
// @desc    Procesar pago con Nequi
// @access  Private
router.post('/nequi', protect, procesarPagoNequi);

// @route   POST /api/payments/tarjeta
// @desc    Procesar pago con tarjeta
// @access  Private
router.post('/tarjeta', protect, procesarPagoTarjeta);

// @route   GET /api/payments/transaction/:transactionId
// @desc    Consultar estado de transacción
// @access  Private
router.get('/transaction/:transactionId', protect, consultarEstadoTransaccion);

// @route   POST /api/payments/webhook
// @desc    Webhook de confirmación de pago
// @access  Public (en producción requiere verificación de firma)
router.post('/webhook', webhookConfirmacionPago);

module.exports = router; 