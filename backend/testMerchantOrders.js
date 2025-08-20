const mongoose = require('mongoose');
const Order = require('./models/Order');
const User = require('./models/User');
const Product = require('./models/Product');

// Conectar a la base de datos
mongoose.connect('mongodb://localhost:27017/comercializadora_spg');

async function testMerchantOrders() {
  try {
    console.log('🔍 Probando órdenes del comerciante...');
    
    // Buscar un comerciante
    const comerciante = await User.findOne({ rol: 'comerciante' });
    if (!comerciante) {
      console.log('❌ No se encontró comerciante');
      return;
    }
    
    console.log('👤 Comerciante encontrado:', comerciante.nombre, comerciante._id);
    
    // Buscar órdenes del comerciante
    const ordenes = await Order.find({
      'productos.comerciante': comerciante._id
    }).populate('cliente', 'nombre email');
    
    console.log(`📦 Órdenes encontradas: ${ordenes.length}`);
    
    ordenes.forEach((orden, index) => {
      console.log(`   ${index + 1}. ${orden.numeroOrden} - Estado: ${orden.estado} - Total: $${orden.total}`);
      orden.productos.forEach((prod, pIndex) => {
        console.log(`      ${pIndex + 1}. ${prod.nombre} (Comerciante: ${prod.comerciante})`);
      });
    });
    
    // Si no hay órdenes, crear una de prueba
    if (ordenes.length === 0) {
      console.log('🔧 Creando orden de prueba...');
      
      // Buscar un cliente
      const cliente = await User.findOne({ rol: 'cliente' });
      if (!cliente) {
        console.log('❌ No se encontró cliente');
        return;
      }
      
      // Crear orden de prueba
      const ordenPrueba = new Order({
        numeroOrden: `TEST-${Date.now()}`,
        cliente: cliente._id,
        productos: [{
          producto: new mongoose.Types.ObjectId(),
          comerciante: comerciante._id,
          nombre: 'Producto de Prueba',
          precio: 50000,
          cantidad: 1,
          subtotal: 50000,
          imagen: ''
        }],
        subtotal: 50000,
        impuestos: 9500,
        costoEnvio: 0,
        total: 59500,
        estado: 'pendiente',
        direccionEntrega: {
          nombre: 'Test Cliente',
          telefono: '300123456',
          calle: 'Calle Test',
          ciudad: 'Bogotá',
          departamento: 'Cundinamarca',
          pais: 'Colombia'
        },
        metodoPago: {
          tipo: 'PSE',
          estado: 'aprobado',
          transaccionId: `TXN_TEST_${Date.now()}`,
          fechaPago: new Date()
        }
      });
      
      await ordenPrueba.save();
      console.log('✅ Orden de prueba creada:', ordenPrueba.numeroOrden);
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    mongoose.connection.close();
  }
}

testMerchantOrders(); 