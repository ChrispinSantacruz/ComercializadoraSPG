const User = require('./models/User');

// Ruta temporal para crear admin (ELIMINAR DESPUÉS DE USAR)
app.get('/create-admin-temp', async (req, res) => {
  try {
    // Verificar si ya existe
    const existingAdmin = await User.findOne({ email: 'chris@chrisadmin.com' });
    
    if (existingAdmin) {
      // Actualizar contraseña y rol
      existingAdmin.password = 'Pipeman06';
      existingAdmin.rol = 'administrador';
      existingAdmin.estado = 'activo';
      await existingAdmin.save();
      
      return res.json({
        message: '✅ Administrador actualizado exitosamente',
        admin: {
          email: existingAdmin.email,
          nombre: existingAdmin.nombre,
          rol: existingAdmin.rol
        }
      });
    }

    // Crear nuevo administrador
    const adminData = {
      nombre: 'Chris Admin',
      email: 'chris@chrisadmin.com',
      password: 'Pipeman06',
      telefono: '+57 300 123 4567',
      rol: 'administrador',
      estado: 'activo',
      configuracion: {
        pais: 'Colombia',
        region: 'Bogotá',
        idioma: 'es',
        moneda: 'COP'
      }
    };

    const admin = new User(adminData);
    await admin.save();
    
    res.json({
      message: '✅ ¡Administrador creado exitosamente!',
      credentials: {
        email: 'chris@chrisadmin.com',
        password: 'Pipeman06',
        rol: 'administrador'
      }
    });

  } catch (error) {
    console.error('Error creando admin:', error);
    res.status(500).json({
      message: '❌ Error creando administrador',
      error: error.message
    });
  }
});

// INSTRUCCIONES:
// 1. Copia la función de arriba y pégala en server.js antes de las rutas de error
// 2. Inicia el servidor: npm start
// 3. Ve a: http://localhost:5000/create-admin-temp
// 4. Verás la confirmación del admin creado
// 5. ELIMINA esta ruta de server.js después de usarla 