import React, { useState } from 'react'
import { X, QrCode, CheckCircle2, Copy, Check, MessageCircle, AlertCircle } from 'lucide-react'
import { catalogService } from '../services/catalogService'

export default function QrPaymentModal({ product, onClose, onPaymentSuccess }) {
  if (!product) return null

  const whatsappNumber = import.meta.env.VITE_WHATSAPP_NUMBER || '59170000000'
  const [orderCode] = useState(() => 'HE-' + Math.floor(100000 + Math.random() * 900000))
  const [buyerName, setBuyerName] = useState('')
  const [buyerPhone, setBuyerPhone] = useState('')
  const [copiedCode, setCopiedCode] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const handleCopyCode = () => {
    navigator.clipboard.writeText(orderCode)
    setCopiedCode(true)
    setTimeout(() => setCopiedCode(false), 2000)
  }

  const qrData = product.qrPagoUrl || `HOGAR_ELEGANTE|ORDEN:${orderCode}|MONTO:${product.precio}`
  const qrImageUrl = product.qrPagoUrl || `https://api.qrserver.com/v1/create-qr-code/?size=260x260&margin=8&data=${encodeURIComponent(qrData)}`

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
    `Producto: ${product.titulo}\n` +
    `Monto: Bs. ${Number(product.precio).toFixed(2)}\n` +
    `Código de Pedido: ${orderCode}\n` +
    (buyerName ? `Cliente: ${buyerName}\n` : '') +
    (buyerPhone ? `Teléfono: ${buyerPhone}\n` : '') +
    `Adjunto el comprobante bancario correspondiente.`
  )

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60">
      <div 
        className="relative w-full max-w-md bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden p-5 sm:p-6 max-h-[92vh] overflow-y-auto"
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
            <div className="text-center mb-4">
              <h3 className="text-lg font-bold text-gray-900">
                Pago Directo con Código QR
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Escanea el código desde tu aplicación bancaria
              </p>
            </div>

            {/* Resumen del Pedido */}
            <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg border border-gray-200 mb-4">
              <img
                src={(product.fotos && product.fotos[0]) || 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=600'}
                alt=""
                className="w-12 h-12 rounded object-contain bg-white border border-gray-200"
              />
              <div className="flex-1 min-w-0">
                <h4 className="text-xs font-semibold text-gray-900 truncate">{product.titulo}</h4>
                <div className="text-sm font-bold text-gray-900 mt-0.5">
                  Total a pagar: Bs. {Number(product.precio).toFixed(2)}
                </div>
              </div>
            </div>

            {/* Imagen del QR */}
            <div className="flex flex-col items-center justify-center p-3 bg-gray-50 rounded-lg border border-gray-200 mb-4">
              <img
                src={qrImageUrl}
                alt="Código QR de Pago"
                className="w-48 h-48 object-contain bg-white p-2 rounded border border-gray-200"
              />
              <span className="text-[11px] text-gray-500 mt-2 font-medium">
                Válido para Simple QR y transferencias interbancarias
              </span>
            </div>

            {/* Código de Pedido */}
            <div className="flex items-center justify-between bg-gray-100/70 px-3 py-2 rounded border border-gray-200 mb-4 text-xs">
              <span className="text-gray-600 font-medium">Código de Pedido:</span>
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-gray-900">{orderCode}</span>
                <button
                  onClick={handleCopyCode}
                  className="p-1 text-gray-500 hover:text-gray-900 transition-colors"
                  title="Copiar código"
                >
                  {copiedCode ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* Datos del Comprador */}
            <div className="space-y-2 mb-4">
              <div>
                <label className="block text-[11px] font-medium text-gray-700 mb-1">Nombre Completo</label>
                <input
                  type="text"
                  placeholder="Ej. Juan Pérez"
                  value={buyerName}
                  onChange={(e) => setBuyerName(e.target.value)}
                  className="w-full text-xs p-2 rounded border border-gray-300 focus:outline-none focus:border-gray-900"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-gray-700 mb-1">Teléfono o WhatsApp de Contacto</label>
                <input
                  type="text"
                  placeholder="Ej. 70012345"
                  value={buyerPhone}
                  onChange={(e) => setBuyerPhone(e.target.value)}
                  className="w-full text-xs p-2 rounded border border-gray-300 focus:outline-none focus:border-gray-900"
                />
              </div>
            </div>

            {/* Botón de Confirmación */}
            <button
              onClick={handleConfirmPayment}
              disabled={isSubmitting}
              className="w-full py-2.5 px-4 bg-gray-900 hover:bg-black disabled:opacity-50 text-white text-xs font-semibold rounded-lg transition-colors"
            >
              {isSubmitting ? 'Confirmando...' : 'Confirmar que realicé el pago'}
            </button>

            <p className="text-center text-[10px] text-gray-500 mt-2">
              Al confirmar, el producto será apartado y retirado del catálogo público.
            </p>
          </div>
        ) : (
          /* Pantalla de Confirmación */
          <div className="text-center py-4">
            <div className="w-12 h-12 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto mb-3 border border-green-200">
              <CheckCircle2 className="w-7 h-7" />
            </div>

            <h3 className="text-lg font-bold text-gray-900">
              Pago Registrado
            </h3>
            <p className="text-xs text-gray-600 mt-1 max-w-xs mx-auto">
              El producto ha sido apartado y retirado del catálogo público para coordinar su entrega.
            </p>

            <div className="bg-gray-50 rounded-lg p-3 border border-gray-200 text-left my-4 text-xs space-y-1.5">
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
                className="w-full inline-flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-medium py-2.5 px-4 rounded-lg text-xs transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Enviar Comprobante por WhatsApp</span>
              </a>

              <button
                onClick={onClose}
                className="w-full py-2 text-xs font-medium text-gray-600 hover:text-gray-900 transition-colors"
              >
                Finalizar y Volver al Catálogo
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
