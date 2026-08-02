import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { formatVND } from '../components/ProductCard';
import { calculateCheckoutSubtotal } from '../utils/checkout';



const SUGGESTIONS = [
  {
    id: 301,
    name: 'Quần Tây Nam Pleated Tailored Pant',
    price: 1450000,
    image: 'https://images.unsplash.com/photo-1551854838-212c50b4c184?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 302,
    name: 'Túi Xách Da Cao Cấp Structured Leather Bag',
    price: 3200000,
    image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 303,
    name: 'Giày Loafer Da Thật Leather Penny',
    price: 1750000,
    image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 304,
    name: 'Nước Hoa Cao Cấp Essence Noir EDP',
    price: 2400000,
    image: 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&w=800&q=80'
  }
];

export default function CartPage({ 
  onNavigate, 
  cartItems: sharedCartItems, 
  onUpdateQuantity, 
  onRemoveItem, 
  onCartCountChange, 
  onCheckout,
  showToast 
}) {
  const [localCartItems, setLocalCartItems] = useState([]);

  const cartItems = sharedCartItems || localCartItems;

  useEffect(() => {
    // If sharedCartItems is not provided, fetch live cart items from Spring Boot Backend (/api/v1/cart)
    if (!sharedCartItems) {
      api.get('/cart')
        .then(res => {
          if (res.data?.data?.items) {
            const apiItems = res.data.data.items.map(item => ({
              id: item.id,
              productVariantId: item.productVariantId,
              productName: item.productName || 'Sản Phẩm Thời Trang',
              variantDetails: `${item.color || 'Tiêu chuẩn'} / Size ${item.size || 'FREE'}`,
              price: item.price,
              quantity: item.quantity,
              image: item.thumbnailUrl || 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=800&q=80'
            }));
            setLocalCartItems(apiItems);
          }
        })
        .catch(err => console.log("Using local shopping cart items"));
    }
  }, [sharedCartItems]);

  const triggerToast = (msg, type = 'success') => {
    if (showToast) {
      showToast(msg, type);
    }
  };

  const updateQuantity = (id, delta) => {
    if (onUpdateQuantity) {
      onUpdateQuantity(id, delta);
      return;
    }
    setLocalCartItems(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = Math.max(1, item.quantity + delta);
        api.put(`/cart/items/${id}`, { quantity: newQty }).catch(() => console.log("Updated local cart quantity"));
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const removeItem = async (id) => {
    const targetItem = cartItems.find(item => item.id === id);
    if (onRemoveItem) {
      const removed = await onRemoveItem(id);
      if (removed) {
        triggerToast(`Đã xóa "${targetItem?.productName || 'Sản phẩm'}" khỏi giỏ hàng!`, 'success');
      }
      return;
    } else {
      const updated = localCartItems.filter(item => item.id !== id);
      setLocalCartItems(updated);
      if (onCartCountChange) onCartCountChange(updated.length);
      api.delete(`/cart/items/${id}`).catch(() => console.log("Removed from local cart"));
    }
    triggerToast(`Đã xóa "${targetItem?.productName || 'Sản phẩm'}" khỏi giỏ hàng!`, 'success');
  };

  const subtotal = calculateCheckoutSubtotal(cartItems);

  return (
    <main className="pt-32 pb-section-gap max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
      {/* Cart Title */}
      <div className="mb-12">
        <h1 className="font-headline-md text-headline-md mb-2">Giỏ Hàng Của Bạn</h1>
        <p className="font-label-caps text-label-caps text-on-surface-variant">
          CÓ {cartItems.length} SẢN PHẨM TRONG GIỎ HÀNG
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter items-start">
        {/* Item List */}
        <div className="lg:col-span-8 space-y-12">
          {cartItems.length === 0 ? (
            <div className="text-center py-16 bg-surface-container border border-outline-variant rounded">
              <span className="material-symbols-outlined text-4xl text-on-surface-variant mb-4">shopping_bag</span>
              <h3 className="font-headline-sm text-headline-sm mb-2">Giỏ hàng của bạn đang trống</h3>
              <p className="font-body-md text-on-surface-variant mb-6">Khám phá ngay các bộ sưu tập thời trang cao cấp DuoStyle.</p>
              <button 
                onClick={() => onNavigate && onNavigate('collections')}
                className="bg-primary text-white font-label-caps text-label-caps px-8 py-4 transition-all hover:bg-secondary cursor-pointer"
              >
                Bắt Đầu Mua Sắm
              </button>
            </div>
          ) : (
            cartItems.map((item) => (
              <div key={item.id} className="flex gap-8 border-b border-outline-variant pb-8 group item-transition">
                <div className="w-36 md:w-48 aspect-[4/5] bg-surface-container overflow-hidden flex-shrink-0 rounded">
                  <img 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                    src={item.image} 
                    alt={item.productName} 
                  />
                </div>

                <div className="flex-1 flex flex-col justify-between py-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-headline-sm text-headline-sm mb-1 uppercase tracking-tight">
                        {item.productName}
                      </h3>
                      <p className="font-label-caps text-label-caps text-on-surface-variant">
                        {item.variantDetails}
                      </p>
                    </div>
                    <span className="font-body-lg text-body-lg font-bold">
                      {formatVND(item.price * item.quantity)}
                    </span>
                  </div>

                  <div className="flex justify-between items-end">
                    {/* Quantity Selector */}
                    <div className="flex items-center gap-2 border border-primary px-3 py-2 rounded">
                      <button 
                        onClick={() => updateQuantity(item.id, -1)}
                        className="hover:text-secondary transition-colors cursor-pointer border-none bg-transparent"
                      >
                        <span className="material-symbols-outlined">remove</span>
                      </button>
                      <span className="font-label-caps text-label-caps px-3 font-bold">
                        {String(item.quantity).padStart(2, '0')}
                      </span>
                      <button 
                        onClick={() => updateQuantity(item.id, 1)}
                        className="hover:text-secondary transition-colors cursor-pointer border-none bg-transparent"
                      >
                        <span className="material-symbols-outlined">add</span>
                      </button>
                    </div>

                    <button 
                      onClick={() => removeItem(item.id)}
                      className="font-label-caps text-label-caps text-on-surface-variant hover:text-error underline underline-offset-4 transition-colors cursor-pointer border-none bg-transparent"
                    >
                      XÓA
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}

        </div>

        {/* Summary Sidebar */}
        <aside className="lg:col-span-4 bg-surface-container-low p-8 sticky top-32 border border-outline-variant/30 rounded">
          <h2 className="font-label-caps text-label-caps mb-8 border-b border-outline-variant pb-4 font-bold">
            TỔNG QUAN ĐƠN HÀNG
          </h2>

          <div className="space-y-6 mb-8">
            <div className="flex justify-between">
              <span className="font-body-md text-body-md text-on-surface-variant">Tạm Tính</span>
              <span className="font-body-md text-body-md font-medium">
                {formatVND(subtotal)}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="font-body-md text-body-md text-on-surface-variant">Phí Vận Chuyển</span>
              <span className="font-body-md text-body-md font-medium text-emerald-600">Miễn Phí</span>
            </div>

            <div className="flex justify-between pt-6 border-t border-outline-variant">
              <span className="font-label-caps text-label-caps font-bold">TỔNG THÀNH TIỀN</span>
              <span className="font-headline-sm text-headline-sm font-bold text-primary">
                {formatVND(subtotal)}
              </span>
            </div>
          </div>

          <div className="space-y-4">
            <button 
              onClick={() => {
                if (cartItems.length === 0) return;
                onCheckout?.({ source: 'CART', items: cartItems });
              }}
              disabled={cartItems.length === 0}
              className="w-full bg-primary text-on-primary py-5 font-label-caps text-label-caps tracking-widest hover:bg-secondary transition-all duration-500 uppercase cursor-pointer disabled:opacity-50 font-bold rounded"
            >
              Tiến Hành Thanh Toán
            </button>
            <p className="text-center font-label-caps text-[10px] text-on-surface-variant tracking-wider uppercase">
              THANH TOÁN AN TOÀN QUA DUOSTYLE PAY & VNPAY
            </p>
          </div>
        </aside>
      </div>

      {/* Suggestions Section */}
      <section className="mt-section-gap">
        <div className="flex justify-between items-end mb-12">
          <h2 className="font-headline-md text-headline-md italic">Gợi Ý Phối Đồ</h2>
          <button 
            onClick={() => onNavigate && onNavigate('collections')}
            className="font-label-caps text-label-caps underline underline-offset-8 hover:text-secondary transition-colors cursor-pointer border-none bg-transparent font-bold"
          >
            XEM TẤT CẢ
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-gutter">
          {SUGGESTIONS.map((sug) => (
            <div key={sug.id} className="group cursor-pointer">
              <div className="aspect-[4/5] bg-surface-container overflow-hidden mb-4 relative rounded">
                <img 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                  src={sug.image} 
                  alt={sug.name} 
                />
                <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/5 transition-colors duration-500 flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <button 
                    onClick={() => onNavigate?.('product-detail', '', sug.id)}
                    className="bg-white text-black px-6 py-3 font-label-caps text-label-caps shadow-xl translate-y-4 group-hover:translate-y-0 transition-transform duration-500 cursor-pointer font-bold rounded"
                  >
                    XEM SẢN PHẨM
                  </button>
                </div>
              </div>
              <div className="text-center">
                <h4 className="font-label-caps text-label-caps mb-1">{sug.name}</h4>
                <p className="font-body-md text-body-md font-bold text-primary">{formatVND(sug.price)}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
