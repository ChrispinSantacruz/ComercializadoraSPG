const mongoose = require('mongoose');
const Order = require('./models/Order');

const verificarEstadoPedido = async () => {
  try {
    // Conectar a la base de datos
    await mongoose.connect('mongodb://localhost:27017/comercializadora', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('✅ Conectado a MongoDB');

    // ID del pedido específico que está dando error
    const pedidoId = '6862bcc306f07ed63a7b121d';
    
    console.log(`\n🔍 Buscando pedido: ${pedidoId}`);
    
    const pedido = await Order.findById(pedidoId)
      .populate('cliente', 'nombre email')
      .populate('productos.producto', 'nombre');

    if (!pedido) {
      console.log('❌ Pedido no encontrado');
      return;
    }

    console.log('\n📦 INFORMACIÓN DEL PEDIDO:');
    console.log(`   🆔 ID: ${pedido._id}`);
    console.log(`   📝 Número: ${pedido.numeroOrden}`);
    console.log(`   📊 Estado actual: ${pedido.estado}`);
    console.log(`   👤 Cliente: ${pedido.cliente?.nombre || 'N/A'}`);
    console.log(`   📅 Fecha creación: ${pedido.createdAt}`);
    console.log(`   💰 Total: $${pedido.total}`);

    // Verificar información de entrega
    console.log('\n🚚 INFORMACIÓN DE ENTREGA:');
    if (pedido.entrega) {
      console.log(`   ✅ Confirmada: ${pedido.entrega.confirmada ? 'SÍ' : 'NO'}`);
      if (pedido.entrega.fechaConfirmacion) {
        console.log(`   📅 Fecha confirmación: ${pedido.entrega.fechaConfirmacion}`);
      }
      if (pedido.entrega.comentarioCliente) {
        console.log(`   💬 Comentario: ${pedido.entrega.comentarioCliente}`);
      }
    } else {
      console.log('   ℹ️ No hay información de entrega registrada');
    }

    // Verificar información de reseñas
    console.log('\n⭐ INFORMACIÓN DE RESEÑAS:');
    if (pedido.reseñas) {
      console.log(`   🔓 Puede reseñar: ${pedido.reseñas.puedeReseñar ? 'SÍ' : 'NO'}`);
      if (pedido.reseñas.fechaHabilitacion) {
        console.log(`   📅 Fecha habilitación: ${pedido.reseñas.fechaHabilitacion}`);
      }
    } else {
      console.log('   ℹ️ No hay información de reseñas registrada');
    }

    // Mostrar historial de estados
    console.log('\n📋 HISTORIAL DE ESTADOS:');
    if (pedido.historialEstados && pedido.historialEstados.length > 0) {
      pedido.historialEstados.forEach((historia, index) => {
        console.log(`   ${index + 1}. ${historia.estado} - ${historia.fecha} - ${historia.comentario || 'Sin comentario'}`);
      });
    } else {
      console.log('   ℹ️ No hay historial de estados');
    }

    // Verificar qué estados son válidos para confirmar entrega
    console.log('\n🔍 VERIFICACIÓN DE ESTADO:');
    const estadosValidos = ['enviado', 'entregado'];
    console.log(`   📊 Estado actual: "${pedido.estado}"`);
    console.log(`   ✅ Estados válidos: ${estadosValidos.join(', ')}`);
    console.log(`   🎯 ¿Puede confirmar entrega? ${estadosValidos.includes(pedido.estado) ? 'SÍ' : 'NO'}`);
    
    if (!estadosValidos.includes(pedido.estado)) {
      console.log(`   ⚠️ PROBLEMA: El pedido está en estado "${pedido.estado}" y debe estar en "${estadosValidos.join('" o "')}" para confirmar entrega`);
      
      // Sugerir cambio de estado para pruebas
      console.log('\n💡 SOLUCIÓN TEMPORAL PARA PRUEBAS:');
      console.log('   Cambiando estado a "entregado" para que pueda confirmarse...');
      
      pedido.estado = 'entregado';
      pedido.historialEstados.push({
        estado: 'entregado',
        fecha: new Date(),
        comentario: 'Cambiado a entregado para pruebas de confirmación',
        usuario: pedido.cliente
      });
      
      await pedido.save();
      console.log('   ✅ Estado actualizado a "entregado"');
      console.log('   🎯 Ahora ya puedes confirmar la entrega desde el frontend');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    mongoose.connection.close();
    console.log('\n🔒 Conexión cerrada');
  }
};

// Ejecutar la verificación
verificarEstadoPedido(); 