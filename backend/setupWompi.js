#!/usr/bin/env node

/**
 * Script de configuración automática para Wompi
 * Este script configura automáticamente el ambiente de desarrollo
 */

const fs = require('fs');
const path = require('path');

const COLORS = {
    GREEN: '\x1b[32m',
    RED: '\x1b[31m',
    YELLOW: '\x1b[33m',
    BLUE: '\x1b[34m',
    CYAN: '\x1b[36m',
    RESET: '\x1b[0m',
    BOLD: '\x1b[1m'
};

function log(message, color = COLORS.RESET) {
    console.log(`${color}${message}${COLORS.RESET}`);
}

function createEnvFile(filePath, templatePath) {
    if (fs.existsSync(filePath)) {
        log(`⚠️  El archivo ${filePath} ya existe, omitiendo...`, COLORS.YELLOW);
        return false;
    }

    if (fs.existsSync(templatePath)) {
        fs.copyFileSync(templatePath, filePath);
        log(`✅ Creado ${filePath}`, COLORS.GREEN);
        return true;
    } else {
        log(`❌ No se encontró el template ${templatePath}`, COLORS.RED);
        return false;
    }
}

function checkNodeModules(directory) {
    const nodeModulesPath = path.join(directory, 'node_modules');
    return fs.existsSync(nodeModulesPath);
}

function checkPackageJson(directory) {
    const packageJsonPath = path.join(directory, 'package.json');
    return fs.existsSync(packageJsonPath);
}

function displayWompiConfig() {
    log('\n📋 CONFIGURACIÓN DE WOMPI (AMBIENTE DE PRUEBAS)', COLORS.BOLD + COLORS.CYAN);
    log('═'.repeat(60), COLORS.CYAN);
    
    log('\n🔧 Variables de entorno configuradas:', COLORS.BLUE);
    log('Backend (.env):', COLORS.YELLOW);
    log('  • WOMPI_PUBLIC_KEY=pub_test_QGjOJpFWM45bFUuCpUTPQMYs2UGwXXZW');
    log('  • WOMPI_PRIVATE_KEY=prv_test_kIcSuSh1EJTQEX6kxXKjM3WvDHYdh4Cl');
    log('  • WOMPI_API_URL=https://sandbox.wompi.co/v1');
    
    log('\nFrontend (.env):', COLORS.YELLOW);
    log('  • REACT_APP_WOMPI_PUBLIC_KEY=pub_test_QGjOJpFWM45bFUuCpUTPQMYs2UGwXXZW');
    log('  • REACT_APP_API_URL=http://localhost:5001/api');
    
    log('\n💳 DATOS DE PRUEBA PARA TESTING:', COLORS.BLUE);
    log('Tarjetas de crédito/débito:', COLORS.YELLOW);
    log('  • Visa: 4242424242424242 (CVC: 123, Exp: 12/25)');
    log('  • Mastercard: 5555555555554444 (CVC: 123, Exp: 12/25)');
    log('  • American Express: 371449635398431 (CVC: 1234, Exp: 12/25)');
    
    log('\nPSE:', COLORS.YELLOW);
    log('  • Banco de Bogotá (1040)');
    log('  • Banco de Occidente (1023)');
    log('  • Bancolombia (1007)');
    
    log('\nNequi:', COLORS.YELLOW);
    log('  • Teléfono: 3001234567');
    log('  • PIN: cualquier valor de 4 dígitos');
    
    log('\n🚀 PASOS SIGUIENTES:', COLORS.BLUE);
    log('1. Inicia el backend: cd backend && npm run dev');
    log('2. Inicia el frontend: cd frontend && npm start');
    log('3. Ejecuta las pruebas: cd backend && node testWompiComplete.js');
    log('4. Ve a http://localhost:3000 y prueba el checkout');
    
    log('\n📚 DOCUMENTACIÓN:', COLORS.BLUE);
    log('• Wompi Docs: https://docs.wompi.co/docs/colombia/inicio-rapido/');
    log('• API Reference: https://docs.wompi.co/docs/colombia/api/');
    log('• Webhooks: https://docs.wompi.co/docs/colombia/webhooks/');
}

function main() {
    log('🚀 CONFIGURANDO COMERCIALIZADORA SPG - INTEGRACIÓN WOMPI', COLORS.BOLD + COLORS.BLUE);
    log('═'.repeat(60), COLORS.BLUE);
    
    const backendDir = path.join(__dirname);
    const frontendDir = path.join(__dirname, '..', 'frontend');
    
    // Verificar estructura del proyecto
    log('\n📁 Verificando estructura del proyecto...', COLORS.CYAN);
    
    if (!fs.existsSync(backendDir)) {
        log('❌ Directorio backend no encontrado', COLORS.RED);
        return;
    }
    
    if (!fs.existsSync(frontendDir)) {
        log('❌ Directorio frontend no encontrado', COLORS.RED);
        return;
    }
    
    // Verificar package.json
    if (!checkPackageJson(backendDir)) {
        log('❌ package.json del backend no encontrado', COLORS.RED);
        return;
    }
    
    if (!checkPackageJson(frontendDir)) {
        log('❌ package.json del frontend no encontrado', COLORS.RED);
        return;
    }
    
    log('✅ Estructura del proyecto verificada', COLORS.GREEN);
    
    // Configurar archivos .env
    log('\n⚙️ Configurando archivos de entorno...', COLORS.CYAN);
    
    const backendEnvPath = path.join(backendDir, '.env');
    const backendEnvTemplatePath = path.join(backendDir, '.env.example');
    
    const frontendEnvPath = path.join(frontendDir, '.env');
    const frontendEnvTemplatePath = path.join(frontendDir, '.env.example');
    
    createEnvFile(backendEnvPath, backendEnvTemplatePath);
    createEnvFile(frontendEnvPath, frontendEnvTemplatePath);
    
    // Verificar dependencias
    log('\n📦 Verificando dependencias...', COLORS.CYAN);
    
    if (!checkNodeModules(backendDir)) {
        log('⚠️  node_modules del backend no encontrado', COLORS.YELLOW);
        log('   Ejecuta: cd backend && npm install', COLORS.YELLOW);
    } else {
        log('✅ Dependencias del backend instaladas', COLORS.GREEN);
    }
    
    if (!checkNodeModules(frontendDir)) {
        log('⚠️  node_modules del frontend no encontrado', COLORS.YELLOW);
        log('   Ejecuta: cd frontend && npm install', COLORS.YELLOW);
    } else {
        log('✅ Dependencias del frontend instaladas', COLORS.GREEN);
    }
    
    // Mostrar configuración de Wompi
    displayWompiConfig();
    
    log('\n🎉 ¡CONFIGURACIÓN COMPLETADA!', COLORS.BOLD + COLORS.GREEN);
    log('═'.repeat(60), COLORS.GREEN);
    
    log('\n💡 CONSEJOS:', COLORS.YELLOW);
    log('• Mantén las claves de prueba para desarrollo');
    log('• Cambia a claves de producción solo cuando vayas a lanzar');
    log('• Revisa los logs de la consola para debugging');
    log('• Usa las tarjetas de prueba para testing');
    
    log('\n🆘 SOPORTE:', COLORS.CYAN);
    log('Si tienes problemas, revisa:');
    log('• Los logs del servidor (consola del backend)');
    log('• La consola del navegador (F12)');
    log('• La documentación de Wompi');
    log('• El archivo testWompiComplete.js para ejemplos');
}

// Ejecutar solo si es llamado directamente
if (require.main === module) {
    main();
}

module.exports = { main };
