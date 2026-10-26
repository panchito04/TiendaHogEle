import React, { useState } from 'react'
import { X, QrCode, CheckCircle2, Copy, Check, MessageCircle, Download, ArrowDown } from 'lucide-react'
import { catalogService } from '../services/catalogService'

export default function QrPaymentModal({ product, onClose, onPaymentSuccess }) {
  if (!product) return null

  const whatsappNumber = import.meta.env.VITE_WHATSAPP_NUMBER || '59170000000'
  const [orderCode] = useState(() => 'HE-' + Math.floor(100000 + Math.random() * 900000))
  const [buyerName, setBuyerName] = useState('')
  const [buyerPhone, setBuyerPhone] = useState('')
  const [copiedCode, setCopiedCode] = useState(false)
  const [copiedAmount, setCopiedAmount] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const handleCopyCode = () => {
    navigator.clipboard.writeText(orderCode)
    setCopiedCode(true)
    setTimeout(() => setCopiedCode(false), 2000)
  }

  const handleCopyAmount = () => {
    navigator.clipboard.writeText(Number(product.precio).toFixed(2))
    setCopiedAmount(true)
    setTimeout(() => setCopiedAmount(false), 2000)
  }

  const qrData = product.qrPagoUrl || `HOGAR_ELEGANTE|ORDEN:${orderCode}|MONTO:${product.precio}`
  const qrImageUrl = product.qrPagoUrl || `https://api.qrserver.com/v1/create-qr-code/?size=300x300&margin=8&data=${encodeURIComponent(qrData)}`

  // Descargar imagen QR para pago desde la galería del banco
  const handleDownloadQr = () => {
    const link = document.createElement('a')
    link.href = qrImageUrl
    link.download = `QR-HogarElegante-${orderCode}.png`
    link.target = '_blank'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleConfirmPayment = async () => {
    setIsSubmitting(true)
    try {
      const result = await catalogService.markAsSold(product, {
        buyerName,
        buyerPhone,
        orderCode
      })

      if (result.success) {
        setIsSuccess(true)
        if (onPaymentSuccess) {
          onPaymentSuccess(product.id)
        }
      }
    } catch (err) {
      console.error(err)
      alert('Ocurrió un error al procesar la confirmación.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const whatsappMessage = encodeURIComponent(
    `Hola Hogar Elegante, acabo de realizar la transferencia por QR.\n\n` +
    `📦 Producto: ${product.titulo}\n` +
    `💵 Monto: Bs. ${Number(product.precio).toFixed(2)}\n` +
    `🔖 Código de Pedido: ${orderCode}\n` +
    (buyerName ? `👤 Cliente: ${buyerName}\n` : '') +
    (buyerPhone ? `📱 Teléfono: ${buyerPhone}\n` : '') +
    `Adjunto el comprobante bancario correspondiente.`
  )

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/65 backdrop-blur-sm sm:p-4">
      <div 
        className="relative w-full sm:max-w-md bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl border border-gray-200 overflow-hidden p-4 sm:p-6 max-h-[94vh] overflow-y-auto pb-safe"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Botón Cerrar */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-1.5 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {!isSuccess ? (
          <div>
            <div className="text-center mb-3">
              <h3 className="text-base sm:text-lg font-bold text-gray-950">
                Pago Directo con Código QR
              </h3>
              <p className="text-[11px] text-gray-500 mt-0.5">
                Válido para Simple QR y cualquier aplicación bancaria
              </p>
            </div>

            {/* Resumen del Artículo */}
            <div className="flex items-center gap-3 bg-gray-50 p-2.5 sm:p-3 rounded-xl border border-gray-200 mb-3">
              <img
                src={(product.fotos && product.fotos[0]) || 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=600'}
                alt=""
                className="w-12 h-12 rounded-lg object-contain bg-white border border-gray-200 flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <h4 className="text-xs font-semibold text-gray-900 truncate">{product.titulo}</h4>
                <div className="flex items-baseline justify-between mt-0.5">
                  <span className="text-sm font-extrabold text-gray-950">
                    Bs. {Number(product.precio).toFixed(2)}
                  </span>
                  <button
                    onClick={handleCopyAmount}
                    className="text-[10px] text-gray-500 hover:text-gray-900 underline"
                  >
                    {copiedAmount ? '¡Monto copiado!' : 'Copiar monto'}
                  </button>
                </div>
              </div>
            </div>

            {/* Tarjeta del Código QR */}
            <div className="flex flex-col items-center justify-center p-3 bg-gray-50 rounded-xl border border-gray-200 mb-3">
              <img
                src={qrImageUrl}
                alt="Código QR de Pago"
                className="w-44 h-44 sm:w-48 sm:h-48 object-contain bg-white p-2 rounded-lg border border-gray-200 shadow-sm"
              />

              {/* Botón especial para móviles: Descargar QR para escanear desde galería del banco */}
              <button
                onClick={handleDownloadQr}
                className="mt-2.5 inline-flex items-center gap-1.5 py-1.5 px-3 bg-white hover:bg-gray-100 text-gray-800 text-[11px] font-semibold rounded-lg border border-gray-300 shadow-sm transition-colors active:scale-95"
              >
                <Download className="w-3.5 h-3.5 text-gray-600" />
                <span>Guardar imagen para mi app bancaria</span>
              </button>
            </div>

            {/* Código de Pedido */}
            <div className="flex items-center justify-between bg-gray-100/80 px-3 py-2 rounded-lg border border-gray-200 mb-3 text-xs">
              <span className="text-gray-600 font-medium text-[11px]">Código de Pedido:</span>
              <div className="flex items-center gap-1.5">
                <span className="font-mono font-bold text-gray-900 text-[11px]">{orderCode}</span>
                <button
                  onClick={handleCopyCode}
                  className="p-1 text-gray-500 hover:text-gray-900 transition-colors"
                  title="Copiar código"
                >
                  {copiedCode ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* Datos del Cliente */}
            <div className="space-y-2 mb-3">
              <div>
                <label className="block text-[11px] font-medium text-gray-700 mb-0.5">Nombre Completo</label>
                <input
                  type="text"
                  placeholder="Tu nombre y apellido"
                  value={buyerName}
                  onChange={(e) => setBuyerName(e.target.value)}
                  className="w-full text-xs p-2 rounded-lg border border-gray-300 focus:outline-none focus:border-gray-900"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-gray-700 mb-0.5">Teléfono / WhatsApp de Contacto</label>
                <input
                  type="tel"
                  placeholder="Número para coordinar entrega"
                  value={buyerPhone}
                  onChange={(e) => setBuyerPhone(e.target.value)}
                  className="w-full text-xs p-2 rounded-lg border border-gray-300 focus:outline-none focus:border-gray-900"
                />
              </div>
            </div>

            {/* Botón de Confirmación */}
            <button
              onClick={handleConfirmPayment}
              disabled={isSubmitting}
              className="w-full py-3 px-4 bg-gray-950 hover:bg-black disabled:opacity-50 text-white text-xs font-bold rounded-xl transition-all shadow active:scale-[0.99]"
            >
              {isSubmitting ? 'Confirmando y apartando...' : 'Confirmar que realicé la transferencia QR'}
            </button>

            <p className="text-center text-[10px] text-gray-500 mt-2">
              Al confirmar, el artículo se retira automáticamente del catálogo público.
            </p>
          </div>
        ) : (
          /* Pantalla de Confirmación de Pago */
          <div className="text-center py-4">
            <div className="w-12 h-12 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto mb-3 border border-green-200">
              <CheckCircle2 className="w-7 h-7" />
            </div>

            <h3 className="text-lg font-bold text-gray-950">
              ¡Pago Registrado!
            </h3>
            <p className="text-xs text-gray-600 mt-1 max-w-xs mx-auto">
              El producto ha sido apartado y <strong className="text-gray-900">retirado del catálogo público</strong> para coordinar su entrega.
            </p>

            <div className="bg-gray-50 rounded-xl p-3 border border-gray-200 text-left my-4 text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-gray-500">Artículo:</span>
                <span className="font-semibold text-gray-900 truncate max-w-[200px]">{product.titulo}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Monto:</span>
                <span className="font-semibold text-gray-900">Bs. {Number(product.precio).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Código de Pedido:</span>
                <span className="font-mono font-bold text-gray-900">{orderCode}</span>
              </div>
            </div>

            <div className="space-y-2">
              <a
                href={`https://wa.me/${whatsappNumber}?text=${whatsappMessage}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-xl text-xs transition-colors shadow active:scale-95"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Enviar Comprobante por WhatsApp</span>
              </a>

              <button
                onClick={onClose}
                className="w-full py-2.5 text-xs font-semibold text-gray-500 hover:text-gray-900 transition-colors"
              >
                Cerrar y Volver al Catálogo
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
