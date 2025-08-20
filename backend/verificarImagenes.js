const mongoose = require('mongoose');
const Order = require('./models/Order');
const Product = require('./models/Product');

// Configuración de conexión
const MONGODB_URI = 'mongodb://localhost:27017/comercializadora_spg';

const verificarImagenes = async () => {
  try {
    console.log('🚀 Conectando a MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Conectado a MongoDB\n');

    // Verificar productos
    console.log('🔍 Verificando productos...');
    const productos = await Product.find({});
    
    for (const producto of productos) {
      console.log(`\n📦 Producto: ${producto.nombre}`);
      console.log(`   ID: ${producto._id}`);
      
      if (producto.imagenes && producto.imagenes.length > 0) {
        console.log(`   📸 Imágenes:`);
        producto.imagenes.forEach((img, index) => {
          const url = typeof img === 'object' ? img.url : img;
          console.log(`      ${index + 1}. ${url}`);
        });
      } else {
        console.log(`   ⚠️ Sin imágenes`);
      }
      
      if (producto.imagenPrincipal) {
        console.log(`   🖼️ Imagen principal: ${producto.imagenPrincipal}`);
      }
    }

    // Verificar pedidos
    console.log('\n🔍 Verificando pedidos...');
    const pedidos = await Order.find({}).populate('productos.producto', 'nombre imagenes');
    
    for (const pedido of pedidos) {
      console.log(`\n📋 Pedido: ${pedido.numeroOrden}`);
      
      for (const item of pedido.productos) {
        console.log(`   📦 Producto: ${item.producto?.nombre || 'Sin nombre'}`);
        console.log(`      Imagen en pedido: ${item.imagen || 'Sin imagen'}`);
        
        if (item.producto?.imagenes && item.producto.imagenes.length > 0) {
          console.log(`      Imágenes del producto:`);
          item.producto.imagenes.forEach((img, index) => {
            const url = typeof img === 'object' ? img.url : img;
            console.log(`         ${index + 1}. ${url}`);
          });
        }
      }
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Desconectado de MongoDB');
  }
};

// Ejecutar el script
verificarImagenes(); 