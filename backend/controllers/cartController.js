const Cart = require('../models/Cart');
const Product = require('../models/Product');
const { validationResult } = require('express-validator');
const { successResponse, errorResponse } = require('../utils/helpers');

// @desc    Obtener carrito del usuario
// @route   GET /api/cart
// @access  Private
const obtenerCarrito = async (req, res) => {
  try {
    let carrito = await Cart.findOne({ usuario: req.usuario.id })
      .populate({
        path: 'productos.producto',
        select: 'nombre precio imagenes stock estado comerciante',
        populate: {
          path: 'comerciante',
          select: 'nombre'
        }
      });

    if (!carrito) {
      carrito = new Cart({
        usuario: req.usuario.id,
        productos: [],
        subtotal: 0,
        impuestos: 0,
        total: 0
      });
      await carrito.save();
    }

    // Verificar disponibilidad de productos
    const productosDisponibles = carrito.productos.filter(item => {
      return item.producto && item.producto.estado === 'aprobado' && item.producto.stock > 0;
    });

    if (productosDisponibles.length !== carrito.productos.length) {
      carrito.productos = productosDisponibles;
    }
    
    // SIEMPRE recalcular totales para asegurar que el costo de envío esté actualizado
    carrito.calcularTotales();
    
    // Marcar el campo como modificado para que Mongoose lo guarde
    carrito.markModified('costoEnvio');
    carrito.markModified('total');
    carrito.markModified('subtotal');
    carrito.markModified('impuestos');
    
    await carrito.save();

    successResponse(res, 'Carrito obtenido exitosamente', carrito);

  } catch (error) {
    console.error('Error obteniendo carrito:', error);
    errorResponse(res, 'Error interno del servidor', 500);
  }
};

// @desc    Agregar producto al carrito
// @route   POST /api/cart/add
// @access  Private
const agregarAlCarrito = async (req, res) => {
  try {
    // Las validaciones ya se manejan en el middleware
    const { productoId, cantidad } = req.body;

    // Verificar que el producto existe y está disponible
    const producto = await Product.findById(productoId);
    if (!producto) {
      return errorResponse(res, 'Producto no encontrado', 404);
    }

    if (producto.estado !== 'aprobado') {
      return errorResponse(res, 'Producto no disponible para compra', 400);
    }

    if (producto.stock < cantidad) {
      return errorResponse(res, `Stock insuficiente. Disponible: ${producto.stock}`, 400);
    }

    // Obtener o crear carrito
    let carrito = await Cart.findOne({ usuario: req.usuario.id });
    if (!carrito) {
      carrito = new Cart({
        usuario: req.usuario.id,
        productos: []
      });
    }

    // Verificar si el producto ya está en el carrito
    const productoExistente = carrito.productos.find(item => 
      item.producto.toString() === productoId
    );

    if (productoExistente) {
      const nuevaCantidad = productoExistente.cantidad + cantidad;
      if (nuevaCantidad > producto.stock) {
        return errorResponse(res, `Stock insuficiente. Disponible: ${producto.stock}`, 400);
      }
      productoExistente.cantidad = nuevaCantidad;
      console.log(`➕ Actualizando producto existente: ${productoExistente.nombre}, cantidad: ${nuevaCantidad}`);
    } else {
      carrito.productos.push({
        producto: productoId,
        cantidad,
        precio: producto.precio,
        precioOferta: producto.precioOferta,
        subtotal: cantidad * (producto.precioOferta || producto.precio),
        nombre: producto.nombre,
        imagen: producto.imagenPrincipal || (producto.imagenes && producto.imagenes.length > 0 ? producto.imagenes[0].url : '') || '',
        comerciante: producto.comerciante,
        stockDisponible: producto.stock,
        disponible: producto.stock >= cantidad
      });
      console.log(`➕ Agregando nuevo producto: ${producto.nombre}, cantidad: ${cantidad}`);
    }

    // Recalcular totales (ahora también actualiza subtotales de items)
    carrito.calcularTotales();
    
    // Marcar como modificado
    carrito.markModified('productos');
    carrito.markModified('subtotal');
    carrito.markModified('impuestos');
    carrito.markModified('costoEnvio');
    carrito.markModified('total');
    
    await carrito.save();
    
    console.log(`💾 Carrito guardado. Productos: ${carrito.productos.length}, Subtotal: ${carrito.subtotal}, Total: ${carrito.total}`);

    await carrito.populate({
      path: 'productos.producto',
      select: 'nombre precio imagenes stock comerciante',
      populate: {
        path: 'comerciante',
        select: 'nombre'
      }
    });

    successResponse(res, 'Producto agregado al carrito exitosamente', carrito);

  } catch (error) {
    console.error('Error agregando producto al carrito:', error);
    errorResponse(res, 'Error interno del servidor', 500);
  }
};

// @desc    Actualizar cantidad de producto en carrito
// @route   PUT /api/cart/update/:productId o PUT /api/cart/update
// @access  Private
const actualizarCantidad = async (req, res) => {
  try {
    const { cantidad, productoId } = req.body;
    const { productId } = req.params;
    
    // Usar productId de la URL si está disponible, sino usar productoId del body
    const idProducto = productId || productoId;

    if (!idProducto) {
      return errorResponse(res, 'ID del producto es requerido', 400);
    }

    if (cantidad <= 0) {
      return errorResponse(res, 'La cantidad debe ser mayor a 0', 400);
    }

    // Verificar stock disponible
    const producto = await Product.findById(idProducto);
    if (!producto) {
      return errorResponse(res, 'Producto no encontrado', 404);
    }

    if (producto.stock < cantidad) {
      return errorResponse(res, `Stock insuficiente. Disponible: ${producto.stock}`, 400);
    }

    const carrito = await Cart.findOne({ usuario: req.usuario.id });
    if (!carrito) {
      return errorResponse(res, 'Carrito no encontrado', 404);
    }

    const productoEnCarrito = carrito.productos.find(item => 
      item.producto.toString() === idProducto
    );

    if (!productoEnCarrito) {
      return errorResponse(res, 'Producto no encontrado en el carrito', 404);
    }

    const cantidadAnterior = productoEnCarrito.cantidad;
    productoEnCarrito.cantidad = cantidad;
    
    console.log(`📝 Actualizando cantidad: ${cantidadAnterior} → ${cantidad}`);
    
    // Recalcular totales (ahora también actualiza subtotales de items)
    carrito.calcularTotales();
    
    // Marcar como modificado
    carrito.markModified('productos');
    carrito.markModified('subtotal');
    carrito.markModified('impuestos');
    carrito.markModified('total');
    
    await carrito.save();
    
    console.log(`💾 Cantidad actualizada. Subtotal item: ${productoEnCarrito.subtotal}, Subtotal total: ${carrito.subtotal}`);

    await carrito.populate({
      path: 'productos.producto',
      select: 'nombre precio imagenes stock comerciante',
      populate: {
        path: 'comerciante',
        select: 'nombre'
      }
    });

    successResponse(res, 'Cantidad actualizada exitosamente', carrito);

  } catch (error) {
    console.error('Error actualizando cantidad:', error);
    errorResponse(res, 'Error interno del servidor', 500);
  }
};

// @desc    Eliminar producto del carrito
// @route   DELETE /api/cart/remove/:productoId
// @access  Private
const eliminarDelCarrito = async (req, res) => {
  try {
    const { productoId } = req.params;

    const carrito = await Cart.findOne({ usuario: req.usuario.id });
    if (!carrito) {
      return errorResponse(res, 'Carrito no encontrado', 404);
    }

    const cantidadAnterior = carrito.productos.length;
    carrito.productos = carrito.productos.filter(item => 
      item.producto.toString() !== productoId
    );
    
    console.log(`🗑️ Producto eliminado. Productos antes: ${cantidadAnterior}, después: ${carrito.productos.length}`);

    // Recalcular totales
    carrito.calcularTotales();
    
    // Marcar como modificado para asegurar que Mongoose guarde los cambios
    carrito.markModified('productos');
    carrito.markModified('subtotal');
    carrito.markModified('impuestos');
    carrito.markModified('costoEnvio');
    carrito.markModified('total');
    
    await carrito.save();
    
    console.log(`💾 Carrito guardado. Subtotal: ${carrito.subtotal}, Total: ${carrito.total}`);

    await carrito.populate({
      path: 'productos.producto',
      select: 'nombre precio imagenes stock comerciante',
      populate: {
        path: 'comerciante',
        select: 'nombre'
      }
    });

    successResponse(res, 'Producto eliminado del carrito exitosamente', carrito);

  } catch (error) {
    console.error('Error eliminando producto del carrito:', error);
    errorResponse(res, 'Error interno del servidor', 500);
  }
};

// @desc    Limpiar carrito
// @route   DELETE /api/cart/clear
// @access  Private
const limpiarCarrito = async (req, res) => {
  try {
    const carrito = await Cart.findOne({ usuario: req.usuario.id });
    if (!carrito) {
      return errorResponse(res, 'Carrito no encontrado', 404);
    }

    carrito.productos = [];
    carrito.subtotal = 0;
    carrito.impuestos = 0;
    carrito.total = 0;
    carrito.cupones = [];

    await carrito.save();

    successResponse(res, 'Carrito limpiado exitosamente', carrito);

  } catch (error) {
    console.error('Error limpiando carrito:', error);
    errorResponse(res, 'Error interno del servidor', 500);
  }
};

// @desc    Aplicar cupón de descuento
// @route   POST /api/cart/coupon
// @access  Private
const aplicarCupon = async (req, res) => {
  try {
    const { codigo } = req.body;
    const Coupon = require('../models/Coupon');

    if (!codigo || codigo.trim().length < 3) {
      return errorResponse(res, 'Código de cupón inválido', 400);
    }

    const carrito = await Cart.findOne({ usuario: req.usuario.id })
      .populate('productos.producto', 'precio categoria comerciante');
    
    if (!carrito) {
      return errorResponse(res, 'Carrito no encontrado', 404);
    }

    if (carrito.productos.length === 0) {
      return errorResponse(res, 'El carrito está vacío', 400);
    }

    // Buscar cupón en la base de datos
    const cupon = await Coupon.findOne({ 
      codigo: codigo.toUpperCase(),
      estado: 'activo'
    }).populate(['restricciones.productos', 'restricciones.categorias', 'restricciones.comerciantes']);

    if (!cupon) {
      return errorResponse(res, 'Cupón no encontrado o inactivo', 404);
    }

    // Verificar si el cupón está vigente y disponible
    if (!cupon.estaDisponible) {
      if (cupon.estado === 'expirado') {
        return errorResponse(res, 'Este cupón ha expirado', 400);
      } else if (cupon.estado === 'agotado') {
        return errorResponse(res, 'Este cupón ha alcanzado su límite de uso', 400);
      } else {
        return errorResponse(res, 'Este cupón no está disponible', 400);
      }
    }

    // Verificar si el usuario puede usar este cupón
    if (!cupon.puedeUsarUsuario(req.usuario.id)) {
      return errorResponse(res, 'Has alcanzado el límite de uso para este cupón', 400);
    }

    // Verificar monto mínimo
    if (carrito.subtotal < cupon.montoMinimo) {
      return errorResponse(res, `Compra mínima requerida: $${cupon.montoMinimo.toLocaleString()}`, 400);
    }

    // Verificar si ya se aplicó este cupón
    const cuponAplicado = carrito.cupones.find(c => c.codigo === codigo.toUpperCase());
    if (cuponAplicado) {
      return errorResponse(res, 'Este cupón ya ha sido aplicado', 400);
    }

    // Verificar restricciones de productos/categorías/comerciantes
    if (cupon.restricciones.soloProductosEspecificos) {
      const productosValidos = carrito.productos.filter(item => {
        const producto = item.producto;
        
        // Verificar productos específicos
        if (cupon.restricciones.productos.length > 0) {
          const productoPermitido = cupon.restricciones.productos.some(p => 
            p._id.toString() === producto._id.toString()
          );
          if (productoPermitido) return true;
        }
        
        // Verificar categorías
        if (cupon.restricciones.categorias.length > 0) {
          const categoriaPermitida = cupon.restricciones.categorias.some(c => 
            c._id.toString() === producto.categoria.toString()
          );
          if (categoriaPermitida) return true;
        }
        
        // Verificar comerciantes
        if (cupon.restricciones.comerciantes.length > 0) {
          const comerciantePermitido = cupon.restricciones.comerciantes.some(c => 
            c._id.toString() === producto.comerciante.toString()
          );
          if (comerciantePermitido) return true;
        }
        
        return false;
      });

      if (productosValidos.length === 0) {
        return errorResponse(res, 'Este cupón no es válido para los productos en tu carrito', 400);
      }
    }

    // Calcular descuento
    const descuento = cupon.calcularDescuento(carrito.subtotal, carrito.productos);
    
    if (descuento <= 0) {
      return errorResponse(res, 'No se pudo aplicar descuento con este cupón', 400);
    }

    // Aplicar cupón al carrito
    carrito.cupones.push({
      cuponId: cupon._id,
      codigo: cupon.codigo,
      nombre: cupon.nombre,
      tipoDescuento: cupon.tipoDescuento,
      descuento: descuento,
      esEnvioGratis: cupon.tipoDescuento === 'envio_gratis'
    });

    await carrito.calcularTotales();
    await carrito.save();

    successResponse(res, 'Cupón aplicado exitosamente', {
      carrito,
      cuponAplicado: {
        codigo: cupon.codigo,
        nombre: cupon.nombre,
        descuento: descuento,
        tipoDescuento: cupon.tipoDescuento
      }
    });

  } catch (error) {
    console.error('Error aplicando cupón:', error);
    errorResponse(res, 'Error interno del servidor', 500);
  }
};

// @desc    Remover cupón del carrito
// @route   DELETE /api/cart/coupon/:codigo
// @access  Private
const removerCupon = async (req, res) => {
  try {
    const { codigo } = req.params;

    const carrito = await Cart.findOne({ usuario: req.usuario.id });
    if (!carrito) {
      return errorResponse(res, 'Carrito no encontrado', 404);
    }

    const indiceCupon = carrito.cupones.findIndex(c => c.codigo === codigo.toUpperCase());
    if (indiceCupon === -1) {
      return errorResponse(res, 'Cupón no encontrado en el carrito', 404);
    }

    carrito.cupones.splice(indiceCupon, 1);
    await carrito.calcularTotales();
    await carrito.save();

    successResponse(res, 'Cupón removido exitosamente', carrito);

  } catch (error) {
    console.error('Error removiendo cupón:', error);
    errorResponse(res, 'Error interno del servidor', 500);
  }
};

// @desc    Obtener cupones disponibles para el usuario
// @route   GET /api/cart/available-coupons
// @access  Private
const obtenerCuponesDisponibles = async (req, res) => {
  try {
    const Coupon = require('../models/Coupon');
    
    const carrito = await Cart.findOne({ usuario: req.usuario.id })
      .populate('productos.producto', 'categoria comerciante');

    if (!carrito || carrito.productos.length === 0) {
      return successResponse(res, 'Cupones disponibles obtenidos', []);
    }

    // Obtener cupones públicos disponibles
    const cupones = await Coupon.find({
      estado: 'activo',
      'configuracion.mostrarEnListaPublica': true,
      fechaInicio: { $lte: new Date() },
      fechaVencimiento: { $gte: new Date() },
      $or: [
        { usoMaximo: null },
        { $expr: { $lt: ['$usoActual', '$usoMaximo'] } }
      ]
    }).select('codigo nombre descripcion tipoDescuento valor montoMinimo restricciones');

    // Filtrar cupones que el usuario puede usar
    const cuponesDisponibles = cupones.filter(cupon => {
      // Verificar si puede usar el cupón
      if (!cupon.puedeUsarUsuario(req.usuario.id)) return false;
      
      // Verificar monto mínimo
      if (carrito.subtotal < cupon.montoMinimo) return false;
      
      // Verificar si ya está aplicado
      const yaAplicado = carrito.cupones.some(c => c.codigo === cupon.codigo);
      if (yaAplicado) return false;
      
      return true;
    });

    successResponse(res, 'Cupones disponibles obtenidos exitosamente', cuponesDisponibles);

  } catch (error) {
    console.error('Error obteniendo cupones disponibles:', error);
    errorResponse(res, 'Error interno del servidor', 500);
  }
};

// @desc    Recalcular totales del carrito (útil después de cambios en lógica de cálculo)
// @route   POST /api/cart/recalculate
// @access  Private
const recalcularCarrito = async (req, res) => {
  try {
    let carrito = await Cart.findOne({ usuario: req.usuario.id });
    
    if (!carrito) {
      return errorResponse(res, 'Carrito no encontrado', 404);
    }

    // Forzar recálculo de totales
    carrito.calcularTotales();
    await carrito.save();

    // Repoblar con los datos de productos
    await carrito.populate({
      path: 'productos.producto',
      select: 'nombre precio imagenes stock estado comerciante',
      populate: {
        path: 'comerciante',
        select: 'nombre'
      }
    });

    successResponse(res, 'Carrito recalculado exitosamente', carrito);

  } catch (error) {
    console.error('Error recalculando carrito:', error);
    errorResponse(res, 'Error interno del servidor', 500);
  }
};

module.exports = {
  obtenerCarrito,
  agregarAlCarrito,
  actualizarCantidad,
  eliminarDelCarrito,
  limpiarCarrito,
  aplicarCupon,
  removerCupon,
  obtenerCuponesDisponibles,
  recalcularCarrito
}; 