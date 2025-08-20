const Address = require('../models/Address');
const { validationResult } = require('express-validator');
const { successResponse, errorResponse } = require('../utils/helpers');

// @desc    Obtener todas las direcciones del usuario
// @route   GET /api/addresses
// @access  Private
const obtenerDirecciones = async (req, res) => {
  try {
    const direcciones = await Address.obtenerTodasActivas(req.usuario.id);

    successResponse(res, 'Direcciones obtenidas exitosamente', direcciones);

  } catch (error) {
    console.error('Error obteniendo direcciones:', error);
    errorResponse(res, 'Error interno del servidor', 500);
  }
};

// @desc    Obtener dirección por ID
// @route   GET /api/addresses/:id
// @access  Private
const obtenerDireccionPorId = async (req, res) => {
  try {
    const direccion = await Address.findOne({
      _id: req.params.id,
      usuario: req.usuario.id,
      'configuracion.activa': true
    });

    if (!direccion) {
      return errorResponse(res, 'Dirección no encontrada', 404);
    }

    successResponse(res, 'Dirección obtenida exitosamente', direccion);

  } catch (error) {
    console.error('Error obteniendo dirección:', error);
    if (error.name === 'CastError') {
      return errorResponse(res, 'ID de dirección inválido', 400);
    }
    errorResponse(res, 'Error interno del servidor', 500);
  }
};

// @desc    Crear nueva dirección
// @route   POST /api/addresses
// @access  Private
const crearDireccion = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return errorResponse(res, 'Datos inválidos', 400, errors.array());
    }

    const {
      alias,
      nombreDestinatario,
      telefono,
      direccion,
      instruccionesEntrega,
      tipo,
      esPredeterminada = false,
      esFacturacion = false,
      horariosEntrega
    } = req.body;

    // Verificar que el usuario no tenga más de 10 direcciones (límite)
    const totalDirecciones = await Address.countDocuments({
      usuario: req.usuario.id,
      'configuracion.activa': true
    });

    if (totalDirecciones >= 10) {
      return errorResponse(res, 'Has alcanzado el límite máximo de 10 direcciones', 400);
    }

    // Verificar que no existe otra dirección con el mismo alias
    const aliasExistente = await Address.findOne({
      usuario: req.usuario.id,
      alias: alias.trim(),
      'configuracion.activa': true
    });

    if (aliasExistente) {
      return errorResponse(res, 'Ya tienes una dirección con este alias', 400);
    }

    // Si es la primera dirección del usuario, marcarla automáticamente como predeterminada
    const esPrimeraDireccion = totalDirecciones === 0;

    const nuevaDireccion = new Address({
      usuario: req.usuario.id,
      alias: alias.trim(),
      nombreDestinatario: nombreDestinatario.trim(),
      telefono: telefono.trim(),
      direccion: {
        calle: direccion.calle.trim(),
        numero: direccion.numero?.trim(),
        apartamento: direccion.apartamento?.trim(),
        barrio: direccion.barrio.trim(),
        ciudad: direccion.ciudad.trim(),
        departamento: direccion.departamento.trim(),
        codigoPostal: direccion.codigoPostal?.trim(),
        pais: direccion.pais || 'Colombia'
      },
      instruccionesEntrega: instruccionesEntrega?.trim(),
      tipo: tipo || 'casa',
      configuracion: {
        esPredeterminada: esPrimeraDireccion || esPredeterminada,
        esFacturacion,
        esEnvio: true,
        activa: true
      },
      horariosEntrega: horariosEntrega || {
        lunes: { disponible: true },
        martes: { disponible: true },
        miercoles: { disponible: true },
        jueves: { disponible: true },
        viernes: { disponible: true },
        sabado: { disponible: true },
        domingo: { disponible: false }
      }
    });

    await nuevaDireccion.save();

    successResponse(res, 'Dirección creada exitosamente', nuevaDireccion, 201);

  } catch (error) {
    console.error('Error creando dirección:', error);
    if (error.code === 11000) {
      return errorResponse(res, 'Ya existe una dirección con estos datos', 400);
    }
    errorResponse(res, 'Error interno del servidor', 500);
  }
};

// @desc    Actualizar dirección
// @route   PUT /api/addresses/:id
// @access  Private
const actualizarDireccion = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return errorResponse(res, 'Datos inválidos', 400, errors.array());
    }

    const direccion = await Address.findOne({
      _id: req.params.id,
      usuario: req.usuario.id,
      'configuracion.activa': true
    });

    if (!direccion) {
      return errorResponse(res, 'Dirección no encontrada', 404);
    }

    const {
      alias,
      nombreDestinatario,
      telefono,
      direccion: nuevaDireccion,
      instruccionesEntrega,
      tipo,
      esPredeterminada,
      esFacturacion,
      horariosEntrega
    } = req.body;

    // Verificar alias único si se está cambiando
    if (alias && alias.trim() !== direccion.alias) {
      const aliasExistente = await Address.findOne({
        usuario: req.usuario.id,
        alias: alias.trim(),
        'configuracion.activa': true,
        _id: { $ne: direccion._id }
      });

      if (aliasExistente) {
        return errorResponse(res, 'Ya tienes una dirección con este alias', 400);
      }
      direccion.alias = alias.trim();
    }

    // Actualizar campos básicos
    if (nombreDestinatario) direccion.nombreDestinatario = nombreDestinatario.trim();
    if (telefono) direccion.telefono = telefono.trim();
    if (instruccionesEntrega !== undefined) direccion.instruccionesEntrega = instruccionesEntrega?.trim();
    if (tipo) direccion.tipo = tipo;

    // Actualizar dirección física
    if (nuevaDireccion) {
      if (nuevaDireccion.calle) direccion.direccion.calle = nuevaDireccion.calle.trim();
      if (nuevaDireccion.numero !== undefined) direccion.direccion.numero = nuevaDireccion.numero?.trim();
      if (nuevaDireccion.apartamento !== undefined) direccion.direccion.apartamento = nuevaDireccion.apartamento?.trim();
      if (nuevaDireccion.barrio) direccion.direccion.barrio = nuevaDireccion.barrio.trim();
      if (nuevaDireccion.ciudad) direccion.direccion.ciudad = nuevaDireccion.ciudad.trim();
      if (nuevaDireccion.departamento) direccion.direccion.departamento = nuevaDireccion.departamento.trim();
      if (nuevaDireccion.codigoPostal !== undefined) direccion.direccion.codigoPostal = nuevaDireccion.codigoPostal?.trim();
      if (nuevaDireccion.pais) direccion.direccion.pais = nuevaDireccion.pais.trim();
    }

    // Actualizar configuración
    if (esPredeterminada !== undefined) direccion.configuracion.esPredeterminada = esPredeterminada;
    if (esFacturacion !== undefined) direccion.configuracion.esFacturacion = esFacturacion;

    // Actualizar horarios de entrega
    if (horariosEntrega) {
      direccion.horariosEntrega = { ...direccion.horariosEntrega, ...horariosEntrega };
    }

    await direccion.save();

    successResponse(res, 'Dirección actualizada exitosamente', direccion);

  } catch (error) {
    console.error('Error actualizando dirección:', error);
    if (error.name === 'CastError') {
      return errorResponse(res, 'ID de dirección inválido', 400);
    }
    errorResponse(res, 'Error interno del servidor', 500);
  }
};

// @desc    Eliminar dirección (marcado lógico)
// @route   DELETE /api/addresses/:id
// @access  Private
const eliminarDireccion = async (req, res) => {
  try {
    const direccion = await Address.findOne({
      _id: req.params.id,
      usuario: req.usuario.id,
      'configuracion.activa': true
    });

    if (!direccion) {
      return errorResponse(res, 'Dirección no encontrada', 404);
    }

    // Verificar que no sea la única dirección activa
    const totalDireccionesActivas = await Address.countDocuments({
      usuario: req.usuario.id,
      'configuracion.activa': true
    });

    if (totalDireccionesActivas <= 1) {
      return errorResponse(res, 'No puedes eliminar tu única dirección', 400);
    }

    // Marcar como inactiva en lugar de eliminar
    direccion.configuracion.activa = false;

    // Si era la predeterminada, asignar otra como predeterminada
    if (direccion.configuracion.esPredeterminada) {
      const otraDireccion = await Address.findOne({
        usuario: req.usuario.id,
        'configuracion.activa': true,
        _id: { $ne: direccion._id }
      });

      if (otraDireccion) {
        otraDireccion.configuracion.esPredeterminada = true;
        await otraDireccion.save();
      }
    }

    await direccion.save();

    successResponse(res, 'Dirección eliminada exitosamente');

  } catch (error) {
    console.error('Error eliminando dirección:', error);
    if (error.name === 'CastError') {
      return errorResponse(res, 'ID de dirección inválido', 400);
    }
    errorResponse(res, 'Error interno del servidor', 500);
  }
};

// @desc    Marcar dirección como predeterminada
// @route   PUT /api/addresses/:id/set-default
// @access  Private
const marcarComoPredeterminada = async (req, res) => {
  try {
    const direccion = await Address.findOne({
      _id: req.params.id,
      usuario: req.usuario.id,
      'configuracion.activa': true
    });

    if (!direccion) {
      return errorResponse(res, 'Dirección no encontrada', 404);
    }

    if (direccion.configuracion.esPredeterminada) {
      return errorResponse(res, 'Esta dirección ya es la predeterminada', 400);
    }

    direccion.configuracion.esPredeterminada = true;
    await direccion.save();

    successResponse(res, 'Dirección marcada como predeterminada exitosamente', direccion);

  } catch (error) {
    console.error('Error marcando dirección como predeterminada:', error);
    if (error.name === 'CastError') {
      return errorResponse(res, 'ID de dirección inválido', 400);
    }
    errorResponse(res, 'Error interno del servidor', 500);
  }
};

// @desc    Obtener dirección predeterminada del usuario
// @route   GET /api/addresses/default
// @access  Private
const obtenerDireccionPredeterminada = async (req, res) => {
  try {
    const direccion = await Address.obtenerPredeterminada(req.usuario.id);

    if (!direccion) {
      return errorResponse(res, 'No tienes ninguna dirección predeterminada configurada', 404);
    }

    successResponse(res, 'Dirección predeterminada obtenida exitosamente', direccion);

  } catch (error) {
    console.error('Error obteniendo dirección predeterminada:', error);
    errorResponse(res, 'Error interno del servidor', 500);
  }
};

// @desc    Validar dirección (verificar si existe y es válida)
// @route   POST /api/addresses/validate
// @access  Private
const validarDireccion = async (req, res) => {
  try {
    const { direccion, ciudad, departamento } = req.body;

    if (!direccion || !ciudad || !departamento) {
      return errorResponse(res, 'Dirección, ciudad y departamento son requeridos', 400);
    }

    // Simulación de validación de dirección
    // En un caso real, aquí se integraría con un servicio de geolocalización
    const ciudadesValidas = ['bogotá', 'medellín', 'cali', 'barranquilla', 'cartagena', 'bucaramanga'];
    const departamentosValidos = ['cundinamarca', 'antioquia', 'valle del cauca', 'atlántico', 'bolívar', 'santander'];

    const ciudadValida = ciudadesValidas.some(c => 
      ciudad.toLowerCase().includes(c) || c.includes(ciudad.toLowerCase())
    );

    const departamentoValido = departamentosValidos.some(d => 
      departamento.toLowerCase().includes(d) || d.includes(departamento.toLowerCase())
    );

    const esValida = ciudadValida && departamentoValido;

    successResponse(res, 'Validación de dirección completada', {
      esValida,
      direccion: direccion.trim(),
      ciudad: ciudad.trim(),
      departamento: departamento.trim(),
      sugerencias: esValida ? [] : [
        'Verifica que la ciudad y departamento estén correctamente escritos',
        'Asegúrate de que la dirección sea específica (incluye número, barrio, etc.)'
      ],
      cobertura: esValida ? 'Tenemos cobertura en esta zona' : 'Zona sin confirmar cobertura'
    });

  } catch (error) {
    console.error('Error validando dirección:', error);
    errorResponse(res, 'Error interno del servidor', 500);
  }
};

module.exports = {
  obtenerDirecciones,
  obtenerDireccionPorId,
  crearDireccion,
  actualizarDireccion,
  eliminarDireccion,
  marcarComoPredeterminada,
  obtenerDireccionPredeterminada,
  validarDireccion
}; 