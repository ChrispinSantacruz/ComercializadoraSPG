const mongoose = require('mongoose');
require('dotenv').config();

const verificarBaseDatos = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/Comercializadora';
    console.log('🔌 Intentando conectar a:', mongoUri);
    
    await mongoose.connect(mongoUri);
    console.log('✅ Conectado a MongoDB');
    
    // Listar todas las colecciones
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('\n📁 Colecciones disponibles:');
    collections.forEach(collection => {
      console.log(`   - ${collection.name}`);
    });
    
    // Verificar si existe la colección orders
    const ordersCollection = collections.find(c => c.name === 'orders');
    if (ordersCollection) {
      console.log('\n✅ Colección "orders" encontrada');
      
      // Contar documentos en orders
      const orderCount = await mongoose.connection.db.collection('orders').countDocuments();
      console.log(`📊 Total de órdenes: ${orderCount}`);
      
      if (orderCount > 0) {
        // Mostrar algunos documentos
        const sampleOrders = await mongoose.connection.db.collection('orders').find({}).limit(5).toArray();
        console.log('\n📦 Muestra de órdenes:');
        sampleOrders.forEach((order, index) => {
          console.log(`${index + 1}. ID: ${order._id}`);
          console.log(`   Número: ${order.numeroOrden || 'N/A'}`);
          console.log(`   Cliente: ${order.cliente || 'N/A'}`);
          console.log(`   Estado: ${order.estado || 'N/A'}`);
          console.log('   ---');
        });
      }
    } else {
      console.log('\n❌ Colección "orders" NO encontrada');
    }
    
    // Verificar usuarios
    const usersCollection = collections.find(c => c.name === 'users');
    if (usersCollection) {
      const userCount = await mongoose.connection.db.collection('users').countDocuments();
      console.log(`\n👥 Total de usuarios: ${userCount}`);
    }
    
    // Verificar productos
    const productsCollection = collections.find(c => c.name === 'products');
    if (productsCollection) {
      const productCount = await mongoose.connection.db.collection('products').countDocuments();
      console.log(`📦 Total de productos: ${productCount}`);
    }
    
    // Verificar notificaciones
    const notificationsCollection = collections.find(c => c.name === 'notifications');
    if (notificationsCollection) {
      const notificationCount = await mongoose.connection.db.collection('notifications').countDocuments();
      console.log(`🔔 Total de notificaciones: ${notificationCount}`);
      
      if (notificationCount > 0) {
        const sampleNotifications = await mongoose.connection.db.collection('notifications').find({}).limit(3).toArray();
        console.log('\n🔔 Muestra de notificaciones:');
        sampleNotifications.forEach((notif, index) => {
          console.log(`${index + 1}. Título: ${notif.titulo || 'N/A'}`);
          console.log(`   Tipo: ${notif.tipo || 'N/A'}`);
          console.log(`   URL: ${notif.datos?.url || 'N/A'}`);
          console.log('   ---');
        });
      }
    }
    
    console.log('\n🔍 Información de la base de datos:');
    console.log(`   Nombre: ${mongoose.connection.name}`);
    console.log(`   Host: ${mongoose.connection.host}`);
    console.log(`   Puerto: ${mongoose.connection.port}`);
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

verificarBaseDatos();
