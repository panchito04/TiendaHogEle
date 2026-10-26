import React, { useState } from 'react'
import { X, QrCode, Play, Image as ImageIcon, ChevronLeft, ChevronRight, Truck, ShieldCheck, Share2, Heart, Check } from 'lucide-react'

export default function ProductDetailModal({ 
  product, 
  onClose, 
  onStartPayment,
  isFavorite = false,
  onToggleFavorite 
}) {
  if (!product) return null

  const photos = Array.isArray(product.fotos) && product.fotos.length > 0 
    ? product.fotos 
    : ['https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=600']

  const [activePhotoIndex, setActivePhotoIndex] = useState(0)
  const [activeTab, setActiveTab] = useState('photos') // 'photos' | 'video'
  const [copiedLink, setCopiedLink] = useState(false)

  const nextPhoto = () => {
    setActivePhotoIndex((prev) => (prev + 1) % photos.length)
  }

  const prevPhoto = () => {
    setActivePhotoIndex((prev) => (prev - 1 + photos.length) % photos.length)
  }

  // Compartir nativo en móvil (WhatsApp / redes)
  const handleShare = async () => {
    const shareData = {
      title: `${product.titulo} - Hogar Elegante`,
      text: `Mira este producto disponible en Hogar Elegante por Bs. ${Number(product.precio).toFixed(2)}: ${product.titulo}`,
      url: window.location.href
    }

    if (navigator.share) {
      try {
        await navigator.share(shareData)
      } catch (err) {
        // Usuario canceló o no soportado
      }
    } else {
      navigator.clipboard.writeText(window.location.href)
      setCopiedLink(true)
      setTimeout(() => setCopiedLink(false), 2000)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 sm:p-4 backdrop-blur-sm">
      <div 
        className="relative w-full h-full sm:h-auto sm:max-w-3xl bg-white sm:rounded-2xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col sm:max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Barra Superior Móvil */}
        <div className="flex items-center justify-between p-3.5 sm:p-4 border-b border-gray-200 bg-white sticky top-0 z-20">
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="p-1.5 rounded-full text-gray-600 hover:text-gray-950 hover:bg-gray-100 transition-colors"
              title="Cerrar"
            >
              <X className="w-5 h-5" />
            </button>
            <span className="text-xs font-bold text-gray-900 truncate max-w-[200px] sm:max-w-xs">
              {product.titulo}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={handleShare}
              className="p-2 rounded-full text-gray-600 hover:text-gray-950 hover:bg-gray-100 transition-colors"
              title="Compartir enlace"
            >
              {copiedLink ? <Check className="w-4 h-4 text-green-600" /> : <Share2 className="w-4 h-4" />}
            </button>
            <button
              onClick={() => onToggleFavorite && onToggleFavorite(product.id)}
              className="p-2 rounded-full text-gray-600 hover:text-red-600 hover:bg-gray-100 transition-colors"
              title={isFavorite ? 'Quitar de guardados' : 'Guardar'}
            >
              <Heart className={`w-4 h-4 ${isFavorite ? 'fill-red-600 text-red-600' : ''}`} />
            </button>
          </div>
        </div>

        {/* Contenido en Scroll */}
        <div className="flex-1 overflow-y-auto pb-24 sm:pb-6">
          <div className="grid grid-cols-1 md:grid-cols-2">
            
            {/* Columna Izquierda: Galería y Video */}
            <div className="p-4 sm:p-6 bg-gray-50/50 border-b md:border-b-0 md:border-r border-gray-200">
              
              {/* Pestañas Fotos / Video */}
              {product.videoUrl && (
                <div className="flex space-x-2 mb-3">
                  <button
                    onClick={() => setActiveTab('photos')}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                      activeTab === 'photos'
                        ? 'bg-white border-gray-950 text-gray-950 shadow-sm'
                        : 'border-transparent text-gray-500 hover:text-gray-900'
                    }`}
                  >
                    Fotos ({photos.length})
                  </button>
                  <button
                    onClick={() => setActiveTab('video')}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                      activeTab === 'video'
                        ? 'bg-white border-gray-950 text-gray-950 shadow-sm'
                        : 'border-transparent text-gray-500 hover:text-gray-900'
                    }`}
                  >
                    <Play className="w-3.5 h-3.5 fill-current text-red-600" />
                    <span>Ver Video</span>
                  </button>
                </div>
              )}

              {/* Visor de Imagen / Video */}
              <div className="relative aspect-square w-full rounded-xl bg-white border border-gray-200 overflow-hidden flex items-center justify-center p-2">
                {activeTab === 'video' && product.videoUrl ? (
                  <div className="w-full h-full flex items-center justify-center bg-black rounded-lg overflow-hidden">
                    {product.videoUrl.includes('youtube.com') || product.videoUrl.includes('youtu.be') ? (
                      <iframe
                        src={product.videoUrl}
                        className="w-full h-full"
                        allowFullScreen
                        title="Video del producto"
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

                    {/* Indicador de fotos 1/N en móvil */}
                    {photos.length > 1 && (
                      <span className="absolute bottom-3 right-3 bg-black/70 text-white text-[10px] font-bold px-2 py-0.5 rounded-full backdrop-blur-sm pointer-events-none">
                        {activePhotoIndex + 1} / {photos.length}
                      </span>
                    )}

                    {/* Flechas de navegación */}
                    {photos.length > 1 && (
                      <>
                        <button
                          onClick={prevPhoto}
                          className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/90 hover:bg-white text-gray-800 shadow-md border border-gray-200 transition-all"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button
                          onClick={nextPhoto}
                          className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/90 hover:bg-white text-gray-800 shadow-md border border-gray-200 transition-all"
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
                <div className="flex gap-2 mt-3 overflow-x-auto py-1 no-scrollbar">
                  {photos.map((foto, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActivePhotoIndex(idx)}
                      className={`w-14 h-14 rounded-lg border bg-white p-1 flex-shrink-0 transition-all ${
                        activePhotoIndex === idx
                          ? 'border-gray-950 ring-2 ring-gray-950/20'
                          : 'border-gray-200 opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img src={foto} alt="" className="w-full h-full object-contain" />
                    </button>
                  ))}
                </div>
              )}

            </div>

            {/* Columna Derecha: Información Detallada */}
            <div className="p-4 sm:p-6 flex flex-col justify-between">
              <div>
                <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                  {product.categoriaNombre}
                </span>

                <h1 className="text-lg sm:text-2xl font-bold text-gray-950 mt-1 leading-snug">
                  {product.titulo}
                </h1>

                {/* Precios y Estado */}
                <div className="mt-3 py-3 border-y border-gray-100 flex items-baseline justify-between">
                  <div>
                    <span className="text-2xl sm:text-3xl font-extrabold text-gray-950">
                      Bs. {Number(product.precio).toFixed(2)}
                    </span>
                    {product.precioAnterior && (
                      <span className="ml-2 text-sm text-gray-400 line-through">
                        Bs. {Number(product.precioAnterior).toFixed(2)}
                      </span>
                    )}
                  </div>
                  <span className="text-xs font-semibold text-green-700 bg-green-50 px-2.5 py-1 rounded-md border border-green-200">
                    Disponible para entrega
                  </span>
                </div>

                {/* Descripción */}
                <div className="mt-4">
                  <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-1.5">
                    Descripción del Artículo
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600 leading-relaxed whitespace-pre-line bg-gray-50 p-3.5 rounded-xl border border-gray-100">
                    {product.descripcion || 'Sin descripción adicional para este producto.'}
                  </p>
                </div>

                {/* Garantías y Entrega */}
                <div className="mt-4 space-y-2.5 text-xs text-gray-600">
                  <div className="flex items-center gap-2.5">
                    <Truck className="w-4 h-4 text-gray-900 flex-shrink-0" />
                    <span>Entrega coordinada de inmediato tras el pago.</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <ShieldCheck className="w-4 h-4 text-gray-900 flex-shrink-0" />
                    <span>Garantía y verificación oficial de Hogar Elegante.</span>
                  </div>
                </div>
              </div>

              {/* Botón Desktop (En móvil usamos la barra inferior fija) */}
              <div className="hidden sm:block mt-6 pt-4 border-t border-gray-100">
                <button
                  onClick={() => {
                    onClose()
                    onStartPayment(product)
                  }}
                  className="w-full flex items-center justify-center gap-2 bg-gray-950 hover:bg-black text-white font-bold py-3.5 px-4 rounded-xl transition-all shadow-md text-sm active:scale-[0.99]"
                >
                  <QrCode className="w-4 h-4" />
                  <span>Pagar con Código QR</span>
                </button>
              </div>

            </div>

          </div>
        </div>

        {/* STICKY BOTTOM BUY BAR (Barra de compra fija inferior en móviles - estilo Mercado Libre / Amazon) */}
        <div className="sm:hidden fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-gray-200 px-4 py-3 flex items-center justify-between shadow-2xl pb-safe">
          <div>
            <span className="text-[10px] text-gray-500 block font-medium">Total a pagar:</span>
            <span className="text-lg font-extrabold text-gray-950 block -mt-0.5">
              Bs. {Number(product.precio).toFixed(2)}
            </span>
          </div>

          <button
            onClick={() => {
              onClose()
              onStartPayment(product)
            }}
            className="flex items-center gap-2 bg-gray-950 hover:bg-black active:scale-95 text-white font-bold text-xs py-3 px-5 rounded-xl shadow transition-all"
          >
            <QrCode className="w-4 h-4" />
            <span>Pagar con QR</span>
          </button>
        </div>

      </div>
    </div>
  )
}
