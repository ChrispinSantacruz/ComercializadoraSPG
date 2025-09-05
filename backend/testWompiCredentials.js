require('dotenv').config();
const axios = require('axios');

async function testWompiCredentials() {
    try {
        console.log('🧪 Testing Wompi credentials...');
        
        const payload = {
            name: 'Test Payment Link',
            description: 'Test payment for Comercializadora SPG',
            single_use: true,
            collect_shipping: false,
            currency: 'COP',
            amount_in_cents: 3570000, // $35,700 COP
            expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        };

        console.log('📤 Payload:', payload);

        const headers = {
            'Authorization': `Bearer ${process.env.WOMPI_PRIVATE_KEY}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        };

        console.log('🔑 Using private key:', process.env.WOMPI_PRIVATE_KEY?.substring(0, 20) + '...');

        const response = await axios.post(
            'https://sandbox.wompi.co/v1/payment_links',
            payload,
            { headers }
        );

        console.log('✅ Wompi API Response:', {
            status: response.status,
            data: response.data
        });

        if (response.data?.data?.permalink) {
            console.log('🔗 Payment link created:', response.data.data.permalink);
        }

    } catch (error) {
        console.error('❌ Wompi API Error:', {
            status: error.response?.status,
            statusText: error.response?.statusText,
            data: error.response?.data,
            message: error.message
        });
    }
}

testWompiCredentials();
