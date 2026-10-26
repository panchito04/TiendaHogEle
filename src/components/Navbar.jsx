import React from 'react'
import { Search, MessageCircle, ArrowLeft, LogOut, SlidersHorizontal, Heart, X } from 'lucide-react'
import logo from '../assets/logoHogar.jpg'

export default function Navbar({ 
  searchQuery, 
  setSearchQuery, 
  currentView, 
  setCurrentView,
  onLogoutAdmin,
  catalogCount = 0,
  onOpenFilterDrawer,
  hasActiveFilters = false,
  favoritesCount = 0,
  onToggleFavoritesView,
  isFavoritesView = false
}) {
  const whatsappNumber = import.meta.env.VITE_WHATSAPP_NUMBER || '59170000000'

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        
        {/* Fila Principal */}
        <div className="flex items-center justify-between h-14 sm:h-16 gap-3">
          
          {/* Logo y Nombre Comercial */}
          <div 
            onClick={() => {
              if (isFavoritesView && onToggleFavoritesView) onToggleFavoritesView()
              setCurrentView('catalog')
            }}
            className="flex items-center space-x-2.5 cursor-pointer select-none min-w-0"
          >
            <img 
              src={logo} 
              alt="Hogar Elegante" 
              className="w-8 h-8 sm:w-9 sm:h-9 rounded object-cover border border-gray-200 flex-shrink-0"
            />
            <div className="truncate">
              <span className="text-sm sm:text-lg font-bold tracking-tight text-gray-950 block leading-tight truncate">
                Hogar Elegante
              </span>
              <span className="text-[10px] sm:text-[11px] text-gray-500 block truncate">
                {currentView === 'admin' ? 'Panel de Control' : 'Catálogo de Venta Directa'}
              </span>
            </div>
          </div>

          {/* Buscador de Escritorio */}
          {currentView === 'catalog' && (
            <div className="hidden md:flex flex-1 max-w-lg mx-6">
              <div className="relative w-full">
                <input
                  type="text"
                  placeholder="Buscar productos en el catálogo..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-gray-50 hover:bg-gray-100/70 focus:bg-white text-xs text-gray-800 pl-3.5 pr-8 py-2 rounded-lg border border-gray-300 focus:outline-none focus:border-gray-900 transition-colors"
                />
                {searchQuery ? (
                  <button 
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <Search className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                )}
              </div>
            </div>
          )}

          {/* Botones de Acción Superiores */}
          <div className="flex items-center space-x-2 flex-shrink-0">
            {currentView === 'catalog' ? (
              <>
                {/* Botón Filtros (Móvil) */}
                <button
                  onClick={onOpenFilterDrawer}
                  className={`md:hidden relative p-2 rounded-lg border text-gray-700 transition-colors ${
                    hasActiveFilters ? 'border-gray-950 bg-gray-100 font-bold' : 'border-gray-200 bg-gray-50'
                  }`}
                  title="Filtros y ordenamiento"
                >
                  <SlidersHorizontal className="w-4 h-4" />
                  {hasActiveFilters && (
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-gray-950 rounded-full" />
                  )}
                </button>

                {/* Botón Favoritos (Escritorio) */}
                <button
                  onClick={onToggleFavoritesView}
                  className={`hidden sm:inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-md border transition-colors ${
                    isFavoritesView
                      ? 'bg-gray-900 text-white border-gray-900'
                      : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border-gray-200'
                  }`}
                  title="Ver guardados"
                >
                  <Heart className={`w-3.5 h-3.5 ${isFavoritesView ? 'fill-white' : ''}`} />
                  <span>Guardados ({favoritesCount})</span>
                </button>

                {/* WhatsApp */}
                <a
                  href={`https://wa.me/${whatsappNumber}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hidden lg:inline-flex items-center gap-1.5 text-xs text-gray-700 hover:text-gray-950 bg-gray-50 hover:bg-gray-100 border border-gray-200 px-3 py-1.5 rounded-md transition-colors font-medium"
                >
                  <MessageCircle className="w-4 h-4 text-green-600" />
                  <span>Atención al Cliente</span>
                </a>
              </>
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

        {/* Buscador móvil expandido debajo del logo */}
        {currentView === 'catalog' && (
          <div className="md:hidden pb-2.5">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Buscar por nombre o descripción..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-gray-100/80 focus:bg-white text-xs text-gray-800 pl-3.5 pr-8 py-2 rounded-lg border border-gray-200 focus:outline-none focus:border-gray-900"
              />
              {searchQuery ? (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 p-1"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              ) : (
                <Search className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              )}
            </div>
          </div>
        )}

      </div>
    </header>
  )
}
