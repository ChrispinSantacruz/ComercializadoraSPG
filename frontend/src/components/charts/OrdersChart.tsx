import React from 'react';

interface OrdersChartProps {
  data: {
    date: string;
    orders: number;
  }[];
}

const OrdersChart: React.FC<OrdersChartProps> = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Pedidos por Día</h3>
        <div className="flex items-center justify-center h-64 text-gray-500">
          No hay datos disponibles
        </div>
      </div>
    );
  }

  const maxOrders = Math.max(...data.map(d => d.orders));
  const chartHeight = 200;

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Pedidos por Día</h3>
      
      <div className="relative" style={{ height: chartHeight + 40 }}>
        {/* Eje Y */}
        <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-gray-500">
          <span>{maxOrders}</span>
          <span>{Math.floor(maxOrders * 0.75)}</span>
          <span>{Math.floor(maxOrders * 0.5)}</span>
          <span>{Math.floor(maxOrders * 0.25)}</span>
          <span>0</span>
        </div>

        {/* Área del gráfico */}
        <div className="ml-8 flex items-end justify-between h-full pb-8 space-x-1">
          {data.map((item, index) => {
            const height = maxOrders > 0 ? (item.orders / maxOrders) * chartHeight : 0;
            return (
              <div key={index} className="flex flex-col items-center group relative">
                <div 
                  className="bg-blue-500 hover:bg-blue-600 transition-colors rounded-t-sm w-8 md:w-12"
                  style={{ height: `${height}px` }}
                >
                  {/* Tooltip */}
                  <div className="invisible group-hover:visible absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs rounded py-1 px-2 whitespace-nowrap z-10">
                    {item.orders} pedidos
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
                  </div>
                </div>
                
                {/* Etiqueta del eje X */}
                <span className="text-xs text-gray-500 mt-2 transform rotate-45 origin-left">
                  {new Date(item.date).toLocaleDateString('es-CO', { 
                    month: 'short', 
                    day: 'numeric' 
                  })}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default OrdersChart; 