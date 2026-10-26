import React from 'react'

export default function CategoryBar({ 
  categories, 
  selectedCategory, 
  onSelectCategory, 
  countsByCategory = {} 
}) {
  const totalCount = Object.values(countsByCategory).reduce((acc, curr) => acc + curr, 0)

  return (
    <div className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center space-x-1 overflow-x-auto py-2 no-scrollbar text-xs">
          
          <button
            onClick={() => onSelectCategory(null)}
            className={`px-3 py-1.5 rounded-md font-medium whitespace-nowrap transition-colors ${
              selectedCategory === null
                ? 'bg-gray-900 text-white'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            Todos ({totalCount})
          </button>

          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.id_categoria
            const count = countsByCategory[cat.id_categoria] || 0

            return (
              <button
                key={cat.id_categoria}
                onClick={() => onSelectCategory(cat.id_categoria)}
                className={`px-3 py-1.5 rounded-md font-medium whitespace-nowrap transition-colors ${
                  isSelected
                    ? 'bg-gray-900 text-white'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                {cat.nombre} {count > 0 && <span className="text-[11px] opacity-75">({count})</span>}
              </button>
            )
          })}

        </div>
      </div>
    </div>
  )
}
