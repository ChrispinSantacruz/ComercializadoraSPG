import React from 'react';
import { useNavigate } from 'react-router-dom';

const AboutUsPage: React.FC = () => {
  const navigate = useNavigate();

  const values = [
    {
      icon: '🎯',
      title: 'Calidad',
      description: 'Seleccionamos cuidadosamente cada producto para garantizar la mejor calidad para nuestros clientes.'
    },
    {
      icon: '🤝',
      title: 'Honestidad',
      description: 'Basamos nuestra labor en la transparencia y el trato justo con todos nuestros clientes y socios.'
    },
    {
      icon: '🚚',
      title: 'Entrega Oportuna',
      description: 'Nos comprometemos a entregar tus productos en el menor tiempo posible y en perfectas condiciones.'
    },
    {
      icon: '💝',
      title: 'Propósito',
      description: 'Construimos una marca con propósito que beneficie a toda la comunidad pastusa.'
    },
    {
      icon: '🌟',
      title: 'Prestigio',
      description: 'Trabajamos cada día para mantener el prestigio y la confianza de nuestros clientes.'
    },
    {
      icon: '🌍',
      title: 'Desarrollo Social',
      description: 'Impulsamos el bienestar colectivo y la autonomía económica de nuestras socias fundadoras.'
    }
  ];

  const stats = [
    { number: '10,000+', label: 'Productos', icon: '📦' },
    { number: '50,000+', label: 'Clientes Felices', icon: '😊' },
    { number: '500+', label: 'Comerciantes', icon: '🏪' },
    { number: '99.5%', label: 'Satisfacción', icon: '⭐' }
  ];

  const team = [
    {
      name: 'Gabby Narváez',
      role: 'CEO & Fundadora',
      image: '👩‍💼',
      description: 'Visionaria líder que impulsa el desarrollo económico de las mujeres emprendedoras de Pasto'
    },
    {
      name: 'Christian Santacruz',
      role: 'Ingeniero Fullstack de Software',
      image: '👨‍💻',
      description: 'Experto en tecnología que desarrolla y mantiene nuestra plataforma digital'
    },
    {
      name: 'Laura Agreda',
      role: 'Directora de Marketing',
      image: '👩‍🎨',
      description: 'Creativa estratega que conecta marcas con personas y promueve el comercio local'
    },
    {
      name: 'Pilar Narváez',
      role: 'Directora de Mercadotecnia',
      image: '👩‍💼',
      description: 'Especialista en estrategias de mercado que impulsa el crecimiento de nuestros comerciantes'
    },
    {
      name: 'Sofía Rosero',
      role: 'Directora de Operaciones',
      image: '👩‍🔧',
      description: 'Garantiza que cada entrega llegue perfecta y a tiempo, optimizando todos nuestros procesos'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 text-white overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20"></div>
        
        {/* Decorative Elements */}
        <div className="absolute top-0 left-0 w-72 h-72 bg-white/10 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/5 rounded-full translate-x-1/2 translate-y-1/2"></div>
        
        <div className="relative container mx-auto px-4 py-32">
          <div className="text-center max-w-6xl mx-auto">
            {/* Main Title */}
            <div className="mb-8">
              <h1 className="text-6xl md:text-8xl font-bold mb-6 bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
                Sobre Nosotros
              </h1>
              <div className="text-8xl mb-6">🏢</div>
            </div>
            
            {/* Subtitle */}
            <p className="text-2xl md:text-3xl mb-8 text-gray-100 leading-relaxed max-w-4xl mx-auto">
              Somos más que una plataforma de comercio electrónico. 
              <br />
              <span className="font-semibold text-white">Somos tu socio en el éxito.</span>
            </p>
            
            {/* Additional Info */}
            <div className="mt-12 grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <div className="text-4xl mb-3">🎯</div>
                <h3 className="text-lg font-semibold mb-2">Misión Clara</h3>
                <p className="text-sm text-gray-200">Conectar personas con lo que realmente necesitan</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <div className="text-4xl mb-3">🌟</div>
                <h3 className="text-lg font-semibold mb-2">Propósito Social</h3>
                <p className="text-sm text-gray-200">Impulsar el desarrollo económico de Pasto</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <div className="text-4xl mb-3">🤝</div>
                <h3 className="text-lg font-semibold mb-2">Comunidad</h3>
                <p className="text-sm text-gray-200">Empoderar a las mujeres emprendedoras</p>
              </div>
            </div>
            
            {/* Call to Action */}
            <div className="mt-12 mb-16">
              <button 
                onClick={() => navigate('/register')}
                className="bg-white text-blue-600 px-8 py-4 rounded-full font-semibold text-lg hover:bg-gray-100 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                🚀 Únete a AndinoExpress
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mission, Vision, Values */}
      <div className="container mx-auto px-4 py-20">
        <div className="grid lg:grid-cols-3 gap-8 mb-20">
          {/* Misión */}
          <div className="bg-white rounded-xl shadow-lg p-10 text-center hover:shadow-2xl transition-shadow duration-300">
            <div className="text-6xl mb-6">🎯</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Nuestra Misión</h3>
            <p className="text-gray-600 leading-relaxed">
              En AndinoExpress trabajamos con pasión para conectar a las personas 
              con lo que realmente necesitan y desean, ofreciendo soluciones innovadoras y accesibles 
              que respondan a sus gustos, estilos de vida y aspiraciones. Nos proyectamos como una 
              plataforma dinámica y confiable que, a través del comercio consciente y el uso de 
              herramientas digitales, impulsa el bienestar colectivo, la autonomía económica de 
              nuestras socias fundadoras y el desarrollo social de nuestro entorno.
            </p>
          </div>

          {/* Visión */}
          <div className="bg-white rounded-xl shadow-lg p-10 text-center hover:shadow-2xl transition-shadow duration-300">
            <div className="text-6xl mb-6">🔮</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Nuestra Visión</h3>
            <p className="text-gray-600 leading-relaxed">
              Ser la plataforma de comercio electrónico líder en el sur de Colombia, 
              reconocida por democratizar las oportunidades de venta online y crear 
              un ecosistema próspero que impulse el desarrollo económico de Pasto 
              y la región, basándonos en la calidad, la honestidad, el trato justo, 
              la entrega oportuna y la construcción de una marca con propósito y prestigio.
            </p>
          </div>

          {/* Historia */}
          <div className="bg-white rounded-xl shadow-lg p-10 text-center hover:shadow-2xl transition-shadow duration-300">
            <div className="text-6xl mb-6">📖</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Nuestra Historia</h3>
            <p className="text-gray-600 leading-relaxed">
              Fundada en 2024, AndinoExpress nació 
              del sueño de empoderar a las mujeres emprendedoras y comerciantes locales en Colombia. 
              Basamos nuestra labor en la calidad, la honestidad, el trato justo, 
              la entrega oportuna y la construcción de una marca con propósito y prestigio 
              que beneficie a toda la comunidad pastusa.
            </p>
          </div>
        </div>

        {/* Estadísticas */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white mb-16">
          <h3 className="text-3xl font-bold text-center mb-8">Nuestros Números Hablan 📊</h3>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl mb-2">{stat.icon}</div>
                <div className="text-3xl font-bold mb-1">{stat.number}</div>
                <div className="text-blue-100">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Valores */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">Nuestros Valores 💎</h3>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Los principios que guían cada decisión y acción en AndinoExpress
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {values.map((value, index) => (
              <div key={index} className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
                <div className="text-4xl mb-4">{value.icon}</div>
                <h4 className="text-xl font-semibold text-gray-900 mb-3">{value.title}</h4>
                <p className="text-gray-600 text-sm leading-relaxed">{value.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Equipo */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">Nuestro Equipo 👥</h3>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Las personas apasionadas que hacen posible AndinoExpress cada día
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-8">
            {team.map((member, index) => (
              <div key={index} className="bg-white rounded-xl shadow-md p-6 text-center hover:shadow-lg transition-shadow">
                <div className="text-6xl mb-4">{member.image}</div>
                <h4 className="text-xl font-semibold text-gray-900 mb-1">{member.name}</h4>
                <p className="text-blue-600 font-medium mb-3">{member.role}</p>
                <p className="text-gray-600 text-sm">{member.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Compromiso */}
        <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl p-8 mb-16">
          <div className="text-center">
            <h3 className="text-3xl font-bold text-gray-900 mb-6">Nuestro Compromiso 🤝</h3>
            <div className="grid md:grid-cols-3 gap-8">
              <div>
                <div className="text-4xl mb-3">🛡️</div>
                <h4 className="font-semibold mb-2">Seguridad</h4>
                <p className="text-sm text-gray-600">Protegemos tus datos y transacciones con la más alta tecnología</p>
              </div>
              <div>
                <div className="text-4xl mb-3">📞</div>
                <h4 className="font-semibold mb-2">Soporte 24/7</h4>
                <p className="text-sm text-gray-600">Estamos aquí cuando nos necesites, cualquier día del año</p>
              </div>
              <div>
                <div className="text-4xl mb-3">🚀</div>
                <h4 className="font-semibold mb-2">Innovación</h4>
                <p className="text-sm text-gray-600">Mejoramos constantemente para ofrecerte la mejor experiencia</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h3 className="text-3xl font-bold mb-4">¿Listo para ser parte de SPG? 🎉</h3>
          <p className="text-xl mb-8">Únete a miles de colombianos que confían en nosotros</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/register')}
              className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              🛍️ Empezar a Comprar
            </button>
            <button
              onClick={() => navigate('/register')}
              className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors"
            >
              🏪 Vender con Nosotros
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutUsPage; 