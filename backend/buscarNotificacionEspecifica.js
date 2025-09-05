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

const buscarYCorregirNotificacion = async () => {
  try {
    await connectDB();
    
    const Notification = require('./models/Notification');
    const Order = require('./models/Order');
    
    console.log('🔍 Buscando todas las notificaciones con SPG-1756948908631-300...');
    
    // Buscar notificaciones que contengan específicamente ese número de orden
    const notificaciones = await Notification.find({
      $or: [
        { 'datos.url': { $regex: /SPG-1756948908631-300/ } },
        { mensaje: { $regex: /SPG-1756948908631-300/ } }
      ]
    });
    
    console.log(`📧 Encontradas ${notificaciones.length} notificaciones con ese número de orden`);
    
    if (notificaciones.length === 0) {
      console.log('❌ No se encontraron notificaciones con ese número de orden');
      
      // Buscar el pedido directamente
      const pedido = await Order.findOne({ numeroOrden: 'SPG-1756948908631-300' });
      if (pedido) {
        console.log(`✅ Pedido encontrado con ID: ${pedido._id}`);
        console.log(`📝 La URL correcta debería ser: /merchant/orders/${pedido._id}`);
      } else {
        console.log('❌ No se encontró el pedido con ese número de orden');
      }
      
      // Mostrar todas las notificaciones para debug
      console.log('\n🔍 Mostrando todas las notificaciones:');
      const todasNotificaciones = await Notification.find({}).limit(10);
      todasNotificaciones.forEach((notif, index) => {
        console.log(`${index + 1}. ${notif.titulo}`);
        console.log(`   URL: ${notif.datos?.url || 'Sin URL'}`);
        console.log(`   Tipo: ${notif.tipo}`);
        console.log(`   Fecha: ${notif.fechaCreacion}`);
        console.log('---');
      });
      
      process.exit(0);
    }
    
    for (let notificacion of notificaciones) {
      console.log(`\n📝 Notificación encontrada:`);
      console.log(`   Título: ${notificacion.titulo}`);
      console.log(`   Mensaje: ${notificacion.mensaje}`);
      console.log(`   URL actual: ${notificacion.datos?.url}`);
      console.log(`   Tipo: ${notificacion.tipo}`);
      console.log(`   Usuario: ${notificacion.usuario}`);
      
      // Buscar el pedido por número de orden
      const numeroOrden = 'SPG-1756948908631-300';
      const pedido = await Order.findOne({ numeroOrden: numeroOrden });
      
      if (pedido) {
        const nuevaUrl = `/merchant/orders/${pedido._id}`;
        console.log(`   URL nueva: ${nuevaUrl}`);
        
        // Actualizar la notificación
        notificacion.datos.url = nuevaUrl;
        await notificacion.save();
        
        console.log(`   ✅ Notificación actualizada`);
      } else {
        console.log(`   ❌ No se encontró el pedido con número de orden: ${numeroOrden}`);
      }
    }
    
    console.log(`\n🎉 Proceso completado!`);
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

buscarYCorregirNotificacion();
