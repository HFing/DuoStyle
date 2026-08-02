import React, { useState, useEffect } from 'react';
import { addToWishlistApi, removeFromWishlistApi } from '../services/wishlistService';

export const formatVND = (price: any) => {
  let numPrice = typeof price !== 'number' ? Number(price) || 0 : price;
  return numPrice.toLocaleString('vi-VN') + ' VNĐ';
};

interface ProductCardProps {
  id: number;
  category?: string;
  name: string;
  price: number;
  image?: string;
  isDark?: boolean;
  user?: any;
  isWishlistedInitial?: boolean;
  onQuickShop?: (id: number) => void;
  onNavigate?: (page: string, filter?: string, prodId?: any, extraMsg?: string) => void;
  showToast?: (msg: string, type?: 'success' | 'error') => void;
}

export default function ProductCard({
  id,
  category,
  name,
  price,
  image,
  isDark = false,
  user,
  isWishlistedInitial = false,
  onQuickShop,
  onNavigate,
  showToast,
}: ProductCardProps) {
  const [isFavorite, setIsFavorite] = useState(isWishlistedInitial);

  useEffect(() => {
    setIsFavorite(isWishlistedInitial);
  }, [isWishlistedInitial]);

  const toggleWishlist = async (e: React.MouseEvent) => {
    e.stopPropagation();

    if (!user) {
      if (showToast) {
        showToast('Vui lòng đăng nhập để thêm sản phẩm vào danh sách yêu thích!', 'error');
      }
      if (onNavigate) {
        onNavigate('login', '', null, 'Vui lòng đăng nhập để sử dụng danh sách yêu thích.');
      }
      return;
    }

    const nextState = !isFavorite;
    setIsFavorite(nextState);

    if (nextState) {
      const ok = await addToWishlistApi(id);
      if (ok) {
        if (showToast) showToast(`Đã thêm "${name}" vào Danh sách yêu thích!`, 'success');
      } else {
        setIsFavorite(false);
        if (showToast) showToast('Không thể thêm sản phẩm vào yêu thích. Vui lòng thử lại.', 'error');
      }
    } else {
      const ok = await removeFromWishlistApi(id);
      if (ok) {
        if (showToast) showToast(`Đã xóa "${name}" khỏi Danh sách yêu thích!`, 'success');
      } else {
        setIsFavorite(true);
        if (showToast) showToast('Không thể xóa khỏi yêu thích. Vui lòng thử lại.', 'error');
      }
    }
  };

  const handleCardClick = () => {
    if (onQuickShop) {
      onQuickShop(id);
    }
  };

  return (
    <div 
      onClick={handleCardClick}
      className="group cursor-pointer relative transition-all duration-300"
    >
      <div className={`product-image-container relative overflow-hidden aspect-[4/5] mb-6 border transition-all ${isDark ? 'border-white/10' : 'border-outline-variant/10'}`}>
        <img 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
          src={image} 
          alt={name} 
        />

        {/* Wishlist Heart Icon Button */}
        <button 
          onClick={toggleWishlist}
          className={`absolute top-4 right-4 w-9 h-9 rounded-full flex items-center justify-center transition-all z-10 cursor-pointer shadow-md ${
            isFavorite ? 'bg-error text-white' : 'bg-white/80 hover:bg-white text-primary'
          }`}
          title={isFavorite ? "Xóa khỏi danh sách yêu thích" : "Thêm vào danh sách yêu thích"}
        >
          <span className="material-symbols-outlined text-[18px]">
            {isFavorite ? 'favorite' : 'favorite_border'}
          </span>
        </button>

        {/* Quick Shop Overlay */}
        <button 
          onClick={(e) => {
            e.stopPropagation();
            if (onQuickShop) onQuickShop(id);
          }}
          className={`quick-add absolute bottom-0 left-0 w-full py-4 translate-y-full opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center gap-2 ${
            isDark ? 'bg-white text-black' : 'bg-primary text-on-primary'
          }`}
        >
          <span className="font-label-caps text-label-caps uppercase tracking-widest font-bold">Xem Chi Tiết</span>
        </button>
      </div>

      <div className="text-center">
        <p className={`font-label-caps text-label-caps uppercase tracking-widest mb-1 ${isDark ? 'text-on-primary/60' : 'text-on-surface-variant'}`}>
          {category}
        </p>
        <h4 className={`font-body-md text-body-md font-bold mb-1 group-hover:text-secondary transition-colors ${isDark ? 'text-on-primary' : 'text-primary'}`}>
          {name}
        </h4>
        <p className={`font-label-caps text-label-caps font-bold ${isDark ? 'text-on-primary' : 'text-primary'}`}>
          {formatVND(price)}
        </p>
      </div>
    </div>
  );
}
