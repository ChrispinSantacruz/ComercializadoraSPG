# Configuración de Variables de Entorno en Render

Para que la aplicación funcione correctamente en producción (Render.com), debes configurar las siguientes variables de entorno:

## Variables de Cloudinary (IMPORTANTE - Para imágenes permanentes)

```env
CLOUDINARY_CLOUD_NAME=tu_cloud_name
CLOUDINARY_API_KEY=tu_api_key
CLOUDINARY_API_SECRET=tu_api_secret
```

> ⚠️ **Nota**: Reemplaza estos valores con tus credenciales reales de Cloudinary desde tu dashboard.

## Variables de SendGrid (Para emails)

```env
SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxx.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
SENDGRID_FROM_EMAIL=noreply@tudominio.com
SENDGRID_FROM_NAME=TuNegocio
```

> ⚠️ **Nota**: Reemplaza estos valores con tu API key real de SendGrid y tus datos de remitente.

## Variables de Wompi

```env
WOMPI_PUBLIC_KEY=pub_prod_xxxxxxxxxxxxxxxxxxxxxxxxx
WOMPI_PRIVATE_KEY=prv_prod_xxxxxxxxxxxxxxxxxxxxxxxxx
WOMPI_EVENTS_SECRET=prod_events_xxxxxxxxxxxxxxxxxxxxxxxxx
WOMPI_INTEGRITY_SECRET=prod_integrity_xxxxxxxxxxxxxxxxxxxxxxxxx
WOMPI_API_URL=https://production.wompi.co/v1
WOMPI_EVENTS_URL=https://tudominio.com/api/wompi/webhook
```

> ⚠️ **Nota**: Reemplaza estos valores con tus credenciales reales de Wompi desde tu dashboard de producción.

## Otras Variables Importantes

```env
MONGODB_URI=tu_mongodb_atlas_uri
PORT=5001
JWT_SECRET=tu_secreto_jwt_seguro
FRONTEND_URL=https://andinoexpress.com
NODE_ENV=production
```

## Pasos para configurar en Render:

1. Ve a tu servicio en Render.com
2. Click en "Environment"
3. Agrega cada variable con su valor correspondiente
4. Click en "Save Changes"
5. El servicio se reiniciará automáticamente

## ⚠️ IMPORTANTE: 
- **Cloudinary** es esencial para que las imágenes persistan. Sin esto, las imágenes se borrarán cada vez que el servidor se reinicie.
- **SendGrid** es necesario para enviar emails de confirmación de pedidos.
- Asegúrate de que la **MONGODB_URI** apunte a MongoDB Atlas (no localhost).
