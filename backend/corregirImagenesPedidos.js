const mongoose = require('mongoose');
const Order = require('./models/Order');
const Product = require('./models/Product');

// Configuración de conexión
const MONGODB_URI = 'mongodb://localhost:27017/comercializadora_spg';

const corregirImagenesPedidos = async () => {
  try {
    console.log('🚀 Conectando a MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Conectado a MongoDB\n');

    // Obtener todos los pedidos
    const pedidos = await Order.find({}).populate('productos.producto', 'nombre imagenes imagenPrincipal');
    
    console.log(`📦 Encontrados ${pedidos.length} pedidos para verificar`);

    let pedidosActualizados = 0;
    let errores = 0;

    for (const pedido of pedidos) {
      console.log(`\n🔍 Verificando pedido: ${pedido.numeroOrden}`);
      
      let pedidoModificado = false;
      
      for (const item of pedido.productos) {
        const producto = item.producto;
        if (!producto) {
          console.log(`   ⚠️ Producto no encontrado para item ${item._id}`);
          continue;
        }

        // Obtener la imagen correcta del producto
        const imagenCorrecta = producto.imagenPrincipal || 
          (producto.imagenes && producto.imagenes.length > 0 ? producto.imagenes[0].url : '') || '';

        // Verificar si la imagen actual es diferente
        if (item.imagen !== imagenCorrecta) {
          console.log(`   📸 Actualizando imagen para ${producto.nombre}:`);
          console.log(`      Antes: ${item.imagen}`);
          console.log(`      Después: ${imagenCorrecta}`);
          
          item.imagen = imagenCorrecta;
          pedidoModificado = true;
        } else {
          console.log(`   ✅ Imagen correcta para ${producto.nombre}: ${item.imagen}`);
        }
      }

      // Guardar el pedido si fue modificado
      if (pedidoModificado) {
        try {
          await pedido.save();
          console.log(`   💾 Pedido ${pedido.numeroOrden} actualizado`);
          pedidosActualizados++;
        } catch (error) {
          console.log(`   ❌ Error guardando pedido ${pedido.numeroOrden}:`, error.message);
          errores++;
        }
      }
    }

    console.log(`\n📊 Resumen:`);
    console.log(`   ✅ Pedidos actualizados: ${pedidosActualizados}`);
    console.log(`   ❌ Errores: ${errores}`);
    console.log(`   📦 Total de pedidos procesados: ${pedidos.length}`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Desconectado de MongoDB');
  }
};

// Ejecutar el script
corregirImagenesPedidos(); 