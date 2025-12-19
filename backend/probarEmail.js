#!/usr/bin/env node
/**
 * Script para probar la configuración de email
 */
require('dotenv').config();
const { probarConfiguracionEmail, enviarEmailBienvenida } = require('./utils/email');

const probarEmail = async () => {
  console.log('🧪 PROBANDO CONFIGURACIÓN DE EMAIL');
  console.log('==========================================\n');

  try {
    // Probar configuración básica
    const configuracionOK = await probarConfiguracionEmail();
    
    if (!configuracionOK) {
      console.log('❌ La configuración básica falló');
      return;
    }

    // Intentar enviar un email de prueba
    console.log('📧 Enviando email de prueba...\n');
    
    const emailPrueba = process.env.EMAIL_USER;
    const nombre = 'Usuario de Prueba';
    const codigoPrueba = '123456';
    
    const resultado = await enviarEmailBienvenida(emailPrueba, nombre, codigoPrueba);
    
    if (resultado.exito) {
      console.log('✅ ¡Email de prueba enviado exitosamente!');
      console.log(`📬 Message ID: ${resultado.messageId}`);
    } else {
      console.log('❌ Falló el envío del email de prueba');
      console.log('Detalles:', resultado);
    }

  } catch (error) {
    console.error('💥 Error durante la prueba:', error.message);
    
    if (error.message.includes('Invalid login')) {
      console.log('\n💡 POSIBLES SOLUCIONES:');
      console.log('1. Verifica que EMAIL_USER y EMAIL_PASS sean correctos');
      console.log('2. Si usas Gmail, asegúrate de usar una App Password');
      console.log('3. Verifica que la autenticación en 2 pasos esté habilitada');
    }
  }
};

// Ejecutar la prueba
probarEmail();