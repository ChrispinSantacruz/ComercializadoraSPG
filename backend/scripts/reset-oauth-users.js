/**
 * Script para resetear usuarios OAuth (poner rol = null)
 * Ejecutar con: node scripts/reset-oauth-users.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const resetOAuthUsers = async () => {
  try {
    // Conectar a MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Conectado a MongoDB');

    // Buscar usuarios OAuth (que tienen proveedor)
    const usuarios = await User.find({ 
      proveedor: { $in: ['google', 'facebook'] } 
    });

    console.log(`\n📊 Usuarios OAuth encontrados: ${usuarios.length}`);

    if (usuarios.length === 0) {
      console.log('ℹ️ No hay usuarios OAuth para resetear');
      process.exit(0);
    }

    // Mostrar usuarios
    console.log('\n👥 Usuarios OAuth:');
    usuarios.forEach((user, index) => {
      console.log(`${index + 1}. ${user.nombre} (${user.email}) - Rol actual: ${user.rol || 'null'} - Proveedor: ${user.proveedor}`);
    });

    // Resetear rol a null
    const result = await User.updateMany(
      { proveedor: { $in: ['google', 'facebook'] } },
      { $set: { rol: null } }
    );

    console.log(`\n✅ ${result.modifiedCount} usuarios actualizados (rol = null)`);
    console.log('\n💡 Ahora al iniciar sesión con OAuth, se pedirá seleccionar rol\n');

    process.exit(0);

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

resetOAuthUsers();
