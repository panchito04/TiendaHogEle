import React from 'react'
import { Lock } from 'lucide-react'

export default function Footer({ onOpenAdminLogin }) {
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
          <p>© {new Date().getFullYear()} Hogar Elegante. Todos los derechos reservados.</p>
          
          <div className="flex items-center space-x-4">
            <span>Catálogo de Venta Directa</span>
            {/* Acceso discreto para el administrador al final de la página */}
            <button
              onClick={onOpenAdminLogin}
              className="inline-flex items-center gap-1 text-gray-400 hover:text-gray-600 transition-colors"
              title="Acceso Administrativo"
            >
              <Lock className="w-3 h-3" />
              <span>Acceso Administrativo</span>
            </button>
          </div>
        </div>
      </div>
    </footer>
  )
}
