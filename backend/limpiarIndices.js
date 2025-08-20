const mongoose = require('mongoose');

// Configuración de conexión
const MONGODB_URI = 'mongodb://localhost:27017/comercializadora_spg';

const limpiarIndices = async () => {
  try {
    console.log('🚀 Conectando a MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Conectado a MongoDB\n');

    const db = mongoose.connection.db;
    
    console.log('🔍 Verificando índices en la colección users...');
    
    // Obtener todos los índices de la colección users
    const indices = await db.collection('users').indexes();
    console.log('\n📊 ÍNDICES EXISTENTES:');
    indices.forEach((index, i) => {
      console.log(`   ${i + 1}. ${index.name}: ${JSON.stringify(index.key)}`);
    });

    // Buscar el índice problemático
    const indiceProblematico = indices.find(index => 
      index.name === 'proveedor_1_proveedorId_1'
    );

    if (indiceProblematico) {
      console.log('\n⚠️  ÍNDICE PROBLEMÁTICO ENCONTRADO:');
      console.log(`   Nombre: ${indiceProblematico.name}`);
      console.log(`   Campos: ${JSON.stringify(indiceProblematico.key)}`);
      
      console.log('\n🔄 Eliminando índice problemático...');
      await db.collection('users').dropIndex(indiceProblematico.name);
      console.log('✅ Índice eliminado exitosamente');
      
      console.log('\n📊 ÍNDICES RESTANTES:');
      const indicesRestantes = await db.collection('users').indexes();
      indicesRestantes.forEach((index, i) => {
        console.log(`   ${i + 1}. ${index.name}: ${JSON.stringify(index.key)}`);
      });
      
    } else {
      console.log('\n✅ No se encontró el índice problemático');
    }

    console.log('\n💡 RECOMENDACIONES:');
    console.log('   1. Ahora puedes ejecutar: node crearAdminNuevo.js');
    console.log('   2. O usar: node fixAdminIndex.js');
    console.log('   3. Los scripts deberían funcionar sin errores de índice');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Desconectado de MongoDB');
    process.exit(0);
  }
};

// Ejecutar el script
console.log('🚀 Iniciando limpieza de índices...\n');
limpiarIndices(); 