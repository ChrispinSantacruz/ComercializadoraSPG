/**
 * Script para actualizar el costo de envío en todos los carritos
 * Ejecutar: node scripts/fix-cart-shipping.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Cart = require('../models/Cart');

const fixCartShipping = async () => {
  try {
    console.log('🔧 Conectando a la base de datos...');
    
    // Conectar a MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/comercializadora_spg');
    console.log('✅ Conectado a MongoDB');

    // Obtener todos los carritos
    const carritos = await Cart.find({});
    console.log(`📦 Encontrados ${carritos.length} carritos`);

    let actualizados = 0;
    
    // Actualizar cada carrito
    for (const carrito of carritos) {
      console.log(`\n🛒 Procesando carrito de usuario ${carrito.usuario}...`);
      console.log(`   Productos: ${carrito.productos.length}`);
      console.log(`   Costo envío actual: $${carrito.costoEnvio}`);
      
      // Recalcular totales
      carrito.calcularTotales();
      
      // Guardar
      await carrito.save();
      
      console.log(`   ✅ Actualizado - Nuevo costo envío: $${carrito.costoEnvio}`);
      console.log(`   💰 Nuevo total: $${carrito.total}`);
      actualizados++;
    }

    console.log(`\n✨ Proceso completado!`);
    console.log(`📊 Carritos actualizados: ${actualizados}/${carritos.length}`);
    
    // Cerrar conexión
    await mongoose.connection.close();
    console.log('👋 Desconectado de MongoDB');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

fixCartShipping();
