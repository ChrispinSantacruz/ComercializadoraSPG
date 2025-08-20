const mongoose = require('mongoose');
const User = require('./models/User');

// Configurar conexión directa a MongoDB
const MONGODB_URI = 'mongodb://localhost:27017/comercializadora_spg';

const createAdmin = async () => {
  try {
    console.log('🔗 Conectando a MongoDB...');
    console.log('📍 URI:', MONGODB_URI);
    
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ Conectado a MongoDB');

    // Verificar si ya existe un admin con este email
    const existingAdmin = await User.findOne({ email: 'chris@chrisadmin.com' });
    
    if (existingAdmin) {
      console.log('⚠️  Ya existe un usuario con el email chris@chrisadmin.com');
      console.log('📧 Email:', existingAdmin.email);
      console.log('👤 Nombre:', existingAdmin.nombre);
      console.log('🔑 Rol:', existingAdmin.rol);
      console.log('\n🔄 ¿Quieres actualizar la contraseña? (se mantendrán los demás datos)');
      
      // Actualizar contraseña
      existingAdmin.password = 'Pipeman06';
      existingAdmin.rol = 'administrador'; // Asegurar que sea admin
      existingAdmin.estado = 'activo'; // Asegurar que esté activo
      await existingAdmin.save();
      
      console.log('✅ Contraseña actualizada exitosamente');
    } else {
      // Crear nuevo administrador
      const adminData = {
        nombre: 'Chris Admin',
        email: 'chris@chrisadmin.com',
        password: 'Pipeman06',
        telefono: '+57 300 123 4567',
        rol: 'administrador',
        estado: 'activo',
        configuracion: {
          pais: 'Colombia',
          region: 'Bogotá',
          idioma: 'es',
          moneda: 'COP'
        },
        direccion: {
          calle: 'Calle Principal 123',
          ciudad: 'Bogotá',
          departamento: 'Cundinamarca',
          codigoPostal: '110111',
          pais: 'Colombia'
        }
      };

      console.log('👤 Creando usuario administrador...');
      const admin = new User(adminData);
      await admin.save();
      
      console.log('✅ ¡Usuario administrador creado exitosamente!');
    }

    console.log('\n📋 Credenciales de acceso:');
    console.log('📧 Email: chris@chrisadmin.com');
    console.log('🔑 Contraseña: Pipeman06');
    console.log('🎯 Rol: administrador');
    console.log('\n🚀 Puedes usar estas credenciales para iniciar sesión como admin');
    console.log('🔗 URL de login: http://localhost:3000/login');

  } catch (error) {
    console.error('❌ Error creando administrador:', error);
    if (error.code === 11000) {
      console.log('💡 El email ya existe. Intenta con un email diferente.');
    }
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Desconectado de MongoDB');
    process.exit(0);
  }
};

// Ejecutar el script
console.log('🚀 Iniciando creación de usuario administrador...');
createAdmin(); 