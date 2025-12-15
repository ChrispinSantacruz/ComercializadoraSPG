@echo off
REM Script para generar un JWT_SECRET seguro
REM Ejecuta este comando antes de desplegar en Render

echo.
echo Generando JWT_SECRET seguro para produccion...
echo.

node -e "console.log('JWT_SECRET generado:'); console.log(''); console.log(require('crypto').randomBytes(64).toString('hex')); console.log(''); console.log('Copia este valor y usalo como JWT_SECRET en Render'); console.log('IMPORTANTE: NO compartas este secret publicamente');"

echo.
pause
