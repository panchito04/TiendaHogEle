import React from 'react'
import { X, Check, Video, ArrowDownUp, Filter } from 'lucide-react'

export default function FilterDrawer({
  isOpen,
  onClose,
  categories,
  selectedCategory,
  onSelectCategory,
  sortBy,
  onSelectSortBy,
  onlyWithVideo,
  onToggleOnlyWithVideo,
  countsByCategory = {},
  totalProductsCount = 0,
  onResetFilters
}) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 transition-opacity">
      <div 
        className="w-full sm:max-w-md bg-white rounded-t-2xl sm:rounded-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Cabecera del Drawer */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-800" />
            <h3 className="text-sm font-bold text-gray-900">Filtrar y Ordenar</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Contenido con scroll */}
        <div className="p-4 overflow-y-auto space-y-6 text-xs flex-1">
          
          {/* Ordenar por */}
          <div>
            <span className="block font-bold text-gray-900 text-xs uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <ArrowDownUp className="w-3.5 h-3.5 text-gray-500" />
              Ordenar por
            </span>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'recent', label: 'Recientes' },
                { id: 'price-asc', label: 'Menor Precio' },
                { id: 'price-desc', label: 'Mayor Precio' },
              ].map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => onSelectSortBy(opt.id)}
                  className={`py-2 px-2.5 rounded-lg border text-center font-medium transition-colors ${
                    sortBy === opt.id
                      ? 'border-gray-950 bg-gray-950 text-white'
                      : 'border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Filtro de Video */}
          <div>
            <span className="block font-bold text-gray-900 text-xs uppercase tracking-wider mb-2">
              Filtro de Contenido
            </span>
            <button
              onClick={onToggleOnlyWithVideo}
              className={`w-full flex items-center justify-between p-3 rounded-lg border transition-colors ${
                onlyWithVideo
                  ? 'border-red-600 bg-red-50 text-red-900 font-semibold'
                  : 'border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100'
              }`}
            >
              <div className="flex items-center gap-2">
                <Video className={`w-4 h-4 ${onlyWithVideo ? 'text-red-600' : 'text-gray-400'}`} />
                <span>Solo productos con video demostrativo</span>
              </div>
              <div className={`w-4 h-4 rounded border flex items-center justify-center ${
                onlyWithVideo ? 'bg-red-600 border-red-600 text-white' : 'border-gray-300'
              }`}>
                {onlyWithVideo && <Check className="w-3 h-3 stroke-[3]" />}
              </div>
            </button>
          </div>

          {/* Categorías */}
          <div>
            <span className="block font-bold text-gray-900 text-xs uppercase tracking-wider mb-2">
              Categorías
            </span>
            <div className="space-y-1">
              <button
                onClick={() => onSelectCategory(null)}
                className={`w-full flex items-center justify-between py-2 px-3 rounded-lg transition-colors ${
                  selectedCategory === null
                    ? 'bg-gray-100 font-bold text-gray-900'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <span>Todas las categorías</span>
                {selectedCategory === null && <Check className="w-4 h-4 text-gray-900" />}
              </button>

              {categories.map((cat) => {
                const isSelected = selectedCategory === cat.id_categoria
                const count = countsByCategory[cat.id_categoria] || 0

                return (
                  <button
                    key={cat.id_categoria}
                    onClick={() => onSelectCategory(cat.id_categoria)}
                    className={`w-full flex items-center justify-between py-2 px-3 rounded-lg transition-colors ${
                      isSelected
                        ? 'bg-gray-100 font-bold text-gray-900'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <span>{cat.nombre}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-gray-400">({count})</span>
                      {isSelected && <Check className="w-4 h-4 text-gray-900" />}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

        </div>

        {/* Acciones inferiores */}
        <div className="p-4 border-t border-gray-200 bg-gray-50 flex items-center gap-3">
          <button
            onClick={onResetFilters}
            className="flex-1 py-2.5 px-3 border border-gray-300 bg-white hover:bg-gray-100 text-gray-700 font-semibold rounded-lg text-xs transition-colors"
          >
            Limpiar Filtros
          </button>
          <button
            onClick={onClose}
            className="flex-1 py-2.5 px-3 bg-gray-900 hover:bg-black text-white font-semibold rounded-lg text-xs transition-colors shadow"
          >
            Ver {totalProductsCount} {totalProductsCount === 1 ? 'Producto' : 'Productos'}
          </button>
        </div>

      </div>
    </div>
  )
}
