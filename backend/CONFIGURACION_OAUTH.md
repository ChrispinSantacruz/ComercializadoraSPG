# Configuración de Autenticación Social OAuth

## Variables de Entorno Requeridas

Agrega las siguientes variables a tu archivo `.env`:

```env
# Google OAuth
GOOGLE_CLIENT_ID=tu_google_client_id
GOOGLE_CLIENT_SECRET=tu_google_client_secret

# Facebook OAuth
FACEBOOK_APP_ID=tu_facebook_app_id
FACEBOOK_APP_SECRET=tu_facebook_app_secret

# URL del Frontend (necesaria para redirecciones)
FRONTEND_URL=http://localhost:3000
```

## Configuración de Google OAuth

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un nuevo proyecto o selecciona uno existente
3. Habilita la API de Google+ 
4. Ve a "Credenciales" y crea un "ID de cliente OAuth 2.0"
5. Configura los orígenes autorizados:
   - `http://localhost:5000` (desarrollo)
   - Tu dominio de producción
6. Configura las URIs de redirección autorizadas:
   - `http://localhost:5000/api/auth/google/callback` (desarrollo)
   - `https://tudominio.com/api/auth/google/callback` (producción)

## Configuración de Facebook OAuth

1. Ve a [Facebook Developers](https://developers.facebook.com/)
2. Crea una nueva aplicación
3. Agrega el producto "Inicio de sesión con Facebook"
4. En la configuración del producto, agrega las URIs de redirección válidas:
   - `http://localhost:5000/api/auth/facebook/callback` (desarrollo)
   - `https://tudominio.com/api/auth/facebook/callback` (producción)
5. Configura los dominios de la aplicación:
   - `localhost` (desarrollo)
   - `tudominio.com` (producción)

## Instalación de Dependencias

Ejecuta en el directorio `backend/`:

```bash
npm install passport passport-google-oauth20 passport-facebook
```

## Endpoints Disponibles

### Google OAuth
- **Iniciar autenticación**: `GET /api/auth/google`
- **Callback**: `GET /api/auth/google/callback`

### Facebook OAuth
- **Iniciar autenticación**: `GET /api/auth/facebook`
- **Callback**: `GET /api/auth/facebook/callback`

### Común
- **Error de OAuth**: `GET /api/auth/failure`

## Flujo de Autenticación

1. El usuario hace clic en "Iniciar sesión con Google/Facebook" en el frontend
2. Se redirige a `/api/auth/google` o `/api/auth/facebook`
3. El usuario se autentica en la plataforma social
4. La plataforma redirige a nuestro callback con los datos del usuario
5. Se crea o actualiza el usuario en nuestra base de datos
6. Se genera un JWT y se redirige al frontend con el token

## Campos Agregados al Modelo User

```javascript
proveedor: {
  type: String,
  enum: ['local', 'google', 'facebook'],
  default: 'local'
},
proveedorId: {
  type: String,
  sparse: true
},
fotoPerfilSocial: {
  type: String,
  default: null
}
```

## Notas Importantes

- Los usuarios de OAuth no requieren contraseña
- Se marcan automáticamente como verificados
- Se puede vincular una cuenta social a una cuenta existente por email
- Las fotos de perfil social se almacenan en `fotoPerfilSocial` 