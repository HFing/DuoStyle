import { useState, useEffect, useCallback } from 'react';
import api from '../api/axios';
import { formatVND } from '../components/ProductCard';
import WriteReviewModal from '../components/WriteReviewModal';
import {
  getInitialVariantSelection,
  getProductDetailState,
  getVariantSelection,
  isProductVariantActionable,
  mapProductDetail,
  productSizeLabel,
} from '../services/productService';
import { addToWishlistApi, removeFromWishlistApi } from '../services/wishlistService';

const NEUTRAL_PRODUCT_PLACEHOLDER = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 1000"%3E%3Crect width="800" height="1000" fill="%23e7e5e4"/%3E%3Cpath d="M300 430h200v140H300z" fill="none" stroke="%2378716c" stroke-width="12"/%3E%3Ccircle cx="360" cy="475" r="22" fill="%2378716c"/%3E%3Cpath d="m320 545 58-58 42 42 32-32 48 48" fill="none" stroke="%2378716c" stroke-width="12"/%3E%3C/svg%3E';

export default function ProductDetailPage({
  productId,
  user,
  userWishlistIds = [],
  onAddToCart,
  onBuyNow,
  onNavigate,
  showToast,
}: {
  productId: any;
  user?: any;
  userWishlistIds?: number[];
  onAddToCart?: any;
  onBuyNow?: any;
  onNavigate?: any;
  showToast?: (msg: string, type?: 'success' | 'error') => void;
}) {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [retryToken, setRetryToken] = useState(0);

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [openAccordion, setOpenAccordion] = useState('details');
  const [isWishlistSaved, setIsWishlistSaved] = useState(() => Number(productId) > 0 && userWishlistIds.includes(Number(productId)));
  const [relatedProducts, setRelatedProducts] = useState([]);

  useEffect(() => {
    if (productId) {
      setIsWishlistSaved(userWishlistIds.includes(Number(productId)));
    }
  }, [productId, userWishlistIds]);

  // Review states
  const [reviewsSummary, setReviewsSummary] = useState(null);
  const [eligibleOrderIds, setEligibleOrderIds] = useState([]);
  const [isWriteReviewOpen, setIsWriteReviewOpen] = useState(false);

  const fetchReviews = useCallback(async (id) => {
    if (!id) return;
    try {
      const res = await api.get(`/products/${id}/reviews`);
      if (res.data) setReviewsSummary(res.data);
    } catch {}

    try {
      const elRes = await api.get(`/reviews/eligibility?productId=${id}`);
      if (elRes.data) setEligibleOrderIds(elRes.data);
    } catch {
      setEligibleOrderIds([]);
    }
  }, []);

  useEffect(() => {
    let active = true;
    setProduct(null);
    setLoading(true);
    setLoadError(false);
    setSelectedImageIndex(0);
    setSelectedColor('');
    setSelectedSize('');
    setQuantity(1);
    setRelatedProducts([]);

    if (!productId) {
      setLoading(false);
      setLoadError(true);
      return () => { active = false; };
    }

    api.get(`/products/${productId}`)
      .then(res => {
        if (!active) return;
        if (!res.data?.data) {
          throw new Error('Product response is empty');
        }

        const loadedProduct = mapProductDetail(res.data.data);
        setProduct(loadedProduct);
        const initialSelection = getInitialVariantSelection(loadedProduct.variants);
        setSelectedSize(initialSelection.size);
        setSelectedColor(initialSelection.color);

        fetchReviews(productId);

        // Fetch related products in same category/gender
        const gender = (loadedProduct as any).genderTarget || 'MEN';
        api.get(`/products?gender=${gender}&size=8`)
          .then(relRes => {
            if (!active) return;
            if (relRes.data?.data?.content) {
              const filtered = relRes.data.data.content
                .filter(p => String(p.id) !== String(productId))
                .slice(0, 4);
              setRelatedProducts(filtered);
            }
          })
          .catch(() => {});
      })
      .catch(() => {
        if (!active) return;
        setProduct(null);
        setLoadError(true);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => { active = false; };
  }, [productId, retryToken, fetchReviews]);

  const requestedProduct = product && String(product.id) === String(productId) ? product : null;
  const detailState = getProductDetailState({ loading, error: loadError, product: requestedProduct });

  const variantSelection = getVariantSelection(
    requestedProduct?.variants,
    selectedSize,
    selectedColor,
  );
  const currentVariant = variantSelection.variant;

  const currentStock = currentVariant ? currentVariant.stockQuantity : 0;
  const isOutOfStock = currentStock === 0;
  const isLowStock = currentStock > 0 && currentStock <= 5;
  const isActionable = isProductVariantActionable(requestedProduct, currentVariant);

  const handleQuantityChange = (delta) => {
    const newQty = quantity + delta;
    if (newQty >= 1 && newQty <= currentStock) {
      setQuantity(newQty);
    }
  };

  const toggleWishlist = async () => {
    if (!requestedProduct) return;
    if (!user) {
      if (showToast) showToast('Vui lòng đăng nhập để thêm sản phẩm vào danh sách yêu thích!', 'error');
      if (onNavigate) onNavigate('login', '', null, 'Vui lòng đăng nhập để sử dụng danh sách yêu thích.');
      return;
    }

    const nextState = !isWishlistSaved;
    setIsWishlistSaved(nextState);

    if (nextState) {
      const ok = await addToWishlistApi(requestedProduct.id);
      if (ok) {
        if (showToast) showToast(`Đã thêm "${requestedProduct.name}" vào Danh sách yêu thích!`, 'success');
      } else {
        setIsWishlistSaved(false);
        if (showToast) showToast('Không thể lưu sản phẩm vào CSDL. Vui lòng thử lại.', 'error');
      }
    } else {
      const ok = await removeFromWishlistApi(requestedProduct.id);
      if (ok) {
        if (showToast) showToast(`Đã xóa "${requestedProduct.name}" khỏi Danh sách yêu thích!`, 'success');
      } else {
        setIsWishlistSaved(true);
        if (showToast) showToast('Không thể xóa khỏi CSDL. Vui lòng thử lại.', 'error');
      }
    }
  };

  const handleAddBag = () => {
    if (!isActionable) {
      if (showToast) showToast("Sản phẩm size này hiện đã hết hàng trong kho!", "error");
      return;
    }
    if (onAddToCart) {
      onAddToCart(requestedProduct, currentVariant, quantity);
    } else if (showToast) {
      showToast(`Đã thêm ${requestedProduct.name} (Size: ${selectedSize}, Số lượng: ${quantity}) vào Giỏ hàng!`, 'success');
    }
  };

  const handleBuyNow = () => {
    if (!isActionable) {
      showToast?.('Sản phẩm đã chọn hiện không còn hàng.', 'error');
      return;
    }
    onBuyNow?.({ product: requestedProduct, variant: currentVariant, quantity });
  };

  const displayImages = requestedProduct?.images.length
    ? requestedProduct.images
    : [NEUTRAL_PRODUCT_PLACEHOLDER];

  if (detailState === 'loading') {
    return (
      <main className="pt-32 pb-section-gap max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter animate-pulse" aria-label="Đang tải sản phẩm">
          <div className="lg:col-span-7 aspect-[4/5] bg-surface-container rounded" />
          <div className="lg:col-span-5 space-y-6 pt-4">
            <div className="h-12 bg-surface-container rounded" />
            <div className="h-7 w-1/2 bg-surface-container rounded" />
            <div className="h-48 bg-surface-container rounded" />
          </div>
        </div>
      </main>
    );
  }

  if (detailState === 'error') {
    return (
      <main className="pt-32 pb-section-gap max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop text-center">
        <h1 className="font-headline-md text-headline-md mb-4">Không thể tải sản phẩm</h1>
        <p className="font-body-md text-on-surface-variant mb-8">Vui lòng kiểm tra kết nối và thử lại.</p>
        <button
          className="bg-primary text-on-primary px-8 py-4 font-label-caps text-label-caps uppercase tracking-widest"
          onClick={() => setRetryToken(token => token + 1)}
          type="button"
        >
          Thử lại
        </button>
      </main>
    );
  }

  if (detailState !== 'ready') {
    return (
      <main className="pt-32 pb-section-gap max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop text-center">
        <h1 className="font-headline-md text-headline-md">Không tìm thấy sản phẩm.</h1>
      </main>
    );
  }

  return (
    <main className="pt-32 pb-section-gap max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
      {/* Product Detail Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
        {/* Left: Image Gallery */}
        <div className="lg:col-span-7 flex flex-col md:flex-row-reverse gap-4">
          <div className="flex-1 aspect-[4/5] overflow-hidden bg-surface-container relative shadow-md rounded">
            <img 
              className="w-full h-full object-cover transition-transform duration-700 hover:scale-105" 
              src={displayImages[selectedImageIndex] || displayImages[0]} 
              alt={requestedProduct.name} 
            />
          </div>

          <div className="flex md:flex-col gap-3 overflow-x-auto md:overflow-y-auto no-scrollbar md:w-24">
            {displayImages.slice(0, 4).map((imgUrl, idx) => (
              <button 
                key={idx}
                onClick={() => setSelectedImageIndex(idx)}
                className={`w-20 md:w-full aspect-[4/5] flex-shrink-0 border transition-all overflow-hidden bg-surface-container cursor-pointer rounded ${
                  selectedImageIndex === idx ? 'border-primary ring-2 ring-primary ring-offset-1' : 'border-transparent hover:border-outline-variant'
                }`}
              >
                <img className="w-full h-full object-cover" src={imgUrl} alt={`Thumbnail ${idx + 1}`} />
              </button>
            ))}
          </div>
        </div>

        {/* Right: Product Info */}
        <div className="lg:col-span-5 flex flex-col pt-4 lg:pt-0">
          <div className="sticky top-32">
            <nav className="flex items-center space-x-2 font-label-caps text-[10px] tracking-widest text-on-surface-variant mb-6 uppercase">
              <a className="hover:text-primary cursor-pointer" onClick={() => onNavigate && onNavigate('collections')}>DuoStyle</a>
              <span>/</span>
              <a className="hover:text-primary cursor-pointer" onClick={() => onNavigate && onNavigate('collections')}>Sản Phẩm</a>
              <span>/</span>
              <span className="text-primary">{requestedProduct.category}</span>
            </nav>

            <h1 className="font-display-lg text-display-lg-mobile md:text-display-lg text-primary mb-2 leading-tight">
              {requestedProduct.name}
            </h1>

            {/* STAR RATING SUMMARY BADGE */}
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center text-amber-500">
                {[1, 2, 3, 4, 5].map((star) => (
                  <span key={star} className={`material-symbols-outlined text-sm ${
                    star <= Math.round(reviewsSummary?.averageRating || requestedProduct.averageRating || 5) ? 'fill-1' : 'text-gray-300'
                  }`}>
                    star
                  </span>
                ))}
              </div>
              <span className="text-xs font-bold text-primary font-label-caps">
                {reviewsSummary?.averageRating || requestedProduct.averageRating || 5.0} / 5.0
              </span>
              <span className="text-xs text-on-surface-variant font-medium">
                ({reviewsSummary?.totalReviews ?? requestedProduct.reviewCount ?? 0} Đánh giá)
              </span>
            </div>

            <p className="font-headline-sm text-headline-sm text-on-surface-variant font-bold mb-6">
              {formatVND(requestedProduct.price)}
            </p>

            {/* LIVE STOCK STATUS BADGE */}
            <div className="mb-6">
              {isOutOfStock ? (
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-red-100 border border-red-300 text-red-700 rounded text-xs font-label-caps font-bold">
                  <span className="w-2 h-2 rounded-full bg-red-600 animate-ping"></span>
                  <span>TẠM HẾT HÀNG (Out of stock)</span>
                </div>
              ) : isLowStock ? (
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-amber-100 border border-amber-300 text-amber-800 rounded text-xs font-label-caps font-bold">
                  <span className="w-2 h-2 rounded-full bg-amber-600 animate-pulse"></span>
                  <span>CHỈ CÒN {currentStock} SẢN PHẨM TRONG KHO - NÊN ĐẶT HÀNG NGAY!</span>
                </div>
              ) : (
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded text-xs font-label-caps font-bold">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  <span>CÒN HÀNG ({currentStock} sản phẩm sẵn có)</span>
                </div>
              )}
            </div>

            {/* Size Selector with Live Stock Count */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-3">
                <p className="font-label-caps text-label-caps uppercase font-bold">Chọn Kích Thước (Size)</p>
                <button 
                  onClick={() => showToast && showToast("Bảng Size DuoStyle: S (45-55kg) | M (55-65kg) | L (65-75kg) | XL (75-85kg)", "success")}
                  className="font-label-caps text-[10px] underline underline-offset-4 hover:text-secondary transition-colors cursor-pointer border-none bg-transparent"
                >
                  HƯỚNG DẪN CHỌN SIZE
                </button>
              </div>

              <div className="grid grid-cols-4 gap-2">
                {variantSelection.sizeOptions.map(({ size, stockQuantity, disabled }) => {
                  const isSizeDisabled = disabled;

                  return (
                    <button 
                      key={size}
                      onClick={() => {
                        const variantsForSize = requestedProduct.variants.filter(
                          variant => productSizeLabel(variant.size) === size,
                        );
                        const nextVariant = variantsForSize.find(variant => Number(variant.stockQuantity) > 0)
                          || variantsForSize[0];
                        setSelectedSize(size);
                        setSelectedColor(nextVariant?.color || '');
                        setQuantity(1);
                      }}
                      disabled={isSizeDisabled}
                      className={`py-3 px-2 font-label-caps text-xs flex flex-col items-center justify-center transition-all cursor-pointer rounded ${
                        selectedSize === size 
                          ? 'border-2 border-primary bg-primary text-white font-bold shadow-sm' 
                          : isSizeDisabled 
                            ? 'border border-outline-variant/40 bg-surface-container/50 text-outline line-through cursor-not-allowed opacity-60'
                            : 'border border-outline-variant hover:border-secondary hover:text-secondary'
                      }`}
                    >
                      <span className="font-bold">{size}</span>
                      <span className={`text-[9px] mt-0.5 ${selectedSize === size ? 'text-secondary font-bold' : isSizeDisabled ? 'text-red-500' : 'text-on-surface-variant'}`}>
                        {isSizeDisabled ? 'Hết hàng' : `Còn ${stockQuantity}`}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {variantSelection.colorOptions.length > 1 && (
              <div className="mb-8">
                <p className="font-label-caps text-label-caps uppercase font-bold mb-3">Chọn Màu Sắc</p>
                <div className="grid grid-cols-2 gap-2">
                  {variantSelection.colorOptions.map(({ color, stockQuantity, disabled }) => (
                    <button
                      key={color || 'default'}
                      type="button"
                      onClick={() => { setSelectedColor(color); setQuantity(1); }}
                      disabled={disabled}
                      className={`py-3 px-3 text-xs rounded border transition-colors ${
                        selectedColor === color
                          ? 'border-primary bg-primary text-white font-bold'
                          : disabled
                            ? 'border-outline-variant/40 bg-surface-container/50 text-outline cursor-not-allowed opacity-60'
                            : 'border-outline-variant hover:border-secondary hover:text-secondary'
                      }`}
                    >
                      <span className="block font-bold">{color || 'Tiêu chuẩn'}</span>
                      <span className="block text-[9px] mt-0.5">
                        {disabled ? 'Hết hàng' : `Còn ${stockQuantity}`}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity Selector */}
            <div className="mb-8">
              <p className="font-label-caps text-label-caps uppercase font-bold mb-3">Số Lượng</p>
              <div className="flex items-center gap-4">
                <div className="flex items-center border border-outline-variant rounded overflow-hidden">
                  <button 
                    onClick={() => handleQuantityChange(-1)}
                    disabled={quantity <= 1 || isOutOfStock}
                    className="w-10 h-10 flex items-center justify-center hover:bg-surface-container transition-colors disabled:opacity-40 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-sm">remove</span>
                  </button>
                  <span className="w-12 text-center font-bold text-sm">{quantity}</span>
                  <button 
                    onClick={() => handleQuantityChange(1)}
                    disabled={quantity >= currentStock || isOutOfStock}
                    className="w-10 h-10 flex items-center justify-center hover:bg-surface-container transition-colors disabled:opacity-40 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-sm">add</span>
                  </button>
                </div>
                <span className="text-xs text-on-surface-variant">Tối đa {currentStock} sản phẩm</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-4 mb-12">
              <button
                onClick={handleBuyNow}
                disabled={!isActionable}
                className="w-full py-5 font-label-caps text-label-caps tracking-widest uppercase transition-all duration-300 active:scale-[0.98] bg-secondary text-on-secondary hover:bg-primary disabled:bg-outline disabled:text-on-surface-variant disabled:cursor-not-allowed rounded font-bold"
              >
                {isActionable ? 'Mua Ngay' : 'Không Thể Mua Ngay'}
              </button>
              <button 
                onClick={handleAddBag}
                disabled={!isActionable}
                className={`w-full py-5 font-label-caps text-label-caps tracking-widest uppercase transition-all duration-300 transform active:scale-[0.98] cursor-pointer rounded ${
                  !isActionable 
                    ? 'bg-outline text-on-surface-variant cursor-not-allowed line-through opacity-70'
                    : 'bg-primary text-on-primary hover:bg-secondary'
                }`}
              >
                {isActionable ? 'Thêm Vào Giỏ Hàng' : 'KHÔNG CÓ PHIÊN BẢN KHẢ DỤNG'}
              </button>

              <button 
                onClick={toggleWishlist}
                className={`w-full border border-primary py-4 font-label-caps text-label-caps tracking-widest uppercase transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer rounded ${
                  isWishlistSaved ? 'bg-primary text-on-primary' : 'text-primary hover:bg-primary hover:text-on-primary'
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">
                  {isWishlistSaved ? 'favorite' : 'favorite_border'}
                </span>
                {isWishlistSaved ? 'Đã Lưu Vào Yêu Thích' : 'Thêm Vào Yêu Thích'}
              </button>
            </div>

            {/* Accordions */}
            <div className="border-t border-outline-variant/30">
              <div className="border-b border-outline-variant/30">
                <button 
                  onClick={() => setOpenAccordion(openAccordion === 'details' ? '' : 'details')}
                  className="w-full py-5 flex justify-between items-center group cursor-pointer"
                >
                  <span className="font-label-caps text-label-caps uppercase tracking-widest font-bold">Chi Tiết & Chất Liệu</span>
                  <span className={`material-symbols-outlined transition-transform duration-300 ${openAccordion === 'details' ? 'rotate-45' : ''}`}>
                    add
                  </span>
                </button>
                {openAccordion === 'details' && (
                  <div className="pb-6 text-on-surface-variant font-body-md leading-relaxed space-y-4">
                    <p>{requestedProduct.description}</p>
                    <div className="pt-2 text-xs border-t border-outline-variant/40 space-y-1">
                      <p>• Mã SKU: <span className="font-bold text-primary">{currentVariant?.sku || ''}</span></p>
                      <p>• Xuất xứ: <span className="font-bold text-primary">Ý (Italy Imported)</span></p>
                      <p>• Bảo hành phom dáng: <span className="font-bold text-primary">12 Tháng Trọn Đời</span></p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Customer Reviews Section */}
      <div className="mt-20 pt-16 border-t border-outline-variant/30">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <h2 className="font-display-lg text-display-lg-mobile md:text-2xl italic tracking-tight uppercase text-primary">
              Đánh Giá & Nhận Xét Từ Khách Hàng
            </h2>
            <p className="text-xs text-on-surface-variant/70 mt-1">Đánh giá thực tế từ khách hàng đã mua và nhận hàng thành công</p>
          </div>

          {eligibleOrderIds.length > 0 && (
            <button
              onClick={() => setIsWriteReviewOpen(true)}
              className="px-6 py-3 bg-primary text-white font-label-caps text-xs tracking-widest uppercase font-bold rounded-lg hover:bg-secondary transition-all shadow-md flex items-center gap-2 cursor-pointer w-fit"
            >
              <span className="material-symbols-outlined text-base">rate_review</span>
              Viết Đánh Giá Sản Phẩm
            </button>
          )}
        </div>

        {/* Rating Breakdown & Stats */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-12 bg-surface-container/30 p-6 md:p-8 rounded-xl border border-outline-variant/40">
          <div className="md:col-span-4 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-outline-variant/40 pb-6 md:pb-0 md:pr-6">
            <span className="text-5xl font-extrabold text-primary mb-2">
              {reviewsSummary?.averageRating || 5.0}
            </span>
            <div className="flex items-center text-amber-500 mb-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <span key={star} className={`material-symbols-outlined text-xl ${
                  star <= Math.round(reviewsSummary?.averageRating || 5) ? 'fill-1' : 'text-gray-300'
                }`}>
                  star
                </span>
              ))}
            </div>
            <p className="text-xs text-on-surface-variant font-medium">
              Dựa trên {reviewsSummary?.totalReviews || 0} đánh giá đã xác minh
            </p>
          </div>

          <div className="md:col-span-8 space-y-2 flex flex-col justify-center">
            {[5, 4, 3, 2, 1].map((star) => {
              const count = reviewsSummary?.ratingDistribution?.[star] || 0;
              const total = reviewsSummary?.totalReviews || 1;
              const percent = Math.round((count / (total || 1)) * 100);
              return (
                <div key={star} className="flex items-center gap-3 text-xs">
                  <span className="w-12 font-bold text-primary font-label-caps">{star} Sao</span>
                  <div className="flex-1 h-2 bg-surface-container rounded-full overflow-hidden">
                    <div className="h-full bg-amber-400 rounded-full transition-all" style={{ width: `${percent}%` }}></div>
                  </div>
                  <span className="w-10 text-right text-on-surface-variant font-mono">{count}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Reviews List */}
        <div className="space-y-6">
          {!reviewsSummary?.reviews || reviewsSummary.reviews.length === 0 ? (
            <div className="text-center py-12 bg-surface-container/20 rounded-lg border border-outline-variant/30">
              <span className="material-symbols-outlined text-4xl text-on-surface-variant/40 mb-2">star_rate</span>
              <p className="text-sm font-medium text-on-surface-variant mb-1">Chưa có đánh giá nào cho sản phẩm này.</p>
              {eligibleOrderIds.length > 0 ? (
                <p className="text-xs text-secondary font-bold">Bạn đã mua sản phẩm này! Bấm "Viết Đánh Giá Sản Phẩm" để là người đầu tiên nhận xét.</p>
              ) : (
                <p className="text-xs text-on-surface-variant/60">Mua sản phẩm và hoàn thành đơn hàng để để lại đánh giá của bạn.</p>
              )}
            </div>
          ) : (
            reviewsSummary.reviews.map((rev) => (
              <div key={rev.id} className="p-6 bg-surface rounded-xl border border-outline-variant/40 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center text-sm uppercase">
                      {(rev.userFullName || 'U').substring(0, 1)}
                    </div>
                    <div>
                      <p className="font-bold text-sm text-primary">{rev.userFullName || 'Khách hàng DuoStyle'}</p>
                      <div className="flex items-center gap-2 text-xs text-on-surface-variant">
                        <div className="flex items-center text-amber-500">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <span key={star} className={`material-symbols-outlined text-xs ${
                              star <= rev.rating ? 'fill-1' : 'text-gray-300'
                            }`}>
                              star
                            </span>
                          ))}
                        </div>
                        <span>• {rev.createdAt ? new Date(rev.createdAt).toLocaleDateString('vi-VN') : ''}</span>
                        {rev.orderCode && (
                          <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded font-bold border border-emerald-200">
                            ✓ Đã Mua Hàng ({rev.orderCode})
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Customer Delete Option */}
                  {rev.userEmail && (
                    <button
                      onClick={async () => {
                        try {
                          await api.delete(`/reviews/${rev.id}`);
                          showToast?.('Đã xóa đánh giá!', 'success');
                          fetchReviews(productId);
                        } catch {
                          showToast?.('Không thể xóa đánh giá này!', 'error');
                        }
                      }}
                      className="text-gray-400 hover:text-red-500 p-1 transition-colors cursor-pointer"
                      title="Xóa đánh giá của bạn"
                    >
                      <span className="material-symbols-outlined text-sm">delete</span>
                    </button>
                  )}
                </div>

                {/* Review Text Comment */}
                <p className="text-xs text-on-surface leading-relaxed">{rev.comment}</p>

                {/* Attached Image */}
                {rev.imageUrl && (
                  <div className="w-24 h-24 rounded-lg overflow-hidden border border-outline-variant mt-2">
                    <img src={rev.imageUrl} alt="Review attachment" className="w-full h-full object-cover" />
                  </div>
                )}

                {/* Admin Official Reply */}
                {rev.adminReply && (
                  <div className="mt-3 p-3 bg-surface-container/60 rounded-lg border-l-4 border-secondary text-xs space-y-1">
                    <div className="flex items-center gap-1.5 font-bold text-secondary font-label-caps">
                      <span className="material-symbols-outlined text-sm">verified</span>
                      Phản hồi từ DuoStyle Admin:
                    </div>
                    <p className="text-on-surface-variant leading-relaxed">{rev.adminReply}</p>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Related Products Section */}
      {relatedProducts.length > 0 && (
        <div className="mt-24 pt-16 border-t border-outline-variant/30">
          <h2 className="font-display-lg text-display-lg-mobile md:text-2xl italic tracking-tight uppercase mb-8 text-primary">
            Sản Phẩm Tương Tự
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {relatedProducts.map((relProd) => (
              <div 
                key={relProd.id}
                onClick={() => onNavigate && onNavigate('product-detail', '', relProd.id)}
                className="group cursor-pointer relative"
              >
                <div className="relative aspect-[4/5] overflow-hidden bg-surface-container mb-3 border border-outline-variant/10 rounded">
                  <img 
                    src={relProd.thumbnailUrl || NEUTRAL_PRODUCT_PLACEHOLDER} 
                    alt={relProd.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="px-4 py-2 bg-white text-black font-label-caps text-xs uppercase font-bold tracking-wider rounded-sm shadow">
                      Xem Chi Tiết
                    </span>
                  </div>
                </div>
                <div className="text-center">
                  <p className="font-label-caps text-[10px] uppercase tracking-widest text-on-surface-variant mb-1">
                    {relProd.categoryName || 'DuoStyle'}
                  </p>
                  <h4 className="font-body-md text-sm font-bold text-primary group-hover:text-secondary transition-colors line-clamp-1">
                    {relProd.name}
                  </h4>
                  <p className="font-label-caps text-xs font-bold text-primary mt-1">
                    {formatVND(relProd.basePrice)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Write Review Modal */}
      <WriteReviewModal
        isOpen={isWriteReviewOpen}
        onClose={() => setIsWriteReviewOpen(false)}
        product={requestedProduct}
        orderId={eligibleOrderIds[0] || null}
        onSuccess={() => fetchReviews(productId)}
        showToast={showToast}
      />
    </main>
  );
}
