import React, { useState } from 'react';
import api from '../api/axios';

export const formatVND = (price) => {
  if (typeof price !== 'number') {
    price = Number(price) || 0;
  }
  return price.toLocaleString('vi-VN') + ' VNĐ';
};

export default function ProductCard({ id, category, name, price, image, isDark = false, onQuickShop }) {
  const [isFavorite, setIsFavorite] = useState(false);

  const toggleWishlist = (e) => {
    e.stopPropagation();
    const nextState = !isFavorite;
    setIsFavorite(nextState);

    if (nextState) {
      api.post(`/wishlist/${id}`).catch(() => console.log('Wishlist update failed'));
    } else {
      api.delete(`/wishlist/${id}`).catch(() => console.log('Wishlist remove failed'));
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
