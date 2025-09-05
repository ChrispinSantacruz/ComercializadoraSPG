require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

async function checkUsers() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Conectado a MongoDB');

        const users = await User.find({});
        console.log('👥 Usuarios encontrados:', users.length);
        
        users.forEach(user => {
            console.log(`- ${user.email} (${user.rol}) - Estado: ${user.estado}`);
        });

        // Buscar usuario específico
        const admin = await User.findOne({ email: 'chris@chrisadmin.com' });
        if (admin) {
            console.log('\n📋 Detalles del admin:');
            console.log('Email:', admin.email);
            console.log('Rol:', admin.rol);
            console.log('Estado:', admin.estado);
            console.log('Nombre:', admin.nombre);
        }

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await mongoose.disconnect();
    }
}

checkUsers();
