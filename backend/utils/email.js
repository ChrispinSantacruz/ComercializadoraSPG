const nodemailer = require('nodemailer');

// Configurar transporter
const crearTransporter = () => {
  return nodemailer.createTransporter({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false, // true para 465, false para otros puertos
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
};

// Plantillas de email
const plantillas = {
  bienvenida: (nombre, tokenVerificacion) => ({
    subject: '🎉 ¡Bienvenido a Comercializadora SPG!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #1D4ED8 0%, #3B82F6 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">¡Bienvenido a SPG!</h1>
          <p style="color: white; margin: 10px 0 0 0; font-size: 16px;">Tu comercializadora de confianza</p>
        </div>
        <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
          <h2 style="color: #111827; margin-top: 0;">Hola ${nombre},</h2>
          <p style="color: #374151; line-height: 1.6;">
            ¡Gracias por unirte a nuestra comunidad! Estamos emocionados de tenerte con nosotros.
          </p>
          <p style="color: #374151; line-height: 1.6;">
            Para completar tu registro, por favor verifica tu cuenta haciendo clic en el botón de abajo:
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL}/verificar-email?token=${tokenVerificacion}" 
               style="background: #1D4ED8; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
              Verificar mi cuenta
            </a>
          </div>
          <p style="color: #6B7280; font-size: 14px; line-height: 1.5;">
            Si no puedes hacer clic en el botón, copia y pega este enlace en tu navegador:<br>
            <a href="${process.env.FRONTEND_URL}/verificar-email?token=${tokenVerificacion}" style="color: #1D4ED8;">
              ${process.env.FRONTEND_URL}/verificar-email?token=${tokenVerificacion}
            </a>
          </p>
          <p style="color: #6B7280; font-size: 14px;">
            Este enlace expirará en 24 horas por seguridad.
          </p>
        </div>
      </div>
    `
  }),

  recuperarPassword: (nombre, tokenRecuperacion) => ({
    subject: '🔐 Recuperar contraseña - Comercializadora SPG',
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
    const transporter = crearTransporter();
    
    // Verificar conexión
    await transporter.verify();
    
    const plantilla = plantillas[tipo];
    if (!plantilla) {
      throw new Error(`Plantilla de email '${tipo}' no encontrada`);
    }
    
    const { subject, html } = plantilla(...datos);
    
    const mailOptions = {
      from: `"Comercializadora SPG" <${process.env.EMAIL_USER}>`,
      to: para,
      subject: subject,
      html: html
    };
    
    const resultado = await transporter.sendMail(mailOptions);
    console.log('Email enviado exitosamente:', resultado.messageId);
    
    return {
      exito: true,
      messageId: resultado.messageId
    };
    
  } catch (error) {
    console.error('Error enviando email:', error);
    return {
      exito: false,
      error: error.message
    };
  }
};

// Funciones específicas para cada tipo de email
const enviarEmailBienvenida = (email, nombre, tokenVerificacion) => {
  return enviarEmail(email, 'bienvenida', [nombre, tokenVerificacion]);
};

const enviarEmailRecuperacion = (email, nombre, tokenRecuperacion) => {
  return enviarEmail(email, 'recuperarPassword', [nombre, tokenRecuperacion]);
};

module.exports = {
  enviarEmail,
  enviarEmailBienvenida,
  enviarEmailRecuperacion
}; 