const mongoose = require('mongoose');
const Order = require('./models/Order');
const Product = require('./models/Product');
const path = require('path');

// Configuración de conexión
const MONGODB_URI = 'mongodb://localhost:27017/comercializadora_spg';

const corregirRutasImagenesPedidos = async () => {
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

        // Corregir la imagen del pedido si tiene ruta absoluta
        if (item.imagen) {
          let imagenCorregida = item.imagen;
          
          // Si la imagen tiene ruta absoluta de Windows, convertirla a ruta relativa
          if (imagenCorregida.includes('C:\\') || imagenCorregida.includes('C:/') || imagenCorregida.includes('file:///')) {
            console.log(`   🔧 Corrigiendo ruta absoluta para ${producto.nombre}:`);
            console.log(`      Antes: ${imagenCorregida}`);
            
            // Extraer solo el nombre del archivo
            const fileName = path.basename(imagenCorregida);
            imagenCorregida = `/uploads/productos/${fileName}`;
            
            console.log(`      Después: ${imagenCorregida}`);
            item.imagen = imagenCorregida;
            pedidoModificado = true;
          }
        }

        // También corregir las imágenes del producto si tienen rutas absolutas
        if (producto.imagenes && Array.isArray(producto.imagenes)) {
          let productoModificado = false;
          
          for (let i = 0; i < producto.imagenes.length; i++) {
            const imagen = producto.imagenes[i];
            let urlCorregida = imagen.url || imagen;
            
            if (typeof urlCorregida === 'string' && (urlCorregida.includes('C:\\') || urlCorregida.includes('C:/') || urlCorregida.includes('file:///'))) {
              console.log(`   🔧 Corrigiendo ruta absoluta en producto ${producto.nombre}:`);
              console.log(`      Antes: ${urlCorregida}`);
              
              const fileName = path.basename(urlCorregida);
              urlCorregida = `/uploads/productos/${fileName}`;
              
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
corregirRutasImagenesPedidos(); 