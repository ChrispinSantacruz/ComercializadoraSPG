const Order = require('../models/Order');
const User = require('../models/User');
const { validationResult } = require('express-validator');
const { successResponse, errorResponse } = require('../utils/helpers');
const { enviarNotificacion } = require('../services/notificationService');

// Simulación de proveedores de pago para desarrollo local
const BANCOS_PSE = [
  { codigo: '001', nombre: 'Banco de Bogotá' },
  { codigo: '002', nombre: 'Banco Popular' },
  { codigo: '003', nombre: 'Bancolombia' },
  { codigo: '004', nombre: 'BBVA Colombia' },
  { codigo: '005', nombre: 'Davivienda' },
  { codigo: '006', nombre: 'Banco de Occidente' },
  { codigo: '007', nombre: 'Banco AV Villas' },
  { codigo: '008', nombre: 'Banco Falabella' },
  { codigo: '009', nombre: 'Scotiabank Colpatria' },
  { codigo: '010', nombre: 'Banco Caja Social' }
];

// @desc    Obtener bancos disponibles para PSE
// @route   GET /api/payments/pse/banks
// @access  Public
const obtenerBancosPSE = async (req, res) => {
  try {
    successResponse(res, 'Bancos PSE obtenidos exitosamente', BANCOS_PSE);
  } catch (error) {
    console.error('Error obteniendo bancos PSE:', error);
    errorResponse(res, 'Error interno del servidor', 500);
  }
};

// @desc    Procesar pago con PSE
// @route   POST /api/payments/pse/process
// @access  Private
const procesarPagoPSE = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return errorResponse(res, 'Errores de validación', 400, errors.array());
    }

    const { orderId, bancoId, tipoPersona, tipoDocumento, numeroDocumento } = req.body;

    // Verificar que la orden existe y pertenece al usuario
    const orden = await Order.findById(orderId);
    if (!orden) {
      return errorResponse(res, 'Orden no encontrada', 404);
    }

    if (orden.cliente.toString() !== req.usuario.id) {
      return errorResponse(res, 'No tienes permiso para procesar esta orden', 403);
    }

    if (orden.metodoPago.estado !== 'pendiente') {
      return errorResponse(res, 'Esta orden ya fue procesada', 400);
    }

    // Verificar que el banco existe
    const banco = BANCOS_PSE.find(b => b.codigo === bancoId);
    if (!banco) {
      return errorResponse(res, 'Banco no válido', 400);
    }

    // Simulación de procesamiento PSE
    const transaccionId = `PSE-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Simular respuesta del banco (90% de éxito)
    const exito = Math.random() > 0.1;
    
    if (exito) {
      // Actualizar orden con pago aprobado
      orden.metodoPago.estado = 'aprobado';
      orden.metodoPago.transaccionId = transaccionId;
      orden.metodoPago.fechaPago = new Date();
      orden.metodoPago.referencia = `${banco.nombre}-${numeroDocumento}`;
      orden.estado = 'confirmado';
      
      await orden.save();

      // Enviar notificaciones
      try {
        await enviarNotificacion(req.usuario.id, 'pago_aprobado', {
          orderId: orden._id,
          total: orden.total,
          metodoPago: 'PSE',
          banco: banco.nombre
        });
      } catch (notifError) {
        console.error('Error enviando notificación:', notifError);
      }

      successResponse(res, 'Pago PSE procesado exitosamente', {
        transaccionId,
        estado: 'aprobado',
        banco: banco.nombre,
        referencia: orden.metodoPago.referencia,
        orden: {
          id: orden._id,
          numeroOrden: orden.numeroOrden,
          total: orden.total,
          estado: orden.estado
        }
      });

    } else {
      // Pago rechazado
      orden.metodoPago.estado = 'rechazado';
      orden.metodoPago.transaccionId = transaccionId;
      await orden.save();

      return errorResponse(res, 'Pago rechazado por el banco. Intenta con otro método de pago.', 402);
    }

  } catch (error) {
    console.error('Error procesando pago PSE:', error);
    errorResponse(res, 'Error interno del servidor', 500);
  }
};

// @desc    Procesar pago con Nequi
// @route   POST /api/payments/nequi/process
// @access  Private
const procesarPagoNequi = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return errorResponse(res, 'Errores de validación', 400, errors.array());
    }

    const { orderId, numeroNequi } = req.body;

    // Verificar que la orden existe y pertenece al usuario
    const orden = await Order.findById(orderId);
    if (!orden) {
      return errorResponse(res, 'Orden no encontrada', 404);
    }

    if (orden.cliente.toString() !== req.usuario.id) {
      return errorResponse(res, 'No tienes permiso para procesar esta orden', 403);
    }

    if (orden.metodoPago.estado !== 'pendiente') {
      return errorResponse(res, 'Esta orden ya fue procesada', 400);
    }

    // Validar formato de número Nequi (simulación)
    const nequiRegex = /^3[0-9]{9}$/;
    if (!nequiRegex.test(numeroNequi)) {
      return errorResponse(res, 'Número de Nequi inválido', 400);
    }

    // Simulación de procesamiento Nequi
    const transaccionId = `NEQUI-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Simular respuesta de Nequi (85% de éxito)
    const exito = Math.random() > 0.15;
    
    if (exito) {
      // Actualizar orden con pago aprobado
      orden.metodoPago.estado = 'aprobado';
      orden.metodoPago.transaccionId = transaccionId;
      orden.metodoPago.fechaPago = new Date();
      orden.metodoPago.referencia = `NEQUI-${numeroNequi.slice(-4)}`;
      orden.estado = 'confirmado';
      
      await orden.save();

      // Enviar notificaciones
      try {
        await enviarNotificacion(req.usuario.id, 'pago_aprobado', {
          orderId: orden._id,
          total: orden.total,
          metodoPago: 'Nequi',
          referencia: orden.metodoPago.referencia
        });
      } catch (notifError) {
        console.error('Error enviando notificación:', notifError);
      }

      successResponse(res, 'Pago Nequi procesado exitosamente', {
        transaccionId,
        estado: 'aprobado',
        numeroNequi: `***${numeroNequi.slice(-4)}`,
        referencia: orden.metodoPago.referencia,
        orden: {
          id: orden._id,
          numeroOrden: orden.numeroOrden,
          total: orden.total,
          estado: orden.estado
        }
      });

    } else {
      // Pago rechazado
      orden.metodoPago.estado = 'rechazado';
      orden.metodoPago.transaccionId = transaccionId;
      await orden.save();

      return errorResponse(res, 'Pago rechazado por Nequi. Verifica tu saldo y vuelve a intentar.', 402);
    }

  } catch (error) {
    console.error('Error procesando pago Nequi:', error);
    errorResponse(res, 'Error interno del servidor', 500);
  }
};

// @desc    Procesar pago con tarjeta de crédito
// @route   POST /api/payments/card/process
// @access  Private
const procesarPagoTarjeta = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return errorResponse(res, 'Errores de validación', 400, errors.array());
    }

    const { 
      orderId, 
      numeroTarjeta, 
      mesExpiracion, 
      añoExpiracion, 
      cvv, 
      nombreTitular,
      guardarTarjeta = false
    } = req.body;

    // Verificar que la orden existe y pertenece al usuario
    const orden = await Order.findById(orderId);
    if (!orden) {
      return errorResponse(res, 'Orden no encontrada', 404);
    }

    if (orden.cliente.toString() !== req.usuario.id) {
      return errorResponse(res, 'No tienes permiso para procesar esta orden', 403);
    }

    if (orden.metodoPago.estado !== 'pendiente') {
      return errorResponse(res, 'Esta orden ya fue procesada', 400);
    }

    // Validaciones básicas de tarjeta
    if (numeroTarjeta.length < 13 || numeroTarjeta.length > 19) {
      return errorResponse(res, 'Número de tarjeta inválido', 400);
    }

    const mesActual = new Date().getMonth() + 1;
    const añoActual = new Date().getFullYear();
    
    if (añoExpiracion < añoActual || (añoExpiracion === añoActual && mesExpiracion < mesActual)) {
      return errorResponse(res, 'Tarjeta expirada', 400);
    }

    if (cvv.length < 3 || cvv.length > 4) {
      return errorResponse(res, 'CVV inválido', 400);
    }

    // Detectar tipo de tarjeta (simulación básica)
    let tipoTarjeta = 'Desconocida';
    if (numeroTarjeta.startsWith('4')) {
      tipoTarjeta = 'Visa';
    } else if (numeroTarjeta.startsWith('5') || numeroTarjeta.startsWith('2')) {
      tipoTarjeta = 'Mastercard';
    } else if (numeroTarjeta.startsWith('3')) {
      tipoTarjeta = 'American Express';
    }

    // Simulación de procesamiento de tarjeta
    const transaccionId = `CARD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Simular respuesta del procesador (80% de éxito)
    const exito = Math.random() > 0.2;
    
    if (exito) {
      // Actualizar orden con pago aprobado
      orden.metodoPago.estado = 'aprobado';
      orden.metodoPago.transaccionId = transaccionId;
      orden.metodoPago.fechaPago = new Date();
      orden.metodoPago.referencia = `${tipoTarjeta}-${numeroTarjeta.slice(-4)}`;
      orden.estado = 'confirmado';
      
      await orden.save();

      // Guardar tarjeta si se solicita
      if (guardarTarjeta) {
        const usuario = await User.findById(req.usuario.id);
        
        // Verificar que no exista ya esta tarjeta
        const tarjetaExistente = usuario.metodosPago.find(m => 
          m.tipo === 'tarjeta_credito' && m.ultimosCuatroDigitos === numeroTarjeta.slice(-4)
        );

        if (!tarjetaExistente) {
          usuario.metodosPago.push({
            tipo: 'tarjeta_credito',
            nombre: `${tipoTarjeta} ${numeroTarjeta.slice(-4)}`,
            ultimosCuatroDigitos: numeroTarjeta.slice(-4),
            tipoTarjeta,
            fechaCreacion: new Date()
          });
          
          await usuario.save();
        }
      }

      // Enviar notificaciones
      try {
        await enviarNotificacion(req.usuario.id, 'pago_aprobado', {
          orderId: orden._id,
          total: orden.total,
          metodoPago: 'Tarjeta de Crédito',
          tipoTarjeta,
          ultimosCuatroDigitos: numeroTarjeta.slice(-4)
        });
      } catch (notifError) {
        console.error('Error enviando notificación:', notifError);
      }

      successResponse(res, 'Pago con tarjeta procesado exitosamente', {
        transaccionId,
        estado: 'aprobado',
        tipoTarjeta,
        ultimosCuatroDigitos: numeroTarjeta.slice(-4),
        referencia: orden.metodoPago.referencia,
        tarjetaGuardada: guardarTarjeta,
        orden: {
          id: orden._id,
          numeroOrden: orden.numeroOrden,
          total: orden.total,
          estado: orden.estado
        }
      });

    } else {
      // Pago rechazado
      orden.metodoPago.estado = 'rechazado';
      orden.metodoPago.transaccionId = transaccionId;
      await orden.save();

      const motivos = [
        'Fondos insuficientes',
        'Tarjeta bloqueada',
        'Datos incorrectos',
        'Límite de compra excedido',
        'Tarjeta no autorizada para compras en línea'
      ];
      
      const motivoRechazo = motivos[Math.floor(Math.random() * motivos.length)];

      return errorResponse(res, `Pago rechazado: ${motivoRechazo}`, 402);
    }

  } catch (error) {
    console.error('Error procesando pago con tarjeta:', error);
    errorResponse(res, 'Error interno del servidor', 500);
  }
};

// @desc    Consultar estado de transacción
// @route   GET /api/payments/transaction/:transactionId
// @access  Private
const consultarEstadoTransaccion = async (req, res) => {
  try {
    const { transactionId } = req.params;

    // Buscar la orden por ID de transacción
    const orden = await Order.findOne({
      'metodoPago.transaccionId': transactionId
    }).populate('cliente', 'nombre email');

    if (!orden) {
      return errorResponse(res, 'Transacción no encontrada', 404);
    }

    // Verificar que el usuario puede ver esta transacción
    if (orden.cliente._id.toString() !== req.usuario.id && req.usuario.rol !== 'administrador') {
      return errorResponse(res, 'No tienes permiso para ver esta transacción', 403);
    }

    successResponse(res, 'Estado de transacción obtenido exitosamente', {
      transaccionId: orden.metodoPago.transaccionId,
      estado: orden.metodoPago.estado,
      fechaPago: orden.metodoPago.fechaPago,
      referencia: orden.metodoPago.referencia,
      orden: {
        id: orden._id,
        numeroOrden: orden.numeroOrden,
        total: orden.total,
        estado: orden.estado
      }
    });

  } catch (error) {
    console.error('Error consultando estado de transacción:', error);
    errorResponse(res, 'Error interno del servidor', 500);
  }
};

// @desc    Simular webhook de confirmación de pago
// @route   POST /api/payments/webhook
// @access  Public (pero con verificación de firma en producción)
const webhookConfirmacionPago = async (req, res) => {
  try {
    const { transactionId, estado, referencia } = req.body;

    // En producción, aquí verificarías la firma del webhook
    
    const orden = await Order.findOne({
      'metodoPago.transaccionId': transactionId
    });

    if (!orden) {
      return errorResponse(res, 'Transacción no encontrada', 404);
    }

    // Actualizar estado si cambió
    if (orden.metodoPago.estado !== estado) {
      orden.metodoPago.estado = estado;
      
      if (estado === 'aprobado') {
        orden.estado = 'confirmado';
        orden.metodoPago.fechaPago = new Date();
      } else if (estado === 'rechazado') {
        orden.estado = 'cancelado';
      }
      
      await orden.save();

      // Notificar al usuario
      try {
        await enviarNotificacion(orden.cliente, 'actualizacion_pago', {
          orderId: orden._id,
          estado,
          transactionId
        });
      } catch (notifError) {
        console.error('Error enviando notificación:', notifError);
      }
    }

    successResponse(res, 'Webhook procesado exitosamente');

  } catch (error) {
    console.error('Error procesando webhook:', error);
    errorResponse(res, 'Error interno del servidor', 500);
  }
};

// @desc    Obtener métodos de pago disponibles
// @route   GET /api/payments/methods
// @access  Public
const obtenerMetodosPagoDisponibles = async (req, res) => {
  try {
    const metodos = [
      {
        tipo: 'PSE',
        nombre: 'PSE - Pagos Seguros en Línea',
        descripcion: 'Paga directamente desde tu cuenta bancaria',
        icono: 'pse-icon',
        activo: true,
        comision: 0,
        tiempoConfirmacion: '1-3 minutos'
      },
      {
        tipo: 'Nequi',
        nombre: 'Nequi',
        descripcion: 'Paga con tu cuenta Nequi',
        icono: 'nequi-icon',
        activo: true,
        comision: 0,
        tiempoConfirmacion: 'Inmediato'
      },
      {
        tipo: 'tarjeta_credito',
        nombre: 'Tarjeta de Crédito',
        descripcion: 'Visa, Mastercard, American Express',
        icono: 'card-icon',
        activo: true,
        comision: 2.5,
        tiempoConfirmacion: 'Inmediato'
      }
    ];

    successResponse(res, 'Métodos de pago obtenidos exitosamente', metodos);

  } catch (error) {
    console.error('Error obteniendo métodos de pago:', error);
    errorResponse(res, 'Error interno del servidor', 500);
  }
};

module.exports = {
  obtenerBancosPSE,
  procesarPagoPSE,
  procesarPagoNequi,
  procesarPagoTarjeta,
  consultarEstadoTransaccion,
  webhookConfirmacionPago,
  obtenerMetodosPagoDisponibles
}; 