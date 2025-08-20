const mongoose = require('mongoose');
const User = require('./models/User');
const Product = require('./models/Product');
const Category = require('./models/Category');

// Datos de categorías
const categorias = [
  { nombre: 'Tecnología y Electrónicos', slug: 'tecnologia-electronicos' },
  { nombre: 'Hogar y Decoración', slug: 'hogar-decoracion' },
  { nombre: 'Ropa y Accesorios', slug: 'ropa-accesorios' },
  { nombre: 'Deportes y Recreación', slug: 'deportes-recreacion' },
  { nombre: 'Alimentación y Bebidas', slug: 'alimentacion-bebidas' }
];

const setupCompleto = async () => {
  try {
    console.log('🚀 Iniciando configuración completa...\n');

    // Conectar a MongoDB
    const MONGODB_URI = 'mongodb://localhost:27017/comercializadora_spg';
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Conectado a MongoDB\n');

    // 1. VERIFICAR/CREAR CATEGORÍAS
    console.log('📂 1. Verificando categorías...');
    for (const catData of categorias) {
      // Buscar por nombre O slug para evitar duplicados
      const existe = await Category.findOne({ 
        $or: [
          { slug: catData.slug },
          { nombre: catData.nombre }
        ]
      });
      
      if (!existe) {
        try {
          const categoria = new Category({
            ...catData,
            descripcion: `Categoría de ${catData.nombre}`,
            estado: 'activa',
            orden: 1
          });
          await categoria.save();
          console.log(`   ✅ Creada: ${categoria.nombre}`);
        } catch (error) {
          if (error.code === 11000) {
            console.log(`   ⏭️  Ya existe (duplicado): ${catData.nombre}`);
          } else {
            console.log(`   ❌ Error creando ${catData.nombre}:`, error.message);
          }
        }
      } else {
        console.log(`   ✅ Ya existe: ${existe.nombre}`);
      }
    }

    // 2. CREAR ADMINISTRADOR
    console.log('\n🔧 2. Verificando administrador...');
    let admin = await User.findOne({ email: 'chris@chrisadmin.com' });
    if (!admin) {
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
      console.log('   ✅ Administrador creado');
    } else {
      console.log('   ✅ Administrador ya existe');
    }

    // 3. CREAR COMERCIANTE
    console.log('\n👤 3. Verificando comerciante...');
    let comerciante = await User.findOne({ email: 'comerciante@prueba.com' });
    if (!comerciante) {
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
      console.log('   ✅ Comerciante creado');
    } else {
      console.log('   ✅ Comerciante ya existe');
    }

    // 4. CREAR PRODUCTOS DE PRUEBA
    console.log('\n📦 4. Creando productos de prueba...');
    const categoria = await Category.findOne({ estado: 'activa' });
    
    if (!categoria) {
      console.log('   ❌ No hay categorías disponibles');
      return;
    }

    const productos = [
      {
        nombre: 'Smartphone Samsung Galaxy A54',
        descripcion: 'Teléfono inteligente con pantalla de 6.4 pulgadas, cámara triple de 50MP y batería de 5000mAh. Perfecto para uso diario con excelente rendimiento.',
        precio: 850000,
        stock: 15,
        categoria: categoria._id,
        comerciante: comerciante._id,
        estado: 'pendiente',
        imagenes: [],
        especificaciones: [
          { nombre: 'Pantalla', valor: '6.4 pulgadas Super AMOLED' },
          { nombre: 'Memoria', valor: '128GB' },
          { nombre: 'RAM', valor: '6GB' },
          { nombre: 'Cámara', valor: '50MP + 12MP + 5MP' }
        ],
        tags: ['smartphone', 'samsung', 'tecnología', 'celular']
      },
      {
        nombre: 'Laptop HP Pavilion 15',
        descripcion: 'Laptop con procesador Intel Core i5 de 11va generación, 8GB RAM y 512GB SSD. Ideal para trabajo, estudio y entretenimiento.',
        precio: 2450000,
        stock: 8,
        categoria: categoria._id,
        comerciante: comerciante._id,
        estado: 'pendiente',
        imagenes: [],
        especificaciones: [
          { nombre: 'Procesador', valor: 'Intel Core i5-1135G7' },
          { nombre: 'RAM', valor: '8GB DDR4' },
          { nombre: 'Almacenamiento', valor: '512GB SSD' },
          { nombre: 'Pantalla', valor: '15.6" Full HD IPS' }
        ],
        tags: ['laptop', 'hp', 'computadora', 'trabajo']
      },
      {
        nombre: 'Auriculares Sony WH-1000XM4',
        descripcion: 'Auriculares inalámbricos premium con cancelación de ruido líder en la industria. Hasta 30 horas de reproducción.',
        precio: 680000,
        stock: 12,
        categoria: categoria._id,
        comerciante: comerciante._id,
        estado: 'pendiente',
        imagenes: [],
        especificaciones: [
          { nombre: 'Conectividad', valor: 'Bluetooth 5.0' },
          { nombre: 'Batería', valor: '30 horas' },
          { nombre: 'Cancelación de ruido', valor: 'Activa' },
          { nombre: 'Peso', valor: '254g' }
        ],
        tags: ['auriculares', 'sony', 'audio', 'inalámbricos']
      },
      {
        nombre: 'Smart TV LG 55" 4K',
        descripcion: 'Televisor inteligente 4K UHD con WebOS, HDR10 y Dolby Vision. Experiencia cinematográfica en casa.',
        precio: 1850000,
        stock: 5,
        categoria: categoria._id,
        comerciante: comerciante._id,
        estado: 'aprobado', // Este ya estará aprobado
        imagenes: [],
        especificaciones: [
          { nombre: 'Tamaño', valor: '55 pulgadas' },
          { nombre: 'Resolución', valor: '4K UHD (3840x2160)' },
          { nombre: 'Smart TV', valor: 'WebOS 22' },
          { nombre: 'HDR', valor: 'HDR10, Dolby Vision' }
        ],
        tags: ['tv', 'lg', 'smart-tv', '4k']
      },
      {
        nombre: 'Consola PlayStation 5',
        descripcion: 'Consola de videojuegos de nueva generación con gráficos 4K, SSD ultra rápido y control DualSense.',
        precio: 2800000,
        stock: 3,
        categoria: categoria._id,
        comerciante: comerciante._id,
        estado: 'pendiente',
        imagenes: [],
        especificaciones: [
          { nombre: 'CPU', valor: 'AMD Zen 2' },
          { nombre: 'GPU', valor: 'AMD RDNA 2' },
          { nombre: 'Almacenamiento', valor: '825GB SSD' },
          { nombre: 'Resolución', valor: '4K hasta 120fps' }
        ],
        tags: ['consola', 'playstation', 'gaming', 'videojuegos']
      }
    ];

    for (const productoData of productos) {
      const existe = await Product.findOne({ nombre: productoData.nombre });
      if (!existe) {
        const producto = new Product(productoData);
        await producto.save();
        console.log(`   ✅ Creado: ${producto.nombre} (${producto.estado})`);
      } else {
        console.log(`   ⏭️  Ya existe: ${productoData.nombre}`);
      }
    }

    // 5. MOSTRAR RESUMEN
    console.log('\n📊 5. Resumen final:');
    const totalCategorias = await Category.countDocuments();
    const totalProductos = await Product.countDocuments();
    const totalUsuarios = await User.countDocuments();
    
    console.log(`   📂 Categorías: ${totalCategorias}`);
    console.log(`   📦 Productos: ${totalProductos}`);
    console.log(`   👥 Usuarios: ${totalUsuarios}`);

    const productosPorEstado = await Product.aggregate([
      { $group: { _id: '$estado', count: { $sum: 1 } } }
    ]);
    
    console.log('\n   📈 Productos por estado:');
    productosPorEstado.forEach(item => {
      console.log(`      - ${item._id}: ${item.count}`);
    });

    console.log('\n🎉 ¡CONFIGURACIÓN COMPLETA EXITOSA!');
    console.log('\n📋 Credenciales de acceso:');
    console.log('   🔧 Administrador:');
    console.log('      Email: chris@chrisadmin.com');
    console.log('      Password: Pipeman06');
    console.log('   👤 Comerciante:');
    console.log('      Email: comerciante@prueba.com');
    console.log('      Password: 123456');
    
    console.log('\n🔗 URLs importantes:');
    console.log('   🏠 Frontend: http://localhost:3000');
    console.log('   🔧 Admin Panel: http://localhost:3000/admin');
    console.log('   👤 Merchant Panel: http://localhost:3000/merchant');
    console.log('   🛒 Productos: http://localhost:3000/productos');
    
    console.log('\n⚡ Próximos pasos:');
    console.log('   1. Inicia el backend: npm start');
    console.log('   2. Inicia el frontend: npm start (en otra terminal)');
    console.log('   3. Accede al panel de admin para aprobar productos');

  } catch (error) {
    console.error('❌ Error en la configuración:', error.message);
    if (error.message.includes('ECONNREFUSED')) {
      console.log('\n💡 SOLUCIÓN: MongoDB no está corriendo');
      console.log('   Ejecuta en terminal como administrador:');
      console.log('   net start MongoDB');
      console.log('   O instala MongoDB desde: https://www.mongodb.com/try/download/community');
    }
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Conexión a base de datos cerrada');
  }
};

setupCompleto(); 