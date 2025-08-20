const mongoose = require('mongoose');
const User = require('./models/User');
const Product = require('./models/Product');
const Order = require('./models/Order');
const Review = require('./models/Review');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/comercializadora_spg';

const crearDatosPrueba = async () => {
  try {
    console.log('🚀 Conectando a MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Conectado a MongoDB\n');

    // Buscar comerciante existente
    let comerciante = await User.findOne({ rol: 'comerciante' });
    if (!comerciante) {
      console.log('❌ No se encontró ningún comerciante. Crea uno primero.');
      return;
    }
    console.log('✅ Comerciante encontrado:', comerciante.nombre);

    // Buscar cliente existente
    let cliente = await User.findOne({ rol: 'cliente' });
    if (!cliente) {
      console.log('❌ No se encontró ningún cliente. Crea uno primero.');
      return;
    }
    console.log('✅ Cliente encontrado:', cliente.nombre);

    // Verificar si ya hay productos del comerciante
    const productosExistentes = await Product.find({ comerciante: comerciante._id });
    console.log(`📦 Productos existentes del comerciante: ${productosExistentes.length}`);

    // Crear solo 2 productos de prueba si no hay suficientes
    const productos = [];
    if (productosExistentes.length < 2) {
      console.log('📦 Creando productos de prueba...');
      for (let i = 1; i <= 2; i++) {
        const producto = new Product({
          nombre: `Producto Real ${i}`,
          descripcion: `Descripción del producto ${i}`,
          precio: 15000 + (i * 10000),
          stock: i === 1 ? 0 : 5, // Un producto agotado
          categoria: 'Electrónicos',
          comerciante: comerciante._id,
          estado: 'aprobado',
          imagenes: [`producto-${i}.jpg`],
          etiquetas: ['nuevo', 'popular']
        });
        await producto.save();
        productos.push(producto);
        console.log(`✅ Producto ${i} creado: ${producto.nombre} - Stock: ${producto.stock}`);
      }
    } else {
      productos.push(...productosExistentes);
      console.log('✅ Usando productos existentes');
    }

    // Verificar pedidos existentes
    const pedidosExistentes = await Order.find({
      'productos.comerciante': comerciante._id
    });
    console.log(`📋 Pedidos existentes del comerciante: ${pedidosExistentes.length}`);

    // Crear solo 3 pedidos de prueba si no hay suficientes
    if (pedidosExistentes.length < 3) {
      console.log('📋 Creando pedidos de prueba...');
      const estados = ['pendiente', 'confirmado', 'enviado', 'entregado'];
      for (let i = 1; i <= 3; i++) {
        const estado = estados[Math.floor(Math.random() * estados.length)];
        const fechaCreacion = new Date();
        fechaCreacion.setDate(fechaCreacion.getDate() - Math.floor(Math.random() * 7)); // Últimos 7 días
        
        const productosPedido = productos.slice(0, 1).map(producto => ({
          producto: producto._id,
          nombre: producto.nombre,
          precio: producto.precio,
          cantidad: Math.floor(Math.random() * 2) + 1,
          subtotal: producto.precio * (Math.floor(Math.random() * 2) + 1),
          comerciante: comerciante._id
        }));

        const total = productosPedido.reduce((sum, item) => sum + item.subtotal, 0);

        const pedido = new Order({
          cliente: cliente._id,
          productos: productosPedido,
          total: total,
          estado: estado,
          fechaCreacion: fechaCreacion,
          direccionEntrega: {
            calle: 'Calle Real 123',
            ciudad: 'Bogotá',
            codigoPostal: '11001'
          },
          metodoPago: 'tarjeta_credito',
          estadoPago: 'pagado'
        });
        await pedido.save();
        console.log(`✅ Pedido ${i} creado: Estado ${estado} - Total $${total}`);
      }
    } else {
      console.log('✅ Usando pedidos existentes');
    }

    // Verificar reseñas existentes
    const productosIds = productos.map(p => p._id);
    const reseñasExistentes = await Review.find({
      producto: { $in: productosIds },
      estado: 'aprobada'
    });
    console.log(`⭐ Reseñas existentes: ${reseñasExistentes.length}`);

    // Crear solo 2 reseñas si no hay suficientes
    if (reseñasExistentes.length < 2) {
      console.log('⭐ Creando reseñas de prueba...');
      for (let i = 0; i < 2; i++) {
        const producto = productos[i % productos.length];
        const pedido = await Order.findOne({
          'productos.comerciante': comerciante._id
        });
        
        if (pedido) {
          const reseña = new Review({
            usuario: cliente._id,
            producto: producto._id,
            pedido: pedido._id,
            calificacion: Math.floor(Math.random() * 3) + 3, // 3-5 estrellas
            titulo: `Reseña Real ${i + 1}`,
            comentario: `Muy buen producto, calidad excelente.`,
            aspectos: {
              calidad: 4,
              precio: 4,
              entrega: 5,
              atencion: 4
            },
            estado: 'aprobada',
            verificada: true
          });
          await reseña.save();
          console.log(`✅ Reseña ${i + 1} creada: ${reseña.calificacion}⭐`);
        }
      }
    } else {
      console.log('✅ Usando reseñas existentes');
    }

    console.log('\n🎉 Datos reales verificados/creados exitosamente!');
    console.log('📊 Ahora puedes probar el dashboard del comerciante');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Desconectado de MongoDB');
    process.exit(0);
  }
};

crearDatosPrueba(); 