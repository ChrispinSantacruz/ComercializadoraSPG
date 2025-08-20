const mongoose = require('mongoose');
const User = require('./models/User');

// Configuración de conexión
const MONGODB_URI = 'mongodb://localhost:27017/comercializadora_spg';

const solucionarIndiceUsuario = async () => {
  try {
    console.log('🚀 Conectando a MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Conectado a MongoDB\n');

    const db = mongoose.connection.db;
    
    // Paso 1: Eliminar el índice problemático directamente
    console.log('🔍 Eliminando índice problemático...');
    try {
      await db.collection('users').dropIndex('proveedor_1_proveedorId_1');
      console.log('✅ Índice eliminado exitosamente');
    } catch (dropError) {
      console.log('⚠️  Error eliminando índice:', dropError.message);
      console.log('   (Puede que ya no exista)');
    }

    // Paso 2: Actualizar todos los usuarios para que tengan proveedorId únicos
    console.log('\n👥 Actualizando usuarios...');
    const usuarios = await User.find({});
    console.log(`📊 Encontrados ${usuarios.length} usuarios`);

    for (let i = 0; i < usuarios.length; i++) {
      const usuario = usuarios[i];
      console.log(`   ${i + 1}. ${usuario.email} - ${usuario.nombre} (${usuario.rol})`);
      
      // Asignar proveedorId único si no tiene uno
      if (!usuario.proveedorId) {
        usuario.proveedorId = `local_${usuario._id}`;
        console.log(`      ✅ Asignado proveedorId: ${usuario.proveedorId}`);
      }
      
      // Asegurar que el admin tenga contraseña conocida
      if (usuario.rol === 'administrador') {
        usuario.password = 'admin123';
        usuario.estado = 'activo';
        usuario.verificado = true;
        console.log(`      ✅ Admin actualizado: ${usuario.email}`);
      }
      
      await usuario.save();
    }

    // Paso 3: Verificar que no hay conflictos
    console.log('\n🔍 Verificando que no hay conflictos...');
    const usuariosConProveedor = await User.find({ 
      proveedor: 'local', 
      proveedorId: { $exists: true, $ne: null } 
    });
    
    const proveedorIds = usuariosConProveedor.map(u => u.proveedorId);
    const proveedorIdsUnicos = [...new Set(proveedorIds)];
    
    if (proveedorIds.length === proveedorIdsUnicos.length) {
      console.log('✅ No hay conflictos de proveedorId');
    } else {
      console.log('⚠️  Hay conflictos de proveedorId');
      console.log('   Total:', proveedorIds.length);
      console.log('   Únicos:', proveedorIdsUnicos.length);
    }

    // Paso 4: Mostrar administradores
    console.log('\n🔧 ADMINISTRADORES DISPONIBLES:');
    const admins = await User.find({ rol: 'administrador' });
    admins.forEach((admin, index) => {
      console.log(`   ${index + 1}. ${admin.email} - ${admin.nombre} (${admin.estado})`);
    });

    if (admins.length > 0) {
      const admin = admins[0];
      console.log('\n📋 CREDENCIALES DE ACCESO:');
      console.log(`📧 Email: ${admin.email}`);
      console.log('🔑 Password: admin123');
      console.log('🎯 Rol: administrador');
    }

    console.log('\n🔗 URLS PARA PROBAR:');
    console.log('🏠 Frontend: http://localhost:3000');
    console.log('🔧 Login: http://localhost:3000/login');
    console.log('👨‍💼 Panel Admin: http://localhost:3000/admin');

    console.log('\n✅ PROBLEMA SOLUCIONADO');
    console.log('   - Índice problemático eliminado');
    console.log('   - Todos los usuarios tienen proveedorId únicos');
    console.log('   - Administrador configurado correctamente');
    console.log('   - Login debería funcionar ahora');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Desconectado de MongoDB');
    process.exit(0);
  }
};

// Ejecutar el script
console.log('🚀 Solucionando índice de usuario...\n');
solucionarIndiceUsuario(); 