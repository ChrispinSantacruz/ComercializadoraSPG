const Notification = require('../models/Notification');
const emailService = require('../utils/email');

class NotificationService {
  // Crear notificación
  async createNotification(data) {
    try {
      const notification = new Notification(data);
      await notification.save();
      
      // Si está habilitado el email, enviar notificación por correo
      if (data.channels.includes('email') && data.recipientEmail) {
        await this.sendEmailNotification(notification);
      }
      
      return notification;
    } catch (error) {
      console.error('Error creando notificación:', error);
      throw error;
    }
  }

  // Enviar notificación por email
  async sendEmailNotification(notification) {
    try {
      const emailData = {
        to: notification.recipientEmail,
        subject: notification.title,
        template: 'notification',
        context: {
          title: notification.title,
          message: notification.message,
          actionUrl: notification.actionUrl,
          userName: notification.recipientName
        }
      };
      
      await emailService.sendEmail(emailData);
    } catch (error) {
      console.error('Error enviando email de notificación:', error);
    }
  }

  // Notificar nueva orden
  async notifyNewOrder(order, user) {
    const notificationData = {
      recipient: user._id,
      recipientEmail: user.email,
      recipientName: user.nombre,
      type: 'order',
      title: 'Nueva Orden Creada',
      message: `Tu orden #${order.numeroOrden} ha sido creada exitosamente por un total de $${order.total}`,
      data: { orderId: order._id, orderNumber: order.numeroOrden },
      channels: ['email', 'push'],
      actionUrl: `/orders/${order._id}`
    };

    return await this.createNotification(notificationData);
  }

  // Notificar cambio de estado de orden
  async notifyOrderStatusChange(order, user, newStatus) {
    const statusMessages = {
      'confirmado': 'Tu orden ha sido confirmada y está siendo preparada',
      'enviado': 'Tu orden ha sido enviada y está en camino',
      'entregado': 'Tu orden ha sido entregada exitosamente',
      'cancelado': 'Tu orden ha sido cancelada'
    };

    const notificationData = {
      recipient: user._id,
      recipientEmail: user.email,
      recipientName: user.nombre,
      type: 'order_status',
      title: `Orden ${newStatus.charAt(0).toUpperCase() + newStatus.slice(1)}`,
      message: statusMessages[newStatus] || `El estado de tu orden ha cambiado a ${newStatus}`,
      data: { orderId: order._id, orderNumber: order.numeroOrden, status: newStatus },
      channels: ['email', 'push'],
      actionUrl: `/orders/${order._id}`
    };

    return await this.createNotification(notificationData);
  }

  // Notificar producto aprobado
  async notifyProductApproved(product, merchant) {
    const notificationData = {
      recipient: merchant._id,
      recipientEmail: merchant.email,
      recipientName: merchant.nombre,
      type: 'product_approval',
      title: 'Producto Aprobado',
      message: `Tu producto "${product.nombre}" ha sido aprobado y ya está visible en la tienda`,
      data: { productId: product._id, productName: product.nombre },
      channels: ['email', 'push'],
      actionUrl: `/products/${product._id}`
    };

    return await this.createNotification(notificationData);
  }

  // Notificar producto rechazado
  async notifyProductRejected(product, merchant, reason) {
    const notificationData = {
      recipient: merchant._id,
      recipientEmail: merchant.email,
      recipientName: merchant.nombre,
      type: 'product_rejection',
      title: 'Producto Rechazado',
      message: `Tu producto "${product.nombre}" ha sido rechazado. Motivo: ${reason}`,
      data: { productId: product._id, productName: product.nombre, reason },
      channels: ['email', 'push'],
      actionUrl: `/commerce/products/${product._id}`
    };

    return await this.createNotification(notificationData);
  }

  // Notificar nueva reseña
  async notifyNewReview(review, product, merchant) {
    const notificationData = {
      recipient: merchant._id,
      recipientEmail: merchant.email,
      recipientName: merchant.nombre,
      type: 'new_review',
      title: 'Nueva Reseña Recibida',
      message: `Has recibido una nueva reseña de ${review.rating} estrellas en tu producto "${product.nombre}"`,
      data: { 
        reviewId: review._id, 
        productId: product._id, 
        productName: product.nombre,
        rating: review.rating 
      },
      channels: ['email', 'push'],
      actionUrl: `/commerce/reviews/${review._id}`
    };

    return await this.createNotification(notificationData);
  }

  // Obtener notificaciones del usuario
  async getUserNotifications(userId, options = {}) {
    try {
      const { page = 1, limit = 20, unreadOnly = false } = options;
      
      const query = { recipient: userId };
      if (unreadOnly) {
        query.read = false;
      }

      const notifications = await Notification.find(query)
        .sort({ createdAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .exec();

      const total = await Notification.countDocuments(query);

      return {
        notifications,
        totalpages: Math.ceil(total / limit),
        currentPage: page,
        total
      };
    } catch (error) {
      console.error('Error obteniendo notificaciones:', error);
      throw error;
    }
  }

  // Marcar notificación como leída
  async markAsRead(notificationId, userId) {
    try {
      const notification = await Notification.findOneAndUpdate(
        { _id: notificationId, recipient: userId },
        { read: true, readAt: new Date() },
        { new: true }
      );

      return notification;
    } catch (error) {
      console.error('Error marcando notificación como leída:', error);
      throw error;
    }
  }

  // Marcar todas las notificaciones como leídas
  async markAllAsRead(userId) {
    try {
      const result = await Notification.updateMany(
        { recipient: userId, read: false },
        { read: true, readAt: new Date() }
      );

      return result;
    } catch (error) {
      console.error('Error marcando todas las notificaciones como leídas:', error);
      throw error;
    }
  }

  // Eliminar notificación
  async deleteNotification(notificationId, userId) {
    try {
      const notification = await Notification.findOneAndDelete({
        _id: notificationId,
        recipient: userId
      });

      return notification;
    } catch (error) {
      console.error('Error eliminando notificación:', error);
      throw error;
    }
  }

  // Obtener estadísticas de notificaciones
  async getNotificationStats(userId) {
    try {
      const total = await Notification.countDocuments({ recipient: userId });
      const unread = await Notification.countDocuments({ recipient: userId, read: false });
      
      return {
        total,
        unread,
        read: total - unread
      };
    } catch (error) {
      console.error('Error obteniendo estadísticas de notificaciones:', error);
      throw error;
    }
  }
}

module.exports = new NotificationService(); 