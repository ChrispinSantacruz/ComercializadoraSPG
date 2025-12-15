const nodemailer = require('nodemailer');

// Configuraciones predefinidas para proveedores populares
const proveedoresEmail = {
  gmail: {
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    requireTLS: true
  },
  outlook: {
    host: 'smtp-mail.outlook.com',
    port: 587,
    secure: false,
    requireTLS: true
  },
  yahoo: {
    host: 'smtp.mail.yahoo.com',
    port: 587,
    secure: false
  },
  // Para servicios personalizados
  custom: {
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT) || 587,
    secure: process.env.EMAIL_SECURE === 'true'
  }
};

// Configurar transporter con soporte para múltiples proveedores
const crearTransporter = () => {
  // Detectar proveedor basado en el email del usuario
  let config;
  const emailUser = process.env.EMAIL_USER || '';
  
  if (emailUser.includes('@gmail.com')) {
    config = proveedoresEmail.gmail;
  } else if (emailUser.includes('@outlook.com') || emailUser.includes('@hotmail.com')) {
    config = proveedoresEmail.outlook;
  } else if (emailUser.includes('@yahoo.com')) {
    config = proveedoresEmail.yahoo;
  } else {
    config = proveedoresEmail.custom;
  }

  return nodemailer.createTransport({
    ...config,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    },
    // Opciones adicionales para mejor compatibilidad
    tls: {
      rejectUnauthorized: process.env.NODE_ENV === 'production'
    },
    logger: process.env.NODE_ENV === 'development', // Log de debug en desarrollo
    debug: process.env.NODE_ENV === 'development'
  });
};

// Plantillas de email
const plantillas = {
  bienvenida: (nombre, codigoVerificacion) => ({
    subject: '🎉 ¡Bienvenido a AndinoExpress!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #1D4ED8 0%, #3B82F6 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">¡Bienvenido a AndinoExpress!</h1>
          <p style="color: white; margin: 10px 0 0 0; font-size: 16px;">Tu plataforma de comercio rápido y confiable</p>
        </div>
        <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
          <h2 style="color: #111827; margin-top: 0;">Hola ${nombre},</h2>
          <p style="color: #374151; line-height: 1.6;">
            ¡Gracias por unirte a nuestra comunidad! Estamos emocionados de tenerte con nosotros.
          </p>
          <p style="color: #374151; line-height: 1.6;">
            Para completar tu registro, por favor ingresa este código de verificación en la aplicación:
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <div style="background: #1D4ED8; color: white; padding: 20px 40px; display: inline-block; border-radius: 10px; font-size: 32px; font-weight: bold; letter-spacing: 8px; font-family: 'Courier New', monospace;">
              ${codigoVerificacion}
            </div>
          </div>
          <p style="color: #374151; line-height: 1.6; text-align: center;">
            Este código es válido por <strong>15 minutos</strong>
          </p>
          <p style="color: #6B7280; font-size: 14px; text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #E5E7EB;">
            Si no solicitaste este registro, puedes ignorar este mensaje.
          </p>
        </div>
      </div>
    `
  }),

  recuperarPassword: (nombre, tokenRecuperacion) => ({
    subject: '🔐 Recuperar contraseña - AndinoExpress',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: #EF4444; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Recuperar Contraseña</h1>
        </div>
        <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
          <h2 style="color: #111827; margin-top: 0;">Hola ${nombre},</h2>
          <p style="color: #374151; line-height: 1.6;">
            Recibimos una solicitud para restablecer la contraseña de tu cuenta.
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL}/restablecer-password?token=${tokenRecuperacion}" 
               style="background: #EF4444; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
              Restablecer contraseña
            </a>
          </div>
          <p style="color: #EF4444; font-size: 14px; font-weight: bold;">
            Este enlace expirará en 1 hora por seguridad.
          </p>
        </div>
      </div>
    `
  })
};

// Función principal para enviar emails
const enviarEmail = async (para, tipo, datos) => {
  try {
    // Verificar si las credenciales de email están configuradas
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.warn('⚠️ Email service not configured. Skipping email send.');
      console.log(`📧 [DEV MODE] Would send ${tipo} email to: ${para}`);
      if (tipo === 'bienvenida' && datos[1]) {
        console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
        console.log(`🔑 CÓDIGO DE VERIFICACIÓN: ${datos[1]}`);
        console.log(`📧 Para: ${para}`);
        console.log(`👤 Nombre: ${datos[0]}`);
        console.log(`⏰ Válido por: 15 minutos`);
        console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
      }
      return {
        exito: true,
        messageId: 'dev-mode-no-email',
        warning: 'Email service not configured',
        codigoVerificacion: tipo === 'bienvenida' ? datos[1] : null
      };
    }

    const transporter = crearTransporter();
    
    // Verificar conexión con timeout
    console.log('🔄 Verificando conexión SMTP...');
    await Promise.race([
      transporter.verify(),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout al verificar conexión SMTP')), 10000)
      )
    ]);
    console.log('✅ Conexión SMTP verificada');
    
    const plantilla = plantillas[tipo];
    if (!plantilla) {
      throw new Error(`Plantilla de email '${tipo}' no encontrada`);
    }
    
    const { subject, html } = plantilla(...datos);
    
    const mailOptions = {
      from: `"AndinoExpress" <${process.env.EMAIL_USER}>`,
      to: para,
      subject: subject,
      html: html
    };
    
    const resultado = await transporter.sendMail(mailOptions);
    console.log('✅ Email enviado exitosamente:', resultado.messageId);
    
    return {
      exito: true,
      messageId: resultado.messageId
    };
    
  } catch (error) {
    console.error('❌ Error enviando email:', error);
    return {
      exito: false,
      error: error.message
    };
  }
};

// Funciones específicas para cada tipo de email
const enviarEmailBienvenida = (email, nombre, codigoVerificacion) => {
  return enviarEmail(email, 'bienvenida', [nombre, codigoVerificacion]);
};

const enviarEmailRecuperacion = (email, nombre, tokenRecuperacion) => {
  return enviarEmail(email, 'recuperarPassword', [nombre, tokenRecuperacion]);
};

// Función para probar la configuración de email
const probarConfiguracionEmail = async () => {
  try {
    console.log('\n📧 Probando configuración de email...\n');

    // Verificar variables de entorno
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.log('❌ Variables de entorno no configuradas:');
      console.log('   - EMAIL_USER:', process.env.EMAIL_USER ? '✓' : '✗');
      console.log('   - EMAIL_PASS:', process.env.EMAIL_PASS ? '✓' : '✗');
      console.log('\n💡 Configura estas variables en tu archivo .env\n');
      return false;
    }

    console.log('✓ Variables de entorno configuradas');
    console.log('  EMAIL_USER:', process.env.EMAIL_USER);
    console.log('  Proveedor detectado:', detectarProveedor(process.env.EMAIL_USER));

    // Crear transporter y verificar conexión
    const transporter = crearTransporter();
    console.log('\n🔄 Verificando conexión SMTP...');
    
    await transporter.verify();
    console.log('✅ Conexión SMTP exitosa!\n');

    // Enviar email de prueba
    console.log('📨 Enviando email de prueba...');
    const testCode = '123456';
    const resultado = await enviarEmailBienvenida(
      process.env.EMAIL_USER,
      'Usuario de Prueba',
      testCode
    );

    if (resultado.exito) {
      console.log('✅ Email de prueba enviado exitosamente!');
      console.log('   Message ID:', resultado.messageId);
      console.log('\n🎉 Configuración de email lista para usar!\n');
      return true;
    } else {
      console.log('❌ Error enviando email:', resultado.error);
      return false;
    }

  } catch (error) {
    console.error('\n❌ Error en configuración de email:', error.message);
    console.log('\n📋 Guía de solución de problemas:');
    
    if (error.message.includes('Invalid login')) {
      console.log('  • Verifica que EMAIL_USER y EMAIL_PASS sean correctos');
      console.log('  • Para Gmail, usa una App Password (no tu contraseña normal)');
      console.log('  • Activa "Acceso de aplicaciones menos seguras" si es necesario');
    }
    
    if (error.message.includes('ECONNREFUSED') || error.message.includes('ETIMEDOUT')) {
      console.log('  • Verifica tu conexión a internet');
      console.log('  • Revisa que el puerto SMTP esté correcto (587 para TLS, 465 para SSL)');
      console.log('  • Verifica que tu firewall no esté bloqueando la conexión');
    }

    console.log('\n');
    return false;
  }
};

// Función auxiliar para detectar proveedor
const detectarProveedor = (email) => {
  if (email.includes('@gmail.com')) return 'Gmail';
  if (email.includes('@outlook.com') || email.includes('@hotmail.com')) return 'Outlook';
  if (email.includes('@yahoo.com')) return 'Yahoo';
  return 'Personalizado';
};

module.exports = {
  enviarEmail,
  enviarEmailBienvenida,
  enviarEmailRecuperacion,
  probarConfiguracionEmail,
  crearTransporter
}; 