const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
const { validationResult } = require('express-validator');
const { successResponse, errorResponse, paginateData } = require('../utils/helpers');
const { enviarNotificacion } = require('../services/notificationService');

// @desc    Obtener perfil completo del usuario
// @route   GET /api/users/profile
// @access  Private
const obtenerPerfilCompleto = async (req, res) => {
  try {
    const usuario = await User.findById(req.usuario.id)
      .populate('favoritos', 'nombre precio imagenes comerciante estado')
      .populate('historialPedidos')
      .select('-password');

    if (!usuario) {
      return errorResponse(res, 'Usuario no encontrado', 404);
    }

    // Estadísticas del usuario
    const estadisticas = {
      totalPedidos: usuario.historialPedidos.length,
      totalFavoritos: usuario.favoritos.length,
      fechaRegistro: usuario.fechaCreacion
    };

    // Si es comerciante, agregar estadísticas específicas
    if (usuario.rol === 'comerciante') {
      const Product = require('../models/Product');
      const totalProductos = await Product.countDocuments({ 
        comerciante: usuario._id 
      });
      
      estadisticas.totalProductos = totalProductos;
      estadisticas.estadisticasComerciante = usuario.estadisticasComerciante;
    }

    successResponse(res, 'Perfil obtenido exitosamente', {
      usuario,
      estadisticas
    });

  } catch (error) {
    console.error('Error obteniendo perfil:', error);
    errorResponse(res, 'Error interno del servidor', 500);
  }
};

// @desc    Actualizar perfil del usuario
// @route   PUT /api/users/profile
// @access  Private
const actualizarPerfil = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return errorResponse(res, 'Errores de validación', 400, errors.array());
    }

    let camposPermitidos = [
      'nombre', 'telefono', 'configuracion', 'direccion'
    ];

    // Permitir campos adicionales para comerciantes
    if (req.usuario.rol === 'comerciante') {
      camposPermitidos.push(
        'nombreEmpresa', 
        'descripcionEmpresa', 
        'categoriaEmpresa', 
        'sitioWeb', 
        'redesSociales',
        'tipoDocumento',
        'numeroDocumento'
      );
    }

    console.log('🔄 Actualizando perfil para:', req.usuario.rol, 'Campos permitidos:', camposPermitidos);

    const actualizaciones = {};
    camposPermitidos.forEach(campo => {
      if (req.body[campo] !== undefined) {
        actualizaciones[campo] = req.body[campo];
        console.log(`✓ Actualizando ${campo}:`, req.body[campo]);
      }
    });

    // Si hay archivo de avatar subido
    if (req.file) {
      actualizaciones.avatar = `/uploads/avatars/${req.file.filename}`;
    }

    const usuario = await User.findByIdAndUpdate(
      req.usuario.id,
      { ...actualizaciones, fechaActualizacion: new Date() },
      { new: true, runValidators: true }
    ).select('-password');

    if (!usuario) {
      return errorResponse(res, 'Usuario no encontrado', 404);
    }

    successResponse(res, 'Perfil actualizado exitosamente', usuario);

  } catch (error) {
    console.error('Error actualizando perfil:', error);
    if (error.name === 'ValidationError') {
      return errorResponse(res, 'Error de validación', 400, error.errors);
    }
    errorResponse(res, 'Error interno del servidor', 500);
  }
};

// @desc    Obtener favoritos del usuario
// @route   GET /api/users/favorites
// @access  Private
const obtenerFavoritos = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const categoria = req.query.categoria;
    const ordenar = req.query.ordenar || 'fechaAgregado';

    const usuario = await User.findById(req.usuario.id);
    let favoritosIds = usuario.favoritos || [];

    if (favoritosIds.length === 0) {
      return successResponse(res, 'Favoritos obtenidos exitosamente', {
        productos: [],
        paginacion: paginateData(0, page, limit)
      });
    }

    // Construir filtros
    let filtros = { 
      _id: { $in: favoritosIds },
      estado: 'aprobado'
    };

    if (categoria) {
      filtros.categoria = categoria;
    }

    // Opciones de ordenamiento
    let sortOptions = {};
    switch (ordenar) {
      case 'precio_asc':
        sortOptions = { precio: 1 };
        break;
      case 'precio_desc':
        sortOptions = { precio: -1 };
        break;
      case 'nombre':
        sortOptions = { nombre: 1 };
        break;
      case 'fechaAgregado':
        // Mantener el orden de favoritos
        sortOptions = { fechaCreacion: -1 };
        break;
      default:
        sortOptions = { fechaCreacion: -1 };
    }

    const productos = await Product.find(filtros)
      .populate('comerciante', 'nombre estadisticasComerciante')
      .populate('categoria', 'nombre')
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    const total = await Product.countDocuments(filtros);
    const paginacion = paginateData(total, page, limit);

    successResponse(res, 'Favoritos obtenidos exitosamente', {
      productos,
      paginacion
    });

  } catch (error) {
    console.error('Error obteniendo favoritos:', error);
    errorResponse(res, 'Error interno del servidor', 500);
  }
};

// @desc    Agregar producto a favoritos
// @route   POST /api/users/favorites/:productId
// @access  Private
const agregarAFavoritos = async (req, res) => {
  try {
    const { productId } = req.params;

    // Verificar que el producto existe y está aprobado
    const producto = await Product.findById(productId);
    if (!producto) {
      return errorResponse(res, 'Producto no encontrado', 404);
    }

    if (producto.estado !== 'aprobado') {
      return errorResponse(res, 'Producto no disponible', 400);
    }

    const usuario = await User.findById(req.usuario.id);

    // Verificar si ya está en favoritos
    if (usuario.favoritos.includes(productId)) {
      return errorResponse(res, 'El producto ya está en favoritos', 400);
    }

    // Agregar a favoritos
    usuario.favoritos.push(productId);
    await usuario.save();

    // Actualizar contador en el producto
    await Product.findByIdAndUpdate(productId, {
      $inc: { 'estadisticas.totalFavoritos': 1 }
    });

    // Enviar notificación al comerciante
    try {
      await enviarNotificacion(producto.comerciante, 'producto_favorito', {
        productoId: producto._id,
        productoNombre: producto.nombre,
        usuarioNombre: usuario.nombre
      });
    } catch (notifError) {
      console.error('Error enviando notificación:', notifError);
    }

    successResponse(res, 'Producto agregado a favoritos exitosamente', {
      totalFavoritos: usuario.favoritos.length
    });

  } catch (error) {
    console.error('Error agregando a favoritos:', error);
    errorResponse(res, 'Error interno del servidor', 500);
  }
};

// @desc    Quitar producto de favoritos
// @route   DELETE /api/users/favorites/:productId
// @access  Private
const quitarDeFavoritos = async (req, res) => {
  try {
    const { productId } = req.params;

    const usuario = await User.findById(req.usuario.id);

    // Verificar si está en favoritos
    if (!usuario.favoritos.includes(productId)) {
      return errorResponse(res, 'El producto no está en favoritos', 400);
    }

    // Quitar de favoritos
    usuario.favoritos = usuario.favoritos.filter(id => id.toString() !== productId);
    await usuario.save();

    // Actualizar contador en el producto
    await Product.findByIdAndUpdate(productId, {
      $inc: { 'estadisticas.totalFavoritos': -1 }
    });

    successResponse(res, 'Producto removido de favoritos exitosamente', {
      totalFavoritos: usuario.favoritos.length
    });

  } catch (error) {
    console.error('Error quitando de favoritos:', error);
    errorResponse(res, 'Error interno del servidor', 500);
  }
};

// @desc    Verificar si producto está en favoritos
// @route   GET /api/users/favorites/:productId/check
// @access  Private
const verificarFavorito = async (req, res) => {
  try {
    const { productId } = req.params;

    const usuario = await User.findById(req.usuario.id);
    const esFavorito = usuario.favoritos.includes(productId);

    successResponse(res, 'Estado de favorito verificado', {
      esFavorito,
      totalFavoritos: usuario.favoritos.length
    });

  } catch (error) {
    console.error('Error verificando favorito:', error);
    errorResponse(res, 'Error interno del servidor', 500);
  }
};

// @desc    Obtener métodos de pago guardados
// @route   GET /api/users/payment-methods
// @access  Private
const obtenerMetodosPago = async (req, res) => {
  try {
    const usuario = await User.findById(req.usuario.id).select('metodosPago');

    // Ocultar información sensible
    const metodosSeguros = usuario.metodosPago.map(metodo => ({
      _id: metodo._id,
      tipo: metodo.tipo,
      nombre: metodo.nombre,
      ultimosCuatroDigitos: metodo.ultimosCuatroDigitos,
      tipoTarjeta: metodo.tipoTarjeta,
      banco: metodo.banco,
      fechaCreacion: metodo.fechaCreacion
    }));

    successResponse(res, 'Métodos de pago obtenidos exitosamente', metodosSeguros);

  } catch (error) {
    console.error('Error obteniendo métodos de pago:', error);
    errorResponse(res, 'Error interno del servidor', 500);
  }
};

// @desc    Agregar método de pago
// @route   POST /api/users/payment-methods
// @access  Private
const agregarMetodoPago = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return errorResponse(res, 'Errores de validación', 400, errors.array());
    }

    const usuario = await User.findById(req.usuario.id);
    
    // Verificar límite de métodos de pago (máximo 5)
    if (usuario.metodosPago.length >= 5) {
      return errorResponse(res, 'Máximo 5 métodos de pago permitidos', 400);
    }

    const nuevoMetodo = req.body;
    usuario.metodosPago.push(nuevoMetodo);
    await usuario.save();

    // Retornar método agregado sin información sensible
    const metodosSeguro = usuario.metodosPago[usuario.metodosPago.length - 1];
    const metodoRespuesta = {
      _id: metodosSeguro._id,
      tipo: metodosSeguro.tipo,
      nombre: metodosSeguro.nombre,
      ultimosCuatroDigitos: metodosSeguro.ultimosCuatroDigitos,
      tipoTarjeta: metodosSeguro.tipoTarjeta,
      banco: metodosSeguro.banco,
      fechaCreacion: metodosSeguro.fechaCreacion
    };

    successResponse(res, 'Método de pago agregado exitosamente', metodoRespuesta, 201);

  } catch (error) {
    console.error('Error agregando método de pago:', error);
    errorResponse(res, 'Error interno del servidor', 500);
  }
};

// @desc    Eliminar método de pago
// @route   DELETE /api/users/payment-methods/:methodId
// @access  Private
const eliminarMetodoPago = async (req, res) => {
  try {
    const { methodId } = req.params;

    const usuario = await User.findById(req.usuario.id);
    
    // Verificar que el método existe
    const metodoIndex = usuario.metodosPago.findIndex(m => m._id.toString() === methodId);
    if (metodoIndex === -1) {
      return errorResponse(res, 'Método de pago no encontrado', 404);
    }

    // Eliminar método
    usuario.metodosPago.splice(metodoIndex, 1);
    await usuario.save();

    successResponse(res, 'Método de pago eliminado exitosamente');

  } catch (error) {
    console.error('Error eliminando método de pago:', error);
    errorResponse(res, 'Error interno del servidor', 500);
  }
};

// @desc    Obtener historial de pedidos
// @route   GET /api/users/order-history
// @access  Private
const obtenerHistorialPedidos = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const estado = req.query.estado;

    let filtros = { cliente: req.usuario.id };
    if (estado) {
      filtros.estado = estado;
    }

    const pedidos = await Order.find(filtros)
      .populate('productos.producto', 'nombre imagenes')
      .sort({ fechaCreacion: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    const total = await Order.countDocuments(filtros);
    const paginacion = paginateData(total, page, limit);

    // Estadísticas del historial
    const estadisticas = await Order.aggregate([
      { $match: { cliente: req.usuario.id } },
      {
        $group: {
          _id: null,
          totalGastado: { $sum: '$total' },
          totalPedidos: { $sum: 1 },
          estadosCount: {
            $push: '$estado'
          }
        }
      }
    ]);

    let resumenEstados = {};
    if (estadisticas.length > 0) {
      estadisticas[0].estadosCount.forEach(estado => {
        resumenEstados[estado] = (resumenEstados[estado] || 0) + 1;
      });
    }

    successResponse(res, 'Historial de pedidos obtenido exitosamente', {
      pedidos,
      paginacion,
      estadisticas: estadisticas[0] || { totalGastado: 0, totalPedidos: 0 },
      resumenEstados
    });

  } catch (error) {
    console.error('Error obteniendo historial:', error);
    errorResponse(res, 'Error interno del servidor', 500);
  }
};

// @desc    Actualizar configuración de notificaciones
// @route   PUT /api/users/notification-settings
// @access  Private
const actualizarConfiguracionNotificaciones = async (req, res) => {
  try {
    const { configuracionNotificaciones } = req.body;

    const usuario = await User.findByIdAndUpdate(
      req.usuario.id,
      { 
        'configuracion.notificaciones': configuracionNotificaciones,
        fechaActualizacion: new Date()
      },
      { new: true }
    ).select('configuracion.notificaciones');

    successResponse(res, 'Configuración de notificaciones actualizada', 
      usuario.configuracion.notificaciones);

  } catch (error) {
    console.error('Error actualizando configuración de notificaciones:', error);
    errorResponse(res, 'Error interno del servidor', 500);
  }
};

// @desc    Subir avatar del usuario
// @route   POST /api/users/avatar
// @access  Private
const subirAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return errorResponse(res, 'No se ha subido ningún archivo', 400);
    }

    // La URL del avatar ya está procesada por Cloudinary en req.file.path
    const avatarUrl = req.file.path;

    const usuario = await User.findByIdAndUpdate(
      req.usuario.id,
      { 
        avatar: avatarUrl,
        fechaActualizacion: new Date()
      },
      { new: true }
    ).select('avatar nombre');

    successResponse(res, 'Avatar actualizado exitosamente', {
      avatar: usuario.avatar,
      nombre: usuario.nombre
    });

  } catch (error) {
    console.error('Error subiendo avatar:', error);
    errorResponse(res, 'Error interno del servidor', 500);
  }
};

// @desc    Subir banner de comerciante
// @route   POST /api/users/banner
// @access  Private
const subirBanner = async (req, res) => {
  try {
    // Verificar que el usuario sea comerciante
    const usuario = await User.findById(req.usuario.id);
    
    if (usuario.rol !== 'comerciante') {
      return errorResponse(res, 'Solo los comerciantes pueden subir banners', 403);
    }

    if (!req.file) {
      return errorResponse(res, 'No se ha subido ningún archivo', 400);
    }

    // La URL del banner ya está procesada por el middleware
    const bannerUrl = req.file.path;

    const usuarioActualizado = await User.findByIdAndUpdate(
      req.usuario.id,
      { 
        banner: bannerUrl,
        fechaActualizacion: new Date()
      },
      { new: true }
    ).select('-password');

    successResponse(res, 'Banner actualizado exitosamente', usuarioActualizado);

  } catch (error) {
    console.error('Error subiendo banner:', error);
    errorResponse(res, 'Error interno del servidor', 500);
  }
};

// @desc    Eliminar cuenta de usuario
// @route   DELETE /api/users/account
// @access  Private
const eliminarCuenta = async (req, res) => {
  try {
    const { password } = req.body;

    if (!password) {
      return errorResponse(res, 'La contraseña es requerida para eliminar la cuenta', 400);
    }

    // Verificar contraseña
    const usuario = await User.findById(req.usuario.id).select('+password');
    const passwordValida = await usuario.compararPassword(password);

    if (!passwordValida) {
      return errorResponse(res, 'Contraseña incorrecta', 401);
    }

    // Verificar que no tenga pedidos pendientes
    const pedidosPendientes = await Order.countDocuments({
      cliente: req.usuario.id,
      estado: { $in: ['pendiente', 'confirmado', 'procesando', 'enviado'] }
    });

    if (pedidosPendientes > 0) {
      return errorResponse(res, 'No puedes eliminar la cuenta con pedidos pendientes', 400);
    }

    // Si es comerciante, verificar que no tenga productos activos
    if (usuario.rol === 'comerciante') {
      const productosActivos = await Product.countDocuments({
        comerciante: req.usuario.id,
        estado: { $in: ['pendiente', 'aprobado'] }
      });

      if (productosActivos > 0) {
        return errorResponse(res, 'No puedes eliminar la cuenta con productos activos', 400);
      }
    }

    // Eliminar usuario
    await User.findByIdAndDelete(req.usuario.id);

    successResponse(res, 'Cuenta eliminada exitosamente');

  } catch (error) {
    console.error('Error eliminando cuenta:', error);
    errorResponse(res, 'Error interno del servidor', 500);
  }
};

module.exports = {
  obtenerPerfilCompleto,
  actualizarPerfil,
  obtenerFavoritos,
  agregarAFavoritos,
  quitarDeFavoritos,
  verificarFavorito,
  obtenerMetodosPago,
  agregarMetodoPago,
  eliminarMetodoPago,
  obtenerHistorialPedidos,
  actualizarConfiguracionNotificaciones,
  subirAvatar,
  subirBanner,
  eliminarCuenta
}; 