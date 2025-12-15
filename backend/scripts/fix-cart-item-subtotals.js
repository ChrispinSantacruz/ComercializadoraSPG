const mongoose = require('mongoose');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
require('dotenv').config();

async function fixCartSubtotals() {
  try {
    console.log('Conectando a MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/comercializadora');
    console.log('✅ Conectado a MongoDB\n');

    // Obtener todos los carritos con productos
    const carritos = await Cart.find({ 'productos.0': { $exists: true } })
      .populate('usuario', 'nombre email')
      .populate('productos.producto', 'nombre precio precioOferta stock');

    console.log(`📦 Total de carritos a corregir: ${carritos.length}\n`);

    let carritosCorregidos = 0;

    for (const carrito of carritos) {
      console.log('═'.repeat(80));
      console.log(`👤 Usuario: ${carrito.usuario?.email || 'Sin email'}`);
      
      let huboCorreccion = false;
      
      // Recorrer cada producto y corregir su subtotal
      for (const item of carrito.productos) {
        const precioUnitario = item.precioOferta || item.precio;
        const subtotalCorrecto = item.cantidad * precioUnitario;
        
        console.log(`\n  🔹 ${item.nombre}`);
        console.log(`     Cantidad: ${item.cantidad}`);
        console.log(`     Precio unitario: $${precioUnitario?.toLocaleString('es-CO')}`);
        console.log(`     Subtotal actual: $${item.subtotal?.toLocaleString('es-CO')}`);
        console.log(`     Subtotal correcto: $${subtotalCorrecto.toLocaleString('es-CO')}`);
        
        if (item.subtotal !== subtotalCorrecto) {
          console.log(`     ✏️  Corrigiendo subtotal...`);
          item.subtotal = subtotalCorrecto;
          huboCorreccion = true;
        } else {
          console.log(`     ✅ Subtotal correcto`);
        }
      }
      
      if (huboCorreccion) {
        console.log(`\n  💾 Guardando cambios...`);
        
        // Recalcular totales del carrito
        const subtotalAnterior = carrito.subtotal;
        carrito.calcularTotales();
        const subtotalNuevo = carrito.subtotal;
        
        await carrito.save();
        
        console.log(`  ✅ Carrito actualizado`);
        console.log(`     Subtotal: $${subtotalAnterior.toLocaleString('es-CO')} → $${subtotalNuevo.toLocaleString('es-CO')}`);
        console.log(`     Total: $${carrito.total.toLocaleString('es-CO')}`);
        
        carritosCorregidos++;
      } else {
        console.log(`\n  ✅ No se requieren correcciones`);
      }
    }

    console.log('\n' + '═'.repeat(80));
    console.log(`\n✅ Proceso completado`);
    console.log(`   - Carritos revisados: ${carritos.length}`);
    console.log(`   - Carritos corregidos: ${carritosCorregidos}`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\nConexión cerrada');
  }
}

fixCartSubtotals();
