const mongoose = require('mongoose');

// Configurar variables por defecto
require('dotenv').config();
if (!process.env.MONGODB_URI) {
  process.env.MONGODB_URI = 'mongodb://localhost:27017/comercializadora_spg';
}

// Conectar a la base de datos
require('./config/database');

// Importar modelos
const User = require('./models/User');
const Order = require('./models/Order');
const Product = require('./models/Product');
const Review = require('./models/Review');

async function verificarYCrearReseñas() {
  try {
    console.log('🔍 Verificando estado de reseñas...\n');

    // Buscar comerciante
    const comerciante = await User.findOne({ rol: 'comerciante' });
    if (!comerciante) {
      console.log('❌ No se encontró comerciante');
      return;
    }

    console.log(`👤 Comerciante: ${comerciante.nombre} (${comerciante._id})`);

    // Buscar productos del comerciante
    const productos = await Product.find({ comerciante: comerciante._id });
    console.log(`📦 Productos del comerciante: ${productos.length}`);

    // Buscar pedidos entregados
    const pedidosEntregados = await Order.find({
      'productos.comerciante': comerciante._id,
      estado: 'entregado'
    });
    console.log(`📋 Pedidos entregados: ${pedidosEntregados.length}`);

    // Buscar clientes que han comprado
    const clientesQuhanComprado = await User.find({ rol: 'cliente' });
    console.log(`👥 Clientes disponibles: ${clientesQuhanComprado.length}`);

    // Verificar reseñas existentes
    const reseñasExistentes = await Review.find({
      producto: { $in: productos.map(p => p._id) }
    }).populate('usuario', 'nombre').populate('producto', 'nombre');

    console.log(`\n⭐ Reseñas existentes: ${reseñasExistentes.length}`);
    reseñasExistentes.forEach((reseña, index) => {
      console.log(`   ${index + 1}. ${reseña.producto?.nombre} - ${reseña.calificacion}⭐ - ${reseña.usuario?.nombre} - ${reseña.estado}`);
    });

    // Si no hay reseñas y hay productos y clientes, crear algunas reseñas de ejemplo
    if (reseñasExistentes.length === 0 && productos.length > 0 && clientesQuhanComprado.length > 0) {
      console.log('\n📝 Creando reseñas de ejemplo...');

      const reseñasEjemplo = [
        {
          usuario: clientesQuhanComprado[0]._id,
          producto: productos[0]._id,
          calificacion: 5,
          titulo: 'Excelente producto',
          comentario: 'Muy buena calidad, totalmente recomendado. El comerciante fue muy atento.',
          aspectos: {
            calidad: 5,
            precio: 4,
            entrega: 5,
            atencion: 5
          },
          estado: 'aprobada',
          verificada: true
        },
        {
          usuario: clientesQuhanComprado[0]._id,
          producto: productos[0]._id,
          calificacion: 4,
          titulo: 'Buen servicio',
          comentario: 'El producto llegó bien y en el tiempo esperado. Buen precio.',
          aspectos: {
            calidad: 4,
            precio: 5,
            entrega: 4,
            atencion: 4
          },
          estado: 'aprobada',
          verificada: true
        }
      ];

      // Solo crear si hay más de un producto o cliente para evitar duplicados
      if (productos.length > 1) {
        reseñasEjemplo.push({
          usuario: clientesQuhanComprado[0]._id,
          producto: productos[1]._id,
          calificacion: 3,
          titulo: 'Regular',
          comentario: 'El producto está bien pero esperaba un poco más de calidad.',
          aspectos: {
            calidad: 3,
            precio: 4,
            entrega: 4,
            atencion: 3
          },
          estado: 'aprobada',
          verificada: true
        });
      }

      for (const reseñaData of reseñasEjemplo) {
        const reseña = new Review(reseñaData);
        await reseña.save();
        console.log(`   ✅ Reseña creada: ${reseñaData.titulo} - ${reseñaData.calificacion}⭐`);
      }

      // Actualizar estadísticas de productos
      console.log('\n🔄 Actualizando estadísticas de productos...');
      for (const producto of productos) {
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
    }

    // Verificar estadísticas finales de reseñas
    console.log('\n📊 Estadísticas finales de reseñas:');
    const estadisticasFinales = await Review.aggregate([
      {
        $match: {
          producto: { $in: productos.map(p => p._id) },
          estado: 'aprobada'
        }
      },
      {
        $group: {
          _id: null,
          totalReseñas: { $sum: 1 },
          promedioCalificacion: { $avg: '$calificacion' },
          distribucion: { $push: '$calificacion' }
        }
      }
    ]);

    if (estadisticasFinales.length > 0) {
      const stats = estadisticasFinales[0];
      console.log(`   📝 Total reseñas: ${stats.totalReseñas}`);
      console.log(`   ⭐ Promedio: ${stats.promedioCalificacion.toFixed(1)}`);
      
      // Contar distribución
      const distribucion = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
      stats.distribucion.forEach(cal => distribucion[cal]++);
      console.log(`   📊 Distribución:`, distribucion);
    } else {
      console.log('   ❌ No hay reseñas aprobadas');
    }

    console.log('\n✅ Verificación completada');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    mongoose.connection.close();
  }
}

verificarYCrearReseñas();
