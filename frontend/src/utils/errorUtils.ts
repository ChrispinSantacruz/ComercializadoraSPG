/**
 * Utilidades para manejo de errores con mensajes amigables para el usuario
 */

export interface ErrorMapping {
  keywords: string[];
  message: string;
}

const ERROR_MAPPINGS: ErrorMapping[] = [
  // Errores de autenticación
  {
    keywords: ['credenciales', 'incorrecta', 'invalid credentials', 'unauthorized'],
    message: 'Email o contraseña incorrectos. Por favor, verifica tus datos.'
  },
  {
    keywords: ['cuenta no verificada', 'email not verified', 'verify email'],
    message: 'Tu cuenta aún no ha sido verificada. Revisa tu correo electrónico.'
  },
  {
    keywords: ['cuenta bloqueada', 'account suspended', 'blocked'],
    message: 'Tu cuenta ha sido suspendida. Contacta con soporte para más información.'
  },
  
  // Errores de red
  {
    keywords: ['network', 'red', 'conexión', 'econnaborted', 'timeout'],
    message: 'Problema de conexión. Verifica tu internet y vuelve a intentar.'
  },
  {
    keywords: ['econnrefused', 'server', 'servidor no disponible'],
    message: 'No se pudo conectar con el servidor. Por favor, intenta más tarde.'
  },
  
  // Errores de validación
  {
    keywords: ['id inválido', 'invalid id', 'invalid objectid'],
    message: 'El enlace no es válido. Por favor, verifica la URL.'
  },
  {
    keywords: ['no encontrado', 'not found', '404'],
    message: 'El recurso solicitado no existe o ha sido eliminado.'
  },
  {
    keywords: ['datos inválidos', 'validation', 'invalid data'],
    message: 'Los datos ingresados no son válidos. Por favor, revisa e intenta nuevamente.'
  },
  
  // Errores de permisos
  {
    keywords: ['no autorizado', 'forbidden', '403', 'sin permiso'],
    message: 'No tienes permisos para realizar esta acción.'
  },
  
  // Errores de stock
  {
    keywords: ['sin stock', 'out of stock', 'agotado'],
    message: 'Este producto no tiene stock disponible en este momento.'
  },
  {
    keywords: ['stock insuficiente', 'insufficient stock'],
    message: 'No hay suficiente stock para la cantidad solicitada.'
  },
  
  // Errores de pago
  {
    keywords: ['pago rechazado', 'payment declined', 'transacción fallida'],
    message: 'El pago fue rechazado. Verifica tu método de pago e intenta nuevamente.'
  },
  {
    keywords: ['tarjeta inválida', 'invalid card'],
    message: 'Los datos de la tarjeta no son válidos. Por favor, verifícalos.'
  },
  
  // Errores genéricos de Firebase
  {
    keywords: ['auth/popup-blocked'],
    message: 'Por favor, permite las ventanas emergentes para este sitio.'
  },
  {
    keywords: ['auth/too-many-requests'],
    message: 'Demasiados intentos. Por favor, espera unos minutos.'
  },
  {
    keywords: ['auth/account-exists-with-different-credential'],
    message: 'Ya existe una cuenta con este correo usando otro método de inicio de sesión.'
  }
];

/**
 * Convierte un error técnico en un mensaje amigable para el usuario
 */
export function getFriendlyErrorMessage(error: Error | string | unknown): string {
  let errorMessage = '';
  
  // Obtener el mensaje del error
  if (error instanceof Error) {
    errorMessage = error.message;
  } else if (typeof error === 'string') {
    errorMessage = error;
  } else if (error && typeof error === 'object' && 'message' in error) {
    errorMessage = String((error as any).message);
  } else {
    return 'Ha ocurrido un error inesperado. Por favor, intenta nuevamente.';
  }
  
  const lowerMessage = errorMessage.toLowerCase();
  
  // Buscar coincidencias con mensajes conocidos
  for (const mapping of ERROR_MAPPINGS) {
    if (mapping.keywords.some(keyword => lowerMessage.includes(keyword.toLowerCase()))) {
      return mapping.message;
    }
  }
  
  // Si el mensaje original es corto y legible, usarlo
  if (errorMessage.length < 100 && !errorMessage.includes('Error:') && !errorMessage.includes('Exception')) {
    return errorMessage;
  }
  
  // Mensaje por defecto
  return 'Ha ocurrido un error. Por favor, intenta nuevamente o contacta con soporte.';
}

/**
 * Determina si un error es recuperable (puede intentarse de nuevo)
 */
export function isRecoverableError(error: Error | string | unknown): boolean {
  const message = getFriendlyErrorMessage(error).toLowerCase();
  
  // Errores que NO son recuperables (no tiene sentido reintentar)
  const nonRecoverableKeywords = [
    'no encontrado',
    'no existe',
    'eliminado',
    'bloqueada',
    'suspendida',
    'sin permiso',
    'no autorizado'
  ];
  
  return !nonRecoverableKeywords.some(keyword => message.includes(keyword));
}

/**
 * Sugiere una acción basada en el tipo de error
 */
export function getSuggestedAction(error: Error | string | unknown): string | null {
  const message = getFriendlyErrorMessage(error).toLowerCase();
  
  if (message.includes('conexión') || message.includes('red')) {
    return 'Revisa tu conexión a internet';
  }
  
  if (message.includes('servidor')) {
    return 'Intenta nuevamente en unos minutos';
  }
  
  if (message.includes('credenciales') || message.includes('contraseña')) {
    return '¿Olvidaste tu contraseña?';
  }
  
  if (message.includes('verificada')) {
    return 'Revisa tu correo electrónico';
  }
  
  if (message.includes('no encontrado') || message.includes('no existe')) {
    return 'Volver al inicio';
  }
  
  return null;
}

/**
 * Clase para errores personalizados de la aplicación
 */
export class AppError extends Error {
  constructor(
    message: string,
    public code?: string,
    public statusCode?: number,
    public isRecoverable: boolean = true
  ) {
    super(message);
    this.name = 'AppError';
  }
}

/**
 * Maneja errores de axios y devuelve un error amigable
 */
export function handleAxiosError(error: any): AppError {
  if (error.response) {
    // Error con respuesta del servidor
    const statusCode = error.response.status;
    const data = error.response.data;
    const message = data?.mensaje || data?.message || error.message;
    
    return new AppError(
      getFriendlyErrorMessage(message),
      data?.codigo,
      statusCode,
      isRecoverableError(message)
    );
  } else if (error.request) {
    // Error de red (no hubo respuesta)
    return new AppError(
      'No se pudo conectar al servidor. Verifica tu conexión a internet.',
      'NETWORK_ERROR',
      0,
      true
    );
  } else {
    // Error al configurar la petición
    return new AppError(
      getFriendlyErrorMessage(error.message),
      'REQUEST_ERROR',
      0,
      true
    );
  }
}
