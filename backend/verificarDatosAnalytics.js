const mongoose = require('mongoose');
require('dotenv').config();

// Conectar a MongoDB
const verificarDatos = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Conectado a MongoDB');

    const User = require('./models/User');
    const Product = require('./models/Product');
    const Order = require('./models/Order');
    const Review = require('./models/Review');

    // 1. Verificar comerciantes
    console.log('\n📊 VERIFICANDO DATOS EN LA BASE DE DATOS...');
    
    const comerciantes = await User.find({ rol: 'comerciante' });
    console.log(`👥 Comerciantes encontrados: ${comerciantes.length}`);
    
    if (comerciantes.length > 0) {
      const comercianteId = comerciantes[0]._id;
      console.log(`🔍 Analizando comerciante: ${comerciantes[0].nombre} (${comercianteId})`);

      // 2. Verificar productos del comerciante
      const productos = await Product.find({ comerciante: comercianteId });
      console.log(`📦 Productos del comerciante: ${productos.length}`);

      // 3. Verificar pedidos del comerciante
      const pedidos = await Order.find({ 'productos.comerciante': comercianteId });
      console.log(`🛒 Pedidos relacionados: ${pedidos.length}`);
      
      if (pedidos.length > 0) {
        const totalIngresos = pedidos.reduce((sum, order) => {
          const productosComerciante = order.productos.filter(p => 
            p.comerciante.toString() === comercianteId.toString()
          );
          return sum + productosComerciante.reduce((sumP, p) => sumP + (p.subtotal || p.precio * p.cantidad), 0);
        }, 0);
        console.log(`💰 Total ingresos calculados: $${totalIngresos.toLocaleString('es-CO')}`);
      }

      // 4. Verificar reseñas
      const productosIds = productos.map(p => p._id);
      const reseñas = await Review.find({ producto: { $in: productosIds } });
      console.log(`⭐ Reseñas encontradas: ${reseñas.length}`);
      
      if (reseñas.length > 0) {
        const calificacionPromedio = reseñas.reduce((sum, r) => sum + r.calificacion, 0) / reseñas.length;
        console.log(`📈 Calificación promedio: ${calificacionPromedio.toFixed(2)}`);
      }

      // 5. Probar el cálculo de analytics manualmente
      console.log('\n🧮 SIMULANDO CÁLCULO DE ANALYTICS...');
      
      const fechaActual = new Date();
      const inicioMes = new Date(fechaActual.getFullYear(), fechaActual.getMonth(), 1);
      
      const pedidosDelMes = pedidos.filter(order => 
        new Date(order.fechaCreacion || order.createdAt) >= inicioMes
      );
      
      console.log(`📅 Pedidos del mes actual: ${pedidosDelMes.length}`);
      
      const ingresosDelMes = pedidosDelMes.reduce((sum, order) => {
        const productosComerciante = order.productos.filter(p => 
          p.comerciante.toString() === comercianteId.toString()
        );
        return sum + productosComerciante.reduce((sumP, p) => sumP + (p.subtotal || p.precio * p.cantidad), 0);
      }, 0);
      
      console.log(`💰 Ingresos del mes: $${ingresosDelMes.toLocaleString('es-CO')}`);
      
      // Estados de pedidos
      const estadosPedidos = {};
      pedidos.forEach(order => {
        const estado = order.estado || 'pendiente';
        estadosPedidos[estado] = (estadosPedidos[estado] || 0) + 1;
      });
      
      console.log('📋 Estados de pedidos:', estadosPedidos);
      
    } else {
      console.log('❌ No se encontraron comerciantes en la base de datos');
    }

  } catch (error) {
    console.error('❌ Error verificando datos:', error);
  } finally {
    await mongoose.disconnect();
    console.log('📤 Desconectado de MongoDB');
  }
};

verificarDatos();
