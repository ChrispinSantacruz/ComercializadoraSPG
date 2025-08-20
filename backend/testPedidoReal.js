const mongoose = require('mongoose');
const Order = require('./models/Order');
const User = require('./models/User');
const Product = require('./models/Product');
const Cart = require('./models/Cart');

// Configuración de conexión
const MONGODB_URI = 'mongodb://localhost:27017/comercializadora_spg';

const testPedidoReal = async () => {
  try {
    console.log('🚀 Conectando a MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Conectado a MongoDB\n');

    // Buscar un cliente
    const cliente = await User.findOne({ rol: 'cliente' });
    if (!cliente) {
      console.log('❌ No se encontró ningún cliente');
      return;
    }
    console.log('👤 Cliente encontrado:', cliente.email);

    // Buscar productos aprobados
    const productos = await Product.find({ estado: 'aprobado' }).limit(2);
    if (productos.length === 0) {
      console.log('❌ No se encontraron productos aprobados');
      return;
    }
    console.log('📦 Productos encontrados:', productos.length);

    // Crear productos para el pedido
    const productosValidos = productos.map(producto => ({
      producto: producto._id,
      comerciante: producto.comerciante,
      nombre: producto.nombre,
      precio: producto.precioOferta || producto.precio,
      cantidad: 1,
      subtotal: producto.precioOferta || producto.precio,
      imagen: producto.imagenPrincipal || (producto.imagenes && producto.imagenes.length > 0 ? producto.imagenes[0].url : '') || ''
    }));

    // Calcular totales
    const subtotal = productosValidos.reduce((sum, p) => sum + p.subtotal, 0);
    const impuestos = Math.round(subtotal * 0.19);
    const costoEnvio = subtotal > 100000 ? 0 : 15000;
    const total = subtotal + impuestos + costoEnvio;

    // Generar número de orden
    const numeroOrden = `SPG-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    // Crear el pedido
    const nuevoPedido = new Order({
      numeroOrden,
      cliente: cliente._id,
      productos: productosValidos,
      subtotal,
      impuestos,
      costoEnvio,
      descuentos: 0,
      total,
      estado: 'pendiente',
      direccionEntrega: {
        nombre: cliente.nombre,
        telefono: cliente.telefono || '3001234567',
        calle: 'Calle 123 #45-67',
        ciudad: 'Bogotá',
        departamento: 'Cundinamarca',
        codigoPostal: '110111',
        pais: 'Colombia',
        instrucciones: 'Entregar en portería'
      },
      metodoPago: {
        tipo: 'PSE',
        estado: 'aprobado',
        transaccionId: `TXN_${Date.now()}`,
        fechaPago: new Date()
      }
    });

    await nuevoPedido.save();
    console.log('✅ Pedido creado exitosamente');
    console.log('📋 Detalles del pedido:');
    console.log(`   Número: ${nuevoPedido.numeroOrden}`);
    console.log(`   Cliente: ${cliente.nombre}`);
    console.log(`   Productos: ${productosValidos.length}`);
    console.log(`   Subtotal: $${subtotal.toLocaleString()}`);
    console.log(`   Impuestos: $${impuestos.toLocaleString()}`);
    console.log(`   Envío: $${costoEnvio.toLocaleString()}`);
    console.log(`   Total: $${total.toLocaleString()}`);

    // Verificar que se creó correctamente
    const pedidoCreado = await Order.findById(nuevoPedido._id)
      .populate('cliente', 'nombre email')
      .populate('productos.producto', 'nombre precio')
      .populate('productos.comerciante', 'nombre');

    console.log('\n🔍 Verificación del pedido:');
    console.log(`   ID: ${pedidoCreado._id}`);
    console.log(`   Cliente: ${pedidoCreado.cliente.nombre}`);
    console.log(`   Estado: ${pedidoCreado.estado}`);
    console.log(`   Productos: ${pedidoCreado.productos.length}`);

    // Mostrar comerciantes involucrados
    const comerciantes = [...new Set(productosValidos.map(p => p.comerciante.toString()))];
    console.log('\n🏪 Comerciantes involucrados:');
    for (const comercianteId of comerciantes) {
      const comerciante = await User.findById(comercianteId);
      const productosComerciante = productosValidos.filter(p => p.comerciante.toString() === comercianteId);
      const totalComerciante = productosComerciante.reduce((sum, p) => sum + p.subtotal, 0);
      
      console.log(`   ${comerciante.nombre}: ${productosComerciante.length} producto(s) - $${totalComerciante.toLocaleString()}`);
    }

    console.log('\n✅ Prueba completada exitosamente');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Desconectado de MongoDB');
    process.exit(0);
  }
};

// Ejecutar el script
console.log('🚀 Iniciando prueba de pedido real...\n');
testPedidoReal(); 