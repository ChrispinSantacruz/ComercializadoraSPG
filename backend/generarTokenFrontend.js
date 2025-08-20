const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const User = require('./models/User');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/comercializadora_spg';
const JWT_SECRET = process.env.JWT_SECRET || 'tu_clave_secreta_jwt';

const generarTokenFrontend = async () => {
  try {
    console.log('🚀 Conectando a MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Conectado a MongoDB\n');

    // Buscar comerciante
    const comerciante = await User.findOne({ rol: 'comerciante' });
    if (!comerciante) {
      console.log('❌ No se encontró ningún comerciante');
      return;
    }
    console.log(`👤 Comerciante encontrado: ${comerciante.nombre} (${comerciante.email})`);

    // Generar token
    const token = jwt.sign(
      { 
        id: comerciante._id,
        email: comerciante.email,
        rol: comerciante.rol
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    console.log('\n🔑 TOKEN GENERADO:');
    console.log(token);
    
    console.log('\n📋 INFORMACIÓN:');
    console.log(`   Usuario: ${comerciante.nombre}`);
    console.log(`   Email: ${comerciante.email}`);
    console.log(`   Rol: ${comerciante.rol}`);
    console.log(`   ID: ${comerciante._id}`);

    console.log('\n💡 INSTRUCCIONES PARA EL FRONTEND:');
    console.log('1. Abre las herramientas de desarrollador (F12)');
    console.log('2. Ve a la pestaña Console');
    console.log('3. Ejecuta estos comandos:');
    console.log('');
    console.log('// Limpiar datos anteriores');
    console.log('localStorage.clear();');
    console.log('');
    console.log('// Crear estructura auth-storage');
    console.log(`const authData = {
  state: {
    user: {
      id: "${comerciante._id}",
      nombre: "${comerciante.nombre}",
      email: "${comerciante.email}",
      rol: "${comerciante.rol}"
    },
    token: "${token}",
    isAuthenticated: true
  }
};`);
    console.log('');
    console.log('// Guardar en localStorage');
    console.log('localStorage.setItem("auth-storage", JSON.stringify(authData));');
    console.log('');
    console.log('// Recargar página');
    console.log('window.location.reload();');

    console.log('\n🎯 COMANDO COMPLETO PARA COPIAR Y PEGAR:');
    console.log('localStorage.clear(); const authData = { state: { user: { id: "' + comerciante._id + '", nombre: "' + comerciante.nombre + '", email: "' + comerciante.email + '", rol: "' + comerciante.rol + '" }, token: "' + token + '", isAuthenticated: true } }; localStorage.setItem("auth-storage", JSON.stringify(authData)); window.location.reload();');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Desconectado de MongoDB');
    process.exit(0);
  }
};

generarTokenFrontend(); 