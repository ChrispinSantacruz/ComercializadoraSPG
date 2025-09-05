const axios = require('axios');

async function createAdmin() {
    try {
        const response = await axios.post('http://localhost:5001/api/admin/create-super-admin', {
            secretKey: 'CREATE_ADMIN_SECRET_2025',
            adminData: {
                email: 'chris@chrisadmin.com',
                password: 'Pipeman06',
                nombre: 'Chris Admin'
            }
        });

        console.log('✅ Administrador creado exitosamente:', response.data);
    } catch (error) {
        console.error('❌ Error creando administrador:', error.response?.data || error.message);
    }
}

createAdmin();
