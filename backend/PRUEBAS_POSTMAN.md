# 🧪 Guía de Pruebas con Postman - Comercializadora SPG

## 🚀 Estado del Servidor
✅ **Servidor funcionando en:** `http://localhost:5000`
✅ **MongoDB conectado:** Base de datos local
✅ **Colección de Postman:** `postman_collection.json`

## 📋 Cómo Importar la Colección

1. **Abrir Postman**
2. **Importar colección:**
   - Clic en "Import"
   - Seleccionar el archivo `postman_collection.json`
   - Confirmar importación

## 🔧 Endpoints Principales para Probar

### 1. 🏠 Verificar Servidor
```
GET http://localhost:5000
```
**Respuesta esperada:**
```json
{
  "message": "🚀 Bienvenido a Comercializadora SPG API",
  "version": "1.0.0",
  "status": "Activo",
  "endpoints": {
    "auth": "/api/auth",
    "users": "/api/users",
    "products": "/api/products",
    "orders": "/api/orders",
    "reviews": "/api/reviews",
    "categories": "/api/categories",
    "admin": "/api/admin",
    "commerce": "/api/commerce",
    "payments": "/api/payments"
  }
}
```

### 2. 🔐 Registro de Usuario
```
POST http://localhost:5000/api/auth/register
Content-Type: application/json

{
  "nombre": "Juan Pérez",
  "email": "juan@example.com",
  "password": "123456",
  "telefono": "3001234567",
  "rol": "cliente"
}
```

### 3. 🔑 Iniciar Sesión
```
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "juan@example.com",
  "password": "123456"
}
```
**Importante:** Guarda el token JWT de la respuesta para usar en las siguientes peticiones.

### 4. 👤 Obtener Perfil
```
GET http://localhost:5000/api/auth/me
Authorization: Bearer [TU_TOKEN_JWT]
```

### 5. 🛍️ Crear Producto (Comerciante)
Primero registra/inicia sesión como comerciante:
```json
{
  "nombre": "María Comerciante",
  "email": "maria@comerciante.com",
  "password": "123456",
  "rol": "comerciante"
}
```

Luego crear producto:
```
POST http://localhost:5000/api/products
Authorization: Bearer [TOKEN_COMERCIANTE]
Content-Type: application/json

{
  "nombre": "Smartphone Samsung Galaxy",
  "descripcion": "Smartphone de última generación con cámara de 108MP",
  "precio": 899999,
  "categoria": "electrónicos",
  "stock": 50,
  "especificaciones": {
    "marca": "Samsung",
    "modelo": "Galaxy S23",
    "color": "Negro"
  }
}
```

## 📊 Flujo de Pruebas Recomendado

### Paso 1: Configuración Inicial
1. ✅ Verificar servidor funcionando
2. ✅ Registrar usuario cliente
3. ✅ Registrar usuario comerciante
4. ✅ Registrar usuario administrador

### Paso 2: Autenticación
1. ✅ Login como cliente
2. ✅ Login como comerciante
3. ✅ Login como administrador
4. ✅ Verificar perfiles

### Paso 3: Gestión de Productos
1. ✅ Crear producto como comerciante
2. ✅ Listar productos
3. ✅ Aprobar producto como admin
4. ✅ Ver producto aprobado

### Paso 4: Compras
1. ✅ Agregar productos al carrito
2. ✅ Ver carrito
3. ✅ Crear pedido
4. ✅ Ver historial de pedidos

### Paso 5: Reseñas
1. ✅ Crear reseña de producto comprado
2. ✅ Ver reseñas de producto

## 🎯 Usuarios de Prueba Sugeridos

### Cliente
```json
{
  "nombre": "Ana Cliente",
  "email": "ana@cliente.com",
  "password": "123456",
  "rol": "cliente"
}
```

### Comerciante
```json
{
  "nombre": "Carlos Vendedor",
  "email": "carlos@vendedor.com",
  "password": "123456",
  "rol": "comerciante"
}
```

### Administrador
```json
{
  "nombre": "Admin SPG",
  "email": "admin@spg.com",
  "password": "123456",
  "rol": "administrador"
}
```

## 🔍 Endpoints Implementados

### ✅ Autenticación (`/api/auth`)
- `POST /register` - Registro de usuario
- `POST /login` - Iniciar sesión
- `POST /logout` - Cerrar sesión
- `GET /me` - Perfil del usuario

### 🚧 Productos (`/api/products`)
- `GET /` - Listar productos
- `POST /` - Crear producto
- `GET /:id` - Obtener producto por ID
- `PUT /:id` - Actualizar producto
- `DELETE /:id` - Eliminar producto

### 🚧 Otros Endpoints (Pendientes)
- `/api/orders` - Gestión de pedidos
- `/api/reviews` - Sistema de reseñas
- `/api/categories` - Categorías
- `/api/admin` - Panel administrativo
- `/api/commerce` - Funciones de comerciante
- `/api/payments` - Procesamiento de pagos

## 🐛 Resolución de Problemas

### Error: "Cannot connect to server"
- Verificar que el servidor esté corriendo
- Ejecutar: `node server.js`

### Error: "MongoDB connection failed"
- Verificar que MongoDB esté corriendo
- Ejecutar: `mongod`

### Error: "Invalid token"
- Verificar que el token JWT esté correcto
- Hacer login nuevamente para obtener nuevo token

### Error: "Validation failed"
- Verificar que todos los campos requeridos estén presentes
- Verificar formato de email y otros campos

## 📝 Notas Importantes

1. **JWT Token**: Se configura automáticamente al hacer login con la colección de Postman
2. **Base de Datos**: Los datos se almacenan en MongoDB local
3. **Roles**: Cada rol tiene permisos específicos
4. **Validaciones**: Todos los endpoints tienen validaciones de entrada

## 🎉 ¡Listo para Probar!

El servidor está funcionando correctamente y puedes empezar a hacer pruebas con Postman usando la colección incluida. ¡Disfruta probando la API de Comercializadora SPG! 🚀 