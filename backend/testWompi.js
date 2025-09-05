const axios = require('axios');
require('dotenv').config();

const BASE_URL = 'http://localhost:5001/api';

// Función para hacer login y obtener token
async function login() {
    try {
        const response = await axios.post(`${BASE_URL}/auth/login`, {
            email: 'chris@chrisadmin.com',
            password: 'Pipeman06'
        });
        
        return response.data.token;
    } catch (error) {
        console.error('Error en login:', error.response?.data || error.message);
        return null;
    }
}

// Función para crear una orden de prueba
async function createTestOrder(token) {
    try {
        const orderData = {
            productos: [{
                producto: '60f7b1b2c9d4a1234567890a', // ID de producto (debes tener uno real)
                comerciante: '60f7b1b2c9d4a1234567890b', // ID de comerciante
                nombre: 'Producto de Prueba Wompi',
                precio: 50000,
                cantidad: 2,
                subtotal: 100000,
                imagen: 'test-image.jpg'
            }],
            subtotal: 100000,
            costoEnvio: 5000,
            total: 105000,
            direccionEntrega: {
                nombre: 'Juan Pérez',
                telefono: '+57 300 123 4567',
                calle: 'Carrera 15 #93-47',
                ciudad: 'Bogotá',
                departamento: 'Cundinamarca',
                codigoPostal: '110111',
                pais: 'Colombia'
            },
            metodoPago: {
                tipo: 'wompi'
            }
        };

        const response = await axios.post(`${BASE_URL}/orders`, orderData, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        return response.data.order;
    } catch (error) {
        console.error('Error creando orden:', error.response?.data || error.message);
        return null;
    }
}

// Función para probar el endpoint de acceptance token
async function testAcceptanceToken(token) {
    try {
        console.log('🔑 Probando obtención de token de aceptación...');
        
        const response = await axios.get(`${BASE_URL}/wompi/acceptance-token`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        console.log('✅ Token de aceptación obtenido:', response.data);
        return response.data.data;
    } catch (error) {
        console.error('❌ Error obteniendo token de aceptación:', error.response?.data || error.message);
        return null;
    }
}

// Función para probar métodos de pago
async function testPaymentMethods(token) {
    try {
        console.log('💳 Probando métodos de pago disponibles...');
        
        const response = await axios.get(`${BASE_URL}/wompi/payment-methods`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        console.log('✅ Métodos de pago disponibles:', response.data);
        return response.data.data;
    } catch (error) {
        console.error('❌ Error obteniendo métodos de pago:', error.response?.data || error.message);
        return null;
    }
}

// Función para crear enlace de pago
async function testCreatePaymentLink(token, orderId) {
    try {
        console.log('🔗 Creando enlace de pago para orden:', orderId);
        
        const response = await axios.post(`${BASE_URL}/wompi/payment-link`, {
            orderId: orderId
        }, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        console.log('✅ Enlace de pago creado:', response.data);
        return response.data.data;
    } catch (error) {
        console.error('❌ Error creando enlace de pago:', error.response?.data || error.message);
        return null;
    }
}

// Función para tokenizar una tarjeta de prueba
async function testTokenizeCard(token) {
    try {
        console.log('💳 Tokenizando tarjeta de prueba...');
        
        // Datos de tarjeta de prueba de Wompi
        const cardData = {
            number: '4242424242424242',
            cvc: '123',
            expMonth: '12',
            expYear: '2025',
            holderName: 'Juan Perez'
        };

        const response = await axios.post(`${BASE_URL}/wompi/tokenize-card`, cardData, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        console.log('✅ Tarjeta tokenizada:', response.data);
        return response.data.data;
    } catch (error) {
        console.error('❌ Error tokenizando tarjeta:', error.response?.data || error.message);
        return null;
    }
}

// Función principal para ejecutar todas las pruebas
async function runTests() {
    console.log('🚀 Iniciando pruebas de integración con Wompi...\n');

    // 1. Login
    console.log('1️⃣ Realizando login...');
    const token = await login();
    if (!token) {
        console.error('❌ No se pudo obtener token de autenticación');
        return;
    }
    console.log('✅ Login exitoso\n');

    // 2. Probar token de aceptación
    console.log('2️⃣ Probando token de aceptación...');
    const acceptanceToken = await testAcceptanceToken(token);
    console.log('');

    // 3. Probar métodos de pago
    console.log('3️⃣ Probando métodos de pago...');
    const paymentMethods = await testPaymentMethods(token);
    console.log('');

    // 4. Tokenizar tarjeta
    console.log('4️⃣ Probando tokenización de tarjeta...');
    const cardToken = await testTokenizeCard(token);
    console.log('');

    // 5. Crear orden de prueba (comentado por ahora ya que necesitamos datos reales)
    /*
    console.log('5️⃣ Creando orden de prueba...');
    const order = await createTestOrder(token);
    if (!order) {
        console.error('❌ No se pudo crear orden de prueba');
        return;
    }
    console.log('✅ Orden creada:', order._id);

    // 6. Crear enlace de pago
    console.log('6️⃣ Creando enlace de pago...');
    const paymentLink = await testCreatePaymentLink(token, order._id);
    */

    console.log('🎉 Pruebas completadas!');
    console.log('\n📋 Resumen:');
    console.log('- Login:', token ? '✅' : '❌');
    console.log('- Token de aceptación:', acceptanceToken ? '✅' : '❌');
    console.log('- Métodos de pago:', paymentMethods ? '✅' : '❌');
    console.log('- Tokenización de tarjeta:', cardToken ? '✅' : '❌');
}

// Ejecutar las pruebas
if (require.main === module) {
    runTests().catch(console.error);
}

module.exports = {
    login,
    testAcceptanceToken,
    testPaymentMethods,
    testCreatePaymentLink,
    testTokenizeCard,
    runTests
};
