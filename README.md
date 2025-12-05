# 🏔️ SurAndino - Plataforma de Comercio Electrónico

**Marketplace moderno y seguro que conecta compradores y vendedores del sur de Colombia**

Sistema de comercio electrónico multiperfil con arquitectura MERN (MongoDB, Express, React, Node.js), diseñado para facilitar transacciones seguras entre clientes y comerciantes locales.

---

## ✨ Características Principales

### 🛒 Para Clientes
- ✅ Registro y autenticación con verificación de email (códigos de 6 dígitos)
- 🔍 Búsqueda y filtrado avanzado de productos
- 🛍️ Carrito de compras dinámico con gestión en tiempo real
- 💳 Pagos seguros con Wompi (PSE, Nequi, tarjetas)
- 📦 Seguimiento de pedidos en tiempo real
- ⭐ Sistema de reseñas y calificaciones
- 🔔 Centro de notificaciones integrado
- 📍 Gestión de múltiples direcciones de envío
- 👤 Perfil personalizable con foto de perfil

### 🏪 Para Comerciantes
- 📊 Dashboard analítico con métricas de ventas
- 📦 Gestión completa de productos e inventario
- 🖼️ Carga de imágenes de productos (hasta 5 por producto)
- 📈 Estadísticas de ventas y reportes
- 🎨 Banner personalizable para perfil de tienda
- 💰 Gestión de pedidos y estados de entrega
- 👥 Vista detallada de clientes
- 🔔 Notificaciones de nuevos pedidos

### 🔐 Para Administradores
- 👥 Gestión completa de usuarios (clientes y comerciantes)
- 🏷️ Administración de categorías de productos
- 📊 Acceso a analytics globales de la plataforma
- 🛡️ Sistema de moderación de contenido
- 📈 Reportes y estadísticas generales

---

## 📁 Estructura del Proyecto

```
SurAndino/
├── backend/                    # 🔧 API REST - Node.js + Express
│   ├── config/                # Configuración (DB, Passport OAuth)
│   ├── controllers/           # Lógica de negocio (Auth, Cart, Orders, etc.)
│   ├── middlewares/           # Auth, Upload, Validación, Error handling
│   ├── models/               # Esquemas MongoDB (User, Product, Order, etc.)
│   ├── routes/               # Rutas de API organizadas por recurso
│   ├── services/             # Servicios externos (Wompi, Cloudinary, Email)
│   ├── utils/                # Utilidades (Email, Responses, Validators)
│   ├── server.js             # Punto de entrada del servidor
│   ├── .env.example          # Variables de entorno de ejemplo
│   └── package.json          # Dependencias del backend
│
├── frontend/                  # ⚛️ SPA - React 19 + TypeScript
│   ├── public/               # Assets estáticos
│   └── src/
│       ├── components/       # Componentes reutilizables
│       ├── contexts/         # Context API (Theme, etc.)
│       ├── hooks/            # Custom hooks
│       ├── pages/            # Páginas principales
│       │   ├── admin/       # Dashboard administrativo
│       │   ├── auth/        # Login, Register, Verify
│       │   ├── checkout/    # Proceso de compra
│       │   ├── merchant/    # Panel de comerciante
│       │   └── profile/     # Perfil de usuario
│       ├── routes/          # Configuración de rutas
│       ├── services/        # API clients y servicios
│       ├── stores/          # Estado global (Zustand)
│       ├── types/           # TypeScript interfaces
│       └── utils/           # Funciones auxiliares
│
└── README.md                 # Este archivo
```

---

## 🚀 Instalación y Configuración

### Prerequisitos
- **Node.js** 16+ y npm/yarn
- **MongoDB** 5.0+ (local o Atlas)
- Cuenta en **Wompi** (Sandbox para desarrollo)
- Cuenta en **Cloudinary** (opcional, para imágenes)
- Cuenta de **Gmail** con App Password (para emails)

### 1. Clonar el Repositorio
```bash
git clone https://github.com/ChrispinSantacruz/ComercializadoraSPG.git
cd ComercializadoraSPG
```

### 2. Configurar Backend

```bash
cd backend
npm install
```

Crear archivo `.env` con las siguientes variables:

```env
# Base de datos
MONGODB_URI=mongodb://localhost:27017/comercializadora_spg

# JWT
JWT_SECRET=tu_secret_key_muy_segura_aqui
JWT_EXPIRE=7d

# URLs
FRONTEND_URL=http://localhost:3000
PORT=5001

# Wompi (Sandbox)
WOMPI_PUBLIC_KEY=pub_test_tu_clave_publica
WOMPI_PRIVATE_KEY=prv_test_tu_clave_privada
WOMPI_EVENTS_SECRET=tu_events_secret
WOMPI_INTEGRITY_SECRET=tu_integrity_secret
WOMPI_API_URL=https://sandbox.wompi.co/v1

# Email (Gmail)
EMAIL_USER=tuempresa@gmail.com
EMAIL_PASS=tu_app_password_gmail

# Cloudinary (Opcional)
CLOUDINARY_CLOUD_NAME=tu_cloud_name
CLOUDINARY_API_KEY=tu_api_key
CLOUDINARY_API_SECRET=tu_api_secret

# OAuth (Opcional)
GOOGLE_CLIENT_ID=tu_google_client_id
GOOGLE_CLIENT_SECRET=tu_google_client_secret
FACEBOOK_APP_ID=tu_facebook_app_id
FACEBOOK_APP_SECRET=tu_facebook_app_secret
```

Iniciar servidor:
```bash
npm run dev    # Modo desarrollo con nodemon
# o
npm start      # Modo producción
```

El backend estará disponible en `http://localhost:5001`

### 3. Configurar Frontend

```bash
cd frontend
npm install
```

Crear archivo `.env` (opcional):
```env
REACT_APP_API_URL=http://localhost:5001/api
```

Iniciar aplicación:
```bash
npm start      # Modo desarrollo
# o
npm run build  # Build de producción
```

El frontend estará disponible en `http://localhost:3000`

---

## 🛠️ Stack Tecnológico

### Backend
| Tecnología | Versión | Uso |
|-----------|---------|-----|
| **Node.js** | 16+ | Runtime JavaScript |
| **Express.js** | 4.18+ | Framework web |
| **MongoDB** | 5.0+ | Base de datos NoSQL |
| **Mongoose** | 7.0+ | ODM para MongoDB |
| **JWT** | 9.0+ | Autenticación |
| **Bcrypt** | 5.1+ | Hash de contraseñas |
| **Multer** | 1.4+ | Upload de archivos |
| **Nodemailer** | 6.10+ | Envío de emails |
| **Axios** | 1.6+ | Cliente HTTP |
| **Express Validator** | 7.0+ | Validación de datos |

### Frontend
| Tecnología | Versión | Uso |
|-----------|---------|-----|
| **React** | 19.1+ | Librería UI |
| **TypeScript** | 4.9+ | Tipado estático |
| **React Router** | 7.6+ | Enrutamiento SPA |
| **Zustand** | 5.0+ | Estado global |
| **Axios** | 1.10+ | Cliente HTTP |
| **TailwindCSS** | 3.4+ | Estilos CSS |
| **React Hook Form** | 7.59+ | Gestión de formularios |
| **React Hot Toast** | 2.5+ | Notificaciones |
| **Framer Motion** | 12.19+ | Animaciones |
| **Heroicons** | 2.2+ | Iconos SVG |

### Servicios Externos
- **Wompi** - Pasarela de pagos (PSE, Nequi, tarjetas)
- **Cloudinary** - Almacenamiento de imágenes (opcional)
- **Gmail SMTP** - Envío de emails de verificación

---

## 📚 Documentación API

### Autenticación
```
POST   /api/auth/register              - Registro de usuario
POST   /api/auth/login                 - Inicio de sesión
POST   /api/auth/logout                - Cerrar sesión
POST   /api/auth/verificar-codigo      - Verificar email con código
POST   /api/auth/reenviar-codigo       - Reenviar código de verificación
```

### Usuarios
```
GET    /api/users/profile              - Obtener perfil
PUT    /api/users/profile              - Actualizar perfil
POST   /api/users/avatar               - Subir avatar
POST   /api/users/banner               - Subir banner (comerciantes)
PUT    /api/users/password             - Cambiar contraseña
```

### Productos
```
GET    /api/products                   - Listar productos
GET    /api/products/:id               - Obtener producto
POST   /api/products                   - Crear producto (comerciante)
PUT    /api/products/:id               - Actualizar producto
DELETE /api/products/:id               - Eliminar producto
GET    /api/products/merchant/:id      - Productos por comerciante
```

### Carrito
```
GET    /api/cart                       - Obtener carrito
POST   /api/cart                       - Agregar al carrito
PUT    /api/cart/:productId            - Actualizar cantidad
DELETE /api/cart/:productId            - Eliminar del carrito
DELETE /api/cart                       - Vaciar carrito
```

### Pedidos
```
GET    /api/orders                     - Listar pedidos
GET    /api/orders/:id                 - Obtener pedido
POST   /api/orders                     - Crear pedido
PUT    /api/orders/:id/status          - Actualizar estado
GET    /api/orders/merchant/all        - Pedidos del comerciante
```

### Pagos (Wompi)
```
POST   /api/wompi/payment-link         - Crear enlace de pago
POST   /api/wompi/webhook              - Webhook de Wompi
GET    /api/wompi/transaction/:id      - Estado de transacción
```

---

## 🔒 Sistema de Autenticación

### Registro y Verificación
1. Usuario se registra con email, nombre y contraseña
2. Sistema genera código de 6 dígitos (válido 15 minutos)
3. Email enviado con código de verificación
4. Usuario ingresa código en página de verificación
5. Cuenta activada al verificar correctamente

### Roles y Permisos
- **Cliente**: Comprar productos, gestionar pedidos
- **Comerciante**: Vender productos, gestionar inventario
- **Admin**: Control total de la plataforma

---

## 💳 Integración de Pagos (Wompi)

### Métodos Soportados
- 🏦 **PSE** - Débito bancario directo
- 📱 **Nequi** - Billetera digital
- 💰 **Daviplata** - Billetera digital
- 💳 **Tarjetas** - Visa, Mastercard, AmEx, Diners
- 🏪 **Efecty** - Pagos en efectivo

### Datos de Prueba (Sandbox)
```
Tarjeta de prueba:
  Número: 4242 4242 4242 4242
  CVC: 123
  Fecha: 12/25 o posterior

Nequi/PSE: Usar cualquier dato ficticio
```

---

## 📧 Configuración de Email

### Gmail App Password
1. Ir a [Google Account Security](https://myaccount.google.com/security)
2. Activar verificación en 2 pasos
3. Ir a "App Passwords"
4. Generar contraseña para "Mail"
5. Usar la contraseña generada en `EMAIL_PASS`

Ver documentación completa en `backend/CONFIGURACION_EMAIL.md`

---

## 🌐 Deployment

### Backend (Railway, Render, DigitalOcean)
1. Configurar variables de entorno
2. Configurar MongoDB Atlas para producción
3. Actualizar `FRONTEND_URL` con dominio de producción
4. Deploy con `npm start`

### Frontend (Vercel, Netlify)
1. Build: `npm run build`
2. Configurar `REACT_APP_API_URL` con URL del backend
3. Deploy carpeta `build/`

---

## 🐛 Solución de Problemas

### Backend no conecta a MongoDB
```bash
# Verificar que MongoDB esté corriendo
mongosh

# Verificar URI en .env
MONGODB_URI=mongodb://localhost:27017/comercializadora_spg
```

### Error de CORS
```javascript
// Verificar FRONTEND_URL en .env del backend
FRONTEND_URL=http://localhost:3000
```

### Emails no se envían
```bash
# Probar configuración
cd backend
npm run test-email

# Verificar App Password de Gmail
```

### Errores de Wompi en Sandbox
- Los errores 422 son normales en sandbox
- Usar PSE o Nequi para mejores resultados
- Verificar claves públicas/privadas en .env

---

## 👥 Contribuir

1. Fork el proyecto
2. Crear rama feature (`git checkout -b feature/NuevaCaracteristica`)
3. Commit cambios (`git commit -m 'Agregar NuevaCaracteristica'`)
4. Push a la rama (`git push origin feature/NuevaCaracteristica`)
5. Abrir Pull Request

---

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver archivo [LICENSE](LICENSE) para detalles

---

## 👨‍💻 Autor

**Chrispin Santacruz**
- GitHub: [@ChrispinSantacruz](https://github.com/ChrispinSantacruz)
- Email: chrissantacruz0603@gmail.com

---

## 🙏 Agradecimientos

- Wompi por su excelente API de pagos
- Cloudinary por el hosting de imágenes
- Comunidad de React y Node.js por su apoyo

---

**⚠️ Nota**: Este proyecto está en modo desarrollo. Para uso en producción, asegúrate de:
- Configurar todas las variables de entorno correctamente
- Usar claves seguras para JWT
- Habilitar HTTPS
- Configurar rate limiting
- Implementar logs apropiados
- Realizar auditorías de seguridad

---

**🏔️ SurAndino** - Conectando el comercio del sur de Colombia 🇨🇴 