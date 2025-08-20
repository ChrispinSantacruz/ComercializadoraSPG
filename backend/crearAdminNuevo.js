const mongoose = require('mongoose');
const User = require('./models/User');

// Configuración de conexión
const MONGODB_URI = 'mongodb://localhost:27017/comercializadora_spg';

const crearAdmin = async () => {
  try {
    console.log('🚀 Conectando a MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Conectado a MongoDB\n');

    // Datos del administrador con email único
    const adminData = {
      nombre: 'Super Administrador',
      email: 'superadmin@spg.com',
      password: 'super123',
      telefono: '+57 300 123 4567',
      rol: 'administrador',
      estado: 'activo',
      verificado: true,
      configuracion: {
        pais: 'Colombia',
        region: 'Bogotá',
        idioma: 'es',
        moneda: 'COP'
      }
    };

    // Verificar si ya existe
    const adminExistente = await User.findOne({ email: adminData.email });
    
    if (adminExistente) {
      console.log('⚠️  Ya existe un administrador con ese email');
      console.log('📧 Email:', adminExistente.email);
      console.log('👤 Nombre:', adminExistente.nombre);
      console.log('🔑 Rol:', adminExistente.rol);
      
      // Actualizar contraseña y asegurar que sea admin
      adminExistente.password = adminData.password;
      adminExistente.rol = 'administrador';
      adminExistente.estado = 'activo';
      adminExistente.verificado = true;
      await adminExistente.save();
      
      console.log('✅ Administrador actualizado exitosamente');
    } else {
      // Crear nuevo administrador
      console.log('👤 Creando nuevo administrador...');
      const admin = new User(adminData);
      await admin.save();
      console.log('✅ Administrador creado exitosamente');
    }

    console.log('\n📋 CREDENCIALES DE ACCESO:');
    console.log('📧 Email:', adminData.email);
    console.log('🔑 Contraseña:', adminData.password);
    console.log('🎯 Rol: administrador');
    console.log('\n🔗 URL de login: http://localhost:3000/login');
    console.log('🔗 Panel admin: http://localhost:3000/admin');

    // Mostrar todos los administradores existentes
    console.log('\n📊 ADMINISTRADORES EXISTENTES:');
    const admins = await User.find({ rol: 'administrador' }).select('email nombre rol estado');
    admins.forEach((admin, index) => {
      console.log(`   ${index + 1}. ${admin.email} - ${admin.nombre} (${admin.estado})`);
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.code === 11000) {
      console.log('\n💡 SOLUCIÓN: Email duplicado');
      console.log('   El email ya existe en la base de datos.');
      console.log('   Usando credenciales del usuario existente:');
      console.log('   📧 Email: superadmin@spg.com');
      console.log('   🔑 Password: super123');
    }
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Desconectado de MongoDB');
    process.exit(0);
  }
};

// Ejecutar el script
console.log('🚀 Iniciando creación de administrador...\n');
crearAdmin(); 