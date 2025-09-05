const Product = require('../models/Product');
const Order = require('../models/Order');
const Review = require('../models/Review');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { validationResult } = require('express-validator');
const { successResponse, errorResponse, paginateData } = require('../utils/helpers');
const { enviarNotificacion } = require('../services/notificationService');

// @desc    Dashboard principal del comerciante
// @route   GET /api/commerce/dashboard
// @access  Private (Comerciante)
const obtenerDashboard = async (req, res) => {
  try {
    const comercianteId = req.usuario.id;
    const fechaActual = new Date();
    const inicioMes = new Date(fechaActual.getFullYear(), fechaActual.getMonth(), 1);
    const inicioSemana = new Date(fechaActual.setDate(fechaActual.getDate() - fechaActual.getDay()));

    // Estadísticas generales
    const [
      totalProductos,
      productosActivos,
      productosPendientes,
      productosRechazados,
      productosAgotados,
      pedidosDelMes,
      ventasDelMes,
      reseñasDelMes,
      notificacionesNoLeidas
    ] = await Promise.all([
      Product.countDocuments({ comerciante: comercianteId }),
      Product.countDocuments({ comerciante: comercianteId, estado: 'aprobado' }),
      Product.countDocuments({ comerciante: comercianteId, estado: 'pendiente' }),
      Product.countDocuments({ comerciante: comercianteId, estado: 'rechazado' }),
      Product.countDocuments({ comerciante: comercianteId, stock: 0 }),
      Order.countDocuments({
        'productos.comerciante': comercianteId,
        fechaCreacion: { $gte: inicioMes },
        estado: { $nin: ['cancelado'] }
      }),
      Order.aggregate([
        {
          $match: {
            'productos.comerciante': comercianteId,
            fechaCreacion: { $gte: inicioMes },
            estado: { $in: ['confirmado', 'procesando', 'enviado', 'entregado'] }
          }
        },
        { $unwind: '$productos' },
        {
          $match: {
            'productos.comerciante': comercianteId
          }
        },
        {
          $group: {
            _id: null,
            totalVentas: { $sum: { $multiply: ['$productos.precio', '$productos.cantidad'] } },
            totalProductos: { $sum: '$productos.cantidad' }
          }
        },
        {
          $addFields: {
            comisionComercio: { $multiply: ['$totalVentas', 0.85] } // 85% para el comerciante
          }
        }
      ]),
      Review.countDocuments({
        producto: {
          $in: await Product.find({ comerciante: comercianteId }).distinct('_id')
        },
        fechaCreacion: { $gte: inicioMes }
      }),
      Notification.countDocuments({ 
        recipient: comercianteId, 
        read: false 
      })
    ]);

    // Calcular ventas del mes anterior para comparación
    const inicioMesAnterior = new Date(fechaActual.getFullYear(), fechaActual.getMonth() - 1, 1);
    const finMesAnterior = new Date(fechaActual.getFullYear(), fechaActual.getMonth(), 0);
    
    const ventasDelMesAnterior = await Order.aggregate([
      {
        $match: {
          'productos.comerciante': comercianteId,
          fechaCreacion: { $gte: inicioMesAnterior, $lte: finMesAnterior },
          estado: { $in: ['confirmado', 'procesando', 'enviado', 'entregado'] }
        }
      },
      { $unwind: '$productos' },
      {
        $match: {
          'productos.comerciante': comercianteId
        }
      },
      {
        $group: {
          _id: null,
          totalVentas: { $sum: { $multiply: ['$productos.precio', '$productos.cantidad'] } }
        }
      }
    ]);

    // Productos más vendidos
    const productosMasVendidos = await Order.aggregate([
      { $match: { 'productos.comerciante': comercianteId, estado: 'entregado' } },
      { $unwind: '$productos' },
      { $match: { 'productos.comerciante': comercianteId } },
      {
        $group: {
          _id: '$productos.producto',
          totalVendido: { $sum: '$productos.cantidad' },
          ingresos: { $sum: { $multiply: ['$productos.precio', '$productos.cantidad'] } }
        }
      },
      { $sort: { totalVendido: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'producto'
        }
      },
      { $unwind: '$producto' },
      {
        $project: {
          nombre: '$producto.nombre',
          imagenes: '$producto.imagenes',
          totalVendido: 1,
          ingresos: 1
        }
      }
    ]);

    // Ventas por día (últimos 30 días)
    const ventasPorDia = await Order.aggregate([
      {
        $match: {
          'productos.comerciante': comercianteId,
          fechaCreacion: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
          estado: { $in: ['confirmado', 'procesando', 'enviado', 'entregado'] }
        }
      },
      { $unwind: '$productos' },
      {
        $match: {
          'productos.comerciante': comercianteId
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$fechaCreacion' }
          },
          ventas: { $sum: 1 },
          ingresos: { $sum: { $multiply: ['$productos.precio', '$productos.cantidad'] } }
        }
      },
      { $sort: { '_id': 1 } }
    ]);

    // Estadísticas de reseñas
    const estadisticasReseñas = await Review.aggregate([
      {
        $match: {
          producto: {
            $in: await Product.find({ comerciante: comercianteId }).distinct('_id')
          },
          estado: 'aprobada' // Solo reseñas aprobadas
        }
      },
      {
        $group: {
          _id: null,
          totalReseñas: { $sum: 1 },
          promedioCalificacion: { $avg: '$calificacion' },
          distribucion: {
            $push: '$calificacion'
          },
          sinResponder: {
            $sum: {
              $cond: [
                { 
                  $or: [
                    { $eq: ['$respuestaComerciante', null] },
                    { $eq: ['$respuestaComerciante.respuesta', null] },
                    { $eq: ['$respuestaComerciante.respuesta', ''] }
                  ]
                }, 
                1, 
                0
              ]
            }
          }
        }
      }
    ]);

    // Pedidos recientes
    const pedidosRecientes = await Order.find({
      'productos.comerciante': comercianteId
    })
      .populate('cliente', 'nombre email')
      .sort({ fechaCreacion: -1 })
      .limit(5)
      .lean();

    // Notificaciones recientes
    const notificacionesRecientes = await Notification.find({
      recipient: comercianteId
    })
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    // Procesamiento de datos
    const ventasInfo = ventasDelMes[0] || { totalVentas: 0, comisionComercio: 0 };
    const ventasAnterioresInfo = ventasDelMesAnterior[0] || { totalVentas: 0 };
    
    // Calcular porcentaje de cambio
    const porcentajeCambio = ventasAnterioresInfo.totalVentas > 0 
      ? ((ventasInfo.totalVentas - ventasAnterioresInfo.totalVentas) / ventasAnterioresInfo.totalVentas) * 100 
      : 0;
    
    const reseñasInfo = estadisticasReseñas[0] || {
      totalReseñas: 0,
      promedioCalificacion: 0,
      distribucion: [],
      sinResponder: 0
    };

    let distribucionCalificaciones = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    reseñasInfo.distribucion.forEach(cal => {
      distribucionCalificaciones[cal]++;
    });

    // Calcular métricas adicionales
    const pedidosEnTransito = await Order.countDocuments({
      'productos.comerciante': comercianteId,
      estado: { $in: ['confirmado', 'procesando', 'enviado'] }
    });

    const pedidosEntregados = await Order.countDocuments({
      'productos.comerciante': comercianteId,
      estado: 'entregado'
    });

    const tasaConfirmacion = pedidosEntregados > 0 ? 
      (pedidosEntregados / (pedidosEntregados + pedidosEnTransito)) * 100 : 0;

    // Clientes únicos del mes
    const clientesUnicos = await Order.aggregate([
      {
        $match: {
          'productos.comerciante': comercianteId,
          fechaCreacion: { $gte: inicioMes }
        }
      },
      {
        $group: {
          _id: '$cliente'
        }
      },
      {
        $count: 'total'
      }
    ]);

    const dashboard = {
      resumenGeneral: {
        totalProductos,
        productosActivos,
        productosPendientes,
        productosRechazados,
        productosAgotados,
        pedidosDelMes,
        ventasDelMes: ventasInfo.totalVentas,
        ventasDelMesAnterior: ventasAnterioresInfo.totalVentas,
        porcentajeCambio: Math.round(porcentajeCambio * 100) / 100,
        comisionComercio: ventasInfo.comisionComercio,
        reseñasDelMes,
        notificacionesNoLeidas,
        pedidosEnTransito,
        tasaConfirmacion,
        clientesUnicos: clientesUnicos[0]?.total || 0
      },
      productosMasVendidos,
      ventasPorDia,
      estadisticasReseñas: {
        ...reseñasInfo,
        distribucionCalificaciones
      },
      pedidosRecientes,
      notificacionesRecientes,
      alertas: []
    };

    // Agregar alertas basadas en datos reales
    if (productosPendientes > 0) {
      dashboard.alertas.push({
        tipo: 'info',
        mensaje: `Tienes ${productosPendientes} producto(s) pendiente(s) de aprobación`
      });
    }

    if (productosAgotados > 0) {
      dashboard.alertas.push({
        tipo: 'warning',
        mensaje: `Tienes ${productosAgotados} producto(s) agotado(s) que necesitan restock`
      });
    }

    if (reseñasInfo.sinResponder > 0) {
      dashboard.alertas.push({
        tipo: 'warning',
        mensaje: `Tienes ${reseñasInfo.sinResponder} reseña(s) sin responder`
      });
    }

    if (notificacionesNoLeidas > 0) {
      dashboard.alertas.push({
        tipo: 'info',
        mensaje: `Tienes ${notificacionesNoLeidas} notificación(es) sin leer`
      });
    }

    if (productosActivos === 0) {
      dashboard.alertas.push({
        tipo: 'error',
        mensaje: 'No tienes productos activos. ¡Sube tu primer producto!'
      });
    }

    successResponse(res, 'Dashboard obtenido exitosamente', dashboard);

  } catch (error) {
    console.error('Error obteniendo dashboard:', error);
    errorResponse(res, 'Error interno del servidor', 500);
  }
};

// @desc    Obtener análisis de ventas detallado
// @route   GET /api/commerce/analytics
// @access  Private (Comerciante)
const obtenerAnalisisSales = async (req, res) => {
  try {
    const comercianteId = req.usuario.id;
    const { periodo = '30d', producto } = req.query;

    // Calcular fechas según período
    let fechaInicio;
    switch (periodo) {
      case '7d':
        fechaInicio = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        fechaInicio = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        fechaInicio = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
        break;
      case '1y':
        fechaInicio = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        fechaInicio = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    }

    // Construcción de filtros base
    let matchFilter = {
      'productos.comerciante': comercianteId,
      fechaCreacion: { $gte: fechaInicio },
      estado: { $in: ['confirmado', 'procesando', 'enviado', 'entregado'] }
    };

    // Análisis de ventas por período
    const ventasPorPeriodo = await Order.aggregate([
      { $match: matchFilter },
      { $unwind: '$productos' },
      { $match: { 'productos.comerciante': comercianteId } },
      {
        $group: {
          _id: {
            $dateToString: { 
              format: periodo === '1y' ? '%Y-%m' : '%Y-%m-%d', 
              date: '$fechaCreacion' 
            }
          },
          pedidos: { $addToSet: '$_id' },
          ingresos: { $sum: { $multiply: ['$productos.precio', '$productos.cantidad'] } },
          productosVendidos: { $sum: '$productos.cantidad' }
        }
      },
      {
        $project: {
          _id: 1,
          pedidos: { $size: '$pedidos' },
          ingresos: 1,
          productosVendidos: 1
        }
      },
      { $sort: { '_id': 1 } }
    ]);

    // Análisis por producto
    const ventasPorProducto = await Order.aggregate([
      { $match: matchFilter },
      { $unwind: '$productos' },
      { $match: { 'productos.comerciante': comercianteId } },
      {
        $group: {
          _id: '$productos.producto',
          cantidadVendida: { $sum: '$productos.cantidad' },
          ingresos: { $sum: { $multiply: ['$productos.precio', '$productos.cantidad'] } },
          pedidos: { $sum: 1 }
        }
      },
      { $sort: { ingresos: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'producto'
        }
      },
      { $unwind: '$producto' },
      {
        $project: {
          nombre: '$producto.nombre',
          imagenes: '$producto.imagenes',
          cantidadVendida: 1,
          ingresos: 1,
          pedidos: 1,
          margenGanancia: { $multiply: ['$ingresos', 0.85] }
        }
      }
    ]);

    // Análisis de métodos de pago
    const metodosPago = await Order.aggregate([
      { $match: matchFilter },
      {
        $group: {
          _id: '$metodoPago.tipo',
          cantidad: { $sum: 1 },
          ingresos: { $sum: '$total' }
        }
      },
      { $sort: { cantidad: -1 } }
    ]);

    // Análisis de estados de pedidos
    const estadosPedidos = await Order.aggregate([
      {
        $match: {
          'productos.comerciante': comercianteId,
          fechaCreacion: { $gte: fechaInicio }
        }
      },
      {
        $group: {
          _id: '$estado',
          cantidad: { $sum: 1 },
          porcentaje: { $sum: 1 }
        }
      }
    ]);

    // Calcular totales para porcentajes
    const totalPedidos = estadosPedidos.reduce((sum, item) => sum + item.cantidad, 0);
    estadosPedidos.forEach(item => {
      item.porcentaje = totalPedidos > 0 ? ((item.cantidad / totalPedidos) * 100).toFixed(1) : 0;
    });

    // Clientes top
    const clientesTop = await Order.aggregate([
      { $match: matchFilter },
      {
        $group: {
          _id: '$cliente',
          pedidos: { $sum: 1 },
          gastoTotal: { $sum: '$total' }
        }
      },
      { $sort: { gastoTotal: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'cliente'
        }
      },
      { $unwind: '$cliente' },
      {
        $project: {
          nombre: '$cliente.nombre',
          email: '$cliente.email',
          pedidos: 1,
          gastoTotal: 1
        }
      }
    ]);

    // Análisis de reseñas
    const analisisReseñas = await Review.aggregate([
      {
        $match: {
          producto: {
            $in: await Product.find({ comerciante: comercianteId }).distinct('_id')
          },
          fechaCreacion: { $gte: fechaInicio }
        }
      },
      {
        $group: {
          _id: null,
          totalReseñas: { $sum: 1 },
          promedioCalificacion: { $avg: '$calificacion' },
          distribucion: {
            $push: '$calificacion'
          }
        }
      }
    ]);

    // Calcular distribución de calificaciones
    let distribucionCalificaciones = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    if (analisisReseñas[0] && analisisReseñas[0].distribucion) {
      analisisReseñas[0].distribucion.forEach(cal => {
        distribucionCalificaciones[cal]++;
      });
    }

    // Reseñas recientes
    const reseñasRecientes = await Review.find({
      producto: {
        $in: await Product.find({ comerciante: comercianteId }).distinct('_id')
      }
    })
      .populate('usuario', 'nombre')
      .populate('producto', 'nombre')
      .sort({ fechaCreacion: -1 })
      .limit(10)
      .lean();

    // Análisis de productos agotados
    const productosAgotados = await Product.find({
      comerciante: comercianteId,
      stock: 0,
      estado: 'aprobado'
    })
      .select('nombre imagenes precio')
      .limit(10)
      .lean();

    // Análisis de crecimiento
    const periodoAnterior = new Date(fechaInicio.getTime() - (new Date().getTime() - fechaInicio.getTime()));
    const ventasPeriodoAnterior = await Order.aggregate([
      {
        $match: {
          'productos.comerciante': comercianteId,
          fechaCreacion: { $gte: periodoAnterior, $lt: fechaInicio },
          estado: { $in: ['confirmado', 'procesando', 'enviado', 'entregado'] }
        }
      },
      { $unwind: '$productos' },
      { $match: { 'productos.comerciante': comercianteId } },
      {
        $group: {
          _id: null,
          totalVentas: { $sum: { $multiply: ['$productos.precio', '$productos.cantidad'] } }
        }
      }
    ]);

    const ventasActuales = ventasPorPeriodo.reduce((sum, item) => sum + item.ingresos, 0);
    const ventasAnteriores = ventasPeriodoAnterior[0]?.totalVentas || 0;
    const crecimiento = ventasAnteriores > 0 ? 
      ((ventasActuales - ventasAnteriores) / ventasAnteriores) * 100 : 0;

    successResponse(res, 'Análisis de ventas obtenido exitosamente', {
      periodo,
      ventasPorPeriodo,
      ventasPorProducto,
      metodosPago,
      estadosPedidos,
      clientesTop,
      analisisReseñas: {
        ...analisisReseñas[0],
        distribucionCalificaciones,
        reseñasRecientes
      },
      productosAgotados,
      resumen: {
        totalPedidos,
        totalIngresos: ventasActuales,
        promedioVentaDiaria: ventasPorPeriodo.length > 0 ? 
          (ventasActuales / ventasPorPeriodo.length).toFixed(2) : 0,
        crecimiento,
        ventasPeriodoAnterior: ventasAnteriores
      }
    });

  } catch (error) {
    console.error('Error obteniendo análisis de ventas:', error);
    errorResponse(res, 'Error interno del servidor', 500);
  }
};

// @desc    Gestionar productos del comerciante
// @route   GET /api/commerce/products
// @access  Private (Comerciante)
const gestionarProductos = async (req, res) => {
  try {
    const comercianteId = req.usuario.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const estado = req.query.estado;
    const busqueda = req.query.busqueda;
    const ordenar = req.query.ordenar || 'fechaCreacion';

    // Construir filtros
    let filtros = { comerciante: comercianteId };
    
    if (estado) {
      filtros.estado = estado;
    }
    
    if (busqueda) {
      filtros.$or = [
        { nombre: { $regex: busqueda, $options: 'i' } },
        { descripcion: { $regex: busqueda, $options: 'i' } }
      ];
    }

    // Opciones de ordenamiento
    let sortOptions = {};
    switch (ordenar) {
      case 'nombre':
        sortOptions = { nombre: 1 };
        break;
      case 'precio_asc':
        sortOptions = { precio: 1 };
        break;
      case 'precio_desc':
        sortOptions = { precio: -1 };
        break;
      case 'stock':
        sortOptions = { stock: -1 };
        break;
      case 'ventas':
        sortOptions = { 'estadisticas.totalVentas': -1 };
        break;
      default:
        sortOptions = { fechaCreacion: -1 };
    }

    const productos = await Product.find(filtros)
      .populate('categoria', 'nombre')
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    const total = await Product.countDocuments(filtros);
    const paginacion = paginateData(total, page, limit);

    // Estadísticas resumidas
    const estadisticas = await Product.aggregate([
      { $match: { comerciante: comercianteId } },
      {
        $group: {
          _id: '$estado',
          cantidad: { $sum: 1 }
        }
      }
    ]);

    let resumenEstados = {};
    estadisticas.forEach(item => {
      resumenEstados[item._id] = item.cantidad;
    });

    successResponse(res, 'Productos del comerciante obtenidos exitosamente', {
      productos,
      paginacion,
      estadisticas: resumenEstados,
      filtros: { estado, busqueda, ordenar }
    });

  } catch (error) {
    console.error('Error obteniendo productos del comerciante:', error);
    errorResponse(res, 'Error interno del servidor', 500);
  }
};

// @desc    Gestionar pedidos del comerciante
// @route   GET /api/commerce/orders
// @access  Private (Comerciante)
const gestionarPedidos = async (req, res) => {
  try {
    const comercianteId = req.usuario.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const estado = req.query.estado;
    const fechaDesde = req.query.fechaDesde;
    const fechaHasta = req.query.fechaHasta;

    // Construir filtros
    let filtros = { 'productos.comerciante': comercianteId };
    
    if (estado) {
      filtros.estado = estado;
    }
    
    if (fechaDesde || fechaHasta) {
      filtros.fechaCreacion = {};
      if (fechaDesde) filtros.fechaCreacion.$gte = new Date(fechaDesde);
      if (fechaHasta) filtros.fechaCreacion.$lte = new Date(fechaHasta);
    }

    const pedidos = await Order.find(filtros)
      .populate('cliente', 'nombre email telefono')
      .populate('productos.producto', 'nombre imagenes')
      .sort({ fechaCreacion: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    const total = await Order.countDocuments(filtros);
    const paginacion = paginateData(total, page, limit);

    // Filtrar solo productos del comerciante en cada pedido
    pedidos.forEach(pedido => {
      pedido.productos = pedido.productos.filter(
        p => p.comerciante.toString() === comercianteId
      );
      
      // Recalcular subtotal del comerciante
      pedido.subtotalComerciante = pedido.productos.reduce(
        (sum, p) => sum + (p.precio * p.cantidad), 0
      );
    });

    successResponse(res, 'Pedidos del comerciante obtenidos exitosamente', {
      pedidos,
      paginacion,
      filtros: { estado, fechaDesde, fechaHasta }
    });

  } catch (error) {
    console.error('Error obteniendo pedidos del comerciante:', error);
    errorResponse(res, 'Error interno del servidor', 500);
  }
};

// @desc    Actualizar estado de pedido (solo productos del comerciante)
// @route   PUT /api/commerce/orders/:orderId/status
// @access  Private (Comerciante)
const actualizarEstadoPedido = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { estado, comentario } = req.body;
    const comercianteId = req.usuario.id;

    // Estados válidos que puede cambiar un comerciante
    const estadosPermitidos = ['procesando', 'enviado', 'entregado'];
    
    if (!estadosPermitidos.includes(estado)) {
      return errorResponse(res, 'Estado no válido para comerciante', 400);
    }

    const pedido = await Order.findById(orderId)
      .populate('cliente', 'nombre email');

    if (!pedido) {
      return errorResponse(res, 'Pedido no encontrado', 404);
    }

    // Verificar que el comerciante tiene productos en este pedido
    const tieneProductos = pedido.productos.some(
      p => p.comerciante.toString() === comercianteId
    );

    if (!tieneProductos) {
      return errorResponse(res, 'No tienes productos en este pedido', 403);
    }

    // Verificar transición de estados válida
    const transicionesValidas = {
      'confirmado': ['procesando'],
      'procesando': ['enviado'],
      'enviado': ['entregado']
    };

    if (!transicionesValidas[pedido.estado]?.includes(estado)) {
      return errorResponse(res, `No se puede cambiar de ${pedido.estado} a ${estado}`, 400);
    }

    // Actualizar pedido
    pedido.estado = estado;
    if (comentario) {
      pedido.historialEstados.push({
        estado,
        fecha: new Date(),
        comentario,
        usuarioId: comercianteId
      });
    }

    await pedido.save();

    // Notificar al cliente
    try {
      await enviarNotificacion(pedido.cliente._id, 'pedido_actualizado', {
        orderId: pedido._id,
        numeroOrden: pedido.numeroOrden,
        nuevoEstado: estado,
        comentario
      });
    } catch (notifError) {
      console.error('Error enviando notificación:', notifError);
    }

    successResponse(res, 'Estado del pedido actualizado exitosamente', {
      orderId: pedido._id,
      numeroOrden: pedido.numeroOrden,
      estadoAnterior: transicionesValidas[pedido.estado] ? Object.keys(transicionesValidas).find(key => transicionesValidas[key].includes(estado)) : null,
      nuevoEstado: estado,
      comentario
    });

  } catch (error) {
    console.error('Error actualizando estado del pedido:', error);
    errorResponse(res, 'Error interno del servidor', 500);
  }
};

// @desc    Obtener estadísticas de ingresos
// @route   GET /api/commerce/earnings
// @access  Private (Comerciante)
const obtenerEstadisticasIngresos = async (req, res) => {
  try {
    const comercianteId = req.usuario.id;
    const { periodo = 'mes' } = req.query;

    let fechaInicio;
    let formatoFecha;

    switch (periodo) {
      case 'semana':
        fechaInicio = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        formatoFecha = '%Y-%m-%d';
        break;
      case 'mes':
        fechaInicio = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        formatoFecha = '%Y-%m-%d';
        break;
      case 'trimestre':
        fechaInicio = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
        formatoFecha = '%Y-%m-%d';
        break;
      case 'año':
        fechaInicio = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);
        formatoFecha = '%Y-%m';
        break;
      default:
        fechaInicio = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        formatoFecha = '%Y-%m-%d';
    }

    // Ingresos por período
    const ingresosPorPeriodo = await Order.aggregate([
      {
        $match: {
          'productos.comerciante': comercianteId,
          fechaCreacion: { $gte: fechaInicio },
          estado: { $in: ['confirmado', 'procesando', 'enviado', 'entregado'] }
        }
      },
      { $unwind: '$productos' },
      { $match: { 'productos.comerciante': comercianteId } },
      {
        $group: {
          _id: {
            $dateToString: { format: formatoFecha, date: '$fechaCreacion' }
          },
          ingresosBrutos: { 
            $sum: { $multiply: ['$productos.precio', '$productos.cantidad'] }
          },
          ingresosNetos: { 
            $sum: { $multiply: [{ $multiply: ['$productos.precio', '$productos.cantidad'] }, 0.85] }
          },
          pedidos: { $sum: 1 },
          productosVendidos: { $sum: '$productos.cantidad' }
        }
      },
      { $sort: { '_id': 1 } }
    ]);

    // Ingresos totales
    const ingresosTotal = await Order.aggregate([
      {
        $match: {
          'productos.comerciante': comercianteId,
          estado: { $in: ['confirmado', 'procesando', 'enviado', 'entregado'] }
        }
      },
      { $unwind: '$productos' },
      { $match: { 'productos.comerciante': comercianteId } },
      {
        $group: {
          _id: null,
          ingresosBrutosTotales: { 
            $sum: { $multiply: ['$productos.precio', '$productos.cantidad'] }
          },
          ingresosNetosTotales: { 
            $sum: { $multiply: [{ $multiply: ['$productos.precio', '$productos.cantidad'] }, 0.85] }
          },
          comisionPlataforma: { 
            $sum: { $multiply: [{ $multiply: ['$productos.precio', '$productos.cantidad'] }, 0.15] }
          },
          totalPedidos: { $sum: 1 },
          totalProductosVendidos: { $sum: '$productos.cantidad' }
        }
      }
    ]);

    // Pendientes de pago (simulación para cuando se implemente pagos diferidos)
    const pendientesPago = await Order.aggregate([
      {
        $match: {
          'productos.comerciante': comercianteId,
          estado: 'entregado',
          'metodoPago.estadoPagoComercio': { $ne: 'pagado' } // Para futuro
        }
      },
      { $unwind: '$productos' },
      { $match: { 'productos.comerciante': comercianteId } },
      {
        $group: {
          _id: null,
          montoPendiente: { 
            $sum: { $multiply: [{ $multiply: ['$productos.precio', '$productos.cantidad'] }, 0.85] }
          }
        }
      }
    ]);

    const resumen = ingresosTotal[0] || {
      ingresosBrutosTotales: 0,
      ingresosNetosTotales: 0,
      comisionPlataforma: 0,
      totalPedidos: 0,
      totalProductosVendidos: 0
    };

    successResponse(res, 'Estadísticas de ingresos obtenidas exitosamente', {
      periodo,
      ingresosPorPeriodo,
      resumenTotal: resumen,
      pendientesPago: pendientesPago[0]?.montoPendiente || 0,
      configuracionComision: {
        porcentajeComerciante: 85,
        porcentajePlataforma: 15,
        descripcion: 'El comerciante recibe el 85% de cada venta'
      }
    });

  } catch (error) {
    console.error('Error obteniendo estadísticas de ingresos:', error);
    errorResponse(res, 'Error interno del servidor', 500);
  }
};

module.exports = {
  obtenerDashboard,
  obtenerAnalisisSales,
  gestionarProductos,
  gestionarPedidos,
  actualizarEstadoPedido,
  obtenerEstadisticasIngresos
}; 