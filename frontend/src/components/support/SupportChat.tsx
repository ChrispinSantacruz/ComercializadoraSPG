import React, { useState, useEffect, useRef } from 'react';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

const SupportChat: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const predefinedResponses = {
    // Saludos
    greeting: [
      "¡Hola! 👋 Soy Sara, tu asistente virtual de SPG. ¿En qué puedo ayudarte hoy?",
      "¡Bienvenido a SPG! 😊 Estoy aquí para resolver todas tus dudas.",
      "¡Hola! ¿Cómo puedo asistirte hoy? Estoy lista para ayudarte."
    ],
    
    // Productos
    products: [
      "📦 Tenemos más de 10,000 productos en diferentes categorías. ¿Hay algo específico que buscas?",
      "Puedes explorar todos nuestros productos en la sección 'Productos'. ¿Te interesa alguna categoría en particular?",
      "Nuestro catálogo se actualiza diariamente. ¿Qué tipo de producto necesitas?"
    ],
    
    // Envíos
    shipping: [
      "🚚 Hacemos envíos a toda Colombia. El tiempo de entrega varía entre 1-5 días hábiles dependiendo de tu ubicación.",
      "Nuestros envíos son rápidos y seguros. ¿A qué ciudad necesitas que enviemos?",
      "El costo de envío se calcula automáticamente en el checkout según tu dirección."
    ],
    
    // Pagos
    payments: [
      "💳 Aceptamos tarjetas de crédito, débito, PSE y otros métodos de pago seguros.",
      "Todos los pagos están protegidos con encriptación SSL. Tu información está segura con nosotros.",
      "¿Tienes algún problema específico con el pago? Puedo ayudarte a resolverlo."
    ],
    
    // Cuenta
    account: [
      "👤 Para crear una cuenta, solo haz clic en 'Registrarse' y sigue los pasos. ¡Es muy fácil!",
      "¿Problemas con tu cuenta? Puedo ayudarte con login, recuperación de contraseña y más.",
      "Tu cuenta te permite hacer seguimiento de pedidos, guardar favoritos y mucho más."
    ],
    
    // Devoluciones
    returns: [
      "🔄 Tienes 30 días para devoluciones desde la fecha de entrega. El producto debe estar en condiciones originales.",
      "Para iniciar una devolución, ve a 'Mis Pedidos' y selecciona el producto que deseas devolver.",
      "¿Hay algún problema con tu pedido? Cuéntame para ayudarte mejor."
    ],
    
    // Comerciantes
    merchants: [
      "🏪 ¡Nos encanta que quieras vender con nosotros! Regístrate como comerciante y empieza a vender hoy mismo.",
      "Los comerciantes en SPG tienen acceso a herramientas de gestión, analytics y soporte especializado.",
      "¿Quieres ser parte de nuestra familia de comerciantes? Te ayudo con el proceso."
    ],
    
    // Soporte técnico
    technical: [
      "🔧 Para problemas técnicos, intenta refrescar la página o borrar caché del navegador.",
      "¿La página no carga bien? Asegúrate de tener una conexión estable a internet.",
      "Si el problema persiste, puedes contactar a nuestro equipo técnico: soporte@spg.com"
    ],
    
    // Despedidas
    goodbye: [
      "¡Ha sido un placer ayudarte! 😊 Si necesitas algo más, estaré aquí.",
      "¡Que tengas un excelente día! No dudes en escribirme si tienes más preguntas.",
      "¡Gracias por elegir SPG! Estoy aquí cuando me necesites. 👋"
    ],
    
    // Default
    default: [
      "Interesante pregunta. 🤔 Déjame conectarte con un especialista: soporte@spg.com",
      "Hmm, no estoy segura sobre eso. ¿Podrías ser más específico?",
      "Para consultas específicas, nuestro equipo humano puede ayudarte mejor: soporte@spg.com"
    ]
  };

  const quickActions = [
    { text: "📦 Ver productos", action: "products" },
    { text: "🚚 Info de envíos", action: "shipping" },
    { text: "💳 Métodos de pago", action: "payments" },
    { text: "🏪 Vender aquí", action: "merchants" }
  ];

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      addBotMessage(getRandomResponse('greeting'));
    }
  }, [isOpen]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const getRandomResponse = (category: keyof typeof predefinedResponses): string => {
    const responses = predefinedResponses[category];
    return responses[Math.floor(Math.random() * responses.length)];
  };

  const categorizeMessage = (message: string): keyof typeof predefinedResponses => {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('hola') || lowerMessage.includes('hi') || lowerMessage.includes('buenos')) {
      return 'greeting';
    }
    if (lowerMessage.includes('producto') || lowerMessage.includes('catalogo') || lowerMessage.includes('buscar')) {
      return 'products';
    }
    if (lowerMessage.includes('envio') || lowerMessage.includes('entrega') || lowerMessage.includes('shipping')) {
      return 'shipping';
    }
    if (lowerMessage.includes('pago') || lowerMessage.includes('tarjeta') || lowerMessage.includes('pse')) {
      return 'payments';
    }
    if (lowerMessage.includes('cuenta') || lowerMessage.includes('registro') || lowerMessage.includes('login')) {
      return 'account';
    }
    if (lowerMessage.includes('devol') || lowerMessage.includes('reembolso') || lowerMessage.includes('cambio')) {
      return 'returns';
    }
    if (lowerMessage.includes('vender') || lowerMessage.includes('comerciante') || lowerMessage.includes('negocio')) {
      return 'merchants';
    }
    if (lowerMessage.includes('error') || lowerMessage.includes('problema') || lowerMessage.includes('bug')) {
      return 'technical';
    }
    if (lowerMessage.includes('gracias') || lowerMessage.includes('adios') || lowerMessage.includes('bye')) {
      return 'goodbye';
    }
    
    return 'default';
  };

  const addBotMessage = (text: string) => {
    const message: Message = {
      id: Date.now().toString(),
      text,
      isUser: false,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, message]);
  };

  const addUserMessage = (text: string) => {
    const message: Message = {
      id: Date.now().toString(),
      text,
      isUser: true,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, message]);
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage = inputValue.trim();
    addUserMessage(userMessage);
    setInputValue('');
    setIsTyping(true);

    // Simular tiempo de escritura
    setTimeout(() => {
      const category = categorizeMessage(userMessage);
      const response = getRandomResponse(category);
      addBotMessage(response);
      setIsTyping(false);
    }, 1000 + Math.random() * 2000); // 1-3 segundos
  };

  const handleQuickAction = (action: string) => {
    const response = getRandomResponse(action as keyof typeof predefinedResponses);
    addBotMessage(response);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('es-CO', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <>
      {/* Chat Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 z-50 w-16 h-16 rounded-full shadow-lg flex items-center justify-center text-white text-2xl transition-all duration-300 hover:scale-110 ${
          isOpen ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-500 hover:bg-blue-600'
        }`}
      >
        {isOpen ? '✕' : '💬'}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-40 w-96 h-[32rem] bg-white rounded-2xl shadow-2xl border-2 border-gray-200 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-500 via-purple-600 to-blue-700 text-white p-6">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-2xl shadow-lg">
                  👩‍💼
                </div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white"></div>
              </div>
              <div>
                <h3 className="font-bold text-lg">Sara - Asistente Virtual</h3>
                <p className="text-sm opacity-90 flex items-center">
                  <span className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></span>
                  En línea • Respuesta inmediata
                </p>
              </div>
            </div>
            <div className="mt-3 bg-white bg-opacity-20 rounded-lg p-2">
              <p className="text-sm">¡Hola! Estoy aquí para ayudarte con cualquier duda 🚀</p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 h-72 overflow-y-auto p-4 bg-gradient-to-b from-gray-50 to-white">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`mb-4 ${message.isUser ? 'text-right' : 'text-left'}`}
              >
                <div
                  className={`inline-block max-w-xs px-3 py-2 rounded-lg ${
                    message.isUser
                      ? 'bg-blue-500 text-white'
                      : 'bg-white text-gray-800 shadow-sm'
                  }`}
                >
                  <p className="text-sm">{message.text}</p>
                  <p className={`text-xs mt-1 ${
                    message.isUser ? 'text-blue-100' : 'text-gray-500'
                  }`}>
                    {formatTime(message.timestamp)}
                  </p>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="text-left mb-4">
                <div className="inline-block bg-white px-3 py-2 rounded-lg shadow-sm">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Actions */}
          {messages.length <= 1 && (
            <div className="p-2 border-t bg-white">
              <p className="text-xs text-gray-500 mb-2">Acciones rápidas:</p>
              <div className="grid grid-cols-2 gap-1">
                {quickActions.map((action, index) => (
                  <button
                    key={index}
                    onClick={() => handleQuickAction(action.action)}
                    className="text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded text-left transition-colors"
                  >
                    {action.text}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="p-4 border-t bg-white">
            <div className="flex space-x-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Escribe tu mensaje..."
                className="flex-1 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isTyping}
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isTyping}
                className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white px-4 py-2 rounded-lg text-sm transition-colors"
              >
                ➤
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-2 text-center">
              Powered by SPG AI • Para soporte humano: soporte@spg.com
            </p>
          </div>
        </div>
      )}
    </>
  );
};

export default SupportChat; 