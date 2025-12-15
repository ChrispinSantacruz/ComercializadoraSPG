import React, { useState, useEffect } from 'react';
import { Address, AddressForm as AddressFormType } from '../../types';
import { getDepartamentos, getCiudadesPorDepartamento } from '../../utils/colombiaData';

interface AddressFormProps {
  address?: Address;
  onSubmit: (data: AddressFormType) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const AddressForm: React.FC<AddressFormProps> = ({
  address,
  onSubmit,
  onCancel,
  isLoading = false
}) => {
  const [formData, setFormData] = useState<AddressFormType>({
    alias: address?.alias || '',
    nombreDestinatario: address?.nombreDestinatario || '',
    telefono: address?.telefono || '',
    direccion: {
      calle: address?.direccion.calle || '',
      numero: address?.direccion.numero || '',
      apartamento: address?.direccion.apartamento || '',
      barrio: address?.direccion.barrio || '',
      ciudad: address?.direccion.ciudad || '',
      departamento: address?.direccion.departamento || '',
      codigoPostal: address?.direccion.codigoPostal || ''
    },
    tipo: address?.tipo || 'casa',
    instruccionesEntrega: address?.instruccionesEntrega || '',
    esPredeterminada: address?.configuracion.esPredeterminada || false,
    esFacturacion: address?.configuracion.esFacturacion || false
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [ciudadesDisponibles, setCiudadesDisponibles] = useState<string[]>([]);
  const [otraCiudad, setOtraCiudad] = useState('');
  
  const departamentos = getDepartamentos();

  // Actualizar ciudades disponibles cuando cambie el departamento
  useEffect(() => {
    if (formData.direccion.departamento) {
      const ciudades = getCiudadesPorDepartamento(formData.direccion.departamento);
      setCiudadesDisponibles(ciudades);
      
      // Si la ciudad actual no está en la nueva lista, limpiarla
      if (!ciudades.includes(formData.direccion.ciudad) && formData.direccion.ciudad !== 'Otra') {
        setFormData(prev => ({
          ...prev,
          direccion: {
            ...prev.direccion,
            ciudad: ''
          }
        }));
      }
    } else {
      setCiudadesDisponibles([]);
    }
  }, [formData.direccion.departamento]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (name.startsWith('direccion.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        direccion: {
          ...prev.direccion,
          [field]: value
        }
      }));
    } else if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }

    // Limpiar error
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.alias.trim()) newErrors.alias = 'El alias es requerido';
    if (!formData.nombreDestinatario.trim()) newErrors.nombreDestinatario = 'El nombre del destinatario es requerido';
    if (!formData.telefono.trim()) newErrors.telefono = 'El teléfono es requerido';
    if (!formData.direccion.calle.trim()) newErrors['direccion.calle'] = 'La calle es requerida';
    if (!formData.direccion.barrio.trim()) newErrors['direccion.barrio'] = 'El barrio es requerido';
    if (!formData.direccion.ciudad.trim()) newErrors['direccion.ciudad'] = 'La ciudad es requerida';
    if (!formData.direccion.departamento) newErrors['direccion.departamento'] = 'El departamento es requerido';
    
    // Si seleccionó "Otra" ciudad, validar que escribió el nombre
    if (formData.direccion.ciudad === 'Otra' && !otraCiudad.trim()) {
      newErrors['otraCiudad'] = 'Debe especificar el nombre de la ciudad';
    }

    // Validar teléfono
    const phoneRegex = /^[0-9+\-\s]+$/;
    if (formData.telefono && !phoneRegex.test(formData.telefono)) {
      newErrors.telefono = 'El teléfono no es válido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    // Si seleccionó "Otra" ciudad, usar el valor escrito
    const finalData = {
      ...formData,
      direccion: {
        ...formData.direccion,
        ciudad: formData.direccion.ciudad === 'Otra' ? otraCiudad : formData.direccion.ciudad
      }
    };
    
    onSubmit(finalData);
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        {address ? 'Editar Dirección' : 'Nueva Dirección'}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Información básica */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Alias de la dirección *
            </label>
            <input
              type="text"
              name="alias"
              value={formData.alias}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.alias ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Casa, Oficina, etc."
            />
            {errors.alias && <p className="text-red-500 text-sm mt-1">{errors.alias}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de dirección
            </label>
            <select
              name="tipo"
              value={formData.tipo}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="casa">Casa</option>
              <option value="apartamento">Apartamento</option>
              <option value="oficina">Oficina</option>
              <option value="otro">Otro</option>
            </select>
          </div>
        </div>

        {/* Información del destinatario */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nombre del destinatario *
            </label>
            <input
              type="text"
              name="nombreDestinatario"
              value={formData.nombreDestinatario}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.nombreDestinatario ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Nombre completo"
            />
            {errors.nombreDestinatario && <p className="text-red-500 text-sm mt-1">{errors.nombreDestinatario}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Teléfono *
            </label>
            <input
              type="tel"
              name="telefono"
              value={formData.telefono}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.telefono ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="+57 300 123 4567"
            />
            {errors.telefono && <p className="text-red-500 text-sm mt-1">{errors.telefono}</p>}
          </div>
        </div>

        {/* Dirección */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">Dirección</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Calle *
              </label>
              <input
                type="text"
                name="direccion.calle"
                value={formData.direccion.calle}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors['direccion.calle'] ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Carrera 15"
              />
              {errors['direccion.calle'] && <p className="text-red-500 text-sm mt-1">{errors['direccion.calle']}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Número
              </label>
              <input
                type="text"
                name="direccion.numero"
                value={formData.direccion.numero}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="123-45"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Apartamento/Casa
              </label>
              <input
                type="text"
                name="direccion.apartamento"
                value={formData.direccion.apartamento}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Apto 101, Casa 5"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Barrio *
              </label>
              <input
                type="text"
                name="direccion.barrio"
                value={formData.direccion.barrio}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors['direccion.barrio'] ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Centro, Chapinero"
              />
              {errors['direccion.barrio'] && <p className="text-red-500 text-sm mt-1">{errors['direccion.barrio']}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Departamento *
              </label>
              <select
                name="direccion.departamento"
                value={formData.direccion.departamento}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors['direccion.departamento'] ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Seleccionar departamento</option>
                {departamentos.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
              {errors['direccion.departamento'] && <p className="text-red-500 text-sm mt-1">{errors['direccion.departamento']}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ciudad *
              </label>
              <select
                name="direccion.ciudad"
                value={formData.direccion.ciudad}
                onChange={handleChange}
                disabled={!formData.direccion.departamento}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors['direccion.ciudad'] ? 'border-red-500' : 'border-gray-300'
                } disabled:bg-gray-100 disabled:cursor-not-allowed`}
              >
                <option value="">Seleccionar ciudad</option>
                {ciudadesDisponibles.map(ciudad => (
                  <option key={ciudad} value={ciudad}>{ciudad}</option>
                ))}
              </select>
              {errors['direccion.ciudad'] && <p className="text-red-500 text-sm mt-1">{errors['direccion.ciudad']}</p>}
            </div>
            
            {formData.direccion.ciudad === 'Otra' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre de la ciudad *
                </label>
                <input
                  type="text"
                  value={otraCiudad}
                  onChange={(e) => setOtraCiudad(e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors['otraCiudad'] ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Escriba el nombre de la ciudad"
                />
                {errors['otraCiudad'] && <p className="text-red-500 text-sm mt-1">{errors['otraCiudad']}</p>}
              </div>
            )}

            <div className={formData.direccion.ciudad === 'Otra' ? 'md:col-start-1' : ''}>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Código Postal
              </label>
              <input
                type="text"
                name="direccion.codigoPostal"
                value={formData.direccion.codigoPostal}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="110111"
              />
            </div>
          </div>
        </div>

        {/* Instrucciones de entrega */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Instrucciones de entrega
          </label>
          <textarea
            name="instruccionesEntrega"
            value={formData.instruccionesEntrega}
            onChange={handleChange}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Instrucciones adicionales para el delivery..."
          />
        </div>

        {/* Configuración */}
        <div className="space-y-3">
          <h3 className="text-lg font-medium text-gray-900">Configuración</h3>
          
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="checkbox"
                name="esPredeterminada"
                checked={formData.esPredeterminada}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-700">Establecer como dirección predeterminada</span>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                name="esFacturacion"
                checked={formData.esFacturacion}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-700">Usar también como dirección de facturación</span>
            </label>
          </div>
        </div>

        {/* Botones */}
        <div className="flex justify-end space-x-4 pt-6">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
            disabled={isLoading}
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {isLoading ? 'Guardando...' : address ? 'Actualizar' : 'Guardar Dirección'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddressForm; 