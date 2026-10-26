import React, { useRef } from 'react'

export default function Footer({ onOpenAdminLogin }) {
  const clickCountRef = useRef(0)
  const clickTimeoutRef = useRef(null)

  // Acceso discreto mediante 3 clics seguidos en el copyright
  const handleSecretClick = () => {
    clickCountRef.current += 1
    if (clickTimeoutRef.current) clearTimeout(clickTimeoutRef.current)

    if (clickCountRef.current >= 3) {
      clickCountRef.current = 0
      if (onOpenAdminLogin) onOpenAdminLogin()
    } else {
      clickTimeoutRef.current = setTimeout(() => {
        clickCountRef.current = 0
      }, 1500)
    }
  }

  return (
    <footer className="mt-16 bg-white border-t border-gray-200 text-gray-500 text-xs py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pb-6 border-b border-gray-100">
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">Hogar Elegante</h4>
            <p className="text-gray-500 leading-relaxed text-[11px]">
              Venta directa de artículos y productos seleccionados para el hogar con pago por código QR y entrega coordinada.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">Métodos de Pago</h4>
            <p className="text-gray-500 leading-relaxed text-[11px]">
              Cobro mediante código QR interbancario (Simple QR, transferencias bancarias nacionales).
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">Soporte y Entregas</h4>
            <p className="text-gray-500 leading-relaxed text-[11px]">
              Una vez confirmado el pago, coordinamos la entrega inmediata vía WhatsApp.
            </p>
          </div>
        </div>

        <div className="pt-4 flex flex-col sm:flex-row items-center justify-between text-[11px] text-gray-400 gap-2">
          {/* El texto del copyright tiene el disparador secreto de 3 clics */}
          <p 
            onClick={handleSecretClick}
            className="cursor-default select-none transition-colors"
            title=""
          >
            © {new Date().getFullYear()} Hogar Elegante. Todos los derechos reservados.
          </p>
          
          <p>Catálogo de Venta Directa</p>
        </div>
      </div>
    </footer>
  )
}
