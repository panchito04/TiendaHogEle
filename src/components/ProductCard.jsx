import React from 'react'
import { QrCode, Play, Image as ImageIcon, Heart } from 'lucide-react'

export default function ProductCard({ 
  product, 
  onOpenDetails, 
  onStartPayment,
  isFavorite = false,
  onToggleFavorite
}) {
  const hasVideo = Boolean(product.videoUrl)
  const photosCount = Array.isArray(product.fotos) ? product.fotos.length : 0
  const mainPhoto = (product.fotos && product.fotos[0]) || 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=600'

  const handleFavoriteClick = (e) => {
    e.stopPropagation()
    if (onToggleFavorite) onToggleFavorite(product.id)
  }

  return (
    <div 
      onClick={() => onOpenDetails(product)}
      className="bg-white rounded-xl border border-gray-200 overflow-hidden flex flex-col justify-between hover:border-gray-300 hover:shadow-sm transition-all duration-200 cursor-pointer select-none active:bg-gray-50/50"
    >
      
      {/* Contenedor de Imagen */}
      <div className="relative aspect-square w-full bg-gray-50 overflow-hidden flex items-center justify-center p-2.5 sm:p-4">
        <img
          src={mainPhoto}
          alt={product.titulo}
          className="w-full h-full object-contain transition-transform duration-300 hover:scale-105"
          loading="lazy"
        />

        {/* Botón Favoritos (Esquina Superior Derecha) */}
        <button
          onClick={handleFavoriteClick}
          className="absolute top-2 right-2 p-1.5 rounded-full bg-white/90 hover:bg-white text-gray-400 hover:text-red-600 shadow-sm transition-colors z-10"
          title={isFavorite ? 'Quitar de guardados' : 'Guardar artículo'}
        >
          <Heart className={`w-4 h-4 ${isFavorite ? 'fill-red-600 text-red-600' : 'text-gray-400'}`} />
        </button>

        {/* Badges superiores izquierdos */}
        <div className="absolute top-2 left-2 flex flex-col gap-1 pointer-events-none">
          {hasVideo && (
            <span className="inline-flex items-center gap-1 bg-black/80 text-white text-[9px] sm:text-[10px] font-semibold px-1.5 py-0.5 rounded">
              <Play className="w-2.5 h-2.5 fill-current text-red-500" />
              Video
            </span>
          )}
          {photosCount > 1 && (
            <span className="inline-flex items-center gap-1 bg-black/60 text-white text-[9px] sm:text-[10px] font-medium px-1.5 py-0.5 rounded">
              <ImageIcon className="w-2.5 h-2.5" />
              {photosCount}
            </span>
          )}
        </div>
      </div>

      {/* Información del Producto */}
      <div className="p-3 sm:p-4 flex-1 flex flex-col justify-between">
        <div>
          <span className="text-[10px] sm:text-[11px] font-medium text-gray-500 uppercase tracking-wide block truncate">
            {product.categoriaNombre}
          </span>

          <h3 className="text-xs sm:text-sm font-semibold text-gray-950 mt-0.5 line-clamp-2 leading-snug min-h-[32px] sm:min-h-[40px]">
            {product.titulo}
          </h3>
        </div>

        {/* Precios y Botón de Acción */}
        <div className="mt-2.5 pt-2 border-t border-gray-100">
          <div className="mb-2">
            <span className="text-sm sm:text-base font-extrabold text-gray-950 block">
              Bs. {Number(product.precio).toFixed(2)}
            </span>
            {product.precioAnterior && (
              <span className="text-[10px] sm:text-xs text-gray-400 line-through block -mt-0.5">
                Bs. {Number(product.precioAnterior).toFixed(2)}
              </span>
            )}
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation()
              onStartPayment(product)
            }}
            className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-2 text-[11px] sm:text-xs font-semibold text-white bg-gray-950 hover:bg-black active:scale-[0.98] rounded-lg transition-all"
          >
            <QrCode className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="truncate">Pagar con QR</span>
          </button>
        </div>

      </div>

    </div>
  )
}
