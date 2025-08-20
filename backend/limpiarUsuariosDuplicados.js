const mongoose = require('mongoose');
const User = require('./models/User');

// Conectar a MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/comercializadora_spg');
    console.log('✅ MongoDB conectado');
  } catch (error) {
    console.error('❌ Error conectando a MongoDB:', error);
    process.exit(1);
  }
};

const limpiarUsuariosDuplicados = async () => {
  try {
    console.log('🔄 Iniciando limpieza de usuarios duplicados...');
    
    // Buscar usuarios con proveedor "local" y proveedorId null
    const usuariosDuplicados = await User.find({
      proveedor: 'local',
      proveedorId: null
    }).sort({ createdAt: 1 }); // Ordenar por fecha de creación
    
    console.log(`📊 Encontrados ${usuariosDuplicados.length} usuarios con proveedor "local"`);
    
    if (usuariosDuplicados.length <= 1) {
      console.log('✅ No hay usuarios duplicados para limpiar');
      return;
    }
    
    // Mantener el primer usuario (más antiguo) y eliminar los demás
    const usuarioAMantener = usuariosDuplicados[0];
    const usuariosAEliminar = usuariosDuplicados.slice(1);
    
    console.log(`👤 Manteniendo usuario: ${usuarioAMantener.email} (${usuarioAMantener.nombre})`);
    console.log(`🗑️ Eliminando ${usuariosAEliminar.length} usuarios duplicados...`);
    
    for (const usuario of usuariosAEliminar) {
      console.log(`   - Eliminando: ${usuario.email} (${usuario.nombre})`);
      await User.findByIdAndDelete(usuario._id);
    }
    
    console.log('✅ Limpieza completada');
    
    // Mostrar usuarios restantes
    const usuariosRestantes = await User.find({});
    console.log(`\n📊 Usuarios restantes en la base de datos: ${usuariosRestantes.length}`);
    
    usuariosRestantes.forEach(user => {
      console.log(`   - ${user.email} (${user.nombre}) - Rol: ${user.rol}`);
    });
    
  } catch (error) {
    console.error('❌ Error durante la limpieza:', error);
  }
};

const main = async () => {
  await connectDB();
  await limpiarUsuariosDuplicados();
  await mongoose.disconnect();
  console.log('\n🎉 Proceso completado');
};

main().catch(console.error); 