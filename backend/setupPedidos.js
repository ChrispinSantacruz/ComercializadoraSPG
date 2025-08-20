const mongoose = require('mongoose');
require('dotenv').config();

// Modelos
const Order = require('./models/Order');
const User = require('./models/User');
const Product = require('./models/Product');

// Conectar a MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/comercializadora_spg', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

async function configurarPedidos() {
  console.log('🚀 Configurando sistema de pedidos...\n');

  try {
    // 1. Verificar usuarios existentes
    console.log('1️⃣ Verificando usuarios...');
    const usuarios = await User.find({});
    console.log(`   👥 Total usuarios: ${usuarios.length}`);
    
    const clientes = usuarios.filter(u => u.rol === 'cliente');
    const comerciantes = usuarios.filter(u => u.rol === 'comerciante');
    console.log(`   👤 Clientes: ${clientes.length}`);
    console.log(`   🏪 Comerciantes: ${comerciantes.length}`);

    if (clientes.length === 0) {
      console.log('   ⚠️  No hay clientes. Creando cliente de prueba...');
      const nuevoCliente = new User({
        nombre: 'Juan Pérez',
        email: 'cliente@test.com',
        password: '$2a$10$vNhKsqzO3VvZJNUJy3w5i.PvWNxhWQyPjjNFD3VhQqbMJj3J5nXTS', // 123456
        telefono: '3001234567',
        rol: 'cliente',
        estado: 'activo'
      });
      await nuevoCliente.save();
      clientes.push(nuevoCliente);
      console.log('   ✅ Cliente creado:', nuevoCliente.email);
    }

    // 2. Verificar productos existentes
    console.log('\n2️⃣ Verificando productos...');
    const productos = await Product.find({ estado: 'aprobado' }).populate('comerciante', 'nombre');
    console.log(`   📦 Productos aprobados: ${productos.length}`);

    if (productos.length === 0) {
      console.log('   ⚠️  No hay productos aprobados. Necesitas crear productos primero.');
      return;
    }

    // 3. Verificar pedidos existentes
    console.log('\n3️⃣ Verificando pedidos...');
    const pedidosExistentes = await Order.find({}).populate('cliente', 'nombre email');
    console.log(`   🛒 Pedidos existentes: ${pedidosExistentes.length}`);

    if (pedidosExistentes.length > 0) {
      console.log('   📋 Pedidos encontrados:');
      pedidosExistentes.forEach(pedido => {
        console.log(`     - ${pedido.numeroOrden}: ${pedido.cliente?.nombre || 'Sin cliente'} (${pedido.estado})`);
      });
    }

    // 4. Crear pedidos de prueba
    if (pedidosExistentes.length < 3) {
      console.log('\n4️⃣ Creando pedidos de prueba...');
      
      const cliente = clientes[0];
      const producto1 = productos[0];
      const producto2 = productos[1] || productos[0]; // Usar el mismo si solo hay uno

      // Pedido 1: Pendiente
      const pedido1 = new Order({
        numeroOrden: `SPG-${Date.now()}-001`,
        cliente: cliente._id,
        productos: [{
          producto: producto1._id,
          comerciante: producto1.comerciante._id,
          nombre: producto1.nombre,
          precio: producto1.precio,
          cantidad: 1,
          subtotal: producto1.precio,
          imagen: producto1.imagenes?.[0] || ''
        }],
        subtotal: producto1.precio,
        impuestos: Math.round(producto1.precio * 0.19),
        costoEnvio: 15000,
        descuentos: 0,
        total: producto1.precio + Math.round(producto1.precio * 0.19) + 15000,
        estado: 'pendiente',
        direccionEntrega: {
          nombre: cliente.nombre,
          telefono: cliente.telefono || '3001234567',
          calle: 'Calle 123 #45-67',
          ciudad: 'Bogotá',
          departamento: 'Cundinamarca',
          codigoPostal: '110111',
          pais: 'Colombia',
          instrucciones: 'Entregar en la portería'
        },
        metodoPago: {
          tipo: 'PSE',
          estado: 'aprobado',
          transaccionId: `TXN_${Date.now()}_001`,
          fechaPago: new Date()
        },
        historialEstados: [{
          estado: 'pendiente',
          fecha: new Date(),
          comentario: 'Pedido creado'
        }]
      });

      await pedido1.save();
      console.log('   ✅ Pedido 1 creado:', pedido1.numeroOrden, '(pendiente)');

      // Pedido 2: Procesando
      const pedido2 = new Order({
        numeroOrden: `SPG-${Date.now()}-002`,
        cliente: cliente._id,
        productos: [{
          producto: producto2._id,
          comerciante: producto2.comerciante._id,
          nombre: producto2.nombre,
          precio: producto2.precio,
          cantidad: 2,
          subtotal: producto2.precio * 2,
          imagen: producto2.imagenes?.[0] || ''
        }],
        subtotal: producto2.precio * 2,
        impuestos: Math.round(producto2.precio * 2 * 0.19),
        costoEnvio: 0, // Envío gratis
        descuentos: 0,
        total: (producto2.precio * 2) + Math.round(producto2.precio * 2 * 0.19),
        estado: 'procesando',
        direccionEntrega: {
          nombre: cliente.nombre,
          telefono: cliente.telefono || '3001234567',
          calle: 'Carrera 7 #80-45',
          ciudad: 'Bogotá',
          departamento: 'Cundinamarca',
          codigoPostal: '110221',
          pais: 'Colombia',
          instrucciones: 'Apartamento 504'
        },
        metodoPago: {
          tipo: 'PSE',
          estado: 'aprobado',
          transaccionId: `TXN_${Date.now()}_002`,
          fechaPago: new Date()
        },
        historialEstados: [
          {
            estado: 'pendiente',
            fecha: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 días atrás
            comentario: 'Pedido creado'
          },
          {
            estado: 'confirmado',
            fecha: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 día atrás
            comentario: 'Pedido confirmado por el comerciante'
          },
          {
            estado: 'procesando',
            fecha: new Date(),
            comentario: 'Preparando el paquete'
          }
        ]
      });

      await pedido2.save();
      console.log('   ✅ Pedido 2 creado:', pedido2.numeroOrden, '(procesando)');

      // Pedido 3: Enviado
      const pedido3 = new Order({
        numeroOrden: `SPG-${Date.now()}-003`,
        cliente: cliente._id,
        productos: [{
          producto: producto1._id,
          comerciante: producto1.comerciante._id,
          nombre: producto1.nombre,
          precio: producto1.precio,
          cantidad: 1,
          subtotal: producto1.precio,
          imagen: producto1.imagenes?.[0] || ''
        }],
        subtotal: producto1.precio,
        impuestos: Math.round(producto1.precio * 0.19),
        costoEnvio: 15000,
        descuentos: 5000,
        total: producto1.precio + Math.round(producto1.precio * 0.19) + 15000 - 5000,
        estado: 'enviado',
        direccionEntrega: {
          nombre: cliente.nombre,
          telefono: cliente.telefono || '3001234567',
          calle: 'Avenida 68 #15-30',
          ciudad: 'Bogotá',
          departamento: 'Cundinamarca',
          codigoPostal: '110431',
          pais: 'Colombia'
        },
        metodoPago: {
          tipo: 'PSE',
          estado: 'aprobado',
          transaccionId: `TXN_${Date.now()}_003`,
          fechaPago: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
        },
        seguimiento: {
          numeroSeguimiento: 'SRV123456789',
          transportadora: 'servientrega',
          fechaEnvio: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 horas atrás
          estadoActual: 'En tránsito'
        },
        historialEstados: [
          {
            estado: 'pendiente',
            fecha: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
            comentario: 'Pedido creado'
          },
          {
            estado: 'confirmado',
            fecha: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
            comentario: 'Pedido confirmado'
          },
          {
            estado: 'procesando',
            fecha: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
            comentario: 'Preparando el paquete'
          },
          {
            estado: 'enviado',
            fecha: new Date(Date.now() - 6 * 60 * 60 * 1000),
            comentario: 'Paquete enviado con Servientrega'
          }
        ]
      });

      await pedido3.save();
      console.log('   ✅ Pedido 3 creado:', pedido3.numeroOrden, '(enviado)');
    }

    // 5. Verificación final
    console.log('\n5️⃣ Verificación final...');
    const pedidosFinales = await Order.find({})
      .populate('cliente', 'nombre email')
      .populate('productos.comerciante', 'nombre')
      .sort({ fechaCreacion: -1 });

    console.log(`   🎉 Total pedidos: ${pedidosFinales.length}`);
    console.log('\n   📋 Resumen de pedidos:');
    
    pedidosFinales.forEach(pedido => {
      console.log(`     📦 ${pedido.numeroOrden}`);
      console.log(`        👤 Cliente: ${pedido.cliente?.nombre || 'Sin cliente'}`);
      console.log(`        🏪 Comerciante: ${pedido.productos[0]?.comerciante?.nombre || 'Sin comerciante'}`);
      console.log(`        📊 Estado: ${pedido.estado}`);
      console.log(`        💰 Total: $${pedido.total.toLocaleString()}`);
      console.log('');
    });

    console.log('✅ Sistema de pedidos configurado correctamente!');
    console.log('\n📝 Próximos pasos:');
    console.log('   1. Reinicia el servidor backend');
    console.log('   2. Verifica el frontend para ver los pedidos');
    console.log('   3. Prueba las funciones de comerciante y cliente');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    mongoose.disconnect();
  }
}

// Ejecutar la configuración
configurarPedidos(); 