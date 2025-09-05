const axios = require('axios');
require('dotenv').config();

/**
 * Script de diagnóstico completo para problemas con Wompi
 * Especialmente para el problema de pantalla en blanco con Nequi
 */

const wompiConfig = {
    publicKey: process.env.WOMPI_PUBLIC_KEY,
    privateKey: process.env.WOMPI_PRIVATE_KEY,
    apiUrl: process.env.WOMPI_API_URL || 'https://sandbox.wompi.co/v1'
};

console.log('🔍 DIAGNÓSTICO WOMPI - Problema de Pantalla en Blanco');
console.log('====================================================\n');

async function verificarConfiguracionMerchant() {
    try {
        console.log('1️⃣ Verificando configuración del merchant...');
        
        const response = await axios.get(
            `${wompiConfig.apiUrl}/merchants/${wompiConfig.publicKey}`,
            {
                headers: {
                    'Authorization': `Bearer ${wompiConfig.publicKey}`,
                    'Accept': 'application/json'
                }
            }
        );

        const merchantData = response.data.data;
        
        console.log('✅ Merchant encontrado:');
        console.log(`   ID: ${merchantData.id}`);
        console.log(`   Nombre: ${merchantData.name}`);
        console.log(`   Email: ${merchantData.email}`);
        console.log(`   Activo: ${merchantData.active}`);
        console.log(`   Logo: ${merchantData.logo_url || 'No configurado'}`);
        
        // Verificar configuraciones importantes para evitar pantalla en blanco
        if (!merchantData.active) {
            console.log('⚠️  PROBLEMA: El merchant no está activo');
            return false;
        }
        
        if (!merchantData.name || merchantData.name.trim() === '') {
            console.log('⚠️  PROBLEMA: El merchant no tiene nombre configurado');
            return false;
        }
        
        console.log('✅ Configuración del merchant OK\n');
        return true;
        
    } catch (error) {
        console.error('❌ Error verificando merchant:', error.response?.data || error.message);
        return false;
    }
}

async function crearEnlacePagoMejorado() {
    try {
        console.log('2️⃣ Creando enlace de pago con configuración mejorada...');
        
        const paymentLinkData = {
            name: `Test Nequi ${Date.now()}`,
            description: 'Pedido de prueba para diagnosticar problema de Nequi',
            single_use: false, // Cambiar a false para reutilizar en pruebas
            collect_shipping: false,
            currency: 'COP',
            amount_in_cents: 200000, // $2,000 COP (mayor al mínimo)
            expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
            redirect_url: 'http://localhost:3000/wompi-return',
            
            // Datos del cliente completos para evitar errores
            customer_data: {
                phone_number: '3001234567',
                full_name: 'Cliente Prueba Nequi',
                legal_id_type: 'CC',
                legal_id: '12345678'
            },
            
            // Configuraciones adicionales para mejorar compatibilidad
            default_payment_method: 'NEQUI',
            default_language: 'es',
            
            // Agregar meta data para tracking
            meta: {
                test_type: 'nequi_diagnostic',
                timestamp: new Date().toISOString()
            }
        };

        console.log('📤 Enviando payload:', JSON.stringify(paymentLinkData, null, 2));

        const response = await axios.post(
            `${wompiConfig.apiUrl}/payment_links`,
            paymentLinkData,
            {
                headers: {
                    'Authorization': `Bearer ${wompiConfig.privateKey}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            }
        );

        const linkData = response.data.data;
        const paymentUrl = `https://checkout.wompi.co/l/${linkData.id}`;
        
        console.log('✅ Enlace creado exitosamente:');
        console.log(`   ID: ${linkData.id}`);
        console.log(`   URL: ${paymentUrl}`);
        console.log(`   Activo: ${linkData.active}`);
        console.log(`   Monto: $${linkData.amount_in_cents / 100} COP`);
        
        return {
            success: true,
            paymentUrl,
            linkId: linkData.id
        };
        
    } catch (error) {
        console.error('❌ Error creando enlace:', error.response?.data || error.message);
        return { success: false, error: error.response?.data || error.message };
    }
}

async function verificarEstadoSandbox() {
    try {
        console.log('3️⃣ Verificando estado del sandbox de Wompi...');
        
        // Verificar conectividad básica
        const healthCheck = await axios.get(`${wompiConfig.apiUrl}/merchants/${wompiConfig.publicKey}`, {
            headers: { 'Authorization': `Bearer ${wompiConfig.publicKey}` },
            timeout: 10000
        });
        
        console.log('✅ Sandbox accesible');
        console.log(`   Tiempo de respuesta: ${Date.now() - Date.now()} ms`);
        console.log(`   Estado HTTP: ${healthCheck.status}`);
        
        // Verificar métodos de pago disponibles
        try {
            const paymentMethods = await axios.get(
                `${wompiConfig.apiUrl}/payment_methods`,
                {
                    headers: {
                        'Authorization': `Bearer ${wompiConfig.publicKey}`,
                        'Accept': 'application/json'
                    }
                }
            );
            
            console.log('✅ Métodos de pago disponibles:');
            paymentMethods.data.data.forEach(method => {
                console.log(`   - ${method.name} (${method.payment_type})`);
            });
            
            // Verificar si Nequi está disponible
            const nequiMethod = paymentMethods.data.data.find(method => 
                method.name.toLowerCase().includes('nequi')
            );
            
            if (nequiMethod) {
                console.log('✅ Nequi está disponible como método de pago');
            } else {
                console.log('⚠️  Nequi no encontrado en métodos disponibles');
            }
            
        } catch (error) {
            console.log('⚠️  No se pudieron obtener métodos de pago:', error.message);
        }
        
        return true;
        
    } catch (error) {
        console.error('❌ Error verificando sandbox:', error.response?.data || error.message);
        return false;
    }
}

async function generarRecomendaciones() {
    console.log('\n📋 RECOMENDACIONES PARA SOLUCIONAR PANTALLA EN BLANCO:');
    console.log('=====================================================');
    
    console.log('\n🔧 Soluciones técnicas:');
    console.log('1. Verificar que el merchant esté completamente configurado en Wompi');
    console.log('2. Asegurar que todos los campos requeridos estén presentes');
    console.log('3. Validar que el monto sea mayor a $1,500 COP');
    console.log('4. Usar single_use: false para pruebas repetidas');
    console.log('5. Incluir customer_data completo');
    
    console.log('\n🌐 Soluciones de frontend:');
    console.log('1. Verificar que redirect_url sea accesible');
    console.log('2. Asegurar que no hay bloqueadores de pop-ups');
    console.log('3. Probar en modo incógnito para descartar cache');
    console.log('4. Verificar que JavaScript esté habilitado');
    
    console.log('\n🔍 Depuración adicional:');
    console.log('1. Abrir herramientas de desarrollador (F12)');
    console.log('2. Revisar la consola por errores de JavaScript');
    console.log('3. Verificar la pestaña Network por errores de red');
    console.log('4. Comprobar si hay errores CORS');
    
    console.log('\n⚡ Pruebas inmediatas:');
    console.log('1. Probar el enlace de pago en diferentes navegadores');
    console.log('2. Verificar en dispositivo móvil');
    console.log('3. Probar sin VPN o proxy');
    console.log('4. Intentar con diferentes métodos de pago (no solo Nequi)');
}

async function ejecutarDiagnostico() {
    console.log('🚀 Iniciando diagnóstico completo...\n');
    
    const merchantOK = await verificarConfiguracionMerchant();
    const sandboxOK = await verificarEstadoSandbox();
    const paymentLink = await crearEnlacePagoMejorado();
    
    console.log('\n📊 RESUMEN DEL DIAGNÓSTICO:');
    console.log('==========================');
    console.log(`Configuración Merchant: ${merchantOK ? '✅' : '❌'}`);
    console.log(`Estado Sandbox: ${sandboxOK ? '✅' : '❌'}`);
    console.log(`Creación de Enlaces: ${paymentLink.success ? '✅' : '❌'}`);
    
    if (paymentLink.success) {
        console.log('\n🧪 ENLACE DE PRUEBA GENERADO:');
        console.log('=============================');
        console.log(paymentLink.paymentUrl);
        console.log('\n📝 Instrucciones de prueba:');
        console.log('1. Abrir el enlace en navegador');
        console.log('2. Seleccionar Nequi como método de pago');
        console.log('3. Introducir número de teléfono de prueba: 3001234567');
        console.log('4. Si aparece pantalla en blanco, abrir F12 y revisar errores');
        console.log('5. Reportar cualquier error en consola del navegador');
    }
    
    await generarRecomendaciones();
    
    console.log('\n🎯 PRÓXIMOS PASOS:');
    console.log('==================');
    console.log('1. Probar el enlace generado arriba');
    console.log('2. Si persiste el problema, revisar configuración del merchant en panel Wompi');
    console.log('3. Contactar soporte de Wompi si es necesario');
    console.log('4. Considerar usar método alternativo temporalmente');
}

// Ejecutar diagnóstico
ejecutarDiagnostico().catch(console.error);
