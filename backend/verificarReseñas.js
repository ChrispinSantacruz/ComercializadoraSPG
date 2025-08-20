const mongoose = require('mongoose');
const Review = require('./models/Review');
const Product = require('./models/Product');
const User = require('./models/User');
const Order = require('./models/Order');

// Configuración de conexión
const MONGODB_URI = 'mongodb://localhost:27017/comercializadora_spg';

const verificarReseñas = async () => {
  try {
    console.log('🚀 Conectando a MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Conectado a MongoDB\n');

    // Verificar todas las reseñas
    const todasLasReseñas = await Review.find({})
      .populate('usuario', 'nombre email')
      .populate('producto', 'nombre comerciante')
      .populate('producto.comerciante', 'nombre email');

    console.log(`📊 Total de reseñas en la base de datos: ${todasLasReseñas.length}`);

    if (todasLasReseñas.length === 0) {
      console.log('❌ No hay reseñas en la base de datos');
      return;
    }

    // Mostrar detalles de cada reseña
    console.log('\n📝 Detalles de las reseñas:');
    todasLasReseñas.forEach((reseña, index) => {
      console.log(`${index + 1}. ${reseña.producto?.nombre || 'Producto no encontrado'} - ${reseña.calificacion}⭐ - ${reseña.usuario?.nombre || 'Usuario anónimo'} - ${reseña.estado || 'sin estado'}`);
    });

    // Verificar estadísticas por producto
    console.log('\n📈 Estadísticas por producto:');
    const productosConReseñas = await Product.aggregate([
      {
        $lookup: {
          from: 'reviews',
          localField: '_id',
          foreignField: 'producto',
          as: 'reseñas'
        }
      },
      {
        $match: {
          'reseñas.0': { $exists: true }
        }
      },
      {
        $project: {
          nombre: 1,
          comerciante: 1,
          totalReseñas: { $size: '$reseñas' },
          calificacionPromedio: { $avg: '$reseñas.calificacion' }
        }
      }
    ]);

    productosConReseñas.forEach(producto => {
      console.log(`   ${producto.nombre}: ${producto.totalReseñas} reseñas, ${producto.calificacionPromedio.toFixed(1)}⭐ promedio`);
    });

    // Verificar estadísticas por comerciante
    console.log('\n🏪 Estadísticas por comerciante:');
    const comerciantesConReseñas = await User.aggregate([
      {
        $match: { rol: 'comerciante' }
      },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: 'comerciante',
          as: 'productos'
        }
      },
      {
        $lookup: {
          from: 'reviews',
          localField: 'productos._id',
          foreignField: 'producto',
          as: 'reseñas'
        }
      },
      {
        $match: {
          'reseñas.0': { $exists: true }
        }
      },
      {
        $project: {
          nombre: 1,
          email: 1,
          totalReseñas: { $size: '$reseñas' },
          calificacionPromedio: { $avg: '$reseñas.calificacion' }
        }
      }
    ]);

    comerciantesConReseñas.forEach(comerciante => {
      console.log(`   ${comerciante.nombre} (${comerciante.email}): ${comerciante.totalReseñas} reseñas, ${comerciante.calificacionPromedio.toFixed(1)}⭐ promedio`);
    });

    // Actualizar estadísticas de productos
    console.log('\n🔄 Actualizando estadísticas de productos...');
    for (const producto of productosConReseñas) {
      const reseñasProducto = await Review.find({ 
        producto: producto._id, 
        estado: 'aprobada' 
      });

      if (reseñasProducto.length > 0) {
        const promedio = reseñasProducto.reduce((sum, r) => sum + r.calificacion, 0) / reseñasProducto.length;
        
        await Product.findByIdAndUpdate(producto._id, {
          'estadisticas.calificacionPromedio': Math.round(promedio * 10) / 10,
          'estadisticas.totalReseñas': reseñasProducto.length
        });

        console.log(`   ✅ ${producto.nombre}: ${reseñasProducto.length} reseñas, ${promedio.toFixed(1)}⭐ promedio`);
      }
    }

    // Verificar productos sin estadísticas actualizadas
    console.log('\n🔍 Verificando productos sin estadísticas...');
    const productosSinEstadisticas = await Product.find({
      $or: [
        { 'estadisticas.calificacionPromedio': { $exists: false } },
        { 'estadisticas.totalReseñas': { $exists: false } }
      ]
    });

    console.log(`   Productos sin estadísticas: ${productosSinEstadisticas.length}`);

    // Crear estadísticas para productos que no las tienen
    for (const producto of productosSinEstadisticas) {
      const reseñas = await Review.find({ 
        producto: producto._id, 
        estado: 'aprobada' 
      });

      if (reseñas.length > 0) {
        const promedio = reseñas.reduce((sum, r) => sum + r.calificacion, 0) / reseñas.length;
        
        await Product.findByIdAndUpdate(producto._id, {
          'estadisticas.calificacionPromedio': Math.round(promedio * 10) / 10,
          'estadisticas.totalReseñas': reseñas.length
        });

        console.log(`   ✅ Creadas estadísticas para ${producto.nombre}: ${reseñas.length} reseñas, ${promedio.toFixed(1)}⭐ promedio`);
      } else {
        await Product.findByIdAndUpdate(producto._id, {
          'estadisticas.calificacionPromedio': 0,
          'estadisticas.totalReseñas': 0
        });

        console.log(`   ✅ Inicializadas estadísticas para ${producto.nombre}: 0 reseñas`);
      }
    }

    console.log('\n✅ Verificación de reseñas completada exitosamente');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Desconectado de MongoDB');
    process.exit(0);
  }
};

// Ejecutar el script
console.log('🚀 Iniciando verificación de reseñas...\n');
verificarReseñas(); 