// Script de inicialización para MongoDB
// Este script se ejecuta automáticamente cuando se inicia el contenedor de MongoDB

print('🚀 Inicializando base de datos Comercializadora SPG...');

// Cambiar a la base de datos de la aplicación
db = db.getSiblingDB('comercializadora_spg');

// Crear usuario para la aplicación
db.createUser({
  user: 'app_user',
  pwd: 'app_password_123',
  roles: [
    { role: 'readWrite', db: 'comercializadora_spg' },
    { role: 'dbAdmin', db: 'comercializadora_spg' }
  ]
});

print('✅ Usuario de aplicación creado exitosamente');

// Crear colecciones básicas
db.createCollection('users');
db.createCollection('products');
db.createCollection('orders');
db.createCollection('categories');
db.createCollection('reviews');
db.createCollection('notifications');

print('✅ Colecciones básicas creadas');

// Crear índices para mejorar el rendimiento
db.users.createIndex({ "email": 1 }, { unique: true });
db.users.createIndex({ "username": 1 }, { unique: true });
db.products.createIndex({ "name": "text", "description": "text" });
db.products.createIndex({ "category": 1 });
db.orders.createIndex({ "userId": 1 });
db.orders.createIndex({ "status": 1 });
db.orders.createIndex({ "createdAt": -1 });

print('✅ Índices creados para optimizar consultas');

// Insertar categorías por defecto
db.categories.insertMany([
  {
    name: 'Electrónicos',
    description: 'Productos electrónicos y tecnología',
    slug: 'electronicos',
    icon: 'laptop',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: 'Ropa',
    description: 'Vestimenta y accesorios',
    slug: 'ropa',
    icon: 'tshirt',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: 'Hogar',
    description: 'Artículos para el hogar',
    slug: 'hogar',
    icon: 'home',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: 'Deportes',
    description: 'Equipos y ropa deportiva',
    slug: 'deportes',
    icon: 'dumbbell',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  }
]);

print('✅ Categorías por defecto insertadas');

print('🎉 Base de datos inicializada exitosamente!');
print('📊 Base de datos: comercializadora_spg');
print('👤 Usuario app: app_user');
print('🔑 Contraseña: app_password_123');



