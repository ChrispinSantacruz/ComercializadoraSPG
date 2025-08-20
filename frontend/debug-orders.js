// Script de debugging para verificar órdenes en consola del navegador
// Copia y pega esto en la consola del navegador (F12)

console.log('🔍 DEBUGGING ORDERS - Ejecutar en consola del navegador');

// Verificar si hay órdenes en el estado de React
if (window.React && window.React.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED) {
  console.log('✅ React detectado');
  
  // Buscar componente MerchantOrders
  const findReactComponent = (element) => {
    for (let key in element) {
      if (key.startsWith('__reactInternalInstance$') || key.startsWith('__reactFiber$')) {
        const compInternals = element[key];
        return compInternals;
      }
    }
    return null;
  };
  
  const ordersDiv = document.querySelector('[class*="space-y-6"]');
  if (ordersDiv) {
    console.log('📦 Div de órdenes encontrado');
    const reactComponent = findReactComponent(ordersDiv);
    if (reactComponent) {
      console.log('⚛️ Componente React encontrado');
    }
  }
}

// Verificar API calls en Network tab
console.log('🌐 Verificar Network tab para:');
console.log('  - GET /api/orders/merchant-orders');
console.log('  - Status 200 con array de órdenes');

// Verificar localStorage
const authData = localStorage.getItem('auth-storage');
if (authData) {
  try {
    const parsed = JSON.parse(authData);
    console.log('👤 Usuario autenticado:', parsed.state?.user?.nombre);
    console.log('🔑 Token presente:', !!parsed.state?.token);
  } catch (e) {
    console.log('❌ Error parseando auth data');
  }
} else {
  console.log('❌ No hay datos de autenticación');
}

console.log('📋 Para debugging manual:');
console.log('1. Refrescar página del comerciante');
console.log('2. Abrir Network tab (F12)');
console.log('3. Buscar requests a merchant-orders');
console.log('4. Verificar respuesta tiene array con órdenes');
console.log('5. Hacer clic en botón "🔄 Recargar" azul'); 