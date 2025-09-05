const mongoose = require('mongoose');
require('dotenv').config();

const verificarTodasLasBasesdeDatos = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/Comercializadora';
    console.log('🔌 URI de conexión:', mongoUri);
    
    await mongoose.connect(mongoUri);
    console.log('✅ Conectado a MongoDB');
    
    // Listar todas las bases de datos
    console.log('\n📊 Listando todas las bases de datos disponibles:');
    const adminDb = mongoose.connection.db.admin();
    const databases = await adminDb.listDatabases();
    
    databases.databases.forEach((db, index) => {
      console.log(`${index + 1}. ${db.name} (${(db.sizeOnDisk / 1024 / 1024).toFixed(2)} MB)`);
    });
    
    // Mostrar a qué base de datos estamos conectados actualmente
    console.log(`\n🎯 Base de datos actual: "${mongoose.connection.name}"`);
    
    // Verificar si hay otras bases de datos con nombres similares
    const similarDbs = databases.databases.filter(db => 
      db.name.toLowerCase().includes('comercializadora') || 
      db.name.toLowerCase().includes('spg') ||
      db.name.toLowerCase().includes('comercio')
    );
    
    if (similarDbs.length > 1) {
      console.log('\n⚠️  Se encontraron múltiples bases de datos similares:');
      similarDbs.forEach(db => {
        console.log(`   - ${db.name}`);
      });
    }
    
    // Verificar cada base de datos similar para ver cuál tiene datos
    console.log('\n🔍 Verificando contenido de bases de datos similares:');
    
    for (const dbInfo of similarDbs) {
      console.log(`\n📂 Verificando "${dbInfo.name}":`);
      
      // Conectar a esta base de datos específica
      const tempConnection = await mongoose.createConnection(`mongodb://localhost:27017/${dbInfo.name}`);
      
      try {
        const collections = await tempConnection.db.listCollections().toArray();
        console.log(`   Colecciones: ${collections.map(c => c.name).join(', ')}`);
        
        // Verificar conteos
        for (const collection of ['users', 'products', 'orders', 'notifications']) {
          try {
            const count = await tempConnection.db.collection(collection).countDocuments();
            console.log(`   ${collection}: ${count} documentos`);
          } catch (err) {
            console.log(`   ${collection}: colección no existe`);
          }
        }
      } catch (error) {
        console.log(`   Error verificando: ${error.message}`);
      } finally {
        await tempConnection.close();
      }
    }
    
    // Revisar el archivo .env
    console.log('\n📋 Configuración del archivo .env:');
    console.log(`   MONGO_URI: ${process.env.MONGO_URI || 'NO DEFINIDO'}`);
    console.log(`   MONGODB_URI: ${process.env.MONGODB_URI || 'NO DEFINIDO'}`);
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

verificarTodasLasBasesdeDatos();
