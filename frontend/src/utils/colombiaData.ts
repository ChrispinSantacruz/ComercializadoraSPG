/**
 * Datos de departamentos y ciudades de Colombia
 */

export interface CityData {
  nombre: string;
}

export interface DepartmentData {
  nombre: string;
  ciudades: string[];
}

export const departamentosYCiudades: DepartmentData[] = [
  {
    nombre: 'Amazonas',
    ciudades: ['Leticia', 'Puerto Nariño', 'El Encanto', 'La Chorrera', 'La Pedrera', 'Miriti-Paraná', 'Puerto Alegría', 'Puerto Arica', 'Puerto Santander', 'Tarapacá', 'Otra']
  },
  {
    nombre: 'Antioquia',
    ciudades: ['Medellín', 'Bello', 'Itagüí', 'Envigado', 'Apartadó', 'Turbo', 'Rionegro', 'Caucasia', 'Sabaneta', 'La Estrella', 'Caldas', 'Copacabana', 'Girardota', 'Barbosa', 'Carmen de Viboral', 'Puerto Berrío', 'Marinilla', 'Yarumal', 'Segovia', 'Santa Rosa de Osos', 'Otra']
  },
  {
    nombre: 'Arauca',
    ciudades: ['Arauca', 'Arauquita', 'Cravo Norte', 'Fortul', 'Puerto Rondón', 'Saravena', 'Tame', 'Otra']
  },
  {
    nombre: 'Atlántico',
    ciudades: ['Barranquilla', 'Soledad', 'Malambo', 'Sabanalarga', 'Puerto Colombia', 'Galapa', 'Baranoa', 'Palmar de Varela', 'Santo Tomás', 'Polonuevo', 'Ponedera', 'Candelaria', 'Luruaco', 'Tubará', 'Otra']
  },
  {
    nombre: 'Bolívar',
    ciudades: ['Cartagena', 'Magangué', 'Turbaco', 'Arjona', 'El Carmen de Bolívar', 'San Pablo', 'Simití', 'Santa Rosa del Sur', 'Mompós', 'Morales', 'Santa Catalina', 'Turbana', 'Otra']
  },
  {
    nombre: 'Boyacá',
    ciudades: ['Tunja', 'Duitama', 'Sogamoso', 'Chiquinquirá', 'Paipa', 'Villa de Leyva', 'Puerto Boyacá', 'Moniquirá', 'Nobsa', 'Tibasosa', 'Samacá', 'Ventaquemada', 'Ramiriquí', 'Otra']
  },
  {
    nombre: 'Caldas',
    ciudades: ['Manizales', 'La Dorada', 'Chinchiná', 'Villamaría', 'Riosucio', 'Anserma', 'Palestina', 'Neira', 'Aguadas', 'Supía', 'Otra']
  },
  {
    nombre: 'Caquetá',
    ciudades: ['Florencia', 'San Vicente del Caguán', 'Puerto Rico', 'El Doncello', 'El Paujil', 'La Montañita', 'Belén de los Andaquíes', 'Cartagena del Chairá', 'Otra']
  },
  {
    nombre: 'Casanare',
    ciudades: ['Yopal', 'Aguazul', 'Villanueva', 'Monterrey', 'Tauramena', 'Paz de Ariporo', 'Hato Corozal', 'Trinidad', 'Maní', 'Otra']
  },
  {
    nombre: 'Cauca',
    ciudades: ['Popayán', 'Santander de Quilichao', 'Puerto Tejada', 'Patía', 'Guachené', 'Miranda', 'Corinto', 'Piendamó', 'Villa Rica', 'Timbío', 'Otra']
  },
  {
    nombre: 'Cesar',
    ciudades: ['Valledupar', 'Aguachica', 'Bosconia', 'Codazzi', 'La Jagua de Ibirico', 'Curumaní', 'Chiriguaná', 'El Copey', 'Agustín Codazzi', 'Otra']
  },
  {
    nombre: 'Chocó',
    ciudades: ['Quibdó', 'Istmina', 'Condoto', 'Tadó', 'Acandí', 'Bahía Solano', 'Bajo Baudó', 'Bojayá', 'Nuquí', 'Otra']
  },
  {
    nombre: 'Córdoba',
    ciudades: ['Montería', 'Cereté', 'Sahagún', 'Lorica', 'Montelíbano', 'Planeta Rica', 'Ayapel', 'Tierralta', 'Chinú', 'San Antero', 'Otra']
  },
  {
    nombre: 'Cundinamarca',
    ciudades: ['Bogotá', 'Soacha', 'Facatativá', 'Zipaquirá', 'Chía', 'Mosquera', 'Fusagasugá', 'Madrid', 'Funza', 'Cajicá', 'Cota', 'Sibaté', 'Tocancipá', 'Girardot', 'La Calera', 'Sopó', 'Tabio', 'Tenjo', 'Gachancipá', 'Villa de San Diego de Ubaté', 'Otra']
  },
  {
    nombre: 'Guainía',
    ciudades: ['Inírida', 'Barranco Minas', 'Mapiripana', 'San Felipe', 'Puerto Colombia', 'La Guadalupe', 'Cacahual', 'Pana Pana', 'Morichal', 'Otra']
  },
  {
    nombre: 'Guaviare',
    ciudades: ['San José del Guaviare', 'Calamar', 'El Retorno', 'Miraflores', 'Otra']
  },
  {
    nombre: 'Huila',
    ciudades: ['Neiva', 'Pitalito', 'Garzón', 'La Plata', 'Campoalegre', 'San Agustín', 'Gigante', 'Guadalupe', 'Aipe', 'Rivera', 'Otra']
  },
  {
    nombre: 'La Guajira',
    ciudades: ['Riohacha', 'Maicao', 'Uribia', 'Manaure', 'Albania', 'Fonseca', 'Villanueva', 'Dibulla', 'San Juan del Cesar', 'Otra']
  },
  {
    nombre: 'Magdalena',
    ciudades: ['Santa Marta', 'Ciénaga', 'Fundación', 'Plato', 'El Banco', 'Zona Bananera', 'Aracataca', 'Pivijay', 'Puebloviejo', 'Otra']
  },
  {
    nombre: 'Meta',
    ciudades: ['Villavicencio', 'Acacías', 'Granada', 'San Martín', 'Puerto López', 'Cumaral', 'Restrepo', 'Puerto Gaitán', 'La Macarena', 'Otra']
  },
  {
    nombre: 'Nariño',
    ciudades: ['Pasto', 'Tumaco', 'Ipiales', 'Túquerres', 'Sandoná', 'La Unión', 'Samaniego', 'Barbacoas', 'El Charco', 'Otra']
  },
  {
    nombre: 'Norte de Santander',
    ciudades: ['Cúcuta', 'Ocaña', 'Villa del Rosario', 'Los Patios', 'Pamplona', 'Tibú', 'El Zulia', 'Chinácota', 'Toledo', 'Otra']
  },
  {
    nombre: 'Putumayo',
    ciudades: ['Mocoa', 'Puerto Asís', 'Orito', 'Valle del Guamuez', 'Sibundoy', 'San Miguel', 'Villagarzón', 'Puerto Guzmán', 'Otra']
  },
  {
    nombre: 'Quindío',
    ciudades: ['Armenia', 'Calarcá', 'La Tebaida', 'Montenegro', 'Quimbaya', 'Circasia', 'Filandia', 'Salento', 'Otra']
  },
  {
    nombre: 'Risaralda',
    ciudades: ['Pereira', 'Dosquebradas', 'Santa Rosa de Cabal', 'La Virginia', 'Marsella', 'Belén de Umbría', 'Quinchía', 'Otra']
  },
  {
    nombre: 'San Andrés y Providencia',
    ciudades: ['San Andrés', 'Providencia', 'Santa Catalina', 'Otra']
  },
  {
    nombre: 'Santander',
    ciudades: ['Bucaramanga', 'Floridablanca', 'Girón', 'Piedecuesta', 'Barrancabermeja', 'San Gil', 'Socorro', 'Barbosa', 'Málaga', 'Vélez', 'Otra']
  },
  {
    nombre: 'Sucre',
    ciudades: ['Sincelejo', 'Corozal', 'Sampués', 'Tolú', 'San Marcos', 'Sincé', 'Coveñas', 'Majagual', 'Otra']
  },
  {
    nombre: 'Tolima',
    ciudades: ['Ibagué', 'Espinal', 'Melgar', 'Honda', 'Chaparral', 'Líbano', 'Mariquita', 'Purificación', 'Armero-Guayabal', 'Otra']
  },
  {
    nombre: 'Valle del Cauca',
    ciudades: ['Cali', 'Palmira', 'Buenaventura', 'Tuluá', 'Cartago', 'Buga', 'Jamundí', 'Yumbo', 'Candelaria', 'Florida', 'Pradera', 'Otra']
  },
  {
    nombre: 'Vaupés',
    ciudades: ['Mitú', 'Caruru', 'Pacoa', 'Taraira', 'Papunahua', 'Yavaraté', 'Otra']
  },
  {
    nombre: 'Vichada',
    ciudades: ['Puerto Carreño', 'La Primavera', 'Santa Rosalía', 'Cumaribo', 'Otra']
  }
];

/**
 * Obtiene las ciudades de un departamento
 */
export const getCiudadesPorDepartamento = (departamento: string): string[] => {
  const dept = departamentosYCiudades.find(d => d.nombre === departamento);
  return dept ? dept.ciudades : [];
};

/**
 * Obtiene la lista de departamentos
 */
export const getDepartamentos = (): string[] => {
  return departamentosYCiudades.map(d => d.nombre);
};
