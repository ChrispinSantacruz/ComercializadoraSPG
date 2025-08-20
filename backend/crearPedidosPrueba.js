const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/comercializadora_spg');

const Order = require('./models/Order');
const User = require('./models/User');
const Product = require('./models/Product');

async function crearPedidosPrueba() {
  try {
    console.log('🔍 Verificando datos existentes...');
    
    // Verificar usuarios
    const clientes = await User.find({ rol: 'cliente' });
    const comerciantes = await User.find({ rol: 'comerciante' });
    console.log(`👤 Clientes: ${clientes.length}, 🏪 Comerciantes: ${comerciantes.length}`);
    
    if (clientes.length === 0 || comerciantes.length === 0) {
      console.log('❌ Necesitas al menos un cliente y un comerciante');
      return;
    }
    
    // Verificar productos
    const productos = await Product.find({ estado: 'aprobado' });
    console.log(`📦 Productos: ${productos.length}`);
    
    if (productos.length === 0) {
      console.log('❌ Necesitas al menos un producto aprobado');
      return;
    }
    
    // Verificar pedidos existentes
    const pedidosExistentes = await Order.find({});
    console.log(`🛒 Pedidos existentes: ${pedidosExistentes.length}`);
    
    // Crear pedidos de prueba
    const cliente = clientes[0];
    const producto = productos[0];
    
    const pedido1 = new Order({
      numeroOrden: `SPG-${Date.now()}-TEST1`,
      cliente: cliente._id,
      productos: [{
        producto: producto._id,
        comerciante: producto.comerciante,
        nombre: producto.nombre,
        precio: producto.precio,
        cantidad: 1,
        subtotal: producto.precio,
        imagen: producto.imagenes?.[0] || ''
      }],
      subtotal: producto.precio,
      impuestos: Math.round(producto.precio * 0.19),
      costoEnvio: 15000,
      total: producto.precio + Math.round(producto.precio * 0.19) + 15000,
      estado: 'pendiente',
      direccionEntrega: {
        nombre: cliente.nombre,
        telefono: cliente.telefono || '3001234567',
        calle: 'Calle 123',
        ciudad: 'Bogotá',
        departamento: 'Cundinamarca',
        pais: 'Colombia'
      },
      metodoPago: {
        tipo: 'PSE',
        estado: 'aprobado',
        transaccionId: 'TXN_' + Date.now()
      }
    });
    
    await pedido1.save();
    console.log('✅ Pedido creado:', pedido1.numeroOrden);
    
    // Verificar que se creó correctamente
    const pedidoCreado = await Order.findById(pedido1._id).populate('cliente', 'nombre');
    console.log('✅ Verificación:', pedidoCreado.numeroOrden, 'Cliente:', pedidoCreado.cliente.nombre);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    mongoose.disconnect();
  }
}

crearPedidosPrueba(); 