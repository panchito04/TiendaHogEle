import React from 'react'
import { Search, MessageCircle, ArrowLeft, LogOut } from 'lucide-react'
import logo from '../assets/logoHogar.jpg'

export default function Navbar({ 
  searchQuery, 
  setSearchQuery, 
  currentView, 
  setCurrentView,
  onLogoutAdmin,
  catalogCount = 0 
}) {
  const whatsappNumber = import.meta.env.VITE_WHATSAPP_NUMBER || '59170000000'

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Logo y Nombre Comercial */}
          <div 
            onClick={() => setCurrentView('catalog')}
            className="flex items-center space-x-3 cursor-pointer select-none"
          >
            <img 
              src={logo} 
              alt="Hogar Elegante" 
              className="w-9 h-9 rounded object-cover border border-gray-200"
            />
            <div>
              <span className="text-base sm:text-lg font-bold tracking-tight text-gray-900 block leading-tight">
                Hogar Elegante
              </span>
              <span className="text-[11px] text-gray-500 block">
                {currentView === 'admin' ? 'Panel de Control del Catálogo' : 'Catálogo de Venta Directa'}
              </span>
            </div>
          </div>

          {/* Buscador (Solo visible en vista pública) */}
          {currentView === 'catalog' && (
            <div className="hidden md:flex flex-1 max-w-lg mx-4">
              <div className="relative w-full">
                <input
                  type="text"
                  placeholder="Buscar producto por nombre o categoría..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-gray-50 hover:bg-gray-100/80 focus:bg-white text-sm text-gray-800 pl-3.5 pr-9 py-2 rounded-lg border border-gray-300 focus:outline-none focus:border-gray-900 transition-colors"
                />
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              </div>
            </div>
          )}

          {/* Opciones de la Derecha */}
          <div className="flex items-center space-x-3">
            {currentView === 'catalog' ? (
              /* Vista Pública: SOLO WhatsApp de Atención al Cliente */
              <a
                href={`https://wa.me/${whatsappNumber}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-gray-700 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 border border-gray-200 px-3 py-1.5 rounded-md transition-colors font-medium"
              >
                <MessageCircle className="w-4 h-4 text-green-600" />
                <span className="hidden sm:inline">Atención al Cliente</span>
              </a>
            ) : (
              /* Vista Administrativa Privada */
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setCurrentView('catalog')}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-gray-900 hover:bg-black px-3 py-1.5 rounded-md transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Ver Tienda ({catalogCount})</span>
                </button>
                <button
                  onClick={onLogoutAdmin}
                  className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-red-600 p-1.5 rounded hover:bg-gray-100 transition-colors"
                  title="Cerrar Sesión Administrador"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

        </div>

        {/* Buscador móvil en catálogo */}
        {currentView === 'catalog' && (
          <div className="md:hidden pb-3">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Buscar productos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-gray-50 text-sm text-gray-800 pl-3.5 pr-9 py-2 rounded-lg border border-gray-300 focus:outline-none focus:border-gray-900"
              />
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            </div>
          </div>
        )}

      </div>
    </header>
  )
}
