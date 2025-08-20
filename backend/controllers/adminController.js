const Product = require('../models/Product');
const User = require('../models/User');
const Order = require('../models/Order');
const Review = require('../models/Review');
const { successResponse, errorResponse, paginateData } = require('../utils/helpers');
const { enviarNotificacion } = require('../services/notificationService');

// @desc    Obtener productos pendientes de aprobación
// @route   GET /api/admin/products/pending
// @access  Private (Admin)
const obtenerProductosPendientes = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const productos = await Product.find({ estado: 'pendiente' })
      .populate('comerciante', 'nombre email')
      .sort({ fechaCreacion: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Product.countDocuments({ estado: 'pendiente' });
    const paginacion = paginateData(total, page, limit);

    successResponse(res, 'Productos pendientes obtenidos exitosamente', {
      productos,
      paginacion
    });

  } catch (error) {
    console.error('Error obteniendo productos pendientes:', error);
    errorResponse(res, 'Error interno del servidor', 500);
  }
};

// @desc    Aprobar o rechazar producto
// @route   PUT /api/admin/products/:id/approve
// @route   PUT /api/admin/products/:id/reject
// @access  Private (Admin)
const aprobarRechazarProducto = async (req, res) => {
  try {
    const { id } = req.params;
    const { comentario, motivo } = req.body;
    
    // Determinar estado basándose en la URL
    const isApproval = req.url.includes('/approve');
    const estado = isApproval ? 'aprobado' : 'rechazado';
    const comentarioFinal = comentario || motivo || '';

    console.log(`🔍 Admin: ${isApproval ? 'Aprobando' : 'Rechazando'} producto ${id}`);

    const producto = await Product.findById(id)
      .populate('comerciante', 'nombre email');

    if (!producto) {
      return errorResponse(res, 'Producto no encontrado', 404);
    }

    if (producto.estado !== 'pendiente') {
      return errorResponse(res, 'Solo se pueden aprobar productos pendientes', 400);
    }

    // Actualizar producto
    producto.estado = estado;
    producto.fechaAprobacion = estado === 'aprobado' ? new Date() : null;
    producto.comentariosAdmin = comentarioFinal;
    producto.aprobadoPor = req.usuario.id;

    await producto.save();

    console.log(`✅ Admin: Producto ${estado} exitosamente - ${producto.nombre}`);

    // Enviar notificación al comerciante
    try {
      await enviarNotificacion(producto.comerciante._id, 'producto_' + estado, {
        productoId: producto._id,
        nombreProducto: producto.nombre,
        comentario: comentarioFinal
      });
    } catch (notifError) {
      console.error('Error enviando notificación:', notifError);
    }

    successResponse(res, `Producto ${estado} exitosamente`, producto);

  } catch (error) {
    console.error('Error aprobando/rechazando producto:', error);
    errorResponse(res, 'Error interno del servidor', 500);
  }
};

// @desc    Obtener todos los usuarios
// @route   GET /api/admin/users
// @access  Private (Admin)
const obtenerUsuarios = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const rol = req.query.rol;
    const estado = req.query.estado;

    let filtros = {};
    if (rol) filtros.rol = rol;
    if (estado) filtros.estado = estado;

    const usuarios = await User.find(filtros)
      .select('-password')
      .sort({ fechaCreacion: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await User.countDocuments(filtros);
    const paginacion = paginateData(total, page, limit);

    successResponse(res, 'Usuarios obtenidos exitosamente', {
      usuarios,
      paginacion
    });

  } catch (error) {
    console.error('Error obteniendo usuarios:', error);
    errorResponse(res, 'Error interno del servidor', 500);
  }
};

// @desc    Actualizar estado de usuario
// @route   PUT /api/admin/users/:id/status
// @access  Private (Admin)
const actualizarEstadoUsuario = async (req, res) => {
  try {
    const { estado } = req.body;
    const { id } = req.params;

    if (!['activo', 'inactivo', 'bloqueado'].includes(estado)) {
      return errorResponse(res, 'Estado inválido', 400);
    }

    const usuario = await User.findByIdAndUpdate(
      id,
      { estado },
      { new: true, select: '-password' }
    );

    if (!usuario) {
      return errorResponse(res, 'Usuario no encontrado', 404);
    }

    // Enviar notificación al usuario
    if (estado === 'bloqueado') {
      try {
        await enviarNotificacion(usuario._id, 'cuenta_bloqueada', {
          razon: req.body.razon || 'Violación de términos de servicio'
        });
      } catch (notifError) {
        console.error('Error enviando notificación:', notifError);
      }
    }

    successResponse(res, 'Estado de usuario actualizado exitosamente', usuario);

  } catch (error) {
    console.error('Error actualizando estado de usuario:', error);
    errorResponse(res, 'Error interno del servidor', 500);
  }
};

// @desc    Obtener estadísticas del dashboard
// @route   GET /api/admin/dashboard-stats
// @access  Private (Admin)
const obtenerEstadisticasDashboard = async (req, res) => {
  try {
    // Estadísticas de usuarios
    const totalUsuarios = await User.countDocuments();
    const usuariosActivos = await User.countDocuments({ estado: 'activo' });
    const comerciantes = await User.countDocuments({ rol: 'comerciante' });
    const clientes = await User.countDocuments({ rol: 'cliente' });

    // Estadísticas de productos
    const totalProductos = await Product.countDocuments();
    const productosAprobados = await Product.countDocuments({ estado: 'aprobado' });
    const productosPendientes = await Product.countDocuments({ estado: 'pendiente' });
    const productosRechazados = await Product.countDocuments({ estado: 'rechazado' });

    // Estadísticas de pedidos
    const totalPedidos = await Order.countDocuments();
    const pedidosHoy = await Order.countDocuments({
      fechaCreacion: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) }
    });

    // Ingresos totales
    const ventasCompletas = await Order.aggregate([
      { $match: { estado: 'entregado' } },
      { $group: { _id: null, total: { $sum: '$total' } } }
    ]);
    const ingresosTotales = ventasCompletas.length > 0 ? ventasCompletas[0].total : 0;

    const estadisticas = {
      usuarios: {
        total: totalUsuarios,
        activos: usuariosActivos,
        comerciantes,
        clientes
      },
      productos: {
        total: totalProductos,
        aprobados: productosAprobados,
        pendientes: productosPendientes,
        rechazados: productosRechazados
      },
      pedidos: {
        total: totalPedidos,
        hoy: pedidosHoy
      },
      ingresosTotales
    };

    successResponse(res, 'Estadísticas del dashboard obtenidas exitosamente', estadisticas);

  } catch (error) {
    console.error('Error obteniendo estadísticas del dashboard:', error);
    errorResponse(res, 'Error interno del servidor', 500);
  }
};

// @desc    Obtener todos los productos (admin)
// @route   GET /api/admin/products
// @access  Private (Admin)
const obtenerTodosProductos = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const { estado, categoria, q } = req.query;

    let filtros = {};
    if (estado) filtros.estado = estado;
    if (categoria) filtros.categoria = categoria;
    if (q) {
      filtros.$or = [
        { nombre: { $regex: q, $options: 'i' } },
        { descripcion: { $regex: q, $options: 'i' } }
      ];
    }

    const productos = await Product.find(filtros)
      .populate('comerciante', 'nombre email telefono')
      .populate('categoria', 'nombre')
      .sort({ fechaCreacion: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Product.countDocuments(filtros);
    const paginacion = paginateData(total, page, limit);

    successResponse(res, 'Productos obtenidos exitosamente', {
      datos: productos,
      paginacion
    });

  } catch (error) {
    console.error('Error obteniendo productos:', error);
    errorResponse(res, 'Error interno del servidor', 500);
  }
};

// @desc    Actualizar estado de producto
// @route   PATCH /api/admin/products/:id/status
// @access  Private (Admin)
const actualizarEstadoProducto = async (req, res) => {
  try {
    const { estado, comentario } = req.body;
    const { id } = req.params;

    if (!['aprobado', 'rechazado'].includes(estado)) {
      return errorResponse(res, 'Estado inválido. Debe ser "aprobado" o "rechazado"', 400);
    }

    const producto = await Product.findById(id)
      .populate('comerciante', 'nombre email');

    if (!producto) {
      return errorResponse(res, 'Producto no encontrado', 404);
    }

    if (producto.estado !== 'pendiente') {
      return errorResponse(res, 'Solo se pueden aprobar productos pendientes', 400);
    }

    // Actualizar producto
    producto.estado = estado;
    producto.fechaAprobacion = estado === 'aprobado' ? new Date() : null;
    producto.comentariosAdmin = comentario || '';
    producto.aprobadoPor = req.usuario.id;

    await producto.save();

    // Enviar notificación al comerciante
    try {
      await enviarNotificacion(producto.comerciante._id, 'producto_' + estado, {
        productoId: producto._id,
        nombreProducto: producto.nombre,
        comentario: comentario
      });
    } catch (notifError) {
      console.error('Error enviando notificación:', notifError);
    }

    successResponse(res, `Producto ${estado} exitosamente`, producto);

  } catch (error) {
    console.error('Error actualizando estado de producto:', error);
    errorResponse(res, 'Error interno del servidor', 500);
  }
};

// @desc    Eliminar producto
// @route   DELETE /api/admin/products/:id
// @access  Private (Admin)
const eliminarProducto = async (req, res) => {
  try {
    const { id } = req.params;

    const producto = await Product.findById(id);
    if (!producto) {
      return errorResponse(res, 'Producto no encontrado', 404);
    }

    await Product.findByIdAndDelete(id);
    
    successResponse(res, 'Producto eliminado exitosamente', { id });

  } catch (error) {
    console.error('Error eliminando producto:', error);
    errorResponse(res, 'Error interno del servidor', 500);
  }
};

// @desc    Obtener todos los usuarios (admin)
// @route   GET /api/admin/users
// @access  Private (Admin)
const obtenerTodosUsuarios = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const { rol, verificado, q } = req.query;

    let filtros = {};
    if (rol) filtros.rol = rol;
    if (verificado !== undefined) filtros.verificado = verificado === 'true';
    if (q) {
      filtros.$or = [
        { nombre: { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } }
      ];
    }

    const usuarios = await User.find(filtros)
      .select('-password')
      .sort({ fechaCreacion: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await User.countDocuments(filtros);
    const paginacion = paginateData(total, page, limit);

    successResponse(res, 'Usuarios obtenidos exitosamente', {
      datos: usuarios,
      paginacion
    });

  } catch (error) {
    console.error('Error obteniendo usuarios:', error);
    errorResponse(res, 'Error interno del servidor', 500);
  }
};

// @desc    Actualizar usuario
// @route   PUT /api/admin/users/:id
// @access  Private (Admin)
const actualizarUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, email, telefono, direccion } = req.body;

    const usuario = await User.findByIdAndUpdate(
      id,
      { nombre, email, telefono, direccion },
      { new: true, select: '-password' }
    );

    if (!usuario) {
      return errorResponse(res, 'Usuario no encontrado', 404);
    }

    successResponse(res, 'Usuario actualizado exitosamente', usuario);

  } catch (error) {
    console.error('Error actualizando usuario:', error);
    errorResponse(res, 'Error interno del servidor', 500);
  }
};

// @desc    Alternar estado de usuario (activar/desactivar)
// @route   PATCH /api/admin/users/:id/status
// @access  Private (Admin)
const alternarEstadoUsuario = async (req, res) => {
  try {
    const { activo } = req.body;
    const { id } = req.params;

    const usuario = await User.findById(id);
    if (!usuario) {
      return errorResponse(res, 'Usuario no encontrado', 404);
    }

    // Actualizar estado
    usuario.estado = activo ? 'activo' : 'inactivo';
    await usuario.save();

    // Enviar notificación al usuario si fue bloqueado
    if (!activo) {
      try {
        await enviarNotificacion(usuario._id, 'cuenta_suspendida', {
          razon: req.body.razon || 'Suspensión administrativa'
        });
      } catch (notifError) {
        console.error('Error enviando notificación:', notifError);
      }
    }

    successResponse(res, `Usuario ${activo ? 'activado' : 'desactivado'} exitosamente`, {
      _id: usuario._id,
      estado: usuario.estado
    });

  } catch (error) {
    console.error('Error alterando estado de usuario:', error);
    errorResponse(res, 'Error interno del servidor', 500);
  }
};

// @desc    Obtener estadísticas del sistema
// @route   GET /api/admin/stats
// @access  Private (Admin)
const obtenerEstadisticas = async (req, res) => {
  try {
    // Estadísticas de usuarios
    const totalUsuarios = await User.countDocuments();
    const usuariosActivos = await User.countDocuments({ estado: 'activo' });
    const comerciantes = await User.countDocuments({ rol: 'comerciante' });
    const clientes = await User.countDocuments({ rol: 'cliente' });

    // Estadísticas de productos
    const totalProductos = await Product.countDocuments();
    const productosAprobados = await Product.countDocuments({ estado: 'aprobado' });
    const productosPendientes = await Product.countDocuments({ estado: 'pendiente' });
    const productosRechazados = await Product.countDocuments({ estado: 'rechazado' });

    // Estadísticas de pedidos
    const totalPedidos = await Order.countDocuments();
    const pedidosHoy = await Order.countDocuments({
      fechaCreacion: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) }
    });
    const pedidosPendientes = await Order.countDocuments({ estado: 'pendiente' });
    const pedidosEntregados = await Order.countDocuments({ estado: 'entregado' });

    // Ingresos totales
    const ventasCompletas = await Order.aggregate([
      { $match: { estado: 'entregado' } },
      { $group: { _id: null, total: { $sum: '$total' } } }
    ]);
    const ingresosTotales = ventasCompletas.length > 0 ? ventasCompletas[0].total : 0;

    // Ventas del mes actual
    const inicioMes = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const ventasMes = await Order.aggregate([
      { 
        $match: { 
          estado: 'entregado',
          fechaCreacion: { $gte: inicioMes }
        }
      },
      { $group: { _id: null, total: { $sum: '$total' } } }
    ]);
    const ingresosMes = ventasMes.length > 0 ? ventasMes[0].total : 0;

    // Productos más vendidos
    const productosMasVendidos = await Product.find()
      .sort({ 'estadisticas.vendidos': -1 })
      .limit(5)
      .select('nombre estadisticas.vendidos precio')
      .populate('comerciante', 'nombre');

    // Estadísticas de reseñas
    const totalReseñas = await Review.countDocuments();
    const promedioCalificaciones = await Review.aggregate([
      { $group: { _id: null, promedio: { $avg: '$calificacionGeneral' } } }
    ]);
    const calificacionPromedio = promedioCalificaciones.length > 0 ? 
      Math.round(promedioCalificaciones[0].promedio * 10) / 10 : 0;

    const estadisticas = {
      usuarios: {
        total: totalUsuarios,
        activos: usuariosActivos,
        comerciantes,
        clientes
      },
      productos: {
        total: totalProductos,
        aprobados: productosAprobados,
        pendientes: productosPendientes,
        rechazados: productosRechazados
      },
      pedidos: {
        total: totalPedidos,
        hoy: pedidosHoy,
        pendientes: pedidosPendientes,
        entregados: pedidosEntregados
      },
      finanzas: {
        ingresosTotales,
        ingresosMes
      },
      productosMasVendidos,
      reseñas: {
        total: totalReseñas,
        calificacionPromedio
      }
    };

    successResponse(res, 'Estadísticas obtenidas exitosamente', estadisticas);

  } catch (error) {
    console.error('Error obteniendo estadísticas:', error);
    errorResponse(res, 'Error interno del servidor', 500);
  }
};

// @desc    Obtener reportes de ventas
// @route   GET /api/admin/reports/sales
// @access  Private (Admin)
const obtenerReporteVentas = async (req, res) => {
  try {
    const { fechaInicio, fechaFin, agrupacion = 'dia' } = req.query;

    let match = { estado: 'entregado' };
    
    if (fechaInicio || fechaFin) {
      match.fechaCreacion = {};
      if (fechaInicio) match.fechaCreacion.$gte = new Date(fechaInicio);
      if (fechaFin) match.fechaCreacion.$lte = new Date(fechaFin);
    }

    let groupBy;
    switch (agrupacion) {
      case 'mes':
        groupBy = {
          año: { $year: '$fechaCreacion' },
          mes: { $month: '$fechaCreacion' }
        };
        break;
      case 'semana':
        groupBy = {
          año: { $year: '$fechaCreacion' },
          semana: { $week: '$fechaCreacion' }
        };
        break;
      default: // día
        groupBy = {
          año: { $year: '$fechaCreacion' },
          mes: { $month: '$fechaCreacion' },
          dia: { $dayOfMonth: '$fechaCreacion' }
        };
    }

    const reporte = await Order.aggregate([
      { $match: match },
      {
        $group: {
          _id: groupBy,
          totalVentas: { $sum: '$total' },
          cantidadPedidos: { $sum: 1 },
          promedioVenta: { $avg: '$total' }
        }
      },
      { $sort: { '_id.año': -1, '_id.mes': -1, '_id.dia': -1 } },
      { $limit: 30 }
    ]);

    successResponse(res, 'Reporte de ventas obtenido exitosamente', reporte);

  } catch (error) {
    console.error('Error obteniendo reporte de ventas:', error);
    errorResponse(res, 'Error interno del servidor', 500);
  }
};

// @desc    Obtener todos los pedidos (admin)
// @route   GET /api/admin/orders
// @access  Private (Admin)
const obtenerTodosPedidos = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const estado = req.query.estado;

    let filtros = {};
    if (estado) filtros.estado = estado;

    const pedidos = await Order.find(filtros)
      .populate('usuario', 'nombre email')
      .populate('productos.producto', 'nombre')
      .sort({ fechaCreacion: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Order.countDocuments(filtros);
    const paginacion = paginateData(total, page, limit);

    successResponse(res, 'Pedidos obtenidos exitosamente', {
      pedidos,
      paginacion
    });

  } catch (error) {
    console.error('Error obteniendo pedidos:', error);
    errorResponse(res, 'Error interno del servidor', 500);
  }
};

module.exports = {
  obtenerProductosPendientes,
  aprobarRechazarProducto,
  obtenerUsuarios,
  actualizarEstadoUsuario,
  obtenerEstadisticasDashboard,
  obtenerTodosProductos,
  actualizarEstadoProducto,
  eliminarProducto,
  obtenerTodosUsuarios,
  actualizarUsuario,
  alternarEstadoUsuario,
  obtenerEstadisticas,
  obtenerReporteVentas,
  obtenerTodosPedidos
}; 