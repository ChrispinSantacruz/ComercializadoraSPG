# 🚀 Guía de Despliegue en Render

Esta guía te ayudará a desplegar la aplicación SurAndino (backend y frontend) en Render.

## 📋 Prerequisitos

1. Cuenta en [Render](https://render.com) (gratis)
2. Cuenta en [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) (gratis)
3. Repositorio en GitHub con el código

## 🗄️ Paso 1: Configurar MongoDB Atlas

1. Accede a [MongoDB Atlas](https://cloud.mongodb.com)
2. Tu cluster ya está configurado: `cluster0.l0deyep.mongodb.net`
3. Usuario: `christiansantacruzlopez_db_user`
4. Contraseña: `Pipeman06.`
5. String de conexión completo:
   ```
   mongodb+srv://christiansantacruzlopez_db_user:Pipeman06.@cluster0.l0deyep.mongodb.net/andinoexpress_prod?retryWrites=true&w=majority&appName=Cluster0
   ```

### Configurar acceso de red:
1. En MongoDB Atlas, ve a **Network Access**
2. Click en **Add IP Address**
3. Selecciona **Allow Access from Anywhere** (0.0.0.0/0)
4. Guarda los cambios

## 🔧 Paso 2: Desplegar el Backend

### 2.1 Crear Web Service en Render

1. Ve a [Render Dashboard](https://dashboard.render.com)
2. Click en **New +** → **Web Service**
3. Conecta tu repositorio de GitHub
4. Configura el servicio:
   - **Name**: `andinoexpress-backend` (o el que prefieras)
   - **Region**: `Oregon (US West)` o la más cercana
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free

### 2.2 Configurar Variables de Entorno

En la sección **Environment**, agrega estas variables (una por una):

```bash
# Base de datos
MONGODB_URI=mongodb+srv://christiansantacruzlopez_db_user:Pipeman06.@cluster0.l0deyep.mongodb.net/andinoexpress_prod?retryWrites=true&w=majority&appName=Cluster0
NODE_ENV=production

# JWT - IMPORTANTE: Genera uno nuevo
JWT_SECRET=genera_un_secret_seguro_aqui_con_64_caracteres_minimo
JWT_EXPIRE=30d

# Puerto (Render lo asigna automáticamente)
PORT=5001

# Frontend URL (actualizarás esto después)
FRONTEND_URL=https://andinoexpress-frontend.onrender.com

# WOMPI - Credenciales de prueba
WOMPI_PUBLIC_KEY=pub_test_QGjOJpFWM45bFUuCpUTPQMYs2UGwXXZW
WOMPI_PRIVATE_KEY=prv_test_kIcSuSh1EJTQEX6kxXKjM3WvDHYdh4Cl
WOMPI_INTEGRITY_SECRET=test_integrity_lWy8UeH1JfzFdLEIvUPSGgN5rJHBgWbJ
WOMPI_EVENTS_SECRET=test_events_z5K3uA9HyqR8KjmVYLF1zMGT3dCsN8gQ
WOMPI_API_URL=https://sandbox.wompi.co/v1

# Email - Gmail
EMAIL_USER=andinoexpresscomercializadora@gmail.com
EMAIL_PASS=mbin vfxp kmbd jrjj
```

### 2.3 Generar JWT_SECRET seguro

Abre una terminal y ejecuta:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```
Copia el resultado y úsalo como `JWT_SECRET` en Render.

### 2.4 Desplegar

1. Click en **Create Web Service**
2. Render comenzará a construir y desplegar tu backend
3. Espera a que el estado sea **Live** (verde)
4. Copia la URL del backend (ej: `https://andinoexpress-backend.onrender.com`)

## 🎨 Paso 3: Desplegar el Frontend

### 3.1 Crear Static Site en Render

1. En Render Dashboard, click **New +** → **Static Site**
2. Selecciona tu repositorio
3. Configura:
   - **Name**: `andinoexpress-frontend`
   - **Branch**: `main`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `build`

### 3.2 Configurar Variables de Entorno

En la sección **Environment**, agrega:

```bash
# Backend API URL (usa la URL del paso 2.4)
REACT_APP_API_URL=https://andinoexpress-backend.onrender.com

# Wompi Public Key
REACT_APP_WOMPI_PUBLIC_KEY=pub_test_QGjOJpFWM45bFUuCpUTPQMYs2UGwXXZW

# Ambiente
REACT_APP_ENV=production
```

### 3.3 Configurar Rewrites (para React Router)

En **Settings** → **Redirects/Rewrites**, agrega:
- **Source**: `/*`
- **Destination**: `/index.html`
- **Action**: `Rewrite`

### 3.4 Desplegar

1. Click en **Create Static Site**
2. Espera a que el build termine y el estado sea **Live**
3. Copia la URL del frontend (ej: `https://andinoexpress-frontend.onrender.com`)

## 🔄 Paso 4: Actualizar CORS y Frontend URL

### 4.1 Actualizar Backend

Regresa al servicio del **backend** en Render:
1. Ve a **Environment**
2. Actualiza `FRONTEND_URL` con la URL real de tu frontend
3. Guarda los cambios
4. El servicio se redesplegará automáticamente

### 4.2 Verificar CORS en el código

El backend ya tiene configurado CORS dinámico en `server.js`:
```javascript
cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
})
```

## ✅ Paso 5: Verificar el Despliegue

### Prueba el Backend:
```bash
# Healthcheck
curl https://surandino-backend.onrender.com/

# API Status
curl https://andinoexpress-backend.onrender.com/api/health
```

### Prueba el Frontend:
1. Abre tu URL de frontend en el navegador
2. Intenta registrarte como usuario
3. Verifica que llegue el código de verificación al email
4. Inicia sesión y prueba la navegación

## 📊 Paso 6: Crear Usuario Administrador

Necesitas crear el usuario admin en la base de datos de producción:

### Opción 1: Desde una terminal local
```bash
# Conecta a MongoDB Atlas
mongosh "mongodb+srv://christiansantacruzlopez_db_user:Pipeman06.@cluster0.l0deyep.mongodb.net/andinoexpress_prod"

# Ejecuta el script de creación
use andinoexpress_prod
db.users.insertOne({
  nombre: "Christian",
  email: "chris@chrisadmin.com",
  password: "$2a$10$hashedPasswordAqui", // Necesitas hashear la contraseña
  rol: "admin",
  verificado: true,
  fechaRegistro: new Date()
})
```

### Opción 2: Crear endpoint temporal de setup
Agrega este endpoint temporal en `backend/routes/adminRoutes.js`:
```javascript
// SOLO PARA PRIMER DEPLOY - ELIMINAR DESPUÉS
router.post('/setup-admin', async (req, res) => {
  const adminExists = await User.findOne({ rol: 'admin' });
  if (adminExists) {
    return res.status(400).json({ mensaje: 'Admin ya existe' });
  }
  
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash('Pipeman06', salt);
  
  const admin = await User.create({
    nombre: 'Christian',
    email: 'chris@chrisadmin.com',
    password: hashedPassword,
    rol: 'admin',
    verificado: true
  });
  
  res.json({ mensaje: 'Admin creado', admin });
});
```

Llama al endpoint:
```bash
curl -X POST https://andinoexpress-backend.onrender.com/api/admin/setup-admin
```

**IMPORTANTE: Elimina este endpoint después de usarlo.**

## 🔐 Consideraciones de Seguridad

1. **JWT_SECRET**: Usa un secret diferente en producción (no reutilices el de desarrollo)
2. **Variables de Entorno**: Nunca las subas a Git
3. **MongoDB**: Restringe acceso de red solo a Render si es posible
4. **WOMPI**: Cambia a credenciales de producción cuando estés listo
5. **Email**: Verifica que la App Password de Gmail esté activa

## 🐛 Troubleshooting

### Backend no inicia:
- Verifica logs en Render Dashboard → tu servicio → Logs
- Confirma que todas las variables de entorno estén configuradas
- Verifica conexión a MongoDB Atlas (Network Access)

### Frontend no se conecta al backend:
- Verifica que `REACT_APP_API_URL` apunte al backend correcto
- Chequea CORS en el backend
- Abre DevTools (F12) y mira errores de red

### Archivos estáticos no cargan:
- Verifica que `Publish Directory` sea `build`
- Confirma que el build command sea correcto
- Revisa que los rewrites estén configurados

### Base de datos no conecta:
- Verifica IP whitelist en MongoDB Atlas (debe incluir 0.0.0.0/0)
- Confirma que el string de conexión sea correcto
- Chequea usuario y contraseña

## 📝 Mantenimiento

### Actualizar la aplicación:
1. Haz commit y push a tu repositorio de GitHub
2. Render detectará los cambios automáticamente
3. Se redesplegará automáticamente

### Monitorear:
- Render Dashboard muestra métricas de uso
- Revisa logs regularmente
- MongoDB Atlas tiene panel de monitoreo

### Plan Free de Render:
- El backend puede "dormirse" después de 15 minutos de inactividad
- Primera petición después de "despertar" puede tardar 30-60 segundos
- Considera upgradearlo a plan de pago si necesitas uptime constante

## 🎉 ¡Listo!

Tu aplicación AndinoExpress debería estar funcionando en:
- **Backend**: https://andinoexpress-backend.onrender.com
- **Frontend**: https://andinoexpress-frontend.onrender.com

¡Felicitaciones por tu despliegue! 🚀
