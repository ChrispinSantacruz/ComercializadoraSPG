const mongoose = require('mongoose');
require('dotenv').config();

// Importar modelos
const Notification = require('./models/Notification');
const Order = require('./models/Order');

const corregirURLsNotificaciones = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Conectado a MongoDB');

    // Buscar todas las notificaciones con URLs incorrectas
    const notificacionesIncorrectas = await Notification.find({
      $or: [
        { 'datos.url': { $regex: '/comerciante/' } },
        { 'datos.url': { $regex: '/cliente/' } }
      ]
    });

    console.log(`📋 Encontradas ${notificacionesIncorrectas.length} notificaciones con URLs incorrectas`);

    let corregidas = 0;
    let errores = 0;

    for (let notif of notificacionesIncorrectas) {
      try {
        let urlCorrecta = notif.datos.url;

        // Corregir URLs según el tipo de notificación
        if (notif.tipo === 'nueva_venta') {
          // Las notificaciones de nueva venta van a comerciantes
          // Buscar el pedido por el elementoId para obtener el ID correcto
          if (notif.datos.elementoId) {
            const pedido = await Order.findById(notif.datos.elementoId);
            if (pedido) {
              urlCorrecta = `/merchant/orders/${pedido._id}`;
            } else {
              console.log(`⚠️ No se encontró el pedido ${notif.datos.elementoId} para la notificación ${notif._id}`);
              continue;
            }
          } else {
            // Si no hay elementoId, usar una URL genérica
            urlCorrecta = '/merchant/orders';
          }
        } else if (notif.tipo === 'pedido_confirmado' || notif.tipo === 'pedido_enviado' || notif.tipo === 'pedido_entregado') {
          // Las notificaciones de pedido van a clientes
          if (notif.datos.elementoId) {
            const pedido = await Order.findById(notif.datos.elementoId);
            if (pedido) {
              urlCorrecta = `/orders/${pedido._id}`;
            } else {
              console.log(`⚠️ No se encontró el pedido ${notif.datos.elementoId} para la notificación ${notif._id}`);
              continue;
            }
          } else {
            // Si no hay elementoId, usar una URL genérica
            urlCorrecta = '/orders';
          }
        } else if (notif.tipo === 'producto_aprobado' || notif.tipo === 'producto_rechazado' || notif.tipo === 'stock_bajo' || notif.tipo === 'nueva_reseña') {
          // Las notificaciones de producto van a comerciantes
          urlCorrecta = '/merchant/products';
        }

        // Actualizar la notificación
        await Notification.findByIdAndUpdate(notif._id, {
          'datos.url': urlCorrecta
        });

        console.log(`✅ Corregida notificación ${notif._id}: ${notif.datos.url} -> ${urlCorrecta}`);
        corregidas++;

      } catch (error) {
        console.error(`❌ Error corrigiendo notificación ${notif._id}:`, error.message);
        errores++;
      }
    }

    console.log(`\n📊 Resumen de corrección:`);
    console.log(`   ✅ Notificaciones corregidas: ${corregidas}`);
    console.log(`   ❌ Errores: ${errores}`);
    console.log(`   📋 Total procesadas: ${notificacionesIncorrectas.length}`);

    // Verificar el resultado
    const notificacionesRestantes = await Notification.find({
      $or: [
        { 'datos.url': { $regex: '/comerciante/' } },
        { 'datos.url': { $regex: '/cliente/' } }
      ]
    });

    if (notificacionesRestantes.length === 0) {
      console.log('🎉 ¡Todas las URLs han sido corregidas exitosamente!');
    } else {
      console.log(`⚠️ Aún quedan ${notificacionesRestantes.length} notificaciones con URLs incorrectas`);
    }

  } catch (error) {
    console.error('❌ Error general:', error);
  } finally {
    await mongoose.disconnect();
    console.log('📤 Desconectado de MongoDB');
  }
};

// Ejecutar el script
if (require.main === module) {
  corregirURLsNotificaciones().catch(console.error);
}

module.exports = corregirURLsNotificaciones;
