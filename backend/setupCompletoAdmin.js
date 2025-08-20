const mongoose = require('mongoose');
const User = require('./models/User');
const Category = require('./models/Category');

// Configuración de conexión
const MONGODB_URI = 'mongodb://localhost:27017/comercializadora_spg';

// Datos de categorías básicas
const categoriasBasicas = [
  { nombre: 'Tecnología y Electrónicos', slug: 'tecnologia-electronicos', descripcion: 'Productos tecnológicos y electrónicos' },
  { nombre: 'Hogar y Decoración', slug: 'hogar-decoracion', descripcion: 'Artículos para el hogar y decoración' },
  { nombre: 'Ropa y Accesorios', slug: 'ropa-accesorios', descripcion: 'Ropa, calzado y accesorios' },
  { nombre: 'Deportes y Recreación', slug: 'deportes-recreacion', descripcion: 'Productos deportivos y recreativos' },
  { nombre: 'Alimentación y Bebidas', slug: 'alimentacion-bebidas', descripcion: 'Productos alimenticios y bebidas' }
];

const setupCompleto = async () => {
  try {
    console.log('🚀 Iniciando configuración completa...\n');

    // Conectar a MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Conectado a MongoDB\n');

    // === 1. VERIFICAR/CREAR CATEGORÍAS ===
    console.log('📂 1. Verificando categorías...');
    for (const catData of categoriasBasicas) {
      const existe = await Category.findOne({ 
        $or: [
          { slug: catData.slug },
          { nombre: catData.nombre }
        ]
      });
      
      if (!existe) {
        const categoria = new Category({
          ...catData,
          estado: 'activa',
          orden: 1
        });
        await categoria.save();
        console.log(`   ✅ Creada: ${categoria.nombre}`);
      } else {
        console.log(`   ✅ Ya existe: ${existe.nombre}`);
      }
    }

    // === 2. CREAR ADMINISTRADOR ===
    console.log('\n🔧 2. Verificando administrador...');
    const adminData = {
      nombre: 'Administrador Local',
      email: 'admin@local.com',
      password: 'admin123',
      telefono: '+57 300 123 4567',
      rol: 'administrador',
      estado: 'activo',
      verificado: true,
      configuracion: {
        pais: 'Colombia',
        region: 'Bogotá',
        idioma: 'es',
        moneda: 'COP'
      }
    };

    let admin = await User.findOne({ email: adminData.email });
    
    if (!admin) {
      admin = new User(adminData);
      await admin.save();
      console.log('   ✅ Administrador creado');
    } else {
      // Actualizar para asegurar que sea admin
      admin.password = adminData.password;
      admin.rol = 'administrador';
      admin.estado = 'activo';
      admin.verificado = true;
      await admin.save();
      console.log('   ✅ Administrador actualizado');
    }

    // === 3. CREAR COMERCIANTE DE PRUEBA ===
    console.log('\n👤 3. Verificando comerciante de prueba...');
    const comercianteData = {
      nombre: 'Comerciante Prueba',
      email: 'comerciante@test.com',
      password: '123456',
      telefono: '+57 300 123 4567',
      rol: 'comerciante',
      estado: 'activo',
      verificado: true
    };

    let comerciante = await User.findOne({ email: comercianteData.email });
    
    if (!comerciante) {
      comerciante = new User(comercianteData);
      await comerciante.save();
      console.log('   ✅ Comerciante creado');
    } else {
      console.log('   ✅ Comerciante ya existe');
    }

    // === 4. MOSTRAR RESUMEN ===
    console.log('\n📊 RESUMEN DE CONFIGURACIÓN:');
    
    const totalCategorias = await Category.countDocuments();
    const totalUsuarios = await User.countDocuments();
    const admins = await User.find({ rol: 'administrador' });
    const comerciantes = await User.find({ rol: 'comerciante' });
    
    console.log(`   📂 Categorías: ${totalCategorias}`);
    console.log(`   👥 Usuarios totales: ${totalUsuarios}`);
    console.log(`   🔧 Administradores: ${admins.length}`);
    console.log(`   🏪 Comerciantes: ${comerciantes.length}`);

    console.log('\n🎉 ¡CONFIGURACIÓN COMPLETADA EXITOSAMENTE!');
    
    console.log('\n📋 CREDENCIALES DE ACCESO:');
    console.log('   🔧 ADMINISTRADOR:');
    console.log(`      📧 Email: ${adminData.email}`);
    console.log('      🔑 Password: admin123');
    console.log('   👤 COMERCIANTE:');
    console.log(`      📧 Email: ${comercianteData.email}`);
    console.log('      🔑 Password: 123456');
    
    console.log('\n🔗 URLS PARA PROBAR:');
    console.log('   🏠 Frontend: http://localhost:3000');
    console.log('   🔧 Panel Admin: http://localhost:3000/admin');
    console.log('   👤 Panel Comerciante: http://localhost:3000/merchant');
    console.log('   🛒 Productos Públicos: http://localhost:3000/productos');
    
    console.log('\n⚡ PRÓXIMOS PASOS:');
    console.log('   1. 🚀 Inicia el backend: cd backend && npm run dev');
    console.log('   2. 🌐 Inicia el frontend: cd frontend && npm start');
    console.log('   3. 👨‍💼 Ingresa como admin para gestionar productos');
    console.log('   4. 🛍️  Verifica que todo funciona correctamente');

  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    
    if (error.message.includes('ECONNREFUSED')) {
      console.log('\n💡 SOLUCIÓN: MongoDB no está corriendo');
      console.log('   Ejecuta: net start MongoDB');
    } else if (error.code === 11000) {
      console.log('\n💡 INFORMACIÓN: Algunos datos ya existen (esto es normal)');
    }
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Desconectado de MongoDB');
    process.exit(0);
  }
};

// Ejecutar el script
console.log('🚀 Iniciando configuración completa...\n');
setupCompleto(); 