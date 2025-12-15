const mongoose = require('mongoose');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
require('dotenv').config();

async function debugCart() {
  try {
    console.log('Conectando a MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/comercializadora');
    console.log('✅ Conectado a MongoDB\n');

    // Obtener todos los carritos con productos
    const carritos = await Cart.find({ 'productos.0': { $exists: true } })
      .populate('usuario', 'nombre email')
      .populate('productos.producto', 'nombre precio precioOferta stock');

    console.log(`📦 Total de carritos con productos: ${carritos.length}\n`);

    for (const carrito of carritos) {
      console.log('═'.repeat(80));
      console.log(`👤 Usuario: ${carrito.usuario?.email || 'Sin email'}`);
      console.log(`📅 Última actualización: ${carrito.fechaActualizacion}`);
      console.log(`\n📋 Productos en el carrito (${carrito.productos.length}):`);
      
      let subtotalCalculado = 0;
      
      for (const item of carrito.productos) {
        const producto = item.producto;
        console.log(`\n  🔹 Producto: ${item.nombre || producto?.nombre || 'Sin nombre'}`);
        console.log(`     - ID: ${item.producto}`);
        console.log(`     - Cantidad: ${item.cantidad}`);
        console.log(`     - Precio en carrito: $${item.precio?.toLocaleString('es-CO')}`);
        console.log(`     - Precio oferta en carrito: $${item.precioOferta?.toLocaleString('es-CO') || 'N/A'}`);
        
        if (producto) {
          console.log(`     - Precio actual del producto: $${producto.precio?.toLocaleString('es-CO')}`);
          console.log(`     - Precio oferta actual: $${producto.precioOferta?.toLocaleString('es-CO') || 'N/A'}`);
          console.log(`     - Stock disponible: ${producto.stock}`);
        } else {
          console.log(`     ⚠️  Producto no encontrado o eliminado`);
        }
        
        console.log(`     - Subtotal guardado: $${item.subtotal?.toLocaleString('es-CO')}`);
        
        const precioAUsar = item.precioOferta || item.precio;
        const subtotalEsperado = item.cantidad * precioAUsar;
        console.log(`     - Subtotal esperado: ${item.cantidad} x $${precioAUsar?.toLocaleString('es-CO')} = $${subtotalEsperado.toLocaleString('es-CO')}`);
        
        if (item.subtotal !== subtotalEsperado) {
          console.log(`     ❌ DIFERENCIA: $${(item.subtotal - subtotalEsperado).toLocaleString('es-CO')}`);
        }
        
        subtotalCalculado += subtotalEsperado;
      }
      
      console.log(`\n💰 Totales del carrito:`);
      console.log(`   - Subtotal guardado: $${carrito.subtotal?.toLocaleString('es-CO')}`);
      console.log(`   - Subtotal calculado: $${subtotalCalculado.toLocaleString('es-CO')}`);
      
      if (carrito.subtotal !== subtotalCalculado) {
        console.log(`   ❌ DIFERENCIA EN SUBTOTAL: $${(carrito.subtotal - subtotalCalculado).toLocaleString('es-CO')}`);
      }
      
      const impuestosEsperados = subtotalCalculado * 0.19;
      console.log(`   - Impuestos guardados: $${carrito.impuestos?.toLocaleString('es-CO')}`);
      console.log(`   - Impuestos esperados (19%): $${impuestosEsperados.toLocaleString('es-CO')}`);
      
      console.log(`   - Costo de envío: $${carrito.costoEnvio?.toLocaleString('es-CO')}`);
      console.log(`   - Descuentos: $${carrito.descuentos?.toLocaleString('es-CO')}`);
      
      const totalEsperado = subtotalCalculado - carrito.descuentos + impuestosEsperados + carrito.costoEnvio;
      console.log(`   - Total guardado: $${carrito.total?.toLocaleString('es-CO')}`);
      console.log(`   - Total esperado: $${totalEsperado.toLocaleString('es-CO')}`);
      
      if (Math.abs(carrito.total - totalEsperado) > 1) {
        console.log(`   ❌ DIFERENCIA EN TOTAL: $${(carrito.total - totalEsperado).toLocaleString('es-CO')}`);
      }
      
      console.log('\n');
    }

    console.log('═'.repeat(80));
    console.log('\n✅ Depuración completada');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Conexión cerrada');
  }
}

debugCart();
