# 🔧 Fix: Reseñas reflejadas en el Perfil del Comerciante

## Problema Identificado

Después de realizar una compra y dejar una reseña, las estadísticas del comerciante no se actualizaban automáticamente en su perfil. Las estadísticas del **producto** sí se actualizaban, pero las del **comerciante** (User.estadisticasComerciante) permanecían en 0.

## Causa Raíz

La función `actualizarEstadisticasProducto()` solo actualizaba las estadísticas del **modelo Product**, pero no actualizaba las estadísticas del **modelo User** (comerciante).

## ✅ Solución Implementada

### 1. **Nueva Función: `actualizarEstadisticasComerciante()`**

Agregada en [reviewController.js](backend/controllers/reviewController.js):

```javascript
const actualizarEstadisticasComerciante = async (comercianteId) => {
  try {
    // Obtener todos los productos del comerciante
    const productos = await Product.find({ comerciante: comercianteId }).select('_id');
    const productosIds = productos.map(p => p._id);

    if (productosIds.length === 0) return;

    // Calcular estadísticas de TODAS las reseñas de los productos
    const estadisticas = await Review.aggregate([
      { 
        $match: { 
          producto: { $in: productosIds },
          estado: 'aprobada'
        }
      },
      {
        $group: {
          _id: null,
          calificacionPromedio: { $avg: '$calificacion' },
          totalReseñas: { $sum: 1 }
        }
      }
    ]);

    if (estadisticas.length > 0) {
      // Actualizar estadísticas en el perfil del comerciante
      await User.findByIdAndUpdate(comercianteId, {
        'estadisticasComerciante.calificacionPromedio': Math.round(estadisticas[0].calificacionPromedio * 10) / 10,
        'estadisticasComerciante.totalReseñas': estadisticas[0].totalReseñas
      });
    }
  } catch (error) {
    console.error('Error actualizando estadísticas del comerciante:', error);
  }
};
```

### 2. **Integración en `crearReseña()`**

Modificado para llamar a ambas funciones de actualización:

```javascript
await reseña.save();

// Actualizar estadísticas del producto
await actualizarEstadisticasProducto(producto);

// ✅ NUEVO: Actualizar estadísticas del comerciante
await actualizarEstadisticasComerciante(productoExiste.comerciante);

// Enviar notificación al comerciante...
```

### 3. **Integración en `moderarReseña()`**

Cuando un admin aprueba/rechaza una reseña, también actualiza las estadísticas:

```javascript
await reseña.save();

// Actualizar estadísticas del producto y comerciante
await actualizarEstadisticasProducto(reseña.producto._id);

// Obtener el comerciante del producto
const producto = await Product.findById(reseña.producto._id).select('comerciante');
if (producto) {
  await actualizarEstadisticasComerciante(producto.comerciante);
}
```

## 📊 Estadísticas Actualizadas

El perfil del comerciante ahora muestra en `User.estadisticasComerciante`:

```javascript
{
  totalVentas: 0,              // Se actualiza con ventas
  productosVendidos: 0,        // Se actualiza con ventas
  calificacionPromedio: 4.5,   // ✅ NUEVO: Promedio de todas las reseñas
  totalReseñas: 15            // ✅ NUEVO: Total de reseñas aprobadas
}
```

## 🛠️ Script de Recalculación

Se creó un script para recalcular estadísticas de comerciantes existentes:

**Ubicación**: `backend/scripts/recalcular-estadisticas-comerciantes.js`

**Uso**:
```bash
cd backend
node scripts/recalcular-estadisticas-comerciantes.js
```

**Qué hace**:
- Encuentra todos los usuarios con rol `comerciante`
- Para cada comerciante:
  - Obtiene todos sus productos
  - Calcula el promedio y total de reseñas aprobadas
  - Actualiza `User.estadisticasComerciante`

## 🧪 Cómo Probar

### 1. **Crear una reseña**

```bash
POST /api/reviews
{
  "producto": "64a...",
  "calificacion": 5,
  "titulo": "Excelente producto",
  "comentario": "Me encantó, muy buena calidad"
}
```

### 2. **Verificar estadísticas del producto**

```bash
GET /api/products/64a...
```

Respuesta incluye:
```json
{
  "estadisticas": {
    "calificacionPromedio": 4.5,
    "totalReseñas": 3
  }
}
```

### 3. **Verificar perfil del comerciante**

```bash
GET /api/users/profile  (como comerciante)
```

Respuesta incluye:
```json
{
  "estadisticas": {
    "estadisticasComerciante": {
      "calificacionPromedio": 4.5,
      "totalReseñas": 15  // ✅ Suma de TODAS las reseñas de TODOS los productos
    }
  }
}
```

### 4. **Verificar estadísticas de reseñas del comerciante**

```bash
GET /api/reviews/merchant/stats
```

Respuesta:
```json
{
  "totalReseñas": 15,
  "calificacionPromedio": 4.5,
  "distribucionCalificaciones": {
    "1": 0,
    "2": 1,
    "3": 2,
    "4": 5,
    "5": 7
  }
}
```

## 📝 Flujo Completo

1. **Cliente hace compra** → Order estado: 'entregado'
2. **Cliente deja reseña** → Review.estado: 'aprobada'
3. **Se actualiza Product.estadisticas** ✅
4. **Se actualiza User.estadisticasComerciante** ✅ (NUEVO)
5. **Se envía notificación al comerciante** ✅
6. **Perfil del comerciante muestra las estadísticas actualizadas** ✅

## 🎯 Resultado Esperado

- ✅ Cada vez que se crea una reseña, las estadísticas del comerciante se actualizan
- ✅ Cada vez que se modera una reseña, las estadísticas se recalculan
- ✅ El perfil del comerciante muestra el promedio y total de TODAS sus reseñas
- ✅ Las estadísticas son precisas y están sincronizadas
- ✅ Script disponible para recalcular estadísticas existentes

## 🚀 Deploy en Producción

1. **Commit y push** de los cambios en reviewController.js
2. **Deploy** en Render.com (auto-deploy)
3. **Ejecutar script** para recalcular estadísticas existentes:
   ```bash
   # Conectarse al servidor de Render via SSH o usar Dashboard
   node scripts/recalcular-estadisticas-comerciantes.js
   ```
4. **Verificar** que los perfiles de comerciantes muestran las estadísticas

---

**Última actualización**: Enero 6, 2026  
**Estado**: ✅ Implementado y probado
**Archivos modificados**: 
- `backend/controllers/reviewController.js`
- `backend/scripts/recalcular-estadisticas-comerciantes.js` (nuevo)
