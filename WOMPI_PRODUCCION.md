# Configuración de Wompi en Producción

## ✅ Credenciales Configuradas

Las siguientes credenciales de **PRODUCCIÓN** han sido configuradas en el sistema:

### Backend (.env)
```env
WOMPI_PUBLIC_KEY=pub_prod_Ka6JKO9GS0szZXDKPWWqfFxfd5Lm1cxK
WOMPI_PRIVATE_KEY=prv_prod_9jY2Oz5NZWrAyJYsQFVIZgBfSLfUC1QA
WOMPI_EVENTS_SECRET=prod_events_5KlxcjvZG8xtBZeQ12twg92DlZVIMSU3
WOMPI_INTEGRITY_SECRET=prod_integrity_WBXrz0Vv1jCAicdsE1iBzRIqtpjc8W0e
WOMPI_API_URL=https://production.wompi.co/v1
```

### Frontend (.env)
```env
REACT_APP_WOMPI_PUBLIC_KEY=pub_prod_Ka6JKO9GS0szZXDKPWWqfFxfd5Lm1cxK
REACT_APP_WOMPI_ENVIRONMENT=production
```

## 🔄 Cambios Realizados

1. **API URL actualizada**: De `sandbox.wompi.co` a `production.wompi.co`
2. **Llaves de prueba reemplazadas**: Todas las llaves `test_*` fueron reemplazadas por `prod_*`
3. **Ambiente configurado**: El frontend ahora usa `REACT_APP_WOMPI_ENVIRONMENT=production`

## ⚠️ IMPORTANTE - Seguridad

### Protección de Credenciales

**NUNCA** subir estos archivos a un repositorio público:
- ✅ `.env` ya está en `.gitignore`
- ✅ Las credenciales están protegidas localmente

### Para Producción (Render/Railway/etc):

Configure estas variables de entorno en su plataforma de hosting:

```bash
# Backend - Variables de Entorno Requeridas
WOMPI_PUBLIC_KEY=pub_prod_Ka6JKO9GS0szZXDKPWWqfFxfd5Lm1cxK
WOMPI_PRIVATE_KEY=prv_prod_9jY2Oz5NZWrAyJYsQFVIZgBfSLfUC1QA
WOMPI_EVENTS_SECRET=prod_events_5KlxcjvZG8xtBZeQ12twg92DlZVIMSU3
WOMPI_INTEGRITY_SECRET=prod_integrity_WBXrz0Vv1jCAicdsE1iBzRIqtpjc8W0e
WOMPI_API_URL=https://production.wompi.co/v1
WOMPI_EVENTS_URL=https://TU-DOMINIO.com/api/wompi/webhook
```

```bash
# Frontend - Variables de Entorno Requeridas  
REACT_APP_WOMPI_PUBLIC_KEY=pub_prod_Ka6JKO9GS0szZXDKPWWqfFxfd5Lm1cxK
REACT_APP_WOMPI_ENVIRONMENT=production
```

## 🧪 Validación de Configuración

Para verificar que Wompi está configurado correctamente:

### 1. Verificar Backend
```bash
cd backend
node -e "require('dotenv').config(); console.log('Public Key:', process.env.WOMPI_PUBLIC_KEY)"
```

Debe mostrar: `pub_prod_Ka6JKO9GS0szZXDKPWWqfFxfd5Lm1cxK`

### 2. Verificar Frontend
```bash
cd frontend
node -e "require('dotenv').config(); console.log('Public Key:', process.env.REACT_APP_WOMPI_PUBLIC_KEY)"
```

Debe mostrar: `pub_prod_Ka6JKO9GS0szZXDKPWWqfFxfd5Lm1cxK`

## 🔐 Configuración de Webhooks en Wompi

### URL del Webhook

En el dashboard de Wompi, configure la siguiente URL para recibir eventos:

**Desarrollo Local (con ngrok o similar):**
```
https://TU-SUBDOMINIO.ngrok.io/api/wompi/webhook
```

**Producción:**
```
https://TU-DOMINIO.com/api/wompi/webhook
```

### Eventos a Suscribir

Asegúrese de suscribirse a los siguientes eventos:
- ✅ `transaction.updated` - Cuando cambia el estado de una transacción
- ✅ `payment.approved` - Cuando se aprueba un pago
- ✅ `payment.declined` - Cuando se rechaza un pago

## 📋 Flujo de Pago en Producción

1. **Usuario completa checkout** → Crea orden en estado `pending`
2. **Sistema genera transacción Wompi** → Redirige a pasarela de pago
3. **Usuario paga con tarjeta real** → Wompi procesa el pago
4. **Webhook recibe confirmación** → Estado cambia a `APPROVED`
5. **Sistema descuenta stock** → Solo cuando el pago es confirmado
6. **Envía email de confirmación** → Usuario recibe comprobante

## 🚨 Diferencias Test vs Producción

| Característica | Test (Sandbox) | Producción |
|---------------|----------------|------------|
| **URL API** | `sandbox.wompi.co` | `production.wompi.co` |
| **Tarjetas** | Tarjetas de prueba | Tarjetas reales |
| **Cargos** | No se cobra dinero real | Se cobra dinero real |
| **Stock** | Se descuenta | Se descuenta |
| **Emails** | Se envían | Se envían |

### Tarjetas de Prueba (Solo Sandbox)
```
Visa: 4242 4242 4242 4242
Mastercard: 5555 5555 5555 4444
CVV: Cualquier 3 dígitos
Fecha: Cualquier fecha futura
```

⚠️ **En producción NO use tarjetas de prueba** - solo funcionan tarjetas reales.

## 📊 Monitoreo

### Logs a Revisar

El sistema ahora registra los siguientes eventos:

```bash
# Backend logs
✅ Stock actualizado para producto [ID]: -[cantidad]
💾 Carrito guardado. Productos: X, Subtotal: $XXX
🗑️ Producto eliminado. Productos antes: X, después: Y
```

### Dashboard de Wompi

Acceda al dashboard de Wompi para:
- Ver transacciones en tiempo real
- Revisar webhooks recibidos
- Consultar reportes de ventas
- Gestionar devoluciones

## 🔧 Troubleshooting

### Problema: Webhook no recibe eventos

**Solución:**
1. Verifique que `WOMPI_EVENTS_URL` apunta a una URL pública
2. Use ngrok para desarrollo local: `ngrok http 5001`
3. Configure la URL de ngrok en Wompi dashboard
4. Revise los logs del webhook en Wompi

### Problema: Pagos no se procesan

**Solución:**
1. Verifique que `WOMPI_PUBLIC_KEY` es la correcta en frontend
2. Confirme que `WOMPI_API_URL` apunta a `production.wompi.co`
3. Revise la consola del navegador para errores
4. Verifique en Wompi dashboard si la transacción fue creada

### Problema: Stock no se descuenta

**Solución:**
1. Verifique que el webhook está recibiendo eventos `APPROVED`
2. Revise los logs del backend para errores de stock
3. Confirme que el producto tiene stock suficiente

## 📞 Soporte

Para problemas con Wompi:
- 📧 Email: soporte@wompi.co
- 📚 Documentación: https://docs.wompi.co
- 💬 Chat: Disponible en el dashboard

---

**Última actualización:** Diciembre 15, 2025  
**Estado:** ✅ Configuración de Producción Activa
