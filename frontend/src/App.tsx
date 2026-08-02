import { useCallback, useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import api from './api/axios';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import CategorySelection from './components/CategorySelection';
import ProductSection from './components/ProductSection';
import Editorial from './components/Editorial';
import Newsletter from './components/Newsletter';
import Footer from './components/Footer';
import CollectionsPage from './pages/CollectionsPage';
import ProfilePage from './pages/ProfilePage';
import ProductDetailPage from './pages/ProductDetailPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import PaymentResultPage from './pages/PaymentResultPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import NotFoundPage from './pages/NotFoundPage';
import ToastNotification from './components/ToastNotification';
import AiChatBox from './components/AiChatBox';
import InfoModal, { InfoModalTab } from './components/InfoModal';
import { loadHomeSections, mapCartItems } from './services/productService';
import { requireCartVariant, runAuthoritativeCartMutation } from './services/cartService';
import { resolveSelectedProductId } from './services/productService';
import { readGoogleLoginResult } from './services/authService';
import { fetchWishlistApi } from './services/wishlistService';
import { useWishlist } from './hooks/useWishlist';
import {
  createCheckoutHistoryState,
  resolveInitialNavigation,
  resolveAccessControlledPage,
  resolvePostLoginNavigation,
  resolveProfileTabIntent,
} from './services/checkoutService';

function getPageFromPathname(pathname: string): string {
  if (pathname === '/' || pathname === '') return 'home';
  if (pathname.startsWith('/collections')) return 'collections';
  if (pathname.startsWith('/products')) return 'product-detail';
  if (pathname.startsWith('/cart')) return 'cart';
  if (pathname.startsWith('/checkout')) return 'checkout';
  if (pathname.startsWith('/payment-result')) return 'payment-result';
  if (pathname.startsWith('/profile')) return 'profile';
  if (pathname.startsWith('/login')) return 'login';
  if (pathname.startsWith('/register')) return 'register';
  if (pathname.startsWith('/admin')) return 'admin';
  return 'not-found';
}

function getPathnameFromPage(page: string, prodId?: number | null): string {
  switch (page) {
    case 'home': return '/';
    case 'collections': return '/collections';
    case 'product-detail':
    case 'product': return prodId ? `/products/${prodId}` : '/collections';
    case 'cart': return '/cart';
    case 'checkout': return '/checkout';
    case 'payment-result': return '/payment-result';
    case 'profile': return '/profile';
    case 'login': return '/login';
    case 'register': return '/register';
    case 'admin': return '/admin';
    default: return '/';
  }
}

const initialNavigation = resolveInitialNavigation(window.location.search, window.history.state);
const initialGoogleLoginResult = readGoogleLoginResult(window.location.search);

const getStoredNavState = () => {
  if (initialNavigation.page === 'profile' && initialNavigation.autoOpenOrderCode) {
    return { page: 'profile', cat: '', prodId: null, searchKw: '', subCatId: null };
  }
  const pageFromPath = getPageFromPathname(window.location.pathname);
  const savedPage = sessionStorage.getItem('ds_page');
  const page = pageFromPath !== 'home' ? pageFromPath : (savedPage || initialNavigation.page || 'home');
  const cat = sessionStorage.getItem('ds_cat_filter') || '';
  const prodId = sessionStorage.getItem('ds_prod_id') ? Number(sessionStorage.getItem('ds_prod_id')) : null;
  const searchKw = sessionStorage.getItem('ds_search_kw') || '';
  const subCatId = sessionStorage.getItem('ds_subcat_id') ? Number(sessionStorage.getItem('ds_subcat_id')) : null;

  return { page, cat, prodId, searchKw, subCatId };
};

export default function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const savedState = getStoredNavState();
  const [currentPage, setCurrentPage] = useState(savedState.page);

  useEffect(() => {
    const pageFromUrl = getPageFromPathname(location.pathname);
    if (pageFromUrl && pageFromUrl !== currentPage) {
      setCurrentPage(pageFromUrl);
    }
  }, [location.pathname]);
  const [activeCategoryFilter, setActiveCategoryFilter] = useState(savedState.cat);
  const [selectedSubCategoryId, setSelectedSubCategoryId] = useState(savedState.subCatId);
  const [selectedProductId, setSelectedProductId] = useState(savedState.prodId);
  const [searchKeyword, setSearchKeyword] = useState(savedState.searchKw);
  const [authMsg, setAuthMsg] = useState('');
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [cartItems, setCartItems] = useState([]);
  const [cartCount, setCartCount] = useState(0);
  const [forHimProducts, setForHimProducts] = useState([]);
  const [forHerProducts, setForHerProducts] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [homeLoading, setHomeLoading] = useState(true);
  const [homeError, setHomeError] = useState(false);
  const [checkout, setCheckout] = useState(null);
  const [pendingCheckout, setPendingCheckout] = useState(null);
  const [paymentResult, setPaymentResult] = useState(null);
  const [profileTabIntent, setProfileTabIntent] = useState(initialNavigation.profileTab || 'profile');
  const [autoOpenOrderCode] = useState(initialNavigation.autoOpenOrderCode || null);
  const [infoModalTab, setInfoModalTab] = useState<InfoModalTab | null>(null);
  const [toast, setToast] = useState({
    show: Boolean(initialNavigation.recoveryMessage || initialNavigation.toastMessage),
    message: initialNavigation.recoveryMessage || initialNavigation.toastMessage || '',
    type: initialNavigation.toastType || (initialNavigation.recoveryMessage ? 'error' : 'success'),
  });

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ show: true, message, type });
  };

  const { userWishlistIds, reloadWishlist } = useWishlist(user, showToast);

  const reloadCart = useCallback(async () => {
    try {
      const response = await api.get('/cart');
      const apiItems = mapCartItems(response.data?.data);
      setCartItems(apiItems);
      setCartCount(
        response.data?.data?.totalItems
          ?? apiItems.reduce((sum, item) => sum + item.quantity, 0),
      );
      return apiItems;
    } catch {
      setCartItems([]);
      setCartCount(0);
      return [];
    }
  }, []);

  const loadHomeProducts = useCallback(async () => {
    setHomeLoading(true);
    setHomeError(false);

    try {
      const sections = await loadHomeSections(api);
      setForHimProducts(sections.forHim);
      setForHerProducts(sections.forHer);
      setNewArrivals(sections.newArrivals);
    } catch {
      setForHimProducts([]);
      setForHerProducts([]);
      setNewArrivals([]);
      setHomeError(true);
    } finally {
      setHomeLoading(false);
    }
  }, []);

  useEffect(() => {
    if (initialNavigation.recoveryMessage || initialNavigation.autoOpenOrderCode || initialNavigation.toastMessage || initialGoogleLoginResult) {
      window.history.replaceState({}, '', window.location.pathname);
    }
    loadHomeProducts();

    if (initialGoogleLoginResult === 'error') {
      setAuthMsg('Đăng nhập Google đã bị hủy hoặc không thành công. Vui lòng thử lại.');
      setCurrentPage('login');
      sessionStorage.setItem('ds_page', 'login');
    }

    api.get('/auth/me')
      .then(async res => {
        const resolvedUser = res.data?.data || null;
        setUser(resolvedUser);
        if (resolvedUser) {
          try {
            localStorage.setItem('user', JSON.stringify(resolvedUser));
          } catch {}
          await reloadCart();
          if (initialGoogleLoginResult === 'success') {
            setToast({
              show: true,
              message: `Đăng nhập Google thành công! Chào mừng ${resolvedUser.fullName || 'bạn'}.`,
              type: 'success',
            });
            setCurrentPage('home');
            sessionStorage.setItem('ds_page', 'home');
          }
        } else {
          setUser(null);
          try {
            localStorage.removeItem('user');
          } catch {}
          setCartItems([]);
          setCartCount(0);
        }

        // Apply access control guards after user resolution
        const isUserAdmin = checkIsAdmin(resolvedUser);
        if (currentPage === 'profile') {
          if (!resolvedUser) {
            handleNavigate('login', '', null, 'Vui lòng đăng nhập để xem trang cá nhân.');
          } else if (isUserAdmin) {
            setCurrentPage('admin');
          }
        } else if (currentPage === 'admin') {
          if (!resolvedUser || !isUserAdmin) {
            handleNavigate('not-found');
          }
        }
      })
      .catch(() => {
        setUser(null);
        try {
          localStorage.removeItem('user');
        } catch {}
        setCartItems([]);
        setCartCount(0);
        if (currentPage === 'profile') {
          handleNavigate('login', '', null, 'Vui lòng đăng nhập để xem trang cá nhân.');
        } else if (currentPage === 'admin') {
          handleNavigate('not-found');
        }
      });
  }, [loadHomeProducts, reloadCart]);

  const handleNavigate = (
    page,
    filter = '',
    prodId = null,
    extraMsg = '',
    query = '',
    subCatId = null,
    navigationIntent = null,
    authorizationUser = user,
  ) => {
    let targetPage = resolveAccessControlledPage({
      requestedPage: page,
      user: authorizationUser,
      isAdmin: checkIsAdmin(authorizationUser),
    });

    if (page === 'profile') {
      if (!authorizationUser) {
        extraMsg = extraMsg || 'Vui lòng đăng nhập để xem trang cá nhân.';
      }
    }

    if (targetPage !== 'payment-result' && new URLSearchParams(window.location.search).get('page') === 'payment-result') {
      window.history.replaceState({}, '', window.location.pathname);
    }
    if (targetPage !== 'checkout' && window.history.state?.page === 'checkout') {
      window.history.replaceState({}, '', window.location.pathname);
    }
    setCurrentPage(targetPage);
    const targetPath = getPathnameFromPage(targetPage, prodId);
    if (location.pathname !== targetPath) {
      navigate(targetPath);
    }
    if (targetPage === 'profile') {
      setProfileTabIntent(resolveProfileTabIntent(navigationIntent));
    }
    setActiveCategoryFilter(filter);
    setSelectedProductId(resolveSelectedProductId(targetPage, prodId));
    if (extraMsg) setAuthMsg(extraMsg);
    if (query !== undefined) setSearchKeyword(query);
    setSelectedSubCategoryId(subCatId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Save page state & params to sessionStorage and hash for URL persistence on F5 reload
  useEffect(() => {
    if (currentPage) {
      sessionStorage.setItem('ds_page', currentPage);
      if (activeCategoryFilter) sessionStorage.setItem('ds_cat_filter', activeCategoryFilter);
      else sessionStorage.removeItem('ds_cat_filter');

      if (selectedProductId) sessionStorage.setItem('ds_prod_id', String(selectedProductId));
      else sessionStorage.removeItem('ds_prod_id');

      if (searchKeyword) sessionStorage.setItem('ds_search_kw', searchKeyword);
      else sessionStorage.removeItem('ds_search_kw');

      if (selectedSubCategoryId) sessionStorage.setItem('ds_subcat_id', String(selectedSubCategoryId));
      else sessionStorage.removeItem('ds_subcat_id');

      if (window.location.hash) {
        window.history.replaceState(null, '', window.location.pathname + window.location.search);
      }
    }
  }, [currentPage, activeCategoryFilter, selectedProductId, searchKeyword, selectedSubCategoryId]);

  const handleQuickShop = (productId) => {
    handleNavigate('product-detail', '', productId);
  };

  const handleAddToCart = async (product, selectedVariant, quantity = 1) => {
    if (!user) {
      handleNavigate('login', '', null, 'Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng.');
      return;
    }

    try {
      const variant = requireCartVariant(product, selectedVariant);
      await runAuthoritativeCartMutation({
        mutate: () => api.post('/cart/items', { productVariantId: variant.id, quantity }),
        reload: reloadCart,
      });
      showToast(`Đã thêm "${product.name}" vào giỏ hàng!`, 'success');
    } catch {
      showToast('Không thể thêm sản phẩm vào giỏ hàng. Vui lòng thử lại.', 'error');
    }
  };

  const handleUpdateCartQuantity = async (id, delta) => {
    const item = cartItems.find(cartItem => cartItem.id === id);
    if (!item) return;

    try {
      const newQuantity = Math.max(1, item.quantity + delta);
      await runAuthoritativeCartMutation({
        mutate: () => api.put(`/cart/items/${id}`, { quantity: newQuantity }),
        reload: reloadCart,
      });
    } catch {
      showToast('Không thể cập nhật số lượng. Giỏ hàng đã được đồng bộ lại.', 'error');
    }
  };

  const handleRemoveCartItem = async (id) => {
    try {
      await runAuthoritativeCartMutation({
        mutate: () => api.delete(`/cart/items/${id}`),
        reload: reloadCart,
      });
      return true;
    } catch {
      showToast('Không thể xóa sản phẩm. Giỏ hàng đã được đồng bộ lại.', 'error');
      return false;
    }
  };

  const checkIsAdmin = (u) => {
    if (!u || !u.roles) return false;
    if (Array.isArray(u.roles)) {
      return u.roles.some(r => {
        const str = String(typeof r === 'string' ? r : (r?.name || r?.authority || '')).toUpperCase();
        return str === 'ROLE_ADMIN' || str === 'ADMIN';
      });
    }
    if (typeof u.roles === 'object') {
      return Object.values(u.roles).some((r: any) => {
        const str = String(typeof r === 'string' ? r : (r?.name || r?.authority || '')).toUpperCase();
        return str === 'ROLE_ADMIN' || str === 'ADMIN';
      });
    }
    return false;
  };

  const handleOpenAuth = () => {
    if (user) {
      if (checkIsAdmin(user)) {
        handleNavigate('admin');
      } else {
        handleNavigate('profile');
      }
    } else {
      handleNavigate('login');
    }
  };

  const handleOpenCart = () => {
    handleNavigate('cart');
  };

  const openCheckout = (nextCheckout) => {
    setCheckout(nextCheckout);
    window.history.replaceState(
      createCheckoutHistoryState(nextCheckout),
      '',
      window.location.pathname,
    );
    handleNavigate('checkout');
  };

  const handleCheckout = ({ source, items, originProductId = null }) => {
    const nextCheckout = { source, items, originProductId };
    if (!user) {
      setPendingCheckout(source === 'CART' ? { source: 'CART' } : nextCheckout);
      handleNavigate('login', '', null, 'Vui lòng đăng nhập để tiếp tục thanh toán.');
      return;
    }
    if (!items?.length) {
      showToast('Không có sản phẩm để thanh toán.', 'error');
      return;
    }

    openCheckout(nextCheckout);
  };

  const handleBuyNow = ({ product, variant, quantity }) => {
    if (!variant?.id) {
      showToast('Vui lòng chọn phiên bản sản phẩm còn hàng.', 'error');
      return;
    }

    const firstImage = product.images?.[0];
    handleCheckout({
      source: 'BUY_NOW',
      originProductId: product.id,
      items: [{
        productVariantId: variant.id,
        productName: product.name,
        variantDetails: `${variant.color || 'Tiêu chuẩn'} / Size ${variant.size === 'FREE_SIZE' ? 'FREE' : (variant.size || 'FREE')}`,
        price: variant.price ?? product.price,
        quantity,
        image: typeof firstImage === 'string' ? firstImage : firstImage?.imageUrl,
      }],
    });
  };

  const handleCheckoutComplete = async ({ orderCode }) => {
    if (checkout?.source === 'CART') {
      await reloadCart();
    }
    setCheckout(null);
    setPaymentResult({ outcome: 'success', orderCode, paymentMethod: 'COD' });
    handleNavigate('payment-result');
  };

  const handleLoginSuccess = async (userData) => {
    setUser(userData);
    try {
      localStorage.setItem('user', JSON.stringify(userData));
    } catch {}
    const authenticatedCartItems = await reloadCart();
    showToast(`Đăng nhập thành công! Chào mừng ${userData?.fullName || 'bạn'}.`, 'success');
    const destination = resolvePostLoginNavigation({
      isAdmin: checkIsAdmin(userData),
      pendingCheckout,
      authenticatedCartItems,
    });
    setPendingCheckout(null);

    if (destination.checkout) {
      openCheckout(destination.checkout);
      return;
    }
    if (destination.message) showToast(destination.message, 'error');
    handleNavigate(destination.page, '', null, '', '', null, null, userData);
  };

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (e) {
      console.log("Logged out session");
    }
    setUser(null);
    try {
      localStorage.removeItem('user');
    } catch {}
    setCartItems([]);
    setCartCount(0);
    showToast('Đã đăng xuất tài khoản thành công!', 'success');
    handleNavigate('login');
  };

  const isFullAdminView = currentPage === 'admin' && checkIsAdmin(user);

  return (
    <div className="min-h-screen bg-background text-on-background selection:bg-secondary-container selection:text-on-secondary-container">
      {/* Global Toast Notification Popup */}
      {toast.show && (
        <ToastNotification 
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ ...toast, show: false })}
          duration={4000}
        />
      )}

      {!isFullAdminView && (
        <Navbar 
          currentPage={currentPage}
          activeCategoryFilter={activeCategoryFilter}
          onNavigate={handleNavigate}
          cartCount={cartCount} 
          onOpenCart={handleOpenCart} 
          onOpenAuth={handleOpenAuth} 
        />
      )}
      {!isFullAdminView && <AiChatBox />}

      {currentPage === 'admin' && checkIsAdmin(user) && (
        <AdminDashboardPage 
          onNavigate={handleNavigate}
          user={user}
          showToast={showToast}
          onLogout={handleLogout}
        />
      )}

      {currentPage === 'admin' && !checkIsAdmin(user) && (
        <NotFoundPage onNavigate={handleNavigate} />
      )}

      {currentPage === 'home' && (
        <main>
          <Hero onShopNow={() => handleNavigate('collections')} />
          <CategorySelection onSelectCategory={(gender) => handleNavigate('collections', gender)} />
          
          <ProductSection 
            id="for-him"
            title="For Him"
            subtitle="Thời Trang Nam Thượng Thượng"
            linkText="Khám Phá Thời Trang Nam"
            isDark={true}
            products={forHimProducts}
            loading={homeLoading}
            error={homeError}
            user={user}
            userWishlistIds={userWishlistIds}
            onNavigate={handleNavigate}
            showToast={showToast}
            onRetry={loadHomeProducts}
            onQuickShop={handleQuickShop}
          />

          <ProductSection 
            id="for-her"
            title="For Her"
            subtitle="Thời Trang Nữ Đẳng Cấp"
            linkText="Khám Phá Thời Trang Nữ"
            isDark={false}
            products={forHerProducts}
            loading={homeLoading}
            error={homeError}
            user={user}
            userWishlistIds={userWishlistIds}
            onNavigate={handleNavigate}
            showToast={showToast}
            onRetry={loadHomeProducts}
            onQuickShop={handleQuickShop}
          />

          <ProductSection 
            id="new-arrivals"
            title="New Arrivals"
            subtitle="Bộ Sưu Tập Mới Nhất Mùa Này"
            linkText="Xem Tất Cả"
            isDark={false}
            products={newArrivals}
            loading={homeLoading}
            error={homeError}
            user={user}
            userWishlistIds={userWishlistIds}
            onNavigate={handleNavigate}
            showToast={showToast}
            onRetry={loadHomeProducts}
            onQuickShop={handleQuickShop}
          />

          <Editorial onExploreClick={() => setInfoModalTab('story')} />
          <Newsletter />
        </main>
      )}

      {currentPage === 'collections' && (
        <CollectionsPage 
          activeCategoryFilter={activeCategoryFilter}
          initialSubCategoryId={selectedSubCategoryId}
          searchKeyword={searchKeyword}
          user={user}
          userWishlistIds={userWishlistIds}
          onNavigate={handleNavigate}
          onQuickView={(product) => handleNavigate('product-detail', '', product.id)}
          showToast={showToast}
        />
      )}

      {currentPage === 'profile' && (
        <ProfilePage 
          user={user}
          initialTab={profileTabIntent}
          autoOpenOrderCode={autoOpenOrderCode}
          onNavigate={handleNavigate}
          onLogout={handleLogout}
          showToast={showToast}
          onUpdateUser={(updatedUser) => setUser(updatedUser)}
        />
      )}

      {currentPage === 'product-detail' && (
        <ProductDetailPage 
          productId={selectedProductId}
          user={user}
          userWishlistIds={userWishlistIds}
          onAddToCart={handleAddToCart}
          onBuyNow={handleBuyNow}
          onNavigate={handleNavigate}
          showToast={showToast}
        />
      )}

      {currentPage === 'login' && (
        <LoginPage 
          onNavigate={handleNavigate}
          onLoginSuccess={handleLoginSuccess}
          initialMessage={authMsg}
          showToast={showToast}
        />
      )}

      {currentPage === 'register' && (
        <RegisterPage 
          onNavigate={handleNavigate}
          showToast={showToast}
        />
      )}

      {currentPage === 'cart' && (
        <CartPage 
          onNavigate={handleNavigate}
          cartItems={cartItems}
          onUpdateQuantity={handleUpdateCartQuantity}
          onRemoveItem={handleRemoveCartItem}
          onCartCountChange={(cnt) => setCartCount(cnt)}
          onCheckout={({ source, items }) => handleCheckout({ source, items })}
          showToast={showToast}
        />
      )}

      {currentPage === 'checkout' && checkout && (
        <CheckoutPage
          checkout={checkout}
          user={user}
          onNavigate={handleNavigate}
          onUserUpdate={setUser}
          onCheckoutComplete={handleCheckoutComplete}
        />
      )}

      {currentPage === 'payment-result' && (
        <PaymentResultPage result={paymentResult} onNavigate={handleNavigate} />
      )}

      {currentPage === 'not-found' && (
        <NotFoundPage onNavigate={handleNavigate} />
      )}

      {!isFullAdminView && <Footer onOpenInfoModal={(tab) => setInfoModalTab(tab)} />}

      <InfoModal
        isOpen={Boolean(infoModalTab)}
        activeTab={infoModalTab}
        onClose={() => setInfoModalTab(null)}
        showToast={showToast}
      />
    </div>
  );
}
