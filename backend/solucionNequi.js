const axios = require('axios');
require('dotenv').config();

/**
 * Script específico para probar y solucionar el problema de pantalla en blanco con Nequi
 */

async function crearEnlaceNequiOptimizado() {
    try {
        console.log('🔍 SOLUCIONANDO PROBLEMA DE PANTALLA EN BLANCO CON NEQUI');
        console.log('====================================================\n');

        const wompiConfig = {
            privateKey: process.env.WOMPI_PRIVATE_KEY,
            apiUrl: 'https://sandbox.wompi.co/v1'
        };

        // Configuración optimizada específicamente para evitar pantalla en blanco
        const paymentLinkData = {
            // Información básica
            name: `ComercializadoraSPG-${Date.now()}`,
            description: 'Pedido ComercializadoraSPG - Configuración optimizada',
            
            // Configuraciones críticas para evitar pantalla en blanco
            single_use: false, // IMPORTANTE: false para reutilizar enlaces en pruebas
            collect_shipping: false,
            collect_customer_legal_id: false, // IMPORTANTE: false para simplificar
            
            // Datos financieros
            currency: 'COP',
            amount_in_cents: 250000, // $2,500 COP (bien por encima del mínimo)
            
            // Configuración temporal
            expires_at: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(), // 48 horas
            
            // URL de retorno optimizada
            redirect_url: 'http://localhost:3000/wompi-return',
            
            // Configuraciones de idioma y región
            default_language: 'es',
            
            // Datos del cliente COMPLETOS y VÁLIDOS
            customer_data: {
                phone_number: '3001234567', // Número de prueba válido
                full_name: 'Cliente Prueba ComercializadoraSPG',
                legal_id_type: 'CC',
                legal_id: '12345678'
            },
            
            // Configuraciones adicionales para estabilidad
            meta: {
                source: 'comercializadora_spg',
                test_type: 'nequi_fix',
                timestamp: new Date().toISOString(),
                fix_version: '1.0'
            }
        };

        console.log('📤 Creando enlace con configuración optimizada...');
        console.log('Datos del payload:', JSON.stringify(paymentLinkData, null, 2));

        const response = await axios.post(
            `${wompiConfig.apiUrl}/payment_links`,
            paymentLinkData,
            {
                headers: {
                    'Authorization': `Bearer ${wompiConfig.privateKey}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                timeout: 15000
            }
        );

        const linkData = response.data.data;
        const paymentUrl = `https://checkout.wompi.co/l/${linkData.id}`;
        
        console.log('\n✅ ENLACE OPTIMIZADO CREADO EXITOSAMENTE:');
        console.log('==========================================');
        console.log(`🔗 URL: ${paymentUrl}`);
        console.log(`📋 ID: ${linkData.id}`);
        console.log(`💰 Monto: $${linkData.amount_in_cents / 100} COP`);
        console.log(`🔄 Reutilizable: ${!linkData.single_use}`);
        console.log(`📅 Expira: ${linkData.expires_at || 'No expira'}`);
        
        console.log('\n🧪 INSTRUCCIONES DE PRUEBA ESPECÍFICAS:');
        console.log('=======================================');
        console.log('1. Abrir el enlace en un navegador (preferiblemente Chrome)');
        console.log('2. Esperar a que cargue completamente la página de Wompi');
        console.log('3. Seleccionar "Nequi" como método de pago');
        console.log('4. Introducir el número: 3001234567');
        console.log('5. Seguir el flujo hasta la confirmación');
        
        console.log('\n🔧 SI AÚN APARECE PANTALLA EN BLANCO:');
        console.log('====================================');
        console.log('1. Abrir F12 (Herramientas de desarrollador)');
        console.log('2. Ir a la pestaña "Console"');
        console.log('3. Buscar errores en rojo');
        console.log('4. Ir a la pestaña "Network"');
        console.log('5. Buscar peticiones fallidas (en rojo)');
        console.log('6. Reportar cualquier error encontrado');
        
        console.log('\n🔄 PRUEBAS ALTERNATIVAS:');
        console.log('=======================');
        console.log('- Probar en modo incógnito');
        console.log('- Probar en otro navegador (Edge, Firefox)');
        console.log('- Probar desde otro dispositivo/red');
        console.log('- Probar con PSE en lugar de Nequi');
        
        console.log('\n📱 NÚMERO DE PRUEBA PARA NEQUI:');
        console.log('==============================');
        console.log('Teléfono: 3001234567');
        console.log('Código OTP: 123456 (código de prueba estándar)');
        
        return paymentUrl;
        
    } catch (error) {
        console.error('\n❌ ERROR AL CREAR ENLACE OPTIMIZADO:');
        console.error('===================================');
        console.error('Status:', error.response?.status);
        console.error('Mensaje:', error.response?.data?.error?.reason || error.message);
        console.error('Detalles:', JSON.stringify(error.response?.data, null, 2));
        
        console.log('\n🔧 SOLUCIONES POSIBLES:');
        console.log('======================');
        console.log('1. Verificar que las credenciales de Wompi sean correctas');
        console.log('2. Confirmar que el merchant esté activo');
        console.log('3. Revisar que el monto sea mayor a $1,500 COP');
        console.log('4. Contactar soporte de Wompi si persiste el error');
        
        return null;
    }
}

async function verificarConfiguracionBackend() {
    try {
        console.log('\n🔧 Verificando configuración del backend...');
        
        // Probar endpoint de test
        const testData = {
            orderId: `TEST_NEQUI_${Date.now()}`,
            amount: 2500,
            currency: 'COP',
            customerData: {
                fullName: 'Cliente Prueba Nequi',
                phoneNumber: '3001234567',
                email: 'test@comercializadoraspg.com',
                legalId: '12345678',
                legalIdType: 'CC'
            },
            shippingAddress: {
                addressLine1: 'Calle 123 #45-67',
                city: 'Bogotá',
                region: 'Cundinamarca',
                postalCode: '110111'
            }
        };

        const response = await axios.post('http://localhost:5001/api/wompi/test-payment-link', testData, {
            headers: { 'Content-Type': 'application/json' },
            timeout: 10000
        });

        if (response.data.success) {
            console.log('✅ Backend funcionando correctamente');
            console.log('🔗 URL generada:', response.data.data.paymentUrl);
            return response.data.data.paymentUrl;
        } else {
            console.log('❌ Backend respondió con error:', response.data);
            return null;
        }

    } catch (error) {
        console.error('❌ Error conectando con backend:', {
            status: error.response?.status,
            message: error.message
        });
        
        if (error.code === 'ECONNREFUSED') {
            console.log('\n⚠️  El servidor backend no está corriendo en puerto 5001');
            console.log('Ejecutar: node server.js en la carpeta backend');
        }
        
        return null;
    }
}

async function main() {
    console.log('🚀 INICIANDO SOLUCIÓN COMPLETA PARA NEQUI...\n');
    
    // 1. Verificar backend
    const backendUrl = await verificarConfiguracionBackend();
    
    // 2. Crear enlace optimizado directamente
    const directUrl = await crearEnlaceNequiOptimizado();
    
    console.log('\n📊 RESUMEN DE PRUEBAS:');
    console.log('=====================');
    console.log(`Backend API: ${backendUrl ? '✅ Funcionando' : '❌ Error'}`);
    console.log(`Enlace directo: ${directUrl ? '✅ Creado' : '❌ Error'}`);
    
    if (directUrl) {
        console.log('\n🎯 ENLACE DE PRUEBA FINAL:');
        console.log('==========================');
        console.log(directUrl);
        console.log('\n💡 Este enlace está optimizado para evitar la pantalla en blanco');
    }
    
    if (backendUrl && directUrl) {
        console.log('\n✅ SISTEMA LISTO PARA PRUEBAS DE PRODUCCIÓN');
    } else {
        console.log('\n⚠️  HAY PROBLEMAS QUE RESOLVER ANTES DE CONTINUAR');
    }
}

// Ejecutar
main().catch(console.error);
