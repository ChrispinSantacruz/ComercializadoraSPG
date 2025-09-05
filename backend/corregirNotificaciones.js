const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/Comercializadora';
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Conectado a MongoDB');
  } catch (error) {
    console.error('❌ Error conectando a MongoDB:', error);
    process.exit(1);
  }
};

const corregirNotificaciones = async () => {
  try {
    await connectDB();
    
    // Obtener modelo de Notification
    const Notification = require('./models/Notification');
    
    console.log('🔍 Buscando notificaciones con rutas incorrectas...');
    
    // Buscar notificaciones que tengan rutas con /comerciante/pedidos/
    const notificaciones = await Notification.find({
      'datos.url': { $regex: /\/comerciante\/pedidos\// }
    });
    
    console.log(`📧 Encontradas ${notificaciones.length} notificaciones con rutas incorrectas`);
    
    if (notificaciones.length === 0) {
      console.log('✅ No hay notificaciones que corregir');
      process.exit(0);
    }
    
    let corregidas = 0;
    
    for (let notificacion of notificaciones) {
      console.log(`  📝 Corrigiendo notificación: ${notificacion.titulo}`);
      console.log(`     URL anterior: ${notificacion.datos.url}`);
      
      // Extraer el ID del pedido de la URL
      // URL anterior: /comerciante/pedidos/SPG-1756948908631-300
      // Necesitamos buscar el pedido por numeroOrden para obtener el _id
      const numeroOrden = notificacion.datos.url.split('/').pop();
      console.log(`     Número de orden: ${numeroOrden}`);
      
      // Buscar el pedido por número de orden
      const Order = require('./models/Order');
      const pedido = await Order.findOne({ numeroOrden: numeroOrden });
      
      if (pedido) {
        // Actualizar la URL para usar el ID del pedido
        const nuevaUrl = `/merchant/orders/${pedido._id}`;
        notificacion.datos.url = nuevaUrl;
        await notificacion.save();
        
        console.log(`     URL nueva: ${nuevaUrl}`);
        corregidas++;
      } else {
        console.log(`     ⚠️ No se encontró pedido con número de orden: ${numeroOrden}`);
      }
    }
    
    console.log(`\n🎉 Proceso completado! Se corrigieron ${corregidas} notificaciones`);
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

corregirNotificaciones();
