# Guía de Migración a Cloudinary

## ⚠️ IMPORTANTE: Estado Actual

Los productos existentes en la base de datos tienen rutas locales (`/uploads/productos/...`) que **YA NO FUNCIONAN** en Render.com porque el filesystem es efímero.

### Solución Temporal Implementada

Se agregó transformación automática en los modelos `Product` y `User` que convierte las rutas locales en imágenes placeholder:
- Productos sin imagen: `https://via.placeholder.com/400x400`
- Banners sin imagen: `https://via.placeholder.com/800x200`

### ✅ Solución Permanente

## Paso 1: Configurar Variables de Entorno en Render.com

**CRÍTICO**: Debes agregar estas variables en el dashboard de Render:

```
CLOUDINARY_CLOUD_NAME=dwaz521pv
CLOUDINARY_API_KEY=794842635846256
CLOUDINARY_API_SECRET=_JKKP9Kl4epJBqfF5bUISRHtY0o
```

### Cómo agregar las variables:
1. Ve a https://dashboard.render.com
2. Selecciona tu servicio backend
3. Click en "Environment" en el menú lateral
4. Click en "Add Environment Variable"
5. Agrega cada variable con su valor
6. Click en "Save Changes"
7. El servicio se reiniciará automáticamente

## Paso 2: Nuevos Productos

Una vez configuradas las variables de Cloudinary:
- ✅ Todos los productos nuevos se subirán automáticamente a Cloudinary
- ✅ Las imágenes persistirán permanentemente
- ✅ Se servirán desde el CDN de Cloudinary (más rápido)

## Paso 3: Migrar Productos Existentes (Opcional)

Si tienes productos antiguos con imágenes en el filesystem local, deberás:

### Opción A: Re-subir las imágenes manualmente
1. Editar cada producto desde el panel de comerciante
2. Volver a subir las imágenes
3. Guardar el producto

### Opción B: Script de migración (Avanzado)
Crear un script que:
1. Descargue las imágenes del backup local
2. Las suba a Cloudinary usando el SDK
3. Actualice los documentos en MongoDB con las nuevas URLs

## Estado del Sistema

### ✅ Funcionando:
- Backend desplegado en Render.com
- MongoDB Atlas conectado
- SendGrid configurado para emails
- Wompi configurado para pagos
- Firebase OAuth para login social
- Transformación de imágenes locales a placeholders

### ⚠️ Pendiente:
- **Agregar variables de Cloudinary en Render.com**
- Re-subir imágenes de productos existentes

### 🔧 Próximos Pasos:
1. Configurar variables de Cloudinary en Render
2. Verificar que nuevos productos se suban correctamente
3. (Opcional) Migrar productos antiguos re-subiendo imágenes

## Verificación

Para verificar que Cloudinary está funcionando:
1. Crear un nuevo producto desde el panel de comerciante
2. Subir imágenes
3. Verificar que las URLs en la respuesta del servidor sean de Cloudinary:
   - ❌ Incorrecto: `/uploads/productos/...`
   - ✅ Correcto: `https://res.cloudinary.com/dwaz521pv/...`

## Notas Técnicas

- El middleware `upload.js` detecta automáticamente si Cloudinary está configurado
- Si no hay variables de entorno de Cloudinary, usa almacenamiento local (solo para desarrollo)
- En producción (Render.com) SIEMPRE debes usar Cloudinary
