const mongoose = require('mongoose');
const Order = require('./models/Order');
const User = require('./models/User');

const verificarPedidosCliente = async () => {
  try {
    // Conectar a la base de datos
    await mongoose.connect('mongodb://localhost:27017/comercializadora', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('✅ Conectado a MongoDB');

    // 1. Buscar el usuario "chris"
    console.log('\n🔍 Buscando usuario "chris"...');
    const usuario = await User.findOne({ 
      $or: [
        { email: 'chris@example.com' },
        { nombre: 'chris' },
        { email: { $regex: 'chris', $options: 'i' } }
      ]
    });

    if (!usuario) {
      console.log('❌ Usuario "chris" no encontrado');
      
      // Mostrar todos los usuarios disponibles
      const todosUsuarios = await User.find({}, 'nombre email role');
      console.log('\n📋 Usuarios disponibles:');
      todosUsuarios.forEach((u, i) => {
        console.log(`   ${i + 1}. ${u.nombre} (${u.email}) - Rol: ${u.role}`);
      });
      
      return;
    }

    console.log(`✅ Usuario encontrado: ${usuario.nombre} (${usuario.email}) - ID: ${usuario._id} - Rol: ${usuario.role}`);

    // 2. Buscar órdenes para este usuario
    console.log('\n🔍 Buscando órdenes para este usuario...');
    const ordenes = await Order.find({ cliente: usuario._id })
      .populate('cliente', 'nombre email')
      .sort({ createdAt: -1 });

    console.log(`📦 Total de órdenes encontradas: ${ordenes.length}`);

    if (ordenes.length > 0) {
      ordenes.forEach((orden, index) => {
        console.log(`\n   📋 Orden ${index + 1}:`);
        console.log(`      🆔 ID: ${orden._id}`);
        console.log(`      📝 Número: ${orden.numeroOrden}`);
        console.log(`      📅 Fecha: ${orden.createdAt}`);
        console.log(`      📊 Estado: ${orden.estado}`);
        console.log(`      💰 Total: $${orden.total}`);
        console.log(`      👤 Cliente: ${orden.cliente?.nombre || 'N/A'}`);
        console.log(`      🛍️ Productos: ${orden.productos?.length || 0}`);
      });
    } else {
      console.log('ℹ️ No se encontraron órdenes para este usuario');
    }

    // 3. Mostrar todas las órdenes en la base de datos
    console.log('\n🔍 Mostrando TODAS las órdenes en la base de datos...');
    const todasOrdenes = await Order.find({})
      .populate('cliente', 'nombre email')
      .sort({ createdAt: -1 });

    console.log(`📦 Total de órdenes en la base de datos: ${todasOrdenes.length}`);

    if (todasOrdenes.length > 0) {
      todasOrdenes.forEach((orden, index) => {
        console.log(`\n   📋 Orden ${index + 1}:`);
        console.log(`      🆔 ID: ${orden._id}`);
        console.log(`      📝 Número: ${orden.numeroOrden}`);
        console.log(`      👤 Cliente ID: ${orden.cliente?._id || orden.cliente}`);
        console.log(`      👤 Cliente Nombre: ${orden.cliente?.nombre || 'N/A'}`);
        console.log(`      👤 Cliente Email: ${orden.cliente?.email || 'N/A'}`);
        console.log(`      📊 Estado: ${orden.estado}`);
        console.log(`      💰 Total: $${orden.total}`);
      });
    } else {
      console.log('ℹ️ No hay órdenes en la base de datos');
    }

    // 4. Verificar si el usuario "chris" aparece como cliente en alguna orden
    console.log('\n🔍 Verificando si el usuario aparece como cliente en alguna orden...');
    const ordenesPorClienteId = await Order.find({
      $or: [
        { cliente: usuario._id },
        { cliente: usuario._id.toString() }
      ]
    });
    
    console.log(`📦 Órdenes encontradas por ID de cliente: ${ordenesPorClienteId.length}`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    mongoose.connection.close();
    console.log('\n🔒 Conexión cerrada');
  }
};

// Ejecutar la verificación
verificarPedidosCliente(); 