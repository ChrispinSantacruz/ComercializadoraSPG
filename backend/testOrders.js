const mongoose = require('mongoose');
require('dotenv').config();

// Conectar a la base de datos
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/comercializadora_spg');

const User = require('./models/User');
const Product = require('./models/Product');
const Order = require('./models/Order');

async function verificarYCrearPedidos() {
  try {
    console.log('🔍 Verificando pedidos existentes...');
    const pedidosExistentes = await Order.find({}).populate('cliente', 'nombre email');
    console.log(`📦 Pedidos encontrados: ${pedidosExistentes.length}`);
    
    if (pedidosExistentes.length > 0) {
      pedidosExistentes.forEach(pedido => {
        console.log(`- Pedido: ${pedido.numeroOrden}, Cliente: ${pedido.cliente?.nombre || 'Sin cliente'}, Estado: ${pedido.estado}`);
      });
    }

    console.log('\n🔍 Verificando usuarios...');
    const usuarios = await User.find({});
    console.log(`👥 Usuarios encontrados: ${usuarios.length}`);
    
    const clientes = usuarios.filter(u => u.rol === 'cliente');
    const comerciantes = usuarios.filter(u => u.rol === 'comerciante');
    console.log(`👤 Clientes: ${clientes.length}, 🏪 Comerciantes: ${comerciantes.length}`);

    console.log('\n🔍 Verificando productos...');
    const productos = await Product.find({ estado: 'aprobado' }).populate('comerciante', 'nombre');
    console.log(`📦 Productos aprobados: ${productos.length}`);

    // Si no hay pedidos, crear algunos de prueba
    if (pedidosExistentes.length === 0 && clientes.length > 0 && productos.length > 0) {
      console.log('\n🚀 Creando pedidos de prueba...');
      
      const cliente = clientes[0];
      const producto = productos[0];
      
      const nuevoPedido = new Order({
        numeroOrden: `ORD-${Date.now()}`,
        cliente: cliente._id,
        productos: [{
          producto: producto._id,
          comerciante: producto.comerciante._id,
          nombre: producto.nombre,
          precio: producto.precio,
          cantidad: 1,
          subtotal: producto.precio,
          imagen: producto.imagenes[0] || ''
        }],
        subtotal: producto.precio,
        impuestos: Math.round(producto.precio * 0.19),
        costoEnvio: 0,
        descuentos: 0,
        total: producto.precio + Math.round(producto.precio * 0.19),
        estado: 'pendiente',
        direccionEntrega: {
          nombre: cliente.nombre,
          telefono: cliente.telefono || '3001234567',
          calle: 'Calle 123',
          ciudad: 'Bogotá',
          departamento: 'Cundinamarca',
          codigoPostal: '110111',
          pais: 'Colombia'
        },
        metodoPago: {
          tipo: 'PSE',
          estado: 'aprobado',
          transaccionId: 'TXN_' + Date.now(),
          fechaPago: new Date()
        }
      });

      await nuevoPedido.save();
      console.log('✅ Pedido de prueba creado:', nuevoPedido.numeroOrden);

      // Crear otro pedido con estado diferente
      const segundoPedido = new Order({
        numeroOrden: `ORD-${Date.now() + 1}`,
        cliente: cliente._id,
        productos: [{
          producto: producto._id,
          comerciante: producto.comerciante._id,
          nombre: producto.nombre,
          precio: producto.precio,
          cantidad: 2,
          subtotal: producto.precio * 2,
          imagen: producto.imagenes[0] || ''
        }],
        subtotal: producto.precio * 2,
        impuestos: Math.round(producto.precio * 2 * 0.19),
        costoEnvio: 15000,
        descuentos: 0,
        total: (producto.precio * 2) + Math.round(producto.precio * 2 * 0.19) + 15000,
        estado: 'procesando',
        direccionEntrega: {
          nombre: cliente.nombre,
          telefono: cliente.telefono || '3001234567',
          calle: 'Carrera 7',
          ciudad: 'Bogotá',
          departamento: 'Cundinamarca',
          codigoPostal: '110111',
          pais: 'Colombia'
        },
        metodoPago: {
          tipo: 'PSE',
          estado: 'aprobado',
          transaccionId: 'TXN_' + (Date.now() + 1),
          fechaPago: new Date()
        }
      });

      await segundoPedido.save();
      console.log('✅ Segundo pedido de prueba creado:', segundoPedido.numeroOrden);
    }

    console.log('\n✅ Verificación completa');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    mongoose.disconnect();
  }
}

verificarYCrearPedidos(); 