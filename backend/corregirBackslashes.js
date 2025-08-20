const mongoose = require('mongoose');
const Order = require('./models/Order');
const Product = require('./models/Product');

// Configuración de conexión
const MONGODB_URI = 'mongodb://localhost:27017/comercializadora_spg';

const corregirBackslashes = async () => {
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

        // Corregir la imagen del pedido si tiene backslashes
        if (item.imagen && item.imagen.includes('\\')) {
          console.log(`   🔧 Corrigiendo backslashes para ${producto.nombre}:`);
          console.log(`      Antes: ${item.imagen}`);
          
          // Reemplazar backslashes con forward slashes
          const imagenCorregida = item.imagen.replace(/\\/g, '/');
          
          console.log(`      Después: ${imagenCorregida}`);
          item.imagen = imagenCorregida;
          pedidoModificado = true;
        }

        // También corregir las imágenes del producto si tienen backslashes
        if (producto.imagenes && Array.isArray(producto.imagenes)) {
          let productoModificado = false;
          
          for (let i = 0; i < producto.imagenes.length; i++) {
            const imagen = producto.imagenes[i];
            let urlCorregida = imagen.url || imagen;
            
            if (typeof urlCorregida === 'string' && urlCorregida.includes('\\')) {
              console.log(`   🔧 Corrigiendo backslashes en producto ${producto.nombre}:`);
              console.log(`      Antes: ${urlCorregida}`);
              
              urlCorregida = urlCorregida.replace(/\\/g, '/');
              
              console.log(`      Después: ${urlCorregida}`);
              
              if (typeof imagen === 'object') {
                imagen.url = urlCorregida;
              } else {
                producto.imagenes[i] = urlCorregida;
              }
              
              productoModificado = true;
            }
          }
          
          if (productoModificado) {
            try {
              await producto.save();
              console.log(`   💾 Producto ${producto.nombre} actualizado`);
            } catch (error) {
              console.log(`   ❌ Error guardando producto ${producto.nombre}:`, error.message);
              errores++;
            }
          }
        }

        // Corregir imagenPrincipal si tiene backslashes
        if (producto.imagenPrincipal && producto.imagenPrincipal.includes('\\')) {
          console.log(`   🔧 Corrigiendo imagenPrincipal en producto ${producto.nombre}:`);
          console.log(`      Antes: ${producto.imagenPrincipal}`);
          
          producto.imagenPrincipal = producto.imagenPrincipal.replace(/\\/g, '/');
          
          console.log(`      Después: ${producto.imagenPrincipal}`);
          
          try {
            await producto.save();
            console.log(`   💾 Producto ${producto.nombre} actualizado`);
          } catch (error) {
            console.log(`   ❌ Error guardando producto ${producto.nombre}:`, error.message);
            errores++;
          }
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
corregirBackslashes(); 