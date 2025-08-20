const mongoose = require('mongoose');
const Notification = require('./models/Notification');
const User = require('./models/User');
const Order = require('./models/Order');

// Configuración de conexión
const MONGODB_URI = 'mongodb://localhost:27017/comercializadora_spg';

const testNotificaciones = async () => {
  try {
    console.log('🚀 Conectando a MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Conectado a MongoDB\n');

    // Buscar un comerciante
    const comerciante = await User.findOne({ rol: 'comerciante' });
    if (!comerciante) {
      console.log('❌ No se encontró ningún comerciante');
      return;
    }
    console.log('👤 Comerciante encontrado:', comerciante.email);

    // Buscar un pedido reciente
    const pedido = await Order.findOne({ 'productos.comerciante': comerciante._id })
      .populate('cliente', 'nombre email');
    
    if (!pedido) {
      console.log('❌ No se encontró ningún pedido para este comerciante');
      return;
    }
    console.log('📦 Pedido encontrado:', pedido.numeroOrden);

    // Crear notificaciones de prueba
    const notificacionesPrueba = [
      {
        usuario: comerciante._id,
        tipo: 'nueva_venta',
        titulo: '¡Nueva venta realizada!',
        mensaje: `Has vendido 2 producto(s) por un total de $47.600 COP`,
        datos: {
          elementoId: pedido._id,
          tipoElemento: 'pedido',
          url: `/comerciante/pedidos/${pedido.numeroOrden}`,
          accion: 'ver_pedido'
        },
        prioridad: 'alta',
        canales: {
          enApp: true,
          email: true
        }
      },
      {
        usuario: comerciante._id,
        tipo: 'pedido_confirmado',
        titulo: 'Pedido confirmado',
        mensaje: `El pedido #${pedido.numeroOrden} ha sido confirmado por el cliente`,
        datos: {
          elementoId: pedido._id,
          tipoElemento: 'pedido',
          url: `/comerciante/pedidos/${pedido.numeroOrden}`,
          accion: 'ver_pedido'
        },
        prioridad: 'media',
        canales: {
          enApp: true,
          email: false
        }
      },
      {
        usuario: comerciante._id,
        tipo: 'nueva_reseña',
        titulo: 'Nueva reseña recibida',
        mensaje: `${pedido.cliente.nombre} dejó una reseña de 5 estrellas en tu producto`,
        datos: {
          elementoId: pedido._id,
          tipoElemento: 'reseña',
          url: `/comerciante/reseñas`,
          accion: 'ver_reseña'
        },
        prioridad: 'media',
        canales: {
          enApp: true,
          email: true
        }
      }
    ];

    console.log('📝 Creando notificaciones de prueba...');
    
    for (const notifData of notificacionesPrueba) {
      const notificacion = new Notification(notifData);
      await notificacion.save();
      console.log(`✅ Notificación creada: ${notifData.titulo}`);
    }

    // Verificar notificaciones creadas
    const notificacionesCreadas = await Notification.find({ usuario: comerciante._id })
      .sort({ fechaCreacion: -1 })
      .limit(5);

    console.log('\n📊 Notificaciones del comerciante:');
    notificacionesCreadas.forEach((notif, index) => {
      console.log(`${index + 1}. ${notif.titulo} - ${notif.estado} - ${notif.prioridad}`);
    });

    // Contar notificaciones por estado
    const [total, noLeidas, leidas] = await Promise.all([
      Notification.countDocuments({ usuario: comerciante._id }),
      Notification.countDocuments({ usuario: comerciante._id, estado: 'no_leida' }),
      Notification.countDocuments({ usuario: comerciante._id, estado: 'leida' })
    ]);

    console.log('\n📈 Estadísticas de notificaciones:');
    console.log(`   Total: ${total}`);
    console.log(`   No leídas: ${noLeidas}`);
    console.log(`   Leídas: ${leidas}`);

    console.log('\n✅ Prueba de notificaciones completada exitosamente');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Desconectado de MongoDB');
    process.exit(0);
  }
};

// Ejecutar el script
console.log('🚀 Iniciando prueba de notificaciones...\n');
testNotificaciones(); 