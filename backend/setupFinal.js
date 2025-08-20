const mongoose = require('mongoose');
const User = require('./models/User');
const Product = require('./models/Product');
const Category = require('./models/Category');

const setupFinal = async () => {
  try {
    console.log('🚀 Verificando y completando configuración...\n');

    // Conectar a MongoDB
    const MONGODB_URI = 'mongodb://localhost:27017/comercializadora_spg';
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Conectado a MongoDB\n');

    // === VERIFICAR ESTADO ACTUAL ===
    console.log('📊 Estado actual de la base de datos:');
    
    const totalCategorias = await Category.countDocuments();
    const totalUsuarios = await User.countDocuments();
    const totalProductos = await Product.countDocuments();
    
    console.log(`   📂 Categorías: ${totalCategorias}`);
    console.log(`   👥 Usuarios: ${totalUsuarios}`);
    console.log(`   📦 Productos: ${totalProductos}\n`);

    // === VERIFICAR ADMINISTRADOR ===
    console.log('🔧 Verificando administrador...');
    let admin = await User.findOne({ email: 'chris@chrisadmin.com' });
    
    if (!admin) {
      console.log('   ⚠️  Creando administrador...');
      admin = new User({
        nombre: 'Chris Admin',
        email: 'chris@chrisadmin.com',
        password: 'Pipeman06',
        telefono: '+57 300 123 4567',
        rol: 'administrador',
        estado: 'activo',
        verificado: true
      });
      await admin.save();
      console.log('   ✅ Administrador creado exitosamente');
    } else {
      // Asegurar que tiene rol de administrador
      if (admin.rol !== 'administrador') {
        admin.rol = 'administrador';
        admin.estado = 'activo';
        await admin.save();
        console.log('   ✅ Administrador actualizado');
      } else {
        console.log('   ✅ Administrador ya existe');
      }
    }

    // === VERIFICAR COMERCIANTE ===
    console.log('\n👤 Verificando comerciante de prueba...');
    let comerciante = await User.findOne({ rol: 'comerciante' });
    
    if (!comerciante) {
      console.log('   ⚠️  Creando comerciante de prueba...');
      comerciante = new User({
        nombre: 'Comerciante Prueba',
        email: 'comerciante@prueba.com',
        password: '123456',
        telefono: '+57 300 123 4567',
        rol: 'comerciante',
        estado: 'activo',
        verificado: true
      });
      await comerciante.save();
      console.log('   ✅ Comerciante creado exitosamente');
    } else {
      console.log(`   ✅ Comerciante encontrado: ${comerciante.nombre}`);
    }

    // === VERIFICAR CATEGORÍAS ===
    console.log('\n📂 Verificando categorías...');
    const categoriasExistentes = await Category.find({ estado: 'activa' });
    
    if (categoriasExistentes.length === 0) {
      console.log('   ⚠️  No hay categorías activas, creando una básica...');
      const nuevaCategoria = new Category({
        nombre: 'Productos Generales',
        slug: 'productos-generales',
        descripcion: 'Categoría general para productos',
        estado: 'activa',
        orden: 1
      });
      await nuevaCategoria.save();
      console.log('   ✅ Categoría básica creada');
      categoriasExistentes.push(nuevaCategoria);
    } else {
      console.log(`   ✅ Categorías disponibles: ${categoriasExistentes.length}`);
      categoriasExistentes.forEach((cat, i) => {
        console.log(`      ${i + 1}. ${cat.nombre}`);
      });
    }

    // === CREAR PRODUCTOS DE PRUEBA ===
    console.log('\n📦 Verificando productos...');
    const productosExistentes = await Product.countDocuments();
    
    if (productosExistentes < 3) {
      console.log(`   ⚠️  Solo hay ${productosExistentes} productos, creando productos de prueba...`);
      
      const categoria = categoriasExistentes[0]; // Usar la primera categoría disponible
      
      const productosNuevos = [
        {
          nombre: 'Smartphone Samsung Galaxy A54',
          descripcion: 'Teléfono inteligente con pantalla de 6.4 pulgadas, cámara triple de 50MP y batería de 5000mAh.',
          precio: 850000,
          stock: 15,
          categoria: categoria._id,
          comerciante: comerciante._id,
          estado: 'pendiente',
          imagenes: [],
          especificaciones: [
            { nombre: 'Pantalla', valor: '6.4 pulgadas Super AMOLED' },
            { nombre: 'Memoria', valor: '128GB' },
            { nombre: 'RAM', valor: '6GB' }
          ],
          tags: ['smartphone', 'samsung', 'tecnología']
        },
        {
          nombre: 'Laptop HP Pavilion 15',
          descripcion: 'Laptop con procesador Intel Core i5, 8GB RAM y 512GB SSD.',
          precio: 2450000,
          stock: 8,
          categoria: categoria._id,
          comerciante: comerciante._id,
          estado: 'pendiente',
          imagenes: [],
          especificaciones: [
            { nombre: 'Procesador', valor: 'Intel Core i5' },
            { nombre: 'RAM', valor: '8GB DDR4' },
            { nombre: 'Almacenamiento', valor: '512GB SSD' }
          ],
          tags: ['laptop', 'hp', 'computadora']
        },
        {
          nombre: 'Smart TV LG 55" 4K',
          descripcion: 'Televisor inteligente 4K UHD con WebOS y HDR10.',
          precio: 1850000,
          stock: 5,
          categoria: categoria._id,
          comerciante: comerciante._id,
          estado: 'aprobado', // Este ya estará aprobado para probar
          imagenes: [],
          especificaciones: [
            { nombre: 'Tamaño', valor: '55 pulgadas' },
            { nombre: 'Resolución', valor: '4K UHD' },
            { nombre: 'Smart TV', valor: 'WebOS' }
          ],
          tags: ['tv', 'lg', 'smart-tv']
        }
      ];

      for (const prodData of productosNuevos) {
        const existe = await Product.findOne({ nombre: prodData.nombre });
        if (!existe) {
          const producto = new Product(prodData);
          await producto.save();
          console.log(`      ✅ Creado: ${producto.nombre} (${producto.estado})`);
        } else {
          console.log(`      ⏭️  Ya existe: ${prodData.nombre}`);
        }
      }
    } else {
      console.log(`   ✅ Ya hay ${productosExistentes} productos en la base de datos`);
    }

    // === RESUMEN FINAL ===
    console.log('\n📊 RESUMEN FINAL:');
    
    const resumenFinal = {
      categorias: await Category.countDocuments({ estado: 'activa' }),
      usuarios: await User.countDocuments(),
      comerciantes: await User.countDocuments({ rol: 'comerciante' }),
      administradores: await User.countDocuments({ rol: 'administrador' }),
      productos: await Product.countDocuments()
    };

    console.log(`   📂 Categorías activas: ${resumenFinal.categorias}`);
    console.log(`   👥 Total usuarios: ${resumenFinal.usuarios}`);
    console.log(`   🛍️  Comerciantes: ${resumenFinal.comerciantes}`);
    console.log(`   🔧 Administradores: ${resumenFinal.administradores}`);
    console.log(`   📦 Productos: ${resumenFinal.productos}`);

    // Mostrar productos por estado
    const estadosProductos = await Product.aggregate([
      { $group: { _id: '$estado', count: { $sum: 1 } } }
    ]);

    if (estadosProductos.length > 0) {
      console.log('\n   📈 Productos por estado:');
      estadosProductos.forEach(item => {
        console.log(`      - ${item._id}: ${item.count}`);
      });
    }

    console.log('\n🎉 ¡CONFIGURACIÓN COMPLETADA EXITOSAMENTE!');
    
    console.log('\n📋 CREDENCIALES DE ACCESO:');
    console.log('   🔧 ADMINISTRADOR:');
    console.log(`      📧 Email: ${admin.email}`);
    console.log('      🔑 Password: Pipeman06');
    console.log('   👤 COMERCIANTE:');
    console.log(`      📧 Email: ${comerciante.email}`);
    console.log('      🔑 Password: 123456');
    
    console.log('\n🔗 URLS PARA PROBAR:');
    console.log('   🏠 Frontend: http://localhost:3000');
    console.log('   🔧 Panel Admin: http://localhost:3000/admin/products');
    console.log('   👤 Panel Comerciante: http://localhost:3000/merchant/products');
    console.log('   🛒 Productos Públicos: http://localhost:3000/productos');
    
    console.log('\n⚡ PRÓXIMOS PASOS:');
    console.log('   1. 🚀 Inicia el backend: npm start');
    console.log('   2. 🌐 Inicia el frontend: npm start (en otra terminal)');
    console.log('   3. 👨‍💼 Ingresa como admin para aprobar productos');
    console.log('   4. 🛍️  Verifica que los productos aprobados aparecen públicamente');

  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    
    if (error.message.includes('ECONNREFUSED')) {
      console.log('\n💡 SOLUCIÓN: MongoDB no está corriendo');
      console.log('   Ejecuta: net start MongoDB');
    } else if (error.code === 11000) {
      console.log('\n💡 INFORMACIÓN: Algunos datos ya existen (esto es normal)');
    }
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Conexión cerrada');
  }
};

setupFinal(); 