import React, { useState, useEffect, useMemo } from 'react'
import Navbar from './components/Navbar'
import CategoryBar from './components/CategoryBar'
import ProductCard from './components/ProductCard'
import ProductDetailModal from './components/ProductDetailModal'
import QrPaymentModal from './components/QrPaymentModal'
import AdminPanel from './components/AdminPanel'
import AdminLoginModal from './components/AdminLoginModal'
import FilterDrawer from './components/FilterDrawer'
import MobileBottomNav from './components/MobileBottomNav'
import Footer from './components/Footer'
import { catalogService } from './services/catalogService'
import { RefreshCw, Package, Heart, SlidersHorizontal, ArrowUpDown } from 'lucide-react'

export default function App() {
  const [currentView, setCurrentView] = useState('catalog') // 'catalog' | 'admin'
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(() => {
    return sessionStorage.getItem('he_admin_authenticated') === 'true'
  })
  const [showAdminLoginModal, setShowAdminLoginModal] = useState(false)

  // Datos principales
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  // Modales
  const [activeProduct, setActiveProduct] = useState(null)
  const [paymentProduct, setPaymentProduct] = useState(null)
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false)

  // Filtros avanzados y ordenamiento
  const [sortBy, setSortBy] = useState('recent') // 'recent' | 'price-asc' | 'price-desc'
  const [onlyWithVideo, setOnlyWithVideo] = useState(false)

  // Guardados / Favoritos
  const [favorites, setFavorites] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('he_favorites') || '[]')
    } catch {
      return []
    }
  })
  const [isFavoritesView, setIsFavoritesView] = useState(false)

  // Pestaña activa en barra móvil inferior
  const [mobileTab, setMobileTab] = useState('catalog')

  // Detección de ruta secreta: #admin o /admin
  useEffect(() => {
    const checkHashOrPath = () => {
      const hash = window.location.hash
      const path = window.location.pathname
      if (hash === '#admin' || path === '/admin') {
        if (sessionStorage.getItem('he_admin_authenticated') === 'true') {
          setCurrentView('admin')
        } else {
          setShowAdminLoginModal(true)
        }
      }
    }

    checkHashOrPath()
    window.addEventListener('hashchange', checkHashOrPath)
    return () => window.removeEventListener('hashchange', checkHashOrPath)
  }, [])

  // Cargar catálogo inicial
  const loadPublishedCatalog = async () => {
    setIsLoading(true)
    try {
      const [cats, prods] = await Promise.all([
        catalogService.getCategories(),
        catalogService.getPublishedCatalog()
      ])
      setCategories(cats)
      setProducts(prods)
    } catch (err) {
      console.error('Error al cargar catálogo:', err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadPublishedCatalog()
  }, [])

  // Toggle Favoritos
  const handleToggleFavorite = (productId) => {
    setFavorites((prev) => {
      const next = prev.includes(productId) 
        ? prev.filter((id) => id !== productId) 
        : [...prev, productId]
      localStorage.setItem('he_favorites', JSON.stringify(next))
      return next
    })
  }

  // Al volver del panel de administración
  const handleBackToCatalog = () => {
    setCurrentView('catalog')
    window.location.hash = ''
    loadPublishedCatalog()
  }

  // Login de Administrador
  const handleAdminLoginSuccess = () => {
    setIsAdminAuthenticated(true)
    setShowAdminLoginModal(false)
    setCurrentView('admin')
    window.location.hash = 'admin'
  }

  // Logout de Administrador
  const handleAdminLogout = () => {
    sessionStorage.removeItem('he_admin_authenticated')
    setIsAdminAuthenticated(false)
    setCurrentView('catalog')
    window.location.hash = ''
    loadPublishedCatalog()
  }

  // Abrir login de administrador
  const handleOpenAdminLogin = () => {
    if (isAdminAuthenticated) {
      setCurrentView('admin')
      window.location.hash = 'admin'
    } else {
      setShowAdminLoginModal(true)
    }
  }

  // Retirar producto tras confirmación de pago
  const handlePaymentSuccess = (soldId) => {
    setProducts((prev) => prev.filter((p) => p.id !== soldId))
    setFavorites((prev) => prev.filter((id) => id !== soldId))
  }

  // Reset de filtros
  const handleResetFilters = () => {
    setSelectedCategory(null)
    setSearchQuery('')
    setSortBy('recent')
    setOnlyWithVideo(false)
    setIsFavoritesView(false)
    setIsFilterDrawerOpen(false)
  }

  // Conteo de productos por categoría
  const countsByCategory = useMemo(() => {
    const counts = {}
    products.forEach((p) => {
      if (p.id_categoria) {
        counts[p.id_categoria] = (counts[p.id_categoria] || 0) + 1
      }
    })
    return counts
  }, [products])

  // Filtrado y Ordenamiento
  const filteredProducts = useMemo(() => {
    let result = products.filter((p) => {
      // Filtro por categoría
      if (selectedCategory !== null && p.id_categoria !== selectedCategory) return false

      // Filtro por favoritos
      if (isFavoritesView && !favorites.includes(p.id)) return false

      // Filtro solo con video
      if (onlyWithVideo && !p.videoUrl) return false

      // Buscador
      const query = searchQuery.trim().toLowerCase()
      if (query) {
        const inTitle = p.titulo?.toLowerCase().includes(query)
        const inDesc = p.descripcion?.toLowerCase().includes(query)
        const inCat = p.categoriaNombre?.toLowerCase().includes(query)
        if (!inTitle && !inDesc && !inCat) return false
      }

      return true
    })

    // Ordenamiento
    if (sortBy === 'price-asc') {
      result.sort((a, b) => a.precio - b.precio)
    } else if (sortBy === 'price-desc') {
      result.sort((a, b) => b.precio - a.precio)
    }

    return result
  }, [products, selectedCategory, searchQuery, isFavoritesView, favorites, onlyWithVideo, sortBy])

  const hasActiveFilters = selectedCategory !== null || onlyWithVideo || sortBy !== 'recent' || isFavoritesView

  // VISTA ADMINISTRACIÓN
  if (currentView === 'admin' && isAdminAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 text-gray-900 flex flex-col justify-between">
        <Navbar 
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          currentView={currentView}
          setCurrentView={setCurrentView}
          onLogoutAdmin={handleAdminLogout}
          catalogCount={products.length}
        />
        <main className="flex-1">
          <AdminPanel onBackToCatalog={handleBackToCatalog} />
        </main>
        <Footer onOpenAdminLogin={handleOpenAdminLogin} />
      </div>
    )
  }

  // VISTA PÚBLICA
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 flex flex-col justify-between pb-16 md:pb-0">
      
      <div>
        {/* Barra Superior */}
        <Navbar 
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          currentView={currentView}
          setCurrentView={setCurrentView}
          onLogoutAdmin={handleAdminLogout}
          catalogCount={products.length}
          onOpenFilterDrawer={() => setIsFilterDrawerOpen(true)}
          hasActiveFilters={hasActiveFilters}
          favoritesCount={favorites.length}
          onToggleFavoritesView={() => setIsFavoritesView((prev) => !prev)}
          isFavoritesView={isFavoritesView}
        />

        {/* Barra de Categorías Desplazable (Escritorio y Móvil) */}
        {!isFavoritesView && (
          <CategoryBar
            categories={categories}
            selectedCategory={selectedCategory}
            onSelectCategory={(id) => {
              setSelectedCategory(id)
              setIsFavoritesView(false)
            }}
            countsByCategory={countsByCategory}
          />
        )}

        <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6">
          
          {/* Barra de Control y Título de Catálogo */}
          <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-gray-200 mb-4 sm:mb-6 gap-2">
            <div>
              <h1 className="text-sm sm:text-lg font-bold text-gray-950 flex items-center gap-1.5">
                {isFavoritesView ? (
                  <>
                    <Heart className="w-4 h-4 fill-red-600 text-red-600 inline" />
                    <span>Mis Artículos Guardados</span>
                  </>
                ) : selectedCategory ? (
                  categories.find((c) => c.id_categoria === selectedCategory)?.nombre || 'Catálogo'
                ) : (
                  'Artículos Disponibles'
                )}
                <span className="text-xs font-normal text-gray-500">
                  ({filteredProducts.length})
                </span>
              </h1>
            </div>

            {/* Acciones de Ordenamiento en Escritorio */}
            <div className="flex items-center space-x-2">
              <div className="hidden sm:flex items-center space-x-1.5 text-xs">
                <span className="text-gray-500 text-[11px]">Ordenar:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-white border border-gray-300 rounded px-2 py-1 text-xs text-gray-800 focus:outline-none focus:border-gray-900"
                >
                  <option value="recent">Más recientes</option>
                  <option value="price-asc">Menor precio</option>
                  <option value="price-desc">Mayor precio</option>
                </select>
              </div>

              <button
                onClick={() => setIsFilterDrawerOpen(true)}
                className="inline-flex items-center gap-1.5 text-xs text-gray-700 bg-white border border-gray-300 rounded px-2.5 py-1.5 hover:bg-gray-50 transition-colors"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Filtros</span>
                {hasActiveFilters && (
                  <span className="w-2 h-2 rounded-full bg-gray-950" />
                )}
              </button>

              <button
                onClick={loadPublishedCatalog}
                className="p-1.5 rounded border border-gray-300 bg-white text-gray-500 hover:text-gray-900 transition-colors"
                title="Actualizar catálogo"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Skeletons de Carga */}
          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5 sm:gap-4">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                <div key={n} className="bg-white rounded-xl border border-gray-200 p-2.5 sm:p-3 animate-pulse">
                  <div className="aspect-square bg-gray-100 rounded-lg mb-2.5" />
                  <div className="h-3 bg-gray-200 rounded w-3/4 mb-1.5" />
                  <div className="h-2.5 bg-gray-100 rounded w-1/2 mb-2.5" />
                  <div className="h-7 bg-gray-200 rounded-lg" />
                </div>
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            /* Estado Vacío */
            <div className="text-center py-16 px-4 bg-white rounded-xl border border-gray-200">
              <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <h3 className="text-sm font-semibold text-gray-900">
                {isFavoritesView
                  ? 'No tienes artículos guardados aún'
                  : products.length === 0 
                  ? 'No hay productos disponibles en este momento'
                  : 'No se encontraron artículos con el criterio seleccionado'}
              </h3>
              <p className="text-xs text-gray-500 mt-1 max-w-md mx-auto">
                {isFavoritesView
                  ? 'Haz clic en el icono del corazón en cualquier producto para guardarlo aquí y revisarlo más tarde.'
                  : 'Prueba quitando los filtros o realizando otra búsqueda.'}
              </p>
              
              {hasActiveFilters && (
                <button
                  onClick={handleResetFilters}
                  className="mt-4 px-3.5 py-2 bg-gray-950 hover:bg-black text-white text-xs font-semibold rounded-lg transition-colors"
                >
                  Restablecer todos los filtros
                </button>
              )}
            </div>
          ) : (
            /* GRILLA DE PRODUCTOS RESPONSIVA (2 Columnas en móvil, hasta 5 en pantallas grandes) */
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5 sm:gap-4">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onOpenDetails={(p) => setActiveProduct(p)}
                  onStartPayment={(p) => setPaymentProduct(p)}
                  isFavorite={favorites.includes(product.id)}
                  onToggleFavorite={handleToggleFavorite}
                />
              ))}
            </div>
          )}

        </main>
      </div>

      {/* Drawer de Filtros y Ordenamiento (Móvil y Escritorio) */}
      <FilterDrawer
        isOpen={isFilterDrawerOpen}
        onClose={() => setIsFilterDrawerOpen(false)}
        categories={categories}
        selectedCategory={selectedCategory}
        onSelectCategory={(id) => {
          setSelectedCategory(id)
          setIsFavoritesView(false)
        }}
        sortBy={sortBy}
        onSelectSortBy={setSortBy}
        onlyWithVideo={onlyWithVideo}
        onToggleOnlyWithVideo={() => setOnlyWithVideo((prev) => !prev)}
        countsByCategory={countsByCategory}
        totalProductsCount={filteredProducts.length}
        onResetFilters={handleResetFilters}
      />

      {/* Modal de Detalle */}
      {activeProduct && (
        <ProductDetailModal
          product={activeProduct}
          onClose={() => setActiveProduct(null)}
          onStartPayment={(p) => {
            setActiveProduct(null)
            setPaymentProduct(p)
          }}
          isFavorite={favorites.includes(activeProduct.id)}
          onToggleFavorite={handleToggleFavorite}
        />
      )}

      {/* Modal de Pago con QR */}
      {paymentProduct && (
        <QrPaymentModal
          product={paymentProduct}
          onClose={() => setPaymentProduct(null)}
          onPaymentSuccess={handlePaymentSuccess}
        />
      )}

      {/* Modal de Login de Administrador */}
      <AdminLoginModal
        isOpen={showAdminLoginModal}
        onClose={() => setShowAdminLoginModal(false)}
        onLoginSuccess={handleAdminLoginSuccess}
      />

      {/* Pie de página */}
      <Footer onOpenAdminLogin={handleOpenAdminLogin} />

      {/* BARRA DE NAVEGACIÓN INFERIOR MÓVIL (Solo en móviles cuando no hay modales abiertos) */}
      {!activeProduct && !paymentProduct && !showAdminLoginModal && (
        <MobileBottomNav
          currentTab={isFavoritesView ? 'favorites' : mobileTab}
          onSelectTab={(tab) => {
            setMobileTab(tab)
            if (tab === 'catalog') {
              setIsFavoritesView(false)
              window.scrollTo({ top: 0, behavior: 'smooth' })
            }
          }}
          favoritesCount={favorites.length}
          onOpenCategories={() => setIsFilterDrawerOpen(true)}
          onOpenFavorites={() => setIsFavoritesView((prev) => !prev)}
        />
      )}

    </div>
  )
}
