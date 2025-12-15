# 📧 Configuración de Email con Nodemailer - AndinoExpress

## 🚀 Inicio Rápido

### Paso 1: Configurar Gmail (Recomendado)

#### Opción A: Usar App Password (Más Seguro) ⭐

1. **Habilita la verificación en 2 pasos**
   - Ve a: https://myaccount.google.com/security
   - Busca "Verificación en 2 pasos"
   - Actívala si no la tienes

2. **Genera una App Password**
   - Ve a: https://myaccount.google.com/apppasswords
   - Selecciona "Correo" y "Otro (nombre personalizado)"
   - Escribe "AndinoExpress" o "Nodemailer"
   - Copia la contraseña de 16 caracteres generada

3. **Configura tu .env**
   ```env
   EMAIL_USER=tu_email@gmail.com
   EMAIL_PASS=xxxx xxxx xxxx xxxx  # La App Password generada
   ```

#### Opción B: Acceso de aplicaciones menos seguras (No recomendado)

1. Ve a: https://myaccount.google.com/lesssecureapps
2. Activa "Permitir aplicaciones menos seguras"
3. Usa tu contraseña normal de Gmail

### Paso 2: Probar la Configuración

```bash
npm run test-email
```

Este comando enviará un email de prueba a tu dirección configurada.

---

## 🔧 Configuración para Otros Proveedores

### Outlook/Hotmail

```env
EMAIL_USER=tu_email@outlook.com
EMAIL_PASS=tu_contraseña_de_outlook
```

**Nota:** Outlook/Hotmail suelen funcionar con tu contraseña normal, pero si tienes 2FA habilitado, necesitarás una app password.

### Yahoo Mail

```env
EMAIL_USER=tu_email@yahoo.com
EMAIL_PASS=tu_contraseña_de_aplicacion
```

**Nota:** Yahoo requiere app passwords si tienes 2FA habilitado.

### SMTP Personalizado

```env
EMAIL_HOST=smtp.tudominio.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=tu_email@tudominio.com
EMAIL_PASS=tu_contraseña
```

---

## 🧪 Probar la Configuración

### Método 1: Script de Prueba

```bash
cd backend
npm run test-email
```

### Método 2: Desde Node

```javascript
const { probarConfiguracionEmail } = require('./utils/email');

probarConfiguracionEmail()
  .then(resultado => {
    console.log('Prueba completada:', resultado);
  });
```

### Método 3: Registrar un Usuario

1. Inicia el servidor: `npm start`
2. Registra un nuevo usuario en el frontend
3. Revisa la consola del backend para ver el código
4. Si el email está configurado, recibirás el código por correo

---

## ✅ Verificación del Código

### Cómo Funciona

1. **Usuario se registra** → Sistema genera código de 6 dígitos
2. **Email enviado** → Usuario recibe el código (válido 15 minutos)
3. **Usuario verifica** → Ingresa el código en `/verificar-email`
4. **Cuenta activada** → Usuario puede iniciar sesión

### Ejemplo de Email Recibido

```
🎉 ¡Bienvenido a SurAndino!

Hola [Nombre],

Para completar tu registro, ingresa este código:

    123456

Este código es válido por 15 minutos.
```

---

## 🐛 Solución de Problemas

### Error: "Invalid login"

**Causa:** Credenciales incorrectas

**Solución:**
- Verifica que EMAIL_USER sea correcto
- Para Gmail, usa App Password (no contraseña normal)
- Verifica que no haya espacios extra en las variables

### Error: "ECONNREFUSED" o "ETIMEDOUT"

**Causa:** No se puede conectar al servidor SMTP

**Solución:**
- Verifica tu conexión a internet
- Revisa que el puerto sea correcto (587 para TLS, 465 para SSL)
- Verifica que tu firewall no bloquee la conexión
- Algunos ISPs bloquean el puerto 25

### Error: "self signed certificate"

**Causa:** Problemas con certificados SSL

**Solución:**
En desarrollo, el sistema ignora certificados auto-firmados automáticamente.

### No Recibo Emails

**Posibles causas:**
1. **Revisa spam/correo no deseado**
2. **Verifica que EMAIL_USER esté configurado correctamente**
3. **Revisa los logs del servidor** - mostrarán si el email se envió
4. **Verifica límites de Gmail** - Gmail tiene límites de envío diario

---

## 🔒 Seguridad

### Mejores Prácticas

1. ✅ **Usa App Passwords** en lugar de contraseñas reales
2. ✅ **Nunca commits .env** al repositorio
3. ✅ **Usa variables de entorno** en producción
4. ✅ **Habilita 2FA** en tu cuenta de email
5. ✅ **Limita intentos de verificación** (ya implementado: 15 min expiry)

### En Producción

```env
# Usa servicios profesionales como:
# - SendGrid (https://sendgrid.com)
# - AWS SES (https://aws.amazon.com/ses)
# - Mailgun (https://mailgun.com)
# - Postmark (https://postmarkapp.com)
```

---

## 📊 Monitoreo

### Logs del Sistema

El sistema logea automáticamente:
- ✅ Conexiones SMTP exitosas
- ❌ Errores de envío
- 📧 Emails enviados (con Message ID)
- 🔑 Códigos de verificación (solo en desarrollo)

### Ejemplo de Logs

```
🔄 Verificando conexión SMTP...
✅ Conexión SMTP verificada
📨 Enviando email...
✅ Email enviado exitosamente: <message-id@gmail.com>
```

---

## 🎯 Funcionalidades Implementadas

- [x] Envío de código de verificación por email
- [x] Código de 6 dígitos aleatorio
- [x] Expiración de 15 minutos
- [x] Reenvío de código
- [x] Soporte multi-proveedor (Gmail, Outlook, Yahoo)
- [x] Plantillas HTML profesionales
- [x] Logs detallados
- [x] Modo desarrollo (sin email configurado)
- [x] Script de prueba de configuración
- [x] Detección automática de proveedor

---

## 📞 Soporte

Si tienes problemas con la configuración:

1. Ejecuta `npm run test-email` y copia el error
2. Revisa la sección de "Solución de Problemas"
3. Verifica que tu .env tenga el formato correcto
4. Asegúrate de que no haya espacios o caracteres extra

---

## 🔄 Actualización del Sistema

Para actualizar nodemailer a la última versión:

```bash
npm install nodemailer@latest
```

Versión actual: `nodemailer@6.9.7`

---

## 📚 Recursos Adicionales

- [Nodemailer Docs](https://nodemailer.com/)
- [Gmail App Passwords](https://support.google.com/accounts/answer/185833)
- [Outlook App Passwords](https://support.microsoft.com/en-us/account-billing/using-app-passwords-with-apps-that-don-t-support-two-step-verification-5896ed9b-4263-e681-128a-a6f2979a7944)
