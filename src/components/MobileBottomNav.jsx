import React from 'react'
import { ShoppingBag, Grid, Heart, MessageCircle } from 'lucide-react'

export default function MobileBottomNav({ 
  currentTab, 
  onSelectTab, 
  favoritesCount = 0,
  onOpenCategories,
  onOpenFavorites
}) {
  const whatsappNumber = import.meta.env.VITE_WHATSAPP_NUMBER || '59170000000'

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-gray-200 pb-safe">
      <div className="grid grid-cols-4 h-14">
        
        {/* Catálogo */}
        <button
          onClick={() => onSelectTab('catalog')}
          className={`flex flex-col items-center justify-center transition-colors ${
            currentTab === 'catalog' ? 'text-gray-950 font-bold' : 'text-gray-500 hover:text-gray-800'
          }`}
        >
          <ShoppingBag className={`w-5 h-5 ${currentTab === 'catalog' ? 'stroke-[2.5]' : 'stroke-2'}`} />
          <span className="text-[10px] mt-0.5">Catálogo</span>
        </button>

        {/* Categorías (Drawer) */}
        <button
          onClick={onOpenCategories}
          className="flex flex-col items-center justify-center text-gray-500 hover:text-gray-800 transition-colors"
        >
          <Grid className="w-5 h-5 stroke-2" />
          <span className="text-[10px] mt-0.5">Filtrar</span>
        </button>

        {/* Guardados / Favoritos */}
        <button
          onClick={onOpenFavorites}
          className={`flex flex-col items-center justify-center relative transition-colors ${
            currentTab === 'favorites' ? 'text-gray-950 font-bold' : 'text-gray-500 hover:text-gray-800'
          }`}
        >
          <div className="relative">
            <Heart className={`w-5 h-5 ${currentTab === 'favorites' ? 'fill-gray-950 stroke-[2.5]' : 'stroke-2'}`} />
            {favoritesCount > 0 && (
              <span className="absolute -top-1 -right-2 bg-red-600 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {favoritesCount}
              </span>
            )}
          </div>
          <span className="text-[10px] mt-0.5">Guardados</span>
        </button>

        {/* Atención WhatsApp */}
        <a
          href={`https://wa.me/${whatsappNumber}?text=Hola%20Hogar%20Elegante,%20deseo%20hacer%20una%20consulta%20sobre%20el%20catálogo`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col items-center justify-center text-green-700 hover:text-green-800 transition-colors"
        >
          <MessageCircle className="w-5 h-5 stroke-2" />
          <span className="text-[10px] mt-0.5 font-medium">WhatsApp</span>
        </a>

      </div>
    </nav>
  )
}
