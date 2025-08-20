const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth');
const {
  obtenerNotificacionesUsuario,
  marcarComoLeida,
  marcarTodasComoLeidas,
  archivarNotificacion,
  eliminarNotificacion,
  obtenerEstadisticas
} = require('../controllers/notificationController');

// Todas las rutas requieren autenticación
router.use(protect);

// Obtener notificaciones del usuario
router.get('/user', obtenerNotificacionesUsuario);

// Obtener estadísticas
router.get('/stats', obtenerEstadisticas);

// Marcar notificación como leída
router.put('/:id/read', marcarComoLeida);

// Marcar todas como leídas
router.put('/read-all', marcarTodasComoLeidas);

// Archivar notificación
router.put('/:id/archive', archivarNotificacion);

// Eliminar notificación
router.delete('/:id', eliminarNotificacion);

module.exports = router; 