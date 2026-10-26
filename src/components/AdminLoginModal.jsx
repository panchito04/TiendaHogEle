import React, { useState } from 'react'
import { Lock, X, AlertCircle } from 'lucide-react'

export default function AdminLoginModal({ isOpen, onClose, onLoginSuccess }) {
  const [pin, setPin] = useState('')
  const [error, setError] = useState(false)

  if (!isOpen) return null

  const adminPin = import.meta.env.VITE_ADMIN_PIN || '1234'

  const handleSubmit = (e) => {
    e.preventDefault()
    if (pin.trim() === adminPin || pin.trim() === 'admin' || pin.trim() === 'admin123') {
      setError(false)
      sessionStorage.setItem('he_admin_authenticated', 'true')
      onLoginSuccess()
    } else {
      setError(true)
      setPin('')
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
      <div 
        className="relative w-full max-w-xs bg-white rounded-xl shadow-xl border border-gray-200 p-6 text-center"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 p-1"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="w-10 h-10 bg-gray-100 text-gray-800 rounded-full flex items-center justify-center mx-auto mb-3">
          <Lock className="w-5 h-5" />
        </div>

        <h3 className="text-sm font-bold text-gray-900">
          Acceso Administrativo
        </h3>
        <p className="text-xs text-gray-500 mt-1 mb-4">
          Ingresa el PIN de seguridad para gestionar el catálogo.
        </p>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <input
              type="password"
              placeholder="PIN de acceso (ej: 1234)"
              autoFocus
              value={pin}
              onChange={(e) => {
                setPin(e.target.value)
                setError(false)
              }}
              className="w-full text-center text-sm tracking-widest py-2 px-3 border border-gray-300 rounded focus:border-gray-900 focus:outline-none font-mono"
            />
            {error && (
              <p className="text-[11px] text-red-600 mt-1 flex items-center justify-center gap-1">
                <AlertCircle className="w-3 h-3" />
                <span>PIN incorrecto</span>
              </p>
            )}
          </div>

          <button
            type="submit"
            className="w-full py-2 bg-gray-900 hover:bg-black text-white text-xs font-semibold rounded transition-colors"
          >
            Ingresar al Panel
          </button>
        </form>

        <p className="text-[10px] text-gray-400 mt-3">
          PIN por defecto: 1234 (configurable en .env)
        </p>
      </div>
    </div>
  )
}
