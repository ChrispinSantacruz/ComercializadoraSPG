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

const listarPedidos = async () => {
  try {
    await connectDB();
    
    const Order = require('./models/Order');
    
    console.log('🔍 Listando todos los pedidos...');
    
    // Buscar todos los pedidos
    const pedidos = await Order.find({})
      .populate('cliente', 'nombre email')
      .sort({ fechaCreacion: -1 })
      .limit(20);
    
    console.log(`📦 Encontrados ${pedidos.length} pedidos (últimos 20):`);
    console.log('');
    
    pedidos.forEach((pedido, index) => {
      console.log(`${index + 1}. ID: ${pedido._id}`);
      console.log(`   Número de orden: ${pedido.numeroOrden}`);
      console.log(`   Cliente: ${pedido.cliente?.nombre || 'N/A'} (${pedido.cliente?.email || 'N/A'})`);
      console.log(`   Estado: ${pedido.estado}`);
      console.log(`   Total: $${pedido.total?.toLocaleString('es-CO') || 'N/A'}`);
      console.log(`   Fecha: ${pedido.fechaCreacion}`);
      console.log(`   URL correcta: /orders/${pedido._id}`);
      console.log('   ---');
    });
    
    // Buscar específicamente pedidos que contengan "1756948908631" en el número de orden
    console.log('\n🔍 Buscando pedidos que contengan "1756948908631"...');
    const pedidosSimilares = await Order.find({
      numeroOrden: { $regex: /1756948908631/ }
    });
    
    if (pedidosSimilares.length > 0) {
      console.log(`📦 Encontrados ${pedidosSimilares.length} pedidos similares:`);
      pedidosSimilares.forEach((pedido, index) => {
        console.log(`${index + 1}. ID: ${pedido._id}`);
        console.log(`   Número de orden: ${pedido.numeroOrden}`);
        console.log(`   URL correcta: /orders/${pedido._id}`);
        console.log('   ---');
      });
    } else {
      console.log('❌ No se encontraron pedidos similares');
    }
    
    // Buscar notificaciones que mencionen ese número de orden
    console.log('\n🔍 Buscando notificaciones que mencionen "SPG-1756948908631-300"...');
    const Notification = require('./models/Notification');
    const notificaciones = await Notification.find({
      $or: [
        { mensaje: { $regex: /SPG-1756948908631-300/ } },
        { titulo: { $regex: /SPG-1756948908631-300/ } },
        { 'datos.url': { $regex: /SPG-1756948908631-300/ } }
      ]
    });
    
    console.log(`📧 Encontradas ${notificaciones.length} notificaciones:`);
    notificaciones.forEach((notif, index) => {
      console.log(`${index + 1}. Título: ${notif.titulo}`);
      console.log(`   Mensaje: ${notif.mensaje}`);
      console.log(`   URL: ${notif.datos?.url || 'Sin URL'}`);
      console.log(`   Usuario: ${notif.usuario}`);
      console.log(`   Fecha: ${notif.fechaCreacion}`);
      console.log('   ---');
    });
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

listarPedidos();
