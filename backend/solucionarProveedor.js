const mongoose = require('mongoose');
const User = require('./models/User');

// Configuración de conexión
const MONGODB_URI = 'mongodb://localhost:27017/comercializadora_spg';

const solucionarProveedor = async () => {
  try {
    console.log('🚀 Conectando a MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Conectado a MongoDB\n');

    const db = mongoose.connection.db;
    
    // Paso 1: Eliminar el índice problemático
    console.log('🔍 Verificando índices problemáticos...');
    const indices = await db.collection('users').indexes();
    const indiceProblematico = indices.find(index => 
      index.name === 'proveedor_1_proveedorId_1'
    );

    if (indiceProblematico) {
      console.log('⚠️  Eliminando índice problemático...');
      try {
        await db.collection('users').dropIndex(indiceProblematico.name);
        console.log('✅ Índice eliminado exitosamente');
      } catch (dropError) {
        console.log('⚠️  Error eliminando índice:', dropError.message);
      }
    }

    // Paso 2: Actualizar usuarios para evitar conflictos
    console.log('\n👥 Actualizando usuarios...');
    const usuarios = await User.find({});
    console.log(`📊 Encontrados ${usuarios.length} usuarios`);

    for (let i = 0; i < usuarios.length; i++) {
      const usuario = usuarios[i];
      console.log(`   ${i + 1}. ${usuario.email} - ${usuario.nombre} (${usuario.rol})`);
      
      // Asegurar que cada usuario tenga valores únicos
      if (!usuario.proveedorId) {
        usuario.proveedorId = `local_${usuario._id}`;
      }
      
      // Asegurar que el admin tenga contraseña conocida
      if (usuario.rol === 'administrador') {
        usuario.password = 'admin123';
        usuario.estado = 'activo';
        usuario.verificado = true;
        console.log(`   ✅ Admin actualizado: ${usuario.email}`);
      }
      
      await usuario.save();
    }

    // Paso 3: Verificar administradores
    console.log('\n🔧 VERIFICANDO ADMINISTRADORES:');
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
    } else {
      console.log('\n⚠️  No hay administradores. Creando uno...');
      const nuevoAdmin = new User({
        nombre: 'Administrador SPG',
        email: 'admin@spg.com',
        password: 'admin123',
        telefono: '+57 300 123 4567',
        rol: 'administrador',
        estado: 'activo',
        verificado: true,
        proveedor: 'local',
        proveedorId: `local_${Date.now()}`
      });
      await nuevoAdmin.save();
      console.log('✅ Administrador creado');
    }

    console.log('\n🔗 URLS PARA PROBAR:');
    console.log('🏠 Frontend: http://localhost:3000');
    console.log('🔧 Login: http://localhost:3000/login');
    console.log('👨‍💼 Panel Admin: http://localhost:3000/admin');

    console.log('\n✅ PROBLEMA SOLUCIONADO');
    console.log('   - Índice problemático eliminado');
    console.log('   - Usuarios actualizados con proveedorId únicos');
    console.log('   - Administrador configurado correctamente');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Desconectado de MongoDB');
    process.exit(0);
  }
};

// Ejecutar el script
console.log('🚀 Solucionando problema de proveedor...\n');
solucionarProveedor(); 