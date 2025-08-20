const mongoose = require('mongoose');
const User = require('./models/User');
const Notification = require('./models/Notification');
const Order = require('./models/Order');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/comercializadora_spg';

const crearNotificacionesDirecto = async () => {
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

    // Limpiar notificaciones existentes del comerciante
    await Notification.deleteMany({ usuario: comerciante._id });
    console.log('🗑️ Notificaciones anteriores eliminadas');

    // Crear notificaciones de prueba
    const notificacionesPrueba = [
      {
        usuario: comerciante._id,
        tipo: 'nueva_venta',
        titulo: 'Nueva Venta Realizada',
        mensaje: 'Se ha realizado una nueva venta de $45,000. Revisa los detalles del pedido.',
        estado: 'no_leida',
        prioridad: 'alta',
        datos: {
          tipoElemento: 'pedido',
          url: '/merchant/orders',
          accion: 'Ver Pedido'
        }
      },
      {
        usuario: comerciante._id,
        tipo: 'nueva_reseña',
        titulo: 'Nueva Reseña Recibida',
        mensaje: 'Un cliente ha dejado una reseña de 5 estrellas en tu producto.',
        estado: 'no_leida',
        prioridad: 'media',
        datos: {
          tipoElemento: 'reseña',
          url: '/merchant/reviews',
          accion: 'Ver Reseña'
        }
      },
      {
        usuario: comerciante._id,
        tipo: 'stock_bajo',
        titulo: 'Stock Bajo',
        mensaje: 'El producto "Producto Real 1" tiene stock bajo. Considera reabastecer.',
        estado: 'leida',
        prioridad: 'urgente',
        datos: {
          tipoElemento: 'producto',
          url: '/merchant/products',
          accion: 'Gestionar Stock'
        }
      },
      {
        usuario: comerciante._id,
        tipo: 'pedido_confirmado',
        titulo: 'Pedido Confirmado',
        mensaje: 'Un pedido ha sido confirmado y está listo para envío.',
        estado: 'no_leida',
        prioridad: 'alta',
        datos: {
          tipoElemento: 'pedido',
          url: '/merchant/orders',
          accion: 'Ver Pedido'
        }
      },
      {
        usuario: comerciante._id,
        tipo: 'producto_aprobado',
        titulo: 'Producto Aprobado',
        mensaje: 'Tu producto "Producto Real 2" ha sido aprobado y está disponible para la venta.',
        estado: 'leida',
        prioridad: 'media',
        datos: {
          tipoElemento: 'producto',
          url: '/merchant/products',
          accion: 'Ver Producto'
        }
      }
    ];

    console.log('📢 Creando notificaciones de prueba...');
    for (const notifData of notificacionesPrueba) {
      const notificacion = new Notification(notifData);
      await notificacion.save();
      console.log(`✅ Notificación creada: ${notifData.titulo}`);
    }

    // Crear notificaciones automáticas por pedidos pendientes
    console.log('\n📋 Creando notificaciones por pedidos pendientes...');
    const pedidos = await Order.find({
      'productos.comerciante': comerciante._id
    });

    for (const pedido of pedidos) {
      if (pedido.estado === 'pendiente') {
        const notificacion = new Notification({
          usuario: comerciante._id,
          tipo: 'nueva_venta',
          titulo: 'Nuevo Pedido Pendiente',
          mensaje: `Nuevo pedido #${pedido._id.toString().slice(-6)} por $${pedido.total.toLocaleString('es-CO')}`,
          estado: 'no_leida',
          prioridad: 'alta',
          datos: {
            elementoId: pedido._id,
            tipoElemento: 'pedido',
            url: `/merchant/orders/${pedido._id}`,
            accion: 'Ver Pedido'
          }
        });
        await notificacion.save();
        console.log(`✅ Notificación de pedido creada: ${pedido._id}`);
      }
    }

    // Verificar notificaciones creadas
    const totalNotificaciones = await Notification.countDocuments({ usuario: comerciante._id });
    const noLeidas = await Notification.countDocuments({ 
      usuario: comerciante._id, 
      estado: 'no_leida' 
    });

    console.log('\n📊 RESUMEN DE NOTIFICACIONES:');
    console.log(`   Total notificaciones: ${totalNotificaciones}`);
    console.log(`   No leídas: ${noLeidas}`);
    console.log(`   Leídas: ${totalNotificaciones - noLeidas}`);

    console.log('\n🎉 Notificaciones creadas exitosamente!');
    console.log('📱 Ahora puedes ver las notificaciones en tu perfil');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Desconectado de MongoDB');
    process.exit(0);
  }
};

crearNotificacionesDirecto(); 