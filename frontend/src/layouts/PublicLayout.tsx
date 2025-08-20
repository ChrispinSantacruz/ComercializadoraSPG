import React from 'react';
import { Outlet } from 'react-router-dom';
import SupportChat from '../components/support/SupportChat';
import Footer from '../components/ui/Footer';
import Navbar from '../components/ui/Navbar';

const PublicLayout: React.FC = () => {

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Navbar fijo arriba */}
      <div className="fixed top-0 left-0 right-0 z-50">
        <Navbar />
      </div>

      {/* Contenido principal con padding-top para evitar superposición */}
      <main className="flex-1 pt-32">
        <Outlet />
      </main>

      {/* Footer */}
      <Footer />

      {/* Chat de Soporte */}
      <SupportChat />
    </div>
  );
};

export default PublicLayout; 