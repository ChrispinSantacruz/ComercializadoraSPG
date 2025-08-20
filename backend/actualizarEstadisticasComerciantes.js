const mongoose = require('mongoose');
const User = require('./models/User');
const Order = require('./models/Order');

// Configuración de conexión
const MONGODB_URI = 'mongodb://localhost:27017/comercializadora_spg';

const actualizarEstadisticasComerciantes = async () => {
  try {
    console.log('🚀 Conectando a MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Conectado a MongoDB\n');

    // Obtener todos los comerciantes
    const comerciantes = await User.find({ rol: 'comerciante' });
    console.log(`👥 Encontrados ${comerciantes.length} comerciantes`);

    for (const comerciante of comerciantes) {
      console.log(`\n📊 Procesando comerciante: ${comerciante.nombre} (${comerciante.email})`);

      // Obtener todos los pedidos donde este comerciante tiene productos
      const pedidos = await Order.find({
        'productos.comerciante': comerciante._id,
        estado: { $in: ['confirmado', 'enviado', 'entregado'] }
      });

      console.log(`   📦 Encontrados ${pedidos.length} pedidos`);

      // Calcular estadísticas
      let productosVendidos = 0;
      let ingresosTotales = 0;
      let pedidosRealizados = 0;

      for (const pedido of pedidos) {
        const productosComerciante = pedido.productos.filter(
          p => p.comerciante.toString() === comerciante._id.toString()
        );

        productosVendidos += productosComerciante.length;
        ingresosTotales += productosComerciante.reduce((sum, p) => sum + p.subtotal, 0);
        pedidosRealizados += 1;
      }

      // Actualizar estadísticas del comerciante
      await User.findByIdAndUpdate(comerciante._id, {
        $set: {
          'estadisticas.productosVendidos': productosVendidos,
          'estadisticas.ingresosTotales': ingresosTotales,
          'estadisticas.pedidosRealizados': pedidosRealizados
        }
      });

      console.log(`   ✅ Estadísticas actualizadas:`);
      console.log(`      - Productos vendidos: ${productosVendidos}`);
      console.log(`      - Ingresos totales: $${ingresosTotales.toLocaleString()}`);
      console.log(`      - Pedidos realizados: ${pedidosRealizados}`);
    }

    // Verificar resultados
    console.log('\n📈 Verificando estadísticas actualizadas...');
    const comerciantesActualizados = await User.find({ rol: 'comerciante' })
      .select('nombre email estadisticas');

    comerciantesActualizados.forEach(comerciante => {
      console.log(`\n👤 ${comerciante.nombre} (${comerciante.email}):`);
      console.log(`   - Productos vendidos: ${comerciante.estadisticas?.productosVendidos || 0}`);
      console.log(`   - Ingresos totales: $${(comerciante.estadisticas?.ingresosTotales || 0).toLocaleString()}`);
      console.log(`   - Pedidos realizados: ${comerciante.estadisticas?.pedidosRealizados || 0}`);
    });

    console.log('\n✅ Actualización de estadísticas completada exitosamente');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Desconectado de MongoDB');
    process.exit(0);
  }
};

// Ejecutar el script
console.log('🚀 Iniciando actualización de estadísticas de comerciantes...\n');
actualizarEstadisticasComerciantes(); 