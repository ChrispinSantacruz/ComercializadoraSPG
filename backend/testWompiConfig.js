const axios = require('axios');
require('dotenv').config();

/**
 * Script para verificar la configuración de Wompi
 * y probar la creación de enlaces de pago mejorados
 */

const wompiConfig = {
    publicKey: process.env.WOMPI_PUBLIC_KEY,
    privateKey: process.env.WOMPI_PRIVATE_KEY,
    apiUrl: process.env.WOMPI_API_URL || 'https://sandbox.wompi.co/v1'
};

console.log('🔧 Testing Wompi Configuration:', {
    publicKey: wompiConfig.publicKey ? `${wompiConfig.publicKey.substring(0, 20)}...` : 'NOT SET',
    privateKey: wompiConfig.privateKey ? `${wompiConfig.privateKey.substring(0, 20)}...` : 'NOT SET',
    apiUrl: wompiConfig.apiUrl
});

async function testMerchantInfo() {
    try {
        console.log('\n📋 Testing merchant information...');
        
        const response = await axios.get(
            `${wompiConfig.apiUrl}/merchants/${wompiConfig.publicKey}`,
            {
                headers: {
                    'Authorization': `Bearer ${wompiConfig.publicKey}`,
                    'Accept': 'application/json'
                }
            }
        );

        console.log('✅ Merchant info retrieved:', {
            id: response.data.data?.id,
            name: response.data.data?.name,
            email: response.data.data?.email,
            active: response.data.data?.active,
            logo_url: response.data.data?.logo_url
        });

        return response.data.data;
    } catch (error) {
        console.error('❌ Error getting merchant info:', error.response?.data || error.message);
        return null;
    }
}

async function createEnhancedPaymentLink() {
    try {
        console.log('\n💳 Creating enhanced payment link...');

        const paymentData = {
            name: `Pedido ComercializadoraSPG Test ${Date.now()}`,
            description: 'Pedido de prueba mejorado para verificar configuración',
            single_use: true,
            collect_shipping: false,
            currency: 'COP',
            amount_in_cents: 50000, // $500 COP
            expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
            redirect_url: 'http://localhost:3000/wompi-return',
            customer_data: {
                phone_number: '3001234567',
                full_name: 'Cliente Prueba ComercializadoraSPG',
                legal_id_type: 'CC',
                legal_id: '12345678'
            },
            shipping_address: {
                address_line_1: 'Calle 123 #45-67',
                city: 'Bogotá',
                region: 'Cundinamarca',
                country: 'CO',
                postal_code: '110111'
            }
        };

        console.log('📦 Payload:', JSON.stringify(paymentData, null, 2));

        const response = await axios.post(
            `${wompiConfig.apiUrl}/payment_links`,
            paymentData,
            {
                headers: {
                    'Authorization': `Bearer ${wompiConfig.privateKey}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            }
        );

        console.log('✅ Enhanced payment link created:', {
            id: response.data.data?.id,
            permalink: response.data.data?.permalink,
            amount: response.data.data?.amount_in_cents,
            status: response.data.data?.status,
            expires_at: response.data.data?.expires_at
        });

        if (response.data.data?.permalink) {
            console.log('\n🌐 Open this link to test payment:');
            console.log(response.data.data.permalink);
        }

        return response.data.data;
    } catch (error) {
        console.error('❌ Error creating enhanced payment link:', {
            status: error.response?.status,
            statusText: error.response?.statusText,
            data: error.response?.data,
            message: error.message
        });
        return null;
    }
}

async function testWompiStatus() {
    try {
        console.log('\n🔍 Testing Wompi API status...');
        
        const response = await axios.get(`${wompiConfig.apiUrl}/merchants/${wompiConfig.publicKey}`, {
            headers: {
                'Authorization': `Bearer ${wompiConfig.publicKey}`,
                'Accept': 'application/json'
            }
        });

        console.log('✅ Wompi API is accessible');
        return true;
    } catch (error) {
        console.error('❌ Wompi API test failed:', error.response?.data || error.message);
        return false;
    }
}

async function runFullTest() {
    console.log('🚀 Starting comprehensive Wompi configuration test...\n');

    // Test 1: API Status
    const apiWorking = await testWompiStatus();
    if (!apiWorking) {
        console.log('❌ Cannot proceed - Wompi API is not accessible');
        return;
    }

    // Test 2: Merchant Info
    const merchantInfo = await testMerchantInfo();

    // Test 3: Enhanced Payment Link
    const paymentLink = await createEnhancedPaymentLink();

    console.log('\n📊 Test Summary:');
    console.log('- API Status:', apiWorking ? '✅ Working' : '❌ Failed');
    console.log('- Merchant Info:', merchantInfo ? '✅ Retrieved' : '❌ Failed');
    console.log('- Payment Link:', paymentLink ? '✅ Created' : '❌ Failed');

    if (paymentLink?.permalink) {
        console.log('\n🎯 Next Steps:');
        console.log('1. Open the payment link in your browser');
        console.log('2. Complete a test payment');
        console.log('3. Verify the redirect works correctly');
        console.log('\nPayment Link:', paymentLink.permalink);
    }
}

// Ejecutar el test
runFullTest().catch(console.error);
