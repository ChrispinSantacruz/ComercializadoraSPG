import React, { useState, useEffect } from 'react';
import { Cart, Address, PaymentMethod, OrderForm } from '../../types';
import { cartService } from '../../services/cartService';
import addressService from '../../services/addressService';
import { paymentService } from '../../services/paymentService';
import orderService from '../../services/orderService';
import AddressForm from '../../components/forms/AddressForm';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { useNotificationCard } from '../../hooks/useNotificationCard';

// Interfaz para los datos de pago
interface PaymentData {
  tarjeta: {
    numero: string;
    nombre: string;
    fechaVencimiento: string;
    cvv: string;
    tipoDocumento: string;
    numeroDocumento: string;
  };
  pse: {
    banco: string;
    tipoPersona: string;
    tipoDocumento: string;
    numeroDocumento: string;
    email: string;
  };
  nequi: {
    telefono: string;
    pin: string;
  };
}

const CheckoutPage: React.FC = () => {
  const { showSuccess, showError, NotificationCardContainer } = useNotificationCard();
  const [cart, setCart] = useState<Cart | null>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  const [currentStep, setCurrentStep] = useState(1);
  const [selectedAddress, setSelectedAddress] = useState<string>('');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('');
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [paymentData, setPaymentData] = useState<PaymentData>({
    tarjeta: {
      numero: '',
      nombre: '',
      fechaVencimiento: '',
      cvv: '',
      tipoDocumento: 'cedula',
      numeroDocumento: ''
    },
    pse: {
      banco: '',
      tipoPersona: 'natural',
      tipoDocumento: 'cedula',
      numeroDocumento: '',
      email: ''
    },
    nequi: {
      telefono: '',
      pin: ''
    }
  });
  const [orderData, setOrderData] = useState<Partial<OrderForm>>({
    productos: [],
    direccionEntrega: '',
    metodoPago: { tipo: 'PSE', datos: {} },
    usarDireccionGuardada: true,
    comentarios: ''
  });

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [cartData, addressesData] = await Promise.all([
        cartService.getCart(),
        addressService.getAddresses()
      ]);
      
      setCart(cartData);
      setAddresses(addressesData);
      
      // Métodos de pago simulados para ambiente de pruebas
      const simulatedPaymentMethods = [
        {
          tipo: 'tarjeta_credito' as const,
          nombre: 'Tarjeta de Crédito',
          descripcion: 'Pago seguro con tarjeta Visa/Mastercard (Simulado)',
          icono: '💳',
          disponible: true,
          configuracion: { 
            requiereCVV: true,
            aceptaCredito: true,
            aceptaDebito: true 
          }
        },
        {
          tipo: 'PSE' as const,
          nombre: 'PSE - Pagos Seguros en Línea',
          descripcion: 'Pago directo desde tu banco (Simulado)',
          icono: '🏦',
          disponible: true,
          configuracion: { 
            bancos: ['Bancolombia', 'Banco de Bogotá', 'Davivienda', 'BBVA', 'Banco Popular'],
            tipoPersona: ['natural', 'juridica']
          }
        },
        {
          tipo: 'Nequi' as const,
          nombre: 'Nequi',
          descripcion: 'Pago con billetera digital Nequi (Simulado)',
          icono: '📱',
          disponible: true,
          configuracion: { 
            requiereTelefono: true,
            limiteTransaccion: 2000000
          }
        }
      ];
      
      setPaymentMethods(simulatedPaymentMethods);
      
      // Auto-seleccionar dirección predeterminada
      const defaultAddress = addressesData.find((addr: any) => addr.configuracion.esPredeterminada);
      if (defaultAddress) {
        setSelectedAddress(defaultAddress._id);
      }
      
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error cargando datos');
    } finally {
      setLoading(false);
    }
  };

  const handleAddressCreate = async (addressData: any) => {
    try {
      const newAddress = await addressService.createAddress(addressData);
      setAddresses(prev => [...prev, newAddress]);
      setSelectedAddress(newAddress._id);
      setShowAddressForm(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error creando dirección');
    }
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        if (!cart || cart.productos.length === 0) {
          setError('Tu carrito está vacío');
          return false;
        }
        return true;
      case 2:
        if (!selectedAddress) {
          setError('Selecciona una dirección de entrega');
          return false;
        }
        return true;
      case 3:
        if (!selectedPaymentMethod) {
          setError('Selecciona un método de pago');
          return false;
        }
        
        // Validaciones específicas por método de pago
        if (selectedPaymentMethod === 'tarjeta_credito') {
          const { numero, nombre, fechaVencimiento, cvv, numeroDocumento } = paymentData.tarjeta;
          if (!numero || numero.length < 16) {
            setError('Ingresa un número de tarjeta válido');
            return false;
          }
          if (!nombre.trim()) {
            setError('Ingresa el nombre como aparece en la tarjeta');
            return false;
          }
          if (!fechaVencimiento || fechaVencimiento.length < 5) {
            setError('Ingresa una fecha de vencimiento válida (MM/AA)');
            return false;
          }
          if (!cvv || cvv.length < 3) {
            setError('Ingresa un CVV válido');
            return false;
          }
          if (!numeroDocumento.trim()) {
            setError('Ingresa tu número de documento');
            return false;
          }
        }
        
        if (selectedPaymentMethod === 'PSE') {
          const { banco, numeroDocumento, email } = paymentData.pse;
          if (!banco) {
            setError('Selecciona tu banco');
            return false;
          }
          if (!numeroDocumento.trim()) {
            setError('Ingresa tu número de documento');
            return false;
          }
          if (!email.trim() || !email.includes('@')) {
            setError('Ingresa un email válido');
            return false;
          }
        }
        
        if (selectedPaymentMethod === 'Nequi') {
          const { telefono, pin } = paymentData.nequi;
          if (!telefono || telefono.length < 10) {
            setError('Ingresa un número de celular válido');
            return false;
          }
          if (!pin || pin.length < 4) {
            setError('Ingresa tu PIN de Nequi');
            return false;
          }
        }
        
        return true;
      default:
        return true;
    }
  };

  const handleNextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 4));
      setError(null);
    }
  };

  const handlePrevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
    setError(null);
  };

  const handlePlaceOrder = async () => {
    if (!validateStep(3)) return;

    try {
      setProcessing(true);
      
      // Datos del método de pago seleccionado
      let paymentMethodData = {};
      switch (selectedPaymentMethod) {
        case 'tarjeta_credito':
          paymentMethodData = {
            tipo: selectedPaymentMethod,
            ultimos4Digitos: paymentData.tarjeta.numero.slice(-4),
            tipoTarjeta: 'visa',
            datos: paymentData.tarjeta
          };
          break;
        case 'PSE':
          paymentMethodData = {
            tipo: selectedPaymentMethod,
            banco: paymentData.pse.banco,
            datos: paymentData.pse
          };
          break;
        case 'Nequi':
          paymentMethodData = {
            tipo: selectedPaymentMethod,
            telefono: paymentData.nequi.telefono.slice(-4),
            datos: paymentData.nequi
          };
          break;
      }
      
      const order: OrderForm = {
        productos: cart!.productos.map(item => ({
          producto: item.producto._id,
          cantidad: item.cantidad
        })),
        direccionEntrega: selectedAddress,
        metodoPago: paymentMethodData as any,
        usarDireccionGuardada: true,
        comentarios: orderData.comentarios || ''
      };

      // Crear pedido real en el backend
      const createdOrder = await orderService.createOrder(order);
      
      // Limpiar carrito después de crear el pedido
      await cartService.clearCart();
      
      // Mostrar notificación de éxito como card
      showSuccess(
        '¡Pedido confirmado exitosamente!',
        `Tu pedido #${createdOrder.numeroOrden} ha sido creado y está siendo procesado. Total: $${createdOrder.total.toLocaleString('es-CO')}`,
        {
          label: 'Ver pedido',
          onClick: () => window.location.href = `/orders/${createdOrder._id}`
        }
      );
      
      // Redirigir después de un breve delay para mostrar la notificación
      setTimeout(() => {
        window.location.href = `/orders/${createdOrder._id}`;
      }, 3000);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error procesando pedido';
      setError(errorMessage);
      showError('Error en el pedido', errorMessage);
    } finally {
      setProcessing(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  if (showAddressForm) {
    return (
      <AddressForm
        onSubmit={handleAddressCreate}
        onCancel={() => setShowAddressForm(false)}
      />
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white shadow-sm rounded-lg p-6">
        <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
        <p className="text-gray-600 mt-2">Completa tu pedido</p>
        
        {/* Banner de ambiente de pruebas */}
        <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-lg font-semibold text-blue-900">
                🧪 Ambiente de Pruebas Activo
              </h3>
              <p className="text-blue-700 mt-1">
                Puedes usar <strong>cualquier dato</strong> en los formularios de pago. 
                <strong> No se realizarán cobros reales.</strong> 
                Métodos disponibles: Visa, Mastercard, PSE y Nequi.
              </p>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Progress bar */}
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <div className="flex items-center justify-between">
          {[
            { step: 1, title: 'Carrito', icon: '🛒' },
            { step: 2, title: 'Dirección', icon: '📍' },
            { step: 3, title: 'Pago', icon: '💳' },
            { step: 4, title: 'Confirmación', icon: '✅' }
          ].map((item, index) => (
            <div key={item.step} className="flex items-center">
              <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                currentStep >= item.step 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-600'
              }`}>
                {currentStep > item.step ? '✓' : item.step}
              </div>
              <span className="ml-2 text-sm font-medium text-gray-900">{item.title}</span>
              {index < 3 && (
                <div className={`w-16 h-1 mx-4 ${
                  currentStep > item.step ? 'bg-blue-600' : 'bg-gray-200'
                }`} />
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Step 1: Carrito */}
          {currentStep === 1 && cart && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Revisar productos</h2>
              <div className="space-y-4">
                {cart.productos.map((item) => (
                  <div key={item._id} className="flex items-center space-x-4 p-4 border rounded-lg">
                    <img
                      src={item.producto.imagenes?.[0] || '/placeholder.jpg'}
                      alt={item.producto.nombre}
                      className="w-24 h-24 object-cover rounded-lg shadow-sm"
                    />
                    <div className="flex-grow">
                      <h3 className="font-medium text-gray-900 text-lg">{item.producto.nombre}</h3>
                      <p className="text-sm text-gray-600">Cantidad: {item.cantidad}</p>
                    </div>
                    <div className="text-lg font-semibold text-gray-900">
                      ${item.subtotal.toLocaleString('es-CO')}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Dirección */}
          {currentStep === 2 && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Dirección de entrega</h2>
                <button
                  onClick={() => setShowAddressForm(true)}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  + Nueva dirección
                </button>
              </div>
              
              <div className="space-y-3">
                {addresses.map((address) => (
                  <div
                    key={address._id}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedAddress === address._id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedAddress(address._id)}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center space-x-2">
                          <input
                            type="radio"
                            checked={selectedAddress === address._id}
                            onChange={() => setSelectedAddress(address._id)}
                            className="text-blue-600"
                          />
                          <span className="font-medium text-gray-900">{address.alias}</span>
                          {address.configuracion.esPredeterminada && (
                            <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                              Predeterminada
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          {address.nombreDestinatario} - {address.telefono}
                        </p>
                        <p className="text-sm text-gray-600">
                          {address.direccionCompleta}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Pago */}
          {currentStep === 3 && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Método de pago</h2>
              
              <div className="space-y-3">
                {paymentMethods.map((method) => (
                  <div
                    key={method.tipo}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedPaymentMethod === method.tipo
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedPaymentMethod(method.tipo)}
                  >
                    <div className="flex items-center space-x-3">
                      <input
                        type="radio"
                        checked={selectedPaymentMethod === method.tipo}
                        onChange={() => setSelectedPaymentMethod(method.tipo)}
                        className="text-blue-600"
                      />
                      <div className="flex-grow">
                        <div className="flex items-center space-x-2">
                          <span className="text-2xl">{method.icono}</span>
                          <span className="font-medium text-gray-900">{method.nombre}</span>
                        </div>
                        <p className="text-sm text-gray-600">{method.descripcion}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Comentarios adicionales */}
              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Comentarios adicionales (opcional)
                </label>
                <textarea
                  value={orderData.comentarios || ''}
                  onChange={(e) => setOrderData(prev => ({ ...prev, comentarios: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Instrucciones especiales para el delivery..."
                />
              </div>

              {/* Formularios específicos de pago */}
              {selectedPaymentMethod && (
                <div className="mt-8 p-6 bg-gray-50 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Información de pago
                  </h3>

                  {/* Formulario para Tarjeta de Crédito */}
                  {selectedPaymentMethod === 'tarjeta_credito' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Número de tarjeta
                        </label>
                        <input
                          type="text"
                          value={paymentData.tarjeta.numero}
                          onChange={(e) => setPaymentData(prev => ({
                            ...prev,
                            tarjeta: { ...prev.tarjeta, numero: e.target.value }
                          }))}
                          placeholder="1234 5678 9012 3456"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Nombre en la tarjeta
                        </label>
                        <input
                          type="text"
                          value={paymentData.tarjeta.nombre}
                          onChange={(e) => setPaymentData(prev => ({
                            ...prev,
                            tarjeta: { ...prev.tarjeta, nombre: e.target.value }
                          }))}
                          placeholder="Juan Pérez"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Fecha de vencimiento
                        </label>
                        <input
                          type="text"
                          value={paymentData.tarjeta.fechaVencimiento}
                          onChange={(e) => setPaymentData(prev => ({
                            ...prev,
                            tarjeta: { ...prev.tarjeta, fechaVencimiento: e.target.value }
                          }))}
                          placeholder="MM/AA"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          CVV
                        </label>
                        <input
                          type="text"
                          value={paymentData.tarjeta.cvv}
                          onChange={(e) => setPaymentData(prev => ({
                            ...prev,
                            tarjeta: { ...prev.tarjeta, cvv: e.target.value }
                          }))}
                          placeholder="123"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Tipo de documento
                        </label>
                        <select
                          value={paymentData.tarjeta.tipoDocumento}
                          onChange={(e) => setPaymentData(prev => ({
                            ...prev,
                            tarjeta: { ...prev.tarjeta, tipoDocumento: e.target.value }
                          }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="cedula">Cédula de ciudadanía</option>
                          <option value="cedula_extranjeria">Cédula de extranjería</option>
                          <option value="nit">NIT</option>
                          <option value="pasaporte">Pasaporte</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Número de documento
                        </label>
                        <input
                          type="text"
                          value={paymentData.tarjeta.numeroDocumento}
                          onChange={(e) => setPaymentData(prev => ({
                            ...prev,
                            tarjeta: { ...prev.tarjeta, numeroDocumento: e.target.value }
                          }))}
                          placeholder="12345678"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  )}

                  {/* Formulario para PSE */}
                  {selectedPaymentMethod === 'PSE' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Banco
                        </label>
                        <select
                          value={paymentData.pse.banco}
                          onChange={(e) => setPaymentData(prev => ({
                            ...prev,
                            pse: { ...prev.pse, banco: e.target.value }
                          }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">Selecciona tu banco</option>
                          <option value="bancolombia">Bancolombia</option>
                          <option value="banco_bogota">Banco de Bogotá</option>
                          <option value="davivienda">Davivienda</option>
                          <option value="bbva">BBVA Colombia</option>
                          <option value="banco_popular">Banco Popular</option>
                          <option value="colpatria">Scotiabank Colpatria</option>
                          <option value="av_villas">Banco AV Villas</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Tipo de persona
                        </label>
                        <select
                          value={paymentData.pse.tipoPersona}
                          onChange={(e) => setPaymentData(prev => ({
                            ...prev,
                            pse: { ...prev.pse, tipoPersona: e.target.value }
                          }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="natural">Persona Natural</option>
                          <option value="juridica">Persona Jurídica</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Tipo de documento
                        </label>
                        <select
                          value={paymentData.pse.tipoDocumento}
                          onChange={(e) => setPaymentData(prev => ({
                            ...prev,
                            pse: { ...prev.pse, tipoDocumento: e.target.value }
                          }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="cedula">Cédula de ciudadanía</option>
                          <option value="cedula_extranjeria">Cédula de extranjería</option>
                          <option value="nit">NIT</option>
                          <option value="pasaporte">Pasaporte</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Número de documento
                        </label>
                        <input
                          type="text"
                          value={paymentData.pse.numeroDocumento}
                          onChange={(e) => setPaymentData(prev => ({
                            ...prev,
                            pse: { ...prev.pse, numeroDocumento: e.target.value }
                          }))}
                          placeholder="12345678"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Email de confirmación
                        </label>
                        <input
                          type="email"
                          value={paymentData.pse.email}
                          onChange={(e) => setPaymentData(prev => ({
                            ...prev,
                            pse: { ...prev.pse, email: e.target.value }
                          }))}
                          placeholder="tu@email.com"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  )}

                  {/* Formulario para Nequi */}
                  {selectedPaymentMethod === 'Nequi' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Número de celular
                        </label>
                        <input
                          type="text"
                          value={paymentData.nequi.telefono}
                          onChange={(e) => setPaymentData(prev => ({
                            ...prev,
                            nequi: { ...prev.nequi, telefono: e.target.value }
                          }))}
                          placeholder="3001234567"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          PIN de Nequi
                        </label>
                        <input
                          type="password"
                          value={paymentData.nequi.pin}
                          onChange={(e) => setPaymentData(prev => ({
                            ...prev,
                            nequi: { ...prev.nequi, pin: e.target.value }
                          }))}
                          placeholder="****"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  )}

                  {/* Nota de ambiente de pruebas */}
                  <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-start">
                      <div className="flex-shrink-0">
                        <svg className="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-blue-800">
                          Ambiente de pruebas
                        </h3>
                        <div className="mt-2 text-sm text-blue-700">
                          <p>
                            Este es un ambiente de pruebas. No se realizarán cobros reales. 
                            Puedes usar cualquier dato para completar la transacción.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 4: Confirmación */}
          {currentStep === 4 && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Confirmar pedido</h2>
              
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-gray-900">Dirección de entrega:</h3>
                  <p className="text-sm text-gray-600">
                    {addresses.find(a => a._id === selectedAddress)?.direccionCompleta}
                  </p>
                </div>
                
                <div>
                  <h3 className="font-medium text-gray-900">Método de pago:</h3>
                  <p className="text-sm text-gray-600">
                    {paymentMethods.find(m => m.tipo === selectedPaymentMethod)?.nombre}
                  </p>
                </div>
                
                {orderData.comentarios && (
                  <div>
                    <h3 className="font-medium text-gray-900">Comentarios:</h3>
                    <p className="text-sm text-gray-600">{orderData.comentarios}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Navigation buttons */}
          <div className="flex justify-between">
            <button
              onClick={handlePrevStep}
              disabled={currentStep === 1}
              className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Anterior
            </button>
            
            {currentStep < 4 ? (
              <button
                onClick={handleNextStep}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Siguiente
              </button>
            ) : (
              <button
                onClick={handlePlaceOrder}
                disabled={processing}
                className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
              >
                {processing ? 'Procesando...' : 'Confirmar Pedido'}
              </button>
            )}
          </div>
        </div>

        {/* Order summary */}
        <div className="lg:col-span-1">
          {cart && (
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Resumen del Pedido</h3>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">${cart.subtotal.toLocaleString('es-CO')}</span>
                </div>
                
                {cart.descuentos > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Descuentos</span>
                    <span>-${cart.descuentos.toLocaleString('es-CO')}</span>
                  </div>
                )}
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Envío</span>
                  <span className="font-medium">
                    {cart.costoEnvio === 0 ? 'Gratis' : `$${cart.costoEnvio.toLocaleString('es-CO')}`}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Impuestos</span>
                  <span className="font-medium">${cart.impuestos.toLocaleString('es-CO')}</span>
                </div>
                
                <hr className="my-4" />
                
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span className="text-green-600">${cart.total.toLocaleString('es-CO')}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Notification Cards Container */}
      <div className="mt-6">
        <NotificationCardContainer />
      </div>
    </div>
  );
};

export default CheckoutPage; 