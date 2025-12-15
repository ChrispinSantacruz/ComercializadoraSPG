#!/bin/bash

# Script para generar un JWT_SECRET seguro
# Ejecuta este comando antes de desplegar en Render

echo "🔐 Generando JWT_SECRET seguro para producción..."
echo ""

JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(64).toString('hex'))")

echo "✅ JWT_SECRET generado:"
echo ""
echo "$JWT_SECRET"
echo ""
echo "📋 Copia este valor y úsalo como JWT_SECRET en las variables de entorno de Render"
echo ""
echo "⚠️  IMPORTANTE: NO compartas este secret públicamente"
