// Script para debuggear autenticación en el frontend
// Ejecutar en la consola del navegador (F12)

console.log('🔍 === DEBUG DE AUTENTICACIÓN ===');

// Verificar auth-storage (Zustand)
const authStorage = localStorage.getItem('auth-storage');
console.log('📦 Auth Storage presente:', !!authStorage);

if (authStorage) {
  try {
    const authData = JSON.parse(authStorage);
    console.log('✅ Auth Data parseado correctamente');
    console.log('👤 Usuario:', authData.state?.user?.nombre);
    console.log('🔑 Token presente:', !!authData.state?.token);
    console.log('🔐 Autenticado:', authData.state?.isAuthenticated);
    
    if (authData.state?.token) {
      console.log('🔑 Token (primeros 20 chars):', authData.state.token.substring(0, 20) + '...');
    }
  } catch (error) {
    console.error('❌ Error parseando auth-storage:', error);
  }
} else {
  console.log('❌ No hay auth-storage');
}

// Verificar token directo
const directToken = localStorage.getItem('token');
console.log('🔑 Token directo presente:', !!directToken);

if (directToken) {
  console.log('🔑 Token directo (primeros 20 chars):', directToken.substring(0, 20) + '...');
}

// Verificar otros datos
console.log('👤 User data:', localStorage.getItem('user'));
console.log('🎯 isAuthenticated:', localStorage.getItem('isAuthenticated'));

// Función para generar token de prueba
const generarTokenPrueba = () => {
  console.log('💡 Para generar un token de prueba:');
  console.log('1. Ejecuta en el backend: cd backend && node verificarAuth.js');
  console.log('2. Copia el token generado');
  console.log('3. Ejecuta aquí: localStorage.setItem("token", "TOKEN_AQUI")');
  console.log('4. Recarga la página');
};

console.log('🛠️ Funciones disponibles:');
console.log('- generarTokenPrueba() - Instrucciones para generar token');
console.log('- localStorage.clear() - Limpiar todo el localStorage');
console.log('- localStorage.removeItem("auth-storage") - Limpiar solo auth');
console.log('- localStorage.removeItem("token") - Limpiar solo token');

// Función para limpiar y redirigir al login
const limpiarYLogin = () => {
  localStorage.clear();
  window.location.href = '/login';
  console.log('🧹 LocalStorage limpiado, redirigiendo al login...');
};

console.log('🚪 limpiarYLogin() - Limpiar todo e ir al login');

console.log('🔍 === FIN DEBUG ==='); 