const mongoose = require('mongoose');
require('dotenv').config();

const verificarDatosPrevios = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/Comercializadora';
    await mongoose.connect(mongoUri);
    console.log('✅ Conectado a MongoDB');
    
    // Verificar usuarios
    console.log('\n👥 Verificando usuarios...');
    const userCount = await mongoose.connection.db.collection('users').countDocuments();
    console.log(`   Total de usuarios: ${userCount}`);
    
    if (userCount > 0) {
      const sampleUsers = await mongoose.connection.db.collection('users').find({}).limit(3).toArray();
      console.log('   Muestra de usuarios:');
      sampleUsers.forEach((user, index) => {
        console.log(`   ${index + 1}. ${user.nombre || 'Sin nombre'} (${user.email || 'Sin email'}) - Rol: ${user.rol || 'Sin rol'}`);
      });
    } else {
      console.log('   ❌ No hay usuarios en la base de datos');
    }
    
    // Verificar productos
    console.log('\n📦 Verificando productos...');
    const productCount = await mongoose.connection.db.collection('products').countDocuments();
    console.log(`   Total de productos: ${productCount}`);
    
    if (productCount > 0) {
      const sampleProducts = await mongoose.connection.db.collection('products').find({}).limit(3).toArray();
      console.log('   Muestra de productos:');
      sampleProducts.forEach((product, index) => {
        console.log(`   ${index + 1}. ${product.nombre || 'Sin nombre'} - Precio: $${product.precio || 'N/A'} - Stock: ${product.stock || 'N/A'}`);
      });
    } else {
      console.log('   ❌ No hay productos en la base de datos');
    }
    
    // Verificar direcciones
    console.log('\n📍 Verificando direcciones...');
    const addressCount = await mongoose.connection.db.collection('addresses').countDocuments();
    console.log(`   Total de direcciones: ${addressCount}`);
    
    // Verificar carritos
    console.log('\n🛒 Verificando carritos...');
    const cartCount = await mongoose.connection.db.collection('carts').countDocuments();
    console.log(`   Total de carritos: ${cartCount}`);
    
    if (cartCount > 0) {
      const sampleCarts = await mongoose.connection.db.collection('carts').find({}).limit(3).toArray();
      console.log('   Muestra de carritos:');
      sampleCarts.forEach((cart, index) => {
        console.log(`   ${index + 1}. Usuario: ${cart.usuario || 'N/A'} - Productos: ${cart.productos?.length || 0} - Total: $${cart.total || 'N/A'}`);
      });
    }
    
    // Verificar si las colecciones necesarias existen
    const collections = await mongoose.connection.db.listCollections().toArray();
    const collectionNames = collections.map(c => c.name);
    
    console.log('\n🔍 Estado de colecciones requeridas:');
    const requiredCollections = ['users', 'products', 'addresses', 'carts', 'orders', 'notifications'];
    
    requiredCollections.forEach(collectionName => {
      const exists = collectionNames.includes(collectionName);
      console.log(`   ${exists ? '✅' : '❌'} ${collectionName}`);
    });
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

verificarDatosPrevios();
