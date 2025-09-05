const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

// Configurar variables por defecto
require('dotenv').config();
if (!process.env.MONGODB_URI) {
  process.env.MONGODB_URI = 'mongodb://localhost:27017/comercializadora_spg';
}
if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = 'mi_secreto_jwt_comercializadora_2024';
}

// Conectar a la base de datos
require('./config/database');

// Importar modelos
const User = require('./models/User');

async function debugToken() {
  try {
    console.log('🔍 Debuggeando validación de token...\n');
    
    // 1. Buscar comerciante
    const comerciante = await User.findOne({ tipo: 'comerciante' });
    if (!comerciante) {
      console.log('❌ No se encontró comerciante');
      return;
    }
    
    console.log(`👤 Comerciante encontrado:`);
    console.log(`   ID: ${comerciante._id}`);
    console.log(`   Nombre: ${comerciante.nombre}`);
    console.log(`   Email: ${comerciante.email}`);
    console.log(`   Rol: ${comerciante.rol}`);
    console.log(`   Estado: ${comerciante.estado}`);
    console.log(`   Tipo: ${comerciante.tipo}\n`);
    
    // 2. Crear token
    const payload = {
      id: comerciante._id.toString(),
      email: comerciante.email,
      rol: comerciante.rol
    };
    
    console.log('📋 Payload del token:');
    console.log(JSON.stringify(payload, null, 2));
    
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '24h' });
    console.log(`\n🔑 Token generado: ${token.substring(0, 50)}...`);
    
    // 3. Verificar token
    console.log('\n🔍 Verificando token...');
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('✅ Token válido');
      console.log('📋 Datos decodificados:');
      console.log(JSON.stringify(decoded, null, 2));
      
      // 4. Buscar usuario por ID decodificado
      console.log('\n👤 Buscando usuario...');
      const usuario = await User.findById(decoded.id).select('-password');
      
      if (!usuario) {
        console.log('❌ Usuario no encontrado con ID:', decoded.id);
        return;
      }
      
      console.log('✅ Usuario encontrado:');
      console.log(`   ID: ${usuario._id}`);
      console.log(`   Estado: ${usuario.estado}`);
      console.log(`   Rol: ${usuario.rol}`);
      
      // 5. Verificar estado activo
      if (usuario.estado !== 'activo') {
        console.log('❌ Usuario no está activo');
        return;
      }
      
      console.log('✅ Usuario activo y validado');
      
      // 6. Probar endpoint con token
      console.log('\n🌐 Probando endpoint...');
      
      const http = require('http');
      
      const options = {
        hostname: 'localhost',
        port: 5000,
        path: '/api/analytics/merchant',
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      };
      
      const req = http.request(options, (res) => {
        console.log(`📊 Status: ${res.statusCode}`);
        
        let data = '';
        res.on('data', (chunk) => {
          data += chunk;
        });
        
        res.on('end', () => {
          console.log('\n📋 Response:');
          try {
            const jsonData = JSON.parse(data);
            console.log(JSON.stringify(jsonData, null, 2));
          } catch (e) {
            console.log(data);
          }
          mongoose.connection.close();
        });
      });
      
      req.on('error', (e) => {
        console.error(`❌ Error de request: ${e.message}`);
        mongoose.connection.close();
      });
      
      req.end();
      
    } catch (tokenError) {
      console.log('❌ Error verificando token:', tokenError.message);
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
    mongoose.connection.close();
  }
}

debugToken();
