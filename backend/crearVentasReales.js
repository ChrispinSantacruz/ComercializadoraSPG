const mongoose = require('mongoose');
const User = require('./models/User');
const Product = require('./models/Product');
const Order = require('./models/Order');
const Review = require('./models/Review');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/comercializadora_spg';

const crearVentasReales = async () => {
  try {
    console.log('🚀 Conectando a MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Conectado a MongoDB\n');

    // Buscar comerciante
    const comerciante = await User.findOne({ rol: 'comerciante' });
    if (!comerciante) {
      console.log('❌ No se encontró ningún comerciante');
      return;
    }
    console.log(`👤 Comerciante encontrado: ${comerciante.nombre}`);

    // Buscar o crear cliente
    let cliente = await User.findOne({ rol: 'cliente' });
    if (!cliente) {
      cliente = new User({
        nombre: 'Cliente Real',
        email: 'cliente@real.com',
        password: 'password123',
        rol: 'cliente',
        telefono: '3001234569',
        direccion: 'Calle Real 123, Pasto'
      });
      await cliente.save();
      console.log('✅ Cliente creado:', cliente.nombre);
    }

    // Verificar productos del comerciante
    const productosExistentes = await Product.find({ comerciante: comerciante._id });
    console.log(`📦 Productos existentes: ${productosExistentes.length}`);

    if (productosExistentes.length === 0) {
      console.log('❌ No hay productos del comerciante. Crea productos primero.');
      return;
    }

    // Crear ventas reales del mes actual
    console.log('💰 Creando ventas reales...');
    
    const estados = ['pendiente', 'confirmado', 'enviado', 'entregado'];
    const fechas = [];
    
    // Generar fechas del mes actual
    const hoy = new Date();
    const inicioDelMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
    
    for (let i = 0; i < 15; i++) {
      const fecha = new Date(inicioDelMes);
      fecha.setDate(fecha.getDate() + Math.floor(Math.random() * 30));
      fechas.push(fecha);
    }

    let totalVentas = 0;
    let ventasDelMes = 0;

    for (let i = 0; i < 15; i++) {
      const estado = estados[Math.floor(Math.random() * estados.length)];
      const fechaCreacion = fechas[i];
      const esDelMes = fechaCreacion >= inicioDelMes;
      
      // Seleccionar productos aleatorios
      const productosSeleccionados = [];
      const numProductos = Math.floor(Math.random() * 3) + 1;
      
      for (let j = 0; j < numProductos; j++) {
        const producto = productosExistentes[Math.floor(Math.random() * productosExistentes.length)];
        const cantidad = Math.floor(Math.random() * 3) + 1;
        const precio = producto.precio;
        const subtotal = precio * cantidad;
        
        productosSeleccionados.push({
          producto: producto._id,
          nombre: producto.nombre,
          precio: precio,
          cantidad: cantidad,
          subtotal: subtotal,
          comerciante: comerciante._id
        });
      }

      const total = productosSeleccionados.reduce((sum, item) => sum + item.subtotal, 0);
      
      if (esDelMes) {
        ventasDelMes += total;
      }
      totalVentas += total;

      const pedido = new Order({
        cliente: cliente._id,
        productos: productosSeleccionados,
        total: total,
        estado: estado,
        fechaCreacion: fechaCreacion,
        direccionEntrega: {
          calle: 'Calle de Venta Real',
          ciudad: 'Pasto',
          codigoPostal: '520001'
        },
        metodoPago: 'tarjeta_credito',
        estadoPago: 'pagado'
      });
      
      await pedido.save();
      console.log(`✅ Venta creada: $${total.toLocaleString('es-CO')} - ${estado}`);
    }

    // Crear reseñas para algunos pedidos entregados
    console.log('⭐ Creando reseñas...');
    const pedidosEntregados = await Order.find({ 
      estado: 'entregado',
      'productos.comerciante': comerciante._id
    });

    for (let i = 0; i < Math.min(5, pedidosEntregados.length); i++) {
      const pedido = pedidosEntregados[i];
      const producto = pedido.productos[0];
      
      const reseña = new Review({
        usuario: cliente._id,
        producto: producto.producto,
        pedido: pedido._id,
        calificacion: Math.floor(Math.random() * 3) + 3, // 3-5 estrellas
        titulo: `Reseña ${i + 1}`,
        comentario: `Excelente producto, muy recomendado. Entrega rápida y buena calidad.`,
        aspectos: {
          calidad: Math.floor(Math.random() * 2) + 4,
          precio: Math.floor(Math.random() * 2) + 4,
          entrega: Math.floor(Math.random() * 2) + 4,
          atencion: Math.floor(Math.random() * 2) + 4
        },
        estado: 'aprobada',
        verificada: true
      });
      
      await reseña.save();
      console.log(`✅ Reseña creada: ${reseña.calificacion} estrellas`);
    }

    // Actualizar estadísticas del comerciante
    console.log('📊 Actualizando estadísticas...');
    
    const estadisticas = {
      productosVendidos: totalVentas,
      ingresosTotales: totalVentas,
      pedidosRealizados: 15,
      ventasDelMes: ventasDelMes,
      calificacionPromedio: 4.2,
      totalReseñas: 5
    };

    comerciante.estadisticas = estadisticas;
    await comerciante.save();

    console.log('\n📊 RESUMEN DE VENTAS:');
    console.log(`   Total ventas: $${totalVentas.toLocaleString('es-CO')}`);
    console.log(`   Ventas del mes: $${ventasDelMes.toLocaleString('es-CO')}`);
    console.log(`   Pedidos creados: 15`);
    console.log(`   Reseñas creadas: 5`);
    console.log(`   Productos vendidos: ${productosExistentes.length} tipos`);

    console.log('\n🎉 Ventas reales creadas exitosamente!');
    console.log('📱 Ahora el dashboard debería mostrar los ingresos reales');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Desconectado de MongoDB');
    process.exit(0);
  }
};

crearVentasReales(); 