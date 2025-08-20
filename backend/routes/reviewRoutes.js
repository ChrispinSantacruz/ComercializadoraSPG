const express = require('express');
const router = express.Router();
const {
  obtenerReseñasProducto,
  crearReseña,
  obtenerMisReseñas,
  responderReseña,
  votarUtilidadReseña,
  obtenerReseñasPendientes,
  moderarReseña,
  obtenerReseñasComerciante,
  obtenerEstadisticasComerciante
} = require('../controllers/reviewController');
const { protect, authorize } = require('../middlewares/auth');
const { validarReseña } = require('../middlewares/validation');

// @route   POST /api/reviews
// @desc    Crear nueva reseña
// @access  Private (Cliente)
router.post('/', protect, authorize('cliente'), validarReseña, crearReseña);

// @route   GET /api/reviews/product/:productId
// @desc    Obtener reseñas de un producto
// @access  Public
router.get('/product/:productId', obtenerReseñasProducto);

// @route   GET /api/reviews/mis-reseñas
// @desc    Obtener reseñas del usuario autenticado
// @access  Private
router.get('/mis-reseñas', protect, obtenerMisReseñas);

// @route   GET /api/reviews/merchant/stats
// @desc    Obtener estadísticas de reseñas del comerciante
// @access  Private (Comerciante)
router.get('/merchant/stats', protect, authorize('comerciante'), obtenerEstadisticasComerciante);

// @route   GET /api/reviews/merchant-reviews
// @desc    Obtener reseñas de productos del comerciante
// @access  Private (Comerciante)
router.get('/merchant-reviews', protect, authorize('comerciante'), obtenerReseñasComerciante);

// @route   GET /api/reviews/pending
// @desc    Obtener reseñas pendientes de moderación
// @access  Private (Admin)
router.get('/pending', protect, authorize('administrador'), obtenerReseñasPendientes);

// @route   POST /api/reviews/:id/vote
// @desc    Votar utilidad de una reseña
// @access  Private
router.post('/:id/vote', protect, votarUtilidadReseña);

// @route   POST /api/reviews/:id/respond
// @desc    Responder a una reseña (solo comerciante del producto)
// @access  Private (Comerciante)
router.post('/:id/respond', protect, authorize('comerciante'), responderReseña);

// @route   PUT /api/reviews/:id/moderate
// @desc    Moderar reseña (Admin)
// @access  Private (Admin)
router.put('/:id/moderate', protect, authorize('administrador'), moderarReseña);

module.exports = router; 