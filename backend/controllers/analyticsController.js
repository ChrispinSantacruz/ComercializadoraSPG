const Order = require('../models/Order');
const Product = require('../models/Product');
const Review = require('../models/Review');
const User = require('../models/User');
const { successResponse, errorResponse } = require('../utils/helpers');

// @desc    Generar datos de prueba para analytics
// @route   POST /api/analytics/generate-test-data
// @access  Private (Comerciante)
const generarDatosPrueba = async (req, res) => {
  try {
    console.log('🧪 Generando datos de prueba para analytics...');
    
    const comercianteId = req.usuario.id;
    
    // Buscar o crear cliente
    let cliente = await User.findOne({ rol: 'cliente' });
    if (!cliente) {
      cliente = new User({
        nombre: 'Cliente Prueba',
        email: 'cliente@prueba.com',
        password: 'password123',
        rol: 'cliente',
        telefono: '3001234568',
        direccion: 'Calle 456, Ciudad'
      });
      await cliente.save();
      console.log('✅ Cliente de prueba creado');
    }

    // Crear productos de prueba
    const productos = [];
    for (let i = 1; i <= 5; i++) {
      const producto = new Product({
        nombre: `Producto Prueba ${i}`,
        descripcion: `Descripción del producto ${i}`,
        precio: 10000 + (i * 5000),
        stock: Math.max(0, 10 - i), // Algunos productos agotados
        categoria: 'Electrónicos',
        comerciante: comercianteId,
        estado: 'aprobado',
        imagenes: [`producto-${i}.jpg`],
        etiquetas: ['nuevo', 'popular']
      });
      await producto.save();
      productos.push(producto);
    }

    // Crear pedidos de prueba
    const estados = ['pendiente', 'confirmado', 'enviado', 'entregado'];
    for (let i = 1; i <= 8; i++) {
      const estado = estados[Math.floor(Math.random() * estados.length)];
      const fechaCreacion = new Date();
      fechaCreacion.setDate(fechaCreacion.getDate() - Math.floor(Math.random() * 30)); // Últimos 30 días
      
      const productosPedido = productos.slice(0, Math.floor(Math.random() * 3) + 1).map(producto => ({
        producto: producto._id,
        nombre: producto.nombre,
        precio: producto.precio,
        cantidad: Math.floor(Math.random() * 3) + 1,
        subtotal: producto.precio * (Math.floor(Math.random() * 3) + 1),
        comerciante: comercianteId
      }));

      const total = productosPedido.reduce((sum, item) => sum + item.subtotal, 0);

      const pedido = new Order({
        cliente: cliente._id,
        productos: productosPedido,
        total: total,
        estado: estado,
        fechaCreacion: fechaCreacion,
        direccionEntrega: {
          calle: 'Calle de Prueba',
          ciudad: 'Ciudad de Prueba',
          codigoPostal: '12345'
        },
        metodoPago: 'tarjeta_credito',
        estadoPago: 'pagado'
      });
      await pedido.save();
    }

    // Crear reseñas de prueba
    for (let i = 0; i < 5; i++) {
      const producto = productos[i % productos.length];
      const reseña = new Review({
        usuario: cliente._id,
        producto: producto._id,
        pedido: (await Order.findOne())._id,
        calificacion: Math.floor(Math.random() * 5) + 1,
        titulo: `Reseña ${i + 1}`,
        comentario: `Excelente producto ${i + 1}, muy recomendado.`,
        aspectos: {
          calidad: Math.floor(Math.random() * 5) + 1,
          precio: Math.floor(Math.random() * 5) + 1,
          entrega: Math.floor(Math.random() * 5) + 1,
          atencion: Math.floor(Math.random() * 5) + 1
        },
        estado: 'aprobada',
        verificada: true
      });
      await reseña.save();
    }

    successResponse(res, 'Datos de prueba generados exitosamente', {
      productos: productos.length,
      pedidos: 8,
      reseñas: 5
    });

  } catch (error) {
    console.error('❌ Error generando datos de prueba:', error);
    errorResponse(res, 'Error generando datos de prueba', 500);
  }
};

// @desc    Obtener analytics completos del comerciante
// @route   GET /api/analytics/merchant
// @access  Private (Comerciante)
const obtenerAnalyticsComerciante = async (req, res) => {
  try {
    console.log('🔍 AnalyticsController: Iniciando request');
    console.log('🔍 AnalyticsController: Usuario:', req.usuario);
    console.log('🔍 AnalyticsController: Query:', req.query);
    
    const comercianteId = req.usuario.id;
    const { periodo = '30d' } = req.query;
    
    console.log('🔍 AnalyticsController: Comerciante ID:', comercianteId);
    console.log('🔍 AnalyticsController: Período:', periodo);

    // Calcular fechas según el período
    const hoy = new Date();
    let fechaInicio;
    switch (periodo) {
      case '7d':
        fechaInicio = new Date(hoy.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        fechaInicio = new Date(hoy.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        fechaInicio = new Date(hoy.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      default:
        fechaInicio = new Date(hoy.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    const inicioDelMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
    const mesAnterior = new Date(hoy.getFullYear(), hoy.getMonth() - 1, 1);

    // Obtener productos del comerciante
    const productos = await Product.find({ comerciante: comercianteId });
    const productosIds = productos.map(p => p._id);

    // Obtener pedidos del comerciante
    const pedidos = await Order.find({
      'productos.comerciante': comercianteId
    }).populate('cliente', 'nombre email');

    // === CÁLCULOS DE VENTAS ===
    const totalIngresos = pedidos.reduce((sum, order) => {
      const productosComerciante = order.productos.filter(p => 
        p.comerciante.toString() === comercianteId.toString()
      );
      return sum + productosComerciante.reduce((sumP, p) => sumP + p.subtotal, 0);
    }, 0);

    const pedidosDelMes = pedidos.filter(order => 
      new Date(order.fechaCreacion) >= inicioDelMes
    );

    const ingresosDelMes = pedidosDelMes.reduce((sum, order) => {
      const productosComerciante = order.productos.filter(p => 
        p.comerciante.toString() === comercianteId.toString()
      );
      return sum + productosComerciante.reduce((sumP, p) => sumP + p.subtotal, 0);
    }, 0);

    const pedidosMesAnterior = pedidos.filter(order => 
      new Date(order.fechaCreacion) >= mesAnterior && 
      new Date(order.fechaCreacion) < inicioDelMes
    );

    const ingresosMesAnterior = pedidosMesAnterior.reduce((sum, order) => {
      const productosComerciante = order.productos.filter(p => 
        p.comerciante.toString() === comercianteId.toString()
      );
      return sum + productosComerciante.reduce((sumP, p) => sumP + p.subtotal, 0);
    }, 0);

    const porcentajeCambio = ingresosMesAnterior > 0 
      ? ((ingresosDelMes - ingresosMesAnterior) / ingresosMesAnterior) * 100 
      : 0;

    // === CÁLCULOS DE PEDIDOS ===
    const pedidosEnTransito = pedidos.filter(order => 
      ['pendiente', 'confirmado', 'enviado'].includes(order.estado)
    ).length;

    const pedidosEntregados = pedidos.filter(order => 
      order.estado === 'entregado'
    ).length;

    const tasaConfirmacion = pedidosEntregados > 0 
      ? (pedidosEntregados / pedidos.length) * 100 
      : 0;

    // === CÁLCULOS DE PRODUCTOS ===
    const productosAgotados = productos.filter(p => p.stock === 0).length;
    const productosActivos = productos.filter(p => p.estado === 'aprobado' && p.stock > 0).length;

    // === CÁLCULOS DE CLIENTES ===
    const clientesUnicos = new Set(
      pedidosDelMes.map(order => order.cliente._id.toString())
    ).size;

    // === CÁLCULOS DE RESEÑAS ===
    const reseñas = await Review.find({
      producto: { $in: productosIds },
      estado: 'aprobada'
    }).populate('usuario', 'nombre');

    const totalReseñas = reseñas.length;
    const calificacionPromedio = totalReseñas > 0 
      ? reseñas.reduce((sum, r) => sum + r.calificacion, 0) / totalReseñas 
      : 0;

    // Distribución de calificaciones
    const distribucionCalificaciones = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    reseñas.forEach(r => {
      distribucionCalificaciones[r.calificacion]++;
    });

    // === VENTAS POR DÍA (últimos 7 días) ===
    const ventasPorDia = [];
    for (let i = 6; i >= 0; i--) {
      const fecha = new Date(hoy.getTime() - i * 24 * 60 * 60 * 1000);
      const fechaStr = fecha.toISOString().split('T')[0];
      
      const pedidosDelDia = pedidos.filter(order => {
        const fechaOrden = new Date(order.fechaCreacion).toISOString().split('T')[0];
        return fechaOrden === fechaStr;
      });

      const ingresosDelDia = pedidosDelDia.reduce((sum, order) => {
        const productosComerciante = order.productos.filter(p => 
          p.comerciante.toString() === comercianteId.toString()
        );
        return sum + productosComerciante.reduce((sumP, p) => sumP + p.subtotal, 0);
      }, 0);

      ventasPorDia.push({
        fecha: fecha.toLocaleDateString('es-CO', { weekday: 'short', day: 'numeric' }),
        ventas: pedidosDelDia.length,
        ingresos: ingresosDelDia
      });
    }

    // === PRODUCTOS MÁS VENDIDOS ===
    const productosVendidos = {};
    pedidos.forEach(order => {
      order.productos.forEach(item => {
        if (item.comerciante.toString() === comercianteId.toString()) {
          const productId = item.producto.toString();
          if (!productosVendidos[productId]) {
            productosVendidos[productId] = {
              producto: productos.find(p => p._id.toString() === productId),
              cantidadVendida: 0,
              ingresosTotales: 0
            };
          }
          productosVendidos[productId].cantidadVendida += item.cantidad;
          productosVendidos[productId].ingresosTotales += item.subtotal;
        }
      });
    });

    const productosMasVendidos = Object.values(productosVendidos)
      .filter(p => p.producto)
      .sort((a, b) => b.cantidadVendida - a.cantidadVendida)
      .slice(0, 10);

    // === PEDIDOS POR ESTADO ===
    const pedidosPorEstado = {};
    pedidos.forEach(order => {
      const estado = order.estado || 'pendiente';
      pedidosPorEstado[estado] = (pedidosPorEstado[estado] || 0) + 1;
    });

    const pedidosPorEstadoArray = Object.entries(pedidosPorEstado).map(([estado, cantidad]) => ({
      estado: estado.charAt(0).toUpperCase() + estado.slice(1),
      cantidad
    }));

    // === RESEÑAS RECIENTES ===
    const reseñasRecientes = reseñas
      .sort((a, b) => new Date(b.fechaCreacion) - new Date(a.fechaCreacion))
      .slice(0, 5)
      .map(r => ({
        _id: r._id,
        calificacion: r.calificacion,
        comentario: r.comentario,
        fechaCreacion: r.fechaCreacion,
        usuario: r.usuario?.nombre || 'Usuario anónimo',
        producto: productos.find(p => p._id.toString() === r.producto.toString())?.nombre || 'Producto eliminado'
      }));

    const analyticsData = {
      // Ventas
      totalIngresos,
      ingresosDelMes,
      ingresosMesAnterior,
      porcentajeCambio,
      ventasDelMes: pedidosDelMes.length,
      ventasTotales: pedidos.length,

      // Productos
      totalProductos: productos.length,
      productosActivos,
      productosAgotados,
      productosMasVendidos,

      // Pedidos
      pedidosTotales: pedidos.length,
      pedidosDelMes: pedidosDelMes.length,
      pedidosEnTransito,
      pedidosEntregados,
      tasaConfirmacion,

      // Clientes
      clientesUnicos,

      // Reseñas
      totalReseñas,
      calificacionPromedio,
      distribucionCalificaciones,
      reseñasRecientes,

      // Tendencias
      ventasPorDia,
      pedidosPorEstado: pedidosPorEstadoArray
    };

    console.log('✅ AnalyticsController: Datos calculados exitosamente');
    console.log('✅ AnalyticsController: Total ingresos:', analyticsData.totalIngresos);
    console.log('✅ AnalyticsController: Pedidos en tránsito:', analyticsData.pedidosEnTransito);
    console.log('✅ AnalyticsController: Productos agotados:', analyticsData.productosAgotados);
    
    successResponse(res, 'Analytics obtenidos exitosamente', analyticsData);

  } catch (error) {
    console.error('❌ AnalyticsController: Error obteniendo analytics:', error);
    errorResponse(res, 'Error interno del servidor', 500);
  }
};

module.exports = {
  generarDatosPrueba,
  obtenerAnalyticsComerciante
}; 