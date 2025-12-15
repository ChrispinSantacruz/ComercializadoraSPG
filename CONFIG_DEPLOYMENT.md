# 🌐 Archivos de Configuración de Producción

Este directorio contiene archivos de configuración para desplegar la aplicación en diferentes entornos.

## ⚠️ IMPORTANTE - SEGURIDAD

**NUNCA subas archivos `.env` o `.env.production` a Git.**

Estos archivos contienen información sensible como:
- Contraseñas de bases de datos
- Secrets JWT
- API Keys
- Credenciales de email

## 📁 Archivos en este directorio

### Backend
- `backend/.env.example` - Plantilla con todas las variables necesarias
- `backend/.env.production` - **NO SUBIR A GIT** - Configuración de producción
- `backend/generate-jwt-secret.bat` - Script para generar JWT_SECRET seguro (Windows)
- `backend/generate-jwt-secret.sh` - Script para generar JWT_SECRET seguro (Linux/Mac)

### Frontend
- `frontend/.env.example` - Plantilla para frontend
- `frontend/.env.production` - **NO SUBIR A GIT** - Configuración de producción
- `frontend/render.yaml` - Configuración de build para Render

## 🚀 Guía de Despliegue

Consulta `DEPLOY_RENDER.md` en la raíz del proyecto para una guía completa paso a paso.

## 🔐 Generar JWT_SECRET

Antes de desplegar en producción, genera un JWT_SECRET único:

### Windows:
```bash
cd backend
generate-jwt-secret.bat
```

### Linux/Mac:
```bash
cd backend
chmod +x generate-jwt-secret.sh
./generate-jwt-secret.sh
```

### Manualmente:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

## 📝 Checklist de Despliegue

- [ ] Configurar MongoDB Atlas con IP whitelisting
- [ ] Generar nuevo JWT_SECRET para producción
- [ ] Configurar variables de entorno en Render
- [ ] Actualizar FRONTEND_URL en backend
- [ ] Actualizar REACT_APP_API_URL en frontend
- [ ] Verificar credenciales de email
- [ ] Probar conexión a base de datos
- [ ] Crear usuario administrador
- [ ] Verificar flujo completo de registro/login
- [ ] Probar integración con Wompi
- [ ] Verificar envío de emails

## 🛠️ Variables de Entorno Requeridas

### Backend (Mínimo requerido)
```
MONGODB_URI=mongodb+srv://...
JWT_SECRET=tu_secret_seguro_aqui
NODE_ENV=production
PORT=5001
FRONTEND_URL=https://tu-frontend.onrender.com
EMAIL_USER=tu_email@gmail.com
EMAIL_PASS=tu_app_password
WOMPI_PUBLIC_KEY=pub_test_...
WOMPI_PRIVATE_KEY=prv_test_...
WOMPI_INTEGRITY_SECRET=test_integrity_...
WOMPI_EVENTS_SECRET=test_events_...
WOMPI_API_URL=https://sandbox.wompi.co/v1
```

### Frontend (Mínimo requerido)
```
REACT_APP_API_URL=https://tu-backend.onrender.com
REACT_APP_WOMPI_PUBLIC_KEY=pub_test_...
REACT_APP_ENV=production
```

## 📚 Recursos Adicionales

- [Documentación de Render](https://render.com/docs)
- [MongoDB Atlas Docs](https://docs.atlas.mongodb.com/)
- [Wompi Docs](https://docs.wompi.co/)
- [Nodemailer Gmail Setup](https://nodemailer.com/usage/using-gmail/)

---

Para más información, consulta el README principal del proyecto.
