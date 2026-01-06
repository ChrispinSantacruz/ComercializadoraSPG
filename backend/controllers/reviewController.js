const Review = require('../models/Review');
const Product = require('../models/Product');
const Order = require('../models/Order');
const User = require('../models/User');
const { validationResult } = require('express-validator');
const { successResponse, errorResponse, paginateData } = require('../utils/helpers');
const { enviarNotificacion } = require('../services/notificationService');

// @desc    Obtener reseñas de un producto
// @route   GET /api/reviews/product/:productId
// @access  Public
const obtenerReseñasProducto = async (req, res) => {
  try {
    const { productId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const ordenar = req.query.ordenar || 'fechaCreacion';
    const calificacion = req.query.calificacion;

    // Construir filtros
    let filtros = { 
      producto: productId,
      estado: 'aprobada'
    };

    if (calificacion) {
      filtros.calificacion = parseInt(calificacion);
    }

    // Opciones de ordenamiento
    let sortOptions = {};
    switch (ordenar) {
      case 'calificacion_asc':
        sortOptions = { calificacion: 1 };
        break;
      case 'calificacion_desc':
        sortOptions = { calificacion: -1 };
        break;
      case 'util':
        sortOptions = { votosUtiles: -1 };
        break;
      default:
        sortOptions = { fechaCreacion: -1 };
    }

    const reseñas = await Review.find(filtros)
      .populate('usuario', 'nombre avatar')
      .populate('respuestaComerciante.comerciante', 'nombre')
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    const total = await Review.countDocuments(filtros);
    const paginacion = paginateData(total, page, limit);

    // Calcular estadísticas de reseñas
    const estadisticas = await Review.aggregate([
      { $match: { producto: productId, estado: 'aprobada' } },
      {
        $group: {
          _id: null,
          promedio: { $avg: '$calificacion' },
          total: { $sum: 1 },
          distribucion: {
            $push: '$calificacion'
          }
        }
      }
    ]);

    let resumenCalificaciones = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    if (estadisticas.length > 0) {
      estadisticas[0].distribucion.forEach(cal => {
        resumenCalificaciones[cal]++;
      });
    }

    successResponse(res, 'Reseñas obtenidas exitosamente', {
      reseñas,
      paginacion,
      estadisticas: {
        promedio: estadisticas[0]?.promedio || 0,
        total: estadisticas[0]?.total || 0,
        distribucion: resumenCalificaciones
      }
    });

  } catch (error) {
    console.error('Error obteniendo reseñas:', error);
    errorResponse(res, 'Error interno del servidor', 500);
  }
};

// @desc    Crear nueva reseña
// @route   POST /api/reviews
// @access  Private (Solo compradores verificados)
const crearReseña = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return errorResponse(res, 'Errores de validación', 400, errors.array());
    }

    const { producto, calificacion, titulo, comentario, aspectos } = req.body;

    // Verificar que el producto existe
    const productoExiste = await Product.findById(producto);
    if (!productoExiste) {
      return errorResponse(res, 'Producto no encontrado', 404);
    }

    // Verificar que el usuario compró el producto
    const pedido = await Order.findOne({
      cliente: req.usuario.id,
      'productos.producto': producto,
      estado: 'entregado'
    });

    if (!pedido) {
      return errorResponse(res, 'Solo puedes reseñar productos que hayas comprado', 403);
    }

    // Verificar que no haya reseña previa
    const reseñaExistente = await Review.findOne({
      usuario: req.usuario.id,
      producto: producto
    });

    if (reseñaExistente) {
      return errorResponse(res, 'Ya has reseñado este producto', 400);
    }

    // Crear reseña
    const datosReseña = {
      usuario: req.usuario.id,
      producto,
      pedido: pedido._id,
      calificacion,
      titulo,
      comentario,
      aspectos,
      verificada: true, // Verificada porque compró el producto
      estado: 'aprobada' // Auto-aprobar por ahora
    };

    // Agregar imágenes si se subieron
    if (req.files && req.files.imagenes) {
      datosReseña.imagenes = req.files.imagenes.map(file => ({
        url: file.path,
        publicId: file.filename,
        descripcion: ''
      }));
    }

    // Agregar videos si se subieron
    if (req.files && req.files.videos) {
      datosReseña.videos = req.files.videos.map(file => ({
        url: file.path,
        publicId: file.filename,
        duracion: 0, // Se puede agregar metadata después
        descripcion: ''
      }));
    }

    const reseña = new Review(datosReseña);

    await reseña.save();

    // Actualizar estadísticas del producto
    await actualizarEstadisticasProducto(producto);
    
    // Actualizar estadísticas del comerciante
    await actualizarEstadisticasComerciante(productoExiste.comerciante);

    // Enviar notificación al comerciante
    try {
      await enviarNotificacion(productoExiste.comerciante, 'nueva_reseña', {
        productoId: producto,
        productoNombre: productoExiste.nombre,
        calificacion,
        reseñaId: reseña._id
      });
    } catch (notifError) {
      console.error('Error enviando notificación:', notifError);
    }

    await reseña.populate([
      { path: 'usuario', select: 'nombre avatar' },
      { path: 'producto', select: 'nombre' }
    ]);

    successResponse(res, 'Reseña creada exitosamente', reseña, 201);

  } catch (error) {
    console.error('Error creando reseña:', error);
    errorResponse(res, 'Error interno del servidor', 500);
  }
};

// @desc    Obtener reseñas del usuario actual
// @route   GET /api/reviews/my-reviews
// @access  Private
const obtenerMisReseñas = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const reseñas = await Review.find({ usuario: req.usuario.id })
      .populate('producto', 'nombre imagenes precio')
      .sort({ fechaCreacion: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    const total = await Review.countDocuments({ usuario: req.usuario.id });
    const paginacion = paginateData(total, page, limit);

    successResponse(res, 'Mis reseñas obtenidas exitosamente', {
      reseñas,
      paginacion
    });

  } catch (error) {
    console.error('Error obteniendo mis reseñas:', error);
    errorResponse(res, 'Error interno del servidor', 500);
  }
};

// @desc    Responder a una reseña (Comerciante)
// @route   POST /api/reviews/:id/respond
// @access  Private (Comerciante - Solo sus productos)
const responderReseña = async (req, res) => {
  try {
    const { respuesta } = req.body;
    const reseñaId = req.params.id;

    if (!respuesta || respuesta.trim().length < 10) {
      return errorResponse(res, 'La respuesta debe tener al menos 10 caracteres', 400);
    }

    const reseña = await Review.findById(reseñaId)
      .populate('producto', 'comerciante nombre');

    if (!reseña) {
      return errorResponse(res, 'Reseña no encontrada', 404);
    }

    // Verificar que es el comerciante del producto
    if (reseña.producto.comerciante.toString() !== req.usuario.id) {
      return errorResponse(res, 'Solo puedes responder reseñas de tus productos', 403);
    }

    // Verificar que no haya respuesta previa
    if (reseña.respuestaComerciante.respuesta) {
      return errorResponse(res, 'Ya has respondido a esta reseña', 400);
    }

    // Agregar respuesta
    reseña.respuestaComerciante = {
      comerciante: req.usuario.id,
      respuesta,
      fechaRespuesta: new Date()
    };

    await reseña.save();

    // Notificar al usuario que escribió la reseña
    try {
      await enviarNotificacion(reseña.usuario, 'respuesta_reseña', {
        productoNombre: reseña.producto.nombre,
        comercianteNombre: req.usuario.nombre,
        reseñaId: reseña._id
      });
    } catch (notifError) {
      console.error('Error enviando notificación:', notifError);
    }

    await reseña.populate([
      { path: 'usuario', select: 'nombre avatar' },
      { path: 'respuestaComerciante.comerciante', select: 'nombre' }
    ]);

    successResponse(res, 'Respuesta agregada exitosamente', reseña);

  } catch (error) {
    console.error('Error respondiendo reseña:', error);
    errorResponse(res, 'Error interno del servidor', 500);
  }
};

// @desc    Votar utilidad de reseña
// @route   POST /api/reviews/:id/vote
// @access  Private
const votarUtilidadReseña = async (req, res) => {
  try {
    const { util } = req.body; // true para útil, false para no útil
    const reseñaId = req.params.id;

    if (typeof util !== 'boolean') {
      return errorResponse(res, 'El voto debe ser true (útil) o false (no útil)', 400);
    }

    const reseña = await Review.findById(reseñaId);
    if (!reseña) {
      return errorResponse(res, 'Reseña no encontrada', 404);
    }

    // Verificar que no es su propia reseña
    if (reseña.usuario.toString() === req.usuario.id) {
      return errorResponse(res, 'No puedes votar tu propia reseña', 400);
    }

    // Verificar si ya votó
    const votoExistente = reseña.votos.find(v => v.usuario.toString() === req.usuario.id);

    if (votoExistente) {
      // Actualizar voto existente
      votoExistente.util = util;
    } else {
      // Agregar nuevo voto
      reseña.votos.push({
        usuario: req.usuario.id,
        util
      });
    }

    // Recalcular contadores
    reseña.votosUtiles = reseña.votos.filter(v => v.util).length;
    reseña.votosNoUtiles = reseña.votos.filter(v => !v.util).length;

    await reseña.save();

    successResponse(res, 'Voto registrado exitosamente', {
      votosUtiles: reseña.votosUtiles,
      votosNoUtiles: reseña.votosNoUtiles
    });

  } catch (error) {
    console.error('Error votando reseña:', error);
    errorResponse(res, 'Error interno del servidor', 500);
  }
};

// @desc    Obtener reseñas pendientes de moderación (Admin)
// @route   GET /api/reviews/pending
// @access  Private (Admin)
const obtenerReseñasPendientes = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const reseñas = await Review.find({ estado: 'pendiente' })
      .populate('usuario', 'nombre email avatar')
      .populate('producto', 'nombre comerciante')
      .sort({ fechaCreacion: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Review.countDocuments({ estado: 'pendiente' });
    const paginacion = paginateData(total, page, limit);

    successResponse(res, 'Reseñas pendientes obtenidas exitosamente', {
      reseñas,
      paginacion
    });

  } catch (error) {
    console.error('Error obteniendo reseñas pendientes:', error);
    errorResponse(res, 'Error interno del servidor', 500);
  }
};

// @desc    Moderar reseña (Admin)
// @route   PUT /api/reviews/:id/moderate
// @access  Private (Admin)
const moderarReseña = async (req, res) => {
  try {
    const { estado, razonRechazo } = req.body;
    const reseñaId = req.params.id;

    if (!['aprobada', 'rechazada'].includes(estado)) {
      return errorResponse(res, 'Estado inválido. Debe ser "aprobada" o "rechazada"', 400);
    }

    if (estado === 'rechazada' && !razonRechazo) {
      return errorResponse(res, 'La razón de rechazo es requerida', 400);
    }

    const reseña = await Review.findById(reseñaId)
      .populate('usuario', 'nombre email')
      .populate('producto', 'nombre');

    if (!reseña) {
      return errorResponse(res, 'Reseña no encontrada', 404);
    }

    reseña.estado = estado;
    if (estado === 'rechazada') {
      reseña.razonRechazo = razonRechazo;
    }
    reseña.fechaModeracion = new Date();
    reseña.moderadoPor = req.usuario.id;

    await reseña.save();

    // Actualizar estadísticas del producto y comerciante
    await actualizarEstadisticasProducto(reseña.producto._id);
    
    // Obtener el comerciante del producto para actualizar sus estadísticas
    const producto = await Product.findById(reseña.producto._id).select('comerciante');
    if (producto) {
      await actualizarEstadisticasComerciante(producto.comerciante);
    }

    // Notificar al usuario
    try {
      await enviarNotificacion(reseña.usuario._id, 'reseña_moderada', {
        estado,
        productoNombre: reseña.producto.nombre,
        razonRechazo: estado === 'rechazada' ? razonRechazo : null
      });
    } catch (notifError) {
      console.error('Error enviando notificación:', notifError);
    }

    successResponse(res, `Reseña ${estado} exitosamente`, reseña);

  } catch (error) {
    console.error('Error moderando reseña:', error);
    errorResponse(res, 'Error interno del servidor', 500);
  }
};

// @desc    Obtener reseñas de productos del comerciante
// @route   GET /api/reviews/merchant-reviews
// @access  Private (Comerciante)
const obtenerReseñasComerciante = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const estado = req.query.estado || 'aprobada';

    // Buscar productos del comerciante
    const productos = await Product.find({ comerciante: req.usuario.id }).select('_id');
    const productosIds = productos.map(p => p._id);

    const reseñas = await Review.find({ 
      producto: { $in: productosIds },
      estado 
    })
      .populate('usuario', 'nombre avatar')
      .populate('producto', 'nombre imagenes')
      .sort({ fechaCreacion: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Review.countDocuments({ 
      producto: { $in: productosIds },
      estado 
    });
    const paginacion = paginateData(total, page, limit);

    // Estadísticas generales
    const estadisticas = await Review.aggregate([
      { 
        $match: { 
          producto: { $in: productosIds },
          estado: 'aprobada'
        } 
      },
      {
        $group: {
          _id: null,
          promedio: { $avg: '$calificacion' },
          total: { $sum: 1 },
          sinResponder: {
            $sum: {
              $cond: [
                { $eq: ['$respuestaComerciante.respuesta', null] },
                1,
                0
              ]
            }
          }
        }
      }
    ]);

    successResponse(res, 'Reseñas del comerciante obtenidas exitosamente', {
      reseñas,
      paginacion,
      estadisticas: estadisticas[0] || { promedio: 0, total: 0, sinResponder: 0 }
    });

  } catch (error) {
    console.error('Error obteniendo reseñas del comerciante:', error);
    errorResponse(res, 'Error interno del servidor', 500);
  }
};

// Función auxiliar para actualizar estadísticas del producto
const actualizarEstadisticasProducto = async (productoId) => {
  try {
    const estadisticas = await Review.aggregate([
      { $match: { producto: productoId, estado: 'aprobada' } },
      {
        $group: {
          _id: null,
          promedio: { $avg: '$calificacion' },
          total: { $sum: 1 }
        }
      }
    ]);

    if (estadisticas.length > 0) {
      await Product.findByIdAndUpdate(productoId, {
        'estadisticas.calificacionPromedio': Math.round(estadisticas[0].promedio * 10) / 10,
        'estadisticas.totalReseñas': estadisticas[0].total
      });
    }
  } catch (error) {
    console.error('Error actualizando estadísticas del producto:', error);
  }
};

// Función auxiliar para actualizar estadísticas del comerciante
const actualizarEstadisticasComerciante = async (comercianteId) => {
  try {
    // Obtener todos los productos del comerciante
    const productos = await Product.find({ comerciante: comercianteId }).select('_id');
    const productosIds = productos.map(p => p._id);

    if (productosIds.length === 0) {
      return;
    }

    // Calcular estadísticas de todas las reseñas de los productos del comerciante
    const estadisticas = await Review.aggregate([
      { 
        $match: { 
          producto: { $in: productosIds },
          estado: 'aprobada'
        }
      },
      {
        $group: {
          _id: null,
          calificacionPromedio: { $avg: '$calificacion' },
          totalReseñas: { $sum: 1 }
        }
      }
    ]);

    if (estadisticas.length > 0) {
      await User.findByIdAndUpdate(comercianteId, {
        'estadisticasComerciante.calificacionPromedio': Math.round(estadisticas[0].calificacionPromedio * 10) / 10,
        'estadisticasComerciante.totalReseñas': estadisticas[0].totalReseñas
      });
      
      console.log(`✅ Estadísticas del comerciante ${comercianteId} actualizadas:`, {
        calificacionPromedio: Math.round(estadisticas[0].calificacionPromedio * 10) / 10,
        totalReseñas: estadisticas[0].totalReseñas
      });
    }
  } catch (error) {
    console.error('Error actualizando estadísticas del comerciante:', error);
  }
};

// @desc    Obtener estadísticas de reseñas del comerciante
// @route   GET /api/reviews/merchant/stats
// @access  Private (Comerciante)
const obtenerEstadisticasComerciante = async (req, res) => {
  try {
    const comercianteId = req.usuario.id;

    // Obtener productos del comerciante
    const productos = await Product.find({ comerciante: comercianteId }).select('_id');
    const productosIds = productos.map(p => p._id);

    if (productosIds.length === 0) {
      return successResponse(res, 'Estadísticas obtenidas exitosamente', {
        totalReseñas: 0,
        calificacionPromedio: 0,
        distribucionCalificaciones: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
        reseñasRecientes: []
      });
    }

    // Estadísticas generales
    const estadisticasGenerales = await Review.aggregate([
      { 
        $match: { 
          producto: { $in: productosIds },
          estado: 'aprobada'
        }
      },
      {
        $group: {
          _id: null,
          totalReseñas: { $sum: 1 },
          calificacionPromedio: { $avg: '$calificacion' },
          distribucion: { $push: '$calificacion' }
        }
      }
    ]);

    // Distribución de calificaciones
    let distribucionCalificaciones = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    if (estadisticasGenerales.length > 0) {
      estadisticasGenerales[0].distribucion.forEach(cal => {
        distribucionCalificaciones[cal]++;
      });
    }

    // Reseñas recientes (últimas 5)
    const reseñasRecientes = await Review.find({
      producto: { $in: productosIds },
      estado: 'aprobada'
    })
      .populate('usuario', 'nombre')
      .populate('producto', 'nombre')
      .sort({ fechaCreacion: -1 })
      .limit(5)
      .lean();

    const resultado = {
      totalReseñas: estadisticasGenerales[0]?.totalReseñas || 0,
      calificacionPromedio: Math.round((estadisticasGenerales[0]?.calificacionPromedio || 0) * 10) / 10,
      distribucionCalificaciones,
      reseñasRecientes: reseñasRecientes.map(r => ({
        _id: r._id,
        calificacion: r.calificacion,
        comentario: r.comentario,
        fechaCreacion: r.fechaCreacion,
        usuario: r.usuario?.nombre || 'Usuario anónimo',
        producto: r.producto?.nombre || 'Producto eliminado'
      }))
    };

    successResponse(res, 'Estadísticas obtenidas exitosamente', resultado);

  } catch (error) {
    console.error('Error obteniendo estadísticas de reseñas del comerciante:', error);
    errorResponse(res, 'Error interno del servidor', 500);
  }
};

module.exports = {
  obtenerReseñasProducto,
  crearReseña,
  obtenerMisReseñas,
  responderReseña,
  votarUtilidadReseña,
  obtenerReseñasPendientes,
  moderarReseña,
  obtenerReseñasComerciante,
  obtenerEstadisticasComerciante
}; 