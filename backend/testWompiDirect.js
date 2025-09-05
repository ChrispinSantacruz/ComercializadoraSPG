const axios = require('axios');

// Test directo del endpoint de Wompi
async function testWompiEndpoint() {
    try {
        console.log('🧪 Testing Wompi payment link creation...');
        
        const testData = {
            orderId: 'TEST_ORDER_001',
            amount: 35700,
            currency: 'COP',
            customerData: {
                fullName: 'Christian Santacruz',
                email: 'test@example.com',
                phoneNumber: '3002565989',
                legalId: '12345678',
                legalIdType: 'CC'
            },
            shippingAddress: {
                addressLine1: 'manzana, pasto, Nariño',
                city: 'Pasto',
                phoneNumber: '3002565989',
                region: 'Nariño',
                postalCode: '110111'
            }
        };

        console.log('📤 Sending test data:', testData);

        const response = await axios.post('http://localhost:5001/api/wompi/payment-link', testData, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer TEST_TOKEN' // Este debería fallar por auth
            }
        });

        console.log('✅ Response:', response.data);
        
    } catch (error) {
        console.log('❌ Error details:', {
            status: error.response?.status,
            statusText: error.response?.statusText,
            data: error.response?.data,
            message: error.message
        });
        
        if (error.response?.status === 401) {
            console.log('🔐 Auth error is expected - this confirms the endpoint exists');
        }
    }
}

testWompiEndpoint();
