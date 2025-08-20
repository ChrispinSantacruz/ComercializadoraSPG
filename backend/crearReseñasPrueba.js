const mongoose = require('mongoose');
const Review = require('./models/Review');
const Product = require('./models/Product');
const User = require('./models/User');
const Order = require('./models/Order');

// Configuración de conexión
const MONGODB_URI = 'mongodb://localhost:27017/comercializadora_spg';

const crearReseñasPrueba = async () => {
  try {
    console.log('🚀 Conectando a MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Conectado a MongoDB\n');

    // Verificar si ya existen reseñas
    const reseñasExistentes = await Review.countDocuments();
    if (reseñasExistentes > 0) {
      console.log(`📊 Ya existen ${reseñasExistentes} reseñas en la base de datos`);
      console.log('¿Quieres crear reseñas adicionales? (s/n)');
      return;
    }

    // Buscar productos aprobados
    const productos = await Product.find({ estado: 'aprobado' }).limit(5);
    if (productos.length === 0) {
      console.log('❌ No se encontraron productos aprobados');
      return;
    }

    // Buscar clientes
    const clientes = await User.find({ rol: 'cliente' }).limit(3);
    if (clientes.length === 0) {
      console.log('❌ No se encontraron clientes');
      return;
    }

    // Buscar pedidos entregados
    const pedidos = await Order.find({ estado: 'entregado' }).limit(5);
    if (pedidos.length === 0) {
      console.log('❌ No se encontraron pedidos entregados');
      return;
    }

    console.log(`📦 Productos encontrados: ${productos.length}`);
    console.log(`👤 Clientes encontrados: ${clientes.length}`);
    console.log(`📦 Pedidos encontrados: ${pedidos.length}`);

    // Crear reseñas de prueba
    const reseñasPrueba = [
      {
        usuario: clientes[0]._id,
        producto: productos[0]._id,
        pedido: pedidos[0]._id,
        calificacion: 5,
        titulo: 'Excelente producto',
        comentario: 'El producto superó mis expectativas. Muy buena calidad y envío rápido.',
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
        usuario: clientes[1]?._id || clientes[0]._id,
        producto: productos[0]._id,
        pedido: pedidos[1]?._id || pedidos[0]._id,
        calificacion: 4,
        titulo: 'Muy buen producto',
        comentario: 'Producto de buena calidad, llegó en perfectas condiciones.',
        aspectos: {
          calidad: 4,
          precio: 5,
          entrega: 4,
          atencion: 4
        },
        estado: 'aprobada',
        verificada: true
      },
      {
        usuario: clientes[2]?._id || clientes[0]._id,
        producto: productos[1]?._id || productos[0]._id,
        pedido: pedidos[2]?._id || pedidos[0]._id,
        calificacion: 5,
        titulo: 'Perfecto',
        comentario: 'Exactamente lo que esperaba. Recomendado 100%.',
        aspectos: {
          calidad: 5,
          precio: 5,
          entrega: 5,
          atencion: 5
        },
        estado: 'aprobada',
        verificada: true
      },
      {
        usuario: clientes[0]._id,
        producto: productos[2]?._id || productos[0]._id,
        pedido: pedidos[3]?._id || pedidos[0]._id,
        calificacion: 4,
        titulo: 'Buen producto',
        comentario: 'Buena relación calidad-precio. El envío fue un poco lento pero llegó bien.',
        aspectos: {
          calidad: 4,
          precio: 5,
          entrega: 3,
          atencion: 4
        },
        estado: 'aprobada',
        verificada: true
      },
      {
        usuario: clientes[1]?._id || clientes[0]._id,
        producto: productos[3]?._id || productos[0]._id,
        pedido: pedidos[0]._id,
        calificacion: 5,
        titulo: 'Excelente servicio',
        comentario: 'El comerciante fue muy atento y el producto es de excelente calidad.',
        aspectos: {
          calidad: 5,
          precio: 4,
          entrega: 5,
          atencion: 5
        },
        estado: 'aprobada',
        verificada: true
      }
    ];

    console.log('📝 Creando reseñas de prueba...');
    
    for (const reseñaData of reseñasPrueba) {
      const reseña = new Review(reseñaData);
      await reseña.save();
      console.log(`✅ Reseña creada: ${reseñaData.titulo} - ${reseñaData.calificacion}⭐`);
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

    // Verificar reseñas creadas
    const reseñasCreadas = await Review.find({})
      .populate('usuario', 'nombre')
      .populate('producto', 'nombre comerciante')
      .populate('producto.comerciante', 'nombre');

    console.log('\n📊 Reseñas creadas:');
    reseñasCreadas.forEach((reseña, index) => {
      console.log(`${index + 1}. ${reseña.producto?.nombre} - ${reseña.calificacion}⭐ - ${reseña.usuario?.nombre} - ${reseña.titulo}`);
    });

    console.log('\n✅ Reseñas de prueba creadas exitosamente');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Desconectado de MongoDB');
    process.exit(0);
  }
};

// Ejecutar el script
console.log('🚀 Iniciando creación de reseñas de prueba...\n');
crearReseñasPrueba(); 