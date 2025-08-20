const Notification = require('../models/Notification');
const { enviarEmailProductoAprobado, enviarEmailProductoRechazado, enviarEmailNuevoPedido } = require('../utils/email');

class NotificationService {
  
  // Crear notificación general
  static async crearNotificacion(datosNotificacion) {
    try {
      const notificacion = new Notification(datosNotificacion);
      await notificacion.save();
      
      // Enviar por los canales habilitados
      await this.enviarPorCanales(notificacion);
      
      return notificacion;
    } catch (error) {
      console.error('Error creando notificación:', error);
      throw error;
    }
  }

  // Notificar aprobación de producto
  static async notificarProductoAprobado(comerciante, producto) {
    try {
      const notificacion = await this.crearNotificacion({
        usuario: comerciante._id,
        tipo: 'producto_aprobado',
        titulo: '¡Producto aprobado!',
        mensaje: `Tu producto "${producto.nombre}" ha sido aprobado y ya está visible en la tienda.`,
        datos: {
          elementoId: producto._id,
          tipoElemento: 'producto',
          url: `/comerciante/productos/${producto.slug}`,
          accion: 'ver_producto'
        },
        prioridad: 'alta',
        canales: {
          enApp: true,
          email: true
        }
      });

      // Enviar email específico
      if (notificacion.canales.email) {
        await enviarEmailProductoAprobado(
          comerciante.email,
          comerciante.nombre,
          producto.nombre
        );
        await notificacion.marcarEnviado('email');
      }

      return notificacion;
    } catch (error) {
      console.error('Error notificando producto aprobado:', error);
      throw error;
    }
  }

  // Notificar rechazo de producto
  static async notificarProductoRechazado(comerciante, producto, motivo) {
    try {
      const notificacion = await this.crearNotificacion({
        usuario: comerciante._id,
        tipo: 'producto_rechazado',
        titulo: 'Producto necesita revisión',
        mensaje: `Tu producto "${producto.nombre}" necesita modificaciones. Motivo: ${motivo}`,
        datos: {
          elementoId: producto._id,
          tipoElemento: 'producto',
          url: `/comerciante/productos/${producto._id}/editar`,
          accion: 'editar_producto',
          datosExtra: { motivo }
        },
        prioridad: 'alta',
        canales: {
          enApp: true,
          email: true
        }
      });

      // Enviar email específico
      if (notificacion.canales.email) {
        await enviarEmailProductoRechazado(
          comerciante.email,
          comerciante.nombre,
          producto.nombre,
          motivo
        );
        await notificacion.marcarEnviado('email');
      }

      return notificacion;
    } catch (error) {
      console.error('Error notificando producto rechazado:', error);
      throw error;
    }
  }

  // Notificar nueva venta
  static async notificarNuevaVenta(comerciante, pedido) {
    try {
      // Obtener solo productos del comerciante
      const productosVendidos = pedido.productos.filter(
        p => p.comerciante.toString() === comerciante._id.toString()
      );
      
      const totalVenta = productosVendidos.reduce((total, p) => total + p.subtotal, 0);

      const notificacion = await this.crearNotificacion({
        usuario: comerciante._id,
        tipo: 'nueva_venta',
        titulo: '¡Nueva venta realizada!',
        mensaje: `Has vendido ${productosVendidos.length} producto(s) por un total de $${totalVenta.toLocaleString()} COP`,
        datos: {
          elementoId: pedido._id,
          tipoElemento: 'pedido',
          url: `/comerciante/pedidos/${pedido.numeroOrden}`,
          accion: 'ver_pedido',
          datosExtra: {
            numeroOrden: pedido.numeroOrden,
            cantidadProductos: productosVendidos.length,
            total: totalVenta
          }
        },
        prioridad: 'alta',
        canales: {
          enApp: true,
          email: true
        }
      });

      return notificacion;
    } catch (error) {
      console.error('Error notificando nueva venta:', error);
      throw error;
    }
  }

  // Notificar confirmación de pedido al cliente
  static async notificarPedidoConfirmado(cliente, pedido) {
    try {
      const notificacion = await this.crearNotificacion({
        usuario: cliente._id,
        tipo: 'pedido_confirmado',
        titulo: 'Pedido confirmado',
        mensaje: `Tu pedido #${pedido.numeroOrden} ha sido confirmado y está siendo preparado.`,
        datos: {
          elementoId: pedido._id,
          tipoElemento: 'pedido',
          url: `/cliente/pedidos/${pedido.numeroOrden}`,
          accion: 'ver_pedido'
        },
        prioridad: 'media'
      });

      return notificacion;
    } catch (error) {
      console.error('Error notificando pedido confirmado:', error);
      throw error;
    }
  }

  // Notificar envío de pedido
  static async notificarPedidoEnviado(cliente, pedido) {
    try {
      const notificacion = await this.crearNotificacion({
        usuario: cliente._id,
        tipo: 'pedido_enviado',
        titulo: 'Pedido enviado',
        mensaje: `Tu pedido #${pedido.numeroOrden} ha sido enviado. Número de guía: ${pedido.envio.numeroGuia}`,
        datos: {
          elementoId: pedido._id,
          tipoElemento: 'pedido',
          url: `/cliente/pedidos/${pedido.numeroOrden}`,
          accion: 'rastrear_pedido',
          datosExtra: {
            numeroGuia: pedido.envio.numeroGuia,
            empresa: pedido.envio.empresa
          }
        },
        prioridad: 'alta'
      });

      return notificacion;
    } catch (error) {
      console.error('Error notificando pedido enviado:', error);
      throw error;
    }
  }

  // Notificar entrega de pedido
  static async notificarPedidoEntregado(cliente, pedido) {
    try {
      const notificacion = await this.crearNotificacion({
        usuario: cliente._id,
        tipo: 'pedido_entregado',
        titulo: '¡Pedido entregado!',
        mensaje: `Tu pedido #${pedido.numeroOrden} ha sido entregado exitosamente. ¡Gracias por tu compra!`,
        datos: {
          elementoId: pedido._id,
          tipoElemento: 'pedido',
          url: `/cliente/pedidos/${pedido.numeroOrden}`,
          accion: 'calificar_productos'
        },
        prioridad: 'media'
      });

      return notificacion;
    } catch (error) {
      console.error('Error notificando pedido entregado:', error);
      throw error;
    }
  }

  // Notificar nueva reseña al comerciante
  static async notificarNuevaReseña(comerciante, producto, reseña, cliente) {
    try {
      const notificacion = await this.crearNotificacion({
        usuario: comerciante._id,
        tipo: 'nueva_reseña',
        titulo: 'Nueva reseña recibida',
        mensaje: `${cliente.nombre} dejó una reseña de ${reseña.calificacion} estrellas en "${producto.nombre}"`,
        datos: {
          elementoId: reseña._id,
          tipoElemento: 'reseña',
          url: `/comerciante/productos/${producto.slug}#reseñas`,
          accion: 'ver_reseña',
          datosExtra: {
            calificacion: reseña.calificacion,
            nombreCliente: cliente.nombre
          }
        },
        prioridad: 'media'
      });

      return notificacion;
    } catch (error) {
      console.error('Error notificando nueva reseña:', error);
      throw error;
    }
  }

  // Notificar stock bajo
  static async notificarStockBajo(comerciante, producto) {
    try {
      const notificacion = await this.crearNotificacion({
        usuario: comerciante._id,
        tipo: 'stock_bajo',
        titulo: 'Stock bajo en producto',
        mensaje: `El producto "${producto.nombre}" tiene solo ${producto.stock} unidades disponibles.`,
        datos: {
          elementoId: producto._id,
          tipoElemento: 'producto',
          url: `/comerciante/productos/${producto._id}/editar`,
          accion: 'actualizar_stock',
          datosExtra: {
            stockActual: producto.stock,
            stockMinimo: producto.stockMinimo
          }
        },
        prioridad: 'media'
      });

      return notificacion;
    } catch (error) {
      console.error('Error notificando stock bajo:', error);
      throw error;
    }
  }

  // Enviar notificación por canales habilitados
  static async enviarPorCanales(notificacion) {
    try {
      // Marcar como enviado en la app (siempre)
      await notificacion.marcarEnviado('enApp');

      // Aquí se pueden agregar más canales como SMS, Push notifications, etc.
      
    } catch (error) {
      console.error('Error enviando por canales:', error);
    }
  }

  // Obtener notificaciones de un usuario
  static async obtenerNotificacionesUsuario(usuarioId, filtros = {}) {
    try {
      const query = { usuario: usuarioId };
      
      if (filtros.estado) {
        query.estado = filtros.estado;
      }
      
      if (filtros.tipo) {
        query.tipo = filtros.tipo;
      }

      const notificaciones = await Notification.find(query)
        .sort({ fechaCreacion: -1 })
        .limit(filtros.limite || 50);

      return notificaciones;
    } catch (error) {
      console.error('Error obteniendo notificaciones:', error);
      throw error;
    }
  }

  // Marcar notificaciones como leídas
  static async marcarComoleidas(usuarioId, notificacionIds = null) {
    try {
      const query = { 
        usuario: usuarioId,
        estado: 'no_leida'
      };
      
      if (notificacionIds) {
        query._id = { $in: notificacionIds };
      }

      const resultado = await Notification.updateMany(
        query,
        { 
          estado: 'leida',
          fechaLeida: new Date()
        }
      );

      return resultado;
    } catch (error) {
      console.error('Error marcando notificaciones como leídas:', error);
      throw error;
    }
  }

  // Contar notificaciones no leídas
  static async contarNoLeidas(usuarioId) {
    try {
      return await Notification.contarNoLeidas(usuarioId);
    } catch (error) {
      console.error('Error contando notificaciones no leídas:', error);
      throw error;
    }
  }

  // Limpiar notificaciones antiguas
  static async limpiarNotificacionesAntiguas(diasAntiguedad = 30) {
    try {
      const fechaLimite = new Date();
      fechaLimite.setDate(fechaLimite.getDate() - diasAntiguedad);

      const resultado = await Notification.deleteMany({
        fechaCreacion: { $lt: fechaLimite },
        estado: { $in: ['leida', 'archivada'] }
      });

      console.log(`Notificaciones limpiadas: ${resultado.deletedCount}`);
      return resultado;
    } catch (error) {
      console.error('Error limpiando notificaciones antiguas:', error);
      throw error;
    }
  }
}

module.exports = NotificationService; 