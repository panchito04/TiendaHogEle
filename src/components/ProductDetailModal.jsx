import React, { useState } from 'react'
import { X, QrCode, Play, Image as ImageIcon, ChevronLeft, ChevronRight, Truck, ShieldCheck } from 'lucide-react'

export default function ProductDetailModal({ product, onClose, onStartPayment }) {
  if (!product) return null

  const photos = Array.isArray(product.fotos) && product.fotos.length > 0 
    ? product.fotos 
    : ['https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=600']

  const [activePhotoIndex, setActivePhotoIndex] = useState(0)
  const [activeTab, setActiveTab] = useState('photos') // 'photos' | 'video'

  const nextPhoto = () => {
    setActivePhotoIndex((prev) => (prev + 1) % photos.length)
  }

  const prevPhoto = () => {
    setActivePhotoIndex((prev) => (prev - 1 + photos.length) % photos.length)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60">
      <div 
        className="relative w-full max-w-3xl bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Botón Cerrar */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-10 p-1.5 rounded-full text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 overflow-y-auto">
          
          {/* Columna Izquierda: Galería y Video */}
          <div className="p-4 sm:p-6 bg-gray-50 border-b md:border-b-0 md:border-r border-gray-200 flex flex-col justify-between">
            
            {/* Pestañas Fotos / Video si existe video */}
            {product.videoUrl && (
              <div className="flex space-x-2 mb-3">
                <button
                  onClick={() => setActiveTab('photos')}
                  className={`px-3 py-1 text-xs font-medium rounded border ${
                    activeTab === 'photos'
                      ? 'bg-white border-gray-400 text-gray-900 shadow-sm'
                      : 'border-transparent text-gray-500 hover:text-gray-900'
                  }`}
                >
                  Fotos ({photos.length})
                </button>
                <button
                  onClick={() => setActiveTab('video')}
                  className={`inline-flex items-center gap-1 px-3 py-1 text-xs font-medium rounded border ${
                    activeTab === 'video'
                      ? 'bg-white border-gray-400 text-gray-900 shadow-sm'
                      : 'border-transparent text-gray-500 hover:text-gray-900'
                  }`}
                >
                  <Play className="w-3 h-3 fill-current text-red-600" />
                  <span>Video</span>
                </button>
              </div>
            )}

            {/* Visor Principal */}
            <div className="relative aspect-square w-full rounded-lg bg-white border border-gray-200 overflow-hidden flex items-center justify-center p-2">
              {activeTab === 'video' && product.videoUrl ? (
                <div className="w-full h-full flex items-center justify-center bg-black">
                  {product.videoUrl.includes('youtube.com') || product.videoUrl.includes('youtu.be') ? (
                    <iframe
                      src={product.videoUrl}
                      className="w-full h-full"
                      allowFullScreen
                      title="Video demostrativo"
                    />
                  ) : (
                    <video
                      src={product.videoUrl}
                      controls
                      autoPlay
                      className="w-full h-full object-contain"
                    />
                  )}
                </div>
              ) : (
                <>
                  <img
                    src={photos[activePhotoIndex]}
                    alt={product.titulo}
                    className="w-full h-full object-contain"
                  />

                  {photos.length > 1 && (
                    <>
                      <button
                        onClick={prevPhoto}
                        className="absolute left-2 top-1/2 -translate-y-1/2 p-1 rounded-full bg-white/80 hover:bg-white text-gray-800 shadow border border-gray-200"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <button
                        onClick={nextPhoto}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-full bg-white/80 hover:bg-white text-gray-800 shadow border border-gray-200"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </>
              )}
            </div>

            {/* Miniaturas */}
            {activeTab === 'photos' && photos.length > 1 && (
              <div className="flex gap-2 mt-3 overflow-x-auto py-1">
                {photos.map((foto, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActivePhotoIndex(idx)}
                    className={`w-12 h-12 rounded border bg-white p-0.5 flex-shrink-0 ${
                      activePhotoIndex === idx ? 'border-gray-900 ring-1 ring-gray-900' : 'border-gray-200 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={foto} alt="" className="w-full h-full object-contain" />
                  </button>
                ))}
              </div>
            )}

          </div>

          {/* Columna Derecha: Información */}
          <div className="p-6 flex flex-col justify-between">
            <div>
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                {product.categoriaNombre}
              </span>

              <h2 className="text-xl font-bold text-gray-900 mt-1">
                {product.titulo}
              </h2>

              <div className="mt-3 py-2 border-y border-gray-100 flex items-baseline justify-between">
                <div>
                  <span className="text-2xl font-bold text-gray-900">
                    Bs. {Number(product.precio).toFixed(2)}
                  </span>
                  {product.precioAnterior && (
                    <span className="ml-2 text-sm text-gray-400 line-through">
                      Bs. {Number(product.precioAnterior).toFixed(2)}
                    </span>
                  )}
                </div>
                <span className="text-xs font-semibold text-green-700 bg-green-50 px-2 py-0.5 rounded border border-green-200">
                  En Stock
                </span>
              </div>

              {/* Descripción */}
              <div className="mt-4">
                <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                  Descripción
                </h4>
                <p className="text-xs text-gray-600 leading-relaxed whitespace-pre-line bg-gray-50 p-3 rounded border border-gray-100">
                  {product.descripcion || 'Sin descripción adicional para este producto.'}
                </p>
              </div>

              {/* Condiciones comerciales estándar */}
              <div className="mt-4 space-y-2 text-xs text-gray-500">
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-gray-700 flex-shrink-0" />
                  <span>Entrega coordinada tras la confirmación del pago.</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-gray-700 flex-shrink-0" />
                  <span>Producto verificado por Hogar Elegante.</span>
                </div>
              </div>
            </div>

            {/* Acción de Pago */}
            <div className="mt-6 pt-4 border-t border-gray-100">
              <button
                onClick={() => {
                  onClose()
                  onStartPayment(product)
                }}
                className="w-full flex items-center justify-center gap-2 bg-gray-900 hover:bg-black text-white font-semibold py-3 px-4 rounded-lg transition-colors text-sm"
              >
                <QrCode className="w-4 h-4" />
                <span>Pagar con Código QR</span>
              </button>
            </div>

          </div>

        </div>

      </div>
    </div>
  )
}
