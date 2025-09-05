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

const corregirNotificacionPedido = async () => {
  try {
    await connectDB();
    
    const Notification = require('./models/Notification');
    const Order = require('./models/Order');
    
    // Primero buscar el pedido por número de orden para obtener su ID
    const numeroOrden = 'SPG-1756948908631-300';
    const pedido = await Order.findOne({ numeroOrden: numeroOrden });
    
    if (!pedido) {
      console.log(`❌ No se encontró el pedido con número de orden: ${numeroOrden}`);
      process.exit(1);
    }
    
    console.log(`✅ Pedido encontrado:`);
    console.log(`   ID: ${pedido._id}`);
    console.log(`   Número de orden: ${pedido.numeroOrden}`);
    console.log(`   Cliente: ${pedido.cliente}`);
    
    // Buscar notificaciones que mencionen este número de orden
    console.log('\n🔍 Buscando notificaciones que mencionen este pedido...');
    
    const notificaciones = await Notification.find({
      $or: [
        { 'datos.url': { $regex: new RegExp(numeroOrden) } },
        { 'datos.url': { $regex: new RegExp(pedido._id.toString()) } },
        { mensaje: { $regex: new RegExp(numeroOrden) } },
        { 'datos.elementoId': pedido._id.toString() }
      ]
    }).populate('usuario', 'nombre email rol');
    
    console.log(`📧 Encontradas ${notificaciones.length} notificaciones relacionadas`);
    
    let corregidas = 0;
    
    for (let notificacion of notificaciones) {
      console.log(`\n📝 Notificación:`);
      console.log(`   ID: ${notificacion._id}`);
      console.log(`   Título: ${notificacion.titulo}`);
      console.log(`   Usuario: ${notificacion.usuario?.nombre} (${notificacion.usuario?.rol})`);
      console.log(`   URL actual: ${notificacion.datos?.url}`);
      
      // Determinar la URL correcta según el rol del usuario
      let urlCorrecta = null;
      
      if (notificacion.usuario?.rol === 'comerciante') {
        urlCorrecta = `/merchant/orders/${pedido._id}`;
      } else if (notificacion.usuario?.rol === 'cliente') {
        urlCorrecta = `/orders/${pedido._id}`;
      } else if (notificacion.usuario?.rol === 'administrador') {
        urlCorrecta = `/admin/orders/${pedido._id}`;
      }
      
      if (urlCorrecta && notificacion.datos?.url !== urlCorrecta) {
        console.log(`   URL nueva: ${urlCorrecta}`);
        
        // Actualizar la notificación
        notificacion.datos.url = urlCorrecta;
        await notificacion.save();
        
        console.log(`   ✅ Notificación actualizada`);
        corregidas++;
      } else {
        console.log(`   ℹ️ URL ya es correcta o no se pudo determinar`);
      }
    }
    
    console.log(`\n🎉 Proceso completado! Se corrigieron ${corregidas} notificaciones`);
    
    // Mostrar un resumen del pedido
    console.log(`\n📦 Resumen del pedido:`);
    console.log(`   URLs correctas:`);
    console.log(`   - Cliente: /orders/${pedido._id}`);
    console.log(`   - Comerciante: /merchant/orders/${pedido._id}`);
    console.log(`   - Admin: /admin/orders/${pedido._id}`);
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

corregirNotificacionPedido();
