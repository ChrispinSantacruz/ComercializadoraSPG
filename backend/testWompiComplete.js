/**
 * Script de prueba para Wompi - Ambiente de Pruebas
 * Este script prueba todas las funcionalidades de Wompi en el ambiente sandbox
 */

const axios = require('axios');
require('dotenv').config();

const BASE_URL = 'http://localhost:5001/api';

// Datos de prueba para Wompi Sandbox
const TEST_DATA = {
    user: {
        email: 'test@comercializadoraspg.com',
        password: 'Test123456!'
    },
    customer: {
        fullName: 'Juan Pérez Test',
        email: 'juan.test@example.com',
        phoneNumber: '+573001234567',
        legalId: '12345678',
        legalIdType: 'CC'
    },
    address: {
        addressLine1: 'Calle 123 #45-67',
        city: 'Bogotá',
        region: 'Cundinamarca',
        postalCode: '110111',
        phoneNumber: '+573001234567'
    },
    testCard: {
        number: '4242424242424242', // Tarjeta de prueba Visa
        cvc: '123',
        expMonth: '12',
        expYear: '2025',
        holderName: 'Juan Perez'
    },
    testPSE: {
        bankCode: '1040', // Banco de Bogotá
        userType: 'PERSONA_NATURAL',
        userIdentification: '12345678'
    }
};

async function authenticateUser() {
    try {
        console.log('🔐 Autenticando usuario de prueba...');
        
        const response = await axios.post(`${BASE_URL}/auth/login`, {
            email: TEST_DATA.user.email,
            password: TEST_DATA.user.password
        });

        if (response.data.success) {
            console.log('✅ Usuario autenticado correctamente');
            return response.data.data.token;
        } else {
            throw new Error('Error en autenticación');
        }
    } catch (error) {
        console.error('❌ Error en autenticación:', error.response?.data || error.message);
        console.log('💡 Asegúrate de tener un usuario de prueba registrado');
        return null;
    }
}

async function testWompiAcceptanceToken(token) {
    try {
        console.log('\n🔑 Probando token de aceptación de Wompi...');
        
        const response = await axios.get(`${BASE_URL}/wompi/acceptance-token`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        console.log('✅ Token de aceptación obtenido:', response.data);
        return response.data.data?.acceptanceToken;
    } catch (error) {
        console.error('❌ Error obteniendo token de aceptación:', error.response?.data || error.message);
        return null;
    }
}

async function testWompiPaymentMethods(token) {
    try {
        console.log('\n💳 Probando métodos de pago disponibles...');
        
        const response = await axios.get(`${BASE_URL}/wompi/payment-methods`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        console.log('✅ Métodos de pago obtenidos:');
        console.log('- PSE:', response.data.data?.filter(m => m.type === 'PSE')?.length || 0, 'bancos');
        console.log('- Tarjetas:', response.data.data?.filter(m => m.type === 'CARD')?.length || 0, 'tipos');
        console.log('- Nequi:', response.data.data?.some(m => m.type === 'NEQUI') ? 'Disponible' : 'No disponible');
        
        return response.data.data;
    } catch (error) {
        console.error('❌ Error obteniendo métodos de pago:', error.response?.data || error.message);
        return null;
    }
}

async function testCreatePaymentLink(token) {
    try {
        console.log('\n🔗 Probando creación de enlace de pago...');
        
        const paymentData = {
            orderId: `ORDER_TEST_${Date.now()}`,
            amount: 50000, // $50,000 COP
            currency: 'COP',
            customerData: TEST_DATA.customer,
            shippingAddress: TEST_DATA.address
        };
        
        const response = await axios.post(`${BASE_URL}/wompi/payment-link`, paymentData, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (response.data.success) {
            console.log('✅ Enlace de pago creado exitosamente:');
            console.log('   🔗 URL:', response.data.data.paymentUrl);
            console.log('   🆔 ID:', response.data.data.paymentLinkId);
            console.log('   📅 Expira:', response.data.data.expiresAt);
            
            if (response.data.data.qrCode) {
                console.log('   📱 QR disponible');
            }
            
            return response.data.data;
        } else {
            throw new Error('Error en respuesta del servidor');
        }
    } catch (error) {
        console.error('❌ Error creando enlace de pago:', error.response?.data || error.message);
        return null;
    }
}

async function testCardTokenization(token) {
    try {
        console.log('\n💳 Probando tokenización de tarjeta...');
        
        const response = await axios.post(`${BASE_URL}/wompi/tokenize-card`, TEST_DATA.testCard, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (response.data.success) {
            console.log('✅ Tarjeta tokenizada exitosamente:');
            console.log('   🎫 Token:', response.data.data.id);
            console.log('   💳 Últimos 4 dígitos:', response.data.data.mask);
            console.log('   🏦 Marca:', response.data.data.brand);
            
            return response.data.data.id;
        } else {
            throw new Error('Error en tokenización');
        }
    } catch (error) {
        console.error('❌ Error tokenizando tarjeta:', error.response?.data || error.message);
        return null;
    }
}

async function testCardTransaction(token, cardToken, acceptanceToken) {
    try {
        console.log('\n💰 Probando transacción con tarjeta...');
        
        const transactionData = {
            orderId: `CARD_TEST_${Date.now()}`,
            cardToken: cardToken,
            acceptanceToken: acceptanceToken,
            amount: 25000, // $25,000 COP
            customerData: TEST_DATA.customer
        };
        
        const response = await axios.post(`${BASE_URL}/wompi/card-transaction`, transactionData, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (response.data.success) {
            console.log('✅ Transacción con tarjeta creada:');
            console.log('   🆔 ID:', response.data.data.id);
            console.log('   📊 Estado:', response.data.data.status);
            console.log('   💵 Monto:', response.data.data.amount_in_cents / 100, 'COP');
            
            return response.data.data;
        } else {
            throw new Error('Error en transacción');
        }
    } catch (error) {
        console.error('❌ Error en transacción con tarjeta:', error.response?.data || error.message);
        return null;
    }
}

async function testTransactionStatus(token, transactionId) {
    try {
        console.log('\n📊 Probando consulta de estado de transacción...');
        
        const response = await axios.get(`${BASE_URL}/wompi/transaction/${transactionId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (response.data.success) {
            console.log('✅ Estado de transacción obtenido:');
            console.log('   🆔 ID:', response.data.data.id);
            console.log('   📊 Estado:', response.data.data.status);
            console.log('   💰 Monto:', response.data.data.amount_in_cents / 100, 'COP');
            console.log('   📅 Fecha:', new Date(response.data.data.created_at).toLocaleString());
            
            return response.data.data;
        } else {
            throw new Error('Error consultando estado');
        }
    } catch (error) {
        console.error('❌ Error consultando estado de transacción:', error.response?.data || error.message);
        return null;
    }
}

function printTestSummary(results) {
    console.log('\n' + '='.repeat(60));
    console.log('📋 RESUMEN DE PRUEBAS DE WOMPI');
    console.log('='.repeat(60));
    
    console.log('🔐 Autenticación:', results.auth ? '✅ Exitosa' : '❌ Fallida');
    console.log('🔑 Token de aceptación:', results.acceptanceToken ? '✅ Obtenido' : '❌ Error');
    console.log('💳 Métodos de pago:', results.paymentMethods ? '✅ Obtenidos' : '❌ Error');
    console.log('🔗 Enlace de pago:', results.paymentLink ? '✅ Creado' : '❌ Error');
    console.log('🎫 Tokenización tarjeta:', results.cardToken ? '✅ Exitosa' : '❌ Error');
    console.log('💰 Transacción tarjeta:', results.cardTransaction ? '✅ Creada' : '❌ Error');
    console.log('📊 Estado transacción:', results.transactionStatus ? '✅ Consultado' : '❌ Error');
    
    console.log('\n📝 INFORMACIÓN IMPORTANTE:');
    console.log('- Este es el ambiente de PRUEBAS de Wompi');
    console.log('- No se realizan cobros reales');
    console.log('- Usa tarjetas de prueba para testing');
    console.log('- Los enlaces de pago son funcionales para pruebas');
    
    if (results.paymentLink?.paymentUrl) {
        console.log('\n🔗 ENLACE DE PAGO DE PRUEBA:');
        console.log('   ', results.paymentLink.paymentUrl);
        console.log('   (Puedes probarlo en tu navegador)');
    }
    
    console.log('\n' + '='.repeat(60));
}

async function runWompiTests() {
    console.log('🚀 INICIANDO PRUEBAS DE INTEGRACIÓN CON WOMPI');
    console.log('🧪 Ambiente: SANDBOX (Pruebas)');
    console.log('📅 Fecha:', new Date().toLocaleString());
    console.log('='.repeat(60));
    
    const results = {
        auth: false,
        acceptanceToken: null,
        paymentMethods: null,
        paymentLink: null,
        cardToken: null,
        cardTransaction: null,
        transactionStatus: null
    };
    
    try {
        // 1. Autenticación
        const token = await authenticateUser();
        if (!token) {
            console.log('❌ No se pudo autenticar. Deteniendo pruebas.');
            return;
        }
        results.auth = true;
        
        // 2. Token de aceptación
        const acceptanceToken = await testWompiAcceptanceToken(token);
        results.acceptanceToken = acceptanceToken;
        
        // 3. Métodos de pago
        const paymentMethods = await testWompiPaymentMethods(token);
        results.paymentMethods = paymentMethods;
        
        // 4. Enlace de pago
        const paymentLink = await testCreatePaymentLink(token);
        results.paymentLink = paymentLink;
        
        // 5. Tokenización de tarjeta
        const cardToken = await testCardTokenization(token);
        results.cardToken = cardToken;
        
        // 6. Transacción con tarjeta (si tenemos token y acceptance token)
        if (cardToken && acceptanceToken) {
            const cardTransaction = await testCardTransaction(token, cardToken, acceptanceToken);
            results.cardTransaction = cardTransaction;
            
            // 7. Consultar estado de transacción
            if (cardTransaction?.id) {
                const transactionStatus = await testTransactionStatus(token, cardTransaction.id);
                results.transactionStatus = transactionStatus;
            }
        }
        
    } catch (error) {
        console.error('💥 Error general en las pruebas:', error.message);
    }
    
    // Mostrar resumen
    printTestSummary(results);
}

// Verificar configuración antes de ejecutar
function checkConfiguration() {
    const requiredEnvVars = [
        'WOMPI_PUBLIC_KEY',
        'WOMPI_PRIVATE_KEY',
        'WOMPI_INTEGRITY_SECRET'
    ];
    
    const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
    
    if (missingVars.length > 0) {
        console.error('❌ Variables de entorno faltantes:', missingVars.join(', '));
        console.error('💡 Asegúrate de tener un archivo .env configurado con las variables de Wompi');
        return false;
    }
    
    console.log('✅ Configuración de Wompi encontrada');
    return true;
}

// Ejecutar pruebas
if (require.main === module) {
    if (checkConfiguration()) {
        runWompiTests().catch(console.error);
    }
}

module.exports = {
    runWompiTests,
    TEST_DATA
};
