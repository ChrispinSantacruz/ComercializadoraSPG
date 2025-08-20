const express = require('express');
const router = express.Router();
const {
  crearDireccion,
  obtenerDirecciones,
  obtenerDireccionPorId,
  actualizarDireccion,
  eliminarDireccion,
  marcarComoPredeterminada
} = require('../controllers/addressController');
const { protect } = require('../middlewares/auth');
const { validarDireccion } = require('../middlewares/validation');

// @route   POST /api/addresses
// @desc    Crear nueva dirección
// @access  Private
router.post('/', protect, validarDireccion, crearDireccion);

// @route   GET /api/addresses
// @desc    Obtener direcciones del usuario
// @access  Private
router.get('/', protect, obtenerDirecciones);

// @route   GET /api/addresses/:id
// @desc    Obtener dirección por ID
// @access  Private
router.get('/:id', protect, obtenerDireccionPorId);

// @route   PUT /api/addresses/:id
// @desc    Actualizar dirección
// @access  Private
router.put('/:id', protect, validarDireccion, actualizarDireccion);

// @route   DELETE /api/addresses/:id
// @desc    Eliminar dirección
// @access  Private
router.delete('/:id', protect, eliminarDireccion);

// @route   PUT /api/addresses/:id/default
// @desc    Establecer dirección como predeterminada
// @access  Private
router.put('/:id/default', protect, marcarComoPredeterminada);

module.exports = router; 