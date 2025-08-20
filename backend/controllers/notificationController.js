const Notification = require('../models/Notification');
const User = require('../models/User');
const { successResponse, errorResponse } = require('../utils/helpers');

// @desc    Obtener notificaciones del usuario
// @route   GET /api/notifications/user
// @access  Private
const obtenerNotificacionesUsuario = async (req, res) => {
  try {
    const { page = 1, limit = 20, estado } = req.query;
    const usuarioId = req.usuario.id;

    // Construir query
    const query = { usuario: usuarioId };
    if (estado) {
      query.estado = estado;
    }

    // Obtener notificaciones
    const notificaciones = await Notification.find(query)
      .sort({ fechaCreacion: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    // Contar total y no leídas
    const total = await Notification.countDocuments(query);
    const noLeidas = await Notification.countDocuments({
      usuario: usuarioId,
      estado: 'no_leida'
    });

    successResponse(res, 'Notificaciones obtenidas exitosamente', {
      notifications: notificaciones,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit)
      },
      unreadCount: noLeidas
    });

  } catch (error) {
    console.error('Error obteniendo notificaciones:', error);
    errorResponse(res, 'Error interno del servidor', 500);
  }
};

// @desc    Marcar notificación como leída
// @route   PUT /api/notifications/:id/read
// @access  Private
const marcarComoLeida = async (req, res) => {
  try {
    const { id } = req.params;
    const usuarioId = req.usuario.id;

    const notificacion = await Notification.findOneAndUpdate(
      { _id: id, usuario: usuarioId },
      { 
        estado: 'leida',
        fechaLeida: new Date()
      },
      { new: true }
    );

    if (!notificacion) {
      return errorResponse(res, 'Notificación no encontrada', 404);
    }

    successResponse(res, 'Notificación marcada como leída', notificacion);

  } catch (error) {
    console.error('Error marcando notificación como leída:', error);
    errorResponse(res, 'Error interno del servidor', 500);
  }
};

// @desc    Marcar todas las notificaciones como leídas
// @route   PUT /api/notifications/read-all
// @access  Private
const marcarTodasComoLeidas = async (req, res) => {
  try {
    const usuarioId = req.usuario.id;

    const result = await Notification.updateMany(
      { usuario: usuarioId, estado: 'no_leida' },
      { 
        estado: 'leida',
        fechaLeida: new Date()
      }
    );

    successResponse(res, 'Todas las notificaciones marcadas como leídas', {
      updatedCount: result.modifiedCount
    });

  } catch (error) {
    console.error('Error marcando todas las notificaciones como leídas:', error);
    errorResponse(res, 'Error interno del servidor', 500);
  }
};

// @desc    Archivar notificación
// @route   PUT /api/notifications/:id/archive
// @access  Private
const archivarNotificacion = async (req, res) => {
  try {
    const { id } = req.params;
    const usuarioId = req.usuario.id;

    const notificacion = await Notification.findOneAndUpdate(
      { _id: id, usuario: usuarioId },
      { 
        estado: 'archivada',
        fechaArchivada: new Date()
      },
      { new: true }
    );

    if (!notificacion) {
      return errorResponse(res, 'Notificación no encontrada', 404);
    }

    successResponse(res, 'Notificación archivada', notificacion);

  } catch (error) {
    console.error('Error archivando notificación:', error);
    errorResponse(res, 'Error interno del servidor', 500);
  }
};

// @desc    Eliminar notificación
// @route   DELETE /api/notifications/:id
// @access  Private
const eliminarNotificacion = async (req, res) => {
  try {
    const { id } = req.params;
    const usuarioId = req.usuario.id;

    const notificacion = await Notification.findOneAndDelete({
      _id: id,
      usuario: usuarioId
    });

    if (!notificacion) {
      return errorResponse(res, 'Notificación no encontrada', 404);
    }

    successResponse(res, 'Notificación eliminada');

  } catch (error) {
    console.error('Error eliminando notificación:', error);
    errorResponse(res, 'Error interno del servidor', 500);
  }
};

// @desc    Obtener estadísticas de notificaciones
// @route   GET /api/notifications/stats
// @access  Private
const obtenerEstadisticas = async (req, res) => {
  try {
    const usuarioId = req.usuario.id;

    const [total, noLeidas, archivadas] = await Promise.all([
      Notification.countDocuments({ usuario: usuarioId }),
      Notification.countDocuments({ usuario: usuarioId, estado: 'no_leida' }),
      Notification.countDocuments({ usuario: usuarioId, estado: 'archivada' })
    ]);

    const leidas = total - noLeidas - archivadas;

    successResponse(res, 'Estadísticas obtenidas', {
      total,
      noLeidas,
      leidas,
      archivadas
    });

  } catch (error) {
    console.error('Error obteniendo estadísticas:', error);
    errorResponse(res, 'Error interno del servidor', 500);
  }
};

module.exports = {
  obtenerNotificacionesUsuario,
  marcarComoLeida,
  marcarTodasComoLeidas,
  archivarNotificacion,
  eliminarNotificacion,
  obtenerEstadisticas
}; 