import React from 'react'
import { QrCode, Play, Image as ImageIcon } from 'lucide-react'

export default function ProductCard({ product, onOpenDetails, onStartPayment }) {
  const hasVideo = Boolean(product.videoUrl)
  const photosCount = Array.isArray(product.fotos) ? product.fotos.length : 0
  const mainPhoto = (product.fotos && product.fotos[0]) || 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=600'

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden flex flex-col justify-between hover:border-gray-300 hover:shadow-sm transition-all duration-200">
      
      {/* Contenedor de Imagen */}
      <div 
        onClick={() => onOpenDetails(product)}
        className="relative aspect-square w-full bg-gray-50 overflow-hidden cursor-pointer flex items-center justify-center p-3"
      >
        <img
          src={mainPhoto}
          alt={product.titulo}
          className="w-full h-full object-contain hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />

        {/* Indicadores sutiles */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {hasVideo && (
            <span className="inline-flex items-center gap-1 bg-black/75 text-white text-[10px] font-medium px-2 py-0.5 rounded">
              <Play className="w-2.5 h-2.5 fill-current" />
              Video
            </span>
          )}
          {photosCount > 1 && (
            <span className="inline-flex items-center gap-1 bg-black/60 text-white text-[10px] font-medium px-1.5 py-0.5 rounded">
              <ImageIcon className="w-2.5 h-2.5" />
              {photosCount}
            </span>
          )}
        </div>
      </div>

      {/* Información del Producto */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <span className="text-[11px] font-medium text-gray-500 uppercase tracking-wide">
            {product.categoriaNombre}
          </span>

          <h3 
            onClick={() => onOpenDetails(product)}
            className="text-sm font-semibold text-gray-900 mt-0.5 hover:text-gray-700 cursor-pointer line-clamp-2 min-h-[40px]"
          >
            {product.titulo}
          </h3>

          {product.descripcion && (
            <p className="mt-1 text-xs text-gray-500 line-clamp-2">
              {product.descripcion}
            </p>
          )}
        </div>

        {/* Precios y Botón de Pago */}
        <div className="mt-4 pt-3 border-t border-gray-100">
          <div className="flex items-baseline justify-between mb-3">
            <div>
              <span className="text-lg font-bold text-gray-900">
                Bs. {Number(product.precio).toFixed(2)}
              </span>
              {product.precioAnterior && (
                <span className="ml-2 text-xs text-gray-400 line-through">
                  Bs. {Number(product.precioAnterior).toFixed(2)}
                </span>
              )}
            </div>
            <span className="text-[11px] font-medium text-green-700 bg-green-50 px-2 py-0.5 rounded border border-green-200">
              Disponible
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => onOpenDetails(product)}
              className="w-full text-center py-2 px-2 text-xs font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 rounded border border-gray-200 transition-colors"
            >
              Detalles
            </button>

            <button
              onClick={() => onStartPayment(product)}
              className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-2 text-xs font-semibold text-white bg-gray-900 hover:bg-black rounded transition-colors"
            >
              <QrCode className="w-3.5 h-3.5" />
              <span>Pagar con QR</span>
            </button>
          </div>
        </div>

      </div>

    </div>
  )
}
