const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/Comercializadora';
    await mongoose.connect(mongoUri);
    console.log('✅ Conectado a MongoDB');
  } catch (error) {
    console.error('❌ Error conectando a MongoDB:', error);
    process.exit(1);
  }
};

const corregirNotificacionPorId = async () => {
  try {
    await connectDB();
    
    const Notification = require('./models/Notification');
    const Order = require('./models/Order');
    
    const pedidoId = '68b8e9ac245d27221c552958';
    
    console.log('🔍 Buscando el pedido por ID...');
    
    // Buscar el pedido por ID
    const pedido = await Order.findById(pedidoId);
    
    if (!pedido) {
      console.log(`❌ No se encontró el pedido con ID: ${pedidoId}`);
      process.exit(1);
    }
    
    console.log(`✅ Pedido encontrado:`);
    console.log(`   ID: ${pedido._id}`);
    console.log(`   Número de orden: ${pedido.numeroOrden}`);
    console.log(`   Cliente: ${pedido.cliente}`);
    console.log(`   Total: $${pedido.total}`);
    
    // Buscar notificaciones que puedan estar relacionadas con este pedido
    console.log('\n🔍 Buscando notificaciones relacionadas...');
    
    const notificaciones = await Notification.find({
      $or: [
        { 'datos.elementoId': pedido._id },
        { 'datos.elementoId': pedido._id.toString() },
        { 'datos.url': { $regex: new RegExp(pedido.numeroOrden) } },
        { mensaje: { $regex: new RegExp(pedido.numeroOrden) } }
      ]
    });
    
    console.log(`📧 Encontradas ${notificaciones.length} notificaciones relacionadas`);
    
    if (notificaciones.length === 0) {
      console.log('❌ No se encontraron notificaciones relacionadas');
      
      // Mostrar las últimas notificaciones para debug
      console.log('\n🔍 Mostrando las últimas 10 notificaciones:');
      const ultimasNotificaciones = await Notification.find({})
        .sort({ fechaCreacion: -1 })
        .limit(10)
        .populate('usuario', 'nombre email rol');
      
      ultimasNotificaciones.forEach((notif, index) => {
        console.log(`${index + 1}. ${notif.titulo} (${notif.tipo})`);
        console.log(`   Usuario: ${notif.usuario?.nombre || 'N/A'} (${notif.usuario?.rol || 'N/A'})`);
        console.log(`   URL: ${notif.datos?.url || 'Sin URL'}`);
        console.log(`   ElementoId: ${notif.datos?.elementoId || 'N/A'}`);
        console.log(`   Fecha: ${notif.fechaCreacion}`);
        console.log('---');
      });
      
      process.exit(0);
    }
    
    let corregidas = 0;
    
    for (let notificacion of notificaciones) {
      console.log(`\n📝 Procesando notificación:`);
      console.log(`   Título: ${notificacion.titulo}`);
      console.log(`   Tipo: ${notificacion.tipo}`);
      console.log(`   URL actual: ${notificacion.datos?.url}`);
      
      // Determinar la URL correcta según el tipo de usuario
      let urlCorrecta;
      const usuarioNotificacion = await require('./models/User').findById(notificacion.usuario);
      
      if (usuarioNotificacion?.rol === 'comerciante') {
        urlCorrecta = `/merchant/orders/${pedido._id}`;
      } else if (usuarioNotificacion?.rol === 'cliente') {
        urlCorrecta = `/orders/${pedido._id}`;
      } else {
        urlCorrecta = `/admin/orders/${pedido._id}`;
      }
      
      console.log(`   Usuario: ${usuarioNotificacion?.nombre} (${usuarioNotificacion?.rol})`);
      console.log(`   URL correcta: ${urlCorrecta}`);
      
      // Actualizar solo si es diferente
      if (notificacion.datos?.url !== urlCorrecta) {
        if (!notificacion.datos) {
          notificacion.datos = {};
        }
        notificacion.datos.url = urlCorrecta;
        notificacion.datos.elementoId = pedido._id;
        await notificacion.save();
        
        console.log(`   ✅ Notificación actualizada`);
        corregidas++;
      } else {
        console.log(`   ✓ URL ya es correcta`);
      }
    }
    
    console.log(`\n🎉 Proceso completado! Se corrigieron ${corregidas} notificaciones`);
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

corregirNotificacionPorId();
